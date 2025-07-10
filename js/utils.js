/**
 * Utils.js - 공통 유틸리티 함수
 * eXmate slim 물류 관리 시스템
 */

/**
 * 유틸리티 함수 모음
 */
const Utils = {
  
  // ===========================================
  // 포맷팅 함수들
  // ===========================================
  
  /**
   * 숫자 포맷팅 (한국 형식)
   */
  formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    return new Intl.NumberFormat('ko-KR').format(num);
  },

  /**
   * 통화 포맷팅
   */
  formatCurrency(amount, currency = 'KRW') {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0원';
    }
    
    if (currency === 'KRW') {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      }).format(amount);
    }
    
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * 날짜 포맷팅
   */
  formatDate(date, format = 'display') {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const formats = {
      display: { year: 'numeric', month: '2-digit', day: '2-digit' },
      short: { month: '2-digit', day: '2-digit' },
      long: { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      },
      api: { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }
    };

    const formatOptions = formats[format] || formats.display;
    return dateObj.toLocaleDateString('ko-KR', formatOptions);
  },

  /**
   * 날짜/시간 포맷팅
   */
  formatDateTime(date) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },

  /**
   * 상대 시간 포맷팅 (예: "3분 전", "2시간 전")
   */
  formatRelativeTime(date) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - dateObj;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    if (diffMs < minute) {
      return '방금 전';
    } else if (diffMs < hour) {
      return `${Math.floor(diffMs / minute)}분 전`;
    } else if (diffMs < day) {
      return `${Math.floor(diffMs / hour)}시간 전`;
    } else if (diffMs < week) {
      return `${Math.floor(diffMs / day)}일 전`;
    } else if (diffMs < month) {
      return `${Math.floor(diffMs / week)}주 전`;
    } else if (diffMs < year) {
      return `${Math.floor(diffMs / month)}개월 전`;
    } else {
      return `${Math.floor(diffMs / year)}년 전`;
    }
  },

  /**
   * 파일 크기 포맷팅
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // ===========================================
  // 검증 함수들
  // ===========================================

  /**
   * 이메일 검증
   */
  validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  },

  /**
   * 전화번호 검증
   */
  validatePhone(phone) {
    const pattern = /^(01[016789]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
    return pattern.test(phone);
  },

  /**
   * 운송장번호 검증
   */
  validateTrackingNumber(trackingNumber) {
    const pattern = /^[0-9]{10,15}$/;
    return pattern.test(trackingNumber);
  },

  /**
   * 우편번호 검증
   */
  validatePostalCode(postalCode) {
    const pattern = /^[0-9]{5}$/;
    return pattern.test(postalCode);
  },

  /**
   * 필수 입력 필드 검증
   */
  validateRequired(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
  },

  /**
   * 숫자 범위 검증
   */
  validateNumberRange(value, min = -Infinity, max = Infinity) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // ===========================================
  // DOM 조작 함수들
  // ===========================================

  /**
   * 요소 표시/숨김
   */
  toggleElement(selector, show = null) {
    const $element = $(selector);
    if ($element.length) {
      if (show === null) {
        $element.toggle();
      } else if (show) {
        $element.show();
      } else {
        $element.hide();
      }
    }
  },

  /**
   * 클래스 토글
   */
  toggleClass(selector, className, add = null) {
    const $element = $(selector);
    if ($element.length) {
      if (add === null) {
        $element.toggleClass(className);
      } else if (add) {
        $element.addClass(className);
      } else {
        $element.removeClass(className);
      }
    }
  },

  /**
   * 안전한 HTML 설정
   */
  setHTML(selector, html) {
    const $element = $(selector);
    if ($element.length) {
      $element.html(html);
    }
  },

  /**
   * 안전한 텍스트 설정
   */
  setText(selector, text) {
    const $element = $(selector);
    if ($element.length) {
      $element.text(text);
    }
  },

  /**
   * 스크롤 애니메이션
   */
  scrollTo(selector, offset = 0, duration = 500) {
    const $element = $(selector);
    if ($element.length) {
      $('html, body').animate({
        scrollTop: $element.offset().top + offset
      }, duration);
    }
  },

  // ===========================================
  // 배열/객체 조작 함수들
  // ===========================================

  /**
   * 배열에서 중복 제거
   */
  uniqueArray(array) {
    return [...new Set(array)];
  },

  /**
   * 객체 깊은 복사
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item));
    }
    
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    
    return cloned;
  },

  /**
   * 객체 병합
   */
  mergeObjects(target, ...sources) {
    if (!target) target = {};
    
    sources.forEach(source => {
      if (source) {
        Object.keys(source).forEach(key => {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = this.mergeObjects(target[key] || {}, source[key]);
          } else {
            target[key] = source[key];
          }
        });
      }
    });
    
    return target;
  },

  /**
   * 배열 정렬 (한국어 지원)
   */
  sortArray(array, key = null, direction = 'asc') {
    const sorted = [...array];
    
    sorted.sort((a, b) => {
      let valueA = key ? a[key] : a;
      let valueB = key ? b[key] : b;
      
      // 한국어 정렬 지원
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const result = valueA.localeCompare(valueB, 'ko-KR');
        return direction === 'asc' ? result : -result;
      }
      
      // 숫자 정렬
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // 날짜 정렬
      if (valueA instanceof Date && valueB instanceof Date) {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // 기본 정렬
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  },

  // ===========================================
  // 문자열 조작 함수들
  // ===========================================

  /**
   * 문자열 자르기 (말줄임표 추가)
   */
  truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  /**
   * 카멜케이스 변환
   */
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  /**
   * 케밥케이스 변환
   */
  toKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  },

  /**
   * 문자열 마스킹
   */
  maskString(str, maskChar = '*', keepFirst = 2, keepLast = 2) {
    if (!str || str.length <= keepFirst + keepLast) {
      return str;
    }
    
    const firstPart = str.substring(0, keepFirst);
    const lastPart = str.substring(str.length - keepLast);
    const maskLength = str.length - keepFirst - keepLast;
    const mask = maskChar.repeat(maskLength);
    
    return firstPart + mask + lastPart;
  },

  // ===========================================
  // 로컬 스토리지 헬퍼 함수들
  // ===========================================

  /**
   * 로컬 스토리지 저장
   */
  saveToStorage(key, data, expiry = null) {
    try {
      const item = {
        data: data,
        timestamp: Date.now(),
        expiry: expiry
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
      return false;
    }
  },

  /**
   * 로컬 스토리지 읽기
   */
  getFromStorage(key) {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;
      
      const item = JSON.parse(itemStr);
      
      // 만료 시간 확인
      if (item.expiry && Date.now() > item.timestamp + item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.error('로컬 스토리지 읽기 실패:', error);
      return null;
    }
  },

  /**
   * 로컬 스토리지 삭제
   */
  removeFromStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('로컬 스토리지 삭제 실패:', error);
      return false;
    }
  },

  // ===========================================
  // 기타 유틸리티 함수들
  // ===========================================

  /**
   * 지연 실행
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 디바운스 함수
   */
  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * 스로틀 함수
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * UUID 생성
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * 랜덤 문자열 생성
   */
  generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * 쿠키 설정
   */
  setCookie(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  /**
   * 쿠키 읽기
   */
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  /**
   * 쿠키 삭제
   */
  deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// 전역 스코프에 노출
window.Utils = Utils; 

/**
 * 파일 구조 모니터링 유틸리티
 */
const StructureMonitor = {
  
  /**
   * 현재 프로젝트 구조 분석
   */
  analyzeProjectStructure: function() {
    const analysis = {
      timestamp: new Date().toISOString(),
      menuCount: 0,
      modalCount: 0,
      estimatedIndexSize: 0,
      warnings: [],
      recommendations: []
    };
    
    // 메뉴 개수 계산
    const menuItems = document.querySelectorAll('#lnb-menu .nav-link[data-page]');
    analysis.menuCount = menuItems.length;
    
    // 모달 개수 계산
    const modals = document.querySelectorAll('.modal');
    analysis.modalCount = modals.length;
    
    // 경고 및 권장사항 생성
    const thresholds = MONITORING_CONFIG.REFACTORING_THRESHOLDS;
    
    if (analysis.menuCount > thresholds.menuCount * 0.8) {
      analysis.warnings.push(`메뉴 개수가 ${analysis.menuCount}개입니다. ${thresholds.menuCount}개 도달 시 구조 개선 검토 필요`);
    }
    
    if (analysis.modalCount > thresholds.modalCount * 0.8) {
      analysis.warnings.push(`모달 개수가 ${analysis.modalCount}개입니다. ${thresholds.modalCount}개 도달 시 분리 권장`);
    }
    
    // 권장사항
    if (analysis.menuCount > 10) {
      analysis.recommendations.push('메뉴 그룹화 또는 카테고리 분류 검토');
    }
    
    if (analysis.modalCount > 5) {
      analysis.recommendations.push('모달 컴포넌트 분리 검토');
    }
    
    return analysis;
  },
  
  /**
   * 구조 분석 결과 출력
   */
  logStructureAnalysis: function() {
    const analysis = this.analyzeProjectStructure();
    
    console.group('📊 프로젝트 구조 분석');
    console.log('📅 분석 시점:', analysis.timestamp);
    console.log('📋 메뉴 개수:', analysis.menuCount);
    console.log('🔧 모달 개수:', analysis.modalCount);
    
    if (analysis.warnings.length > 0) {
      console.group('⚠️ 경고사항');
      analysis.warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }
    
    if (analysis.recommendations.length > 0) {
      console.group('💡 권장사항');
      analysis.recommendations.forEach(rec => console.info(rec));
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return analysis;
  },
  
  /**
   * 리팩토링 필요 여부 판단
   */
  needsRefactoring: function() {
    const analysis = this.analyzeProjectStructure();
    const thresholds = MONITORING_CONFIG.REFACTORING_THRESHOLDS;
    
    const criticalCount = [
      analysis.menuCount >= thresholds.menuCount,
      analysis.modalCount >= thresholds.modalCount,
    ].filter(Boolean).length;
    
    return {
      immediate: criticalCount >= 2,
      planning: criticalCount >= 1,
      analysis: analysis
    };
  }
};

// 전역 스코프에 노출
window.StructureMonitor = StructureMonitor; 