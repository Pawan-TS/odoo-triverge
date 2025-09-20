# Backend Specification — Shiv Accounts Cloud (Updated with Accounting Details & HSN API)

**Target stack:** Node.js + Express (or FastAPI), MySQL 8.0+, object storage (S3), Redis, worker (Bull/Redis or Celery/RQ), Docker/Kubernetes.

This document expands the backend design previously produced, **incorporating the extra accounting notes** you shared (CoA, P\&L, SO/PO, Vendor Bill, HSN) and the **HSN lookup API**. It provides a complete backend plan: data model considerations, REST API endpoints (purpose + payloads), integration strategy for HSN lookup, accounting engine rules, reporting queries & views, operational requirements, and MVP prioritization.

---

# Table of contents

1. Goals & principles
2. Key business rules derived from problem statement & SVG notes
3. Data model highlights (summary)
4. API endpoints (complete list grouped by module)
5. HSN lookup integration (design + caching + error handling)
6. Accounting engine rules & journal templates
7. Reporting queries & materialized tables (P\&L, Balance Sheet, Partner Ledger, Stock)
8. Transactions & workflows (detailed step-by-step for SO→Invoice→Payment and PO→Bill→Payment)
9. Background jobs, caching, and async tasks
10. Security, multi-tenancy, audit, idempotency
11. Deployment & operational notes
12. MVP priority list (what to implement first)
13. Appendix: example API payloads, SQL snippets, and sequence operations

---

# 1. Goals & Principles

* **Accurate accounting**: All financial changes must create double-entry journal entries.
* **Traceability & auditability**: Every change to key financial objects (Invoice, Bill, Payment, Journal Entry) is logged in `audit_logs` with who/when/what.
* **Multi-tenant**: `organization_id` on transactional and master tables. All endpoints must validate tenant context.
* **HSN support**: Products include HSN codes; provide HSN lookup via the provided government API and cache results.
* **API-first**: REST endpoints for all operations; frontend (HTML/JS) consumes these.
* **Scalable reporting**: Heavy aggregations via materialized (refreshable) aggregates / caches / read-replicas.

---

# 2. Key business rules

* **Master data**: Contacts (Customer/Vendor/Both), Products (Goods/Service) must include HSN for goods.
* **Document flows**: SO → Invoice → Payment; PO → Vendor Bill → Payment. Conversions preserve link to origin documents.
* **Journal creation**:

  * Customer Invoice: Dr Accounts Receivable (AR) → Cr Sales Income; record Tax payable lines.
  * Vendor Bill: Dr Purchase/Inventory / Expense → Cr Accounts Payable (AP); record Tax reclaimable lines.
  * Payments: Dr Bank/Cash → Cr AR/AP.
* **Partner Ledger**: must show chronological invoices, bills, payments, and running balance.
* **Stock & valuation**: stock movements for Goods on Inward/Outward; valuation method = Weighted Average (MVP).
* **Document numbering**: organization-configurable sequences (document\_sequences) used in a concurrency-safe manner.
* **Invoicing user**: role-level restriction — can create transactions but cannot change master data (enforced via authorization).
* **Contact portal**: contacts can only see their own invoices/bills and make payments.

---

# 3. Data Model Highlights (summary)

*(Full DDL exists in repo `DATABASE_DESIGN.md` — reuse with MySQL definitions.)* Key tables used by endpoints:

* `organizations`
* `users`, `roles`, `user_roles`
* `contacts`, `addresses`
* `products`, `taxes`, `chart_of_accounts`
* `document_sequences`
* `sales_orders`, `sales_order_lines`
* `invoices`, `invoice_lines`
* `purchase_orders`, `purchase_order_lines`
* `vendor_bills`, `vendor_bill_lines`
* `payments`, `payment_allocations`
* `journal_entries`, `journal_lines`
* `stock_movements`, `product_stock` (aggregate)
* `attachments`
* `audit_logs`
* `partner_balances` (aggregate table)

**Important**: ensure `organization_id` present and indexed on all tables.

---

# 4. API Endpoints (module-wise)

> All endpoints are **tenant-scoped** — `X-Org-Id` header (or JWT contains `org_id`). All responses use JSON. Standard 401/403/404/422 errors. Use pagination for lists.

## Auth

* `POST /api/v1/auth/signup` — create organization + admin (returns org\_id, user token).
* `POST /api/v1/auth/login` — returns JWT.
* `POST /api/v1/auth/refresh` — refresh token.
* `POST /api/v1/auth/forgot-password` — OTP flow.
* `POST /api/v1/auth/reset-password` — reset with OTP.

