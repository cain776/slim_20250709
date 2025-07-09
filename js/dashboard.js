/**
 * Dashboard.js - 대시보드 페이지 관리
 * eXmate slim 물류 관리 시스템
 */

// 대시보드 데이터 (이제 DataService를 통해 가져옴)
let dashboardData = null;

/**
 * 대시보드 콘텐츠 로드
 */
async function loadDashboardContent() {
  try {
    // 로딩 상태 표시
    showLoading();
    
    // 데이터 서비스에서 대시보드 데이터 가져오기
    dashboardData = await dataService.getDashboardData();
    
    // HTML 생성 및 렌더링
    const dashboardHtml = generateDashboardHtml();
    $('#main-content').html(dashboardHtml);
    
    // 페이지 로드 완료 후 초기화
    setTimeout(() => {
      initializeDashboardPage();
    }, 100);
    
  } catch (error) {
    console.error('대시보드 로드 실패:', error);
    showError(Config.getStatusMessage('ERROR'));
  }
}

/**
 * 대시보드 HTML 생성
 */
function generateDashboardHtml() {
  return `
    <section class="content p-3">
      <div class="container-fluid">
        <!-- Top Row -->
        <div class="row d-flex align-items-stretch">
          <div class="col-lg-9 d-flex align-items-stretch">
            ${generateSummaryCard()}
          </div>
          <div class="col-lg-3 d-flex align-items-stretch">
            ${generateNoticeCard()}
          </div>
        </div>

        <!-- Bottom Row -->
        <div class="row d-flex align-items-stretch">
          <section class="col-lg-9 d-flex align-items-stretch">
            ${generateStatusCard()}
          </section>
          
          <section class="col-lg-3 d-flex align-items-stretch">
            <div class="d-flex flex-column w-100">
              ${generateQuickLinksCard()}
              ${generatePromotionCard()}
            </div>
          </section>
        </div>
      </div>
    </section>
  `;
}

/**
 * 요약 정보 카드 생성
 */
