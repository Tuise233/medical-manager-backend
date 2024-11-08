import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('logs')
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    user_id: number;

    @Column({type: 'varchar', length: 255})
    action: string;

    @CreateDateColumn()
    action_date: Date;
}