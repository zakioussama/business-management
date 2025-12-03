-- LUNDI EVENING BACKEND - SQL SCHEMA

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS hafeez_db;
USE hafeez_db;

-- 1. USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'supervisor', 'agent', 'client') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLIENTS
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    notes TEXT,
    created_by INT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. SUPPLIERS
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    cost_structure TEXT,
    notes TEXT
);

-- NEW: PRODUCT TYPES
CREATE TABLE product_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- 4. PRODUCTS
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    product_type_id INT,
    product_name VARCHAR(255) NOT NULL,
    ownership ENUM('RENTED', 'OWNED'),
    warranty BOOLEAN DEFAULT false,
    cost DECIMAL(10, 2) NOT NULL,
    roi_target DECIMAL(10, 2) DEFAULT 0,
    renewable BOOLEAN DEFAULT false,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (product_type_id) REFERENCES product_types(id)
);

-- NEW: SALES ATTRIBUTES (VARIANTS)
CREATE TABLE sales_attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    duration_days INT NOT NULL,
    capacity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. INVENTORY (ACCOUNTS)
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('available', 'assigned', 'maintenance') DEFAULT 'available',
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 6. INVENTORY_PROFILES (SLOTS)
CREATE TABLE inventory_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    profile_name VARCHAR(255) NOT NULL,
    status ENUM('available', 'assigned') DEFAULT 'available',
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- 7. SALES
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    agent_id INT NOT NULL,
    profile_id INT NOT NULL,
    sales_attribute_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('active', 'expired', 'pending', 'cancelled') DEFAULT 'pending',
    cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (agent_id) REFERENCES users(id),
    FOREIGN KEY (profile_id) REFERENCES inventory_profiles(id),
    FOREIGN KEY (sales_attribute_id) REFERENCES sales_attributes(id)
);

-- 8. TICKETS
CREATE TABLE tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    client_id INT,
    type ENUM('request_account','issue','renewal_request','other') NOT NULL,
    priority ENUM('low','medium','high') DEFAULT 'medium',
    description TEXT NOT NULL,
    status ENUM('open','pending','assigned','closed') DEFAULT 'open',
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- 9. NOTIFICATIONS
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('TICKET', 'SALE', 'ACCOUNT', 'SYSTEM') NOT NULL,
    `read` BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. LOGS
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- --- INDEXES FOR PERFORMANCE ---
-- Index on foreign keys and commonly queried columns

CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_profiles_inventory_id ON inventory_profiles(inventory_id);
CREATE INDEX idx_sales_client_id ON sales(client_id);
CREATE INDEX idx_sales_agent_id ON sales(agent_id);
CREATE INDEX idx_sales_profile_id ON sales(profile_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_client_id ON tickets(client_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);


-- 11. FINANCE MOVEMENTS
CREATE TABLE finance_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('INCOME','EXPENSE') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    source ENUM('SALE','PURCHASE','OPERATIONAL','OTHER') NOT NULL,
    reference_id INT,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 12. EXPENSES
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('SUPPLIER','OPERATIONS','TEAM_PAYMENT','OTHER') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 13. AGENT PERFORMANCE
CREATE TABLE agent_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    date DATE NOT NULL,
    sales_count INT DEFAULT 0,
    revenue_generated DECIMAL(10, 2) DEFAULT 0,
    attendance ENUM('PRESENT','ABSENT','LATE') NOT NULL,
    notes TEXT,
    UNIQUE(agent_id, date),
    FOREIGN KEY (agent_id) REFERENCES users(id)
);

-- 14. CASHBOX
CREATE TABLE cashbox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    movement_type ENUM('ADD','REMOVE') NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Add new indexes
CREATE INDEX idx_finance_movements_created_by ON finance_movements(created_by);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);
CREATE INDEX idx_agent_performance_agent_id ON agent_performance(agent_id);
CREATE INDEX idx_cashbox_created_by ON cashbox(created_by);

-- 15. AGENT ATTENDANCE
CREATE TABLE agent_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT') NOT NULL,
    comments TEXT,
    UNIQUE(agent_id, date),
    FOREIGN KEY (agent_id) REFERENCES users(id)
);

CREATE INDEX idx_agent_attendance_agent_id ON agent_attendance(agent_id);

-- 16. AUDIT LOGS
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(100),
    entity_id INT,
    before_state JSON,
    after_state JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
