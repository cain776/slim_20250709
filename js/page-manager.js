/**
 * Page-Manager.js - 페이지 관리자
 * eXmate slim 물류 관리 시스템
 */

/**
 * 페이지 관리자 클래스
 */
class PageManager {
  constructor() {
    this.pages = new Map();
    this.currentPage = null;
    this.pageClasses = new Map();
    this.config = Config;
    this.isLoading = false; // 로딩 상태 플래그
    
    // 페이지 클래스 등록
    this.registerPageClasses();
    
    console.log('PageManager 초기화 완료');
  }

  /**
   * 페이지 클래스 등록
   */
  registerPageClasses() {
    // 기본 페이지들 등록
    this.pageClasses.set('dashboard', DashboardPage);
    this.pageClasses.set('notice', NoticePage);
    
    // 기존 주문 페이지들
    this.pageClasses.set('manual-order-register', ManualOrderRegisterPage);
    this.pageClasses.set('deleted-orders', DeletedOrdersPage);
    this.pageClasses.set('archived-orders', ArchivedOrdersPage);
    
    // 기존 페이지들
    this.pageClasses.set('inbound-list', InboundListPage);
    this.pageClasses.set('inbound-history', InboundHistoryPage);
    this.pageClasses.set('inbound-register', InboundRegisterPage);
    this.pageClasses.set('outbound-history', OutboundHistoryPage);
    this.pageClasses.set('outbound-register', OutboundRegisterPage);
    this.pageClasses.set('inventory-adjustment', InventoryAdjustmentPage);
    this.pageClasses.set('statistics', StatisticsPage);
    this.pageClasses.set('settings', SettingsPage);

    console.log('기본 페이지 클래스 등록 완료:', Array.from(this.pageClasses.keys()));
  }

  /**
   * 새로운 페이지 클래스들 추가 등록 (인스턴스 생성 후 호출)
   */
  registerNewPageClasses() {
    // 새로운 주문등록 페이지들
    this.pageClasses.set('qoo10-order-register', Qoo10OrderRegisterPage);
    this.pageClasses.set('rakuten-order-register', RakutenOrderRegisterPage);
    this.pageClasses.set('nhn-order-register', NhnOrderRegisterPage);
    this.pageClasses.set('playauto-order-register', PlayAutoOrderRegisterPage);
    
    // 새로운 주문관리 페이지들
    this.pageClasses.set('order-info-management', OrderInfoManagementPage);
    this.pageClasses.set('deleted-order-management', DeletedOrderManagementPage);
    this.pageClasses.set('archived-order-management', ArchivedOrderManagementPage);

    console.log('새로운 페이지 클래스 등록 완료:', Array.from(this.pageClasses.keys()));
  }

  /**
   * 페이지 클래스 추가 등록
   */
  registerPageClass(pageId, pageClass) {
    if (typeof pageClass !== 'function') {
      throw new Error(`페이지 클래스가 아닙니다: ${pageId}`);
    }
    
    this.pageClasses.set(pageId, pageClass);
    console.log(`페이지 클래스 등록: ${pageId}`);
  }

  /**
   * 페이지 인스턴스 생성
   */
  createPageInstance(pageId) {
    const PageClass = this.pageClasses.get(pageId);
    
    if (!PageClass) {
      console.warn(`등록되지 않은 페이지: ${pageId}, 기본 페이지 사용`);
      return new BasePage(pageId, this.getPageTitle(pageId));
    }

    try {
      const instance = new PageClass(pageId);
      return instance;
    } catch (error) {
      console.error(`페이지 인스턴스 생성 실패: ${pageId}`, error);
      return new BasePage(pageId, this.getPageTitle(pageId));
    }
  }

  /**
   * 페이지 제목 가져오기
   */
  getPageTitle(pageId) {
    const menuConfig = this.config.getMenuConfig();
    
    // 최상위 메뉴에서 찾기
    const topMenu = menuConfig.find(menu => menu.id === pageId);
    if (topMenu) {
      return topMenu.name;
    }
    
    // 서브메뉴에서 찾기
    for (const menu of menuConfig) {
      if (menu.submenu) {
        const subMenu = menu.submenu.find(sub => sub.id === pageId);
        if (subMenu) {
          return subMenu.name;
        }
      }
    }
    
    return pageId;
  }

  /**
   * 페이지 로드
   */
  async loadPage(pageId) {
    // 현재 페이지와 동일한 경우 무시
    if (this.currentPage && this.currentPage.getId() === pageId) {
      return this.currentPage;
    }
    
    try {
      // 새 페이지 인스턴스 생성
      let page = this.pages.get(pageId);
      if (!page) {
        page = this.createPageInstance(pageId);
        this.pages.set(pageId, page);
      }

      // 페이지 로드
      await page.load();
      
      // 현재 페이지 설정
      this.currentPage = page;
      
      return page;
      
    } catch (error) {
      console.error(`페이지 로드 실패: ${pageId}`, error);
      
      // 에러 발생 시 기본 페이지로 대체
      const errorPage = new BasePage(pageId, this.getPageTitle(pageId));
      errorPage.showError(`페이지 로드 중 오류가 발생했습니다: ${error.message}`);
      this.currentPage = errorPage;
      
      return errorPage;
    }
  }

  /**
   * 현재 페이지 언로드
   */
  async unloadCurrentPage() {
    if (this.currentPage) {
      console.log(`현재 페이지 언로드: ${this.currentPage.getId()}`);
      
      try {
        await this.currentPage.unload();
      } catch (error) {
        console.error('페이지 언로드 실패:', error);
      }
      
      this.currentPage = null;
    }
  }

  /**
   * 메뉴 활성화 상태 업데이트
   */
  updateMenuState(pageId) {
    const $lnbMenu = $('#lnb-menu');
    
    // 모든 메뉴 비활성화
    $lnbMenu.find('.nav-link').removeClass('active');
    
    // 해당 페이지 메뉴 활성화
    const $targetLink = $lnbMenu.find(`[data-page="${pageId}"]`);
    if ($targetLink.length) {
      $targetLink.addClass('active');
      
      // 서브메뉴인 경우 부모 메뉴도 활성화
      const $parentItem = $targetLink.closest('.nav-item.has-treeview');
      if ($parentItem.length) {
        $parentItem.children('.nav-link').addClass('active');
      }
    }
  }

  /**
   * 페이지 새로고침
   */
  async refreshCurrentPage() {
    if (this.currentPage) {
      console.log(`현재 페이지 새로고침: ${this.currentPage.getId()}`);
      
      try {
        await this.currentPage.refresh();
        console.log('페이지 새로고침 완료');
      } catch (error) {
        console.error('페이지 새로고침 실패:', error);
        this.currentPage.showError('페이지 새로고침 중 오류가 발생했습니다.');
      }
    }
  }

  /**
   * 페이지 인스턴스 가져오기
   */
  getPageInstance(pageId) {
    return this.pages.get(pageId);
  }

  /**
   * 현재 페이지 가져오기
   */
  getCurrentPage() {
    return this.currentPage;
  }

  /**
   * 현재 페이지 ID 가져오기
   */
  getCurrentPageId() {
    return this.currentPage ? this.currentPage.getId() : null;
  }

  /**
   * 페이지 존재 여부 확인
   */
  hasPage(pageId) {
    return this.pages.has(pageId);
  }

  /**
   * 페이지 인스턴스 제거
   */
  removePage(pageId) {
    const page = this.pages.get(pageId);
    if (page) {
      page.unload();
      this.pages.delete(pageId);
      console.log(`페이지 인스턴스 제거: ${pageId}`);
    }
  }

  /**
   * 모든 페이지 인스턴스 제거
   */
  clearAllPages() {
    this.pages.forEach((page, pageId) => {
      page.unload();
      console.log(`페이지 인스턴스 제거: ${pageId}`);
    });
    
    this.pages.clear();
    this.currentPage = null;
    console.log('모든 페이지 인스턴스 제거 완료');
  }

  /**
   * 페이지 히스토리 관리
   */
  setupPageHistory() {
    // 브라우저 히스토리 API 사용
    window.addEventListener('popstate', (event) => {
      const pageId = event.state?.pageId || this.config.getAppConfig().defaultPage;
      this.loadPage(pageId);
    });
  }

  /**
   * 페이지 상태를 히스토리에 추가
   */
  pushPageState(pageId, title) {
    const state = { pageId, title };
    const url = `#${pageId}`;
    
    history.pushState(state, title, url);
  }

  /**
   * 페이지 성능 모니터링
   */
  getPerformanceMetrics() {
    const metrics = {
      totalPages: this.pages.size,
      currentPage: this.getCurrentPageId(),
      loadedPages: Array.from(this.pages.keys()),
      memoryUsage: this.estimateMemoryUsage()
    };
    
    return metrics;
  }

  /**
   * 메모리 사용량 추정
   */
  estimateMemoryUsage() {
    // 간단한 메모리 사용량 추정
    let totalSize = 0;
    
    this.pages.forEach((page, pageId) => {
      const data = page.getData();
      if (data) {
        totalSize += JSON.stringify(data).length;
      }
    });
    
    return `${Math.round(totalSize / 1024)}KB`;
  }

  /**
   * 디버그 정보 출력
   */
  debug() {
    console.group('PageManager 디버그 정보');
    console.log('등록된 페이지 클래스:', Array.from(this.pageClasses.keys()));
    console.log('생성된 페이지 인스턴스:', Array.from(this.pages.keys()));
    console.log('현재 페이지:', this.getCurrentPageId());
    console.log('성능 메트릭:', this.getPerformanceMetrics());
    console.groupEnd();
  }
}

// 기본 페이지 클래스들 (아직 생성되지 않은 것들은 BasePage 사용)
class DashboardPage extends BasePage {
  constructor(pageId) {
    super(pageId, '홈');
  }

  async loadData() {
    this.data = await this.dataService.getDashboardData();
  }

  async render() {
    // 기존 dashboard.js의 로직 사용
    if (typeof loadDashboardContent === 'function') {
      await loadDashboardContent();
    } else {
      await super.render();
    }
  }
}

class NoticePage extends BasePage {
  constructor(pageId) {
    super(pageId, '공지');
  }

  async loadData() {
    this.data = await this.dataService.getNoticesData();
  }
}

class InboundHistoryPage extends BasePage {
  constructor(pageId) {
    super(pageId, '입고 내역');
  }
}

class InboundRegisterPage extends BasePage {
  constructor(pageId) {
    super(pageId, '입고 등록');
  }
}

class OutboundHistoryPage extends BasePage {
  constructor(pageId) {
    super(pageId, '출고 내역');
  }
}

class OutboundRegisterPage extends BasePage {
  constructor(pageId) {
    super(pageId, '출고 등록');
  }
}

class StatisticsPage extends BasePage {
  constructor(pageId) {
    super(pageId, '통계');
  }

  async loadData() {
    this.data = await this.dataService.getStatisticsData();
  }
}

class SettingsPage extends BasePage {
  constructor(pageId) {
    super(pageId, '설정');
  }

  async loadData() {
    this.data = await this.dataService.getSettingsData();
  }
}

