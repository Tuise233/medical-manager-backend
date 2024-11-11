import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Log } from "./log.entity";
import { LogController } from "./log.controller";
import { LogService } from "./log.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Log]),
        AuthModule
    ],
    controllers: [LogController],
    providers: [LogService],
    exports: [LogService]
})
export class LogModule {} 