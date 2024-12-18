export class CreateAppointmentDto {
    doctor_id: number;
    description: string;
    date_time: Date;
    duration: number = 30;
}