// 주문 관련 페이지 클래스들
class AutoOrderRegisterPage extends BasePage {
  constructor(pageId) {
    super(pageId, '자동 주문 등록');
  }

  async loadData() {
    // 자동 주문 등록 데이터 로드
    this.data = { orders: [] };
  }

  async render() {
    const html = `
      <section class="content p-3">
        <div class="container-fluid">
          <!-- 자동 주문 등록 영역 (세로 한줄 배치) -->
          <div class="card mb-3">
            <div class="card-header">
              <h3 class="card-title card-title-lg">자동 주문 등록</h3>
            </div>
            <div class="card-body">
              <div class="function-cards-container">
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded" data-function="search">
                    <div class="function-icon mb-1">
                      <i class="fas fa-search fa-lg text-primary"></i>
                    </div>
                    <h5 class="function-title mb-1">검색 조건</h5>
                    <p class="function-desc text-muted small">상세 검색 조건 설정</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-file-upload fa-lg text-primary"></i>
                    </div>
                    <h5 class="function-title mb-1">파일 업로드</h5>
                    <p class="function-desc text-muted small">Excel, CSV 파일 업로드</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-edit fa-lg text-success"></i>
                    </div>
                    <h5 class="function-title mb-1">데이터 편집</h5>
                    <p class="function-desc text-muted small">주문 정보 수정 및 검증</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-check-circle fa-lg text-info"></i>
                    </div>
                    <h5 class="function-title mb-1">데이터 검증</h5>
                    <p class="function-desc text-muted small">필수 항목 및 형식 검증</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-clock fa-lg text-warning"></i>
                    </div>
                    <h5 class="function-title mb-1">일정 관리</h5>
                    <p class="function-desc text-muted small">예약 등록 및 일정 설정</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-bell fa-lg text-danger"></i>
                    </div>
                    <h5 class="function-title mb-1">알림 설정</h5>
                    <p class="function-desc text-muted small">이메일, SMS 알림 설정</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-chart-line fa-lg text-secondary"></i>
                    </div>
                    <h5 class="function-title mb-1">진행 상황</h5>
                    <p class="function-desc text-muted small">처리 상태 및 진행률 확인</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-history fa-lg text-primary"></i>
                    </div>
                    <h5 class="function-title mb-1">처리 이력</h5>
                    <p class="function-desc text-muted small">등록 이력 및 로그 확인</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-download fa-lg text-success"></i>
                    </div>
                    <h5 class="function-title mb-1">템플릿 다운로드</h5>
                    <p class="function-desc text-muted small">Excel 템플릿 다운로드</p>
                  </div>
                </div>
                
                <div class="function-card-wrapper">
                  <div class="function-card text-center p-2 border rounded">
                    <div class="function-icon mb-1">
                      <i class="fas fa-sync-alt fa-lg text-info"></i>
                    </div>
                    <h5 class="function-title mb-1">일괄 처리</h5>
                    <p class="function-desc text-muted small">대량 주문 일괄 등록</p>
                  </div>
                </div>
                

              </div>
            </div>
          </div>

          <!-- 검색 영역 (숨겨진 상태) -->
          <div class="card mb-3" id="searchArea" style="display: none;">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">검색 조건</h5>
              <button type="button" class="btn btn-sm btn-outline-secondary" id="closeSearchArea">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="card-body py-3" id="searchContent">
              <div class="search-conditions-container">
                <div class="search-condition-item">
                  <label class="form-label text-sm text-muted mb-1">소팅 옵션</label>
                  <select class="form-control form-control-sm">
                    <option>등록일순</option>
                    <option>주문번호순</option>
                    <option>고객명순</option>
                    <option>상태순</option>
                  </select>
                </div>
                <div class="search-condition-item">
                  <label class="form-label text-sm text-muted mb-1">API 유형</label>
                  <select class="form-control form-control-sm">
                    <option>전체</option>
                    <option>주문 API</option>
                    <option>재고 API</option>
                    <option>배송 API</option>
                  </select>
                </div>
                <div class="search-condition-item">
                  <label class="form-label text-sm text-muted mb-1">검색 시작일</label>
                  <input type="date" class="form-control form-control-sm" value="2025-01-13">
                </div>
                <div class="search-condition-item">
                  <label class="form-label text-sm text-muted mb-1">검색 종료일</label>
                  <input type="date" class="form-control form-control-sm" value="2025-01-13">
                </div>
                <div class="search-condition-item">
                  <label class="form-label text-sm text-muted mb-1">퀴버튼</label>
                  <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-secondary">전일</button>
                    <button type="button" class="btn btn-outline-secondary">당일</button>
                    <button type="button" class="btn btn-primary">금일</button>
                  </div>
                </div>

                <div class="search-condition-item search-input-item">
                  <label class="form-label text-sm text-muted mb-1">주문 정보 검색</label>
                  <div class="input-group input-group-sm">
                    <div class="input-group-prepend">
                      <select class="form-control">
                        <option>주문번호</option>
                        <option>고객명</option>
                        <option>상품명</option>
                        <option>파일명</option>
                      </select>
                    </div>
                    <input type="text" class="form-control" placeholder="키워드를 입력하세요">
                  </div>
                </div>
                <div class="search-condition-item search-button-item">
                  <label class="form-label text-sm text-muted mb-1">작업</label>
                  <div class="search-button-container">
                    <button type="button" class="btn btn-outline-secondary search-individual-btn">
                      <i class="fas fa-redo mr-1"></i>초기화
                    </button>
                    <button type="button" class="btn btn-outline-primary search-individual-btn search-query-btn">
                      <i class="fas fa-search mr-1"></i>조회
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- 처리 결과 영역 -->
          <div class="card mt-3">
            <div class="card-header">
              <h5 class="card-title mb-0">처리 결과</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-sm table-hover">
                  <thead class="thead-light">
                    <tr>
                      <th>파일명</th>
                      <th>업로드 시간</th>
                      <th>처리 상태</th>
                      <th>성공/전체</th>
                      <th>진행률</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colspan="6" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                        처리된 파일이 없습니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>
        .form-label.text-sm {
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .btn-group-sm .btn {
          font-size: 0.875rem;
          padding: 0.375rem 0.75rem;
        }
        
        .input-group-sm .form-control {
          font-size: 0.875rem;
        }
        
        .function-cards-container {
          display: flex;
          flex-wrap: wrap;
          column-gap: 14px;
          row-gap: 14px;
          padding: 0;
          margin: 0;
          background: transparent;
          border: none;
          width: 100%;
          align-items: stretch;
        }
        
        .function-card-wrapper {
          flex: 1;
          min-width: 0;
          max-width: calc(20% - 9.6px);
        }
        
        .function-card {
          transition: all 0.3s ease;
          cursor: pointer;
          background-color: #fff;
          height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
        }
        
        .function-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: #007bff !important;
        }
        
        .function-icon {
          transition: transform 0.3s ease;
        }
        
        .function-card:hover .function-icon {
          transform: scale(1.15);
        }
        
        .function-title {
          font-weight: 600;
          color: #333;
          font-size: 0.85rem;
        }
        
        .function-desc {
          font-size: 0.65rem;
          line-height: 1.2;
          margin-bottom: 0;
        }
        
        .text-purple {
          color: #7c3aed !important;
        }
        
        .function-card[data-function="search"] {
          border-color: #e9ecef;
          background: #fff;
        }
        
        .function-card[data-function="search"]:hover {
          border-color: #007bff !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        /* 반응형 디자인 */
        @media (max-width: 1400px) {
          .function-card-wrapper {
            max-width: calc(25% - 9px);
          }
        }
        
        @media (max-width: 1200px) {
          .function-card-wrapper {
            max-width: calc(33.333% - 8px);
          }
        }
        
        @media (max-width: 768px) {
          .function-card-wrapper {
            max-width: calc(50% - 6px);
          }
          
          .function-card {
            height: 90px;
          }
          
          .function-title {
            font-size: 0.8rem;
          }
          
          .function-desc {
            font-size: 0.6rem;
          }
        }
        
        @media (max-width: 480px) {
          .function-card-wrapper {
            max-width: 100%;
          }
          
          .function-card {
            height: 80px;
          }
          
          .function-title {
            font-size: 0.75rem;
          }
          
          .function-desc {
            font-size: 0.55rem;
          }
        }
        
        .card {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .table-hover tbody tr:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }
        
        .progress {
          height: 0.5rem;
        }
        
        #searchArea {
          animation: fadeIn 0.3s ease-in-out;
          display: none !important;
        }
        
        #searchArea.show {
          display: block !important;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* 검색 조건 가로 배치 스타일 - 일관성 있게 통일 */
        .search-conditions-container {
          display: flex !important;
          flex-wrap: nowrap;
          gap: 14px;
          align-items: flex-end;
          justify-content: space-between !important;
          padding: 0;
          overflow: hidden;
          width: 80%;
          min-height: 56px;
          position: relative !important;
        }
        
        .search-condition-item {
          flex: 1;
          min-width: 0;
          margin-bottom: 0;
        }
        
        .search-condition-item.search-input-item {
          flex: 3;
        }
        
        .search-condition-item.search-button-item {
          flex: 0 0 auto !important;
          margin-left: auto !important;
          order: 999 !important;
          position: absolute !important;
          right: 0 !important;
          top: 0 !important;
          bottom: 0 !important;
          width: auto !important;
          display: flex !important;
          align-items: flex-end !important;
        }
        

        
        .search-button-container {
          display: flex !important;
          gap: 6px;
          height: 32px;
          width: auto !important;
          justify-content: flex-end !important;
          margin-left: auto !important;
        }
        
        .search-individual-btn {
          height: 32px;
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          min-width: 80px;
        }
        
        .search-query-btn {
          background-color: #fff;
          border-color: #007bff;
          color: #007bff;
        }
        
        .search-query-btn:hover {
          background-color: #007bff;
          border-color: #007bff;
          color: #fff;
        }
        
        /* 닫기 버튼 맨우측 정렬 */
        .card-header {
          padding: 0.75rem 1.25rem;
        }
        
        .card-header .btn {
          margin-left: auto;
        }
        
        .search-condition-item .form-control,
        .search-condition-item .btn-group,
        .search-condition-item .search-button-container,
        .search-condition-item .input-group {
          width: 100%;
          height: 32px;
        }
        
        .search-condition-item .form-control {
          height: 32px;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .search-condition-item .btn-group .btn {
          height: 32px;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .search-condition-item .input-group {
          height: 32px;
          display: flex;
          align-items: center;
        }
        
        .search-condition-item .input-group .form-control {
          height: 32px !important;
          border-radius: 0 0.375rem 0.375rem 0;
          line-height: 1.5;
          padding: 0.25rem 0.5rem;
        }
        
        .search-condition-item .input-group-prepend .form-control {
          height: 32px !important;
          border-radius: 0.375rem 0 0 0.375rem;
          border-right: 0;
          line-height: 1.5;
          padding: 0.25rem 0.5rem;
        }
        
        .search-condition-item .input-group-prepend {
          display: flex;
          align-items: center;
        }
        
        .search-condition-item label {
          display: block;
          margin-bottom: 4px;
          font-size: 0.8rem;
          color: #6c757d;
          font-weight: 500;
          height: 16px;
          line-height: 16px;
        }
      </style>
    `;
    
    $('#main-content').html(html);
    
    // 검색 조건 영역 무조건 강제 숨김 처리
    $('#searchArea').removeClass('show').hide();
    
    // 검색 조건 카드 클릭 시 검색 영역 표시
    $('.function-card[data-function="search"]').on('click', function() {
      $('#searchArea').addClass('show').hide().fadeIn(300);
      $('html, body').animate({
        scrollTop: $('#searchArea').offset().top - 100
      }, 300);
    });
    
    // 검색 영역 닫기 버튼
    $('#closeSearchArea').on('click', function() {
      $('#searchArea').fadeOut(300, function() {
        $(this).removeClass('show');
      });
    });
    
    // 일반 기능 카드 클릭 이벤트
    $('.function-card:not([data-function="search"])').on('click', function() {
      const title = $(this).find('.function-title').text();
      const desc = $(this).find('.function-desc').text();
      
      // 간단한 알림 (나중에 모달로 변경 가능)
      alert(`${title}\n\n${desc}\n\n이 기능은 개발 중입니다.`);
    });
    
    // 날짜 버튼 이벤트
    $('.btn-group .btn').on('click', function() {
      $(this).siblings().removeClass('btn-primary').addClass('btn-outline-secondary');
      $(this).removeClass('btn-outline-secondary').addClass('btn-primary');
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      if ($(this).text() === '전일') {
        $('input[type="date"]').eq(0).val(formatDate(yesterday));
        $('input[type="date"]').eq(1).val(formatDate(yesterday));
      } else if ($(this).text() === '당일' || $(this).text() === '금일') {
        $('input[type="date"]').eq(0).val(formatDate(today));
        $('input[type="date"]').eq(1).val(formatDate(today));
      }
    });
  }
}

