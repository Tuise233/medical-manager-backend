import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum MedicationCategory {
    Unknown = 0,
    Prescription = 1,
    OTC = 2,
    Traditional = 3,
    HealthCare = 4,
};

export enum MedicationStatus {
    Disable = 0,
    Enable = 1,
};

@Entity('medications')
export class Medication {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({ type: 'int', default: 0 })
    price: number;

    @Column({ type: 'int', default: 0 })
    amount: number;

    @Column({ type: 'enum', enum: MedicationCategory, default: MedicationCategory.Unknown })
    category: MedicationCategory;

    @Column({ type: 'enum', enum: MedicationStatus, default: MedicationStatus.Disable })
    status: MedicationStatus;

    @UpdateDateColumn()
    update_date: Date;
};