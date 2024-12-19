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
import { MedicalRecord } from "src/medical-record/medical-record.entity";
import { Prescription } from "src/prescription/prescription.entity";
import { UpdateRecordDto } from "./dto/update-record.dto";

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(Appointment)
        private appRepository: Repository<Appointment>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(MedicalRecord)
        private recordRepository: Repository<MedicalRecord>,
        @InjectRepository(Prescription)
        private prescriptionRepository: Repository<Prescription>,
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

        const oldStatus = appointment.status;
        Object.assign(appointment, dto);

        // 如果医生接受预约，创建病历和医嘱记录
        if (dto.status === AppointmentStatus.Accepted && oldStatus === AppointmentStatus.Pending) {
            // 创建病历记录
            const record = this.recordRepository.create({
                appointment_id: appointment.id,
                patient_id: appointment.patient.id,
                doctor_id: appointment.doctor.id,
                chief_complaint: appointment.description, // 使用预约描述作为主诉的初始值
                status: 0
            });
            await this.recordRepository.save(record);
            await this.logService.createLog(
                userId,
                `接受预约 #${appointment.id}，已创建病历`
            );
        }

        await this.appRepository.save(appointment);

        const statusText = {
            [AppointmentStatus.Pending]: '待处理',
            [AppointmentStatus.Accepted]: '已接受',
            [AppointmentStatus.Rejected]: '已拒绝',
            [AppointmentStatus.Cancelled]: '已取消',
            [AppointmentStatus.Completed]: '已完成'
        };

        await this.logService.createLog(
            userId,
            `更新预约 #${appointment.id} 状态: ${statusText[oldStatus]} -> ${statusText[dto.status]}`
        );

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
            .orderBy('appointment.create_date', 'DESC')
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

    async getAppointmentRecord(appointmentId: number, userId: number, role: UserRole) {
        const appointment = await this.appRepository.findOne({
            where: { id: appointmentId },
            relations: ['patient', 'doctor']
        });

        if (!appointment) {
            return BaseResponse.error('预约不存在');
        }

        // 权限检查：只有相关的医生、患者本人和管理员可以查看
        if (role !== UserRole.Admin 
            && appointment.doctor.id !== userId 
            && appointment.patient.id !== userId) {
            return BaseResponse.error('没有权限查看该记录');
        }

        // 获取病历记录
        const record = await this.recordRepository.findOne({
            where: { appointment_id: appointmentId },
            relations: [
                'patient',
                'doctor',
                'prescriptions',
                'prescriptions.doctor'
            ]
        });

        if (!record) {
            return BaseResponse.error('未找到相关病历记录');
        }

        // 格式化返回数据
        const result = {
            // 病历信息
            record: {
                id: record.id,
                chief_complaint: record.chief_complaint,
                present_illness: record.present_illness,
                past_history: record.past_history,
                physical_exam: record.physical_exam,
                diagnosis: record.diagnosis,
                treatment_plan: record.treatment_plan,
                note: record.note,
                status: record.status,
                create_date: record.create_date,
                update_date: record.update_date
            },
            // 医生信息
            doctor: {
                id: record.doctor.id,
                username: record.doctor.username,
                real_name: record.doctor.real_name,
                phone: record.doctor.phone
            },
            // 患者信息
            patient: {
                id: record.patient.id,
                username: record.patient.username,
                real_name: record.patient.real_name,
                phone: record.patient.phone
            },
            // 医嘱列表
            prescriptions: record.prescriptions.map(p => ({
                id: p.id,
                type: p.type,
                description: p.description,
                frequency: p.frequency,
                dosage: p.dosage,
                duration: p.duration,
                note: p.note,
                status: p.status,
                create_date: p.create_date,
                update_date: p.update_date,
                doctor: {
                    id: p.doctor.id,
                    real_name: p.doctor.real_name
                }
            }))
        };

        return BaseResponse.success(result);
    }

    async updateAppointmentRecord(appointmentId: number, data: UpdateRecordDto, userId: number, role: UserRole) {
        const appointment = await this.appRepository.findOne({
            where: { id: appointmentId },
            relations: ['patient', 'doctor']
        });

        if (!appointment) {
            return BaseResponse.error('预约不存在');
        }

        // 只有主治医生可以更新病历
        if (role !== UserRole.Admin && appointment.doctor.id !== userId) {
            return BaseResponse.error('只有主治医生可以更新病历');
        }

        // 获取病历记录
        const record = await this.recordRepository.findOne({
            where: { appointment_id: appointmentId },
            relations: ['prescriptions']
        });

        if (!record) {
            return BaseResponse.error('未找到相关病历记录');
        }

        // 更新病历信息
        Object.assign(record, data.record);
        await this.recordRepository.save(record);

        // 更新医嘱信息
        for (const prescriptionData of data.prescriptions) {
            if (prescriptionData.id) {
                // 更新现有医嘱
                const prescription = await this.prescriptionRepository.findOne({
                    where: { 
                        id: prescriptionData.id,
                        record_id: record.id
                    }
                });

                if (prescription) {
                    Object.assign(prescription, prescriptionData);
                    await this.prescriptionRepository.save(prescription);
                }
            } else {
                // 创建新医嘱
                const newPrescription = this.prescriptionRepository.create({
                    ...prescriptionData,
                    record_id: record.id,
                    patient_id: appointment.patient.id,
                    doctor_id: userId
                });
                await this.prescriptionRepository.save(newPrescription);
            }
        }

        // 记录操作日志
        await this.logService.createLog(
            userId,
            `更新预约 #${appointmentId} 的病历和医嘱记录`
        );

        return BaseResponse.success(null, '更新成功');
    }

    async deletePrescription(appointmentId: number, prescriptionId: number, userId: number, role: UserRole) {
        const appointment = await this.appRepository.findOne({
            where: { id: appointmentId },
            relations: ['doctor']
        });

        if (!appointment) {
            return BaseResponse.error('预约不存在');
        }

        // 只有主治医生可以删除医嘱
        if (role !== UserRole.Admin && appointment.doctor.id !== userId) {
            return BaseResponse.error('只有主治医生可以删除医嘱');
        }

        const prescription = await this.prescriptionRepository.findOne({
            where: { 
                id: prescriptionId,
                record: { appointment_id: appointmentId }
            },
            relations: ['record']
        });

        if (!prescription) {
            return BaseResponse.error('未找到相关医嘱记录');
        }

        await this.prescriptionRepository.remove(prescription);

        // 记录操作日志
        await this.logService.createLog(
            userId,
            `删除预约 #${appointmentId} 的医嘱记录 #${prescriptionId}`
        );

        return BaseResponse.success(null, '删除成功');
    }

    async cancelAppointment(id: number, userId: number, role: UserRole): Promise<BaseResponse<any>> {
        const appointment = await this.appRepository.findOne({
            where: { id },
            relations: ['patient', 'doctor']
        });

        if (!appointment) {
            return BaseResponse.error('预约不存在');
        }

        // 只有患者本人、主治医生或管理员可以取消预约
        if (role !== UserRole.Admin 
            && appointment.doctor.id !== userId 
            && appointment.patient.id !== userId) {
            return BaseResponse.error('没有权限取消该预约');
        }

        // 只能取消待处理或已接受的预约
        if (appointment.status !== AppointmentStatus.Pending 
            && appointment.status !== AppointmentStatus.Accepted) {
            return BaseResponse.error('当前预约状态无法取消');
        }

        // 更新预约状态为已取消
        appointment.status = AppointmentStatus.Cancelled;
        await this.appRepository.save(appointment);

        // 记录操作日志
        const operatorRole = role === UserRole.Admin ? '管理员' : 
                           (userId === appointment.doctor.id ? '医生' : '患者');
        await this.logService.createLog(
            userId,
            `${operatorRole}取消预约 #${id} | 患者: ${appointment.patient.real_name || appointment.patient.username}`
        );

        return BaseResponse.success(null, '预约已取消');
    }
}
