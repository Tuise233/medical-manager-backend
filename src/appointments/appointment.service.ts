import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Appointment, AppointmentStatus } from "./appointment.entity";
import { Repository } from "typeorm";
import { LogService } from "src/log/log.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { BaseResponse, PageResponse } from "src/common/response";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { User, UserRole } from "src/users/user.entity";
import { SearchAppointmentDto } from "./dto/search-appointment.dto";

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(Appointment)
        private appRepository: Repository<Appointment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private logService: LogService
    ) { }

    async createAppointment(dto: CreateAppointmentDto, userId: number) {
        const doctor = await this.userRepository.findOne({
            where: {
                id: dto.doctor_id,
                role: UserRole.Doctor
            }
        });

        if (!doctor) {
            return BaseResponse.error('未找到指定的医生');
        }

        const appointmentDate = new Date(dto.date_time);
        const now = new Date();
        if(appointmentDate < now) {
            return BaseResponse.error('预约时间不能小于当前时间');
        }

        const existingAppointment = await this.appRepository.findOne({
            where: {
                doctor: { id: dto.doctor_id },
                date_time: dto.date_time,
                status: AppointmentStatus.Accepted
            }
        });

        if (existingAppointment) {
            return BaseResponse.error('该时间段医生已有预约');
        }

        const appointment = this.appRepository.create({
            patient: { id: userId },
            doctor: { id: dto.doctor_id },
            description: dto.description,
            date_time: dto.date_time,
            duration: dto.duration,
            status: AppointmentStatus.Pending,
        });

        await this.appRepository.save(appointment);
        await this.logService.createLog(
            userId,
            `创建预约 #${appointment.id} | 医生ID: ${dto.doctor_id} | 时间: ${dto.date_time}`
        );
        return BaseResponse.success(appointment);
    }

    async updateAppointment(id: number, dto: UpdateAppointmentDto, userId: number, role: UserRole) {
        const appointment = await this.appRepository.findOne({
            where: { id },
            relations: ['patient', 'doctor']
        });

        if (!appointment) {
            return BaseResponse.error('预约不存在');
        }

        if (role !== UserRole.Admin && appointment.doctor.id !== userId) {
            return BaseResponse.error('没有权限修改此预约');
        }

        const statusText = {
            [AppointmentStatus.Pending]: '待处理',
            [AppointmentStatus.Accepted]: '已接受',
            [AppointmentStatus.Rejected]: '已拒绝',
            [AppointmentStatus.Cancelled]: '已取消',
            [AppointmentStatus.Completed]: '已完成'
        };

        const changes: string[] = [];
        if (appointment.status !== dto.status) {
            changes.push(`状态从 "${statusText[appointment.status]}" 改为 "${statusText[dto.status]}"`);
        }

        if (dto.reject_reason && dto.status === AppointmentStatus.Rejected) {
            changes.push(`拒绝原因: ${dto.reject_reason}`);
        }

        Object.assign(appointment, dto);

        await this.appRepository.save(appointment);
        await this.logService.createLog(
            userId,
            `更新预约 #${appointment.id}:\n${changes.join('\n')}`
        )
        return BaseResponse.success(appointment);
    }

    async getAppointmentList(dto: SearchAppointmentDto, userId: number, role: UserRole) {
        const pageNum = Number(dto.pageNum || 1);
        const pageSize = Number(dto.pageSize || 10);
        const { status, doctor_id, patient_id, start_date, end_date } = dto;

        const queryBuilder = this.appRepository
            .createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.doctor', 'doctor')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .orderBy('appointment.date_time', 'DESC')
            .skip((pageNum - 1) * pageSize)
            .take(pageSize);

        // 根据角色过滤数据
        if (role === UserRole.Doctor) {
            queryBuilder.andWhere('doctor.id = :userId', { userId });
        } else if (role === UserRole.User) {
            queryBuilder.andWhere('patient.id = :userId', { userId });
        }

        if (status !== undefined) {
            queryBuilder.andWhere('appointment.status = :status', { status });
        }

        if (doctor_id) {
            queryBuilder.andWhere('doctor.id = :doctor_id', { doctor_id });
        }

        if (patient_id) {
            queryBuilder.andWhere('patient.id = :patient_id', { patient_id });
        }

        if (start_date) {
            queryBuilder.andWhere('appointment.date_time >= :start_date', { start_date });
        }

        if (end_date) {
            queryBuilder.andWhere('appointment.date_time <= :end_date', { end_date });
        }

        const [appointments, total] = await queryBuilder.getManyAndCount();

        return PageResponse.success(total, pageNum, pageSize, appointments);
    }
}
