#!/bin/bash

# API Test Runner Script
# This script runs comprehensive tests for all API endpoints

echo "🚀 Starting API Endpoint Tests..."
echo "================================="

# Set test environment
export NODE_ENV=test

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if test database exists and create if needed
print_status "Setting up test database..."
npm run db:test:create 2>/dev/null || print_warning "Test database might already exist"
npm run db:test:migrate

if [ $? -eq 0 ]; then
    print_success "Test database setup completed"
else
    print_error "Failed to setup test database"
    exit 1
fi

# Run all endpoint tests
print_status "Running all API endpoint tests..."

echo ""
echo "📍 Testing Health Check Endpoint..."
npm run test:health

echo ""
echo "🔐 Testing Authentication Endpoints..."
npm run test:auth

echo ""
echo "👥 Testing Contacts Endpoints..."
npm run test:contacts

echo ""
echo "📦 Testing Products Endpoints..."
npm run test:products

echo ""
echo "📁 Testing Product Categories Endpoints..."
npm run test:categories

echo ""
echo "📊 Generating Coverage Report..."
npm run test:coverage

if [ $? -eq 0 ]; then
    print_success "All tests completed successfully!"
    echo ""
    echo "📋 Test Summary:"
    echo "  ✅ Health Check API"
    echo "  ✅ Authentication API"
    echo "  ✅ Contacts API"
    echo "  ✅ Products API"
    echo "  ✅ Product Categories API"
    echo ""
    echo "📊 Coverage report generated in ./coverage/ directory"
    echo "🌐 Open coverage/lcov-report/index.html in browser to view detailed coverage"
else
    print_error "Some tests failed!"
    exit 1
fi

echo ""
echo "🎉 API Testing Complete!"
echo "========================="