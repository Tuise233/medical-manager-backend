# Medical Manager Backend

这是一个基于NestJS开发的医疗管理系统后端服务。

## 功能特性

### 用户管理
- 用户注册/登录
  - MD5密码加密
  - JWT令牌认证
  - 角色权限控制(普通用户/医生/管理员)
  - 用户状态管理(激活/封禁/待审核)
  
### 个人信息管理
- 基本信息维护
  - 地址信息
  - 出生日期
  - 性别(男/女)
  - 紧急联系人
  - 紧急联系人电话
- 健康信息维护
  - 身高、体重
  - 血型(A/B/AB/O)
  - 血压
  - 过敏史
  - 病史
  - 当前用药
  - 饮酒情况(从不/偶尔/经常)
  - 心率
  - 体温

### 预约管理
- 预约功能
  - 在线预约医生
  - 选择预约时间
  - 预约状态跟踪(待处理/已接受/已拒绝/已取消/已完成)
  - 预约时间冲突检查
  - 预约描述

### 病历管理
- 电子病历
  - 主诉
  - 现病史
  - 既往史
  - 体格检查
  - 诊断结果
  - 治疗方案
  - 备注信息
  - 状态跟踪

### 医嘱管理
- 电子医嘱
  - 医嘱类型(用药医嘱/检查医嘱/其他医嘱)
  - 医嘱描述
  - 用药频次
  - 用药剂量
  - 用药天数
  - 备注说明
  - 状态管理(待处理/执行中/已完成/已取消)

### 系统日志
- 操作日志记录
  - 用户注册/登录
  - 信息更新
  - 预约操作
  - 病历更新
  - 医嘱管理
- 日志查询
  - 按时间查询
  - 按操作类型查询
  - 按用户查询

## 技术栈

- NestJS - Node.js服务端框架
- TypeORM - 对象关系映射
- MySQL - 数据库
- JWT - 身份认证
- TypeScript - 开发语言
- Class Validator - 参数验证
- Express - Web框架

## API文档

### 用户相关
- POST `/users/register` - 用户注册
- POST `/users/login` - 用户登录 
- PUT `/users/:id` - 更新用户信息
- GET `/users/doctors` - 获取医生列表
- GET `/users/patients` - 获取患者列表(分页)
- GET `/users/patient/:id` - 获取患者详细信息

### 信息管理
- PUT `/users/patient/:id/basic` - 更新基本信息
- PUT `/users/patient/:id/health` - 更新健康信息

### 预约管理
- POST `/appointments` - 创建预约
- PUT `/appointments/:id` - 更新预约状态
- GET `/appointments/:id/record` - 获取预约相关病历
- PUT `/appointments/:id/record` - 更新病历和医嘱
- DELETE `/appointments/:id/prescriptions/:prescriptionId` - 删除医嘱

## 数据模型

### User 用户
- id: number (PK)
- username: string
- password: string (MD5)
- real_name: string
- phone: string
- email: string
- role: enum
- status: enum
- create_date: datetime
- update_date: datetime

### BasicInfo 基本信息
- id: number (PK)
- user_id: number (FK)
- address: string
- birth_date: date
- gender: enum
- emergency_contact: string
- emergency_contact_phone: string

### HealthInfo 健康信息
- id: number (PK)
- user_id: number (FK)
- height: decimal
- weight: decimal
- blood_type: enum
- blood_pressure: string
- allergies: text
- medical_history: text
- current_medications: text
- alcohol_consumption: enum
- heart_rate: integer
- body_temperature: decimal

### MedicalRecord 病历
- id: number (PK)
- appointment_id: number (FK)
- patient_id: number (FK)
- doctor_id: number (FK)
- chief_complaint: text
- present_illness: text
- past_history: text
- physical_exam: text
- diagnosis: text
- treatment_plan: text
- note: text
- status: integer
- create_date: datetime
- update_date: datetime

### Prescription 医嘱
- id: number (PK)
- record_id: number (FK)
- patient_id: number (FK)
- doctor_id: number (FK)
- type: enum
- description: text
- frequency: string
- dosage: string
- duration: integer
- note: text
- status: enum
- create_date: datetime
- update_date: datetime

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

## 许可证

[MIT License](LICENSE)