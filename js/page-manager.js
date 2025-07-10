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
    this.pageClasses.set('auto-order-register', AutoOrderRegisterPage);
    this.pageClasses.set('manual-order-register', ManualOrderRegisterPage);
    this.pageClasses.set('deleted-orders', DeletedOrdersPage);
    this.pageClasses.set('archived-orders', ArchivedOrdersPage);
    this.pageClasses.set('inbound-history', InboundHistoryPage);
    this.pageClasses.set('inbound-register', InboundRegisterPage);
    this.pageClasses.set('outbound-history', OutboundHistoryPage);
    this.pageClasses.set('outbound-register', OutboundRegisterPage);
    this.pageClasses.set('statistics', StatisticsPage);
    this.pageClasses.set('settings', SettingsPage);

    console.log('페이지 클래스 등록 완료:', Array.from(this.pageClasses.keys()));
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
      console.log(`페이지 인스턴스 생성: ${pageId}`);
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
    console.log(`페이지 전환 요청: ${pageId}`);
    
    // 현재 페이지와 동일한 경우 무시
    if (this.currentPage && this.currentPage.getId() === pageId) {
      console.log(`이미 현재 페이지: ${pageId}`);
      return this.currentPage;
    }

    try {
      // 이전 페이지 언로드
      if (this.currentPage) {
        await this.unloadCurrentPage();
      }

      // 새 페이지 로드
      let page = this.pages.get(pageId);
      
      if (!page) {
        page = this.createPageInstance(pageId);
        this.pages.set(pageId, page);
      }

      // 페이지 로드 및 초기화
      await page.load();
      
      // 현재 페이지 설정
      this.currentPage = page;
      
      // 메뉴 활성화 상태 업데이트
      this.updateMenuState(pageId);
      
      console.log(`페이지 전환 완료: ${pageId}`);
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
          <!-- 검색 영역 -->
          <div class="card mb-3">
            <div class="card-body py-3">
              <div class="row align-items-end">
                <!-- 첫 번째 줄 -->
                <div class="col-md-2 col-sm-6 mb-2">
                  <label class="form-label text-sm text-muted mb-1">소팅 옵션</label>
                  <select class="form-control form-control-sm">
                    <option>등록일순</option>
                    <option>주문번호순</option>
                    <option>고객명순</option>
                    <option>상태순</option>
                  </select>
                </div>
                <div class="col-md-2 col-sm-6 mb-2">
                  <label class="form-label text-sm text-muted mb-1">API 유형</label>
                  <select class="form-control form-control-sm">
                    <option>전체</option>
                    <option>주문 API</option>
                    <option>재고 API</option>
                    <option>배송 API</option>
                  </select>
                </div>
                <div class="col-md-2 col-sm-6 mb-2">
                  <label class="form-label text-sm text-muted mb-1">검색 시작일</label>
                  <input type="date" class="form-control form-control-sm" value="2025-01-13">
                </div>
                <div class="col-md-2 col-sm-6 mb-2">
                  <label class="form-label text-sm text-muted mb-1">검색 종료일</label>
                  <input type="date" class="form-control form-control-sm" value="2025-01-13">
                </div>
                <div class="col-md-4 mb-2">
                  <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-secondary">전일</button>
                    <button type="button" class="btn btn-outline-secondary">당일</button>
                    <button type="button" class="btn btn-primary">금일</button>
                  </div>
                </div>
              </div>
              
              <div class="row align-items-end mt-2">
                <!-- 두 번째 줄 -->
                <div class="col-md-2 col-sm-6 mb-2">
                  <label class="form-label text-sm text-muted mb-1">처리 상태</label>
                  <select class="form-control form-control-sm">
                    <option>전체</option>
                    <option>대기중</option>
                    <option>처리중</option>
                    <option>완료</option>
                    <option>실패</option>
                  </select>
                </div>
                <div class="col-md-6 mb-2">
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
                <div class="col-md-4 mb-2">
                  <div class="btn-group btn-group-sm ml-2" role="group">
                    <button type="button" class="btn btn-outline-secondary">
                      <i class="fas fa-redo mr-1"></i>초기화
                    </button>
                    <button type="button" class="btn btn-primary">
                      <i class="fas fa-search mr-1"></i>조회
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 자동 등록 설정 영역 -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title card-title-lg">자동 주문 등록</h3>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <div class="form-group">
                    <label class="font-weight-bold">주문 파일 업로드</label>
                    <div class="custom-file">
                      <input type="file" class="custom-file-input" id="orderFile" accept=".xlsx,.xls,.csv">
                      <label class="custom-file-label" for="orderFile">파일을 선택하세요</label>
                    </div>
                    <small class="form-text text-muted">지원 형식: Excel (.xlsx, .xls), CSV (.csv)</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label class="font-weight-bold">처리 방식</label>
                    <select class="form-control">
                      <option value="immediate">즉시 처리</option>
                      <option value="scheduled">예약 처리</option>
                      <option value="review">검토 후 처리</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group">
                    <label class="font-weight-bold">처리 우선순위</label>
                    <select class="form-control">
                      <option value="normal">보통</option>
                      <option value="high">높음</option>
                      <option value="urgent">긴급</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="font-weight-bold">예약 처리 시간</label>
                    <div class="row">
                      <div class="col-6">
                        <input type="date" class="form-control" placeholder="날짜 선택">
                      </div>
                      <div class="col-6">
                        <input type="time" class="form-control" placeholder="시간 선택">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="font-weight-bold">알림 설정</label>
                    <div class="form-check-inline">
                      <input class="form-check-input" type="checkbox" id="emailNotification">
                      <label class="form-check-label" for="emailNotification">이메일 알림</label>
                    </div>
                    <div class="form-check-inline">
                      <input class="form-check-input" type="checkbox" id="smsNotification">
                      <label class="form-check-label" for="smsNotification">SMS 알림</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-12">
                  <button class="btn btn-primary btn-lg mr-2">
                    <i class="fas fa-upload mr-2"></i>자동 등록 시작
                  </button>
                  <button class="btn btn-outline-primary btn-lg mr-2">
                    <i class="fas fa-eye mr-2"></i>미리보기
                  </button>
                  <button class="btn btn-outline-secondary btn-lg">
                    <i class="fas fa-download mr-2"></i>템플릿 다운로드
                  </button>
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
        
        .custom-file-label::after {
          content: "찾아보기";
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
      </style>
    `;
    
    $('#main-content').html(html);
    
    // 파일 업로드 라벨 업데이트
    $('#orderFile').on('change', function() {
      const fileName = $(this).val().split('\\').pop();
      $(this).next('.custom-file-label').html(fileName || '파일을 선택하세요');
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

// 페이지 관리자 싱글톤 인스턴스
const pageManager = new PageManager();

// 전역 스코프에 노출
window.PageManager = PageManager;
window.pageManager = pageManager;
window.DashboardPage = DashboardPage;
window.NoticePage = NoticePage;
window.AutoOrderRegisterPage = AutoOrderRegisterPage;
window.ManualOrderRegisterPage = ManualOrderRegisterPage;
window.DeletedOrdersPage = DeletedOrdersPage;
window.ArchivedOrdersPage = ArchivedOrdersPage;
window.InboundHistoryPage = InboundHistoryPage;
window.InboundRegisterPage = InboundRegisterPage;
window.OutboundHistoryPage = OutboundHistoryPage;
window.OutboundRegisterPage = OutboundRegisterPage;
window.StatisticsPage = StatisticsPage;
window.SettingsPage = SettingsPage; 