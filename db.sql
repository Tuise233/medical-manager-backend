CREATE DATABASE IF NOT EXISTS medical;
use medical;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL COMMENT '用户名',
    `password` VARCHAR(32) NOT NULL COMMENT '密码',
    `email` VARCHAR(32) DEFAULT '' COMMENT '电子邮箱',
    `phone` VARCHAR(11) DEFAULT '' COMMENT '联系电话',
    `role` INT DEFAULT 0 COMMENT '角色', -- 0-user 1-doctor 2-admin
    `status` INT DEFAULT 0 COMMENT '账号状态', -- 0-active 1-ban
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 动态路由表
CREATE TABLE IF NOT EXISTS `routers` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `index` INT DEFAULT 0,
    `parent_id` INT DEFAULT NULL,
    `path` VARCHAR(255) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `component` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(50) DEFAULT NULL,
    `title` VARCHAR(100) DEFAULT NULL,
    `is_link` VARCHAR(255) DEFAULT NULL,
    `is_hide` BOOLEAN DEFAULT FALSE,
    `is_full` BOOLEAN DEFAULT FALSE,
    `is_affix` BOOLEAN DEFAULT FALSE,
    `is_keep_alive` BOOLEAN DEFAULT TRUE,
    `role_access` VARCHAR(255) DEFAULT NULL,

    FOREIGN KEY (parent_id) REFERENCES routers(id)
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 病历表
CREATE TABLE IF NOT EXISTS `medical_record` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `patient_id` INT DEFAULT -1 COMMENT '患者id',
    `doctor_id` INT DEFAULT -1 COMMENT '医生id',
    `description` TEXT DEFAULT NULL COMMENT '诊断结果',
    `plan` TEXT DEFAULT NULL COMMENT '治疗方案',
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 医嘱表
CREATE TABLE IF NOT EXISTS `prescriptions` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `record_id` INT DEFAULT -1 COMMENT '病历id',
    `patient_id` INT DEFAULT -1 COMMENT '患者id',
    `doctor_id` INT DEFAULT -1 COMMENT '医生id',
    `description` TEXT DEFAULT NULL COMMENT '医嘱内容',
    `status` INT DEFAULT 0 COMMENT '医嘱状态', -- 0-未完成 1-完成
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',

    FOREIGN KEY (record_id) REFERENCES medical_record(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES users(id)
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 药品表
CREATE TABLE IF NOT EXISTS medications (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT '药品名称',
    `description` TEXT DEFAULT NULL COMMENT '药品说明',
    `price` INT DEFAULT 0 COMMENT '药品价格',
    `amount` INT DEFAULT 0 COMMENT '库存数量',
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 公告表
CREATE TABLE IF NOT EXISTS announcements (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL COMMENT '公告标题',
    `description` TEXT NOT NULL COMMENT '公告内容',
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '公告发布时间',
    `expire_date` DATETIME COMMENT '公告过期时间'
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 日志表
CREATE TABLE IF NOT EXISTS logs (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT COMMENT '用户id',
    `action` VARCHAR(255) NOT NULL COMMENT '操作描述',
    `action_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',

    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=innodb DEFAULT charset=utf8mb4;