import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AnnouncementService } from "./announcement.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateAnnounceDto } from "./dto/create-announce.dto";
import { Request } from "express";
import { UserRole } from "src/users/user.entity";

@UseGuards(JwtAuthGuard)
@Controller('announcement')
export class AnnouncementController {
    constructor(private readonly announceService: AnnouncementService) { }

    @Get()
    async getAll() {
        return await this.announceService.getValidAnnounce();
    }

    @Post('new')
    async create(@Body() createDto: CreateAnnounceDto, @Req() request: Request) {
        const userRole: UserRole = request['user']['role'];
        return await this.announceService.createAnnounce(createDto, userRole);
    }
}