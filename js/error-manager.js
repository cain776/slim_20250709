/**
 * ErrorManager.js - 에러 처리 관리 시스템
 * eXmate slim 물류 관리 시스템
 */

/**
 * 에러 타입 정의
 */
const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATA: 'data',
  UI: 'ui',
  SYSTEM: 'system',
  USER: 'user',
  API: 'api',
  UNKNOWN: 'unknown'
};

/**
 * 에러 레벨 정의
 */
const ERROR_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * 에러 관리자 클래스
 * - 에러 분류 및 처리
 * - 에러 로깅 및 모니터링
 * - 사용자 친화적 에러 메시지 표시
 * - 에러 복구 시도
 */
class ErrorManager {
  constructor() {
    this.errors = new Map();
    this.errorHandlers = new Map();
    this.errorCount = 0;
    this.maxErrorsToStore = 100;
    this.listeners = new Map();
    this.retryAttempts = new Map();
    this.maxRetryAttempts = 3;
    
    // 기본 에러 핸들러 등록
    this._registerDefaultHandlers();
    
    // 전역 에러 핸들러 등록
    this._setupGlobalErrorHandlers();
  }

  // ===========================================
  // 에러 처리 메서드
  // ===========================================

  /**
   * 에러 처리
   */
  handleError(error, context = {}) {
    const errorInfo = this._createErrorInfo(error, context);
    
    // 에러 저장
    this._storeError(errorInfo);
    
    // 에러 핸들러 실행
    this._executeErrorHandler(errorInfo);
    
    // 에러 이벤트 발생
    this._triggerErrorEvent(errorInfo);
    
    // 에러 리포팅
    this._reportError(errorInfo);
    
    return errorInfo;
  }

  /**
   * 네트워크 에러 처리
   */
  handleNetworkError(error, context = {}) {
    const errorInfo = this._createErrorInfo(error, {
      ...context,
      type: ERROR_TYPES.NETWORK,
      level: ERROR_LEVELS.MEDIUM
    });
    
    // 재시도 로직
    if (this._shouldRetry(errorInfo)) {
      this._scheduleRetry(errorInfo);
    }
    
    return this.handleError(error, errorInfo);
  }

  /**
   * 검증 에러 처리
   */
  handleValidationError(error, context = {}) {
    const errorInfo = this._createErrorInfo(error, {
      ...context,
      type: ERROR_TYPES.VALIDATION,
      level: ERROR_LEVELS.LOW
    });
    
    // 폼 필드 하이라이트
    this._highlightErrorFields(errorInfo);
    
    return this.handleError(error, errorInfo);
  }

  /**
   * API 에러 처리
   */
  handleApiError(error, context = {}) {
    const errorInfo = this._createErrorInfo(error, {
      ...context,
      type: ERROR_TYPES.API,
      level: this._determineApiErrorLevel(error)
    });
    
    // 상태 코드별 처리
    this._handleApiStatusCode(errorInfo);
    
    return this.handleError(error, errorInfo);
  }

  /**
   * 시스템 에러 처리
   */
  handleSystemError(error, context = {}) {
    const errorInfo = this._createErrorInfo(error, {
      ...context,
      type: ERROR_TYPES.SYSTEM,
      level: ERROR_LEVELS.HIGH
    });
    
    // 시스템 상태 확인
    this._checkSystemHealth();
    
    return this.handleError(error, errorInfo);
  }

  // ===========================================
  // 에러 핸들러 등록
  // ===========================================

  /**
   * 에러 핸들러 등록
   */
  registerHandler(type, handler) {
    if (!this.errorHandlers.has(type)) {
      this.errorHandlers.set(type, []);
    }
    this.errorHandlers.get(type).push(handler);
    return this;
  }

  /**
   * 에러 핸들러 해제
   */
  unregisterHandler(type, handler) {
    if (this.errorHandlers.has(type)) {
      const handlers = this.errorHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
    return this;
  }

  /**
   * 에러 이벤트 리스너 등록
   */
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(listener);
    return this;
  }

