/**
 * LNB-Controller.js - LNB 영역 전용 제어 시스템
 * eXmate slim 물류 관리 시스템
 */

class LNBController {
  constructor() {
    this.sidebarElement = $('.main-sidebar');
    this.menuElement = $('#lnb-menu');
    this.brandElement = $('.brand-link');
    this.isCollapsed = false;
    this.customStyles = new Map();
    this.animations = {
      duration: 300,
      easing: 'ease-in-out'
    };
    
    this.init();
  }

  /**
   * LNB 컨트롤러 초기화
   */
  init() {
    this.setupCustomEventListeners();
    this.detectCollapsedState();
    console.log('LNB Controller 초기화 완료');
  }

  // ===========================================
  // LNB 토글 및 접기/펼치기 기능
  // ===========================================

  /**
   * LNB 토글 (접기/펼치기)
   */
  toggle() {
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  /**
   * LNB 접기
   */
  collapse() {
    $('body').addClass('sidebar-collapse');
    this.isCollapsed = true;
    this.triggerEvent('collapsed');
    console.log('LNB 접힘');
  }

  /**
   * LNB 펼치기
   */
  expand() {
    $('body').removeClass('sidebar-collapse');
    this.isCollapsed = false;
    this.triggerEvent('expanded');
    console.log('LNB 펼침');
  }

  /**
   * 현재 접기 상태 감지
   */
  detectCollapsedState() {
    this.isCollapsed = $('body').hasClass('sidebar-collapse');
  }

  // ===========================================
  // LNB 스타일 제어
  // ===========================================

  /**
   * LNB 테마 변경
   */
  setTheme(theme) {
    const themes = {
      dark: 'sidebar-dark-primary',
      light: 'sidebar-light-primary',
      darkBlue: 'sidebar-dark-blue',
      darkGreen: 'sidebar-dark-green',
      darkPurple: 'sidebar-dark-purple',
      darkRed: 'sidebar-dark-red'
    };

    // 기존 테마 클래스 제거
    Object.values(themes).forEach(themeClass => {
      this.sidebarElement.removeClass(themeClass);
    });

    // 새 테마 적용
    if (themes[theme]) {
      this.sidebarElement.addClass(themes[theme]);
      this.triggerEvent('themeChanged', { theme });
    }
  }

  /**
   * LNB 너비 조정
   */
  setWidth(width) {
    this.sidebarElement.css('width', width + 'px');
    this.customStyles.set('width', width + 'px');
    this.triggerEvent('widthChanged', { width });
  }

  /**
   * LNB 배경색 변경
   */
  setBackgroundColor(color) {
    this.sidebarElement.css('background-color', color);
    this.customStyles.set('background-color', color);
    this.triggerEvent('backgroundChanged', { color });
  }

  /**
   * 브랜드 영역 스타일 변경
   */
  setBrandStyle(styles) {
    Object.keys(styles).forEach(property => {
      this.brandElement.css(property, styles[property]);
    });
    this.triggerEvent('brandStyleChanged', { styles });
  }

  // ===========================================
  // 메뉴 동적 제어
  // ===========================================

  /**
   * 메뉴 아이템 추가
   */
  addMenuItem(menuItem, position = 'bottom') {
    const html = this.generateMenuItemHtml(menuItem);
    
    if (position === 'top') {
      this.menuElement.prepend(html);
    } else {
      this.menuElement.append(html);
    }
    
    this.bindMenuEvents();
    this.triggerEvent('menuItemAdded', { menuItem, position });
  }

  /**
   * 메뉴 아이템 제거
   */
  removeMenuItem(pageId) {
    this.menuElement.find(`[data-page="${pageId}"]`).closest('.nav-item').remove();
    this.triggerEvent('menuItemRemoved', { pageId });
  }

  /**
   * 메뉴 아이템 숨기기/보이기
   */
  toggleMenuItem(pageId, visible = null) {
    const menuItem = this.menuElement.find(`[data-page="${pageId}"]`).closest('.nav-item');
    
    if (visible === null) {
      menuItem.toggle();
    } else if (visible) {
      menuItem.show();
    } else {
      menuItem.hide();
    }
    
    this.triggerEvent('menuItemToggled', { pageId, visible: menuItem.is(':visible') });
  }

  /**
   * 메뉴 아이템 뱃지 추가/업데이트
   */
  setMenuBadge(pageId, badge) {
    const menuLink = this.menuElement.find(`[data-page="${pageId}"]`);
    
    // 기존 뱃지 제거
    menuLink.find('.badge').remove();
    
    if (badge) {
      const badgeHtml = `<span class="badge ${badge.class || 'badge-info'} right">${badge.text}</span>`;
      menuLink.append(badgeHtml);
    }
    
    this.triggerEvent('menuBadgeUpdated', { pageId, badge });
  }

  // ===========================================
  // 애니메이션 제어
  // ===========================================

  /**
   * 애니메이션 설정 변경
   */
  setAnimationSettings(settings) {
    this.animations = { ...this.animations, ...settings };
  }

  /**
   * 커스텀 애니메이션 실행
   */
  animate(styles, duration = null) {
    const animationDuration = duration || this.animations.duration;
    
    this.sidebarElement.animate(styles, {
      duration: animationDuration,
      easing: this.animations.easing,
      complete: () => {
        this.triggerEvent('animationComplete', { styles });
      }
    });
  }

  // ===========================================
  // 상태 관리
  // ===========================================

  /**
   * 현재 활성 메뉴 가져오기
   */
  getActiveMenu() {
    const activeLink = this.menuElement.find('.nav-link.active');
    return {
      pageId: activeLink.data('page'),
      text: activeLink.find('p').text().trim(),
      icon: activeLink.find('i').attr('class')
    };
  }

  /**
   * 메뉴 활성화
   */
  setActiveMenu(pageId) {
    // 모든 메뉴 비활성화
    this.menuElement.find('.nav-link').removeClass('active');
    
    // 지정된 메뉴 활성화
    this.menuElement.find(`[data-page="${pageId}"]`).addClass('active');
    
    this.triggerEvent('menuActivated', { pageId });
  }

  /**
   * LNB 상태 정보 반환
   */
  getStatus() {
    return {
      isCollapsed: this.isCollapsed,
      theme: this.getCurrentTheme(),
      customStyles: Object.fromEntries(this.customStyles),
      activeMenu: this.getActiveMenu(),
      menuCount: this.menuElement.find('.nav-item').length
    };
  }

  // ===========================================
  // 이벤트 시스템
  // ===========================================

  /**
   * 커스텀 이벤트 리스너 설정
   */
  setupCustomEventListeners() {
    // 화면 크기 변경 감지
    $(window).on('resize.lnb', () => {
      this.handleResize();
    });

    // AdminLTE의 사이드바 토글 이벤트 감지
    $(document).on('collapsed.lte.pushmenu expanded.lte.pushmenu', () => {
      this.detectCollapsedState();
    });
  }

  /**
   * 이벤트 발생
   */
  triggerEvent(eventName, data = {}) {
    const event = new CustomEvent(`lnb:${eventName}`, { 
      detail: { ...data, timestamp: Date.now() } 
    });
    document.dispatchEvent(event);
  }

  /**
   * 이벤트 리스너 등록
   */
  on(eventName, handler) {
    document.addEventListener(`lnb:${eventName}`, handler);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(eventName, handler) {
    document.removeEventListener(`lnb:${eventName}`, handler);
  }

  // ===========================================
  // 유틸리티 함수
  // ===========================================

  /**
   * 메뉴 아이템 HTML 생성
   */
  generateMenuItemHtml(menuItem) {
    const hasSubItems = menuItem.subItems && menuItem.subItems.length > 0;
    
    if (hasSubItems) {
      return this.generateParentMenuHtml(menuItem);
    } else {
      return this.generateSingleMenuHtml(menuItem);
    }
  }

  /**
   * 단일 메뉴 HTML 생성
   */
  generateSingleMenuHtml(menuItem) {
    return `
      <li class="nav-item">
        <a href="#" class="nav-link" data-page="${menuItem.pageId}">
          <i class="nav-icon ${menuItem.icon}"></i>
          <p>${menuItem.text}</p>
        </a>
      </li>
    `;
  }

  /**
   * 부모 메뉴 HTML 생성
   */
  generateParentMenuHtml(menuItem) {
    const subItemsHtml = menuItem.subItems.map(subItem => `
      <li class="nav-item">
        <a href="#" class="nav-link" data-page="${subItem.pageId}">
          <span class="nav-icon" style="width: 1.2rem; text-align: center;">-</span>
          <p>${subItem.text}</p>
        </a>
      </li>
    `).join('');

    return `
      <li class="nav-item">
        <a href="#" class="nav-link">
          <i class="nav-icon ${menuItem.icon}"></i>
          <p>${menuItem.text}<i class="right fas fa-angle-left"></i></p>
        </a>
        <ul class="nav nav-treeview">
          ${subItemsHtml}
        </ul>
      </li>
    `;
  }

  /**
   * 메뉴 이벤트 바인딩
   */
  bindMenuEvents() {
    // 기존 이벤트 제거 후 다시 바인딩
    this.menuElement.off('click.lnb').on('click.lnb', '.nav-link', function(e) {
      const pageId = $(this).data('page');
      if (pageId && window.loadPage) {
        window.loadPage(pageId);
      }
    });
  }

  /**
   * 현재 테마 감지
   */
  getCurrentTheme() {
    const classList = this.sidebarElement.attr('class') || '';
    const themeMatch = classList.match(/sidebar-(dark|light)-(primary|blue|green|purple|red)/);
    return themeMatch ? themeMatch[0] : 'sidebar-dark-primary';
  }

  /**
   * 화면 크기 변경 처리
   */
  handleResize() {
    const windowWidth = $(window).width();
    
    // 모바일에서 자동 접기
    if (windowWidth < 768 && !this.isCollapsed) {
      this.collapse();
    }
  }

  /**
   * 스타일 초기화
   */
  resetStyles() {
    // 커스텀 스타일 제거
    this.customStyles.forEach((value, property) => {
      this.sidebarElement.css(property, '');
    });
    this.customStyles.clear();
    
    // 기본 테마로 복원
    this.setTheme('dark');
    
    this.triggerEvent('stylesReset');
  }

  /**
   * 컨트롤러 제거
   */
  destroy() {
    $(window).off('resize.lnb');
    this.menuElement.off('click.lnb');
    this.resetStyles();
    console.log('LNB Controller 제거됨');
  }
}

// 전역 인스턴스 생성
const lnbController = new LNBController();

// 전역 스코프에 노출
window.LNBController = LNBController;
window.lnbController = lnbController;