## 📋 **Complete API Documentation**

### **Base URL:** `http://localhost:3000/api/v1`

---

## 🔐 **1. Authentication Endpoints**

### **POST** `/auth/register`
Register a new user and organization.

**Request Body:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "+91-9876543210"
  },
  "organization": {
    "name": "ABC Furniture Ltd",
    "type": "company",
    "gstNumber": "27ABCDE1234F1Z5",
    "address": {
      "street": "123 Business Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "organization": {
      "id": 1,
      "name": "ABC Furniture Ltd",
      "uuid": "org_abc123def456"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "24h"
    }
  }
}
```

### **POST** `/auth/login`
User login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "organizationId": 1
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "24h"
    }
  }
}
```

### **POST** `/auth/refresh-token`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h"
  }
}
```

### **POST** `/auth/logout`
Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👥 **2. Contacts Management**

### **GET** `/contacts`
Get all contacts with filtering and pagination.

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search in name/email
- `type` (string): customer/vendor/both
- `status` (string): active/inactive

**Example Request:**
```
GET /api/v1/contacts?page=1&limit=10&search=furniture&type=customer&status=active
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": 1,
        "name": "ABC Furniture Store",
        "email": "contact@abcfurniture.com",
        "phone": "+91-9876543210",
        "type": "customer",
        "status": "active",
        "gstNumber": "27ABCDE1234F1Z5",
        "addresses": [
          {
            "id": 1,
            "type": "billing",
            "street": "123 Main Street",
            "city": "Mumbai",
            "state": "Maharashtra",
            "postalCode": "400001",
            "country": "India"
          }
        ],
        "currentBalance": 25000.00,
        "creditLimit": 100000.00,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 10
    },
    "statistics": {
      "totalCustomers": 35,
      "totalVendors": 13,
      "activeContacts": 45,
      "totalOutstanding": 125000.00
    }
  }
}
```

### **POST** `/contacts`
Create a new contact.

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "XYZ Furniture Mart",
  "email": "info@xyzfurniture.com",
  "phone": "+91-9876543211",
  "type": "customer",
  "gstNumber": "29XYZAB1234C1D2",
  "panNumber": "ABCDE1234F",
  "creditLimit": 150000.00,
  "paymentTerms": "30 days",
  "addresses": [
    {
      "type": "billing",
      "street": "456 Commerce Road",
      "city": "Bangalore",
      "state": "Karnataka",
      "postalCode": "560001",
      "country": "India"
    },
    {
      "type": "shipping",
      "street": "789 Warehouse Lane",
      "city": "Bangalore",
      "state": "Karnataka",
      "postalCode": "560002",
      "country": "India"
    }
  ],
  "bankDetails": {
    "bankName": "HDFC Bank",
    "accountNumber": "12345678901234",
    "ifscCode": "HDFC0001234",
    "accountType": "current"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact created successfully",
  "data": {
    "id": 2,
    "name": "XYZ Furniture Mart",
    "email": "info@xyzfurniture.com",
    "contactCode": "CONT-000002",
    "type": "customer",
    "status": "active",
    "currentBalance": 0.00,
    "creditLimit": 150000.00,
    "createdAt": "2024-01-20T14:30:00.000Z"
  }
}
```

