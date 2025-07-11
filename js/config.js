/**
 * Config.js - 전역 설정 및 상수 관리
 * eXmate slim 물류 관리 시스템
 */

// 시스템 설정
const APP_CONFIG = {
  // 앱 정보
  app: {
    name: 'eXmate slim',
    version: '1.0.0',
    description: '물류 관리 시스템',
    author: 'eXmate',
    defaultPage: 'dashboard'
  },

  // API 설정
  api: {
    baseUrl: 'https://api.exmate.net',
    timeout: 30000,
    retryCount: 3,
    endpoints: {
      tracking: '/tracking',
      notices: '/notices',
      statistics: '/statistics',
      settings: '/settings'
    }
  },

  // UI 설정
  ui: {
    theme: 'default',
    sidebar: {
      collapsed: false,
      mini: false
    },
    animation: {
      duration: 300,
      easing: 'ease-in-out'
    },
    pagination: {
      itemsPerPage: 10,
      maxPageLinks: 5
    }
  },

  // 데이터 새로고침 간격 (밀리초)
  refresh: {
    dashboard: 60000,    // 1분
    notices: 300000,     // 5분
    statistics: 180000   // 3분
  },

  // 로깅 설정
  logging: {
    level: 'info', // debug, info, warn, error
    console: true,
    remote: false
  }
};

// 메뉴 설정
const MENU_CONFIG = {
  structure: [
    { 
      id: 'dashboard', 
      name: '홈', 
      icon: 'fas fa-home',
      url: '#',
      active: true,
      order: 1
    },
    { 
      id: 'notice', 
      name: '공지', 
      icon: 'fas fa-bell',
      url: '#',
      order: 2
    },
    {
      id: 'orders',
      name: '주문',
      icon: 'fas fa-shopping-cart',
      hasSubmenu: true,
      order: 3,
      submenu: [
        { id: 'auto-order-register', name: '자동 주문 등록', url: '#', order: 1 },
        { id: 'manual-order-register', name: '수동 주문 등록', url: '#', order: 2 },
        { id: 'deleted-orders', name: '삭제 주문건', url: '#', order: 3 },
        { id: 'archived-orders', name: '보관 주문건', url: '#', order: 4 }
      ]
    },
    {
      id: 'inbound',
      name: '입고',
      icon: 'fas fa-box-open',
      hasSubmenu: true,
      order: 4,
      submenu: [
        { id: 'inbound-list', name: '입고목록', url: '#', order: 1 },
        { id: 'inbound-history', name: '입고 내역', url: '#', order: 2 },
        { id: 'inbound-register', name: '입고 등록', url: '#', order: 3 }
      ]
    },
    {
      id: 'outbound',
      name: '출고',
      icon: 'fas fa-paper-plane',
      hasSubmenu: true,
      order: 5,
      submenu: [
        { id: 'outbound-history', name: '출고 내역', url: '#', order: 1 },
        { id: 'outbound-register', name: '출고 등록', url: '#', order: 2 }
      ]
    },
    {
      id: 'inventory',
      name: '재고',
      icon: 'fas fa-warehouse',
      hasSubmenu: true,
      order: 6,
      submenu: [
        { id: 'inventory-adjustment', name: '재고조정', url: '#', order: 1 },
        { id: 'inventory-history', name: '재고 내역', url: '#', order: 2 },
        { id: 'inventory-status', name: '재고 현황', url: '#', order: 3 }
      ]
    },
    { 
      id: 'products', 
      name: '상품', 
      icon: 'fas fa-box',
      url: '#',
      order: 7
    },
    { 
      id: 'shipping', 
      name: '배송', 
      icon: 'fas fa-truck',
      url: '#',
      order: 8
    },
    { 
      id: 'settings', 
      name: '설정', 
      icon: 'fas fa-cog',
      url: '#',
      order: 9
    }
  ]
};