class ManualOrderRegisterPage extends BasePage {
  constructor(pageId) {
    super(pageId, '수동 주문 등록');
  }

  async loadData() {
    // 수동 주문 등록 데이터 로드
    this.data = { orders: [] };
  }

  async render() {
    const html = `
      <section class="content p-3">
        <div class="container-fluid">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title card-title-lg">수동 주문 등록</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label>주문번호</label>
                    <input type="text" class="form-control" placeholder="주문번호를 입력하세요">
                  </div>
                  <div class="form-group">
                    <label>고객명</label>
                    <input type="text" class="form-control" placeholder="고객명을 입력하세요">
                  </div>
                  <div class="form-group">
                    <label>상품명</label>
                    <input type="text" class="form-control" placeholder="상품명을 입력하세요">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label>수량</label>
                    <input type="number" class="form-control" placeholder="수량을 입력하세요">
                  </div>
                  <div class="form-group">
                    <label>배송지</label>
                    <textarea class="form-control" rows="3" placeholder="배송지를 입력하세요"></textarea>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <button class="btn btn-primary">주문 등록</button>
                  <button class="btn btn-secondary ml-2">초기화</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    
    $('#main-content').html(html);
  }
}

class DeletedOrdersPage extends BasePage {
  constructor(pageId) {
    super(pageId, '삭제 주문건');
  }

  async loadData() {
    // 삭제된 주문 데이터 로드
    this.data = { deletedOrders: [] };
  }

  async render() {
    const html = `
      <section class="content p-3">
        <div class="container-fluid">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title card-title-lg">삭제 주문건</h3>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <div class="input-group">
                    <input type="text" class="form-control" placeholder="주문번호로 검색">
                    <div class="input-group-append">
                      <button class="btn btn-outline-secondary" type="button">검색</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <select class="form-control">
                    <option>전체 기간</option>
                    <option>최근 1주일</option>
                    <option>최근 1개월</option>
                    <option>최근 3개월</option>
                  </select>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>주문번호</th>
                      <th>고객명</th>
                      <th>상품명</th>
                      <th>삭제일</th>
                      <th>삭제사유</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colspan="6" class="text-center text-muted">삭제된 주문건이 없습니다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    
    $('#main-content').html(html);
  }
}

class ArchivedOrdersPage extends BasePage {
  constructor(pageId) {
    super(pageId, '보관 주문건');
  }

  async loadData() {
    // 보관된 주문 데이터 로드
    this.data = { archivedOrders: [] };
  }

  async render() {
    const html = `
      <section class="content p-3">
        <div class="container-fluid">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title card-title-lg">보관 주문건</h3>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-4">
                  <div class="input-group">
                    <input type="text" class="form-control" placeholder="주문번호로 검색">
                    <div class="input-group-append">
                      <button class="btn btn-outline-secondary" type="button">검색</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <select class="form-control">
                    <option>전체 기간</option>
                    <option>최근 1개월</option>
                    <option>최근 3개월</option>
                    <option>최근 6개월</option>
                    <option>최근 1년</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select class="form-control">
                    <option>전체 상태</option>
                    <option>자동 보관</option>
                    <option>수동 보관</option>
                    <option>시스템 보관</option>
                  </select>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>주문번호</th>
                      <th>고객명</th>
                      <th>상품명</th>
                      <th>보관일</th>
                      <th>보관사유</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colspan="6" class="text-center text-muted">보관된 주문건이 없습니다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    
    $('#main-content').html(html);
  }
}

class InboundListPage extends BasePage {
  constructor(pageId) {
    super(pageId, '입고목록');
  }

  async loadData() {
    // 입고목록 데이터 로드 (제미나이 2.5의 샘플 데이터 사용)
    this.data = {
      inboundList: [
        { no: 1, productType: '칸닷슈', inboundType: '일반입고', result: '완료', batch: '250616-0001', seller: '파파레서피_Cox10', sku: 'FREE_NAA1A0024', optionCode: 'FREE_NAA1A0024', productName: '블레미쉬 효소 파우더 클렌저', option: 'View_블레미쉬효소파우더클렌저', barcode: '8809738551499', scheduleDate: '2025-06-15', inboundDate: '2025-06-16 14:48:57', expDate: '2029-05-27', lot: 'LOT123457', scheduledQty: 7777, inboundQty: 7777, memo: '', worker: 'admin_jw' },
        { no: 2, productType: '일반', inboundType: '일반입고', result: '완료', batch: '250616-0001', seller: '파파레서피_Cox10', sku: 'FREE_NAA1A018B', optionCode: 'FREE_NAA1A018B', productName: '진짜쑥 비누 100G (본품+증정)', option: '진짜쑥클렌징비누100G(본품+증정)', barcode: '8809738550516', scheduleDate: '2025-06-15', inboundDate: '2025-06-16 14:48:57', expDate: '2029-05-27', lot: 'LOT123458', scheduledQty: 7777, inboundQty: 7777, memo: '', worker: 'admin_jw' },
        { no: 3, productType: '일반', inboundType: '일반입고', result: '완료', batch: '250616-0001', seller: '파파레서피_Cox10', sku: 'FREE_NAA1A021A', optionCode: 'FREE_NAA1A021A', productName: '파파레서피 효소 파우더 클렌저 200ml', option: '파파레서피효소파우더클렌저200ml', barcode: '8809738553017', scheduleDate: '2025-06-15', inboundDate: '2025-06-16 14:48:57', expDate: '2029-05-27', lot: 'LOT123459', scheduledQty: 7777, inboundQty: 7777, memo: '', worker: 'admin_jw' },
        { no: 4, productType: '칸닷슈', inboundType: '일반입고', result: '완료', batch: '250616-0001', seller: '파파레서피_Cox10', sku: 'FREE_NAA1A0011A', optionCode: 'FREE_NAA1A0011A', productName: '파파레서피 효소 파우더 클렌저 PRO', option: 'View_파파레서피효소파우더클렌저PRO', barcode: '8809738554558', scheduleDate: '2025-06-15', inboundDate: '2025-06-16 14:48:57', expDate: '2029-05-27', lot: 'LOT123460', scheduledQty: 7777, inboundQty: 7777, memo: '', worker: 'admin_jw' },
        { no: 5, productType: '일반', inboundType: '일반입고', result: '완료', batch: '250616-0001', seller: '파파레서피_Cox10', sku: 'FREE_NAA1A011B', optionCode: 'FREE_NAA1A011B', productName: '파파레서피효소파우더클렌저(리필)스탠딩파우치형', option: 'View_파파레서피효소파우더클렌저(리필)스탠딩파우치형', barcode: '8809738554564', scheduleDate: '2025-06-15', inboundDate: '2025-06-16 14:48:57', expDate: '2029-05-27', lot: 'LOT123461', scheduledQty: 7777, inboundQty: 7777, memo: '', worker: 'admin_jw' }
      ]
    };
  }

  async render() {
    const html = `
      <section class="content p-3">
        <div class="container-fluid">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h3 class="card-title card-title-lg">입고목록</h3>
                <div class="card-tools">
                  <nav class="nav nav-pills card-header-pills">
                    <a class="nav-link active" id="list-tab" data-toggle="pill" href="#list-content">목록관리</a>
                    <a class="nav-link" id="manual-tab" data-toggle="pill" href="#manual-content">메뉴얼</a>
                  </nav>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="tab-content">
                <div class="tab-pane fade show active" id="list-content">
                  <!-- 필터 영역 -->
                  <div class="card mb-3">
                    <div class="card-body">
                      <!-- 필터 첫 번째 줄 -->
                      <div class="row mb-3">
                        <div class="col-md-2">
                          <label class="form-label">셀러 선택</label>
                          <select class="form-control form-control-sm" id="seller-filter">
                            <option value="">전체</option>
                            <option value="seller1">파파레서피_Cox10</option>
                          </select>
                        </div>
                        <div class="col-md-2">
                          <label class="form-label">입고센터 선택</label>
                          <select class="form-control form-control-sm" id="center-filter">
                            <option value="">전체</option>
                            <option value="center1">인천1센터</option>
                          </select>
                        </div>
                        <div class="col-md-2">
                          <label class="form-label">입고유형</label>
                          <select class="form-control form-control-sm" id="type-filter">
                            <option value="">전체</option>
                            <option value="normal">일반입고</option>
                            <option value="return">반품입고</option>
                            <option value="defective">불량입고</option>
                            <option value="damaged">파손입고</option>
                          </select>
                        </div>
                        <div class="col-md-2">
                          <label class="form-label">결과 선택</label>
                          <select class="form-control form-control-sm" id="result-filter">
                            <option value="">전체</option>
                            <option value="completed">완료</option>
                            <option value="pending">진행중</option>
                          </select>
                        </div>
                        <div class="col-md-2">
                          <label class="form-label">차수 선택</label>
                          <select class="form-control form-control-sm" id="batch-filter">
                            <option value="">전체</option>
                            <option value="250616-0001">250616-0001</option>
                          </select>
                        </div>
                      </div>
                      
                      <!-- 필터 두 번째 줄 -->
                      <div class="row mb-3">
                        <div class="col-md-2">
                          <label class="form-label">조회일자구분</label>
                          <select class="form-control form-control-sm" id="date-type-filter">
                            <option value="">선택</option>
                            <option value="inboundDate">입고일</option>
                            <option value="scheduleDate">입고예정일</option>
                          </select>
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">조회기간</label>
                          <div class="input-group input-group-sm">
                            <input type="date" class="form-control" id="start-date" value="2025-06-16">
                            <div class="input-group-append">
                              <span class="input-group-text">~</span>
                            </div>
                            <input type="date" class="form-control" id="end-date" value="2025-06-16">
                          </div>
                        </div>
                        <div class="col-md-2">
                          <label class="form-label">퀵버튼</label>
                          <div class="btn-group btn-group-sm d-flex" role="group">
                            <button type="button" class="btn btn-outline-secondary">1년</button>
                            <button type="button" class="btn btn-outline-secondary">전월</button>
                            <button type="button" class="btn btn-outline-secondary">당월</button>
                            <button type="button" class="btn btn-primary">오늘</button>
                          </div>
                        </div>
                        <div class="col-md-3">
                          <label class="form-label">검색</label>
                          <div class="input-group input-group-sm">
                            <div class="input-group-prepend">
                              <select class="form-control form-control-sm" id="search-type">
                                <option value="all">전체</option>
                                <option value="sku">SKU</option>
                                <option value="productName">상품명</option>
                              </select>
                            </div>
                            <input type="text" class="form-control" placeholder="키워드를 입력하세요" id="search-keyword">
                          </div>
                        </div>
                        <div class="col-md-2">
                          <label class="form-label">&nbsp;</label>
                          <div class="d-flex">
                            <button type="button" class="btn btn-outline-secondary btn-sm mr-1" id="reset-btn">초기화</button>
                            <button type="button" class="btn btn-primary btn-sm" id="search-btn">조회</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 목록 영역 -->
                  <div class="card">
                    <div class="card-header">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <span class="text-muted">[목록건수 : <span id="total-count">0</span>건]</span>
                        </div>
                        <div class="dropdown">
                          <button class="btn btn-success btn-sm dropdown-toggle" type="button" id="downloadDropdown" data-toggle="dropdown">
                            다운로드
                          </button>
                          <div class="dropdown-menu" aria-labelledby="downloadDropdown">
                            <a class="dropdown-item" href="#" data-format="excel">Excel</a>
                            <a class="dropdown-item" href="#" data-format="csv">CSV</a>
                            <a class="dropdown-item" href="#" data-format="pdf">PDF</a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="card-body p-0">
                      <div class="table-responsive">
                        <table class="table table-hover table-sm mb-0">
                          <thead class="thead-light">
                            <tr>
                              <th class="text-center">No</th>
                              <th>입고유형</th>
                              <th>상품구분</th>
                              <th>결과</th>
                              <th>차수</th>
                              <th>셀러</th>
                              <th>SKU</th>
                              <th>옵션코드</th>
                              <th>상품명</th>
                              <th>옵션</th>
                              <th>바코드</th>
                              <th class="text-center">입고예정일</th>
                              <th class="text-center">입고일</th>
                              <th class="text-center">유통기한</th>
                              <th>LOT</th>
                              <th class="text-right">입고예정수량</th>
                              <th class="text-right">입고수량</th>
                              <th>메모</th>
                              <th>작업자(id)</th>
                            </tr>
                          </thead>
                          <tbody id="inbound-table-body">
                            <!-- 데이터는 JavaScript에서 동적으로 생성 -->
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="tab-pane fade" id="manual-content">
                  <div class="card">
                    <div class="card-header">
                      <h5 class="card-title">입고목록 메뉴얼</h5>
                    </div>
                    <div class="card-body">
                      <h6>주요 기능</h6>
                      <ul class="list-unstyled">
                        <li><i class="fas fa-check text-success mr-2"></i>다양한 필터 조건으로 입고 데이터 검색</li>
                        <li><i class="fas fa-check text-success mr-2"></i>실시간 메모 편집 (더블클릭)</li>
                        <li><i class="fas fa-check text-success mr-2"></i>Excel, CSV, PDF 다운로드</li>
                        <li><i class="fas fa-check text-success mr-2"></i>반응형 디자인 지원</li>
                      </ul>
                      <h6 class="mt-3">사용 방법</h6>
                      <ol class="pl-3">
                        <li>상단 필터를 사용하여 원하는 조건으로 데이터를 필터링합니다.</li>
                        <li>메모 칸을 더블클릭하여 실시간으로 편집할 수 있습니다.</li>
                        <li>다운로드 버튼을 통해 원하는 형식으로 데이터를 내보낼 수 있습니다.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
    
    $('#main-content').html(html);
    
    // 페이지 로드 후 초기화
    this.initialize();
  }

