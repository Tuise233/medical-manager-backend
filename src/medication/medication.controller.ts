import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { MedicationService } from "./medication.service";
import { Request } from "express";
import { CreateMedicationDto, SearchMedicationDto, UpdateMedicationDto } from "./medication.dto";

@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationController {
    constructor(private readonly medicationService: MedicationService) {}

    @Get()
    async getMedicationList(@Query() searchDto: SearchMedicationDto, @Req() request: Request) {
        return this.medicationService.getMedicationList(searchDto, request);
    }

    @Post()
    async createMedication(@Body() createDto: CreateMedicationDto, @Req() request: Request) {
        return this.medicationService.createMedication(createDto, request);
    }

    @Put(':id')
    async updateMedication(@Param('id') id: number, @Body() updateDto: UpdateMedicationDto, @Req() request: Request) {
        return this.medicationService.updateMedication(id, updateDto, request);
    }

    @Delete(':id')
    async deleteMedication(@Param('id') id: number, @Req() request: Request) {
        return this.medicationService.deleteMedication(id, request);
    }
}

