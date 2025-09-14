/**
 * Banner-Controller.js - 배너 전용 제어 시스템
 * eXmate slim 물류 관리 시스템
 * 
 * 주의: 기존 코드와 완전히 분리된 독립적 시스템
 * 네임스페이스: BannerController
 */

class BannerController {
  constructor() {
    this.banners = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.interval = null;
    this.settings = {
      autoPlay: true,
      speed: 3000,
      transition: 'fade',
      pauseOnHover: true
    };
    
    this.carouselElement = null;
    this.panelElement = null;
    this.isInitialized = false;
    
    this.init();
  }

  /**
   * 배너 컨트롤러 초기화
   */
  init() {
    // DOM이 준비될 때까지 대기
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * 시스템 설정
   */
  setup() {
    try {
      this.findCarouselElement();
      this.loadInitialBanners();
      this.createControlPanel();
      this.bindGlobalEvents();
      this.isInitialized = true;
      
      console.log('✅ BannerController 초기화 완료');
    } catch (error) {
      console.error('❌ BannerController 초기화 실패:', error);
    }
  }

  /**
   * 기존 캐러셀 요소 찾기
   */
  findCarouselElement() {
    this.carouselElement = document.getElementById('promoCarousel');
    if (!this.carouselElement) {
      console.warn('⚠️ 프로모션 캐러셀을 찾을 수 없습니다.');
      return;
    }
    
    // 기존 Bootstrap 캐러셀 이벤트 확인
    this.detectExistingCarousel();
  }

  /**
   * 기존 캐러셀 감지 및 상태 동기화
   */
  detectExistingCarousel() {
    // 기존 캐러셀이 활성화되어 있는지 확인
    if (this.carouselElement && window.$ && $('#promoCarousel').data('bs.carousel')) {
      this.isPlaying = true;
      console.log('🔄 기존 캐러셀과 동기화됨');
    }
  }

  /**
   * 초기 배너 데이터 로드
   */
  loadInitialBanners() {
    // 기존 배너 데이터 가져오기 (안전하게)
    try {
      if (window.dashboardData && window.dashboardData.promotions) {
        this.banners = [...window.dashboardData.promotions];
      } else if (window.SAMPLE_DATA && window.SAMPLE_DATA.dashboard && window.SAMPLE_DATA.dashboard.promotions) {
        this.banners = [...window.SAMPLE_DATA.dashboard.promotions];
      } else {
        // 기본 배너 데이터
        this.banners = [
          { 
            id: 1, 
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY2QjZCIi8+CjwvZz4KPC9zdmc+', 
            alt: 'Qoo10 도착보장 칸타슈 오픈',
            title: 'Qoo10 도착보장 칸타슈 오픈',
            bgColor: '#FF6B6B',
            textColor: '#FFFFFF'
          },
          { 
            id: 2, 
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNEVDREM0Ii8+CjwvZz4KPC9zdmc+', 
            alt: '일본 현지 배송사 인계율 98% 달성',
            title: '일본 현지 배송사 인계율 98% 달성',
            bgColor: '#4ECDC4',
            textColor: '#FFFFFF'
          },
          { 
            id: 3, 
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNDVCN0QxIi8+CjwvZz4KPC9zdmc+', 
            alt: '중진공 물류 협력업체로 발탁',
            title: '중진공 물류 협력업체로 발탁',
            bgColor: '#45B7D1',
            textColor: '#FFFFFF'
          },
          { 
            id: 4, 
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOTZDRUI0Ii8+CjwvZz4KPC9zdmc+', 
            alt: 'Qoo10 1분기 주요 트렌드',
            title: 'Qoo10 1분기 주요 트렌드',
            bgColor: '#96CEB4',
            textColor: '#FFFFFF'
          },
          { 
            id: 5, 
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkZFQUE3Ii8+CjwvZz4KPC9zdmc+', 
            alt: '스마트 물류 시스템 도입 완료',
            title: '스마트 물류 시스템 도입 완료',
            bgColor: '#FFEAA7',
            textColor: '#FFFFFF'
          }
        ];
      }
      
      console.log(`📝 ${this.banners.length}개 배너 로드됨`);
    } catch (error) {
      console.error('❌ 배너 데이터 로드 실패:', error);
      this.banners = [];
    }
  }

  /**
   * 제어 패널 생성
   */
  createControlPanel() {
    this.panelElement = document.createElement('div');
    this.panelElement.className = 'banner-ctrl-panel';
    this.panelElement.id = 'banner-ctrl-panel';
    
    this.panelElement.innerHTML = this.generatePanelHTML();
    document.body.appendChild(this.panelElement);
    
    this.bindPanelEvents();
    console.log('🎛️ 배너 제어 패널 생성됨');
  }

  /**
   * 패널 HTML 생성
   */
  generatePanelHTML() {
    return `
      <div class="banner-ctrl-header">
        <h6 class="banner-ctrl-title">배너 제어판</h6>
        <button type="button" class="banner-ctrl-close" onclick="bannerController.hidePanel()">×</button>
      </div>
      <div class="banner-ctrl-body">
        
        <!-- 재생 제어 -->
        <div class="banner-ctrl-section">
          <div class="banner-ctrl-section-title">재생 제어</div>
          <div>
            <button class="banner-ctrl-btn" onclick="bannerController.play()" id="btn-play">
              ▶️ 재생
            </button>
            <button class="banner-ctrl-btn" onclick="bannerController.pause()" id="btn-pause">
              ⏸️ 일시정지
            </button>
            <button class="banner-ctrl-btn" onclick="bannerController.stop()" id="btn-stop">
              ⏹️ 정지
            </button>
          </div>
          <div style="margin-top: 0.75rem;">
            <label class="banner-ctrl-toggle">
              <input type="checkbox" id="auto-play-toggle" ${this.settings.autoPlay ? 'checked' : ''}>
              <span class="banner-ctrl-toggle-slider"></span>
            </label>
            <span style="margin-left: 0.5rem; font-size: 0.85rem;">자동재생</span>
          </div>
        </div>

        <!-- 속도 조절 -->
        <div class="banner-ctrl-section">
          <div class="banner-ctrl-section-title">재생 속도</div>
          <input type="range" class="banner-ctrl-slider" id="speed-slider" 
                 min="1000" max="10000" value="${this.settings.speed}" step="500">
          <div style="font-size: 0.8rem; color: #6c757d; text-align: center;">
            <span id="speed-value">${this.settings.speed / 1000}초</span>
          </div>
        </div>

        <!-- 배너 목록 -->
        <div class="banner-ctrl-section">
          <div class="banner-ctrl-section-title">배너 목록</div>
          <div class="banner-ctrl-list" id="banner-list">
            ${this.generateBannerListHTML()}
          </div>
          <div style="margin-top: 0.75rem;">
            <button class="banner-ctrl-btn success" onclick="bannerController.showAddBannerDialog()">
              ➕ 배너 추가
            </button>
            <button class="banner-ctrl-btn danger" onclick="bannerController.removeCurrentBanner()">
              🗑️ 현재 배너 삭제
            </button>
          </div>
        </div>

        <!-- 현재 배너 정보 -->
        <div class="banner-ctrl-section">
          <div class="banner-ctrl-section-title">현재 배너</div>
          <div class="banner-ctrl-preview" id="current-banner-preview">
            ${this.generateCurrentBannerHTML()}
          </div>
          <div style="text-align: center;">
            <button class="banner-ctrl-btn" onclick="bannerController.prevBanner()">⬅️ 이전</button>
            <button class="banner-ctrl-btn" onclick="bannerController.nextBanner()">➡️ 다음</button>
          </div>
        </div>

        <!-- 상태 정보 -->
        <div class="banner-ctrl-section">
          <div class="banner-ctrl-section-title">시스템 상태</div>
          <div id="banner-status-info">
            ${this.generateStatusHTML()}
          </div>
        </div>

      </div>
    `;
  }

  /**
   * 배너 목록 HTML 생성
   */
  generateBannerListHTML() {
    if (this.banners.length === 0) {
      return '<div class="banner-ctrl-preview-info">등록된 배너가 없습니다.</div>';
    }

    return this.banners.map((banner, index) => `
      <div class="banner-ctrl-item ${index === this.currentIndex ? 'active' : ''}" 
           onclick="bannerController.selectBanner(${index})">
        <img src="${banner.image}" alt="${banner.alt}" class="banner-ctrl-thumbnail">
        <div class="banner-ctrl-info">
          <div class="banner-ctrl-name">${banner.title || banner.alt}</div>
          <div class="banner-ctrl-status">
            <span class="banner-ctrl-status-indicator ${this.isPlaying ? 'playing' : 'paused'}">
              ${this.isPlaying ? 'playing' : 'paused'}
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * 현재 배너 HTML 생성
   */
  generateCurrentBannerHTML() {
    if (this.banners.length === 0) {
      return '<div class="banner-ctrl-preview-info">등록된 배너가 없습니다.</div>';
    }

    const currentBanner = this.banners[this.currentIndex];
    return `
      <img src="${currentBanner.image}" alt="${currentBanner.alt}" class="banner-ctrl-preview-img">
      <div class="banner-ctrl-preview-info">
        ${currentBanner.title || currentBanner.alt} (${this.currentIndex + 1}/${this.banners.length})
      </div>
    `;
  }

  /**
   * 상태 정보 HTML 생성
   */
  generateStatusHTML() {
    return `
      <div style="font-size: 0.8rem; color: #6c757d;">
        <div>📊 총 배너 수: ${this.banners.length}개</div>
        <div>🎯 현재 위치: ${this.currentIndex + 1}/${this.banners.length}</div>
        <div>⚡ 재생 속도: ${this.settings.speed / 1000}초</div>
        <div>🔄 상태: ${this.isPlaying ? '재생 중' : '정지됨'}</div>
        <div>🎮 제어 가능: ${this.carouselElement ? '예' : '아니오'}</div>
      </div>
    `;
  }

  /**
   * 패널 이벤트 바인딩
   */
  bindPanelEvents() {
    // 자동재생 토글
    const autoPlayToggle = document.getElementById('auto-play-toggle');
    if (autoPlayToggle) {
      autoPlayToggle.addEventListener('change', (e) => {
        this.settings.autoPlay = e.target.checked;
        if (this.settings.autoPlay && !this.isPlaying) {
          this.play();
        } else if (!this.settings.autoPlay && this.isPlaying) {
          this.pause();
        }
      });
    }

    // 속도 슬라이더
    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.settings.speed = parseInt(e.target.value);
        document.getElementById('speed-value').textContent = `${this.settings.speed / 1000}초`;
        
        // 재생 중이면 새로운 속도로 재시작
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    }
  }

  /**
   * 전역 이벤트 바인딩
   */
  bindGlobalEvents() {
    // Ctrl + B 단축키로 패널 토글
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        this.togglePanel();
      }
    });

    // 기존 캐러셀 이벤트 감지
    if (this.carouselElement && window.$) {
      $(this.carouselElement).on('slide.bs.carousel', (e) => {
        this.currentIndex = e.to;
        this.updateUI();
      });
    }
  }

  /**
   * 배너 재생
   */
  play() {
    if (!this.carouselElement) return;

    this.isPlaying = true;
    
    // Bootstrap 캐러셀 사용
    if (window.$ && $('#promoCarousel').length) {
      $('#promoCarousel').carousel({
        interval: this.settings.speed,
        pause: this.settings.pauseOnHover ? 'hover' : false
      });
    }
    
    this.updateUI();
    console.log('▶️ 배너 재생 시작');
  }

  /**
   * 배너 일시정지
   */
  pause() {
    if (!this.carouselElement) return;

    this.isPlaying = false;
    
    // Bootstrap 캐러셀 일시정지
    if (window.$ && $('#promoCarousel').length) {
      $('#promoCarousel').carousel('pause');
    }
    
    this.updateUI();
    console.log('⏸️ 배너 일시정지');
  }

  /**
   * 배너 정지
   */
  stop() {
    this.pause();
    this.currentIndex = 0;
    
    // 첫 번째 슬라이드로 이동
    if (window.$ && $('#promoCarousel').length) {
      $('#promoCarousel').carousel(0);
    }
    
    this.updateUI();
    console.log('⏹️ 배너 정지');
  }

  /**
   * 다음 배너
   */
  nextBanner() {
    if (window.$ && $('#promoCarousel').length) {
      $('#promoCarousel').carousel('next');
    }
  }

  /**
   * 이전 배너
   */
  prevBanner() {
    if (window.$ && $('#promoCarousel').length) {
      $('#promoCarousel').carousel('prev');
    }
  }

  /**
   * 배너 선택
   */
  selectBanner(index) {
    if (index >= 0 && index < this.banners.length) {
      this.currentIndex = index;
      
      if (window.$ && $('#promoCarousel').length) {
        $('#promoCarousel').carousel(index);
      }
      
      this.updateUI();
    }
  }

  /**
   * 배너 추가 다이얼로그
   */
  showAddBannerDialog() {
    const title = prompt('배너 제목을 입력하세요:', '새 배너');
    if (title) {
      const bgColor = prompt('배경색을 입력하세요 (예: #667eea):', '#667eea');
      const textColor = prompt('텍스트 색상을 입력하세요 (예: #ffffff):', '#ffffff');
      
      this.addBanner({
        id: Date.now(),
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA4MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNjY3ZWVhIi8+CjwvZz4KPC9zdmc+',
        alt: title,
        title: title,
        bgColor: bgColor || '#667eea',
        textColor: textColor || '#ffffff'
      });
    }
  }

  /**
   * 배너 추가
   */
  addBanner(banner) {
    this.banners.push(banner);
    this.regenerateCarousel();
    this.updateUI();
    console.log('➕ 새 배너 추가됨:', banner.title);
  }

  /**
   * 현재 배너 삭제
   */
  removeCurrentBanner() {
    if (this.banners.length <= 1) {
      alert('최소 1개의 배너는 있어야 합니다.');
      return;
    }

    const confirmed = confirm(`"${this.banners[this.currentIndex].title}" 배너를 삭제하시겠습니까?`);
    if (confirmed) {
      this.banners.splice(this.currentIndex, 1);
      
      // 인덱스 조정
      if (this.currentIndex >= this.banners.length) {
        this.currentIndex = this.banners.length - 1;
      }
      
      this.regenerateCarousel();
      this.updateUI();
      console.log('🗑️ 배너 삭제됨');
    }
  }

  /**
   * 캐러셀 재생성
   */
  regenerateCarousel() {
    if (!this.carouselElement) return;

    // 기존 Bootstrap 캐러셀 정지
    if (window.$ && $('#promoCarousel').length) {
      $('#promoCarousel').carousel('dispose');
    }

    // 인디케이터 재생성
    const carouselIndicators = this.carouselElement.querySelector('.carousel-indicators');
    if (carouselIndicators) {
      carouselIndicators.innerHTML = this.banners.map((_, index) => `
        <li data-target="#promoCarousel" data-slide-to="${index}" class="${index === this.currentIndex ? 'active' : ''}"></li>
      `).join('');
    }

    // HTML 재생성
    const carouselInner = this.carouselElement.querySelector('.carousel-inner');
    if (carouselInner) {
      carouselInner.innerHTML = this.banners.map((banner, index) => `
        <div class="carousel-item ${index === this.currentIndex ? 'active' : ''}">
          <div class="promo-banner-container" style="background-color: ${banner.bgColor || '#667eea'};">
            <div class="promo-banner-content">
              <div class="promo-banner-text">
                <h5 class="promo-title" style="color: ${banner.textColor || '#ffffff'};">${banner.title}</h5>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Bootstrap 캐러셀 재초기화
    if (window.$ && $('#promoCarousel').length) {
      $('#promoCarousel').carousel({
        interval: this.isPlaying ? this.settings.speed : false,
        pause: this.settings.pauseOnHover ? 'hover' : false
      });
    }
  }

  /**
   * UI 업데이트
   */
  updateUI() {
    if (!this.panelElement) return;

    // 배너 목록 업데이트
    const bannerList = document.getElementById('banner-list');
    if (bannerList) {
      bannerList.innerHTML = this.generateBannerListHTML();
    }

    // 현재 배너 프리뷰 업데이트
    const currentPreview = document.getElementById('current-banner-preview');
    if (currentPreview) {
      currentPreview.innerHTML = this.generateCurrentBannerHTML();
    }

    // 상태 정보 업데이트
    const statusInfo = document.getElementById('banner-status-info');
    if (statusInfo) {
      statusInfo.innerHTML = this.generateStatusHTML();
    }

    // 버튼 상태 업데이트
    const playBtn = document.getElementById('btn-play');
    const pauseBtn = document.getElementById('btn-pause');
    
    if (playBtn && pauseBtn) {
      if (this.isPlaying) {
        playBtn.classList.remove('active');
        pauseBtn.classList.add('active');
      } else {
        playBtn.classList.add('active');
        pauseBtn.classList.remove('active');
      }
    }
  }

  /**
   * 패널 표시
   */
  showPanel() {
    if (this.panelElement) {
      this.panelElement.classList.add('show');
      this.updateUI();
    }
  }

  /**
   * 패널 숨기기
   */
  hidePanel() {
    if (this.panelElement) {
      this.panelElement.classList.remove('show');
    }
  }

  /**
   * 패널 토글
   */
  togglePanel() {
    if (this.panelElement) {
      if (this.panelElement.classList.contains('show')) {
        this.hidePanel();
      } else {
        this.showPanel();
      }
    }
  }

  /**
   * 설정 저장
   */
  saveSettings() {
    localStorage.setItem('bannerControllerSettings', JSON.stringify(this.settings));
    localStorage.setItem('bannerControllerBanners', JSON.stringify(this.banners));
  }

  /**
   * 설정 로드
   */
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('bannerControllerSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }

      const savedBanners = localStorage.getItem('bannerControllerBanners');
      if (savedBanners) {
        const banners = JSON.parse(savedBanners);
        if (banners.length > 0) {
          this.banners = banners;
        }
      }
    } catch (error) {
      console.warn('⚠️ 설정 로드 실패:', error);
    }
  }

  /**
   * 상태 정보 반환
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      bannerCount: this.banners.length,
      currentIndex: this.currentIndex,
      isPlaying: this.isPlaying,
      settings: { ...this.settings },
      hasCarousel: !!this.carouselElement
    };
  }
}

// 전역 인스턴스 생성
let bannerController;

// DOM 준비 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  bannerController = new BannerController();
  
  // 전역 함수로 노출 (기존 LNB 컨트롤러와 유사한 패턴)
  window.bannerController = bannerController;
  
  // 콘솔 안내 메시지
  console.log('🎨 배너 제어 시스템이 준비되었습니다!');
  console.log('💡 Ctrl + B 키를 눌러 배너 제어판을 열 수 있습니다.');
  console.log('📖 사용법: bannerController.메서드명() 형태로 사용하세요.');
  
  // 3초 후 안내 토스트 표시 (비활성화)
  // setTimeout(() => {
  //   if (window.showToast) {
  //     showToast('🎨 안내', 'Ctrl + B 키로 배너 제어판을 열 수 있습니다.', 'info');
  //   }
  // }, 3000);
});