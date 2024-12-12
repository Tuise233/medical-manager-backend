import { UserRole } from "src/users/user.entity";

export class CreateAdminUserDto {
    username: string;
    password: string;
    real_name: string;
    email?: string;
    phone?: string;
    role: UserRole;
} 