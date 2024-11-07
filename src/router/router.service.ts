import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "src/users/user.entity";
import { ChildEntity, Repository } from "typeorm";
import { Router } from "./router.entity";
import { BaseResponse } from "src/common/response";

@Injectable()
export class RouterService {
    constructor(
        @InjectRepository(Router)
        private routerRepository: Repository<Router>,
    ) { }

    async getRoutersByRole(role: UserRole): Promise<BaseResponse<Router[]>> {
        console.log(role);
        const routers = await this.routerRepository
            .createQueryBuilder('router')
            .where('router.role_access LIKE :role OR router.role_access LIKE :any', { role: `%${role}%`, any: '%-1%' })
            .orderBy('router.index', 'ASC')
            .getMany();

        const menuMap = new Map<number, any>();
        const menuTree: any[] = [];

        // 构造路由
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

            if(router.parent_id && menuMap.has(router.parent_id)) {
                menuMap.get(router.parent_id)?.children?.push(menuOption);
            } else {
                menuTree.push(menuOption);
            }
        });

        return BaseResponse.success(menuTree);
    }
}