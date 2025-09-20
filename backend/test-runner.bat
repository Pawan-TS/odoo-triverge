@echo off
REM API Test Runner Script for Windows
REM This script runs comprehensive tests for all API endpoints

echo 🚀 Starting API Endpoint Tests...
echo =================================

REM Set test environment
set NODE_ENV=test

echo [INFO] Setting up test database...
call npm run db:test:create >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Test database might already exist
)

call npm run db:test:migrate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to setup test database
    exit /b 1
)
echo [SUCCESS] Test database setup completed

REM Run all endpoint tests
echo [INFO] Running all API endpoint tests...

echo.
echo 📍 Testing Health Check Endpoint...
call npm run test:health

echo.
echo 🔐 Testing Authentication Endpoints...
call npm run test:auth

echo.
echo 👥 Testing Contacts Endpoints...
call npm run test:contacts

echo.
echo 📦 Testing Products Endpoints...
call npm run test:products

echo.
echo 📁 Testing Product Categories Endpoints...
call npm run test:categories

echo.
echo 📊 Generating Coverage Report...
call npm run test:coverage

if %errorlevel% equ 0 (
    echo [SUCCESS] All tests completed successfully!
    echo.
    echo 📋 Test Summary:
    echo   ✅ Health Check API
    echo   ✅ Authentication API
    echo   ✅ Contacts API
    echo   ✅ Products API
    echo   ✅ Product Categories API
    echo.
    echo 📊 Coverage report generated in ./coverage/ directory
    echo 🌐 Open coverage/lcov-report/index.html in browser to view detailed coverage
) else (
    echo [ERROR] Some tests failed!
    exit /b 1
)

echo.
echo 🎉 API Testing Complete!
echo =========================

pause