  initialize() {
    // 테이블 렌더링
    this.renderTable();
    
    // 이벤트 리스너 등록
    this.bindEvents();
    
    console.log('입고목록 페이지 초기화 완료');
  }

  renderTable() {
    const tableBody = $('#inbound-table-body');
    tableBody.empty();
    
    if (!this.data || !this.data.inboundList || this.data.inboundList.length === 0) {
      tableBody.append(`
        <tr>
          <td colspan="19" class="text-center text-muted py-4">
            입고 데이터가 없습니다.
          </td>
        </tr>
      `);
      $('#total-count').text('0');
      return;
    }
    
    this.data.inboundList.forEach((item) => {
      const row = `
        <tr data-no="${item.no}">
          <td class="text-center">${item.no}</td>
          <td>${item.inboundType}</td>
          <td>${item.productType}</td>
          <td><span class="badge badge-success">${item.result}</span></td>
          <td>${item.batch}</td>
          <td>${item.seller}</td>
          <td><code>${item.sku}</code></td>
          <td><code>${item.optionCode}</code></td>
          <td>${item.productName}</td>
          <td>${item.option}</td>
          <td><code>${item.barcode}</code></td>
          <td class="text-center">${item.scheduleDate}</td>
          <td class="text-center">${item.inboundDate}</td>
          <td class="text-center">${item.expDate}</td>
          <td>${item.lot}</td>
          <td class="text-right">${item.scheduledQty.toLocaleString()}</td>
          <td class="text-right">${item.inboundQty.toLocaleString()}</td>
          <td class="memo-cell" style="cursor: pointer;">${item.memo}</td>
          <td>${item.worker}</td>
        </tr>
      `;
      tableBody.append(row);
    });
    
    $('#total-count').text(this.data.inboundList.length.toLocaleString());
  }

  bindEvents() {
    // 메모 편집 이벤트
    $('#inbound-table-body').on('dblclick', '.memo-cell', (e) => {
      const cell = $(e.target);
      const row = cell.closest('tr');
      const itemNo = parseInt(row.data('no'));
      const originalMemo = cell.text();
      
      // 입력 필드 생성
      const input = $('<input>')
        .attr('type', 'text')
        .attr('value', originalMemo)
        .addClass('form-control form-control-sm')
        .css('width', '100%');
      
      cell.empty().append(input);
      input.focus().select();
      
      // 저장 함수
      const saveChanges = () => {
        const newMemo = input.val();
        cell.text(newMemo);
        
        // 데이터 업데이트
        const dataItem = this.data.inboundList.find(item => item.no === itemNo);
        if (dataItem) {
          dataItem.memo = newMemo;
        }
      };
      
      // 이벤트 리스너
      input.on('blur', saveChanges);
      input.on('keydown', (event) => {
        if (event.key === 'Enter') {
          input.blur();
        } else if (event.key === 'Escape') {
          cell.text(originalMemo);
        }
      });
    });
    
    // 다운로드 이벤트
    $('.dropdown-item[data-format]').on('click', (e) => {
      e.preventDefault();
      const format = $(e.target).data('format');
      this.handleDownload(format);
    });
    
    // 검색 버튼 이벤트
    $('#search-btn').on('click', () => {
      this.handleSearch();
    });
    
    // 초기화 버튼 이벤트
    $('#reset-btn').on('click', () => {
      this.handleReset();
    });
    
    // 퀵버튼 이벤트
    $('.btn-group .btn').on('click', (e) => {
      const btn = $(e.target);
      btn.siblings().removeClass('btn-primary').addClass('btn-outline-secondary');
      btn.removeClass('btn-outline-secondary').addClass('btn-primary');
      
      const today = new Date();
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      if (btn.text() === '오늘') {
        $('#start-date').val(formatDate(today));
        $('#end-date').val(formatDate(today));
      } else if (btn.text() === '당월') {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        $('#start-date').val(formatDate(monthStart));
        $('#end-date').val(formatDate(today));
      } else if (btn.text() === '전월') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        $('#start-date').val(formatDate(lastMonth));
        $('#end-date').val(formatDate(lastMonthEnd));
      } else if (btn.text() === '1년') {
        const yearStart = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        $('#start-date').val(formatDate(yearStart));
        $('#end-date').val(formatDate(today));
      }
    });
  }

  handleDownload(format) {
    alert(`${format.toUpperCase()} 형식으로 다운로드를 시작합니다. (시뮬레이션)`);
  }

  handleSearch() {
    // 실제 검색 로직 구현
    console.log('검색 실행');
    alert('검색 기능이 실행되었습니다. (시뮬레이션)');
  }

  handleReset() {
    // 모든 필터 초기화
    $('#seller-filter').val('');
    $('#center-filter').val('');
    $('#type-filter').val('');
    $('#result-filter').val('');
    $('#batch-filter').val('');
    $('#date-type-filter').val('');
    $('#search-type').val('all');
    $('#search-keyword').val('');
    
    // 오늘 날짜로 초기화
    const today = new Date().toISOString().split('T')[0];
    $('#start-date').val(today);
    $('#end-date').val(today);
    
    // 버튼 상태 초기화
    $('.btn-group .btn').removeClass('btn-primary').addClass('btn-outline-secondary');
    $('.btn-group .btn:contains("오늘")').removeClass('btn-outline-secondary').addClass('btn-primary');
    
    console.log('필터 초기화 완료');
  }
}

