import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "src/users/users.module";
import { AuthService } from "./auth.service";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'medical_secret',
            signOptions: { expiresIn: '3d' },
        }),
        forwardRef(() => UsersModule)
    ],
    providers: [AuthService],
    exports: [AuthService, JwtModule]
})
export class AuthModule { }