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
        console.log(userDto)
        const user = await this.userService.register(userDto);
        if (!user) return BaseResponse.error('用户名已注册');
        return BaseResponse.success(user, '注册成功');
    }

    @Post('login')
    async login(@Body() userDto: LoginUserDto) {
        const token = await this.userService.login(userDto);
        if (!token) return BaseResponse.error('用户名或密码错误');
        return BaseResponse.success(token, '登录成功');
    }

    @UseGuards(JwtAuthGuard)
    @Post('update/:id')
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() userDto: UpdateUserDto,
        @Req() req: Request
    ) {
        const userRole = req['user']['role'];
        const result = await this.userService.updateUser(id, userDto, userRole === UserRole.Admin);
        return BaseResponse.success(result);
    }
}