class InventoryAdjustmentPage extends BasePage {
  constructor(pageId) {
    super(pageId, '재고조정');
    this.database = {
      'AMP-30ML': { id: 1, seller: 'UIQ', sku: 'UIQ-AMP-001', name: '바이옴 베리어 에센스 앰플', optionGroup: '30ml 옵션', optionCode: 'AMP-30ML', option: '30ml', productClassification: '일반상품', barcode: '8801234567890', scheduledRelease: 50, holdStock: 20, safetyStock: 20, locations: [ { id: 1, center: '인천1센터(청라)', zone: 'A-Zone', loc: 'RA-01-01-A', lot: 'L2405A01', expiry: '2026-05-31', mfgDate: '2024-06-01', current: 200, status: '정상', lastAdjustedAt: '2025-07-07 09:30:15', lastWorker: 'admin' }, { id: 2, center: '인천1센터(청라)', zone: 'B-Zone', loc: 'RB-02-03-D', lot: 'L2405A02', expiry: '2026-05-31', mfgDate: '2024-06-01', current: 150, status: '정상', lastAdjustedAt: '2025-07-06 18:05:41', lastWorker: 'user01' }, { id: 8, center: '인천1센터(청라)', zone: 'A-Zone', loc: 'RA-01-01-C', lot: 'L2404A03', expiry: '2026-04-30', mfgDate: '2024-05-01', current: 80, status: '정상', lastAdjustedAt: '2025-07-07 11:20:00', lastWorker: 'admin' } ] },
      'AMP-30ML-G': { id: 2, seller: 'UIQ', sku: 'UIQ-AMP-001', name: '바이옴 베리어 에센스 앰플', optionGroup: '30ml 옵션', optionCode: 'AMP-30ML-G', option: '30ml', productClassification: '칸닷슈 상품', barcode: '8801234567891', scheduledRelease: 20, holdStock: 0, safetyStock: 10, locations: [ { id: 7, center: '인천1센터(청라)', zone: 'A-Zone', loc: 'RA-01-02-B', lot: 'L2408A01', expiry: '2026-08-31', mfgDate: '2024-09-01', current: 150, status: '유통기한임박', lastAdjustedAt: '2025-06-30 15:00:12', lastWorker: 'admin' } ] },
      'AMP-50ML': { id: 6, seller: 'UIQ', sku: 'UIQ-AMP-001', name: '바이옴 베리어 에센스 앰플', optionGroup: '50ml 옵션', optionCode: 'AMP-50ML', option: '50ml', productClassification: '일반상품', barcode: '8801234567892', scheduledRelease: 15, holdStock: 5, safetyStock: 15, locations: [ { id: 9, center: '인천1센터(청라)', zone: 'A-Zone', loc: 'RA-01-01-D', lot: 'L2407A01', expiry: '2026-07-20', mfgDate: '2024-07-21', current: 200, status: '정상', lastAdjustedAt: '2025-07-01 10:10:10', lastWorker: 'admin' } ] },
      'CLW-200ML': { id: 3, seller: 'UIQ', sku: 'UIQ-CRM-001', name: '미셀라 클렌징 워터', optionGroup: '200ml 옵션', optionCode: 'CLW-200ML', option: '200ml', productClassification: '일반상품', barcode: '8801234567893', scheduledRelease: 20, holdStock: 0, safetyStock: 50, locations: [ { id: 3, center: '인천2센터(원창)', zone: 'C-Zone', loc: 'RC-05-01-F', lot: 'L2406C01', expiry: '2026-06-15', mfgDate: '2024-06-16', current: 300, status: '정상', lastAdjustedAt: '2025-07-05 14:45:00', lastWorker: 'user02' } ] },
      'CLW-200ML-G': { id: 4, seller: 'UIQ', sku: 'UIQ-CRM-001', name: '미셀라 클렌징 워터', optionGroup: '200ml 옵션', optionCode: 'CLW-200ML-G', option: '200ml', productClassification: '칸닷슈 상품', barcode: '8801234567894', scheduledRelease: 0, holdStock: 0, safetyStock: 20, locations: [ { id: 4, center: '인천2센터(원창)', zone: 'C-Zone', loc: 'RC-05-02-B', lot: 'L2406C02', expiry: '2026-06-15', mfgDate: '2024-06-16', current: 180, status: '정상', lastAdjustedAt: '2025-07-05 14:45:00', lastWorker: 'user02' }, { id: 5, center: '인천2센터(원창)', zone: 'D-Zone', loc: 'RD-01-01-A', lot: 'L2312D01', expiry: '2025-12-20', mfgDate: '2023-12-21', current: 40, status: '유통기한임박', lastAdjustedAt: '2025-07-02 09:00:00', lastWorker: 'admin' } ] },
      'SUN-50ML': { id: 5, seller: 'UIQ', sku: 'UIQ-SUN-001', name: '바이옴 베리어 선스크린', optionGroup: '', optionCode: 'SUN-50ML', option: '50ml', productClassification: '일반상품', barcode: '8801234567895', scheduledRelease: 10, holdStock: 0, safetyStock: 30, locations: [ { id: 6, center: '인천1센터(청라)', zone: 'C-Zone', loc: 'RC-01-01-A', lot: 'L2407C01', expiry: '2026-07-20', mfgDate: '2024-07-21', current: 120, status: '정상', lastAdjustedAt: '2025-07-03 17:30:25', lastWorker: 'admin' }, { id: 11, center: '인천1센터(청라)', zone: 'C-Zone', loc: 'RC-01-01-B', lot: 'L2407C01', expiry: '2026-07-20', mfgDate: '2024-07-21', current: 15, status: '파손', lastAdjustedAt: '2025-07-08 11:00:00', lastWorker: 'admin' } ] }
    };
    this.allLocations = [
      { center: '인천1센터(청라)', zone: 'A-Zone', loc: 'RA-01-01-A' }, { center: '인천1센터(청라)', zone: 'A-Zone', loc: 'RA-01-01-B' }, { center: '인천1센터(청라)', zone: 'A-Zone', loc: 'RA-01-01-C' }, { center: '인천1센터(청라)', zone: 'A-Zone', loc: 'RA-01-01-D' },
      { center: '인천1센터(청라)', zone: 'B-Zone', loc: 'RB-02-03-D' }, { center: '인천1센터(청라)', zone: 'C-Zone', loc: 'RC-01-01-A' }, { center: '인천1센터(청라)', zone: 'C-Zone', loc: 'RC-01-01-B' },
      { center: '인천2센터(원창)', zone: 'C-Zone', loc: 'RC-05-01-F' }, { center: '인천2센터(원창)', zone: 'C-Zone', loc: 'RC-05-02-B' }, { center: '인천2센터(원창)', zone: 'D-Zone', loc: 'RD-01-01-A' },
    ];
    this.statusOptions = ['정상', '유통기한임박', '파손', '불량'];
    this.reasonOptions = ["데이터 수정", "전산오류", "유통기한 경과", "실사재고", "임가공", "손실/파손", "불량/폐기", "기타"];
    this.currentView = 'list'; // 'list' or 'detail'
    this.currentOptionCode = null;
    this.selectedLocationId = null;
    this.activeRelatedProductCode = null;
  }

  async loadData() {
    // 재고조정 데이터는 이미 constructor에서 초기화됨
    console.log('재고조정 데이터 로드 완료');
  }

  async render() {
    const html = `
      <section class="content p-3">
        <div class="container-fluid">
          <div class="card">
            <div class="card-header">
              <div class="d-flex justify-content-between align-items-center">
                <h3 class="card-title card-title-lg">재고조정</h3>
                <div class="card-tools">
                  <nav class="nav nav-pills card-header-pills">
                    <a class="nav-link active" id="list-tab" data-view="list">목록관리</a>
                    <a class="nav-link" id="detail-tab" data-view="detail">상세관리</a>
                  </nav>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div id="list-view">
                <div class="table-responsive">
                  <table class="table table-hover table-sm">
                    <thead class="thead-light">
                      <tr>
                        <th class="text-center">No</th>
                        <th>셀러</th>
                        <th>SKU</th>
                        <th>상품명</th>
                        <th>옵션코드</th>
                        <th>옵션</th>
                        <th>옵션그룹</th>
                        <th>상품구분</th>
                        <th>옵션바코드</th>
                        <th class="text-right">총 재고</th>
                        <th class="text-right">총 출고예정</th>
                        <th class="text-right">총 가용재고</th>
                        <th class="text-right">안전재고</th>
                        <th>센터</th>
                        <th>존</th>
                        <th>로케이션</th>
                        <th>LOT</th>
                        <th>유통기한</th>
                        <th class="text-right">현재재고</th>
                        <th class="text-center">상태</th>
                        <th>최종 조정일시</th>
                        <th>최종 작업자(ID)</th>
                      </tr>
                    </thead>
                    <tbody id="adjustment-table-body">
                      <!-- 테이블 데이터는 JavaScript에서 생성 -->
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div id="detail-view" class="d-none">
                <div class="row">
                  <div class="col-lg-4">
                    <div id="product-info-section"></div>
                  </div>
                  <div class="col-lg-4">
                    <div id="location-table-section"></div>
                  </div>
                  <div class="col-lg-4">
                    <div id="adjustment-form-section"></div>
                  </div>
                </div>
                <div class="mt-4 text-right">
                  <button class="btn btn-secondary mr-2" id="back-to-list-btn">목록으로</button>
                  <button class="btn btn-primary" id="save-adjustment-btn" disabled>저장하기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 로케이션 검색 모달 -->
      <div class="modal fade" id="locationSearchModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title">로케이션 검색</h4>
              <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="row mb-3">
                <div class="col-md-4">
                  <select class="form-control form-control-sm" id="location-center-filter">
                    <option value="">센터 선택</option>
                    <option value="인천1센터(청라)">인천1센터(청라)</option>
                    <option value="인천2센터(원창)">인천2센터(원창)</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <select class="form-control form-control-sm" id="location-zone-filter">
                    <option value="">존 선택</option>
                    <option value="A-Zone">A-Zone</option>
                    <option value="B-Zone">B-Zone</option>
                    <option value="C-Zone">C-Zone</option>
                    <option value="D-Zone">D-Zone</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <div class="input-group input-group-sm">
                    <input type="text" class="form-control" placeholder="로케이션 검색" id="location-search-input">
                    <div class="input-group-append">
                      <button class="btn btn-primary" type="button" id="location-search-btn">검색</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="table-responsive" style="max-height: 300px;">
                <table class="table table-sm table-hover">
                  <thead class="thead-light">
                    <tr>
                      <th>No</th>
                      <th>센터</th>
                      <th>존</th>
                      <th>로케이션</th>
                    </tr>
                  </thead>
                  <tbody id="location-search-results"></tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">취소</button>
              <button type="button" class="btn btn-primary" id="select-location-btn" disabled>선택</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 재고 수정 사유 모달 -->
      <div class="modal fade" id="reasonModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title">재고 수정 사유 입력</h4>
              <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div id="adjustment-info" class="mb-3 p-3 bg-light rounded"></div>
              <div class="form-group">
                <label for="reason-select">사유 선택 <span class="text-danger">*</span></label>
                <select class="form-control" id="reason-select">
                  <option value="">사유 선택</option>
                  ${this.reasonOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
              </div>
              <div class="form-group d-none" id="other-reason-container">
                <label for="other-reason-input">사유 직접 입력</label>
                <textarea class="form-control" id="other-reason-input" rows="3" placeholder="구체적인 조정 사유를 입력하세요."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">취소</button>
              <button type="button" class="btn btn-primary" id="save-reason-btn">저장</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    $('#main-content').html(html);
    this.initializeEvents();
    this.renderAdjustmentTable();
  }

  initializeEvents() {
    // 탭 전환
    $('#list-tab, #detail-tab').on('click', (e) => {
      const view = $(e.target).data('view');
      this.switchView(view);
    });

    // 옵션코드 클릭 (상세 페이지로 이동)
    $(document).on('click', '.option-link', (e) => {
      const optionCode = $(e.target).data('option-code');
      this.showDetailView(optionCode);
    });

    // 목록으로 돌아가기
    $('#back-to-list-btn').on('click', () => {
      this.switchView('list');
    });

    // 로케이션 검색 모달
    $('#location-search-btn').on('click', () => {
      this.renderLocationSearchResults();
    });

    // 로케이션 선택
    $(document).on('click', '#location-search-results tr', (e) => {
      $('#location-search-results tr').removeClass('table-active');
      $(e.currentTarget).addClass('table-active');
      $('#select-location-btn').prop('disabled', false);
    });

    // 사유 선택 변경
    $('#reason-select').on('change', (e) => {
      const isOther = e.target.value === '기타';
      $('#other-reason-container').toggleClass('d-none', !isOther);
    });

    console.log('재고조정 이벤트 초기화 완료');
  }

  switchView(view) {
    this.currentView = view;
    
    // 탭 활성화 상태 변경
    $('#list-tab, #detail-tab').removeClass('active');
    $(`#${view}-tab`).addClass('active');
    
    // 뷰 전환
    if (view === 'list') {
      $('#list-view').removeClass('d-none');
      $('#detail-view').addClass('d-none');
      this.renderAdjustmentTable();
    } else {
      $('#list-view').addClass('d-none');
      $('#detail-view').removeClass('d-none');
    }
  }

