export class CreateRouterDto {
    index: number = 1;
    path: string = '';
    name: string = '';
    component: string = '';
    icon: string = '';
    title: string = '';
    is_link: string = '';
    is_hide: boolean = false;
    is_full: boolean = false;
    is_affix: boolean = false;
    is_keep_alive: boolean = false;
    role_access: number[] = [];
}