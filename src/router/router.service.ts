import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "src/users/user.entity";
import { Repository } from "typeorm";
import { Router } from "./router.entity";
import { BaseResponse } from "src/common/response";
import { Request } from "express";
import { CreateRouterDto } from "./dto/create-router.dto";
import { LogService } from "src/log/log.service";

@Injectable()
export class RouterService {
    constructor(
        @InjectRepository(Router)
        private routerRepository: Repository<Router>,
        private logService: LogService
    ) { }

    async getRoutersByRole(role: UserRole): Promise<BaseResponse<Router[]>> {
        const routers = await this.routerRepository
            .createQueryBuilder('router')
            .where('router.role_access LIKE :role OR router.role_access LIKE :any', { role: `%${role}%`, any: '%-1%' })
            .orderBy('router.index', 'ASC')
            .getMany();

        const menuMap = new Map<number, any>();
        const menuTree: any[] = [];

        routers.forEach((router) => {
            const menuOption = {
                path: router.path,
                name: router.name,
                component: router.component,
                redirect: undefined,
                meta: {
                    icon: router.icon,
                    title: router.title,
                    activeMenu: undefined,
                    isLink: router.is_link || undefined,
                    isHide: router.is_hide || false,
                    isFull: router.is_full || false,
                    isAffix: router.is_affix || false,
                    isKeepAlive: router.is_keep_alive || true
                },
                children: []
            };

            menuMap.set(router.id, menuOption);

            if (router.parent_id && menuMap.has(router.parent_id)) {
                menuMap.get(router.parent_id)?.children?.push(menuOption);
            } else {
                menuTree.push(menuOption);
            }
        });

        return BaseResponse.success(menuTree);
    }

    async getAll(request: Request) {
        const role: UserRole = request['user']['role'];
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有权限');
        }
        const results = await this.routerRepository.find();
        return BaseResponse.success(results);
    }

    async saveAll(datas: Router[], request: Request) {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有权限');
        }

        // 获取更新前的所有路由
        const oldRouters = await this.routerRepository.find();
        const oldRouterMap = new Map(oldRouters.map(r => [r.id, r]));

        // 处理parent_id
        datas.map((item) => {
            if (item.parent_id === -1) item.parent_id = null;
            return item;
        });

        // 保存更新
        await this.routerRepository.save(datas);

        // 对比变化并记录日志
        const changes: string[] = [];
        
        // 检查更新和新增
        for (const newRouter of datas) {
            const oldRouter = oldRouterMap.get(newRouter.id);
            if (!oldRouter) {
                // 新增的路由
                changes.push(`新增路由: ${newRouter.title} (${newRouter.path})`);
                continue;
            }

            // 检查各个字段的变化
            const fieldChanges: string[] = [];
            
            // 使用严格比较并确保值真正发生了变化
            if (oldRouter.title !== newRouter.title && oldRouter.title?.trim() !== newRouter.title?.trim()) {
                fieldChanges.push(`标题从 "${oldRouter.title}" 改为 "${newRouter.title}"`);
            }
            if (oldRouter.path !== newRouter.path && oldRouter.path?.trim() !== newRouter.path?.trim()) {
                fieldChanges.push(`路径从 "${oldRouter.path}" 改为 "${newRouter.path}"`);
            }
            if (oldRouter.component !== newRouter.component && oldRouter.component?.trim() !== newRouter.component?.trim()) {
                fieldChanges.push(`组件从 "${oldRouter.component}" 改为 "${newRouter.component}"`);
            }
            if (oldRouter.icon !== newRouter.icon && oldRouter.icon?.trim() !== newRouter.icon?.trim()) {
                fieldChanges.push(`图标从 "${oldRouter.icon}" 改为 "${newRouter.icon}"`);
            }
            if (oldRouter.role_access !== newRouter.role_access && String(oldRouter.role_access).trim() !== String(newRouter.role_access).trim()) {
                fieldChanges.push(`权限从 "${oldRouter.role_access}" 改为 "${newRouter.role_access}"`);
            }
            if (oldRouter.is_hide !== newRouter.is_hide && Boolean(oldRouter.is_hide) !== Boolean(newRouter.is_hide)) {
                fieldChanges.push(`隐藏状态从 "${oldRouter.is_hide}" 改为 "${newRouter.is_hide}"`);
            }
            if (oldRouter.index !== newRouter.index && Number(oldRouter.index) !== Number(newRouter.index)) {
                fieldChanges.push(`排序从 ${oldRouter.index} 改为 ${newRouter.index}`);
            }

            if (fieldChanges.length > 0) {
                changes.push(`修改路由 "${newRouter.title}": ${fieldChanges.join(', ')}`);
            }
        }

        // 检查删除的路由
        const newRouterIds = new Set(datas.map(r => r.id));
        for (const oldRouter of oldRouters) {
            if (!newRouterIds.has(oldRouter.id)) {
                changes.push(`删除路由: ${oldRouter.title} (${oldRouter.path})`);
            }
        }

        // 记录所有变化
        if (changes.length > 0) {
            const changeLog = `批量更新路由配置:\n${changes.join('\n')}`;
            await this.logService.createLog(userId, changeLog);
        }

        return BaseResponse.success(null);
    }

    async create(createDto: CreateRouterDto, request: Request) {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有权限');
        }
        const router = await this.routerRepository.create(createDto);
        await this.routerRepository.save(router);
        await this.logService.createLog(userId, `创建路由 ${router.title} (${router.path})`);
        return BaseResponse.success(null);
    }

    async delete(id: number, request: Request) {
        const role: UserRole = request['user']['role'];
        const userId: number = request['user']['userId'];
        
        if (role !== UserRole.Admin) {
            return BaseResponse.error('没有权限');
        }

        // 查找要删除的路由
        const router = await this.routerRepository.findOne({ where: { id } });
        if (!router) {
            throw new NotFoundException(`ID为${id}的路由不存在`);
        }

        // 查找子路由并更新它们的 parent_id 为 NULL
        const childRouters = await this.routerRepository.find({ where: { parent_id: id } });
        if (childRouters.length > 0) {
            await this.routerRepository
                .createQueryBuilder()
                .update(Router)
                .set({ parent_id: null })
                .where("parent_id = :id", { id })
                .execute();
                
            // 记录子路由变更日志
            await this.logService.createLog(
                userId, 
                `路由 ${router.title} 被删除，其下属 ${childRouters.length} 个子路由已变更为顶级路由`
            );
        }

        // 删除路由
        await this.routerRepository.remove(router);

        // 记录删除日志
        await this.logService.createLog(userId, `删除路由: ${router.title} (${router.path})`);

        return BaseResponse.success(null);
    }
}