import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BasicInfo, HealthInfo } from "./info.entity";
import { Repository } from "typeorm";
import { User, UserRole } from "src/users/user.entity";
import { UpdateBasicInfoDto, UpdateHealthInfoDto } from "./dto/update-info.dto";

@Injectable()
export class InfoService {
    constructor(
        @InjectRepository(BasicInfo)
        private basicInfoRepository: Repository<BasicInfo>,
        @InjectRepository(HealthInfo)
        private healthInfoRepository: Repository<HealthInfo>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async getBasicInfoById(user_id: number): Promise<BasicInfo> {
        const targetUser = await this.userRepository.findOne({ where: { id: user_id } });
        if (!targetUser) {
            return null;
        }

        const basicInfo = await this.basicInfoRepository.findOne({ where: { user: targetUser } });
        return basicInfo;
    }

    async getHealthInfoById(user_id: number): Promise<HealthInfo> {
        const targetUser = await this.userRepository.findOne({ where: { id: user_id } });
        if (!targetUser) {
            return null;
        }

        const healthInfo = await this.healthInfoRepository.findOne({ where: { user: targetUser } });
        return healthInfo;
    }

    async updateBasicInfo(id: number, basicInfo: UpdateBasicInfoDto, authData: { user_id: number, role: UserRole }): Promise<BasicInfo> {
        const targetInfo = await this.basicInfoRepository.findOne({ where: { id } });
        if (!targetInfo) {
            throw new NotFoundException('未找到修改的基本信息');
        }

        if(authData.user_id !== targetInfo.user.id && authData.role !== UserRole.Admin) {
            throw new UnauthorizedException('没有足够的权限修改基本信息');
        }

        Object.assign(targetInfo, basicInfo);
        return await this.basicInfoRepository.save(targetInfo);
    }

    async updateHealthInfo(id: number, healthInfo: UpdateHealthInfoDto, authData: { user_id: number, role: UserRole }): Promise<HealthInfo> {
        const targetInfo = await this.healthInfoRepository.findOne({ where: { id } });
        if (!targetInfo) {
            throw new NotFoundException('未找到修改的健康信息');
        }

        if(authData.user_id !== targetInfo.user.id && authData.role !== UserRole.Admin) {
            throw new UnauthorizedException('没有足够的权限修改健康信息');
        }

        Object.assign(targetInfo, healthInfo);
        return await this.healthInfoRepository.save(targetInfo);
    }
}