import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "src/users/user.entity";
import { Repository } from "typeorm";
import { Router } from "./router.entity";

@Injectable()
export class RouterService {
    constructor(
        @InjectRepository(Router)
        private routerRepository: Repository<Router>,
    ) { }

    async getRoutersByRole(role: UserRole): Promise<Router[]> {
        const routers = await this.routerRepository
            .createQueryBuilder('router')
            .where('FIND_IN_SET(:role, router.role_access) > 0', { role: role })
            .orderBy('router.index', 'ASC')
            .getMany();

        const routerMap = new Map<number, any>();
        const rootRouters = [];

        // 初始化routerMap
        routers.forEach(router => {
            routerMap.set(router.id, router);
        });

        // 构造路由
        routers.forEach((router) => {
            if (router.parent_id) {
                const parent = routerMap.get(router.parent_id);
                if (parent) {
                    if (typeof parent.children === 'undefined') {
                        parent.children = [];
                    }
                    parent.children.push(routerMap.get(router.id));
                }
            } else {
                rootRouters.push(routerMap.get(router.id));
            }
        });

        return rootRouters;
    }
}