  /**
   * 에러 이벤트 리스너 해제
   */
  removeEventListener(type, listener) {
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  // ===========================================
  // 에러 조회 메서드
  // ===========================================

  /**
   * 에러 목록 조회
   */
  getErrors(filter = {}) {
    const errors = Array.from(this.errors.values());
    
    if (filter.type) {
      return errors.filter(error => error.type === filter.type);
    }
    
    if (filter.level) {
      return errors.filter(error => error.level === filter.level);
    }
    
    if (filter.timeRange) {
      const { start, end } = filter.timeRange;
      return errors.filter(error => 
        error.timestamp >= start && error.timestamp <= end
      );
    }
    
    return errors;
  }

  /**
   * 에러 통계 조회
   */
  getErrorStats() {
    const errors = Array.from(this.errors.values());
    const stats = {
      total: errors.length,
      byType: {},
      byLevel: {},
      recent: errors.filter(error => 
        Date.now() - error.timestamp < 60000
      ).length
    };
    
    // 타입별 통계
    for (const type of Object.values(ERROR_TYPES)) {
      stats.byType[type] = errors.filter(error => error.type === type).length;
    }
    
    // 레벨별 통계
    for (const level of Object.values(ERROR_LEVELS)) {
      stats.byLevel[level] = errors.filter(error => error.level === level).length;
    }
    
    return stats;
  }

  /**
   * 마지막 에러 조회
   */
  getLastError() {
    const errors = Array.from(this.errors.values());
    return errors.length > 0 ? errors[errors.length - 1] : null;
  }

  // ===========================================
  // 에러 복구 메서드
  // ===========================================

  /**
   * 에러 복구 시도
   */
  async tryRecover(errorId) {
    const errorInfo = this.errors.get(errorId);
    if (!errorInfo) return false;
    
    try {
      // 타입별 복구 로직
      switch (errorInfo.type) {
        case ERROR_TYPES.NETWORK:
          return await this._recoverNetworkError(errorInfo);
        case ERROR_TYPES.DATA:
          return await this._recoverDataError(errorInfo);
        case ERROR_TYPES.UI:
          return await this._recoverUIError(errorInfo);
        default:
          return false;
      }
    } catch (error) {
      console.error('에러 복구 실패:', error);
      return false;
    }
  }

  /**
   * 재시도 실행
   */
  async retry(errorId) {
    const errorInfo = this.errors.get(errorId);
    if (!errorInfo || !errorInfo.context.retryFunction) {
      return false;
    }
    
    const retryCount = this.retryAttempts.get(errorId) || 0;
    if (retryCount >= this.maxRetryAttempts) {
      return false;
    }
    
    try {
      this.retryAttempts.set(errorId, retryCount + 1);
      await errorInfo.context.retryFunction();
      this.retryAttempts.delete(errorId);
      return true;
    } catch (error) {
      this.handleError(error, {
        originalError: errorId,
        retryAttempt: retryCount + 1
      });
      return false;
    }
  }

  // ===========================================
  // 알림 메서드
  // ===========================================

  /**
   * 에러 알림 표시
   */
  showErrorNotification(error, options = {}) {
    const message = this._getUserFriendlyMessage(error);
    const level = error.level || ERROR_LEVELS.MEDIUM;
    
    const notificationOptions = {
      type: 'error',
      message: message,
      duration: this._getNotificationDuration(level),
      actions: this._getNotificationActions(error),
      ...options
    };
    
    this._displayNotification(notificationOptions);
  }

  /**
   * 에러 토스트 표시
   */
  showErrorToast(error, options = {}) {
    const message = this._getUserFriendlyMessage(error);
    const toastClass = this._getToastClass(error.level);
    
    const $toast = $(`
      <div class="toast ${toastClass}" role="alert">
        <div class="toast-header">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          <strong class="mr-auto">오류 발생</strong>
          <button type="button" class="btn-close" data-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>
      </div>
    `);
    
    $('#toast-container').append($toast);
    $toast.toast('show');
  }

  // ===========================================
  // 내부 메서드
  // ===========================================

  /**
   * 에러 정보 생성
   */
  _createErrorInfo(error, context = {}) {
    return {
      id: Utils.generateUUID(),
      message: error.message || error.toString(),
      stack: error.stack,
      type: context.type || this._determineErrorType(error),
      level: context.level || this._determineErrorLevel(error),
      timestamp: Date.now(),
      context: context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context.userId || null,
      sessionId: context.sessionId || null
    };
  }

  /**
   * 에러 저장
   */
  _storeError(errorInfo) {
    this.errors.set(errorInfo.id, errorInfo);
    this.errorCount++;
    
    // 최대 저장 수 초과 시 오래된 에러 삭제
    if (this.errors.size > this.maxErrorsToStore) {
      const oldestKey = this.errors.keys().next().value;
      this.errors.delete(oldestKey);
    }
  }

  /**
   * 에러 핸들러 실행
   */
  _executeErrorHandler(errorInfo) {
    const handlers = this.errorHandlers.get(errorInfo.type) || [];
    const globalHandlers = this.errorHandlers.get('*') || [];
    
    [...handlers, ...globalHandlers].forEach(handler => {
      try {
        handler(errorInfo);
      } catch (error) {
        console.error('에러 핸들러 실행 중 오류:', error);
      }
    });
  }

  /**
   * 에러 이벤트 발생
   */
  _triggerErrorEvent(errorInfo) {
    const listeners = this.listeners.get(errorInfo.type) || [];
    const globalListeners = this.listeners.get('*') || [];
    
    [...listeners, ...globalListeners].forEach(listener => {
      try {
        listener(errorInfo);
      } catch (error) {
        console.error('에러 이벤트 리스너 실행 중 오류:', error);
      }
    });
  }

  /**
   * 에러 리포팅
   */
  _reportError(errorInfo) {
    if (errorInfo.level === ERROR_LEVELS.CRITICAL) {
      // 중요한 에러는 즉시 리포팅
      this._sendErrorReport(errorInfo);
    } else {
      // 일반 에러는 배치로 리포팅
      this._queueErrorReport(errorInfo);
    }
  }

  /**
   * 에러 타입 결정
   */
  _determineErrorType(error) {
    if (error.name === 'TypeError') return ERROR_TYPES.SYSTEM;
    if (error.name === 'ReferenceError') return ERROR_TYPES.SYSTEM;
    if (error.name === 'SyntaxError') return ERROR_TYPES.SYSTEM;
    if (error.name === 'NetworkError') return ERROR_TYPES.NETWORK;
    if (error.name === 'ValidationError') return ERROR_TYPES.VALIDATION;
    if (error.status) return ERROR_TYPES.API;
    return ERROR_TYPES.UNKNOWN;
  }

  /**
   * 에러 레벨 결정
   */
  _determineErrorLevel(error) {
    if (error.name === 'ValidationError') return ERROR_LEVELS.LOW;
    if (error.status >= 500) return ERROR_LEVELS.HIGH;
    if (error.status >= 400) return ERROR_LEVELS.MEDIUM;
    return ERROR_LEVELS.MEDIUM;
  }

  /**
   * API 에러 레벨 결정
   */
  _determineApiErrorLevel(error) {
    if (error.status >= 500) return ERROR_LEVELS.HIGH;
    if (error.status === 401 || error.status === 403) return ERROR_LEVELS.MEDIUM;
    if (error.status >= 400) return ERROR_LEVELS.LOW;
    return ERROR_LEVELS.MEDIUM;
  }

  /**
   * 사용자 친화적 메시지 생성
   */
  _getUserFriendlyMessage(error) {
    const messages = {
      [ERROR_TYPES.NETWORK]: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
      [ERROR_TYPES.VALIDATION]: '입력한 정보를 확인해주세요.',
      [ERROR_TYPES.AUTHENTICATION]: '로그인이 필요합니다.',
      [ERROR_TYPES.AUTHORIZATION]: '접근 권한이 없습니다.',
      [ERROR_TYPES.DATA]: '데이터 처리 중 오류가 발생했습니다.',
      [ERROR_TYPES.UI]: '화면 표시 중 오류가 발생했습니다.',
      [ERROR_TYPES.SYSTEM]: '시스템 오류가 발생했습니다.',
      [ERROR_TYPES.API]: 'API 호출 중 오류가 발생했습니다.'
    };
    
    return messages[error.type] || '알 수 없는 오류가 발생했습니다.';
  }

  /**
   * 기본 에러 핸들러 등록
   */
  _registerDefaultHandlers() {
    // 네트워크 에러 핸들러
    this.registerHandler(ERROR_TYPES.NETWORK, (error) => {
      this.showErrorToast(error);
    });
    
    // 검증 에러 핸들러
    this.registerHandler(ERROR_TYPES.VALIDATION, (error) => {
      this._highlightErrorFields(error);
    });
    
    // 시스템 에러 핸들러
    this.registerHandler(ERROR_TYPES.SYSTEM, (error) => {
      console.error('시스템 오류:', error);
      this.showErrorNotification(error);
    });
  }

  /**
   * 전역 에러 핸들러 설정
   */
  _setupGlobalErrorHandlers() {
    // JavaScript 오류 핸들러
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleError(error || new Error(message), {
        source,
        lineno,
        colno,
        type: ERROR_TYPES.SYSTEM
      });
    };
    
    // Promise 거부 핸들러
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: ERROR_TYPES.SYSTEM,
        level: ERROR_LEVELS.HIGH
      });
    });
  }

  /**
   * 재시도 여부 결정
   */
  _shouldRetry(errorInfo) {
    const retryCount = this.retryAttempts.get(errorInfo.id) || 0;
    return retryCount < this.maxRetryAttempts && 
           errorInfo.type === ERROR_TYPES.NETWORK;
  }

  /**
   * 재시도 스케줄링
   */
  _scheduleRetry(errorInfo) {
    const retryCount = this.retryAttempts.get(errorInfo.id) || 0;
    const delay = Math.pow(2, retryCount) * 1000; // 지수 백오프
    
    setTimeout(() => {
      this.retry(errorInfo.id);
    }, delay);
  }

  /**
   * 알림 표시
   */
  _displayNotification(options) {
    // AdminLTE 알림 시스템 사용
    if (window.Swal) {
      Swal.fire({
        icon: 'error',
        title: '오류 발생',
        text: options.message,
        confirmButtonText: '확인'
      });
    } else {
      alert(options.message);
    }
  }

  /**
   * 토스트 클래스 결정
   */
  _getToastClass(level) {
    const classes = {
      [ERROR_LEVELS.LOW]: 'toast-warning',
      [ERROR_LEVELS.MEDIUM]: 'toast-danger',
      [ERROR_LEVELS.HIGH]: 'toast-danger',
      [ERROR_LEVELS.CRITICAL]: 'toast-danger'
    };
    return classes[level] || 'toast-danger';
  }

  /**
   * 에러 필드 하이라이트
   */
  _highlightErrorFields(errorInfo) {
    if (errorInfo.context.fields) {
      errorInfo.context.fields.forEach(field => {
        $(`#${field}`).addClass('is-invalid');
      });
    }
  }

  /**
   * 에러 리포트 전송
   */
  _sendErrorReport(errorInfo) {
    // 여기서 에러 리포팅 서비스로 전송
    console.log('에러 리포트 전송:', errorInfo);
  }

  /**
   * 에러 리포트 큐 추가
   */
  _queueErrorReport(errorInfo) {
    // 배치 리포팅을 위한 큐 추가
    console.log('에러 리포트 큐 추가:', errorInfo);
  }

  /**
   * API 상태 코드별 처리
   */
  _handleApiStatusCode(errorInfo) {
    const status = errorInfo.context.status;
    if (status === 401) {
      // 인증 실패
      console.log('인증 실패 - 로그인 페이지로 이동');
    } else if (status === 403) {
      // 권한 부족
      console.log('권한 부족 - 접근 거부');
    } else if (status >= 500) {
      // 서버 에러
      console.log('서버 에러 - 관리자에게 문의');
    }
  }

  /**
   * 시스템 상태 확인
   */
  _checkSystemHealth() {
    // 기본 시스템 상태 확인
    console.log('시스템 상태 확인 중...');
  }

  /**
   * 네트워크 에러 복구
   */
  async _recoverNetworkError(errorInfo) {
    console.log('네트워크 에러 복구 시도');
    return false;
  }

  /**
   * 데이터 에러 복구
   */
  async _recoverDataError(errorInfo) {
    console.log('데이터 에러 복구 시도');
    return false;
  }

  /**
   * UI 에러 복구
   */
  async _recoverUIError(errorInfo) {
    console.log('UI 에러 복구 시도');
    return false;
  }

  /**
   * 알림 지속 시간 결정
   */
  _getNotificationDuration(level) {
    const durations = {
      [ERROR_LEVELS.LOW]: 3000,
      [ERROR_LEVELS.MEDIUM]: 5000,
      [ERROR_LEVELS.HIGH]: 8000,
      [ERROR_LEVELS.CRITICAL]: 10000
    };
    return durations[level] || 5000;
  }

  /**
   * 알림 액션 버튼 생성
   */
  _getNotificationActions(error) {
    const actions = [];
    
    if (error.type === ERROR_TYPES.NETWORK) {
      actions.push({
        text: '재시도',
        handler: () => this.retry(error.id)
      });
    }
    
    return actions;
  }
}

// 전역 인스턴스 생성
const errorManager = new ErrorManager();

// 전역 스코프에 노출
window.ErrorManager = ErrorManager;
window.errorManager = errorManager;
window.ERROR_TYPES = ERROR_TYPES;
window.ERROR_LEVELS = ERROR_LEVELS; 