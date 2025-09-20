# Roadmap: Cloud Accounting System (PS-2)

### **Phase 1 – Setup & Cloud Foundation (0–3 hrs)**

* **Backend**:

  * Initialize **Node.js + Express** (or FastAPI if Python route).
  * Setup REST API structure.
  * Configure **Postgres/MySQL** as DB.
* **Frontend**:

  * Basic layout with HTML + CSS + JS.
  * Navigation: Dashboard, Contacts, Products, Transactions, Reports.
* **Cloud Deployment**:

  * Early deploy on **AWS** for live testing.

---

### **Phase 2 – Core Modules (3–8 hrs)**

* **Master Data APIs**:

  * `/contacts` → CRUD
  * `/products` → CRUD
  * `/chart-of-accounts` → CRUD
* **Frontend Forms**:

  * Simple HTML forms + JS fetch() → APIs.
* **Seed Demo Data**:

  * 5 customers, 5 vendors, 5 products.

---

### **Phase 3 – Transactions (8–14 hrs)**

* **Sales Flow**:

  * API routes: `/sales-orders`, `/invoices`, `/payments`.
  * UI flow: Create SO → Convert to Invoice → Mark Payment.
* **(Optional)** Purchase Flow:

  * `/purchase-orders`, `/vendor-bills`, `/payments`.

---

### **Phase 4 – Reports & Dashboard (14–18 hrs)**

* **Backend Queries**:

  * `/reports/pnl` → Profit & Loss.
  * `/reports/balance-sheet` → Assets/Liabilities/Equity.
  * `/reports/stock` → Stock movement.
* **Frontend Dashboard**:

  * KPI cards → Total Sales, Expenses, Profit, Outstanding.
  * Charts → Use **Chart.js** (via CDN).

---

### **Phase 5 – AI Integrations (18–21 hrs)**

* **AI Assistant**:

  * `/ai/query` → Natural language → returns data.
  * MVP: Rule-based mapping for profit/expenses/outstanding.
  * Upgrade: LangChain + OpenAI/Mistral for NL → SQL.
* **AI Summaries**:

  * Auto-generate plain-English daily/weekly financial reports.

---

### **Phase 6 – Role-Based Access & Portal (21–22 hrs)**

* **Backend**:

  * JWT authentication for Admin, Accountant, Customer.
* **Frontend**:

  * Admin → Dashboard + full access.
  * Customer/Vendor → Only their invoices/bills.

---

### **Phase 7 – Final Polish & Demo Prep (22–24 hrs)**

* UI cleanup (Bootstrap/Tailwind via CDN).
* Seed final sample data.
* Demo script:

  1. Login → Dashboard (KPIs + charts).
  2. Add Contact & Product.
  3. Create Sales Order → Convert to Invoice → Mark Paid.
  4. Show updated P\&L + Balance Sheet.
  5. Ask AI Assistant → “What’s my profit this month?”
