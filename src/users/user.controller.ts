import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards, Query, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { BaseResponse } from "src/common/response";
import { LoginUserDto } from "./dto/login-user.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Request } from "express";
import { UserRole } from "./user.entity";
import { SearchPatientDto } from "./dto/search-patient.dto";
import { UpdateHealthInfoDto } from "./dto/update-health.dto";
import { UpdateBasicInfoDto } from "./dto/update-basic.dto";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    async register(@Body() userDto: CreateUserDto) {
        return await this.userService.register(userDto);
    }

    @Post('login')
    async login(@Body() userDto: LoginUserDto) {
        return await this.userService.login(userDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('update/:id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() userDto: UpdateUserDto,
        @Req() req: Request
    ) {
        const userRole = req['user']['role'];
        return await this.userService.updateUser(id, userDto, userRole === UserRole.Admin);
    }

    @Get('doctors')
    async getDoctorList() {
        return await this.userService.getDoctorList();
    }

    @UseGuards(JwtAuthGuard)
    @Get('patient/:id')
    async getPatientInfo(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request
    ) {
        const userRole = req['user']['role'];
        const userId = req['user']['userId'];

        if (userRole !== UserRole.Admin && userRole !== UserRole.Doctor && userId !== id) {
            return BaseResponse.error('没有权限查看该患者信息');
        }

        return await this.userService.getPatientInfo(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('patients')
    async getPatientList(
        @Query() searchDto: SearchPatientDto,
        @Req() req: Request
    ) {
        const userRole = req['user']['role'];

        if (userRole !== UserRole.Admin && userRole !== UserRole.Doctor) {
            return BaseResponse.error('没有权限查看患者列表');
        }

        return await this.userService.getPatientList(searchDto);
    }

    @UseGuards(JwtAuthGuard)
    @Put('patient/:id/health')
    async updatePatientHealthInfo(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateHealthInfoDto,
        @Req() req: Request
    ) {
        const userRole = req['user']['role'];
        const userId = req['user']['userId'];

        if (userRole !== UserRole.Admin && userRole !== UserRole.Doctor && userId !== id) {
            return BaseResponse.error('没有权限更新该患者的健康信息');
        }

        return await this.userService.updatePatientHealthInfo(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Put('patient/:id/basic')
    async updatePatientBasicInfo(
        @Param('id', ParseIntPipe) id: number,
        @Body() data: UpdateBasicInfoDto,
        @Req() req: Request
    ) {
        const userRole = req['user']['role'];
        const userId = req['user']['userId'];

        if (userRole !== UserRole.Admin && userRole !== UserRole.Doctor && userId !== id) {
            return BaseResponse.error('没有权限更新该患者的基本信息');
        }

        return await this.userService.updatePatientBasicInfo(id, data);
    }
}