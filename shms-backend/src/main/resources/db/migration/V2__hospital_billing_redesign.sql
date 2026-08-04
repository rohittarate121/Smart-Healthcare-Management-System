-- ====================================================================
-- MIGRATION SCRIPT: V2__hospital_billing_redesign.sql
-- Description: Hospital Real-Time Billing Lifecycle & Invoicing Engine
-- ====================================================================

-- 1. Billing Accounts
CREATE TABLE IF NOT EXISTS billing_accounts (
    account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id BIGINT UNIQUE NOT NULL,
    patient_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, CANCELLED
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- 2. Billing Charges (Auto & Manual Charge Log)
CREATE TABLE IF NOT EXISTS billing_charges (
    charge_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    charge_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- ROOM, DOCTOR_CONSULTATION, MEDICINE, LABORATORY, RADIOLOGY, OPERATION, ICU, NURSING, INJECTION, EMERGENCY, AMBULANCE, EQUIPMENT, MISCELLANEOUS
    amount DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    charge_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id BIGINT,
    notes VARCHAR(255),
    FOREIGN KEY (account_id) REFERENCES billing_accounts(account_id) ON DELETE CASCADE
);

-- 3. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    account_id BIGINT NOT NULL,
    admission_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    gst_percentage DECIMAL(5,2) DEFAULT 0.00,
    gst_amount DECIMAL(10,2) DEFAULT 0.00,
    grand_total DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    due_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, PARTIAL, PAID, CANCELLED
    payment_method VARCHAR(50),
    pdf_path VARCHAR(255),
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES billing_accounts(account_id),
    FOREIGN KEY (admission_id) REFERENCES admissions(admission_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- 4. Invoice Item Breakdown
CREATE TABLE IF NOT EXISTS invoice_items (
    item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    charge_id BIGINT,
    description VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- 5. Payment Transaction History
CREATE TABLE IF NOT EXISTS payment_records (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- CASH, UPI, CARD, NET_BANKING, INSURANCE
    transaction_ref VARCHAR(100) UNIQUE NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255),
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);
