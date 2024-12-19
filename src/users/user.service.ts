import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserRole, UserStatus } from "./user.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dto/create-user.dto";
import * as crypto from 'crypto';
import { LoginUserDto } from "./dto/login-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { BasicInfo, HealthInfo } from "src/info/info.entity";
import { BaseResponse } from "src/common/response";
import { SearchPatientDto } from "./dto/search-patient.dto";
import { UpdateHealthInfoDto } from "./dto/update-health.dto";
import { UpdateBasicInfoDto } from "./dto/update-basic.dto";
import { LogService } from "src/log/log.service";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(BasicInfo)
        private basicRepository: Repository<BasicInfo>,
        @InjectRepository(HealthInfo)
        private healthRepository: Repository<HealthInfo>,
        private jwtService: JwtService,
        private logService: LogService
    ) { }

    private stringToMd5(text: string) {
        return crypto.createHash('md5').update(text).digest('hex');
    }

    async register(userDto: CreateUserDto): Promise<BaseResponse<User>> {
        if (!userDto) return;
        const { username, password, phone } = userDto;
        const target = await this.userRepository.findOne({ where: { username } });
        if (target) {
            return BaseResponse.error('用户名已被注册');
        }

        const user = this.userRepository.create({
            username,
            password: this.stringToMd5(password),
            phone
        });
        const basicInfo = this.basicRepository.create();
        basicInfo.user = user;
        const healthInfo = this.healthRepository.create();
        healthInfo.user = user;

        await this.userRepository.save(user);
        await this.basicRepository.save(basicInfo);
        await this.healthRepository.save(healthInfo);

        await this.logService.createLog(
            user.id,
            `新用户注册: ${user.username} (${user.role === UserRole.Doctor ? '医生' : '患者'})`
        );

        return BaseResponse.success(user, '注册成功');
    }

    async login(userDto: LoginUserDto): Promise<BaseResponse<{ access_token: string }>> {
        if (!userDto) return;
        const { username, password } = userDto;
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user || user.password !== password) {
            return BaseResponse.error('用户名或密码错误');
        }
        const payload = { username: user.username, userId: user.id, role: user.role };
        await this.logService.createLog(
            user.id,
            `用户登录: ${user.username}`
        );
        return BaseResponse.success({
            access_token: this.jwtService.sign(payload),
            userInfo: {
                name: user.real_name
            }
        });
    }

    async updateUser(id: number, userDto: UpdateUserDto, isAdmin: boolean): Promise<BaseResponse<User>> {
        const user = await this.userRepository.findOne({ where: { id } });
        if(!user) {
            return BaseResponse.error('未找到修改的用户数据');
        }

        if(userDto.role && !isAdmin) {
            return BaseResponse.error('你没有足够的权限');
        }

        Object.assign(user, userDto);
        await this.userRepository.save(user);
        await this.logService.createLog(
            isAdmin,
            `更新用户 #${id} 信息: ${Object.keys(userDto).join(', ')}`
        );
        return BaseResponse.success(user, '更新用户数据成功');
    }

    async getDoctorList(): Promise<BaseResponse<Array<{ id: number, real_name: string }>>> {
        const doctors = await this.userRepository.find({
            where: {
                role: UserRole.Doctor,
                status: UserStatus.Active
            },
            select: ['id', 'real_name']
        });
        
        return BaseResponse.success(doctors);
    }

    async getPatientInfo(userId: number): Promise<BaseResponse<any>> {
        const patient = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['basicInfo', 'healthInfo'],
            select: {
                id: true,
                username: true,
                real_name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                create_date: true,
                basicInfo: {
                    address: true,
                    birth_date: true,
                    gender: true,
                    emergency_contact: true,
                    emergency_contact_phone: true
                },
                healthInfo: {
                    height: true,
                    weight: true,
                    blood_type: true,
                    blood_pressure: true,
                    allergies: true,
                    medical_history: true,
                    current_medications: true,
                    alcohol_consumption: true,
                    heart_rate: true,
                    body_temperature: true
                }
            }
        });

        if (!patient) {
            return BaseResponse.error('患者不存在');
        }

        // 格式化返回数据
        const result = {
            id: patient.id,
            username: patient.username,
            real_name: patient.real_name,
            email: patient.email,
            phone: patient.phone,
            role: patient.role,
            status: patient.status,
            create_date: patient.create_date,
            // 基本信息
            basicInfo: {
                address: patient.basicInfo?.address || '',
                birth_date: patient.basicInfo?.birth_date || null,
                gender: patient.basicInfo?.gender || 0,
                emergency_contact: patient.basicInfo?.emergency_contact || '',
                emergency_contact_phone: patient.basicInfo?.emergency_contact_phone || ''
            },
            // 健康信息
            healthInfo: {
                height: patient.healthInfo?.height || null,
                weight: patient.healthInfo?.weight || null,
                blood_type: patient.healthInfo?.blood_type || 0,
                blood_pressure: patient.healthInfo?.blood_pressure || '',
                allergies: patient.healthInfo?.allergies || '',
                medical_history: patient.healthInfo?.medical_history || '',
                current_medications: patient.healthInfo?.current_medications || '',
                alcohol_consumption: patient.healthInfo?.alcohol_consumption || 0,
                heart_rate: patient.healthInfo?.heart_rate || null,
                body_temperature: patient.healthInfo?.body_temperature || null
            }
        };

        return BaseResponse.success(result);
    }

    async getPatientList(searchDto: SearchPatientDto): Promise<BaseResponse<any>> {
        const { pageNum, pageSize, searchValue } = searchDto;

        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.basicInfo', 'basicInfo')
            .where('user.role = :role', { role: UserRole.User })
            .andWhere('user.status = :status', { status: UserStatus.Active })
            .orderBy('user.create_date', 'DESC')
            .skip((pageNum - 1) * pageSize)
            .take(pageSize);

        if (searchValue) {
            queryBuilder.andWhere(
                '(user.username LIKE :search OR user.real_name LIKE :search)',
                { search: `%${searchValue}%` }
            );
        }

        const [patients, total] = await queryBuilder.getManyAndCount();

        // 格式化返回数据
        const results = patients.map(patient => ({
            id: patient.id,
            username: patient.username,
            real_name: patient.real_name,
            email: patient.email,
            phone: patient.phone,
            create_date: patient.create_date,
            gender: patient.basicInfo?.gender || 0,
            age: patient.basicInfo?.birth_date,
            basicInfo: {
                birth_date: patient.basicInfo?.birth_date,
                emergency_contact: patient.basicInfo?.emergency_contact,
                emergency_contact_phone: patient.basicInfo?.emergency_contact_phone
            }
        }));

        return BaseResponse.success({
            total,
            pageNum,
            pageSize,
            list: results
        });
    }

    async updatePatientHealthInfo(id: number, data: UpdateHealthInfoDto, operatorId: number): Promise<BaseResponse<any>> {
        const patient = await this.userRepository.findOne({
            where: { id },
            relations: ['healthInfo']
        });

        if (!patient) {
            return BaseResponse.error('患者不存在');
        }

        if (!patient.healthInfo) {
            const healthInfo = this.healthRepository.create({
                ...data,
                user: { id: patient.id }
            });
            await this.healthRepository.save(healthInfo);
            patient.healthInfo = healthInfo;
        } else {
            Object.assign(patient.healthInfo, data);
            await this.healthRepository.save(patient.healthInfo);
        }

        const result = {
            height: patient.healthInfo.height,
            weight: patient.healthInfo.weight,
            blood_type: patient.healthInfo.blood_type,
            blood_pressure: patient.healthInfo.blood_pressure,
            allergies: patient.healthInfo.allergies,
            medical_history: patient.healthInfo.medical_history,
            current_medications: patient.healthInfo.current_medications,
            alcohol_consumption: patient.healthInfo.alcohol_consumption,
            heart_rate: patient.healthInfo.heart_rate,
            body_temperature: patient.healthInfo.body_temperature
        };

        await this.logService.createLog(
            operatorId,
            `更新患者 #${id} 的健康信息`
        );

        return BaseResponse.success(result, '更新健康信息成功');
    }

    async updatePatientBasicInfo(id: number, data: UpdateBasicInfoDto, operatorId: number): Promise<BaseResponse<any>> {
        const patient = await this.userRepository.findOne({
            where: { id },
            relations: ['basicInfo']
        });

        if (!patient) {
            return BaseResponse.error('患者不存在');
        }

        if (!patient.basicInfo) {
            const basicInfo = this.basicRepository.create({
                ...data,
                user: { id: patient.id }
            });
            await this.basicRepository.save(basicInfo);
            patient.basicInfo = basicInfo;
        } else {
            Object.assign(patient.basicInfo, data);
            await this.basicRepository.save(patient.basicInfo);
        }

        const result = {
            address: patient.basicInfo.address,
            birth_date: patient.basicInfo.birth_date,
            gender: patient.basicInfo.gender,
            emergency_contact: patient.basicInfo.emergency_contact,
            emergency_contact_phone: patient.basicInfo.emergency_contact_phone
        };

        await this.logService.createLog(
            operatorId,
            `更新患者 #${id} 的基本信息`
        );

        return BaseResponse.success(result, '更新基本信息成功');
    }
}