/**
 * Base-Page.js - 기본 페이지 클래스
 * eXmate slim 물류 관리 시스템
 */

/**
 * 모든 페이지의 기본 클래스
 */
class BasePage {
  constructor(pageId, title = '') {
    this.pageId = pageId;
    this.title = title;
    this.isInitialized = false;
    this.isLoading = false;
    this.data = null;
    this.refreshInterval = null;
    this.eventListeners = [];
    
    // 설정 및 서비스 참조
    this.config = Config;
    this.dataService = dataService;
    
    console.log(`페이지 생성: ${pageId}`);
  }

  /**
   * 페이지 라이프사이클 - 로드 (단순화)
   */
  async load() {
    try {
      // HTML 렌더링
      const html = await this.render();
      
      // 메인 콘텐츠 영역에 직접 삽입
      $('#main-content').html(html);
      
      // CSS 그리드 레이아웃 강제 적용
      this.forceGridLayout();
      
      // 이벤트 리스너 설정
      await this.setupEventListeners();
      
    } catch (error) {
      console.error(`페이지 로드 실패: ${this.pageId}`, error);
      $('#main-content').html(`
        <div class="content-header">
          <h1>오류</h1>
        </div>
        <div class="content">
          <div class="alert alert-danger">
            페이지 로드 중 오류가 발생했습니다: ${error.message}
          </div>
        </div>
      `);
    }
  }
  
  forceGridLayout() {
    // 기능 카드 컨테이너에 그리드 스타일 강제 적용
    const container = $('.function-cards-container');
    if (container.length > 0) {
      // Grid로 10개 카드 한줄 배치
      container.css({
        'display': 'grid !important',
        'grid-template-columns': 'repeat(10, 1fr) !important',
        'gap': '8px !important',
        'margin-bottom': '20px !important',
        'margin-top': '25px !important',
        'width': '100% !important',
        'padding': '0 !important',
        'max-width': '100% !important',
        'overflow': 'visible !important',
        'height': '120px !important'
      });
      
      // 모든 기존 스타일 제거 후 강제 적용
      container.attr('style', container.attr('style') + '; display: grid !important; grid-template-columns: repeat(10, 1fr) !important; gap: 8px !important; margin-top: 25px !important; height: 120px !important;');
      
      // 각 카드 래퍼에 flex 스타일 적용
      container.find('.function-card-wrapper').css({
        'display': 'flex',
        'width': '100%'
      });
      
      // 각 카드에 flex 스타일 적용
      container.find('.function-card').css({
        'flex': '1',
        'display': 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
        'align-items': 'center',
        'width': '100%',
        'height': '120px',
        'cursor': 'pointer',
        'border': '1px solid #dee2e6',
        'background': '#fff',
        'border-radius': '6px',
        'padding': '12px 8px',
        'text-align': 'center',
        'transition': 'all 0.2s ease',
        'max-width': '100%',
        'box-sizing': 'border-box',
        'position': 'relative',
        'z-index': '5'
      });
      
      // 아이콘 스타일
      container.find('.function-card .function-icon').css({
        'font-size': '24px',
        'color': '#007bff',
        'margin-bottom': '8px',
        'display': 'block'
      });
      
      // 제목 스타일
      container.find('.function-card .function-title').css({
        'font-size': '14px',
        'font-weight': '600',
        'color': '#333',
        'margin-bottom': '6px',
        'line-height': '1.2'
      });
      
      // 설명 스타일
      container.find('.function-card .function-desc').css({
        'font-size': '12px',
        'color': '#6c757d',
        'line-height': '1.3',
        'margin-bottom': '0',
        'text-align': 'center'
      });
      
      // 화면 크기 변경 시 동적 업데이트
      $(window).on('resize.gridLayout', () => {
        this.forceGridLayout();
      });
      
      // 추가 강제 적용 - DOM 직접 조작
      setTimeout(() => {
        const containerElement = container[0];
        if (containerElement) {
          containerElement.style.setProperty('display', 'grid', 'important');
          containerElement.style.setProperty('grid-template-columns', 'repeat(10, 1fr)', 'important');
          containerElement.style.setProperty('gap', '8px', 'important');
          containerElement.style.setProperty('margin-top', '20px', 'important');
          containerElement.style.setProperty('width', '100%', 'important');
          containerElement.style.setProperty('max-width', '100%', 'important');
        }
        
        // 카드 바디 패딩 및 z-index 강제 적용
        const cardBody = container.closest('.card-body');
        if (cardBody.length > 0) {
          cardBody.css({
            'padding-top': '20px !important',
            'padding-bottom': '20px !important',
            'position': 'relative !important',
            'z-index': '1 !important'
          });
        }
        
        // 카드 헤더 하단 여백 및 z-index 강제 적용
        const cardHeader = container.closest('.card').find('.card-header');
        if (cardHeader.length > 0) {
          cardHeader.css({
            'margin-bottom': '10px !important',
            'border-bottom': '1px solid #dee2e6 !important',
            'position': 'relative !important',
            'z-index': '0 !important'
          });
        }
        
        // 컨테이너 z-index 강제 적용
        container.css({
          'position': 'relative !important',
          'z-index': '2 !important'
        });
      }, 100);
    }
  }

