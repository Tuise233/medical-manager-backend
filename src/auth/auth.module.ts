import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "src/users/users.module";
import { AuthService } from "./auth.service";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: 'medical_secret',
            signOptions: { expiresIn: '3d' },
        }),
    ],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule { }