import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AnnouncementService } from "./announcement.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { CreateAnnounceDto } from "./dto/create-announce.dto";
import { Request } from "express";
import { SearchAnnounceDto } from "./dto/search-announce.dto";
import { UpdateAnnounceDto } from "./dto/update-announce.dto";

@UseGuards(JwtAuthGuard)
@Controller('announcement')
export class AnnouncementController {
    constructor(private readonly announceService: AnnouncementService) { }

    @Get('valid')
    async getValid(@Query() pageDto: SearchAnnounceDto, @Req() request: Request) {
        return await this.announceService.getValidAnnouncePage(pageDto, request);
    }

    @Post('new')
    async create(@Body() createDto: CreateAnnounceDto, @Req() request: Request) {
        return await this.announceService.createAnnounce(createDto, request);
    }

    @Post('update/:id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateAnnounceDto, @Req() request: Request) {
        return await this.announceService.updateAnnounce(id, updateDto, request);
    }

    @Post('delete/:id')
    async delete(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
        return await this.announceService.deleteAnnounce(id, request);
    }
}