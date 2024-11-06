import { AlcoholConsumption, BloodType } from "../info.entity";

export class UpdateBasicInfoDto {
    address: string;
    birth_date: Date;
    gender: number;
    emergency_contact: string;
    emergency_contact_phone: string;
}

export class UpdateHealthInfoDto {
    height: number;
    weight: number;
    blood_type: BloodType;
    blood_pressure: string;
    allergies: string;
    medical_history: string;
    current_medications: string;
    alcohol_consumption: AlcoholConsumption;
    heart_rate: number;
    body_temperature: number;
}