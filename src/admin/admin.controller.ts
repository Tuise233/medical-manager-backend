import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { SearchUserDto } from './dto/search-user.dto';
import { UserStatus } from 'src/users/user.entity';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    // 获取用户列表
    @Get('users')
    async getUserList(@Query() searchDto: SearchUserDto) {
        return await this.adminService.getUserList(searchDto);
    }

    // 审核用户
    @Post('users/audit/:id')
    async auditUser(
        @Param('id', ParseIntPipe) userId: number,
        @Body('status') status: UserStatus,
        @Body('remark') remark?: string
    ) {
        return await this.adminService.auditUser(userId, status, remark);
    }

    // 创建用户
    @Post('users/create')
    async createUser(
        @Body() createDto: CreateAdminUserDto,
        @Req() request: Request
    ) {
        const adminId = request['user']['userId'];
        return await this.adminService.createUser(createDto, adminId);
    }

    // 更新用户信息
    @Put('users/:id')
    async updateUser(
        @Param('id', ParseIntPipe) userId: number,
        @Body() updateDto: UpdateUserDto,
        @Req() request: Request
    ) {
        const adminId = request['user']['userId'];
        return await this.adminService.updateUser(userId, updateDto, adminId);
    }
}