import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Log } from "./log.entity";
import { Repository } from "typeorm";
import { SearchLogDto } from "./dto/search-log.dto";
import { PageResponse } from "src/common/response";

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

    async getLogPage(searchDto: SearchLogDto): Promise<PageResponse<Log>> {
        const { pageNum, pageSize, startDate, endDate, searchValue } = searchDto;
        
        const queryBuilder = this.logRepository.createQueryBuilder('log')
            .orderBy('log.action_date', 'DESC')
            .skip((pageNum - 1) * pageSize)
            .take(pageSize);

        if (startDate) {
            queryBuilder.andWhere('log.action_date >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('log.action_date <= :endDate', { endDate });
        }

        if (searchValue) {
            queryBuilder.andWhere('log.action LIKE :action', { action: `%${searchValue}%` });
        }

        const [data, total] = await queryBuilder.getManyAndCount();
        return PageResponse.success(total, pageNum, pageSize, data);
    }
}