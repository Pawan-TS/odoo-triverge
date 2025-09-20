Shiv Accounts Cloud: Orders, Invoices & Real-Time Reports
1. Overview
A cloud-based accounting system for Shiv Furniture that enables:
● Entry of core master data (Contacts, Products, Taxes, Chart of Accounts).
● Smooth recording of sales, purchases, and payments using the master data.
● Automated generation of financial and stock reports like Balance Sheet, Profit & Loss
(P&L), and Stock Statement.
2. Primary Actors
● Admin (Business Owner) – Creates/ Modify/ Archived Master Data, Record
Transaction and View Report
● Invoicing User (Accountant) – Creates Master Data, Records Transactions, Views
Reports.
● Contact - Contact users can be created when creating Contact Master data. Only view
their own invoice/bills and make payment.
● System – Validates data, computes taxes, updates ledgers, and generates reports.
3. Master Data Modules
1. Contact Master
○ Fields: Name, Type (Customer/Vendor/Both), Email, Mobile, Address (City, State,
Pincode), Profile Image.
○ Example:
■ Vendor: Azure Furniture
■ Customer: Nimesh Pathak
2. Product Master
○ Fields: Product Name, Type (Goods/Service), Sales Price, Purchase Price, Sale
Tax %, Purchase Tax %, HSN Code, Category.
○ Example: Office Chair, Wooden Table, Sofa, Dining Table.
3. Tax Master
○ Fields: Tax Name, Computation Method (Percentage/Fixed Value), Applicable on
Sales/Purchase.
○ Example: GST 5%, GST 10%.
4. Chart of Accounts Master
Concept :Chart of Accounts (CoA) is essentially the master list of all ledger accounts
used to classify every financial transaction in an organization. Each account in the CoA
acts like a category or bucket where related transactions are grouped (e.g., Cash, Bank,
Sales Income, Purchase Expense).
Fields: Account Name, Type (Asset, Liability, Expense, Income, Equity).
○ Example:
■ Assets: Cash, Bank, Debtors,
■ Liabilities : Creditors
■ Income: Sale Income
■ Expenses: Purchases Expense
4. Transaction Flow
Users can use master data to create and link transactions:
Process Details/Fields
Purchase Order Select Vendor, Product, Quantity, Unit Price, Tax (5%/10%).
Vendor Bill Convert PO to Bill, record invoice date, due date, and register payment
(Cash/Bank).
Sales Order Select Customer, Product, Quantity, Unit Price, Tax.
Customer
Invoice
Generate Invoice from SO, set tax and receive payment via Cash/Bank.
Payment Register against bill/invoice - select bank or cash.
5. Reporting Requirements
After transactions are recorded, the system must generate:
1. Balance Sheet – Real-time snapshot of Assets, Liabilities, and Equity.
2. Profit & Loss Account – Income from product sales minus purchases/expenses to
show net profit.
3. Stock Account / Inventory Report – Current quantity, valuation, and movement of
products (e.g., Office Chair stock level).
6. Key Use-Case Steps
6.1 Create Master Data
1. Users
2. Adds Contacts (e.g., Azure Furniture, Nimesh Pathak).
3. Adds Products (e.g., Wooden Chair with Sales Tax 5%).
4. Defines Tax rates (5%, 10%).
5. Sets up Chart of Accounts.
6.2 Record Purchase
1. User creates Purchase Order for Azure Furniture.
2. On receipt, user converts PO to Vendor Bill.
3. Payment recorded via Bank.
6.3 Record Sale
1. User creates Sales Order for Nimesh Pathak for 5 Office Chairs.
2. Generates Customer Invoice.
3. Payment recorded via Cash / Bank
6.4 Generate Reports
1. User selects reporting period.
2. System compiles:
○ Balance Sheet showing Assets & Liabilities.
○ Profit & Loss showing total sales, purchases, expenses, and net profit.
○ Stock report showing Purchased Qty (+), Sales Qty (-), Available
Mockup Link - https://link.excalidraw.com/l/65VNwvy7c4X/AtwSUrDjbwK
Go d to k o co p in Ac o t
● Chart of Accounts (CoA)
A structured list of all accounts used in the company’s financial system.
Contains Assets, Liabilities, Income, Expenses, and Equity accounts. Example:
Cash, Bank, Accounts Receivable, Sales Revenue, Purchases, etc.
● Profit and Loss Report (P&L)
Also called Income Statement. Shows company’s revenues, costs, and
expenses over a period. Tells whether the business made a profit or a loss.
● Sale Order (SO)
A document confirming a customer’s order before delivery/invoicing.
Usually created after a quotation is accepted.
● Purchase Order (PO)
A document sent to a vendor to confirm you are buying products/services.
Acts as an official request for supply.
● Vendor Bill
The accounting record of a purchase invoice received from a vendor.
Entered into the system to track payables and due payments.
● HSN (Harmonized System of Nomenclature)
A system of classification for goods (used in GST and international trade).
Each product has an HSN code to standardize tax rates and reporting.
Api Documentation -
https://drive.google.com/file/d/1zeyV15pIQekxdDXn3p9pmssCvaQUMEBe/view?
usp=sharing
● Balance Sheet
A financial statement that shows a company’s financial position at a
specific date (like 31st March). It follows the equation: Assets = Liabilities +
Equity
● Partner Ledger
A detailed report showing all transactions (invoices, payments, credit
notes) with each customer/vendor. Helps track who owes you money (customers)
and whom you owe (vendors).