  showDetailView(optionCode) {
    this.currentOptionCode = optionCode;
    this.selectedLocationId = null;
    this.activeRelatedProductCode = optionCode; // 초기 선택된 연관 상품
    this.switchView('detail');
    this.renderDetailSections();
  }

  renderAdjustmentTable() {
    const tableBody = $('#adjustment-table-body');
    tableBody.empty();
    
    const flatData = [];
    Object.values(this.database).forEach(product => {
      const totalStock = this.calculateStock([product]);
      if (product.locations && product.locations.length > 0) {
        product.locations.forEach(loc => {
          flatData.push({ ...product, locationInfo: loc, totalStockForOption: totalStock.total, totalAvailableForOption: totalStock.available });
        });
      }
    });

    flatData.sort((a, b) => a.sku.localeCompare(b.sku) || a.optionCode.localeCompare(b.optionCode) || a.locationInfo.loc.localeCompare(b.locationInfo.loc));

    const renderedOptionCodes = new Set();
    flatData.forEach((item, index) => {
      const row = $('<tr>');
      const loc = item.locationInfo;
      const optionCode = item.optionCode;
      const optionRowspan = flatData.filter(d => d.optionCode === optionCode).length;
      
      let rowHtml = `<td class="text-center align-middle">${index + 1}</td>`;

      if (!renderedOptionCodes.has(optionCode)) {
        renderedOptionCodes.add(optionCode);
        const productClass = item.productClassification === '칸닷슈 상품' ? 'text-primary font-weight-bold' : 'text-dark font-weight-bold';
        rowHtml += `
          <td class="align-top" rowspan="${optionRowspan}">${item.seller}</td>
          <td class="align-top" rowspan="${optionRowspan}">${item.sku}</td>
          <td class="align-top font-weight-bold" rowspan="${optionRowspan}">${item.name}</td>
          <td class="align-top option-link text-primary font-weight-bold" rowspan="${optionRowspan}" data-option-code="${optionCode}" style="cursor: pointer;">${item.optionCode}</td>
          <td class="align-top" rowspan="${optionRowspan}">${item.option}</td>
          <td class="align-top" rowspan="${optionRowspan}">${item.optionGroup || '-'}</td>
          <td class="align-top ${productClass}" rowspan="${optionRowspan}">${item.productClassification}</td>
          <td class="align-top" rowspan="${optionRowspan}">${item.barcode || '-'}</td>
          <td class="align-top text-right font-weight-bold" rowspan="${optionRowspan}">${item.totalStockForOption.toLocaleString()}</td>
          <td class="align-top text-right" rowspan="${optionRowspan}">${(item.scheduledRelease || 0).toLocaleString()}</td>
          <td class="align-top text-right font-weight-bold text-primary" rowspan="${optionRowspan}">${item.totalAvailableForOption.toLocaleString()}</td>
          <td class="align-top text-right text-warning" rowspan="${optionRowspan}">${(item.safetyStock || 0).toLocaleString()}</td>
        `;
      }
      
      const statusBadgeClass = this.getStatusBadgeClass(loc.status);
      rowHtml += `
        <td class="align-middle">${loc.center || '-'}</td>
        <td class="align-middle">${loc.zone || ''}</td>
        <td class="align-middle"><code>${loc.loc || '-'}</code></td>
        <td class="align-middle"><small>${loc.lot || '-'}</small></td>
        <td class="align-middle"><small>${loc.expiry || '-'}</small></td>
        <td class="align-middle text-right font-weight-bold">${loc.current.toLocaleString()}</td>
        <td class="align-middle text-center"><span class="badge ${statusBadgeClass}">${loc.status}</span></td>
        <td class="align-middle text-muted"><small>${loc.lastAdjustedAt || '-'}</small></td>
        <td class="align-middle text-muted"><small>${loc.lastWorker || '-'}</small></td>
      `;
      
      row.html(rowHtml);
      tableBody.append(row);
    });
  }

