import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { BasicInfo, HealthInfo } from 'src/info/info.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, BasicInfo, HealthInfo]),
        AuthModule
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UsersModule {}
