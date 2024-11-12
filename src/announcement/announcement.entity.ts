import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum AnnounceType {
    Notice = 0,
    Policy = 1,
    Announcement = 2
}

@Entity('announcements')
export class Announcement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'enum', enum: AnnounceType, default: AnnounceType.Notice })
    type: AnnounceType;

    @Column({ type: 'boolean', default: false })
    is_top: boolean;

    @CreateDateColumn()
    create_date: Date;

    @Column({ type: 'datetime' })
    expire_date: Date;
};