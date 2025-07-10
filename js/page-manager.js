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

// 페이지 관리자 싱글톤 인스턴스
const pageManager = new PageManager();

// 전역 스코프에 노출
window.PageManager = PageManager;
window.pageManager = pageManager;
window.DashboardPage = DashboardPage;
window.NoticePage = NoticePage;
window.InboundHistoryPage = InboundHistoryPage;
window.InboundRegisterPage = InboundRegisterPage;
window.OutboundHistoryPage = OutboundHistoryPage;
window.OutboundRegisterPage = OutboundRegisterPage;
window.StatisticsPage = StatisticsPage;
window.SettingsPage = SettingsPage; 