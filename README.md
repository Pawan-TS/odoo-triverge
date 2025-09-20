# Shiv Accounts Pro - Cloud Accounting System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A comprehensive cloud-based accounting system built for **Odoo Hackathon Second Round**. Designed specifically for small and medium businesses, starting with Shiv Furniture as the reference organization.

## 🎯 Project Overview

**Shiv Accounts Pro** is a multi-tenant, cloud-hosted web application that enables businesses to:

- ✅ **Master Data Management**: Contacts, Products, Taxes, Chart of Accounts
- ✅ **Transaction Processing**: Sales Orders, Invoices, Purchase Orders, Bills, Payments
- ✅ **Financial Reporting**: Balance Sheet, Profit & Loss, Stock Reports
- 🔄 **AI-Powered Features**: Natural language queries and automated summaries
- ✅ **Role-Based Access**: Admin, Accountant, and Customer/Vendor portals

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js 18+ with Express.js
- **Database**: MySQL 8.0+ with Sequelize ORM
- **Cache/Queue**: Redis with Bull queue processing
- **Authentication**: JWT with bcryptjs password hashing
- **Validation**: Joi schema validation
- **Logging**: Winston with audit trail
- **File Storage**: AWS S3 integration ready

### Frontend Stack
- **Framework**: React 18.3 with TypeScript 5.7
- **Build Tool**: Vite 6.0
- **UI Library**: ShadCN/UI with Radix UI components
- **Styling**: Tailwind CSS with animations
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- MySQL 8.0+ (or use Docker)
- Redis (or use Docker)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/odoo-triverge.git
cd odoo-triverge
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Start with Docker (Recommended)
docker-compose up -d

# Or start manually
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend-test

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **API Documentation**: http://localhost:3000/api/v1/docs

## 📊 Database Schema (22 Models)

| Model | Purpose | Status |
|-------|---------|--------|
| Organization | Multi-tenant organization management | ✅ |
| User | User accounts with role-based access | ✅ |
| Role | Predefined user roles and permissions | ✅ |
| UserRole | Many-to-many user-role relationships | ✅ |
| Contact | Customer and vendor management | ✅ |
| ContactAddress | Multiple addresses per contact | ✅ |
| Product | Product catalog with inventory | ✅ |
| ProductCategory | Hierarchical product categorization | ✅ |
| Tax | Tax configuration and rates | ✅ |
| ChartOfAccounts | Accounting chart of accounts | ✅ |
| SalesOrder | Sales order management | 🔄 |
| SalesOrderItem | Line items for sales orders | 🔄 |
| Invoice | Invoice generation and tracking | 🔄 |
| InvoiceItem | Invoice line items | 🔄 |
| Payment | Payment processing and tracking | 🔄 |
| PaymentMethod | Payment method configuration | ✅ |
| JournalEntry | Double-entry bookkeeping | 🔄 |
| JournalEntryLine | Journal entry line items | 🔄 |
| StockMovement | Inventory movement tracking | 🔄 |
| Attachment | File attachment management | ✅ |
| AuditLog | System audit trail | ✅ |
| Sequence | Auto-numbering sequences | ✅ |

## 🔧 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Organization and user registration
- `POST /login` - User authentication
- `GET /profile` - User profile management
- `POST /refresh` - Token refresh
- `POST /logout` - User logout

### Master Data
- **Contacts** (`/api/v1/contacts`) - Customer/Vendor management
- **Products** (`/api/v1/products`) - Product catalog with inventory
- **Categories** (`/api/v1/product-categories`) - Hierarchical categorization
- **Taxes** (`/api/v1/taxes`) - Tax configuration and calculation

### Transactions (In Progress)
- **Sales Orders** (`/api/v1/sales-orders`) - Sales order processing
- **Invoices** (`/api/v1/invoices`) - Invoice generation and tracking
- **Payments** (`/api/v1/payments`) - Payment processing

### Reports (Planned)
- **Balance Sheet** (`/api/v1/reports/balance-sheet`)
- **Profit & Loss** (`/api/v1/reports/profit-loss`)
- **Stock Reports** (`/api/v1/reports/stock`)

## 🔒 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Multi-tenant data isolation
- ✅ Password hashing with bcryptjs
- ✅ Input validation and sanitization
- ✅ Rate limiting and CORS protection
- ✅ Audit logging for all operations
- ✅ SQL injection prevention
- ✅ XSS protection

## 📈 Current Progress

### ✅ Completed (60%)
- **Core Infrastructure**: Package management, Docker setup, database models
- **Authentication System**: Complete JWT-based auth with role management
- **Master Data Management**: Contacts, Products, Categories, Taxes
- **API Architecture**: RESTful design with comprehensive validation
- **Frontend Foundation**: TypeScript API client, UI component library

### 🔄 In Progress (25%)
- **Transaction Processing**: Sales orders, invoices, payments
- **Frontend Components**: React components and pages
- **Database Migrations**: Setup scripts and seeders

### 📋 Planned (15%)
- **Financial Reporting**: Balance sheet, P&L, stock reports
- **AI Integration**: Natural language queries and summaries
- **Advanced Features**: Background jobs, email notifications

## 🛠️ Development

### Backend Development
```bash
cd backend

# Run in development mode
npm run dev

# Run tests
npm test

# Database migrations
npm run migrate

# Seed data
npm run seed

# Linting
npm run lint
```

### Frontend Development
```bash
cd frontend-test

# Development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment
1. Setup MySQL and Redis servers
2. Configure environment variables
3. Run database migrations
4. Build frontend assets
5. Start backend server
6. Serve frontend with nginx/apache

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shiv_accounts
DB_USER=root
DB_PASSWORD=password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Shiv Accounts Pro
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Triverge** - Odoo Hackathon Second Round Participants

## 🔗 Links

- [Problem Statement](Problem-Statement.md)
- [Software Requirements Specification](SRS.md)
- [Implementation Progress](IMPLEMENTATION_PROGRESS.md)
- [Project Roadmap](roadmap.md)
- [Mockup Design](https://link.excalidraw.com/l/65VNwvy7c4X/AtwSUrDjbwK)

---

**Built with ❤️ for Odoo Hackathon 2025**
