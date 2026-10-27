@echo off
rem (2026-07-13) Build web assets, sync Capacitor Android & assemble debug APK
echo [1/3] Building web assets and PWA bundle...
call npm.cmd run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Asset build failed.
    exit /b %ERRORLEVEL%
)

echo [2/3] Syncing Android project...
call npx.cmd cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Capacitor sync failed.
    exit /b %ERRORLEVEL%
)

echo [3/3] Assembling Debug APK...
cd android
call gradlew.bat clean assembleDebug
set "GRADLE_EXIT=%ERRORLEVEL%"
cd ..

if %GRADLE_EXIT% NEQ 0 (
    echo [ERROR] Gradle build failed with exit code %GRADLE_EXIT%.
    exit /b %GRADLE_EXIT%
)

echo.
echo ============================================
echo  Build complete!
echo ============================================

set "APK_PATH=%~dp0android\app\build\outputs\apk\debug\app-debug.apk"
if exist "%APK_PATH%" (
    echo APK generated at: %APK_PATH%
    copy /Y "%APK_PATH%" "%~dp0android\app\build\outputs\apk\debug\pikol-debug.apk" >nul 2>&1
    explorer.exe /select,"%APK_PATH%"
) else (
    echo Note: Check android\app\build\outputs\apk\debug\ for generated APK.
)
rem (2026-07-13) Return 0 exit code on successful APK build; was unhandled code
exit /b 0