## Users & Roles

* `GET /api/v1/users` — list users (admin only).
* `POST /api/v1/users` — create user (admin). On contact creation, create contact user if requested.
* `PUT /api/v1/users/:userId` — update.
* `GET /api/v1/roles` — list roles (seeded).

## Master Data — Contacts

* `GET /api/v1/contacts` — list (filter by type).
* `POST /api/v1/contacts` — create (if `create_user=true` option, also creates a user with `Customer` role).
* `GET /api/v1/contacts/:id` — detail.
* `PUT /api/v1/contacts/:id` — update.
* `DELETE /api/v1/contacts/:id` — soft delete.
* `GET /api/v1/contacts/:id/ledger?from=&to=&type=` — partner ledger (paginated) — returns invoices, bills, payments, allocations, running balance.

## Master Data — Products

* `GET /api/v1/products` — list (search by name, SKU, HSN).
* `POST /api/v1/products` — create (accepts `hsn_code` or will call HSN API if missing and `hsn_lookup=true`).
* `GET /api/v1/products/:id`
* `PUT /api/v1/products/:id`
* `DELETE /api/v1/products/:id`
* `GET /api/v1/products/:id/stock` — current stock & movements (uses `product_stock` aggregate if available).

## Master Data — Taxes & CoA

* `GET /api/v1/taxes`, `POST /api/v1/taxes`, `PUT/PATCH`, `DELETE`
* `GET /api/v1/chart-of-accounts`, `POST /api/v1/chart-of-accounts`, `PUT/PATCH`, `DELETE`
* `GET /api/v1/chart-of-accounts/:id/balance?as_of=` — account balance.

## Document Sequences (admin)

* `GET /api/v1/document-sequences`
* `POST /api/v1/document-sequences`
* `PUT /api/v1/document-sequences/:id`

## Sales Flow

* `POST /api/v1/sales-orders` — create SO. Body: customer\_id, lines \[{product\_id, qty, unit\_price, tax\_id}], currency, notes. Server calculates subtotal, tax, total. Generates document\_number if requested.
* `GET /api/v1/sales-orders/:id`
* `PUT /api/v1/sales-orders/:id` — only editable in Draft.
* `POST /api/v1/sales-orders/:id/confirm` — sets status=Confirmed.
* `POST /api/v1/sales-orders/:id/generate-invoice` — converts SO → Invoice (atomic transaction). Returns created invoice id & document\_number.

## Invoices & Customer Payments

* `GET /api/v1/invoices` — list + filters (status, date range, contact\_id).
* `GET /api/v1/invoices/:id`
* `POST /api/v1/invoices` — create directly or created via SO conversion.
* `POST /api/v1/invoices/:id/record-payment` — create `payments` + allocations (idempotent token supported). Body includes payment\_method, amount, bank\_coa\_id, reference. System creates journal entries and updates invoice.amount\_due; if fully paid, status=Paid.
* `POST /api/v1/invoices/:id/attachments` — upload invoice PDF.

## Purchase Flow & Vendor Bills

* `POST /api/v1/purchase-orders` — create PO.
* `POST /api/v1/purchase-orders/:id/convert-to-bill` — create vendor\_bill.
* `GET /api/v1/vendor-bills/:id`
* `POST /api/v1/vendor-bills/:id/record-payment` — vendor payment.

## Payments (generic)

* `GET /api/v1/payments` — list.
* `GET /api/v1/payments/:id` — detail.
* `POST /api/v1/payments` — create (supports pre-allocations via `allocations` array linking to invoices/bills) — server will create `payment_allocations` and `journal_entry` atomically.

## Journal & Ledger

* `GET /api/v1/journal-entries` — list (admin/accountant only). Filters: date range, ref\_type.
* `GET /api/v1/journal-entries/:id`
* `POST /api/v1/journal-entries` — admin only (for manual adjustments). Must enforce balanced entries.

## Stock

* `GET /api/v1/stock-movements` — list / filter by product/date.
* `POST /api/v1/stock-adjustments` — manual stock adjustments (creates movement & journal entry if valuation is monetary).

## Reporting & Dashboard

