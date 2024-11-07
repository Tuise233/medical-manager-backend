import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('announcements')
export class Announcement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @CreateDateColumn()
    create_date: Date;

    @Column({ type: 'datetime' })
    expire_date: Date;
};