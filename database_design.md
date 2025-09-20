# Database Design — Shiv Accounts Pro (MySQL)

**DBMS:** MySQL 8.0+ (InnoDB, utf8mb4)

This document contains the full database design for the cloud-based accounting system **Shiv Accounts Pro**. The schema is designed for **multi-tenancy**, **double-entry accounting**, and **scalability**.

---

## 1. Foundational Tables

```sql
CREATE TABLE organizations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid_char CHAR(36) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(64) DEFAULT 'UTC',
  currency CHAR(3) DEFAULT 'INR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active TINYINT(1) DEFAULT 1,
  UNIQUE KEY uk_org_uuid (uuid_char)
);

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  uuid_char CHAR(36) DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(30),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  UNIQUE KEY uk_user_org_email (organization_id, email),
  CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE roles (
  id SMALLINT UNSIGNED PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id SMALLINT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

---

## 2. Master Data

```sql
CREATE TABLE contacts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  uuid_char CHAR(36) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  contact_type ENUM('Customer','Vendor','Both') NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  gstin VARCHAR(32),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contacts_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contact_id BIGINT UNSIGNED NOT NULL,
  address_type ENUM('Billing','Shipping') NOT NULL,
  line1 VARCHAR(255),
  line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addr_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE TABLE taxes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  rate DECIMAL(7,4) NOT NULL,
  computation_method ENUM('Percentage','Fixed') DEFAULT 'Percentage',
  is_active TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_taxes_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(128),
  product_type ENUM('Goods','Service') NOT NULL DEFAULT 'Goods',
  sales_price DECIMAL(14,2) DEFAULT 0,
  purchase_price DECIMAL(14,2) DEFAULT 0,
  hsn_code VARCHAR(64),
  sales_tax_id BIGINT UNSIGNED,
  inventory_managed TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_tax FOREIGN KEY (sales_tax_id) REFERENCES taxes(id)
);

CREATE TABLE chart_of_accounts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  account_code VARCHAR(50),
  account_name VARCHAR(255) NOT NULL,
  account_type ENUM('Asset','Liability','Equity','Income','Expense') NOT NULL,
  parent_account_id BIGINT UNSIGNED,
  is_bank_account TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_coa_org_name (organization_id, account_name),
  CONSTRAINT fk_coa_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_coa_parent FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL
);
```

---

## 3. Document Sequences

```sql
CREATE TABLE document_sequences (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  doc_type VARCHAR(20) NOT NULL,
  prefix VARCHAR(50),
  next_val BIGINT UNSIGNED NOT NULL DEFAULT 1,
  format_mask VARCHAR(255) DEFAULT '{prefix}/{year}/{seq:06d}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_seq_org_type (organization_id, doc_type),
  CONSTRAINT fk_seq_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
```

---

## 4. Sales & Purchases

```sql
CREATE TABLE sales_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  contact_id BIGINT UNSIGNED NOT NULL,
  document_number VARCHAR(100),
  order_date DATE NOT NULL,
  status ENUM('Draft','Confirmed','Invoiced','Cancelled') DEFAULT 'Draft',
  subtotal DECIMAL(14,2) DEFAULT 0,
  total_tax DECIMAL(14,2) DEFAULT 0,
  total_amount DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_so_org_doc (organization_id, document_number),
  CONSTRAINT fk_so_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_so_contact FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE sales_order_lines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sales_order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED,
  qty DECIMAL(14,3) DEFAULT 1,
  unit_price DECIMAL(14,2) DEFAULT 0,
  tax_id BIGINT UNSIGNED,
  line_total DECIMAL(14,2),
  CONSTRAINT fk_sol_order FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_sol_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_sol_tax FOREIGN KEY (tax_id) REFERENCES taxes(id)
);
```

(Same structure for `purchase_orders` and `purchase_order_lines`.)

---

## 5. Invoices & Bills

```sql
CREATE TABLE invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  contact_id BIGINT UNSIGNED NOT NULL,
  sales_order_id BIGINT UNSIGNED,
  document_number VARCHAR(100),
  invoice_date DATE NOT NULL,
  due_date DATE,
  status ENUM('Draft','AwaitingPayment','Paid','Void') DEFAULT 'Draft',
  subtotal DECIMAL(14,2) DEFAULT 0,
  total_tax DECIMAL(14,2) DEFAULT 0,
  total_amount DECIMAL(14,2) DEFAULT 0,
  amount_due DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_inv_org_doc (organization_id, document_number),
  CONSTRAINT fk_inv_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
  CONSTRAINT fk_inv_so FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL
);

