import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "src/users/user.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: 'medical_secret',
            signOptions: { expiresIn: '3d' },
        }),
        forwardRef(() => UsersModule)
    ],
    providers: [AuthService, JwtStrategy, JwtAuthGuard],
    exports: [AuthService, JwtModule, JwtAuthGuard]
})
export class AuthModule { }