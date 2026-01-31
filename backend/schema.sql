-- Database Schema for Realm CRM
-- Run this script to initialize the database tables.

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tenants Table
-- Multi-tenancy root. Each real estate office is a tenant.
CREATE TABLE IF NOT EXISTS `tenants` (
    `id` CHAR(36) NOT NULL, -- UUID
    `name` VARCHAR(255) NOT NULL,
    `subscription_status` ENUM('active', 'inactive', 'trial') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
-- Employees, Managers, Admins belonging to a tenant.
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50),
    `role` ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
    `status` ENUM('active', 'inactive') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_email_per_tenant` (`tenant_id`, `email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Leads Table
-- The core entity.
CREATE TABLE IF NOT EXISTS `leads` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` CHAR(36) NOT NULL,
    `created_by` INT UNSIGNED NOT NULL, -- User who created the lead
    `assigned_to` INT UNSIGNED NULL,    -- User currently responsible
    `status` ENUM(
        'New', 
        'Contacted', 
        'No Answer', 
        'Call Back', 
        'Qualified', 
        'Viewing Scheduled', 
        'Negotiation', 
        'Won', 
        'Lost', 
        'Disqualified'
    ) DEFAULT 'New',
    `source` VARCHAR(100), -- e.g., 'Manual', 'Website', 'Facebook', 'Import'
    `interest_type` ENUM('buy', 'rent', 'invest', 'other') DEFAULT 'buy',
    `full_name` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255),
    `budget_min` DECIMAL(15, 2),
    `budget_max` DECIMAL(15, 2),
    `preferred_location` VARCHAR(255),
    `language` VARCHAR(50), -- e.g., 'English', 'Arabic'
    `notes` TEXT,
    `next_followup_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
    FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_leads_tenant_status` (`tenant_id`, `status`),
    INDEX `idx_leads_assigned` (`tenant_id`, `assigned_to`),
    INDEX `idx_leads_phone` (`tenant_id`, `phone`) -- For duplicate checking
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Activities Table
-- Timeline of interactions.
CREATE TABLE IF NOT EXISTS `activities` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` CHAR(36) NOT NULL,
    `lead_id` INT UNSIGNED NOT NULL,
    `user_id` INT UNSIGNED NOT NULL, -- Who performed the activity
    `type` ENUM('call', 'whatsapp', 'email', 'meeting', 'note', 'status_change', 'assignment') NOT NULL,
    `result` VARCHAR(100), -- e.g., 'Answered', 'No Answer', 'Busy'
    `comment` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    INDEX `idx_activities_lead` (`tenant_id`, `lead_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Lead Imports (Optional/Log)
-- To track bulk imports.
CREATE TABLE IF NOT EXISTS `lead_imports` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` CHAR(36) NOT NULL,
    `user_id` INT UNSIGNED NOT NULL,
    `file_name` VARCHAR(255),
    `status` ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    `success_count` INT DEFAULT 0,
    `error_count` INT DEFAULT 0,
    `report_json` JSON, -- Store array of failed rows/errors
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
