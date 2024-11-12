# Medical Manager Backend

这是一个基于NestJS开发的医疗管理系统后端服务。

## 功能特性

- 用户管理
  - 用户注册/登录
  - 用户角色管理(普通用户/医生/管理员)
  - 用户状态管理(激活/封禁/待审核)
  
- 个人信息管理
  - 基本信息维护(地址、出生日期、性别等)
  - 健康信息维护(身高、体重、血型等)
  - 紧急联系人信息

- 公告管理
  - 公告发布/编辑/删除
  - 公告类型(通知/政策/公告)
  - 公告置顶功能
  - 公告有效期管理

- 路由管理
  - 动态路由配置
  - 路由权限控制
  - 路由层级管理

- 系统日志
  - 操作日志记录
  - 日志查询

## 技术栈

- NestJS
- TypeORM
- MySQL
- JWT认证
- TypeScript

## 开始使用

1. 克隆项目
```
bash
git clone https://github.com/yourusername/medical-manager-backend.git
```

2. 安装依赖
```
bash
cd medical-manager-backend
npm install
```

3. 配置数据库
- 创建MySQL数据库
- 执行`db.sql`初始化数据库表结构
- 修改`src/app.module.ts`中的数据库连接配置

4. 启动项目
```
bash

开发模式
npm run start:dev

生产模式
npm run build
npm run start:prod
```

## API文档

### 用户相关
- POST `/users/register` - 用户注册
- POST `/users/login` - 用户登录 
- PUT `/users/:id` - 更新用户信息

### 信息管理
- GET `/info/basic/:id` - 获取基本信息
- GET `/info/health/:id` - 获取健康信息
- POST `/info/basic/:id` - 更新基本信息
- POST `/info/health/:id` - 更新健康信息

### 公告管理
- GET `/announcement/list` - 获取公告列表
- POST `/announcement/new` - 创建新公告
- POST `/announcement/update/:id` - 更新公告
- POST `/announcement/delete/:id` - 删除公告

### 管理员功能
- GET `/admin/users` - 获取用户列表
- POST `/admin/users/audit/:id` - 审核用户
- POST `/admin/users/create` - 创建用户
- PUT `/admin/users/:id` - 更新用户信息

## 许可证

[MIT License](LICENSE)