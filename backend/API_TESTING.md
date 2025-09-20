# API Testing Documentation

## Overview

This project includes comprehensive automated testing for all API endpoints. The testing framework uses **Jest** and **Supertest** to provide thorough coverage of all REST API functionality.

## Test Structure

```
backend/tests/
├── setup.js              # Global test configuration
├── helpers/
│   └── testHelper.js      # Common testing utilities
└── endpoints/
    ├── auth.test.js       # Authentication endpoints
    ├── contacts.test.js   # Contacts CRUD operations
    ├── products.test.js   # Products CRUD operations
    ├── productCategories.test.js # Categories CRUD operations
    └── health.test.js     # Health check endpoint
```

## Available Test Commands

### Basic Testing
```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD (no watch, with coverage)
npm run test:ci
```

### Endpoint-Specific Testing
```bash
# Test specific endpoint groups
npm run test:auth          # Authentication tests
npm run test:contacts      # Contacts API tests
npm run test:products      # Products API tests
npm run test:categories    # Product Categories tests
npm run test:health        # Health check tests

# Test all endpoints
npm run test:endpoints
```

### Database Management
```bash
# Setup test database
npm run test:setup

# Create test database
npm run db:test:create

# Run test migrations
npm run db:test:migrate

# Reset test database
npm run db:test:reset

# Drop test database
npm run db:test:drop
```

## Test Environment Setup

### Prerequisites
1. **MySQL Database**: Test database `Shiv_furnitures_test`
2. **Redis**: For caching (test instance)
3. **Environment Variables**: `.env.test` file configured

### Configuration Files
- **`.env.test`**: Test environment configuration
- **`jest.config.js`**: Jest testing framework configuration

## Test Categories Covered

### 🔐 Authentication Tests (`auth.test.js`)
- **POST /auth/register**: User registration with validation
- **POST /auth/login**: User login with credentials
- **GET /auth/profile**: Get user profile (authenticated)
- **PUT /auth/profile**: Update user profile
- **POST /auth/refresh**: Token refresh
- **POST /auth/forgot-password**: Password reset

### 👥 Contacts Tests (`contacts.test.js`)
- **POST /contacts**: Create new contacts (customer/vendor/company)
- **GET /contacts**: List contacts with filtering, search, pagination
- **GET /contacts/:id**: Get specific contact
- **PUT /contacts/:id**: Update contact information
- **DELETE /contacts/:id**: Delete contact

### 📦 Products Tests (`products.test.js`)
- **POST /products**: Create products with different types
- **GET /products**: List products with filtering, search, pagination
- **GET /products/:id**: Get specific product with category info
- **PUT /products/:id**: Update product information
- **DELETE /products/:id**: Delete product
- **POST /products/:id/stock-adjustment**: Inventory adjustments

### 📁 Product Categories Tests (`productCategories.test.js`)
- **POST /product-categories**: Create categories and subcategories
- **GET /product-categories**: List categories with hierarchy
- **GET /product-categories/:id**: Get specific category
- **PUT /product-categories/:id**: Update category
- **DELETE /product-categories/:id**: Delete category (with constraints)

### 📍 Health Check Tests (`health.test.js`)
- **GET /health**: API health status check

## Test Features

### 🛡️ Authentication Testing
- JWT token generation and validation
- Protected route access control
- User session management
- Organization-based access control

### ✅ Validation Testing
- Input validation for all endpoints
- Required field validation
- Data type validation
- Business rule validation
- Error response format validation

### 🔍 Edge Case Testing
- Non-existent resource handling
- Invalid data format handling
- Duplicate data handling
- Permission boundary testing
- Database constraint testing

### 📊 Data Integrity Testing
- CRUD operation consistency
- Foreign key constraint validation
- Cascading delete behavior
- Data isolation between organizations

## Running Tests

### Local Development

#### Windows (PowerShell)
```powershell
# Setup and run all tests
.\test-runner.bat

# Or run specific commands
npm run test:setup
npm run test:coverage
```

#### Linux/Mac (Bash)
```bash
# Setup and run all tests
./test-runner.sh

# Or run specific commands
npm run test:setup
npm run test:coverage
```

### Manual Testing Setup
```bash
# 1. Setup test database
npm run db:test:create
npm run db:test:migrate

# 2. Run specific test suites
npm run test:auth
npm run test:contacts
npm run test:products
npm run test:categories

# 3. Generate coverage report
npm run test:coverage
```