function generateSummaryCard() {
  const { summary } = dashboardData;
  
  return `
    <div class="card w-100">
      <div class="card-header">
        <h3 class="card-title card-title-lg">전체 지연 현황 요약</h3>
      </div>
      <div class="card-body d-flex align-items-center p-3">
        <div class="row w-100">
          <div class="col-md-4">
            <div class="summary-box">
              <div class="summary-box-label">전체 처리지연</div>
              <div class="summary-box-value value-primary">${summary.totalDelay}<span class="unit">건</span></div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="summary-box">
              <div class="summary-box-label">최장기 지연 (15+일)</div>
              <div class="summary-box-value value-danger">${summary.longDelay}<span class="unit">건</span></div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="summary-box">
              <div class="summary-box-label">최다 지연 사유: ${summary.mostDelayCause}</div>
              <div class="summary-box-value value-warning">${summary.mostDelayCount}<span class="unit">건</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 공지사항 카드 생성
 */
function generateNoticeCard() {
  const { notices } = dashboardData;
  
  const noticeItems = notices.map(notice => `
    <li class="nav-item">
      <a href="#" class="nav-link">
        ${notice.title}
        <span class="float-right text-muted">${notice.date}</span>
      </a>
    </li>
  `).join('');
  
  return `
    <div class="card w-100 d-flex flex-column">
      <div class="card-header">
        <div class="row no-gutters align-items-center">
          <div class="col">
            <h3 class="card-title card-title-lg mb-0">공지사항</h3>
          </div>
          <div class="col-auto">
            <a href="#" class="text-link" onclick="loadPage('notice')">더보기+</a>
          </div>
        </div>
      </div>
      <div class="card-body p-0 pb-2 notice-box">
        <ul class="nav nav-pills flex-column">
          ${noticeItems}
        </ul>
      </div>
    </div>
  `;
}

/**
 * 상태별 상세 현황 카드 생성
 */
function generateStatusCard() {
  return `
    <div class="card w-100">
      <div class="card-header">
        <h3 class="card-title card-title-lg">상태별 상세 현황</h3>
      </div>
      <div class="card-body p-3">
        <div class="d-sm-flex justify-content-between align-items-center p-2 mb-3 bg-light rounded">
          <h5 class="mb-2 mb-sm-0 sub-title">미입고 현황</h5>
          <a href="#" class="text-link" onclick="loadPage('statistics')">
            일별 입고 현황 <i class="fas fa-arrow-circle-right ml-1"></i>
          </a>
        </div>
        <table class="table table-bordered table-hover status-table">
          <thead>
            <tr>
              <th>상태</th>
              <th class="text-center">D+3</th>
              <th class="text-center">D+5</th>
              <th class="text-center">D+7</th>
              <th class="text-center">D+10</th>
              <th class="text-center text-danger">D+15 이상</th>
              <th class="text-center">합계</th>
            </tr>
          </thead>
          <tbody id="status-table-body">
            <!-- 테이블 내용은 JavaScript에서 동적으로 생성 -->
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 바로가기 카드 생성
 */
function generateQuickLinksCard() {
  const { quickLinks } = dashboardData;
  const externalLinks = Config.getExternalLinks();
  
  const linkItems = quickLinks.map(link => {
    let linkProps = '';
    if (link.modal) {
      linkProps = `data-toggle="modal" data-target="#${link.modal}"`;
    } else if (link.url && link.url !== '#') {
      // 외부 링크 설정 사용
      if (link.id === 'rate') {
        linkProps = `href="${externalLinks.rateGuide}" target="_blank" rel="noopener noreferrer"`;
      } else if (link.id === 'company') {
        linkProps = `href="${externalLinks.companyInfo}" target="_blank" rel="noopener noreferrer"`;
      } else {
        linkProps = `href="${link.url}" target="_blank" rel="noopener noreferrer"`;
      }
    } else {
      linkProps = 'href="#"';
    }
    
    return `
      <div class="col-3">
        <a ${linkProps} class="quick-link-item">
          <i class="${link.icon}"></i>
          <span>${link.text}</span>
        </a>
      </div>
    `;
  }).join('');
  
  return `
    <div class="card">
      <div class="card-body p-3">
        <div class="row">
          ${linkItems}
        </div>
      </div>
    </div>
  `;
}

/**
 * 프로모션 카드 생성
 */
function generatePromotionCard() {
  const { promotions } = dashboardData;
  
  // 캐러셀 인디케이터 생성
  const carouselIndicators = promotions.map((_, index) => `
    <li data-target="#promoCarousel" data-slide-to="${index}" class="${index === 0 ? 'active' : ''}"></li>
  `).join('');
  
  const carouselItems = promotions.map((promo, index) => `
    <div class="carousel-item ${index === 0 ? 'active' : ''}">
      <div class="promo-banner-container" style="background-color: ${promo.bgColor};">
        <div class="promo-banner-content">
          <div class="promo-banner-text">
            <h5 class="promo-title" style="color: ${promo.textColor};">${promo.title}</h5>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  return `
    <div class="card flex-grow-1">
      <div class="card-body p-0">
        <div class="promo-carousel-wrapper">
          <div id="promoCarousel" class="carousel slide" data-ride="carousel">
            <!-- 인디케이터 추가 -->
            <ol class="carousel-indicators">
              ${carouselIndicators}
            </ol>
            
            <div class="carousel-inner">
              ${carouselItems}
            </div>
            
            <!-- 좌우 화살표 추가 -->
            <a class="carousel-control-prev" href="#promoCarousel" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="sr-only">Previous</span>
            </a>
            <a class="carousel-control-next" href="#promoCarousel" role="button" data-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="sr-only">Next</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 대시보드 페이지 초기화
 */
function initializeDashboardPage() {
  console.log('대시보드 페이지 초기화 시작');
  
  // 상태 테이블 데이터 생성
  generateStatusTable();
  
  // 캐러셀 초기화
  initializeCarousel();
  
  // URL 복사 기능 초기화
  initializeCopyUrlFeature();
  
  // 애니메이션 효과 적용
  $('.card').addClass('fade-in');
  
  console.log('대시보드 페이지 초기화 완료');
}

/**
 * 상태 테이블 생성
 */
function generateStatusTable() {
  const { statusData } = dashboardData;
  const tableBody = $('#status-table-body');
  
  if (tableBody.length) {
    tableBody.empty();
    
    statusData.forEach(data => {
      const total = data.delays.reduce((a, b) => a + b, 0);
      let cellsHTML = `<td><strong>${data.status}</strong></td>`;
      
      data.delays.forEach((count, index) => {
        let textColor = 'text-dark';
        if (count > 0) {
          if (index <= 1) { // D+3, D+5
            textColor = 'text-warning';
          } else { // D+7, D+10, D+15
            textColor = 'text-danger';
          }
        }
        cellsHTML += `<td class="text-center ${count > 0 ? 'font-weight-bold' : ''} ${textColor}">${count}</td>`;
      });
      
      cellsHTML += `<td class="text-center font-weight-bold text-primary">${total}</td>`;
      tableBody.append(`<tr>${cellsHTML}</tr>`);
    });
  }
}

/**
 * 캐러셀 초기화
 */
function initializeCarousel() {
  $('#promoCarousel').carousel({
    interval: 3000,
    pause: 'hover'
  });
}

/**
 * URL 복사 기능 초기화
 */
function initializeCopyUrlFeature() {
  const externalLinks = Config.getExternalLinks();
  const trackingBaseUrl = externalLinks.tracking.baseUrl;
  const paramName = externalLinks.tracking.paramName;
  
  // 추적 URL 업데이트
  const trackingUrl = `${trackingBaseUrl}?${paramName}={A}`;
  $('#trackingUrl').val(trackingUrl);
  
  $('#copyUrlBtn').off('click').on('click', function() {
    const trackingUrlInput = $('#trackingUrl');
    const button = $(this);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingUrlInput.val()).then(() => {
        showCopySuccess(button);
      }).catch(() => {
        fallbackCopyTextToClipboard(trackingUrlInput.val(), button);
      });
    } else {
      fallbackCopyTextToClipboard(trackingUrlInput.val(), button);
    }
  });
}

/**
 * 복사 성공 표시
 */
function showCopySuccess(button) {
  const originalText = button.text();
  button.text('복사됨!').addClass('btn-success').removeClass('btn-outline-secondary');
  
  setTimeout(() => {
    button.text(originalText).removeClass('btn-success').addClass('btn-outline-secondary');
  }, 2000);
}

/**
 * 대체 복사 기능 (구형 브라우저)
 */
function fallbackCopyTextToClipboard(text, button) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopySuccess(button);
  } catch (err) {
    console.error('복사 실패:', err);
    button.text('복사 실패').addClass('btn-danger').removeClass('btn-outline-secondary');
    setTimeout(() => {
      button.text('복사').removeClass('btn-danger').addClass('btn-outline-secondary');
    }, 2000);
  }
  
  document.body.removeChild(textArea);
}

/**
 * 대시보드 데이터 새로고침
 */
function refreshDashboardData() {
  console.log('대시보드 데이터 새로고침');
  
  // 실제 환경에서는 서버에서 데이터를 가져와야 함
  // 여기서는 테이블만 다시 생성
  generateStatusTable();
}

/**
 * 유틸리티 함수들
 */
function formatNumber(num) {
  return new Intl.NumberFormat('ko-KR').format(num);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit'
  });
}

// 전역 함수로 노출
window.loadDashboardContent = loadDashboardContent;
window.initializeDashboardPage = initializeDashboardPage;
window.refreshDashboardData = refreshDashboardData; 