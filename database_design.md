# Database Design – Shiv Accounts Pro (PS-2)

## **1. Foundational Tables**

| Table             | Description                                                      | Key Columns                                                                |
| ----------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **organizations** | Multi-tenancy support – each company using the system is an org. | `id`, `name`, `created_at`                                                 |
| **users**         | Users tied to organizations with unique email per org.           | `id`, `organization_id`, `email`, `password_hash`, `is_active`, timestamps |

---

## **2. Master Data Tables**

| Table                   | Description                                   | Key Columns                                                                                                                 |
| ----------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **chart\_of\_accounts** | Ledger accounts for financial classification. | `id`, `organization_id`, `account_name`, `account_type (Asset/Liability/Equity/Income/Expense)`, `account_code`             |
| **taxes**               | Tax master for sales/purchase (% or fixed).   | `id`, `organization_id`, `tax_name`, `rate_percent`, `computation_method`                                                   |
| **contacts**            | Customers, Vendors, or Both.                  | `id`, `organization_id`, `name`, `type (Customer/Vendor/Both)`, `email`, `mobile`                                           |
| **addresses**           | Linked addresses for contacts.                | `id`, `contact_id`, `address_type (Billing/Shipping)`, `city`, `state`, `pincode`                                           |
| **products**            | Goods/Services catalog.                       | `id`, `organization_id`, `name`, `type (Goods/Service)`, `sku`, `sales_price`, `purchase_price`, `hsn_code`, `sales_tax_id` |

---

## **3. Transaction Flow Tables**

| Table                        | Description              | Key Columns                                                                                                                                                                             |
| ---------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **sales\_orders**            | Customer orders (SO).    | `id`, `organization_id`, `contact_id`, `order_date`, `status (Draft/Confirmed/Invoiced/Cancelled)`, `subtotal`, `total_tax`, `total_amount`                                             |
| **sales\_order\_lines**      | Line items for SO.       | `id`, `sales_order_id`, `product_id`, `quantity`, `unit_price`                                                                                                                          |
| **customer\_invoices**       | Invoices linked to SO.   | `id`, `organization_id`, `contact_id`, `sales_order_id`, `invoice_date`, `due_date`, `status (Draft/Awaiting Payment/Paid/Void)`, `subtotal`, `total_tax`, `total_amount`, `amount_due` |
| **customer\_invoice\_lines** | Line items for invoices. | `id`, `invoice_id`, `product_id`, `quantity`, `unit_price`                                                                                                                              |

---

## **4. Accounting Ledger (Core Engine)**

| Table                     | Description                                      | Key Columns                                                                            |
| ------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **journal\_entries**      | Each transaction entry (e.g., invoice, payment). | `id`, `organization_id`, `entry_date`, `description`, `reference_type`, `reference_id` |
| **journal\_entry\_lines** | Debit/Credit lines for each JE.                  | `id`, `journal_entry_id`, `account_id`, `debit`, `credit`, `description`               |

**Double-entry enforced**: Each JE has ≥1 debit + ≥1 credit.

---

## **5. Payments**

| Table                  | Description                         | Key Columns                                                                                                                          |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **customer\_payments** | Payments received against invoices. | `id`, `organization_id`, `contact_id`, `invoice_id`, `payment_date`, `amount`, `bank_account_id (Cash/Bank CoA)`, `journal_entry_id` |

---

# Relationships Summary

* **organizations → users, chart\_of\_accounts, taxes, contacts, products, sales\_orders, customer\_invoices, journal\_entries, customer\_payments** (1\:N).
* **contacts → addresses** (1\:N).
* **contacts → sales\_orders, customer\_invoices, customer\_payments** (1\:N).
* **products → sales\_order\_lines, customer\_invoice\_lines** (1\:N).
* **sales\_orders → sales\_order\_lines, customer\_invoices** (1\:N).
* **customer\_invoices → customer\_invoice\_lines, customer\_payments** (1\:N).
* **journal\_entries → journal\_entry\_lines** (1\:N).
* **customer\_payments → journal\_entries** (1:1 mapping link).

---

# ERD (Text Representation)

```
organizations ──< users
organizations ──< chart_of_accounts ──< journal_entry_lines
organizations ──< taxes
organizations ──< contacts ──< addresses
organizations ──< products
organizations ──< sales_orders ──< sales_order_lines
organizations ──< customer_invoices ──< customer_invoice_lines
sales_orders ──< customer_invoices
contacts ──< sales_orders
contacts ──< customer_invoices
contacts ──< customer_payments
customer_invoices ──< customer_payments
journal_entries ──< journal_entry_lines
```

# MySQL Code

