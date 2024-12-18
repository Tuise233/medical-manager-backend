import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum AppointmentStatus {
    Pending = 0, // 待处理
    Accepted = 1, // 已接受
    Rejected = 2, // 已拒绝
    Cancelled = 3, // 已取消
    Completed = 4, // 已完成
};

@Entity('appointment')
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'patient_id' })
    patient: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'doctor_id'})
    doctor: User;

    @Column({ type: 'text'})
    description: string;
    
    @Column({ type: 'datetime'})
    date_time: Date;

    @Column({ type: 'int', default: 30})
    duration: number;

    @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.Pending})
    status: AppointmentStatus;

    @Column({ type: 'text', nullable: true})
    reject_reason: string;

    @CreateDateColumn()
    create_date: Date;

    @UpdateDateColumn()
    update_date: Date;
}