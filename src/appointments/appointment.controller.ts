import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards, ParseIntPipe, Delete } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { SearchAppointmentDto } from "./dto/search-appointment.dto";
import { UpdateRecordDto } from "./dto/update-record.dto";

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    @Post()
    async createAppointment(@Body() dto: CreateAppointmentDto, @Req() request) {
        const userId = request['user']['userId'];
        return await this.appointmentService.createAppointment(dto, userId);
    }

    @Put(':id')
    async updateAppointment(@Param('id') id: number, @Body() dto: UpdateAppointmentDto, @Req() request: Request) {
        const userId = request['user']['userId'];
        const role = request['user']['role'];
        return await this.appointmentService.updateAppointment(id, dto, userId, role);
    }

    @Get()
    async getAppointmentList(@Query() dto: SearchAppointmentDto, @Req() request: Request) {
        const userId = request['user']['userId'];
        const role = request['user']['role'];
        return await this.appointmentService.getAppointmentList(dto, userId, role);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/record')
    async getAppointmentRecord(
        @Param('id', ParseIntPipe) id: number,
        @Req() request: Request
    ) {
        const userId = request['user']['userId'];
        const role = request['user']['role'];
        return await this.appointmentService.getAppointmentRecord(id, userId, role);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/record')
    async updateAppointmentRecord(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateRecordDto,
        @Req() request: Request
    ) {
        const userId = request['user']['userId'];
        const role = request['user']['role'];
        return await this.appointmentService.updateAppointmentRecord(id, data, userId, role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/prescriptions/:prescriptionId')
    async deletePrescription(
        @Param('id', ParseIntPipe) id: number,
        @Param('prescriptionId', ParseIntPipe) prescriptionId: number,
        @Req() request: Request
    ) {
        const userId = request['user']['userId'];
        const role = request['user']['role'];
        return await this.appointmentService.deletePrescription(id, prescriptionId, userId, role);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/cancel')
    async cancelAppointment(
        @Param('id', ParseIntPipe) id: number,
        @Req() request: Request
    ) {
        const userId = request['user']['userId'];
        const role = request['user']['role'];
        return await this.appointmentService.cancelAppointment(id, userId, role);
    }
}
