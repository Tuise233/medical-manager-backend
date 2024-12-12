import { UserRole } from "src/users/user.entity";

import { UserStatus } from "src/users/user.entity";

export class UpdateUserDto {
    username?: string;
    real_name?: string;
    password?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
} 