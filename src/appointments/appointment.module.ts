import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "./appointment.entity";
import { LogModule } from "src/log/log.module";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";
import { User } from "src/users/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Appointment, User]),
        LogModule
    ],
    controllers: [AppointmentController],
    providers: [AppointmentService],
    exports: [AppointmentService]
})
export class AppointmentModule {}