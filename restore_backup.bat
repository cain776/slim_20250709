@echo off
echo.
echo ================================================
echo  OMS Slim 백업 복원 시스템
echo ================================================
echo.

:: 백업 목록 확인
if not exist "backup_list.txt" (
    echo 백업 목록이 없습니다.
    pause
    exit /b
)

echo 사용 가능한 백업 목록:
echo.
type backup_list.txt
echo.

set /p backup_choice="복원할 백업 디렉토리명을 입력하세요 (예: backup_250709_234407): "

if not exist "%backup_choice%" (
    echo 선택한 백업 디렉토리가 존재하지 않습니다.
    pause
    exit /b
)

echo.
echo ================================================
echo  복원 시작: %backup_choice%
echo ================================================
echo.

:: 현재 파일 임시 백업
set "temp_backup=temp_backup_%date:~-2%%date:~3,2%%date:~6,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
mkdir "%temp_backup%"

echo [1/4] 현재 상태 임시 백업 중...
xcopy /E /H /C /I /Y "css" "%temp_backup%\css" > nul
xcopy /E /H /C /I /Y "js" "%temp_backup%\js" > nul
copy /Y "index.html" "%temp_backup%\" > nul
copy /Y "README.md" "%temp_backup%\" > nul
copy /Y "slim_20250709.html" "%temp_backup%\" > nul

echo [2/4] 현재 파일 삭제 중...
if exist "css" rmdir /S /Q "css"
if exist "js" rmdir /S /Q "js"
if exist "index.html" del /Q "index.html"
if exist "README.md" del /Q "README.md"

echo [3/4] 백업에서 복원 중...
xcopy /E /H /C /I /Y "%backup_choice%\css" "css" > nul
xcopy /E /H /C /I /Y "%backup_choice%\js" "js" > nul
copy /Y "%backup_choice%\index.html" "." > nul
copy /Y "%backup_choice%\README.md" "." > nul
copy /Y "%backup_choice%\slim_20250709.html" "." > nul

echo [4/4] 복원 완료!
echo.
echo ================================================
echo  복원 완료: %backup_choice%
echo  임시 백업 위치: %temp_backup%
echo ================================================
echo.
echo 복원이 성공적으로 완료되었습니다.
echo 문제가 없으면 임시 백업 폴더(%temp_backup%)는 삭제하셔도 됩니다.
echo.
pause 