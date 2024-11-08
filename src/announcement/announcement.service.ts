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

@Injectable()
export class AnnouncementService {
    constructor(
        @InjectRepository(Announcement)
        private announcementRepository: Repository<Announcement>,
    ) {

    }

    async getValidAnnouncePage(pageDto: SearchAnnounceDto, role: UserRole): Promise<PageResponse<Announcement>> {
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

    async createAnnounce(createDto: CreateAnnounceDto, role: UserRole): Promise<BaseResponse<Announcement>> {
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
        return BaseResponse.success(announce);
    }

    async updateAnnounce(id: number, updateDto: UpdateAnnounceDto, role: UserRole): Promise<BaseResponse<Announcement>> {
        if (!updateDto) return;
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限');
        }
        const target = await this.announcementRepository.findOne({ where: { id } });
        if (!target) {
            return BaseResponse.error('未找到更新的目标数据');
        }
        Object.assign(target, updateDto);
        await this.announcementRepository.save(target);
        return BaseResponse.success(target);
    }

    async deleteAnnounce(id: number, role: UserRole): Promise<BaseResponse<any>> {
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限');
        }
        const target = await this.announcementRepository.findOne({ where: { id } });
        if (!target) {
            return BaseResponse.error('未找到该公告');
        }
        this.announcementRepository.delete(target);
        return BaseResponse.success(null);
    }
}