// 외부 링크 설정
const EXTERNAL_LINKS = {
  tracking: {
    baseUrl: 'https://pod.exmate.net/pod/',
    paramName: 'exmno',
    windowSpecs: 'width=760,height=600,scrollbars=yes,resizable=yes'
  },
  rateGuide: 'https://exm.exmate.net/rateguide/',
  companyInfo: 'https://exmate.net/EXMATE',
  support: 'https://exmate.net/support'
};

// 상태 코드 및 메시지
const STATUS_CONFIG = {
  codes: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
  },
  messages: {
    LOADING: '로딩 중...',
    SUCCESS: '성공적으로 처리되었습니다.',
    ERROR: '오류가 발생했습니다.',
    NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
    TIMEOUT: '요청 시간이 초과되었습니다.'
  }
};

// 로컬 스토리지 키
const STORAGE_KEYS = {
  userSettings: 'exmate_user_settings',
  dashboardCache: 'exmate_dashboard_cache',
  noticeCache: 'exmate_notice_cache',
  sidebarState: 'exmate_sidebar_state'
};

// 날짜 포맷 설정
const DATE_FORMAT = {
  display: 'YYYY-MM-DD',
  displayWithTime: 'YYYY-MM-DD HH:mm',
  api: 'YYYY-MM-DD HH:mm:ss',
  short: 'MM-DD'
};

// 정규표현식 패턴
const REGEX_PATTERNS = {
  trackingNumber: /^[A-Z0-9]{10,15}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+82|0)?[1-9]\d{8,9}$/,
  postalCode: /^\d{5}$/
};

// 설정 접근 함수들
const Config = {
  /**
   * 앱 설정 가져오기
   */
  getAppConfig: () => APP_CONFIG.app,

  /**
   * API 설정 가져오기
   */
  getApiConfig: () => APP_CONFIG.api,

  /**
   * UI 설정 가져오기
   */
  getUiConfig: () => APP_CONFIG.ui,

  /**
   * 메뉴 구조 가져오기
   */
  getMenuConfig: () => MENU_CONFIG.structure,

  /**
   * 외부 링크 설정 가져오기
   */
  getExternalLinks: () => EXTERNAL_LINKS,

  /**
   * 상태 메시지 가져오기
   */
  getStatusMessage: (key) => STATUS_CONFIG.messages[key] || STATUS_CONFIG.messages.ERROR,

  /**
   * 스토리지 키 가져오기
   */
  getStorageKey: (key) => STORAGE_KEYS[key],

  /**
   * 날짜 포맷 가져오기
   */
  getDateFormat: (type = 'display') => DATE_FORMAT[type],

  /**
   * 정규표현식 패턴 가져오기
   */
  getRegexPattern: (type) => REGEX_PATTERNS[type],

  /**
   * 새로고침 간격 가져오기
   */
  getRefreshInterval: (page) => APP_CONFIG.refresh[page] || 60000,

  /**
   * 로깅 레벨 확인
   */
  shouldLog: (level) => {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(APP_CONFIG.logging.level);
    const requestLevel = levels.indexOf(level);
    return requestLevel >= currentLevel;
  }
};

// 파일 크기 모니터링 설정
const MONITORING_CONFIG = {
  INDEX_FILE_WARNING_SIZE: 50000,    // 50KB 경고
  INDEX_FILE_CRITICAL_SIZE: 100000,  // 100KB 위험
  INDEX_FILE_MAX_LINES: 1000,        // 1000줄 최대
  
  // 분리 권장 임계값
  REFACTORING_THRESHOLDS: {
    fileSize: 100000,      // 100KB 이상
    lineCount: 2000,       // 2000줄 이상
    teamSize: 3,           // 개발팀 3명 이상
    menuCount: 20,         // 메뉴 20개 이상
    modalCount: 10         // 모달 10개 이상
  }
};

// 전역 스코프에 노출
window.Config = Config;
window.APP_CONFIG = APP_CONFIG;
window.MENU_CONFIG = MENU_CONFIG;
window.EXTERNAL_LINKS = EXTERNAL_LINKS;
window.STATUS_CONFIG = STATUS_CONFIG; 