```
-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS shiv_accounts_pro;
USE shiv_accounts_pro;

-- =================================================================
-- 1. FOUNDATIONAL TABLES
-- =================================================================

-- To support multiple businesses (multi-tenancy)
CREATE TABLE `organizations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users belong to an organization
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100),
    `last_name` VARCHAR(100),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_org_email` (`organization_id`, `email`),
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);


-- =================================================================
-- 2. MASTER DATA TABLES (As per the document)
-- =================================================================

-- Chart of Accounts Master
CREATE TABLE `chart_of_accounts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `account_name` VARCHAR(255) NOT NULL,
    `account_type` ENUM('Asset', 'Liability', 'Equity', 'Income', 'Expense') NOT NULL,
    `account_code` VARCHAR(20),
    `is_active` BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_account_org_name` (`organization_id`, `account_name`)
);

-- Tax Master
CREATE TABLE `taxes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `tax_name` VARCHAR(100) NOT NULL,
    `rate_percent` DECIMAL(5, 2) NOT NULL,
    `computation_method` ENUM('Percentage', 'Fixed') DEFAULT 'Percentage',
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE
);

-- Contact Master (Customers/Vendors)
CREATE TABLE `contacts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('Customer', 'Vendor', 'Both') NOT NULL,
    `email` VARCHAR(255),
    `mobile` VARCHAR(20),
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
    INDEX `idx_contact_name` (`name`)
);

-- Normalized table for addresses
CREATE TABLE `addresses` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `contact_id` INT NOT NULL,
    `address_type` ENUM('Billing', 'Shipping') NOT NULL,
    `city` VARCHAR(100),
    `state` VARCHAR(100),
    `pincode` VARCHAR(10),
    FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON DELETE CASCADE
);

-- Product Master
CREATE TABLE `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('Goods', 'Service') NOT NULL,
    `sku` VARCHAR(100) UNIQUE,
    `sales_price` DECIMAL(10, 2) NOT NULL,
    `purchase_price` DECIMAL(10, 2) NOT NULL,
    `hsn_code` VARCHAR(50),
    `sales_tax_id` INT,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sales_tax_id`) REFERENCES `taxes`(`id`) ON DELETE SET NULL
);


-- =================================================================
-- 3. TRANSACTION FLOW TABLES (As per the document)
-- =================================================================

-- Sales Orders and their line items
CREATE TABLE `sales_orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `contact_id` INT NOT NULL,
    `order_date` DATE NOT NULL,
    `status` ENUM('Draft', 'Confirmed', 'Invoiced', 'Cancelled') NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `total_tax` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`),
    FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`)
);
CREATE TABLE `sales_order_lines` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sales_order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);

-- Customer Invoices and their line items
CREATE TABLE `customer_invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `contact_id` INT NOT NULL,
    `sales_order_id` INT,
    `invoice_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM('Draft', 'Awaiting Payment', 'Paid', 'Void') NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `total_tax` DECIMAL(10, 2) NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `amount_due` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`),
    FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`),
    FOREIGN KEY (`sales_order_id`) REFERENCES `sales_orders`(`id`) ON DELETE SET NULL,
    INDEX `idx_invoice_status` (`status`)
);
CREATE TABLE `customer_invoice_lines` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`invoice_id`) REFERENCES `customer_invoices`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);


-- =================================================================
-- 4. ACCOUNTING LEDGER (The Core Engine)
-- =================================================================

-- A Journal Entry represents a single financial transaction
CREATE TABLE `journal_entries` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `entry_date` DATE NOT NULL,
    `description` VARCHAR(255),
    `reference_type` VARCHAR(50), -- e.g., 'CustomerInvoice', 'Payment'
    `reference_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`),
    INDEX `idx_reference` (`reference_type`, `reference_id`)
);

-- Each Journal Entry has multiple lines (at least one debit, one credit)
CREATE TABLE `journal_entry_lines` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `journal_entry_id` INT NOT NULL,
    `account_id` INT NOT NULL,
    `debit` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `credit` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `description` VARCHAR(255),
    FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts`(`id`),
    CHECK (`debit` >= 0 AND `credit` >= 0)
);

-- =================================================================
-- 5. PAYMENTS
-- =================================================================

CREATE TABLE `customer_payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id` INT NOT NULL,
    `contact_id` INT NOT NULL,
    `invoice_id` INT NOT NULL,
    `payment_date` DATE NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `bank_account_id` INT NOT NULL, -- The 'Cash' or 'Bank' account from CoA
    `journal_entry_id` INT,
    FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`),
    FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`),
    FOREIGN KEY (`invoice_id`) REFERENCES `customer_invoices`(`id`),
    FOREIGN KEY (`bank_account_id`) REFERENCES `chart_of_accounts`(`id`),
    FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`)
);
```