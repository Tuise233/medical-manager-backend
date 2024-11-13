import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogModule } from "src/log/log.module";
import { MedicationService } from "./medication.service";
import { MedicationController } from "./medication.controller";
import { Medication } from "./medication.entity";
import { LogService } from "src/log/log.service";
import { Log } from "src/log/log.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Medication, Log]),
        LogModule
    ],
    controllers: [MedicationController],
    providers: [MedicationService, LogService],
    exports: [MedicationService]
})
export class MedicationModule {}