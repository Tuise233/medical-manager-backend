import { Injectable, Param, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Announcement } from "./announcement.entity";
import { Repository } from "typeorm";
import { CreateAnnounceDto } from "./dto/create-announce.dto";
import { UserRole } from "src/users/user.entity";
import { BaseResponse, PageResponse } from "src/common/response";
import { PageDto } from "src/common/dto/page.dto";
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
    ) {

    }

    async getValidAnnouncePage(pageDto: SearchAnnounceDto, request: Request): Promise<PageResponse<Announcement>> {
        const role: UserRole = request['user']['role'];
        if (pageDto.type === 'all' && role !== UserRole.Admin) {
            return PageResponse.error('无法获取公告数据');
        }
        let { pageNum, pageSize, searchValue, type } = pageDto;
        const builder = await this.announcementRepository
            .createQueryBuilder('announce')
            .orderBy('announce.create_date', 'DESC')
            .skip((pageNum - 1) * pageSize)
            .take(pageSize);

        if (type === 'valid') {
            builder.andWhere('expire_date > :date', { date: new Date() })
        }

        if (searchValue) {
            builder.andWhere('title LIKE :title', { title: `%${searchValue}%` });
        }

        const [data, total] = await builder.getManyAndCount();
        return PageResponse.success(total, Number(pageNum), Number(pageSize), data);
    }

    async createAnnounce(createDto: CreateAnnounceDto, request: Request): Promise<BaseResponse<Announcement>> {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        if (!createDto) return;
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限');
        }
        const { title, description, expire_date } = createDto;
        const announce = this.announcementRepository.create({
            title,
            description,
            create_date: new Date(),
            expire_date,
        });
        await this.announcementRepository.save(announce);
        await this.logService.createLog(userId, `创建公告 #${announce.id} | 标题: ${announce.title}`);
        return BaseResponse.success(announce);
    }

    async updateAnnounce(id: number, updateDto: UpdateAnnounceDto, request: Request): Promise<BaseResponse<Announcement>> {
        if (!updateDto) return;
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限');
        }
        const target = await this.announcementRepository.findOne({ where: { id } });
        if (!target) {
            return BaseResponse.error('未找到更新的目标数据');
        }
        Object.assign(target, updateDto);
        await this.announcementRepository.save(target);
        await this.logService.createLog(userId, `更新公告 #${target.id} | 标题: ${target.title}`);
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
        await this.announcementRepository.delete(target);
        await this.logService.createLog(userId, `删除公告 #${target.id} | 标题: ${target.title}`);
        return BaseResponse.success(null);
    }
}