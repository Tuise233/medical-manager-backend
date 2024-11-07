import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { InfoService } from "./info.service";
import { BaseResponse } from "src/common/response";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UpdateBasicInfoDto, UpdateHealthInfoDto } from "./dto/update-info.dto";
import { Request } from "express";

@UseGuards(JwtAuthGuard)
@Controller('info')
export class InfoController {
    constructor(private readonly infoService: InfoService) { }

    @Get('basic/:id')
    async basicInfo(@Param('id', ParseIntPipe) id: number) {
        return await this.infoService.getBasicInfoById(id);
    }

    @Get('health/:id')
    async healthInfo(@Param('id', ParseIntPipe) id: number) {
        return await this.infoService.getHealthInfoById(id);
    }

    @Post('basic/:id')
    async updateBasicInfo(@Param('id', ParseIntPipe) id: number, @Body() infoDto: UpdateBasicInfoDto, @Req() request: Request) {
        return await this.infoService.updateBasicInfo(id, infoDto, { user_id: request['user']['userId'], role: request['user']['role'] });
    }

    @Post('health/:id')
    async updateHealthInfo(@Param('id', ParseIntPipe) id: number, @Body() infoDto: UpdateHealthInfoDto, @Req() request: Request) {
        return await this.infoService.updateHealthInfo(id, infoDto, { user_id: request['user']['userId'], role: request['user']['role'] });
    }
}