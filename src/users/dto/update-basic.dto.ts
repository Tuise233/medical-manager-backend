import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';

export class UpdateBasicInfoDto {
    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    birth_date?: Date;

    @IsOptional()
    @IsNumber()
    gender?: number;

    @IsOptional()
    @IsString()
    emergency_contact?: string;

    @IsOptional()
    @IsString()
    emergency_contact_phone?: string;
} 