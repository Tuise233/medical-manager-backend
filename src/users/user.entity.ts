import { BasicInfo, HealthInfo } from "src/info/info.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";

export enum UserRole {
    User = 0,
    Doctor = 1,
    Admin = 2
};

export enum UserStatus {
    Active = 0,
    Banned = 1,
    Pending = 2
};

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 32 })
    username: string;

    @Column({ length: 32, default: '' })
    real_name: string;

    @Column({ length: 32 })
    password: string;

    @Column({ length: 32, default: '' })
    email: string;

    @Column({ length: 11, default: '' })
    phone: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
    role: UserRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.Active })
    status: UserStatus;

    @CreateDateColumn()
    create_date: Date;

    @OneToOne(() => BasicInfo, (basicInfo) => basicInfo.user, { cascade: true })
    @JoinColumn({ name: 'id' })
    basicInfo: BasicInfo;

    @OneToOne(() => HealthInfo, (healthInfo) => healthInfo.user)
    @JoinColumn({ name: 'id' })
    healthInfo: HealthInfo;
}