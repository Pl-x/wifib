-- Legion Connections Database Setup Script
-- Run this script in MySQL to create the database and initial setup

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS legion;
USE legion;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  address TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  last_payment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_plan_id (plan_id)
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  speed VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  data_limit VARCHAR(50) DEFAULT 'Unlimited',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active)
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  bill_id VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('credit_card', 'bank_transfer', 'paypal', 'cash', 'mpesa') NOT NULL,
  transaction_id VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mpesa_phone VARCHAR(20),
  mpesa_receipt VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL,
  INDEX idx_customer_id (customer_id),
  INDEX idx_bill_id (bill_id),
  INDEX idx_status (status),
  INDEX idx_transaction_id (transaction_id)
);

-- Create users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Create activities table for audit log
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_created_at (created_at)
);

-- Insert default plans
INSERT IGNORE INTO plans (id, name, speed, price, data_limit, description) VALUES
('plan-001', 'Basic Plan', '25 Mbps', 29.99, 'Unlimited', 'Perfect for light browsing and email'),
('plan-002', 'Premium Plan', '50 Mbps', 49.99, 'Unlimited', 'Great for streaming and gaming'),
('plan-003', 'Ultra Plan', '100 Mbps', 79.99, 'Unlimited', 'Maximum speed for heavy users');

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (id, username, email, password_hash, role) VALUES
('user-001', 'admin', 'admin@legionconnections.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 'admin');

-- Show created tables
SHOW TABLES;

-- Show default plans
SELECT * FROM plans;

-- Show default admin user
SELECT id, username, email, role, is_active FROM users; 