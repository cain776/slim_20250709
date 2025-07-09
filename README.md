# eXmate slim 물류 관리 시스템 개발 가이드

## 📋 프로젝트 개요

eXmate slim은 AdminLTE 3 프레임워크를 기반으로 한 물류 관리 시스템입니다. 단일 페이지 애플리케이션(SPA) 구조로 되어 있으며, 사이드바 메뉴를 통해 다양한 기능에 접근할 수 있습니다.

## 🏗️ 파일 구조

```
oms_slim/
├── index.html              # 메인 HTML 파일
├── css/
│   ├── main.css           # 공통 스타일
│   └── dashboard.css      # 대시보드 전용 스타일
├── js/
│   ├── sidebar.js         # 사이드바 메뉴 관리
│   └── dashboard.js       # 대시보드 페이지 관리
├── README.md              # 프로젝트 가이드 (이 문서)
└── slim_20250709.html     # 원본 파일 (백업용)
```

## 🔧 기술 스택

- **UI Framework**: AdminLTE 3
- **CSS Framework**: Bootstrap 4
- **JavaScript Library**: jQuery 3.6.0
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Pretendard (웹폰트)

## 🚀 주요 기능

### 1. 대시보드 (홈)
- 전체 지연 현황 요약
- 공지사항 목록
- 상태별 상세 현황 테이블
- 바로가기 링크
- 프로모션 캐러셀

### 2. 메뉴 구조
- 홈 (대시보드)
- 공지사항
- 입고 관리
  - 입고 내역
  - 입고 등록
- 출고 관리
  - 출고 내역
  - 출고 등록
- 통계
- 설정

### 3. 기타 기능
- 복수화물 조회 모달
- 화물추적 가이드 모달
- URL 복사 기능
- 반응형 디자인

## 📝 새 메뉴 추가 방법

새로운 메뉴를 추가하려면 다음 6단계를 따라야 합니다:

### 1. 메뉴 데이터 추가
`js/sidebar.js`의 `menuData` 배열에 새 메뉴 객체를 추가합니다:

```javascript
const menuData = [
  // ... 기존 메뉴들
  { 
    id: 'new-menu', 
    name: '새 메뉴', 
    icon: 'fas fa-star',
    url: '#'
  }
];
```

### 2. HTML, CSS, JS 파일 생성
- `new-menu.html` - 페이지 콘텐츠
- `css/new-menu.css` - 페이지 전용 스타일
- `js/new-menu.js` - 페이지 로직

### 3. HTML 콘텐츠 작성
`new-menu.html`에 콘텐츠를 작성하고 최상위 요소에 고유 ID를 부여합니다:

```html
<div id="new-menu-content">
  <section class="content p-3">
    <div class="container-fluid">
      <!-- 페이지 콘텐츠 -->
    </div>
  </section>
</div>
```

### 4. JavaScript 초기화 함수 작성
`js/new-menu.js`에 명시적으로 호출할 초기화 함수를 작성합니다:

```javascript
function initializeNewMenuPage() {
  console.log('새 메뉴 페이지 초기화');
  // 페이지 초기화 로직
}

// 전역 함수로 노출
window.initializeNewMenuPage = initializeNewMenuPage;
```

### 5. index.html에 파일 연결
`index.html`에 새로 만든 CSS와 JS 파일을 연결합니다:

```html
<!-- Custom CSS -->
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/dashboard.css">
<link rel="stylesheet" href="css/new-menu.css">

<!-- Custom Scripts -->
<script src="js/sidebar.js"></script>
<script src="js/dashboard.js"></script>
<script src="js/new-menu.js"></script>
```

### 6. 사이드바 로드 로직 추가
`js/sidebar.js`의 `loadPage` 함수에 새 case를 추가합니다:

```javascript
function loadPage(pageId) {
  switch(pageId) {
    // ... 기존 케이스들
    case 'new-menu':
      loadNewMenu();
      break;
    default:
      loadDashboard();
  }
}

function loadNewMenu() {
  // HTML 로드 로직
  const newMenuHtml = `
    <section class="content p-3">
      <div class="container-fluid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title card-title-lg">새 메뉴</h3>
          </div>
          <div class="card-body">
            <p>새 메뉴 페이지입니다.</p>
          </div>
        </div>
      </div>
    </section>
  `;
  $('#main-content').html(newMenuHtml);
  initializePage('new-menu');
}
```

