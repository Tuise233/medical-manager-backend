import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Appointment } from '../appointments/appointment.entity';
import { Medication } from '../medication/medication.entity';
import { Prescription } from '../prescription/prescription.entity';
import { MedicalRecord } from '../medical-record/medical-record.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Appointment,
            Medication,
            Prescription,
            MedicalRecord
        ])
    ],
    controllers: [DashboardController],
    providers: [DashboardService]
})
export class DashboardModule { } 