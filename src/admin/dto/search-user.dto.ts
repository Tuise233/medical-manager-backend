import { PageDto } from "src/common/dto/page.dto";
import { UserRole, UserStatus } from "src/users/user.entity";

export class SearchUserDto extends PageDto {
    searchValue?: string;     // 搜索关键词(用户名/手机号)
    role?: UserRole;          // 用户角色
    status?: UserStatus;      // 用户状态
    startDate?: Date;         // 注册开始时间
    endDate?: Date;          // 注册结束时间
}