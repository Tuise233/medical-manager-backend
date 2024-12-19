import { Appointment } from "src/appointments/appointment.entity";
import { Prescription } from "src/prescription/prescription.entity";
import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity('medical_record')
export class MedicalRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    appointment_id: number;

    @Column()
    patient_id: number;

    @Column()
    doctor_id: number;

    @Column({ type: 'text', nullable: true })
    chief_complaint: string;

    @Column({ type: 'text', nullable: true })
    present_illness: string;

    @Column({ type: 'text', nullable: true })
    past_history: string;

    @Column({ type: 'text', nullable: true })
    physical_exam: string;

    @Column({ type: 'text', nullable: true })
    diagnosis: string;

    @Column({ type: 'text', nullable: true })
    treatment_plan: string;

    @Column({ type: 'text', nullable: true })
    note: string;

    @Column({ type: 'int', default: 0 })
    status: number;

    @CreateDateColumn()
    create_date: Date;

    @UpdateDateColumn()
    update_date: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'patient_id' })
    patient: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'doctor_id' })
    doctor: User;

    @ManyToOne(() => Appointment)
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;

    @OneToMany(() => Prescription, prescription => prescription.record)
    prescriptions: Prescription[];
}