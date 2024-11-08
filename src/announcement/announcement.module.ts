import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Announcement } from "./announcement.entity";
import { AuthModule } from "src/auth/auth.module";
import { AnnouncementController } from "./announcement.controller";
import { AnnouncementService } from "./announcement.service";
import { LogService } from "src/log/log.service";
import { Log } from "src/log/log.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Announcement, Log]),
        AuthModule
    ],
    controllers: [AnnouncementController],
    providers: [AnnouncementService, LogService],
    exports: [AnnouncementService]
})
export class AnnouncementModule { }