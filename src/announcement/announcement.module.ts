import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Announcement } from "./announcement.entity";
import { AuthModule } from "src/auth/auth.module";
import { AnnouncementController } from "./announcement.controller";
import { AnnouncementService } from "./announcement.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Announcement]),
        AuthModule
    ],
    controllers: [AnnouncementController],
    providers: [AnnouncementService],
    exports: [AnnouncementService]
})
export class AnnouncementModule { }