### **GET** `/contacts/:id`
Get contact details by ID.

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ABC Furniture Store",
    "email": "contact@abcfurniture.com",
    "phone": "+91-9876543210",
    "contactCode": "CONT-000001",
    "type": "customer",
    "status": "active",
    "gstNumber": "27ABCDE1234F1Z5",
    "panNumber": "ABCDE1234F",
    "currentBalance": 25000.00,
    "creditLimit": 100000.00,
    "paymentTerms": "30 days",
    "addresses": [...],
    "bankDetails": {...},
    "recentTransactions": [
      {
        "id": 101,
        "type": "invoice",
        "amount": 15000.00,
        "date": "2024-01-18T10:00:00.000Z",
        "reference": "INV-000123"
      }
    ],
    "statistics": {
      "totalInvoices": 12,
      "totalPayments": 8,
      "averagePaymentDays": 25
    }
  }
}
```

### **PUT** `/contacts/:id`
Update contact information.

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:** (Same as POST, all fields optional)
```json
{
  "name": "ABC Furniture Store Updated",
  "creditLimit": 200000.00,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "id": 1,
    "name": "ABC Furniture Store Updated",
    "creditLimit": 200000.00,
    "updatedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

### **DELETE** `/contacts/:id`
Soft delete a contact.

**Headers:** `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

## 📦 **3. Products Management**

### **GET** `/products`
Get all products with filtering and pagination.

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**
- `page`, `limit`, `search`
- `category` (string): Filter by category
- `status` (string): active/inactive
- `stockStatus` (string): in_stock/low_stock/out_of_stock

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Office Chair - Executive",
        "productCode": "PROD-000001",
        "description": "High-quality executive office chair",
        "category": "Office Furniture",
        "unit": "piece",
        "sellingPrice": 15000.00,
        "costPrice": 12000.00,
        "currentStock": 25,
        "minimumStock": 5,
        "hsnCode": "9401",
        "gstRate": 18.00,
        "status": "active",
        "imageUrl": "https://example.com/chair.jpg"
      }
    ],
    "pagination": {...},
    "statistics": {
      "totalProducts": 150,
      "lowStockItems": 5,
      "outOfStockItems": 2,
      "totalValue": 2500000.00
    }
  }
}
```

### **POST** `/products`
Create a new product.

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**
```json
{
  "name": "Dining Table - 6 Seater",
  "description": "Premium wooden dining table for 6 people",
  "category": "Dining Furniture",
  "unit": "piece",
  "sellingPrice": 45000.00,
  "costPrice": 35000.00,
  "minimumStock": 3,
  "hsnCode": "9403",
  "gstRate": 18.00,
  "specifications": {
    "material": "Solid Wood",
    "dimensions": "180cm x 90cm x 75cm",
    "weight": "50kg",
    "color": "Natural Brown"
  },
  "images": [
    "base64-encoded-image-data"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 2,
    "name": "Dining Table - 6 Seater",
    "productCode": "PROD-000002",
    "sellingPrice": 45000.00,
    "currentStock": 0,
    "createdAt": "2024-01-20T16:00:00.000Z"
  }
}
```

---

## 🏷️ **4. Product Categories**

### **GET** `/product-categories`
Get all product categories in tree structure.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Office Furniture",
        "code": "CAT-OFF",
        "description": "Furniture for office use",
        "parentId": null,
        "level": 0,
        "children": [
          {
            "id": 2,
            "name": "Chairs",
            "code": "CAT-OFF-CHR",
            "parentId": 1,
            "level": 1,
            "productCount": 25
          }
        ],
        "productCount": 45
      }
    ]
  }
}
```

### **POST** `/product-categories`
Create a new product category.

**Request Body:**
```json
{
  "name": "Bedroom Furniture",
  "code": "CAT-BED",
  "description": "Furniture for bedroom",
  "parentId": null
}
```

---

## 💰 **5. Tax Management**

### **GET** `/taxes`
Get all tax configurations.

**Response:**
```json
{
  "success": true,
  "data": {
    "taxes": [
      {
        "id": 1,
        "name": "GST 18%",
        "type": "GST",
        "rate": 18.00,
        "isActive": true,
        "applicableStates": ["all"],
        "description": "Standard GST rate for furniture"
      },
      {
        "id": 2,
        "name": "IGST 18%",
        "type": "IGST", 
        "rate": 18.00,
        "isActive": true,
        "description": "Inter-state GST"
      }
    ]
  }
}
```

### **POST** `/taxes`
Create a new tax configuration.

**Request Body:**
```json
{
  "name": "GST 12%",
  "type": "GST",
  "rate": 12.00,
  "description": "Reduced GST rate",
  "applicableStates": ["all"]
}
```

---

## 💼 **6. Sales Management**

### **GET** `/sales/orders`
Get all sales orders.

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "orderNumber": "SO-000001",
        "customerId": 1,
        "customerName": "ABC Furniture Store",
        "orderDate": "2024-01-15T10:00:00.000Z",
        "deliveryDate": "2024-01-25T10:00:00.000Z",
        "status": "confirmed",
        "subtotal": 50000.00,
        "taxAmount": 9000.00,
        "totalAmount": 59000.00,
        "items": [
          {
            "id": 1,
            "productId": 1,
            "productName": "Office Chair - Executive",
            "quantity": 2,
            "unitPrice": 15000.00,
            "lineTotal": 30000.00,
            "taxRate": 18.00
          }
        ]
      }
    ],
    "pagination": {...}
  }
}
```

### **POST** `/sales/orders`
Create a new sales order.

**Request Body:**
```json
{
  "customerId": 1,
  "orderDate": "2024-01-20T10:00:00.000Z",
  "deliveryDate": "2024-01-30T10:00:00.000Z",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 15000.00,
      "taxRate": 18.00
    },
    {
      "productId": 2,
      "quantity": 1,
      "unitPrice": 45000.00,
      "taxRate": 18.00
    }
  ],
  "notes": "Urgent delivery required",
  "paymentTerms": "30 days"
}
```

---

## 🧾 **7. Invoice Management**

