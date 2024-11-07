 import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BasicInfo, HealthInfo } from "./info.entity";
import { Repository } from "typeorm";
import { User, UserRole } from "src/users/user.entity";
import { UpdateBasicInfoDto, UpdateHealthInfoDto } from "./dto/update-info.dto";
import { BaseResponse } from "src/common/response";

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

    async getBasicInfoById(user_id: number): Promise<BaseResponse<BasicInfo>> {
        const targetUser = await this.userRepository.findOne({ where: { id: user_id } });
        if (!targetUser) {
            return BaseResponse.error('未获取到匹配的基本信息');
        }

        const basicInfo = await this.basicInfoRepository.findOne({ where: { user: targetUser } });
        return BaseResponse.success(basicInfo);
    }

    async getHealthInfoById(user_id: number): Promise<BaseResponse<HealthInfo>> {
        const targetUser = await this.userRepository.findOne({ where: { id: user_id } });
        if (!targetUser) {
            return BaseResponse.error('未获取到匹配的健康信息');
        }

        const healthInfo = await this.healthInfoRepository.findOne({ where: { user: targetUser } });
        return BaseResponse.success(healthInfo);
    }

    async updateBasicInfo(id: number, basicInfo: UpdateBasicInfoDto, authData: { user_id: number, role: UserRole }): Promise<BaseResponse<BasicInfo>> {
        const targetInfo = await this.basicInfoRepository.findOne({ where: { id } });
        if (!targetInfo) {
            return BaseResponse.error('未找到修改的基本信息');
        }

        if(authData.user_id !== targetInfo.user.id && authData.role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限修改基本信息');
        }

        Object.assign(targetInfo, basicInfo);
        await this.basicInfoRepository.save(targetInfo);
        return BaseResponse.success(targetInfo);
    }

    async updateHealthInfo(id: number, healthInfo: UpdateHealthInfoDto, authData: { user_id: number, role: UserRole }): Promise<BaseResponse<HealthInfo>> {
        const targetInfo = await this.healthInfoRepository.findOne({ where: { id } });
        if (!targetInfo) {
            return BaseResponse.error('未找到修改的健康信息');
        }

        if(authData.user_id !== targetInfo.user.id && authData.role !== UserRole.Admin) {
            return BaseResponse.error('没有足够的权限修改健康信息');
        }

        Object.assign(targetInfo, healthInfo);
        await this.healthInfoRepository.save(targetInfo);
        return BaseResponse.success(targetInfo);
    }
}