* `GET /api/v1/reports/pnl?start=YYYY-MM-DD&end=YYYY-MM-DD` — returns income/expense buckets and totals. (Uses aggregated journal lines)
* `GET /api/v1/reports/balance-sheet?as_of=YYYY-MM-DD` — returns assets/liabilities/equity breakdown.
* `GET /api/v1/reports/stock?product_id=&from=&to=` — stock movement & valuation.
* `GET /api/v1/reports/partner-ledger/:contact_id?from=&to=` — partner ledger.
* `GET /api/v1/dashboard/summary` — KPIs (total sales, expenses, net profit, outstanding receivables, top debtors). Cached.

## AI & HSN

* `GET /api/v1/his/hsn-search?q=...&type=byCode|byDesc&category=P|S` — proxy to government HSN API + local cache (see section 5).

## Misc

* `GET /api/v1/config` — returns organization config like currency, fiscal year start, COA default accounts (Accounts Receivable, Accounts Payable, Sales, Purchases, Cash).
* `GET /api/v1/export/invoices?format=csv|pdf` — export.

---

# 5. HSN Lookup Integration

**Endpoint provided:** `https://services.gst.gov.in/commonservices/hsn/search/qsearch` (GET)
**Parameters:** `inputText`, `selectedType` = `byCode`|`byDesc`, `category` = `null` | `P` | `S`.

## Design

* **Proxy endpoint**: `GET /api/v1/hsn?q=...&type=byCode|byDesc&category=P|S`

  * Checks local cache table `hsn_cache` (key = inputText + type + category) first.
  * If cache miss: call GST endpoint, store results in `hsn_cache` (JSON), respond to client.
* **hsn\_cache table**:

```sql
CREATE TABLE hsn_cache (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  query_hash VARCHAR(128) NOT NULL,
  input_text VARCHAR(255),
  selected_type VARCHAR(16),
  category CHAR(1),
  response_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_query (query_hash)
);
```

* **Caching rules**:

  * TTL: configurable, e.g., 30 days for code lookups and 7 days for desc lookups.
  * Cache eviction: LRU by `last_used_at` or size cap.
  * Respect remote rate limits and fail gracefully.

## Error handling

* If GST API is down / throttled, return HTTP 503 with `{"source": "cache", "data": [...]}` if cached data exists; otherwise return 502 with message to retry.
* Log failures in `audit_logs` for troubleshooting.

## Use in product creation

* When `POST /api/v1/products` includes no `hsn_code`, the server can call HSN proxy (if `hsn_lookup=true`) and suggest codes to the user; product is created only when user confirms.

---

# 6. Accounting engine rules & journal templates

All financial events must result in a `journal_entry` (JE) and `journal_lines` with balanced debit/credit.

## Default Chart of Accounts mapping (per org — seed template)

* Assets

  * Cash (Cash on hand)
  * Bank (Bank accounts)
  * Accounts Receivable (AR)
  * Inventory (Stock)
* Liabilities

  * Accounts Payable (AP)
  * Tax Payable (Output GST)
  * Tax Input (Input GST)
* Income

  * Sales
* Expense

  * Purchases
  * Cost of Goods Sold (COGS)
  * Expenses

## Journal Templates

### Customer Invoice (create\_invoice)

* JE.description = `Invoice {document_number} for {contact_name}`
* JE lines:

  * Debit: Accounts Receivable = total\_amount (subtotal + taxes)
  * Credit: Sales Income = subtotal
  * Credit: Tax Payable = tax\_total (split by tax rates into separate tax accounts)

### Vendor Bill (create\_bill)

* Debit: Purchase Expense / Inventory = subtotal
* Debit: Tax Input = tax\_total
* Credit: Accounts Payable = total\_amount

### Payment (customer)

* Debit: Bank/Cash account = amount
* Credit: Accounts Receivable = allocated\_amount (per invoice) — multiple lines if payment allocated to multiple invoices

### Stock Movement (purchase in)

* Debit: Inventory account = value
* Credit: Bank/Cash or AP = value (depending on payment)

**Implementation note**: Keep mapping of business accounts configurable per organization. On org creation, seed standard CoA and store IDs of default accounts (config table).

---

# 7. Reporting: queries & materialization

## P\&L (Profit & Loss)

* **Query approach**: aggregate `journal_lines` for accounts where `account_type` in (`Income`, `Expense`) between dates.
* **SQL (conceptual)**:

```sql
SELECT
  a.account_name,
  SUM(jl.credit) AS credit,
  SUM(jl.debit) AS debit,
  SUM(jl.credit - jl.debit) AS net
FROM journal_lines jl
JOIN chart_of_accounts a ON jl.account_id = a.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE je.organization_id = ? AND je.entry_date BETWEEN ? AND ?
  AND a.account_type IN ('Income','Expense')
GROUP BY a.account_name;
```

