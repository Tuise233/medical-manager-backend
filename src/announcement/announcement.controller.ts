import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AnnouncementService } from "./announcement.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateAnnounceDto } from "./dto/create-announce.dto";
import { Request } from "express";
import { UserRole } from "src/users/user.entity";
import { PageDto } from "src/common/dto/page.dto";
import { SearchAnnounceDto } from "./dto/search-announce.dto";
import { UpdateAnnounceDto } from "./dto/update-announce.dto";

@UseGuards(JwtAuthGuard)
@Controller('announcement')
export class AnnouncementController {
    constructor(private readonly announceService: AnnouncementService) { }

    @Get('valid')
    async getValid(@Query() pageDto: SearchAnnounceDto, @Req() request: Request) {
        const userRole: UserRole = request['user']['role'];
        return await this.announceService.getValidAnnouncePage(pageDto, userRole);
    }

    @Post('new')
    async create(@Body() createDto: CreateAnnounceDto, @Req() request: Request) {
        const userRole: UserRole = request['user']['role'];
        return await this.announceService.createAnnounce(createDto, userRole);
    }

    @Post('update/:id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateAnnounceDto, @Req() request: Request) {
        const userRole: UserRole = request['user']['role'];
        return await this.announceService.updateAnnounce(id, updateDto, userRole);
    }

    @Post('delete/:id')
    async delete(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
        const userRole: UserRole = request['user']['role'];
        return await this.announceService.deleteAnnounce(id, userRole);
    }
}