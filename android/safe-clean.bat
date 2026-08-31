@echo off
REM Safe Android clean: avoids broken :externalNativeBuildCleanDebug
REM when CMake/.cxx still points at deleted Gradle transform paths.

cd /d "%~dp0"

echo Stopping Gradle daemons...
call gradlew.bat --stop

echo Removing native/build caches...
if exist "app\.cxx" rmdir /s /q "app\.cxx"
if exist "app\build" rmdir /s /q "app\build"
if exist "build" rmdir /s /q "build"
if exist ".gradle" rmdir /s /q ".gradle"

echo Done. Do NOT run "gradlew clean" while .cxx is corrupt.
echo Next: from project root run: npx react-native run-android
