import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Gender {
    Female = 0,
    Male = 1
};

export enum BloodType {
    A = 0,
    B = 1,
    AB = 2,
    O = 3
};

export enum AlcoholConsumption {
    Never = 0,
    Occasional = 1,
    Frequent = 2
};

@Entity('basic_info')
export class BasicInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column({ nullable: true })
    address: string;

    @Column({ type: 'date', nullable: true })
    birth_date: Date;

    @Column({ default: 0 })
    gender: number;

    @Column({ nullable: true })
    emergency_contact: string;

    @Column({ nullable: true })
    emergency_contact_phone: string;

    @OneToOne(() => User, (user) => user.basicInfo)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

@Entity('health_info')
export class HealthInfo {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.healthInfo, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    height: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    weight: number;

    @Column({ type: 'enum', enum: BloodType, nullable: true })
    blood_type: BloodType;

    @Column({ type: 'varchar', length: 7, nullable: true })
    blood_pressure: string;

    @Column({ type: 'text', nullable: true })
    allergies: string;

    @Column({ type: 'text', nullable: true })
    medical_history: string;

    @Column({ type: 'text', nullable: true })
    current_medications: string;

    @Column({ type: 'enum', enum: AlcoholConsumption, default: AlcoholConsumption.Never })
    alcohol_consumption: AlcoholConsumption;

    @Column({ type: 'int', nullable: true })
    heart_rate: number;

    @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
    body_temperature: number;

    @CreateDateColumn()
    create_date: Date;

    @UpdateDateColumn()
    update_date: Date;
}