import { UserRole } from "../user.entity";

export class UpdateUserDto {
    username?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
}