@echo off
echo.
echo ================================================
echo  OMS Slim 백업 시스템
echo ================================================
echo.

:: 날짜/시간 생성
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "SS=%dt:~12,2%"
set "timestamp=%YY%%MM%%DD%_%HH%%Min%%SS%"

:: 백업 디렉토리 생성
set "backup_dir=backup_%timestamp%"
mkdir "%backup_dir%"

echo [1/4] 백업 디렉토리 생성 완료: %backup_dir%

:: 현재 파일들 백업
xcopy /E /H /C /I /Y "css" "%backup_dir%\css"
xcopy /E /H /C /I /Y "js" "%backup_dir%\js"
copy /Y "index.html" "%backup_dir%\"
copy /Y "README.md" "%backup_dir%\"
copy /Y "slim_20250709.html" "%backup_dir%\"

echo [2/4] 프로젝트 파일 백업 완료

:: 백업 상태 파일 생성
echo 백업 생성 시간: %date% %time% > "%backup_dir%\backup_info.txt"
echo 백업 디렉토리: %backup_dir% >> "%backup_dir%\backup_info.txt"
echo 백업 파일 목록: >> "%backup_dir%\backup_info.txt"
dir /B "%backup_dir%" >> "%backup_dir%\backup_info.txt"

echo [3/4] 백업 정보 파일 생성 완료

:: 백업 목록 업데이트
if not exist "backup_list.txt" (
    echo === OMS Slim 백업 목록 === > backup_list.txt
    echo. >> backup_list.txt
)
echo %timestamp% - %backup_dir% >> backup_list.txt

echo [4/4] 백업 목록 업데이트 완료
echo.
echo ================================================
echo  백업 완료: %backup_dir%
echo ================================================
echo.
pause 