## Continuous Integration

### GitHub Actions
The project includes automated testing via GitHub Actions:
- **Trigger**: Push/PR to main/develop branches
- **Matrix Testing**: Node.js 18.x and 20.x
- **Services**: MySQL 8.0 and Redis 7
- **Coverage**: Automatic coverage reporting
- **PR Comments**: Coverage summary on pull requests

### CI/CD Pipeline Features
- Automated test database setup
- Parallel test execution
- Coverage reporting to Codecov
- Test result annotations
- Failure notifications

## Test Data Management

### TestHelper Utilities
The `testHelper.js` provides utilities for:
- **User Creation**: `createTestUser()`, `loginTestUser()`
- **Authentication**: `generateTestToken()`, `authenticatedRequest()`
- **Test Data**: `createTestContactData()`, `createTestProductData()`
- **Database Cleanup**: `cleanDatabase()`
- **Assertions**: `expectSuccess()`, `expectValidationError()`

### Example Usage
```javascript
const testHelper = require('../helpers/testHelper');

describe('My API Test', () => {
  let authData;

  beforeEach(async () => {
    await testHelper.cleanDatabase();
    authData = await testHelper.loginTestUser();
  });

  it('should create resource', async () => {
    const response = await testHelper.request
      .post('/api/v1/my-endpoint')
      .set('Authorization', authData.authHeader)
      .send(testHelper.createTestData());

    testHelper.expectSuccess(response, 201);
    expect(response.body.data.id).toBeDefined();
  });
});
```

## Coverage Reports

### Generated Reports
- **Console**: Summary in terminal
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`
- **JSON**: `coverage/coverage-final.json`

### Coverage Targets
- **Lines**: > 90%
- **Functions**: > 90%
- **Branches**: > 85%
- **Statements**: > 90%

## Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MySQL service
mysql -u root -p -e "SHOW DATABASES;"

# Recreate test database
npm run db:test:drop
npm run db:test:create
npm run db:test:migrate
```

#### Redis Connection
```bash
# Check Redis service
redis-cli ping

# Start Redis (if needed)
redis-server
```

#### Environment Variables
```bash
# Verify test environment
cat .env.test

# Copy from example
cp .env.test.example .env.test
```

#### Port Conflicts
```bash
# Check for port usage
netstat -tulpn | grep :3001  # Test app port
netstat -tulpn | grep :3306  # MySQL port
netstat -tulpn | grep :6379  # Redis port
```

## Adding New Tests

### New Endpoint Test
1. Create test file: `tests/endpoints/newEndpoint.test.js`
2. Add npm script: `"test:newEndpoint": "NODE_ENV=test jest tests/endpoints/newEndpoint.test.js"`
3. Update test runner scripts
4. Add to CI/CD workflow

### Test Template
```javascript
const testHelper = require('../helpers/testHelper');

describe('New Endpoint Tests', () => {
  let authData;

  beforeEach(async () => {
    await testHelper.cleanDatabase();
    authData = await testHelper.loginTestUser();
  });

  describe('POST /api/v1/new-endpoint', () => {
    it('should create resource successfully', async () => {
      const testData = { /* test data */ };
      
      const response = await testHelper.request
        .post('/api/v1/new-endpoint')
        .set('Authorization', authData.authHeader)
        .send(testData);

      testHelper.expectSuccess(response, 201);
      // Add specific assertions
    });

    it('should fail with invalid data', async () => {
      const response = await testHelper.request
        .post('/api/v1/new-endpoint')
        .set('Authorization', authData.authHeader)
        .send({});

      testHelper.expectValidationError(response);
    });
  });
});
```

## Best Practices

### Test Organization
- One test file per endpoint group
- Descriptive test names
- Proper setup/teardown
- Isolated test data

### Test Data
- Use factory functions for test data
- Clean database between tests
- Mock external services
- Use realistic test data

### Assertions
- Test both success and failure cases
- Verify response structure
- Check data persistence
- Validate business rules

### Performance
- Minimize database operations
- Use transactions when possible
- Parallel test execution
- Efficient test data cleanup

## Monitoring and Metrics

### Test Metrics
- Test execution time
- Coverage percentages
- Failure rates
- Flaky test detection

### CI/CD Metrics
- Build success rate
- Test duration trends
- Coverage trends
- Deployment frequency

This comprehensive testing framework ensures reliable API functionality and provides confidence in code changes through automated validation of all endpoints.