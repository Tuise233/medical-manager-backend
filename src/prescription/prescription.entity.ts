import { MedicalRecord } from "src/medical-record/medical-record.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Entity } from "typeorm";

export enum PrescriptionType {
    Medication = 0,  // 用药医嘱
    Examination = 1, // 检查医嘱
    Other = 2       // 其他医嘱
}

export enum PrescriptionStatus {
    Pending = 0,    // 未执行
    Processing = 1, // 执行中
    Completed = 2,  // 已完成
    Cancelled = 3   // 已取消
}

@Entity('prescriptions')
export class Prescription {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    record_id: number;

    @Column()
    patient_id: number;

    @Column()
    doctor_id: number;

    @Column({ type: 'enum', enum: PrescriptionType, default: PrescriptionType.Medication })
    type: PrescriptionType;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    frequency: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    dosage: string;

    @Column({ type: 'int', nullable: true })
    duration: number;

    @Column({ type: 'text', nullable: true })
    note: string;

    @Column({ type: 'enum', enum: PrescriptionStatus, default: PrescriptionStatus.Pending })
    status: PrescriptionStatus;

    @CreateDateColumn()
    create_date: Date;

    @UpdateDateColumn()
    update_date: Date;

    @ManyToOne(() => MedicalRecord, record => record.prescriptions)
    @JoinColumn({ name: 'record_id' })
    record: MedicalRecord;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'patient_id' })
    patient: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'doctor_id' })
    doctor: User;
}