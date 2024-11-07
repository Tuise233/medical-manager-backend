import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { RouterService } from "./router.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { Request } from "express";
import { BaseResponse } from "src/common/response";

@Controller('router')
export class RouterController {
    constructor(private readonly routerService: RouterService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getUserRouters(@Req() req: Request) {
        const user = req['user'] as { role: number };
        return await this.routerService.getRoutersByRole(user.role);
    }
}