  /**
   * 페이지 라이프사이클 - 언로드
   */
  unload() {
    console.log(`페이지 언로드: ${this.pageId}`);
    
    // 이벤트 리스너 제거
    this.removeEventListeners();
    
    // 새로고침 타이머 정리
    this.stopAutoRefresh();
    
    // 초기화 상태 리셋
    this.isInitialized = false;
    this.data = null;
  }

  /**
   * 데이터 로드 (하위 클래스에서 구현)
   */
  async loadData() {
    // 하위 클래스에서 구현
    console.log(`데이터 로드: ${this.pageId}`);
  }

  /**
   * HTML 렌더링 (하위 클래스에서 구현)
   */
  async render() {
    // 하위 클래스에서 구현
    const html = this.generateHtml();
    this.updateContent(html);
  }

  /**
   * HTML 생성 (하위 클래스에서 구현)
   */
  generateHtml() {
    return `
      <section class="content p-3">
        <div class="container-fluid">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title card-title-lg">${this.title}</h3>
            </div>
            <div class="card-body">
              <p>${this.title} 페이지입니다.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * 페이지 초기화
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn(`이미 초기화된 페이지: ${this.pageId}`);
      return;
    }

    console.log(`페이지 초기화: ${this.pageId}`);
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
    
    // 자동 새로고침 설정
    this.startAutoRefresh();
    
    // 애니메이션 효과
    this.applyAnimations();
    
    // 하위 클래스 초기화
    await this.onInitialize();
    
    this.isInitialized = true;
    console.log(`페이지 초기화 완료: ${this.pageId}`);
  }

  /**
   * 하위 클래스 초기화 훅
   */
  async onInitialize() {
    // 하위 클래스에서 구현
  }

  /**
   * 이벤트 리스너 설정
   */
  setupEventListeners() {
    // 하위 클래스에서 구현
  }

  /**
   * 이벤트 리스너 추가 (자동 정리를 위해)
   */
  addEventListener(selector, event, handler) {
    // EventManager 사용
    eventManager.on(selector, event, handler, this.pageId);
    this.eventListeners.push({ selector, event, handler });
  }

  /**
   * 모든 이벤트 리스너 제거
   */
  removeEventListeners() {
    // EventManager 네임스페이스로 등록된 이벤트들 제거
    eventManager.offNamespace(this.pageId);
    this.eventListeners = [];
  }

  /**
   * 콘텐츠 업데이트
   */
  updateContent(html) {
    $('#main-content').html(html);
  }

  /**
   * 로딩 표시
   */
  showLoading() {
    const loadingMessage = this.config.getStatusMessage('LOADING');
    const loadingHtml = `
      <div class="loading">
        <div class="spinner"></div>
        <span class="ml-2">${loadingMessage}</span>
      </div>
    `;
    this.updateContent(loadingHtml);
  }

  /**
   * 에러 표시
   */
  showError(message) {
    const errorMessage = message || this.config.getStatusMessage('ERROR');
    const errorHtml = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h4 class="mt-2">오류 발생</h4>
        <p class="mt-2">${errorMessage}</p>
        <button class="btn btn-primary mt-2" onclick="location.reload()">페이지 새로고침</button>
      </div>
    `;
    this.updateContent(errorHtml);
  }

