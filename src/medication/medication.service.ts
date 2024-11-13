import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Medication, MedicationStatus } from "./medication.entity";
import { QueryBuilder, Repository } from "typeorm";
import { CreateMedicationDto, SearchMedicationDto, UpdateMedicationDto } from "./medication.dto";
import { Request } from "express";
import { UserRole } from "src/users/user.entity";
import { BaseResponse, PageResponse } from "src/common/response";
import { LogService } from "src/log/log.service";

@Injectable()
export class MedicationService {
    constructor(
        @InjectRepository(Medication)
        private readonly medicationRepository: Repository<Medication>,
        private readonly logService: LogService
    ) { }

    async getMedicationList(data: SearchMedicationDto, request: Request) {
        const role: UserRole = request['user']['role'];
        if (role !== UserRole.Admin && role !== UserRole.Doctor) {
            return PageResponse.error('没有权限查看药品列表');
        }
        const { pageNum, pageSize, searchValue, category, status, minPrice, maxPrice, minStock, maxStock } = data;
        const queyrBuilder = this.medicationRepository.createQueryBuilder('medication')
            .orderBy('medication.update_date', 'DESC')
            .skip((pageNum - 1) * pageSize)
            .take(pageSize);

        if(searchValue) {
            queyrBuilder.andWhere('medication.name LIKE :name', { name: `%${searchValue}%` });
        }

        if(typeof category !== 'undefined') {
            queyrBuilder.andWhere('medication.category = :category', { category });
        }

        if(typeof status !== 'undefined') {
            queyrBuilder.andWhere('medication.status = :status', { status });
        }

        if(typeof minPrice !== 'undefined') {
            queyrBuilder.andWhere('medication.price >= :minPrice', { minPrice });
        }

        if(typeof maxPrice !== 'undefined') {
            queyrBuilder.andWhere('medication.price <= :maxPrice', { maxPrice });
        }

        if(typeof minStock !== 'undefined') {
            queyrBuilder.andWhere('medication.amount >= :minStock', { minStock });
        }

        if(typeof maxStock !== 'undefined') {
            queyrBuilder.andWhere('medication.amount <= :maxStock', { maxStock });
        }

        const [results, total] = await queyrBuilder.getManyAndCount();
        return PageResponse.success(total, pageNum, pageSize, results);
    }

    async createMedication(data: CreateMedicationDto, request: Request) {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        if(role !== UserRole.Admin) {
            return BaseResponse.error('你没有权限创建药品');
        }
        const medication = this.medicationRepository.create(data);
        await this.medicationRepository.save(medication);
        
        await this.logService.createLog(userId, `创建药品: ${medication.name} (ID: ${medication.id}) | 价格: ${medication.price}元 | 库存: ${medication.amount}件`);
        return BaseResponse.success(medication);
    }

    async updateMedication(id: number, data: UpdateMedicationDto, request: Request) {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        if(role !== UserRole.Admin) {
            return BaseResponse.error('你没有权限修改药品');
        }
        const medication = await this.medicationRepository.findOne({ where: { id } });
        if(!medication) {
            return BaseResponse.error('药品不存在');
        }
        const changes: string[] = [];
        if(typeof data.name !== 'undefined' && medication.name !== data.name) {
            changes.push(`名称从 ${medication.name} 修改为 ${data.name}`);
            medication.name = data.name;
        }
        if(typeof data.price !== 'undefined' && medication.price !== data.price) {
            changes.push(`价格从 ${medication.price} 修改为 ${data.price}`);
            medication.price = data.price;
        }
        if(typeof data.description !== 'undefined' && medication.description !== data.description) {
            changes.push(`描述从 ${medication.description} 修改为 ${data.description}`);
            medication.description = data.description;
        }
        if(typeof data.amount !== 'undefined' && medication.amount !== data.amount) {
            changes.push(`库存从 ${medication.amount} 修改为 ${data.amount}`);
            medication.amount = data.amount;
        }
        if(typeof data.category !== 'undefined' && medication.category !== data.category) {
            changes.push(`分类从 ${medication.category} 修改为 ${data.category}`);
            medication.category = data.category;
        }
        if(typeof data.status !== 'undefined' && medication.status !== data.status) {
            changes.push(`状态从 ${medication.status === MedicationStatus.Disable ? '下架' : '上架'} 修改为 ${data.status === MedicationStatus.Disable ? '下架' : '上架'}`);
            medication.status = data.status;
        }

        Object.assign(medication, data);
        await this.medicationRepository.save(medication);
        await this.logService.createLog(userId, `修改药品: ${medication.name} (ID: ${medication.id}) | ${changes.join(' | ')}`);
        return BaseResponse.success(medication);
    }

    async deleteMedication(id: number, request: Request) {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        if(role !== UserRole.Admin) {
            return BaseResponse.error('你没有权限删除药品');
        }
        const medication = await this.medicationRepository.findOne({ where: { id } });
        if(!medication) {
            return BaseResponse.error('药品不存在');
        }
        await this.medicationRepository.delete(id);
        await this.logService.createLog(userId, `删除药品: ${medication.name} (ID: ${medication.id})`);
        return BaseResponse.success(null);
    }
}