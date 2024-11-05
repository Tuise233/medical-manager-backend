import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { Response } from "src/common/response";
import { LoginUserDto } from "./dto/login-user.dto";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    async register(@Body() userDto: CreateUserDto) {
        const user = await this.userService.register(userDto); 
        if(!user) return Response.error('用户名已注册');
        return Response.success(user, '注册成功');
    }

    @Post('login')
    async login(@Body() userDto: LoginUserDto) {
        const token = await this.userService.login(userDto);
        if(!token) return Response.error('用户名或密码错误'); 
        return Response.success(token, '登录成功');
    }
}