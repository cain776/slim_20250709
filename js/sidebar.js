/**
 * Sidebar.js - 사이드바 메뉴 관리 및 페이지 로딩
 * eXmate slim 물류 관리 시스템
 */

// 메뉴 데이터 구조 (Config에서 가져옴)
const menuData = Config.getMenuConfig();

// 현재 활성 페이지
let currentPage = Config.getAppConfig().defaultPage;

/**
 * 페이지 로드 시 초기화
 */
$(document).ready(function() {
  initializeSidebar();
  loadPage('dashboard');
});

/**
 * 사이드바 초기화
 */
function initializeSidebar() {
  // LNB 메뉴 클릭 이벤트 처리
  $('#lnb-menu .nav-link').on('click', function(e) {
    let $this = $(this);
    let pageId = $this.data('page');
    
    // href가 #인 경우만 기본 동작 방지
    if ($this.attr('href') === '#') {
      e.preventDefault();
    }

    // 페이지 ID가 있는 경우에만 페이지 로드
    if (pageId) {
      loadPage(pageId);
    }

    // 메뉴 활성화 상태 업데이트
    updateMenuActiveState($this);
  });

  console.log('사이드바가 초기화되었습니다.');
}

/**
 * 메뉴 활성화 상태 업데이트
 */
function updateMenuActiveState($clickedLink) {
  let isSubmenuLink = $clickedLink.parents('.nav-treeview').length > 0;
  
  if (!isSubmenuLink) {
    // 모든 링크 비활성화
    $('#lnb-menu .nav-link').removeClass('active');
    // 활성화된 서브메뉴의 부모 비활성화
    $('#lnb-menu .nav-item.is-expanded').removeClass('is-expanded');
  } else {
    // 같은 서브메뉴 내 다른 링크들 비활성화
    $clickedLink.closest('.nav-treeview').find('.nav-link').removeClass('active');
  }

  // 클릭된 링크 활성화
  $clickedLink.addClass('active');
  
  // 서브메뉴 항목인 경우 부모 메뉴도 활성화
  if (isSubmenuLink) {
    $clickedLink.closest('.nav-item.has-treeview').children('.nav-link').addClass('active');
  }
}

/**
 * 페이지 로드 함수 (간단한 버전)
 */
async function loadPage(pageId) {
  if (currentPage === pageId) return;
  
  currentPage = pageId;
  
  try {
    await pageManager.loadPage(pageId);
  } catch (error) {
    console.error(`페이지 로드 실패: ${pageId}`, error);
    $('#main-content').html(`
      <div class="content-header">
        <h1>오류</h1>
      </div>
      <div class="content">
        <div class="alert alert-danger">
          페이지 로드 중 오류가 발생했습니다.
        </div>
      </div>
    `);
  }
}

/**
 * 로딩 상태 표시
 */
function showLoading() {
  const loadingMessage = Config.getStatusMessage('LOADING');
  const loadingHtml = `
    <div class="loading">
      <div class="spinner"></div>
      <span class="ml-2">${loadingMessage}</span>
    </div>
  `;
  $('#main-content').html(loadingHtml);
}

/**
 * 에러 메시지 표시
 */
function showError(message) {
  const errorMessage = message || Config.getStatusMessage('ERROR');
  const errorHtml = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p class="mt-2">${errorMessage}</p>
    </div>
  `;
  $('#main-content').html(errorHtml);
}

/**
 * 페이지 로드 완료 후 초기화 함수 호출 (레거시 지원)
 */
function initializePage(pageId) {
  // PageManager를 통한 현재 페이지 가져오기
  const currentPageInstance = pageManager.getCurrentPage();
  
  if (currentPageInstance && currentPageInstance.isPageInitialized()) {
    console.log(`${pageId} 페이지 이미 초기화됨`);
    return;
  }
  
  // 레거시 초기화 함수 호출 (하위 호환성)
  const initFunctionName = `initialize${pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}Page`;
  
  if (typeof window[initFunctionName] === 'function') {
    window[initFunctionName]();
    console.log(`${pageId} 레거시 페이지 초기화 완료`);
  }
}

/**
 * 레거시 페이지 로드 함수들 (PageManager로 대체됨)
 * 하위 호환성을 위해 유지
 */

// 대시보드 로드 함수는 PageManager의 DashboardPage가 처리
// 기타 페이지들은 PageManager의 기본 페이지 클래스들이 처리

/**
 * 페이지 새로고침 함수
 */
function refreshCurrentPage() {
  const currentPageId = pageManager.getCurrentPageId();
  if (currentPageId) {
    pageManager.refreshCurrentPage();
  } else {
    loadPage(Config.getAppConfig().defaultPage);
  }
}

/**
 * 유틸리티 함수들 (PageManager와 연동)
 */
function getCurrentPage() {
  return pageManager.getCurrentPageId() || currentPage;
}

// 전역 함수로 노출
window.loadPage = loadPage;
window.getCurrentPage = getCurrentPage;
window.refreshCurrentPage = refreshCurrentPage; 