  renderDetailSections() {
    const product = this.database[this.currentOptionCode];
    if (!product) return;

    // SKU 기준 전체 상품과 옵션 그룹 상품 가져오기
    const skuProducts = Object.values(this.database).filter(p => p.sku === product.sku);
    const groupProducts = product.optionGroup ? Object.values(this.database).filter(p => p.optionGroup === product.optionGroup) : [];
    
    // SKU 기준 재고 계산
    const skuStock = this.calculateStock(skuProducts);

    // 상품 정보 섹션
    const productInfoHtml = `
      <div class="card mb-3">
        <div class="card-header">
          <h5 class="card-title">
            <i class="fas fa-info-circle mr-2"></i>상품 기본 정보
          </h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-12 mb-2"><strong>상품명:</strong> ${product.name}</div>
            <div class="col-6 mb-2"><strong>셀러:</strong> ${product.seller}</div>
            <div class="col-6 mb-2"><strong>SKU:</strong> ${product.sku}</div>
            <div class="col-6 mb-2"><strong>옵션코드:</strong> ${product.optionCode}</div>
            <div class="col-6 mb-2"><strong>옵션:</strong> ${product.option}</div>
            <div class="col-12 mb-2"><strong>상품구분:</strong> <span class="${product.productClassification === '칸닷슈 상품' ? 'text-primary font-weight-bold' : 'text-dark'}">${product.productClassification}</span></div>
            <div class="col-12"><strong>바코드:</strong> ${product.barcode || '-'}</div>
          </div>
        </div>
      </div>
      
      <div class="card mb-3">
        <div class="card-header">
          <h5 class="card-title">상품 전체 재고 (SKU 기준)</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-6 mb-2">
              <div class="text-muted">총 재고</div>
              <div class="h4 font-weight-bold text-dark">${skuStock.total.toLocaleString()}</div>
            </div>
            <div class="col-6 mb-2">
              <div class="text-muted">총 가용재고</div>
              <div class="h4 font-weight-bold text-primary">${skuStock.available.toLocaleString()}</div>
            </div>
            <div class="col-6">
              <div class="text-muted">총 출고예정</div>
              <div class="h5 font-weight-bold text-warning">${skuStock.scheduled.toLocaleString()}</div>
            </div>
            <div class="col-6">
              <div class="text-muted">총 보류</div>
              <div class="h5 font-weight-bold text-danger">${skuStock.hold.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
      
      ${product.optionGroup ? `
      <div class="card mb-3">
        <div class="card-header">
          <h5 class="card-title">옵션 그룹 및 연관 재고</h5>
        </div>
        <div class="card-body">
          <div id="related-products-container" class="row">
            ${groupProducts.map(rp => {
              const rpStock = this.calculateStock([rp]);
              const isSelected = rp.optionCode === this.activeRelatedProductCode;
              const cardClass = isSelected ? 'border-primary bg-light' : 'border-secondary';
              const productClass = rp.productClassification === '칸닷슈 상품' ? 'text-primary font-weight-bold' : 'text-dark font-weight-bold';
              
              return `
                <div class="col-12 mb-2">
                  <div class="card related-product-card ${cardClass}" data-option-code="${rp.optionCode}" style="cursor: pointer;">
                    <div class="card-body p-3">
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="flex-grow-1">
                          <div class="mb-1"><span class="${productClass}">${rp.productClassification}</span></div>
                          <div class="font-weight-bold text-dark">${rp.optionCode}</div>
                          <div class="text-muted small">${rp.option}</div>
                        </div>
                        <div class="text-right">
                          <div class="row">
                            <div class="col-6 text-center">
                              <div class="text-muted small">가용</div>
                              <div class="font-weight-bold text-primary">${rpStock.available.toLocaleString()}</div>
                            </div>
                            <div class="col-6 text-center">
                              <div class="text-muted small">총 재고</div>
                              <div class="font-weight-bold text-secondary">${rpStock.total.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      ` : ''}
      
             <div id="selected-stock-status-container">
         ${this.renderSelectedStockStatus(this.activeRelatedProductCode)}
       </div>
    `;

    // 로케이션 테이블 섹션
    const locationTableHtml = `
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">로케이션별 재고 현황</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive" style="max-height: 400px;">
            <table class="table table-sm table-hover mb-0">
              <thead class="thead-light">
                <tr>
                  <th>센터/존</th>
                  <th>로케이션</th>
                  <th>LOT</th>
                  <th>유통기한</th>
                  <th class="text-center">현재고</th>
                  <th class="text-center">상태</th>
                </tr>
              </thead>
              <tbody id="location-detail-table">
                ${product.locations.map(loc => {
                  const statusBadgeClass = this.getStatusBadgeClass(loc.status);
                  return `
                    <tr class="location-row" data-location-id="${loc.id}" style="cursor: pointer;">
                      <td><strong>${loc.center}</strong><br><small class="text-muted">${loc.zone}</small></td>
                      <td><code>${loc.loc}</code></td>
                      <td><small>${loc.lot || '-'}</small></td>
                      <td><small>${loc.expiry || '-'}</small></td>
                      <td class="text-center font-weight-bold">${loc.current.toLocaleString()}</td>
                      <td class="text-center"><span class="badge ${statusBadgeClass}">${loc.status}</span></td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // 조정 폼 섹션
    const adjustmentFormHtml = `
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">조정 내용 입력</h5>
        </div>
        <div class="card-body">
          <div id="selected-location-info" class="alert alert-info">
            <strong>로케이션을 선택하세요.</strong>
          </div>
                     <div class="form-group">
             <label>조정 유형</label>
             <select class="form-control" id="adjustment-type" disabled>
               <option value="adjust">재고 조정(수량/상태 변경)</option>
               <option value="move">재고 이동</option>
               <option value="split">재고 분할</option>
               <option value="type_change">상품구분 전환</option>
             </select>
           </div>
          <div id="adjustment-fields">
            <!-- 조정 유형별 필드가 여기에 동적으로 생성됩니다 -->
          </div>
        </div>
      </div>
    `;

    $('#product-info-section').html(productInfoHtml);
    $('#location-table-section').html(locationTableHtml);
    $('#adjustment-form-section').html(adjustmentFormHtml);

    // 로케이션 선택 이벤트
    $('.location-row').on('click', (e) => {
      const locationId = parseInt($(e.currentTarget).data('location-id'));
      this.selectLocation(locationId);
    });

    // 연관 상품 카드 클릭 이벤트
    $('.related-product-card').on('click', (e) => {
      const optionCode = $(e.currentTarget).data('option-code');
      this.selectRelatedProduct(optionCode);
    });

    // 조정 유형 변경 이벤트
    $('#adjustment-type').on('change', () => {
      this.renderAdjustmentFields();
    });
  }

  selectLocation(locationId) {
    this.selectedLocationId = locationId;
    const product = this.database[this.currentOptionCode];
    const location = product.locations.find(l => l.id === locationId);
    
    if (!location) return;

    // 테이블 행 선택 표시
    $('.location-row').removeClass('table-active');
    $(`.location-row[data-location-id="${locationId}"]`).addClass('table-active');

    // 선택된 로케이션 정보 표시
    $('#selected-location-info').html(`
      <strong>선택된 로케이션 (현재고: ${location.current.toLocaleString()})</strong><br>
      ${location.center} / ${location.zone} / <code>${location.loc}</code>
    `);

         // 조정 유형 선택 활성화
     $('#adjustment-type').prop('disabled', false);
     $('#save-adjustment-btn').prop('disabled', false);

     // 상품구분 전환 옵션 활성화/비활성화
     const counterpartProduct = Object.values(this.database).find(p => p.sku === product.sku && p.optionCode !== product.optionCode);
     const typeChangeOption = $('#adjustment-type option[value="type_change"]');
     if (counterpartProduct) {
       typeChangeOption.prop('disabled', false);
     } else {
       typeChangeOption.prop('disabled', true);
       if ($('#adjustment-type').val() === 'type_change') {
         $('#adjustment-type').val('adjust');
       }
     }

     this.renderAdjustmentFields();
  }

  renderAdjustmentFields() {
    const type = $('#adjustment-type').val();
    const product = this.database[this.currentOptionCode];
    const location = product.locations.find(l => l.id === this.selectedLocationId);
    
    if (!location) return;

    let fieldsHtml = '';

    if (type === 'adjust') {
      fieldsHtml = `
        <div class="row">
          <div class="col-6">
            <div class="form-group">
              <label>변경 후 수량</label>
              <input type="number" class="form-control" id="new-quantity" value="${location.current}">
            </div>
          </div>
          <div class="col-6">
            <div class="form-group">
              <label>조정 수량</label>
              <input type="text" class="form-control" id="adjusted-quantity" readonly value="0">
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>재고 상태</label>
          <select class="form-control" id="new-status">
            ${this.statusOptions.map(opt => `<option value="${opt}" ${location.status === opt ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        </div>
        <div class="row">
          <div class="col-6">
            <div class="form-group">
              <label>LOT</label>
              <input type="text" class="form-control" id="new-lot" value="${location.lot || ''}">
            </div>
          </div>
          <div class="col-6">
            <div class="form-group">
              <label>유통기한</label>
              <input type="date" class="form-control" id="new-expiry" value="${location.expiry || ''}">
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>조정 사유 <span class="text-danger">*</span></label>
          <textarea class="form-control" id="adjust-reason" rows="3" placeholder="조정 사유를 입력하세요."></textarea>
        </div>
      `;
    } else if (type === 'move') {
      fieldsHtml = `
        <div class="form-group">
          <label>이동 수량 <span class="text-danger">*</span></label>
          <input type="number" class="form-control" id="move-quantity" max="${location.current}" placeholder="최대 ${location.current}개">
        </div>
        <div class="form-group">
          <label>목적지 로케이션 <span class="text-danger">*</span></label>
          <div class="input-group">
            <input type="text" class="form-control" id="target-location" placeholder="로케이션 코드" readonly>
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" type="button" data-toggle="modal" data-target="#locationSearchModal">검색</button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>이동 사유 <span class="text-danger">*</span></label>
          <textarea class="form-control" id="move-reason" rows="3" placeholder="재고 이동 사유를 입력하세요."></textarea>
        </div>
      `;
         } else if (type === 'split') {
       fieldsHtml = `
         <div class="form-group">
           <label>분할 수량 <span class="text-danger">*</span></label>
           <input type="number" class="form-control" id="split-quantity" max="${location.current}" placeholder="최대 ${location.current}개">
         </div>
         <div class="form-group">
           <label>목적지 로케이션 <span class="text-danger">*</span></label>
           <div class="input-group">
             <input type="text" class="form-control" id="split-target-location" placeholder="로케이션 코드" readonly>
             <div class="input-group-append">
               <button class="btn btn-outline-secondary" type="button" data-toggle="modal" data-target="#locationSearchModal">검색</button>
             </div>
           </div>
         </div>
         <div class="form-group">
           <label>재고 상태</label>
           <select class="form-control" id="split-status">
             ${this.statusOptions.map(opt => `<option value="${opt}" ${location.status === opt ? 'selected' : ''}>${opt}</option>`).join('')}
           </select>
         </div>
         <div class="row">
           <div class="col-6">
             <div class="form-group">
               <label>LOT</label>
               <input type="text" class="form-control" id="split-lot" value="${location.lot || ''}">
             </div>
           </div>
           <div class="col-6">
             <div class="form-group">
               <label>유통기한</label>
               <input type="date" class="form-control" id="split-expiry" value="${location.expiry || ''}">
             </div>
           </div>
         </div>
         <div class="form-group">
           <label>분할 사유 <span class="text-danger">*</span></label>
           <textarea class="form-control" id="split-reason" rows="3" placeholder="분할 사유를 입력하세요."></textarea>
         </div>
       `;
     } else if (type === 'type_change') {
       const counterpartProduct = Object.values(this.database).find(p => p.sku === product.sku && p.optionCode !== product.optionCode);
       
       if (!counterpartProduct) {
         fieldsHtml = `
           <div class="alert alert-warning">
             <i class="fas fa-exclamation-triangle mr-2"></i>
             전환할 상품이 없거나 로케이션이 선택되지 않았습니다.
           </div>
         `;
       } else {
         const generalProduct = product.productClassification === '일반상품' ? product : counterpartProduct;
         const kandaProduct = product.productClassification === '칸닷슈 상품' ? product : counterpartProduct;
         
         const generalStock = this.calculateStock([generalProduct]).available;
         const kandaStock = this.calculateStock([kandaProduct]).available;
         
         fieldsHtml = `
           <div class="form-group">
             <label>전환 방향 선택</label>
             <div class="row">
               <div class="col-12 mb-2">
                 <div class="card">
                   <label class="card-body p-3 mb-0" style="cursor: pointer;">
                     <div class="custom-control custom-radio">
                       <input type="radio" id="to_kanda" name="type_change_direction" value="to_kanda" class="custom-control-input" checked>
                       <label class="custom-control-label" for="to_kanda">
                         <strong>일반상품 → 칸닷슈 상품</strong><br>
                         <small class="text-muted">전환 가능 수량: <span class="font-weight-bold">${generalStock.toLocaleString()}</span>개</small>
                       </label>
                     </div>
                   </label>
                 </div>
               </div>
               <div class="col-12">
                 <div class="card">
                   <label class="card-body p-3 mb-0" style="cursor: pointer;">
                     <div class="custom-control custom-radio">
                       <input type="radio" id="to_general" name="type_change_direction" value="to_general" class="custom-control-input">
                       <label class="custom-control-label" for="to_general">
                         <strong>칸닷슈 상품 → 일반상품</strong><br>
                         <small class="text-muted">전환 가능 수량: <span class="font-weight-bold">${kandaStock.toLocaleString()}</span>개</small>
                       </label>
                     </div>
                   </label>
                 </div>
               </div>
             </div>
           </div>
           <div class="form-group">
             <label>전환 수량 <span class="text-danger">*</span></label>
             <input type="number" class="form-control" id="type-change-quantity" placeholder="최대 ${generalStock.toLocaleString()}개">
           </div>
           <div class="form-group">
             <label>전환 사유</label>
             <textarea class="form-control" id="type-change-reason" rows="3" placeholder="상품구분 전환 사유를 입력하세요."></textarea>
           </div>
         `;
       }
     }

    $('#adjustment-fields').html(fieldsHtml);

         // 수량 변경 시 조정 수량 자동 계산
     $('#new-quantity').on('input', () => {
       const newQty = parseInt($('#new-quantity').val()) || 0;
       const adjustedQty = newQty - location.current;
       $('#adjusted-quantity').val(adjustedQty);
     });

     // 상품구분 전환 방향 변경 시 수량 제한 업데이트
     $('input[name="type_change_direction"]').on('change', (e) => {
       const direction = e.target.value;
       const product = this.database[this.currentOptionCode];
       const counterpartProduct = Object.values(this.database).find(p => p.sku === product.sku && p.optionCode !== product.optionCode);
       
       if (counterpartProduct) {
         const generalProduct = product.productClassification === '일반상품' ? product : counterpartProduct;
         const kandaProduct = product.productClassification === '칸닷슈 상품' ? product : counterpartProduct;
         
         const generalStock = this.calculateStock([generalProduct]).available;
         const kandaStock = this.calculateStock([kandaProduct]).available;
         
         const maxQty = direction === 'to_kanda' ? generalStock : kandaStock;
         $('#type-change-quantity').attr('max', maxQty).attr('placeholder', `최대 ${maxQty.toLocaleString()}개`).val('');
       }
     });
  }

  renderLocationSearchResults() {
    const center = $('#location-center-filter').val();
    const zone = $('#location-zone-filter').val();
    const search = $('#location-search-input').val().toLowerCase();
    
    let filtered = this.allLocations.filter(loc => {
      return (!center || loc.center === center) &&
             (!zone || loc.zone === zone) &&
             (!search || loc.loc.toLowerCase().includes(search));
    });

    const resultsHtml = filtered.map((loc, index) => `
      <tr data-center="${loc.center}" data-zone="${loc.zone}" data-loc="${loc.loc}" style="cursor: pointer;">
        <td>${index + 1}</td>
        <td>${loc.center}</td>
        <td>${loc.zone}</td>
        <td><code>${loc.loc}</code></td>
      </tr>
    `).join('');

    $('#location-search-results').html(resultsHtml || '<tr><td colspan="4" class="text-center text-muted">검색 결과가 없습니다.</td></tr>');
    $('#select-location-btn').prop('disabled', true);
  }

  calculateStock(products) {
    let total = 0, normal = 0, scheduled = 0, hold = 0;
    products.forEach(p => {
      scheduled += (p.scheduledRelease || 0);
      hold += (p.holdStock || 0);
      p.locations.forEach(l => {
        total += l.current;
        if (l.status === '정상' || l.status === '유통기한임박') {
          normal += l.current;
        }
      });
    });
    const available = normal - scheduled - hold;
    return { total, available, scheduled, hold };
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case '정상': return 'badge-success';
      case '유통기한임박': return 'badge-warning';
      case '파손': return 'badge-danger';
      case '불량': return 'badge-secondary';
      default: return 'badge-light';
    }
  }

  selectRelatedProduct(optionCode) {
    this.activeRelatedProductCode = optionCode;
    
    // 연관 상품 카드 선택 상태 변경
    $('.related-product-card').removeClass('border-primary bg-light').addClass('border-secondary');
    $(`.related-product-card[data-option-code="${optionCode}"]`).removeClass('border-secondary').addClass('border-primary bg-light');
    
    // 선택된 재고 현황 업데이트
    $('#selected-stock-status-container').html(this.renderSelectedStockStatus(optionCode));
  }

  renderSelectedStockStatus(optionCode) {
    const product = this.database[optionCode];
    if (!product) return '';
    
    const productStock = this.calculateStock([product]);
    
    return `
      <div class="card">
        <div class="card-header">
          <h5 class="card-title">선택된 재고 현황 (${product.optionCode})</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-4 mb-3">
              <div class="text-muted">현재재고</div>
              <div class="h4 font-weight-bold text-dark">${productStock.total.toLocaleString()}</div>
            </div>
            <div class="col-4 mb-3">
              <div class="text-muted">가용재고</div>
              <div class="h4 font-weight-bold text-primary">${productStock.available.toLocaleString()}</div>
            </div>
            <div class="col-4 mb-3">
              <div class="text-muted">출고예정</div>
              <div class="h5 font-weight-bold text-warning">${productStock.scheduled.toLocaleString()}</div>
            </div>
            <div class="col-6">
              <div class="text-muted">보류</div>
              <div class="h5 font-weight-bold text-danger">${productStock.hold.toLocaleString()}</div>
            </div>
            <div class="col-6">
              <div class="text-muted">유통기한임박</div>
              <div class="h5 font-weight-bold text-warning">${this.calculateNearingExpiry([product]).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  calculateNearingExpiry(products) {
    let nearingExpiry = 0;
    products.forEach(p => {
      p.locations.forEach(l => {
        if (l.status === '유통기한임박') {
          nearingExpiry += l.current;
        }
      });
    });
    return nearingExpiry;
  }

  getCurrentTimestamp() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }
}

/**
 * 새로운 주문등록 페이지 클래스들
 */
class Qoo10OrderRegisterPage extends BasePage {
  constructor() {
    super('qoo10-order-register', 'Qoo10 주문 등록');
  }

  async render() {
    return `
      <div class="content-header">
        <h1>Qoo10 주문 등록</h1>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Qoo10 주문 등록</h3>
          </div>
          <div class="card-body">
            <div class="text-center py-5">
              <i class="fas fa-tools fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">준비 중입니다</h4>
              <p class="text-muted">Qoo10 주문 등록 기능을 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

class RakutenOrderRegisterPage extends BasePage {
  constructor() {
    super('rakuten-order-register', 'Rakuten 주문 등록');
  }

  async render() {
    return `
      <div class="content-header">
        <h1>Rakuten 주문 등록</h1>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Rakuten 주문 등록</h3>
          </div>
          <div class="card-body">
            <div class="text-center py-5">
              <i class="fas fa-tools fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">준비 중입니다</h4>
              <p class="text-muted">Rakuten 주문 등록 기능을 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

class NhnOrderRegisterPage extends BasePage {
  constructor() {
    super('nhn-order-register', 'NHN 주문 등록');
  }

  async render() {
    return `
      <div class="content-header">
        <h1>NHN 주문 등록</h1>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">NHN 주문 등록</h3>
          </div>
          <div class="card-body">
            <div class="text-center py-5">
              <i class="fas fa-tools fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">준비 중입니다</h4>
              <p class="text-muted">NHN 주문 등록 기능을 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

class PlayAutoOrderRegisterPage extends BasePage {
  constructor() {
    super('playauto-order-register', 'Play Auto 주문 등록');
  }

  async render() {
    return `
      <div class="content-header">
        <h1>Play Auto 주문 등록</h1>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Play Auto 주문 등록</h3>
          </div>
          <div class="card-body">
            <div class="text-center py-5">
              <i class="fas fa-tools fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">준비 중입니다</h4>
              <p class="text-muted">Play Auto 주문 등록 기능을 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * 새로운 주문관리 페이지 클래스들
 */
class OrderInfoManagementPage extends BasePage {
  constructor() {
    super('order-info-management', '주문정보관리');
  }

  async render() {
    return `
      <section class="content p-3">
        <div class="container-fluid">
          <!-- 주문정보관리 영역 -->
          <div class="card mb-3">
            <div class="card-header">
              <h3 class="card-title card-title-lg">주문정보관리</h3>
            </div>
            <div class="card-body">
              <div class="function-cards-container">
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-search">
                    <div class="function-icon">
                      <i class="fas fa-search"></i>
                    </div>
                    <div class="function-title">주문 검색</div>
                    <div class="function-desc">주문번호, 고객명, 상품명으로 주문 검색</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-filter">
                    <div class="function-icon">
                      <i class="fas fa-filter"></i>
                    </div>
                    <div class="function-title">주문 필터링</div>
                    <div class="function-desc">상태, 날짜, 금액별로 주문 필터링</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-edit">
                    <div class="function-icon">
                      <i class="fas fa-edit"></i>
                    </div>
                    <div class="function-title">주문 수정</div>
                    <div class="function-desc">주문 정보 수정 및 업데이트</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-status">
                    <div class="function-icon">
                      <i class="fas fa-tasks"></i>
                    </div>
                    <div class="function-title">주문 상태 관리</div>
                    <div class="function-desc">주문 상태 변경 및 진행 상황 관리</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-export">
                    <div class="function-icon">
                      <i class="fas fa-download"></i>
                    </div>
                    <div class="function-title">주문 내보내기</div>
                    <div class="function-desc">Excel, CSV 형태로 주문 데이터 내보내기</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-print">
                    <div class="function-icon">
                      <i class="fas fa-print"></i>
                    </div>
                    <div class="function-title">주문서 출력</div>
                    <div class="function-desc">주문서 및 송장 출력</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-history">
                    <div class="function-icon">
                      <i class="fas fa-history"></i>
                    </div>
                    <div class="function-title">주문 이력</div>
                    <div class="function-desc">주문 변경 이력 및 로그 조회</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-bulk">
                    <div class="function-icon">
                      <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="function-title">일괄 처리</div>
                    <div class="function-desc">여러 주문의 일괄 상태 변경</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-statistics">
                    <div class="function-icon">
                      <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="function-title">주문 통계</div>
                    <div class="function-desc">주문 현황 및 통계 데이터 조회</div>
                  </div>
                </div>
                <div class="function-card-wrapper">
                  <div class="function-card" data-function="order-backup">
                    <div class="function-icon">
                      <i class="fas fa-save"></i>
                    </div>
                    <div class="function-title">주문 백업</div>
                    <div class="function-desc">주문 데이터 백업 및 복원</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 주문 목록 테이블 -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">주문 목록</h3>
              <div class="card-tools">
                <button type="button" class="btn btn-sm btn-primary">
                  <i class="fas fa-plus"></i> 새 주문
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th><input type="checkbox" id="selectAll"></th>
                      <th>주문번호</th>
                      <th>고객명</th>
                      <th>상품명</th>
                      <th>수량</th>
                      <th>금액</th>
                      <th>주문일시</th>
                      <th>상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colspan="9" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2"></i><br>
                        주문 데이터가 없습니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
  
  async setupEventListeners() {
    // CSS 그리드 레이아웃 강제 적용
    this.forceGridLayout();
    
    // 기존 이벤트 리스너 제거
    $('.function-card').off('click.orderinfo');
    $('#selectAll').off('change.orderinfo');
    
    // 기능 카드 클릭 이벤트
    $('.function-card').on('click.orderinfo', (e) => {
      const functionType = $(e.currentTarget).data('function');
      this.handleFunctionClick(functionType);
    });
    
    // 전체 선택 체크박스
    $('#selectAll').on('change.orderinfo', function() {
      const isChecked = $(this).is(':checked');
      $('tbody input[type="checkbox"]').prop('checked', isChecked);
    });
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
  
  handleFunctionClick(functionType) {
    const messages = {
      'order-search': '주문 검색 기능을 실행합니다.',
      'order-filter': '주문 필터링 기능을 실행합니다.',
      'order-edit': '주문 수정 기능을 실행합니다.',
      'order-status': '주문 상태 관리 기능을 실행합니다.',
      'order-export': '주문 내보내기 기능을 실행합니다.',
      'order-print': '주문서 출력 기능을 실행합니다.',
      'order-history': '주문 이력 조회 기능을 실행합니다.',
      'order-bulk': '일괄 처리 기능을 실행합니다.',
      'order-statistics': '주문 통계 조회 기능을 실행합니다.',
      'order-backup': '주문 백업 기능을 실행합니다.'
    };
    
    const message = messages[functionType] || '기능을 실행합니다.';
    
    // Toast 알림 표시
    if (typeof toastr !== 'undefined') {
      toastr.info(message);
    } else {
      alert(message);
    }
  }
}

class DeletedOrderManagementPage extends BasePage {
  constructor() {
    super('deleted-order-management', '삭제 주문 관리');
  }

  async render() {
    return `
      <div class="content-header">
        <h1>삭제 주문 관리</h1>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">삭제 주문 관리</h3>
          </div>
          <div class="card-body">
            <div class="text-center py-5">
              <i class="fas fa-tools fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">준비 중입니다</h4>
              <p class="text-muted">삭제 주문 관리 기능을 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

class ArchivedOrderManagementPage extends BasePage {
  constructor() {
    super('archived-order-management', '보관 주문 관리');
  }

  async render() {
    return `
      <div class="content-header">
        <h1>보관 주문 관리</h1>
      </div>
      <div class="content">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">보관 주문 관리</h3>
          </div>
          <div class="card-body">
            <div class="text-center py-5">
              <i class="fas fa-tools fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">준비 중입니다</h4>
              <p class="text-muted">보관 주문 관리 기능을 준비 중입니다.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// 페이지 관리자 싱글톤 인스턴스 (모든 클래스 정의 후에 생성)
const pageManager = new PageManager();

// 새로운 페이지 클래스들 추가 등록
pageManager.registerNewPageClasses();

// 전역 스코프에 노출
window.PageManager = PageManager;
window.pageManager = pageManager;
window.DashboardPage = DashboardPage;
window.NoticePage = NoticePage;
window.AutoOrderRegisterPage = AutoOrderRegisterPage;
window.ManualOrderRegisterPage = ManualOrderRegisterPage;
window.DeletedOrdersPage = DeletedOrdersPage;
window.ArchivedOrdersPage = ArchivedOrdersPage;
window.InboundListPage = InboundListPage;
window.InboundHistoryPage = InboundHistoryPage;
window.InboundRegisterPage = InboundRegisterPage;
window.OutboundHistoryPage = OutboundHistoryPage;
window.OutboundRegisterPage = OutboundRegisterPage;
window.InventoryAdjustmentPage = InventoryAdjustmentPage;
window.StatisticsPage = StatisticsPage;
window.SettingsPage = SettingsPage;

// 새로운 페이지 클래스들도 전역 등록
window.Qoo10OrderRegisterPage = Qoo10OrderRegisterPage;
window.RakutenOrderRegisterPage = RakutenOrderRegisterPage;
window.NhnOrderRegisterPage = NhnOrderRegisterPage;
window.PlayAutoOrderRegisterPage = PlayAutoOrderRegisterPage;
window.OrderInfoManagementPage = OrderInfoManagementPage;
window.DeletedOrderManagementPage = DeletedOrderManagementPage;
window.ArchivedOrderManagementPage = ArchivedOrderManagementPage; 