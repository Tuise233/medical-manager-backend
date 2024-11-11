import { Body, Controller, Get, Post, Delete, Param, Req, UseGuards } from "@nestjs/common";
import { RouterService } from "./router.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Request } from "express";
import { BaseResponse } from "src/common/response";
import { UpdateRouterDto } from "./dto/update-router.dto";
import { CreateRouterDto } from "./dto/create-router.dto";

@UseGuards(JwtAuthGuard)
@Controller('router')
export class RouterController {
    constructor(private readonly routerService: RouterService) {}

    @Get()
    async getUserRouters(@Req() req: Request) {
        const user = req['user'] as { role: number };
        return await this.routerService.getRoutersByRole(user.role);
    }

    @Get('all')
    async getAll(@Req() req: Request) {
        return await this.routerService.getAll(req);
    }

    @Post('save')
    async saveAll(@Body() routerDto: UpdateRouterDto, @Req() req: Request) {
        return await this.routerService.saveAll(routerDto.data, req);
    }

    @Post('create')
    async create(@Body() createDto: CreateRouterDto, @Req() req: Request) {
        return await this.routerService.create(createDto, req);
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Req() req: Request) {
        return await this.routerService.delete(id, req);
    }
}