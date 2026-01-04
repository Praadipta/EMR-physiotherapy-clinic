@echo off
echo ========================================
echo   Sambung Nyowo EMR - Setup ^& Run
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/5] Setting up database schema...
REM Check if database already exists
if exist "data\healthcare.db" (
    echo Database already exists, skipping db:push...
    echo To reset database, delete data\healthcare.db first
) else (
    call npm run db:push
    if errorlevel 1 (
        echo WARNING: db:push had issues, but continuing...
    )
)

echo.
echo [3/5] Seeding initial data...
call npm run seed
if errorlevel 1 (
    echo WARNING: Seed may have already run, continuing...
)

echo.
echo [4/5] Seeding ICD-10 codes...
call npx tsx scripts/seed-icd10.ts
if errorlevel 1 (
    echo WARNING: ICD-10 seed may have already run, continuing...
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo [5/5] Starting development server...
echo.
echo   Login credentials:
echo   - Admin: admin / admin123
echo   - Therapist: terapis1 / terapis123
echo.
echo   URL: http://localhost:5173
echo.
echo ========================================
echo.

call npm run dev

pause

