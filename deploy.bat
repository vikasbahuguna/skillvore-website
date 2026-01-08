@echo off
REM SkillVore Website Deployment Script
echo.
echo ==========================================
echo    SkillVore Website Deployment
echo ==========================================
echo.

REM Check if backup exists
if exist "index-backup.html" (
    echo [INFO] Backup already exists: index-backup.html
) else (
    if exist "index.html" (
        echo [INFO] Creating backup of current index.html...
        copy "index.html" "index-backup.html"
        echo [SUCCESS] Backup created: index-backup.html
    ) else (
        echo [WARNING] No existing index.html found
    )
)

echo.
echo Choose deployment option:
echo 1. Replace index.html with enhanced version
echo 2. Keep both files (you manually choose later)
echo 3. Cancel deployment
echo.
set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" (
    echo.
    echo [INFO] Replacing index.html with enhanced version...
    if exist "index-enhanced.html" (
        copy "index-enhanced.html" "index.html"
        echo [SUCCESS] index.html has been updated with enhanced version
    ) else (
        echo [ERROR] index-enhanced.html not found!
        pause
        exit /b 1
    )
) else if "%choice%"=="2" (
    echo.
    echo [INFO] Keeping both files. You can manually rename later.
    echo - Current: index.html
    echo - Enhanced: index-enhanced.html
) else if "%choice%"=="3" (
    echo.
    echo [INFO] Deployment cancelled.
    pause
    exit /b 0
) else (
    echo.
    echo [ERROR] Invalid choice. Deployment cancelled.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo    Deployment Checklist
echo ==========================================
echo.
echo Please ensure you've completed these steps:
echo.
echo [ ] 1. Set up your database integration:
echo      - Google Sheets (recommended for beginners)
echo      - Airtable (recommended for professionals)
echo      - Supabase (for advanced users)
echo.
echo [ ] 2. Configure EmailJS for notifications:
echo      - Get your Public Key from EmailJS
echo      - Update the email configuration in index.html
echo.
echo [ ] 3. Test the form locally:
echo      - Open index.html in browser
echo      - Fill out and submit the contact form
echo      - Verify data reaches your database
echo.
echo [ ] 4. Upload files to Netlify:
echo      - index.html (main page)
echo      - thank-you.html (success page)
echo      - netlify.toml (configuration)
echo      - Any integration scripts you're using
echo.
echo [ ] 5. Configure custom domain:
echo      - Point skillvore.com to Netlify
echo      - Set up SSL certificate
echo.
echo ==========================================
echo    Files Ready for Deployment
echo ==========================================
echo.
dir /b *.html *.toml *.js *.md 2>nul
echo.
echo ==========================================
echo    Next Steps
echo ==========================================
echo.
echo 1. Open your Netlify dashboard
echo 2. Drag and drop these files to deploy
echo 3. Test the form on your live site
echo 4. Check your database for submissions
echo 5. Verify email notifications work
echo.
echo For detailed setup instructions, see:
echo SETUP-GUIDE.md
echo.
echo ==========================================
echo    Support
echo ==========================================
echo.
echo If you need help:
echo - Check SETUP-GUIDE.md for troubleshooting
echo - Test each component individually
echo - Verify all API keys and URLs are correct
echo.
pause
