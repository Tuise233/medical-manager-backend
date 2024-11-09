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

-- 基本信息表
CREATE TABLE IF NOT EXISTS `basic_info` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL COMMENT '用户id',
    `address` VARCHAR(255) DEFAULT NULL COMMENT '家庭住址',
    `birth_date` DATE DEFAULT NULL COMMENT '出生日期',
    `gender` INT DEFAULT 0 COMMENT '性别', -- 0-女性 1-男性
    `emergency_contact` VARCHAR(50) DEFAULT NULL COMMENT '紧急联系人',
    `emergency_contact_phone` VARCHAR(11) DEFAULT NULL COMMENT '紧急联系人电话',
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 健康信息表
CREATE TABLE IF NOT EXISTS `health_info` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL COMMENT '用户id',
    `height` DECIMAL(5, 2) DEFAULT NULL COMMENT '身高(cm)',
    `weight` DECIMAL(5, 2) DEFAULT NULL COMMENT '体重(kg)',
    `blood_type` INT DEFAULT 0 COMMENT '血型', -- 0-A 1-B 2-AB 3-O
    `blood_pressure` VARCHAR(7) DEFAULT NULL COMMENT '血压',
    `allergies` TEXT DEFAULT NULL COMMENT '过敏史',
    `chronic_conditions` TEXT DEFAULT NULL COMMENT '慢性病史',
    `medical_history` TEXT DEFAULT NULL COMMENT '既往病史',
    `current_medications` TEXT DEFAULT NULL COMMENT '当前用药',
    `alcohol_consumption` INT DEFAULT 0 COMMENT '饮酒情况', -- 0不饮酒 1-偶尔 2-经常
    `heart_rate` INT DEFAULT NULL COMMENT '心率',
    `body_temperature` DECIMAL(4, 1) DEFAULT NULL COMMENT '体温(℃)',
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    `role_access` VARCHAR(32) DEFAULT '[]'
) ENGINE=innodb DEFAULT charset=utf8mb4;
INSERT INTO `routers` (`id`, `index`, `parent_id`, `path`, `name`, `component`, `icon`, `title`, `is_link`, `is_hide`, `is_full`, `is_affix`, `is_keep_alive`, `role_access`) VALUES
	(1, 11, NULL, '/home/index', 'home', '/home/index', 'House', '首页', '', 0, 0, 0, 0, '[-1]'),
	(2, 999, NULL, '/about/index', 'about', '/about/index', 'InfoFilled', '关于项目', '', 0, 0, 0, 0, '[-1]'),
	(3, 99, NULL, '', 'announce', '', 'ChatLineSquare', '系统公告', NULL, 0, 0, 0, 0, '[-1]'),
	(4, 99, 3, '/announce/current/index', 'announce_current', '/announce/current/index', 'ChatLineSquare', '当前公告', NULL, 0, 0, 0, 0, '[-1]'),
	(5, 99, 3, '/announce/manager/index', 'announce_manager', '/announce/manager/index', 'Comment', '管理公告', NULL, 0, 0, 0, 0, '[2]'),
	(6, 99, NULL, '/router/index', 'router', '/router/index', 'Menu', '路由管理', NULL, 0, 0, 0, 0, '[2]'),
	(8, 1, NULL, '', '', '', 'HomeFilled', '测试路由', '', 0, 0, 0, 0, '[]');

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
CREATE TABLE IF NOT EXISTS `medications` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT '药品名称',
    `description` TEXT DEFAULT NULL COMMENT '药品说明',
    `price` INT DEFAULT 0 COMMENT '药品价格',
    `amount` INT DEFAULT 0 COMMENT '库存数量',
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 公告表
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL COMMENT '公告标题',
    `description` TEXT NOT NULL COMMENT '公告内容',
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '公告发布时间',
    `expire_date` DATETIME COMMENT '公告过期时间'
) ENGINE=innodb DEFAULT charset=utf8mb4;

-- 日志表
CREATE TABLE IF NOT EXISTS `logs` (
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT COMMENT '用户id',
    `action` VARCHAR(255) NOT NULL COMMENT '操作描述',
    `action_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',

    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=innodb DEFAULT charset=utf8mb4;