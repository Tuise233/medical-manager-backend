import { Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { BaseResponse } from "src/common/response";
import { LoginUserDto } from "./dto/login-user.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Request } from "express";
import { UserRole } from "./user.entity";

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
}