import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('routers')
export class Router {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    index: number;

    @Column({ nullable: true })
    parent_id: number;

    @Column()
    path: string;

    @Column()
    name: string;

    @Column()
    component: string;

    @Column()
    icon: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    is_link: string;

    @Column({ default: false })
    is_hide: boolean;

    @Column({ default: false })
    is_full: boolean;

    @Column({ default: false })
    is_affix: boolean;

    @Column({ default: true })
    is_keep_alive: boolean;

    @Column({
        nullable: true,
        type: 'varchar',
        transformer: {
            to: (value: number[]) => JSON.stringify(value),
            from: (value: string) => (value ? JSON.parse(value) : [])
        }
    })
    role_access: number[];
}