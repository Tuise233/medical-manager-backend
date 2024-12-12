import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from 'src/users/user.entity';
import { SearchUserDto } from './dto/search-user.dto';
import { BaseResponse, PageResponse } from 'src/common/response';
import { LogService } from 'src/log/log.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import * as crypto from 'crypto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly logService: LogService
    ) {}

    async getUserList(searchDto: SearchUserDto): Promise<PageResponse<User>> {
        const { pageNum, pageSize, searchValue, role, status, startDate, endDate } = searchDto;

        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.basicInfo', 'basicInfo')
            .orderBy('user.create_date', 'DESC')
            .skip((pageNum - 1) * pageSize)
            .take(pageSize);

        if (searchValue) {
            queryBuilder.andWhere(
                '(user.username LIKE :search OR user.phone LIKE :search OR user.real_name LIKE :search)',
                { search: `%${searchValue}%` }
            );
        }

        if (role !== undefined) {
            queryBuilder.andWhere('user.role = :role', { role });
        }

        if (status !== undefined) {
            queryBuilder.andWhere('user.status = :status', { status });
        }

        if (startDate) {
            queryBuilder.andWhere('user.create_date >= :startDate', { startDate });
        }

        if (endDate) {
            queryBuilder.andWhere('user.create_date <= :endDate', { endDate });
        }

        const [users, total] = await queryBuilder.getManyAndCount();

        return PageResponse.success(total, pageNum, pageSize, users);
    }

    async auditUser(userId: number, status: UserStatus, remark?: string): Promise<BaseResponse<User>> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return BaseResponse.error('用户不存在');
        }

        user.status = status;
        await this.userRepository.save(user);

        // 记录审核日志
        const statusText = {
            [UserStatus.Active]: '通过',
            [UserStatus.Banned]: '封禁',
            [UserStatus.Pending]: '待审核'
        }[status];
        
        await this.logService.createLog(
            userId,
            `审核用户 ${user.username} (ID: ${user.id}) - ${statusText}${remark ? ` - 备注: ${remark}` : ''}`
        );

        return BaseResponse.success(user);
    }

    private stringToMd5(text: string) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    async createUser(createDto: CreateAdminUserDto, adminId: number): Promise<BaseResponse<User>> {
        // 检查用户名是否已存在
        const existingUser = await this.userRepository.findOne({ 
            where: { username: createDto.username } 
        });
        
        if (existingUser) {
            return BaseResponse.error('用户名已被注册');
        }

        // 创建新用户
        const user = this.userRepository.create({
            ...createDto,
            password: this.stringToMd5(createDto.password),
            status: UserStatus.Active  // 管理员创建的用户默认为激活状态
        });

        await this.userRepository.save(user);

        // 记录日志
        const roleText = {
            [UserRole.User]: '普通用户',
            [UserRole.Doctor]: '医生',
            [UserRole.Admin]: '管理员'
        }[user.role];

        await this.logService.createLog(
            adminId,
            `创建用户 ${user.username} (ID: ${user.id}) - 角色: ${roleText}`
        );

        return BaseResponse.success(user, '创建用户成功');
    }

    async updateUser(userId: number, updateDto: UpdateUserDto, adminId: number): Promise<BaseResponse<User>> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        
        if (!user) {
            throw new NotFoundException('用户不存在');
        }

        // 记录变更内容
        const changes: string[] = [];

        // 遍历需要更新的字段，记录变更
        Object.keys(updateDto).forEach(key => {
            // 密码特殊处理
            if (key === 'password') {
                if (updateDto.password) {
                    updateDto.password = this.stringToMd5(updateDto.password);
                    changes.push('修改了密码');
                }
                return;
            }

            // 其他字段的变更记录
            if (updateDto[key] !== user[key] && updateDto[key]?.toString().trim() !== user[key]?.toString().trim()) {
                // 对于较长的字段内容，截取显示
                const oldValue = String(user[key]).length > 20 
                    ? String(user[key]).substring(0, 20) + '...' 
                    : String(user[key]);
                const newValue = String(updateDto[key]).length > 20 
                    ? String(updateDto[key]).substring(0, 20) + '...' 
                    : String(updateDto[key]);
                
                changes.push(`${key} 从 "${oldValue}" 改为 "${newValue}"`);
            }
        });

        // 更新用户信息
        const updatedUser = Object.assign(user, updateDto);
        
        try {
            await this.userRepository.save(updatedUser);
            
            // 记录日志
            if (changes.length > 0) {
                const changeLog = `更新用户 ${user.username} (ID: ${user.id}):\n${changes.join('\n')}`;
                await this.logService.createLog(adminId, changeLog);
            } else {
                await this.logService.createLog(adminId, `更新用户 ${user.username} (ID: ${user.id}) (无实质性更改)`);
            }

            return BaseResponse.success(updatedUser, '用户更新成功');
        } catch (error) {
            return BaseResponse.error('更新用户失败');
        }
    }
}