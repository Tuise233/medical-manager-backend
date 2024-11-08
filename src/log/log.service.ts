import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from "./log.entity";
import { Repository } from "typeorm";

@Injectable()
export class LogService {
    constructor(
        @InjectRepository(Log)
        private logRepository: Repository<Log>
    ) { }

    async createLog(user_id: number, action: string) {
        const log: Partial<Log> = {
            user_id,
            action
        };
        await this.logRepository.create(log);
        await this.logRepository.save(log);
    }
}