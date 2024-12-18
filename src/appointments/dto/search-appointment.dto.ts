import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from "../appointment.entity";

export class SearchAppointmentDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value) || 1)
    @IsNumber()
    pageNum?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value) || 10)
    @IsNumber()
    pageSize?: number = 10;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    doctor_id?: number;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    patient_id?: number;

    @IsOptional()
    start_date?: Date;

    @IsOptional()
    end_date?: Date;
}