  /**
   * 성공 메시지 표시
   */
  showSuccess(message) {
    const successMessage = message || this.config.getStatusMessage('SUCCESS');
    
    // 토스트 메시지 표시
    const toastHtml = `
      <div class="toast-message success">
        <i class="fas fa-check-circle"></i>
        <span>${successMessage}</span>
      </div>
    `;
    
    $('body').append(toastHtml);
    
    // 3초 후 제거
    setTimeout(() => {
      $('.toast-message').fadeOut(() => {
        $('.toast-message').remove();
      });
    }, 3000);
  }

  /**
   * 자동 새로고침 시작
   */
  startAutoRefresh() {
    const interval = this.config.getRefreshInterval(this.pageId);
    
    if (interval > 0) {
      this.refreshInterval = setInterval(() => {
        this.refresh();
      }, interval);
      
      console.log(`자동 새로고침 시작: ${this.pageId} (${interval}ms)`);
    }
  }

  /**
   * 자동 새로고침 중지
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log(`자동 새로고침 중지: ${this.pageId}`);
    }
  }

  /**
   * 페이지 새로고침
   */
  async refresh() {
    console.log(`페이지 새로고침: ${this.pageId}`);
    
    try {
      // 데이터 캐시 삭제
      this.dataService.clearCache();
      
      // 데이터 다시 로드
      await this.loadData();
      
      // 필요한 경우 UI 업데이트
      await this.onRefresh();
      
    } catch (error) {
      console.error(`페이지 새로고침 실패: ${this.pageId}`, error);
    }
  }

  /**
   * 새로고침 훅 (하위 클래스에서 구현)
   */
  async onRefresh() {
    // 하위 클래스에서 구현
  }

  /**
   * 애니메이션 효과 적용
   */
  applyAnimations() {
    const animationConfig = this.config.getUiConfig().animation;
    
    // 페이드 인 효과
    $('#main-content').find('.card').each((index, element) => {
      $(element).hide().fadeIn(animationConfig.duration * (index + 1));
    });
  }

  /**
   * 폼 검증
   */
  validateForm(selector) {
    const form = $(selector);
    let isValid = true;
    const errors = [];

    // 필수 입력 필드 검증
    form.find('[required]').each((index, element) => {
      const $element = $(element);
      const value = $element.val().trim();
      
      if (!value) {
        isValid = false;
        errors.push(`${$element.attr('placeholder') || $element.attr('name')}은(는) 필수 항목입니다.`);
        $element.addClass('is-invalid');
      } else {
        $element.removeClass('is-invalid');
      }
    });

    // 에러 메시지 표시
    if (!isValid) {
      const errorMessage = errors.join('<br>');
      this.showError(errorMessage);
    }

    return isValid;
  }

  /**
   * 데이터 포맷팅 (Utils 모듈 사용)
   */
  formatNumber(num) {
    return Utils.formatNumber(num);
  }

  formatDate(date, format = 'display') {
    return Utils.formatDate(date, format);
  }

  formatDateTime(date) {
    return Utils.formatDateTime(date);
  }

  /**
   * 유틸리티 메서드
   */
  getId() {
    return this.pageId;
  }

  getTitle() {
    return this.title;
  }

  isPageLoading() {
    return this.isLoading;
  }

  isPageInitialized() {
    return this.isInitialized;
  }

  getData() {
    return this.data;
  }

  setData(data) {
    this.data = data;
  }
}

// 전역 스코프에 노출
window.BasePage = BasePage; 