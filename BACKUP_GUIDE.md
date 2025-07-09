# 🔒 OMS Slim 백업 전략 가이드

## 📋 백업 전략 개요

리팩토링 과정에서 안전성을 보장하기 위한 4단계 백업 시스템입니다.

### 🎯 백업 목표
- **안전한 리팩토링**: 각 단계별 롤백 가능
- **코드 이력 관리**: 모든 변경 사항 추적
- **빠른 복원**: 문제 발생 시 즉시 복원
- **개발 연속성**: 중단 없는 개발 진행

---

## 🛠️ 백업 도구 사용법

### 1. 자동 백업 스크립트

```batch
# 백업 생성
.\backup_strategy.bat

# 백업 복원
.\restore_backup.bat
```

### 2. 수동 백업 (필요시)

```powershell
# 빠른 백업
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupName = "manual_backup_$timestamp"
mkdir $backupName
Copy-Item -Path ".\*" -Destination ".\$backupName" -Recurse -Force -Exclude "backup*"
```

---

## 📅 단계별 백업 계획

### Phase 1: 설정 분리 (백업 필수)
```
backup_250709_phase1_config_start    # 시작 전
backup_250709_phase1_config_complete # 완료 후
```

### Phase 2: 페이지 팩토리 (백업 필수)
```
backup_250709_phase2_factory_start   # 시작 전
backup_250709_phase2_factory_complete # 완료 후
```

### Phase 3: 유틸리티 분리 (백업 권장)
```
backup_250709_phase3_utils_start     # 시작 전
backup_250709_phase3_utils_complete  # 완료 후
```

### Phase 4: 최종 통합 (백업 필수)
```
backup_250709_phase4_final_start     # 시작 전
backup_250709_phase4_final_complete  # 완료 후
```

---

## 🔄 리팩토링 중 백업 워크플로우

### 1. 각 단계 시작 전
```batch
# 백업 생성
.\backup_strategy.bat

# 백업 확인
dir backup_*
```

### 2. 코드 변경 중 (실시간 백업)
```powershell
# 중간 체크포인트 백업
$phase = "phase1_checkpoint"
$timestamp = Get-Date -Format "HHmmss"
$backupName = "backup_$phase_$timestamp"
mkdir $backupName
Copy-Item -Path ".\*" -Destination ".\$backupName" -Recurse -Force -Exclude "backup*"
```

### 3. 단계 완료 후
```batch
# 최종 백업
.\backup_strategy.bat

# 테스트 진행
# 브라우저에서 기능 확인
```

### 4. 문제 발생 시
```batch
# 즉시 복원
.\restore_backup.bat

# 가장 최근 안정 버전 선택
# 복원 후 재시작
```

---

## 📊 백업 상태 모니터링

### 백업 목록 확인
```batch
# 백업 목록 보기
type backup_list.txt

# 백업 크기 확인
for /d %i in (backup_*) do @echo %i && dir "%i" | findstr "바이트"
```

### 백업 정보 확인
```batch
# 특정 백업 정보
type backup_250709_234407\backup_info.txt

# 백업 내용 비교
fc /B backup_250709_234407\index.html index.html
```

---

## 🚨 비상 복원 절차

### 1. 즉시 복원 (빠른 방법)
```batch
.\restore_backup.bat
```

### 2. 수동 복원 (세밀한 제어)
```powershell
# 백업 목록 확인
dir backup_*

# 특정 백업 복원
$backupDir = "backup_250709_234407"
Remove-Item -Path "css" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "js" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "index.html" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "README.md" -Force -ErrorAction SilentlyContinue

Copy-Item -Path ".\$backupDir\*" -Destination "." -Recurse -Force
```

### 3. 원본 파일 복원
```batch
# 원본 파일만 복원
copy backup\slim_20250709.html .
# 원본 파일 이름 변경
ren slim_20250709.html index.html
```

---

## 🧹 백업 정리 전략

### 1. 자동 정리 스크립트
```batch
# 7일 이상 된 백업 삭제 (주의!)
forfiles /p . /m backup_* /d -7 /c "cmd /c if @isdir==TRUE rmdir /s /q @path"
```

### 2. 수동 정리
```batch
# 백업 크기 확인
for /d %i in (backup_*) do @echo %i && dir "%i" /s | findstr "바이트"

# 선택적 삭제
rmdir /s /q backup_250709_234407
```

---

## 📈 백업 검증 체크리스트

### ✅ 백업 전 확인사항
- [ ] 현재 코드가 정상 작동하는지 확인
- [ ] 백업 스크립트가 올바르게 실행되는지 확인
- [ ] 백업 디렉토리에 모든 파일이 포함되었는지 확인

### ✅ 백업 후 확인사항
- [ ] 백업 파일 크기가 원본과 일치하는지 확인
- [ ] 백업 정보 파일이 생성되었는지 확인
- [ ] 백업 목록이 업데이트되었는지 확인

### ✅ 복원 후 확인사항
- [ ] 브라우저에서 페이지가 정상 로드되는지 확인
- [ ] 메뉴 네비게이션이 작동하는지 확인
- [ ] 대시보드 기능이 정상 작동하는지 확인

---

## 🔗 관련 파일

- `backup_strategy.bat` - 자동 백업 스크립트
- `restore_backup.bat` - 복원 스크립트
- `backup_list.txt` - 백업 목록 (자동 생성)
- `backup_*/backup_info.txt` - 각 백업의 상세 정보

---

## 💡 백업 모범 사례

1. **리팩토링 전 필수 백업**: 모든 변경 작업 전 백업 생성
2. **단계별 백업**: 각 리팩토링 단계마다 백업 생성
3. **테스트 후 백업**: 기능 검증 후 안정 버전 백업
4. **명확한 백업 명명**: 백업 목적과 시점을 명확히 표시
5. **정기적 백업 정리**: 불필요한 백업 파일 정리

리팩토링 과정에서 이 가이드를 따라하시면 안전하고 체계적인 코드 개선이 가능합니다! 