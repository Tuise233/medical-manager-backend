import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BasicInfo, HealthInfo } from "./info.entity";
import { AuthModule } from "src/auth/auth.module";
import { InfoController } from "./info.controller";
import { InfoService } from "./info.service";
import { User } from "src/users/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([BasicInfo, HealthInfo, User]),
        AuthModule
    ],
    controllers: [InfoController],
    providers: [InfoService],
    exports: [InfoService]
})
export class InfoModule { }