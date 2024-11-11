import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { LogService } from "./log.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { SearchLogDto } from "./dto/search-log.dto";

@UseGuards(JwtAuthGuard)
@Controller('log')
export class LogController {
    constructor(private readonly logService: LogService) {}

    @Get('page')
    async getLogPage(@Query() searchDto: SearchLogDto) {
        return await this.logService.getLogPage(searchDto);
    }
} 