import { AppointmentStatus } from "../appointment.entity";

export class UpdateAppointmentDto {
    status: AppointmentStatus;
    reject_reason: string;
}