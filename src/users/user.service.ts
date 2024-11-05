import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dto/create-user.dto";
import * as crypto from 'crypto';
import { LoginUserDto } from "./dto/login-user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    private stringToMd5(text: string) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    async register(userDto: CreateUserDto): Promise<User> {
        const { username, password, phone } = userDto;
        const target = await this.userRepository.findOne({ where: { username } });
        if(target) {
            return null;
        }
        const user = this.userRepository.create({
            username,
            password: this.stringToMd5(password),
            phone
        });
        return await this.userRepository.save(user);
    }

    async login(userDto: LoginUserDto): Promise<{ access_token: string }> {
        const { username, password } = userDto;
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user || user.password !== this.stringToMd5(password)) {
            return null;
        }
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}