* For P\&L, show totals by Income and Expense groups. Net Profit = Income - Expense.

## Balance Sheet

* **Query**: snapshot as-of date: sum(`debit - credit`) per account grouped by account\_type (Asset, Liability, Equity).
* **SQL (conceptual)**:

```sql
SELECT a.account_type, SUM(jl.debit - jl.credit) AS balance
FROM journal_lines jl
JOIN chart_of_accounts a ON jl.account_id = a.id
JOIN journal_entries je ON jl.journal_entry_id = je.id
WHERE je.organization_id = ? AND je.entry_date <= ?
GROUP BY a.account_type;
```

## Partner Ledger

* Chronological transactions for a contact:

  * invoices (debit to contact), vendor\_bills, payments, allocations.
* Running balance computed client-side or in SQL window functions (MySQL 8 supports window functions).

## Stock report

* Use `stock_movements` aggregated: `IN`: sum(qty where qty>0), `OUT`: sum(abs(qty) where qty<0), current = sum(qty).
* For valuation, maintain `product_stock` aggregate with `avg_cost` updated on purchase receipts.

## Materialized tables / aggregates

* `partner_balances` (upserted by worker after payments/invoices)
* `pnl_monthly` (month aggregates) — refresh via background job nightly
* `balance_sheet_snapshot` (periodic snapshots) — to speed dashboard

---

# 8. Transactional workflows (detailed)

## A. Sales Order → Invoice → Payment (atomic flow)

1. User creates SO (`sales_orders` + `sales_order_lines`).
2. Confirm SO (`/confirm`): change status and optionally reserve inventory (create `stock_movements` with `reference_type='SO_RESERVE'`).
3. `POST /sales-orders/:id/generate-invoice`:

   * Begin DB transaction.
   * Fetch SO lines, compute subtotal, tax, total.
   * Lock sequence row `document_sequences` FOR UPDATE and generate `document_number`.
   * Create `invoices` + `invoice_lines`.
   * Create `journal_entries` and `journal_lines` (AR, Sales, Tax Payable).
   * Update SO.status → `Invoiced`.
   * Commit.
4. Record payment:

   * Create `payments`.
   * Create `payment_allocations` for invoice(s).
   * Create `journal_entries` (Debit bank, Credit AR).
   * Update `invoices.amount_due`, `invoices.status` if fully paid.
   * Update `partner_balances` aggregate.

## B. Purchase Order → Vendor Bill → Payment

1. Create PO (`purchase_orders`). Confirm and receive goods.
2. Convert PO → `vendor_bills`:

   * Create `vendor_bills` + `vendor_bill_lines`.
   * Create `journal_entries` (Debit Inventory/Purchase, Debit Tax Input, Credit AP).
3. Record payment:

   * Create `payments` (vendor).
   * Create allocations & `journal_entries` (Debit AP, Credit Bank/Cash).
   * Update vendor\_bills.amount\_due/status.

**All the above must be in DB transactions with error handling & idempotency.**

---

# 9. Background jobs & caches

* **Workers**: process heavy tasks:

  * Refresh aggregates materialization (P\&L monthly, partner\_balances).
  * Reconcile bank payment webhooks.
  * Generate invoice PDFs and upload to object storage.
  * Recompute product stock aggregates and average cost (on purchase receipt).
* **Queue**: Redis + Bull (Node) or RQ/Celery (Python).
* **Cache**: Redis for dashboard KPIs, HSN cache, frequently read product & contact lookups.
* **Schedule**: cron/worker: nightly refresh of `pnl_monthly` & `balance_sheet_snapshot`.

---

# 10. Security, multi-tenancy, audit, idempotency

## Security

* JWT access tokens (short expiry) + refresh tokens stored server-side (or revocation list).
* Use role claims in JWT; enforce RBAC in route middleware.
* Use prepared statements/ORM parameterized queries to avoid SQL injection.
* HTTPS required; secrets in vault.

## Multi-tenancy

* `organization_id` in all rows; every query should filter by `organization_id`.
* Validate `X-Org-Id` from JWT, not only from header. For safety, if header and JWT differ, require JWT.

## Audit

* Insert rows into `audit_logs` on create/update/delete for: invoices, bills, payments, journal\_entries, chart\_of\_accounts, products, contacts.
* Audit entries include `changed_by` user id, `operation`, `change_data` JSON (old/new minimal).

