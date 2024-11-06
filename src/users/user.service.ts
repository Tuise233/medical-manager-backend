import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dto/create-user.dto";
import * as crypto from 'crypto';
import { LoginUserDto } from "./dto/login-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { BasicInfo, HealthInfo } from "src/info/info.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BasicInfo)
        private basicRepository: Repository<BasicInfo>,
        @InjectRepository(HealthInfo)
        private healthRepository: Repository<HealthInfo>,
        private jwtService: JwtService,
    ) { }

    private stringToMd5(text: string) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    async register(userDto: CreateUserDto): Promise<User> {
        if (!userDto) return;
        const { username, password, phone } = userDto;
        const target = await this.userRepository.findOne({ where: { username } });
        if (target) {
            return null;
        }

        const user = this.userRepository.create({
            username,
            password: this.stringToMd5(password),
            phone
        });
        const basicInfo = this.basicRepository.create();
        basicInfo.user = user;
        const healthInfo = this.healthRepository.create();
        healthInfo.user = user;

        await this.userRepository.save(user);
        await this.basicRepository.save(basicInfo);
        await this.healthRepository.save(healthInfo);

        return user;
    }

    async login(userDto: LoginUserDto): Promise<{ access_token: string }> {
        if (!userDto) return;
        const { username, password } = userDto;
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user || user.password !== this.stringToMd5(password)) {
            return null;
        }
        const payload = { username: user.username, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }

    async updateUser(id: number, userDto: UpdateUserDto, isAdmin: boolean): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if(!user) {
            throw new NotFoundException('未找到修改的用户');
        }

        if(userDto.role && !isAdmin) {
            throw new ForbiddenException('你没有足够的权限');
        }

        Object.assign(user, userDto);
        return await this.userRepository.save(user);
    }
}