### **GET** `/invoices`
Get all invoices.

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "invoiceNumber": "INV-000001",
        "customerId": 1,
        "customerName": "ABC Furniture Store",
        "invoiceDate": "2024-01-20T10:00:00.000Z",
        "dueDate": "2024-02-19T10:00:00.000Z",
        "status": "sent",
        "subtotal": 50000.00,
        "taxAmount": 9000.00,
        "totalAmount": 59000.00,
        "paidAmount": 0.00,
        "balanceAmount": 59000.00,
        "items": [...],
        "pdfUrl": "https://s3.amazonaws.com/invoices/inv-000001.pdf"
      }
    ]
  }
}
```

### **POST** `/invoices`
Create a new invoice.

**Request Body:**
```json
{
  "customerId": 1,
  "salesOrderId": 1,
  "invoiceDate": "2024-01-20T10:00:00.000Z",
  "dueDate": "2024-02-19T10:00:00.000Z",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 15000.00,
      "taxRate": 18.00
    }
  ],
  "notes": "Payment due in 30 days"
}
```

### **GET** `/invoices/:id/pdf`
Download invoice PDF.

**Response:** PDF file download

---

## 💳 **8. Payment Management**

### **GET** `/payments`
Get all payments.

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "paymentNumber": "PAY-000001",
        "customerId": 1,
        "customerName": "ABC Furniture Store",
        "amount": 59000.00,
        "paymentDate": "2024-01-25T14:30:00.000Z",
        "paymentMethod": "bank_transfer",
        "reference": "TXN123456789",
        "status": "completed",
        "allocatedInvoices": [
          {
            "invoiceId": 1,
            "invoiceNumber": "INV-000001",
            "allocatedAmount": 59000.00
          }
        ]
      }
    ]
  }
}
```

### **POST** `/payments`
Record a new payment.

**Request Body:**
```json
{
  "customerId": 1,
  "amount": 59000.00,
  "paymentDate": "2024-01-25T14:30:00.000Z",
  "paymentMethod": "bank_transfer",
  "reference": "TXN123456789",
  "bankAccount": "HDFC-001",
  "invoiceAllocations": [
    {
      "invoiceId": 1,
      "amount": 59000.00
    }
  ],
  "notes": "Payment received via NEFT"
}
```

---

## 📊 **9. Reports**

### **GET** `/reports/profit-loss`
Get Profit & Loss report.

**Query Parameters:**
- `startDate` (date): Start date (YYYY-MM-DD)
- `endDate` (date): End date (YYYY-MM-DD)
- `format` (string): json/pdf/excel

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "income": {
      "sales": 500000.00,
      "otherIncome": 5000.00,
      "totalIncome": 505000.00
    },
    "expenses": {
      "costOfGoodsSold": 350000.00,
      "operatingExpenses": 75000.00,
      "totalExpenses": 425000.00
    },
    "grossProfit": 150000.00,
    "netProfit": 80000.00,
    "profitMargin": 15.84
  }
}
```

### **GET** `/reports/balance-sheet`
Get Balance Sheet report.

**Response:**
```json
{
  "success": true,
  "data": {
    "asOfDate": "2024-01-31",
    "assets": {
      "currentAssets": {
        "cash": 100000.00,
        "accountsReceivable": 150000.00,
        "inventory": 300000.00,
        "totalCurrentAssets": 550000.00
      },
      "fixedAssets": {
        "equipment": 200000.00,
        "totalFixedAssets": 200000.00
      },
      "totalAssets": 750000.00
    },
    "liabilities": {
      "currentLiabilities": {
        "accountsPayable": 100000.00,
        "totalCurrentLiabilities": 100000.00
      },
      "totalLiabilities": 100000.00
    },
    "equity": {
      "capital": 500000.00,
      "retainedEarnings": 150000.00,
      "totalEquity": 650000.00
    }
  }
}
```

---

## 🔍 **10. HSN Code Lookup**

### **GET** `/hsn/search`
Search HSN codes.

**Query Parameters:**
- `query` (string): Search term
- `limit` (number): Results limit (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "code": "9401",
        "description": "Seats (other than those of heading 9402), whether or not convertible into beds, and parts thereof",
        "gstRate": 18.00,
        "category": "Furniture"
      }
    ],
    "cached": true,
    "cacheExpiry": "2024-02-20T10:00:00.000Z"
  }
}
```

---

## 🚀 **Testing the APIs**

### **Using cURL:**
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Get contacts (with auth token)
curl -X GET http://localhost:3000/api/v1/contacts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### **Using Postman:**
1. Import the API collection (create one with all endpoints)
2. Set up environment variables for base URL and auth token
3. Test each endpoint systematically

### **API Documentation URL:**
Once the server is running, visit:
```
http://localhost:3000/api/v1/docs
```

This provides interactive API documentation where you can test endpoints directly from the browser.

Your Shiv Furnitures backend is now fully documented and ready for integration with the frontend! 🎉