CREATE TABLE invoice_lines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED,
  qty DECIMAL(14,3) DEFAULT 1,
  unit_price DECIMAL(14,2) DEFAULT 0,
  tax_id BIGINT UNSIGNED,
  line_total DECIMAL(14,2),
  CONSTRAINT fk_il_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_il_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_il_tax FOREIGN KEY (tax_id) REFERENCES taxes(id)
);
```

(`vendor_bills` mirrors `invoices`.)

---

## 6. Payments

```sql
CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  contact_id BIGINT UNSIGNED NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  payment_method VARCHAR(50),
  bank_account_coa_id BIGINT UNSIGNED,
  reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
  CONSTRAINT fk_pay_bank_coa FOREIGN KEY (bank_account_coa_id) REFERENCES chart_of_accounts(id)
);

CREATE TABLE payment_allocations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NOT NULL,
  invoice_id BIGINT UNSIGNED,
  vendor_bill_id BIGINT UNSIGNED,
  allocated_amount DECIMAL(14,2) NOT NULL,
  CONSTRAINT fk_pa_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  CONSTRAINT fk_pa_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
```

---

## 7. Accounting Ledger

```sql
CREATE TABLE journal_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  entry_date DATE NOT NULL,
  description VARCHAR(512),
  reference_type VARCHAR(50),
  reference_id BIGINT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_je_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE journal_lines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  journal_entry_id BIGINT UNSIGNED NOT NULL,
  account_id BIGINT UNSIGNED NOT NULL,
  debit DECIMAL(18,2) DEFAULT 0,
  credit DECIMAL(18,2) DEFAULT 0,
  description VARCHAR(512),
  CONSTRAINT fk_jl_je FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  CONSTRAINT fk_jl_account FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id)
);
```

---

## 8. Stock Movements

```sql
CREATE TABLE stock_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  reference_type VARCHAR(50),
  reference_id BIGINT UNSIGNED,
  movement_date DATE NOT NULL,
  qty DECIMAL(18,3) NOT NULL,
  location VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_prod FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_stock_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
```

---

## 9. Attachments

```sql
CREATE TABLE attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED NOT NULL,
  owner_table VARCHAR(64) NOT NULL,
  owner_id BIGINT UNSIGNED NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  storage_key VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_att_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
```

---

## 10. Audit Logs

```sql
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  organization_id BIGINT UNSIGNED,
  table_name VARCHAR(128) NOT NULL,
  record_id BIGINT UNSIGNED,
  operation ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  changed_by BIGINT UNSIGNED,
  change_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 11. Reporting (Aggregates)

```sql
CREATE TABLE partner_balances (
  organization_id BIGINT UNSIGNED NOT NULL,
  contact_id BIGINT UNSIGNED NOT NULL,
  outstanding_amount DECIMAL(18,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (organization_id, contact_id),
  CONSTRAINT fk_pb_contact FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);
```

---

## Notes

* All foreign keys use **InnoDB** constraints for referential integrity.
* Composite indexes (e.g., `(organization_id, status)`) should be added for queries.
* Partitioning can be added on `journal_entries`, `invoices`, and `stock_movements` as data grows.
* Reports such as **P\&L** and **Balance Sheet** will query `journal_lines` grouped by `account_type`.