## Idempotency

* Payment endpoints must accept `idempotency_key` header. Store the key in `payments` or `idempotency_keys` table to ensure safe retries from payment provider callbacks.

---

# 11. Deployment & Operational notes

* **Migrations**: use migration tool (Flyway / Liquibase / Sequelize migrations).
* **Backups**: daily full, binlog for PITR.
* **Read replicas** for reporting.
* **Monitoring**: alert on query latency, slow transactions, replication lag, worker queue backlogs.
* **Secrets**: store DB & API keys in secret manager.

---

# 12. MVP (24-hour hackathon) priority

\*\*Goal:\*\*Deliver a functioning, demoable end-to-end flow with AI/HSN integration.

**Phase 1 (Must-have)**:

1. Auth (signup/login) + seed roles.
2. Master data: Contacts, Products (with HSN lookup hitting cached proxy), Taxes, CoA (seed template).
3. Sales Flow: create SO → convert to Invoice → record Payment (with JE creation).
4. Dashboard: KPIs (Total Sales, Outstanding Receivables, Net Profit) — simple queries.
5. Reporting: P\&L & Balance Sheet basic endpoints.
6. HSN proxy endpoint with cache.
7. Audit logging for invoices and payments.
8. Cloud deploy (Render/Heroku) and sample data.

**Phase 2 (If time allows)**:

1. Purchase flow, stock movements & product stock agg.
2. Partial payments & payment allocations.
3. Export report CSV.
4. Partner ledger endpoint.
5. Attachment upload to S3.

---

# 13. Appendix — Example API payloads & SQL snippets

## Example: Create Sales Order (POST /api/v1/sales-orders)

```json
{
  "contact_id": 123,
  "order_date": "2025-09-20",
  "currency": "INR",
  "lines": [
    { "product_id": 10, "qty": 5, "unit_price": 2500.00, "tax_id": 2 }
  ],
  "notes": "Order from Nimesh Pathak"
}
```

## Example: Convert SO → Invoice (POST /api/v1/sales-orders/12/generate-invoice)

**Response**

```json
{
  "invoice_id": 45,
  "document_number": "INV/2025/00012",
  "amount": 13125.00
}
```

## Example: Record Payment (POST /api/v1/invoices/\:id/record-payment)

```json
{
  "payment_method": "BankTransfer",
  "bank_account_coa_id": 5,
  "amount": 13125.00,
  "reference": "TXN12345",
  "idempotency_key": "client-123-inv-45-pay-1"
}
```

## Example JE creation pseudocode (Invoice)

```sql
-- create journal_entries row
INSERT INTO journal_entries (organization_id, entry_date, description, reference_type, reference_id)
VALUES (?, CURDATE(), 'Invoice INV/2025/00012 - Nimesh', 'Invoice', 45);

-- create journal_lines: debit AR
INSERT INTO journal_lines (journal_entry_id, account_id, debit, credit)
VALUES (:je_id, :account_ar_id, 13125.00, 0.00);

-- create journal_lines: credit Sales
INSERT INTO journal_lines (..., account_id, debit, credit)
VALUES (:je_id, :account_sales_id, 0.00, 12500.00);

-- create journal_lines: credit Tax Payable
VALUES (:je_id, :tax_account_id, 0.00, 625.00);
```

## Example P\&L SQL (monthly totals)

```sql
SELECT a.account_type, SUM(jl.credit - jl.debit) AS net_amount
FROM journal_lines jl
JOIN journal_entries je ON jl.journal_entry_id = je.id
JOIN chart_of_accounts a ON jl.account_id = a.id
WHERE je.organization_id = ? AND je.entry_date BETWEEN '2025-09-01' AND '2025-09-30'
AND a.account_type IN ('Income', 'Expense')
GROUP BY a.account_type;
```

---

# Final checklist for the backend dev team

* [ ] Implement DB schema (migrations) from `DATABASE_DESIGN.md`.
* [ ] Seed roles & default CoA template per organization.
* [ ] Build auth & role middleware.
* [ ] Implement HSN proxy & caching table.
* [ ] Implement Sales flow endpoints & transaction logic with JE creation.
* [ ] Implement invoice payment endpoint with idempotency.
* [ ] Add audit logging hooks for core tables.
* [ ] Build P\&L & Balance Sheet endpoints (using `journal_lines`).
* [ ] Add background worker to refresh `partner_balances` and `pnl_monthly`.
* [ ] Deploy to cloud, run integration tests with seeded data.
