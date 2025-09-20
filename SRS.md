# Software Requirements Specification (SRS)

**Project:** Shiv Accounts Pro – Cloud Accounting System
**Version:** 1.0
**Date:** September 20, 2025
**Prepared by:** Triverge

---

## 1. Introduction

### 1.1 Purpose

The purpose of this SRS is to define the requirements for a cloud-based accounting system tailored for small and medium businesses, starting with Shiv Furniture as the reference organization. The system will manage master data, sales and purchase flows, invoices, payments, and generate accounting and inventory reports. It will also integrate AI-driven features for natural language queries and report summarization.

### 1.2 Scope

The system will be a multi-tenant, cloud-hosted web application that allows multiple organizations to maintain their financial and inventory records independently.
Key functionalities include:

* Master data management: Contacts, Products, Taxes, Chart of Accounts.
* Transaction management: Sales Orders, Invoices, Purchase Orders, Bills, Payments.
* Financial reporting: Balance Sheet, Profit & Loss, Stock Reports.
* AI-powered assistance: natural language financial queries and auto-generated summaries.
* Role-based access: Admin, Accountant, and Customer/Vendor portals.

The system will be accessible via modern browsers, built with Node.js/FastAPI backend and HTML/CSS/JavaScript frontend.

### 1.3 Definitions, Acronyms, and Abbreviations

* **SO** – Sales Order
* **PO** – Purchase Order
* **CoA** – Chart of Accounts
* **P\&L** – Profit and Loss Statement
* **AI Assistant** – Module that enables natural language queries and automated reporting

### 1.4 References

* Hackathon Problem Statement Document – Shiv Accounts Cloud
* Database Schema Design (See Design Document)

---

## 2. Overall Description

### 2.1 Product Perspective

The product is a standalone SaaS-style cloud accounting system. It follows a modular design:

* **Master Data Layer**: Organizations, Users, Products, Contacts, CoA.
* **Transaction Layer**: Sales Orders, Invoices, Payments.
* **Accounting Layer**: Journal Entries, Ledger.
* **Analytics Layer**: Reports and AI Assistant.

### 2.2 Product Functions

* Manage organization master data (Contacts, Products, CoA, Taxes).
* Record sales orders and generate customer invoices.
* Record purchase orders and vendor bills.
* Accept and track customer payments.
* Maintain accounting entries with double-entry bookkeeping.
* Generate financial and inventory reports.
* Provide AI-driven natural language queries and financial summaries.

### 2.3 User Classes and Characteristics

* **Admin (Business Owner)**: Full system access, can create/modify master data, transactions, and reports.
* **Accountant**: Can manage transactions and generate reports.
* **Customer/Vendor**: Restricted access to their invoices/bills and payment history.

### 2.4 Operating Environment

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: Node.js (Express) or Python (FastAPI)
* **Database**: MySQL/PostgreSQL
* **Deployment**: Cloud (Heroku, Render, AWS, or equivalent)
* **Browser Support**: Chrome, Edge, Firefox, Safari

### 2.5 Design and Implementation Constraints

* Must be deployed as a cloud-based system accessible via browser.
* Database must support multi-tenancy for multiple organizations.
* Must follow double-entry accounting principles.
* Hackathon constraint: working MVP within 24 hours.

### 2.6 Assumptions and Dependencies

* Users will have reliable internet connectivity.
* External AI APIs (e.g., OpenAI, LangChain) will be available and responsive.
* Tax and compliance rules are simplified for MVP demonstration.

---

## 3. Specific Requirements

### 3.1 Functional Requirements

1. **Master Data Management**

   * FR-1: System shall allow CRUD operations on Contacts, Products, Taxes, and Chart of Accounts.
   * FR-2: System shall support multiple addresses per contact (billing, shipping).

2. **Sales and Purchases**

   * FR-3: System shall allow creation of Sales Orders and their conversion to Customer Invoices.
   * FR-4: System shall allow creation of Purchase Orders and their conversion to Vendor Bills.
   * FR-5: System shall support status transitions for SOs and Invoices (Draft → Confirmed → Paid).

3. **Payments**

   * FR-6: System shall allow recording of customer payments against invoices.
   * FR-7: System shall automatically update accounting ledger entries upon payment.

4. **Accounting Ledger**

   * FR-8: System shall record all financial transactions as Journal Entries.
   * FR-9: Each Journal Entry shall have at least one debit and one credit line.

5. **Reporting**

   * FR-10: System shall generate Profit & Loss statements.
   * FR-11: System shall generate Balance Sheets.
   * FR-12: System shall generate Stock/Inventory reports.
   * FR-13: System shall provide partner-ledger reports (per customer/vendor).

6. **AI Features**

   * FR-14: System shall allow natural language queries mapped to financial data.
   * FR-15: System shall auto-generate plain English daily/weekly summaries.

7. **Security & Roles**

   * FR-16: System shall provide role-based access control (Admin, Accountant, Customer/Vendor).
   * FR-17: System shall encrypt user passwords.

---

### 3.2 Non-Functional Requirements

* **Performance**: System shall support at least 50 concurrent users per organization.
* **Availability**: 99% uptime expected during demo.
* **Scalability**: Architecture should allow adding more organizations with isolated data.
* **Security**: Passwords stored as hashes; JWT-based authentication.
* **Usability**: Simple UI with intuitive navigation and clear reports.
* **Portability**: Cloud-deployed, accessible from any modern browser.

---

## 4. System Models

### 4.1 Database Design

See database schema design document (includes organizations, users, master data, transactions, journal entries, and payments).

### 4.2 Process Flow

1. Admin adds master data (Contacts, Products, CoA).
2. Accountant creates a Sales Order → Invoice → Records Payment.
3. System automatically generates Journal Entries.
4. Reports update dynamically.
5. AI Assistant provides insights via chat queries.

---

## 5. Appendices

* **Mockups**: Excalidraw diagrams provided in problem statement.
* **Glossary**:

  * Sales Order (SO): Customer order record.
  * Invoice: Document requesting payment from customer.
  * Journal Entry: Core accounting transaction.
  * Chart of Accounts: Master list of ledger accounts.
