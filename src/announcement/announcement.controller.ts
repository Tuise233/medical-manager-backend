import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AnnouncementService } from "./announcement.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateAnnounceDto } from "./dto/create-announce.dto";
import { Request } from "express";
import { UserRole } from "src/users/user.entity";
import { PageDto } from "src/common/dto/page.dto";
import { SearchAnnounceDto } from "./dto/search-announce.dto";

@UseGuards(JwtAuthGuard)
@Controller('announcement')
export class AnnouncementController {
    constructor(private readonly announceService: AnnouncementService) { }

    @Get('valid')
    async getValid(@Query() pageDto: SearchAnnounceDto) {
        return await this.announceService.getValidAnnouncePage(pageDto);
    }

    @Post('new')
    async create(@Body() createDto: CreateAnnounceDto, @Req() request: Request) {
        const userRole: UserRole = request['user']['role'];
        return await this.announceService.createAnnounce(createDto, userRole);
    }
}