import { UserRole } from "src/users/user.entity";

import { UserStatus } from "src/users/user.entity";

export class UpdateUserDto {
    username?: string;
    password?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
} 