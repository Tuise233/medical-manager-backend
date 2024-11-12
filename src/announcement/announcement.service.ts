import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Announcement } from "./announcement.entity";
import { Repository } from "typeorm";
import { CreateAnnounceDto } from "./dto/create-announce.dto";
import { UserRole } from "src/users/user.entity";
import { BaseResponse, PageResponse } from "src/common/response";
import { SearchAnnounceDto } from "./dto/search-announce.dto";
import { UpdateAnnounceDto } from "./dto/update-announce.dto";
import { LogService } from "src/log/log.service";
import { Request } from "express";

@Injectable()
export class AnnouncementService {
    constructor(
        @InjectRepository(Announcement)
        private announcementRepository: Repository<Announcement>,
        private logService: LogService
    ) { }

    async getAnnouncePage(searchDto: SearchAnnounceDto, request: Request): Promise<PageResponse<Announcement>> {
        const role: UserRole = request['user']['role'];
        if (searchDto.type === 'all' && role !== UserRole.Admin) {
            return PageResponse.error('无法获取公告数据');
        }

        const { pageNum, pageSize, searchValue, type, getType, is_top, start_date, end_date } = searchDto;
        const builder = this.announcementRepository
            .createQueryBuilder('announce')
            .orderBy('announce.is_top', 'DESC')
            .addOrderBy('announce.create_date', 'DESC')
            .skip((pageNum - 1) * pageSize)
            .take(pageSize);

        if (getType === 'valid') {
            builder.andWhere('expire_date > :date', { date: new Date() });
        }
        
        if (type) {
            builder.andWhere('type = :type', { type });
        }

        if (searchValue) {
            builder.andWhere('title LIKE :title', { title: `%${searchValue}%` });
        }

        if (is_top !== undefined) {
            builder.andWhere('is_top = :is_top', { is_top });
        }

        if (start_date) {
            builder.andWhere('create_date >= :start_date', { start_date });
        }

        if (end_date) {
            builder.andWhere('create_date <= :end_date', { end_date });
        }

        const [data, total] = await builder.getManyAndCount();
        return PageResponse.success(total, Number(pageNum), Number(pageSize), data);
    }

    async createAnnounce(createDto: CreateAnnounceDto, request: Request): Promise<BaseResponse<Announcement>> {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限');
        }

        const announce = this.announcementRepository.create({
            ...createDto,
            create_date: new Date()
        });

        await this.announcementRepository.save(announce);

        // 记录日志
        const typeText = {
            0: '通知',
            1: '政策',
            2: '公告'
        }[announce.type];

        await this.logService.createLog(
            userId, 
            `创建${typeText} #${announce.id} | 标题: ${announce.title}${announce.is_top ? ' [置顶]' : ''}`
        );

        return BaseResponse.success(announce);
    }

    async updateAnnounce(id: number, updateDto: UpdateAnnounceDto, request: Request): Promise<BaseResponse<Announcement>> {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];

        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限');
        }

        const target = await this.announcementRepository.findOne({ where: { id } });
        if (!target) {
            return BaseResponse.error('未找到更新的目标数据');
        }

        // 记录变更内容
        const changes: string[] = [];
        const typeText = {
            0: '通知',
            1: '政策',
            2: '公告'
        };
        
        if (target.title !== updateDto.title) {
            changes.push(`标题从 "${target.title}" 改为 "${updateDto.title}"`);
        }
        
        if (target.type !== updateDto.type) {
            changes.push(`类型从 "${typeText[target.type]}" 改为 "${typeText[updateDto.type]}"`);
        }

        if (target.description !== updateDto.description) {
            const oldDesc = target.description.length > 20 ? target.description.substring(0, 20) + '...' : target.description;
            const newDesc = updateDto.description.length > 20 ? updateDto.description.substring(0, 20) + '...' : updateDto.description;
            changes.push(`内容从 "${oldDesc}" 改为 "${newDesc}"`);
        }

        if (target.is_top !== updateDto.is_top) {
            changes.push(`${updateDto.is_top ? '设为置顶' : '取消置顶'}`);
        }

        const oldExpireDate = target.expire_date.toISOString();
        const newExpireDate = new Date(updateDto.expire_date).toISOString();
        if (oldExpireDate !== newExpireDate) {
            changes.push(`过期时间从 "${target.expire_date.toLocaleString()}" 改为 "${new Date(updateDto.expire_date).toLocaleString()}"`);
        }

        // 更新数据
        Object.assign(target, updateDto);
        await this.announcementRepository.save(target);

        // 记录日志
        if (changes.length > 0) {
            const changeLog = `更新${typeText[target.type]}: #${target.id}:\n${changes.join('\n')}`;
            await this.logService.createLog(userId, changeLog);
        }

        return BaseResponse.success(target);
    }

    async deleteAnnounce(id: number, request: Request): Promise<BaseResponse<any>> {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];

        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限');
        }

        const target = await this.announcementRepository.findOne({ where: { id } });
        if (!target) {
            return BaseResponse.error('未找到该公告');
        }

        const typeText = {
            0: '通知',
            1: '政策',
            2: '公告'
        }[target.type];

        await this.announcementRepository.delete(target);
        await this.logService.createLog(
            userId, 
            `删除${typeText} #${target.id} | 标题: ${target.title}${target.is_top ? ' [置顶]' : ''}`
        );

        return BaseResponse.success(null);
    }
}