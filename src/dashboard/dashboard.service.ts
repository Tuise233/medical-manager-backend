import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/appointment.entity';
import { Medication, MedicationCategory, MedicationStatus } from '../medication/medication.entity';
import { Prescription, PrescriptionType } from '../prescription/prescription.entity';
import { BaseResponse } from '../common/response';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepo: Repository<Appointment>,
        @InjectRepository(Medication)
        private readonly medicationRepo: Repository<Medication>,
        @InjectRepository(Prescription)
        private readonly prescriptionRepo: Repository<Prescription>
    ) { }

    async getCardData() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const [todayAppointments, yesterdayAppointments, totalMedicines, availableMedicines, lowStockMedicines] = 
        await Promise.all([
            // 今日预约
            this.appointmentRepo.count({
                where: {
                    date_time: today
                }
            }),
            // 昨日预约
            this.appointmentRepo.count({
                where: {
                    date_time: yesterday
                }
            }),
            // 药品总数
            this.medicationRepo.count(),
            // 可用药品
            this.medicationRepo.count({
                where: {
                    status: MedicationStatus.Enable
                }
            }),
            // 库存预警
            this.medicationRepo.count({
                where: {
                    status: MedicationStatus.Enable,
                    amount: 10
                }
            })
        ]);

        return BaseResponse.success({
            todayAppointments,
            appointmentGrowth: yesterdayAppointments ? 
                ((todayAppointments - yesterdayAppointments) / yesterdayAppointments * 100).toFixed(2) : 0,
            totalMedicines,
            availableMedicines,
            lowStockMedicines
        });
    }

    async getMedicineStock() {
        const categories = ['处方药', '非处方药', '中药', '保健品'];
        const stocks = await this.medicationRepo
            .createQueryBuilder('med')
            .select('med.category', 'category')
            .addSelect('COUNT(*)', 'count')
            .addSelect('SUM(med.amount)', 'amount')
            .groupBy('med.category')
            .getRawMany();

        const amounts = categories.map((_cat, index) => 
            stocks.find(s => s.category === index)?.amount || 0
        );

        const counts = categories.map((_cat, index) => 
            stocks.find(s => s.category === index)?.count || 0
        );

        return BaseResponse.success({
            categories,
            amounts,
            counts
        });
    }

    async getVisitTrend() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const appointments = new Array(24).fill(0);
        const visits = new Array(24).fill(0);

        // 获取今日预约数据
        const todayAppointments = await this.appointmentRepo.find({
            where: {
                date_time: today
            }
        });

        // 获取今日就诊数据
        const todayVisits = await this.appointmentRepo.find({
            where: {
                date_time: today,
                status: AppointmentStatus.Completed
            }
        });

        // 按小时统计
        todayAppointments.forEach(appointment => {
            const hour = new Date(appointment.date_time).getHours();
            appointments[hour]++;
        });

        todayVisits.forEach(visit => {
            const hour = new Date(visit.date_time).getHours();
            visits[hour]++;
        });

        return BaseResponse.success({
            hours,
            appointments,
            visits
        });
    }

    async getDepartmentVisits() {
        const types = ['用药医嘱', '检查医嘱', '其他医嘱'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const prescriptions = await this.prescriptionRepo
            .createQueryBuilder('prescription')
            .select('prescription.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('DATE(prescription.create_date) = DATE(:today)', { today })
            .groupBy('prescription.type')
            .getRawMany();

        const data = types.map((name, index) => ({
            name,
            value: parseInt(prescriptions.find(p => p.type === index)?.count || '0')
        }));

        return BaseResponse.success({ data });
    }
} 