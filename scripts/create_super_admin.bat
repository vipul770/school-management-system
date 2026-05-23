@echo off
echo Creating Super Admin User...
echo.

set /p username=Enter username: 
set /p fullname=Enter full name: 
set /p email=Enter email (press Enter to skip): 
set /p password=Enter password: 

echo.
echo Creating super admin user...

curl -X POST "http://127.0.0.1:8000/auth/register" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"%username%\",\"password\":\"%password%\",\"full_name\":\"%fullname%\",\"email\":\"%email%\",\"role\":\"superadmin\",\"tenant_id\":null,\"school_id\":null}"

echo.
echo Super admin creation completed!
pause
