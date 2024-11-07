import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Announcement } from "./announcement.entity";
import { Repository } from "typeorm";
import { CreateAnnounceDto } from "./dto/create-announce.dto";
import { UserRole } from "src/users/user.entity";
import { BaseResponse } from "src/common/response";

@Injectable()
export class AnnouncementService {
    constructor(
        @InjectRepository(Announcement)
        private announcementRepository: Repository<Announcement>,
    ) {

    }

    async getValidAnnounce(): Promise<BaseResponse<Announcement[]>> {
        const results = await this.announcementRepository
            .createQueryBuilder('announce')
            .where('expire_date > :date', { date: new Date() })
            .orderBy('announce.create_date', 'ASC')
            .getMany();
        return BaseResponse.success(results);
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

    async deleteAnnounce(id: number): Promise<BaseResponse<any>> {
        const target = await this.announcementRepository.findOne({ where: { id } });
        if (!target) {
            return BaseResponse.error('未找到该公告');
        }
        this.announcementRepository.delete(target);
        return BaseResponse.success(null);
    }
}