## 🎨 스타일링 가이드

### CSS 구조
- `css/main.css`: 전체 레이아웃과 공통 스타일
- `css/dashboard.css`: 대시보드 전용 스타일
- `css/[페이지명].css`: 각 페이지 전용 스타일

### 주요 CSS 클래스
- `.card-title-lg`: 카드 제목 스타일
- `.sub-title`: 부제목 스타일
- `.summary-box`: 요약 정보 박스
- `.quick-link-item`: 바로가기 버튼
- `.text-link`: 텍스트 링크
- `.loading`: 로딩 스타일
- `.error-message`: 에러 메시지 스타일

### 색상 변수
- Primary: #007bff
- Danger: #dc3545
- Warning: #ffc107
- Background: #f4f6f9

## 📱 반응형 디자인

### 브레이크포인트
- Desktop: 992px 이상
- Tablet: 768px ~ 991px
- Mobile: 767px 이하

### 반응형 고려사항
- 요약 박스 값 크기 조정
- 바로가기 버튼 패딩 조정
- 테이블 스크롤 처리
- 모바일에서 사이드바 접기

## 🔧 JavaScript 구조

### 주요 파일
- `js/sidebar.js`: 메뉴 관리 및 페이지 로딩
- `js/dashboard.js`: 대시보드 전용 로직

### 전역 함수
- `loadPage(pageId)`: 페이지 로드
- `getCurrentPage()`: 현재 페이지 반환
- `refreshCurrentPage()`: 현재 페이지 새로고침

### 페이지 초기화 패턴
```javascript
function initialize[PageName]Page() {
  console.log('페이지 초기화 시작');
  
  // 초기화 로직
  
  console.log('페이지 초기화 완료');
}
```

## 🐛 디버깅 및 로깅

### 콘솔 로그
- 페이지 로드 시작/완료
- 초기화 함수 호출
- 에러 발생 시 상세 정보

### 개발자 도구 활용
- Network 탭: 리소스 로딩 확인
- Console 탭: 에러 및 로그 확인
- Elements 탭: DOM 구조 확인

## 🌐 브라우저 지원

### 지원 브라우저
- Chrome (최신 2버전)
- Firefox (최신 2버전)
- Safari (최신 2버전)
- Edge (최신 2버전)

### 폴백 기능
- 클립보드 API 미지원시 대체 복사 기능
- ES6 미지원시 babel 트랜스파일 고려

## 📚 외부 라이브러리

### CDN 사용 라이브러리
- jQuery 3.6.0
- Bootstrap 4.6.2
- AdminLTE 3.2.0
- Font Awesome 6.4.0
- Pretendard 웹폰트

### 라이선스
- AdminLTE: MIT License
- Bootstrap: MIT License
- jQuery: MIT License
- Font Awesome: Free License

## 🚀 배포 가이드

### 배포 전 체크리스트
1. [ ] 모든 페이지 정상 동작 확인
2. [ ] 반응형 디자인 테스트
3. [ ] 브라우저 호환성 확인
4. [ ] 콘솔 에러 확인
5. [ ] 성능 최적화 확인

### 배포 방법
1. 정적 파일 서버에 업로드
2. CDN 리소스 로딩 확인
3. HTTPS 적용 권장

## 🔍 성능 최적화

### 권장사항
- 이미지 압축 및 WebP 포맷 사용
- CSS/JS 파일 압축 (minification)
- 브라우저 캐싱 활용
- 불필요한 DOM 조작 최소화

### 모니터링
- 페이지 로딩 시간 측정
- 메모리 사용량 모니터링
- 네트워크 요청 최적화

## 📞 문의 및 지원

개발 관련 문의사항이나 버그 발견 시 해당 프로젝트 관리자에게 연락하시기 바랍니다.

---

**마지막 업데이트**: 2025년 7월 9일
**버전**: 1.0.0 