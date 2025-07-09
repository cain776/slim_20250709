/**
 * Data-Service.js - 데이터 서비스 관리
 * eXmate slim 물류 관리 시스템
 */

// 대시보드 샘플 데이터
const SAMPLE_DATA = {
  dashboard: {
    summary: {
      totalDelay: 38,
      longDelay: 5,
      mostDelayCause: '미배송',
      mostDelayCount: 12
    },
    notices: [
      { id: 1, title: '[안내] 시스템 정기점검', date: '06-15', priority: 'info' },
      { id: 2, title: '[중요] 개인정보 처리방침 개정', date: '06-12', priority: 'warning' },
      { id: 3, title: '[업데이트] v2.1 기능 업데이트', date: '06-10', priority: 'success' },
      { id: 4, title: '[공지] 일본 연휴 기간 배송 지연', date: '06-08', priority: 'info' },
      { id: 5, title: '[이벤트] 신규 고객 배송비 할인', date: '06-05', priority: 'success' }
    ],
    statusData: [
      { status: '미통관', delays: [5, 2, 1, 0, 1] },
      { status: '통관완료', delays: [2, 1, 0, 0, 0] },
      { status: '배송사연계', delays: [1, 0, 0, 0, 0] },
      { status: '배송지연', delays: [3, 2, 1, 1, 1] },
      { status: '미배송(사유발생)', delays: [5, 3, 2, 1, 3] }
    ],
    quickLinks: [
      { id: 'tracking', icon: 'fas fa-search-location', text: '화물추적', modal: 'trackingModal' },
      { id: 'manual', icon: 'fas fa-book', text: '매뉴얼', url: '#' },
      { id: 'rate', icon: 'fas fa-file-invoice-dollar', text: '요금가이드', url: 'https://exm.exmate.net/rateguide/' },
      { id: 'company', icon: 'fas fa-building', text: '회사소개', url: 'https://exmate.net/EXMATE' }
    ],
    promotions: [
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
    ]
  },
  
  notices: [
    { id: 1, title: '[시스템] 정기점검 안내', content: '시스템 정기점검이 예정되어 있습니다.', date: '2024-06-15', priority: 'info' },
    { id: 2, title: '[중요] 개인정보 처리방침 개정', content: '개인정보 처리방침이 개정되었습니다.', date: '2024-06-12', priority: 'warning' },
    { id: 3, title: '[업데이트] v2.1 기능 업데이트', content: '새로운 기능이 추가되었습니다.', date: '2024-06-10', priority: 'success' }
  ],
  
  statistics: {
    inbound: {
      today: 125,
      week: 856,
      month: 3245
    },
    outbound: {
      today: 98,
      week: 743,
      month: 2987
    }
  }
};

// 데이터 서비스 클래스
class DataService {
  constructor() {
    this.cache = new Map();
    this.config = Config.getApiConfig();
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.expiry) {
      return cached.data;
    }
    return null;
  }

  /**
   * 캐시에 데이터 저장
   */
  setCache(key, data, expiry = 60000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  /**
   * 캐시 삭제
   */
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * HTTP 요청 수행
   */
  async request(endpoint, options = {}) {
    const url = this.config.baseUrl + endpoint;
    const config = {
      timeout: this.config.timeout,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  }

  /**
   * 대시보드 데이터 가져오기
   */
  async getDashboardData() {
    const cacheKey = 'dashboard';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // 실제 API 호출 시뮬레이션
      await this.simulateDelay(500);
      
      const data = SAMPLE_DATA.dashboard;
      this.setCache(cacheKey, data, Config.getRefreshInterval('dashboard'));
      
      return data;
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      return SAMPLE_DATA.dashboard; // 폴백 데이터
    }
  }

  /**
   * 공지사항 데이터 가져오기
   */
  async getNoticesData(page = 1, limit = 10) {
    const cacheKey = `notices_${page}_${limit}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      await this.simulateDelay(300);
      
      const allNotices = SAMPLE_DATA.notices;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const data = {
        notices: allNotices.slice(startIndex, endIndex),
        totalCount: allNotices.length,
        currentPage: page,
        totalPages: Math.ceil(allNotices.length / limit)
      };
      
      this.setCache(cacheKey, data, Config.getRefreshInterval('notices'));
      
      return data;
    } catch (error) {
      console.error('공지사항 데이터 로드 실패:', error);
      return {
        notices: SAMPLE_DATA.notices.slice(0, limit),
        totalCount: SAMPLE_DATA.notices.length,
        currentPage: 1,
        totalPages: 1
      };
    }
  }

  /**
   * 통계 데이터 가져오기
   */
  async getStatisticsData() {
    const cacheKey = 'statistics';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      await this.simulateDelay(800);
      
      const data = SAMPLE_DATA.statistics;
      this.setCache(cacheKey, data, Config.getRefreshInterval('statistics'));
      
      return data;
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error);
      return SAMPLE_DATA.statistics;
    }
  }

  /**
   * 화물 추적 정보 가져오기
   */
  async getTrackingInfo(trackingNumber) {
    if (!trackingNumber) {
      throw new Error('운송장번호가 필요합니다.');
    }

    const cacheKey = `tracking_${trackingNumber}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      await this.simulateDelay(1000);
      
      // 샘플 추적 정보
      const data = {
        trackingNumber,
        status: '배송중',
        currentLocation: '서울 송파구',
        estimatedDelivery: '2024-06-16',
        history: [
          { date: '2024-06-15 14:30', status: '배송시작', location: '서울 송파구' },
          { date: '2024-06-15 10:15', status: '상품준비', location: '서울 송파구' },
          { date: '2024-06-14 16:45', status: '주문접수', location: '서울 송파구' }
        ]
      };
      
      this.setCache(cacheKey, data, 300000); // 5분 캐시
      
      return data;
    } catch (error) {
      console.error('추적 정보 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 설정 데이터 가져오기
   */
  async getSettingsData() {
    const cacheKey = 'settings';
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      await this.simulateDelay(400);
      
      const data = {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        display: {
          theme: 'light',
          language: 'ko',
          timezone: 'Asia/Seoul'
        },
        api: {
          timeout: 30000,
          retryCount: 3
        }
      };
      
      this.setCache(cacheKey, data, 600000); // 10분 캐시
      
      return data;
    } catch (error) {
      console.error('설정 데이터 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 데이터 저장 (POST/PUT)
   */
  async saveData(endpoint, data) {
    try {
      const result = await this.request(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      // 관련 캐시 삭제
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 데이터 삭제 (DELETE)
   */
  async deleteData(endpoint) {
    try {
      const result = await this.request(endpoint, {
        method: 'DELETE'
      });
      
      // 관련 캐시 삭제
      this.clearCache();
      
      return result;
    } catch (error) {
      console.error('데이터 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 지연 시뮬레이션 (개발용)
   */
  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 로컬 스토리지에 데이터 저장
   */
  saveToLocalStorage(key, data) {
    try {
      const storageKey = Config.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
    }
  }

  /**
   * 로컬 스토리지에서 데이터 가져오기
   */
  getFromLocalStorage(key) {
    try {
      const storageKey = Config.getStorageKey(key);
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('로컬 스토리지 읽기 실패:', error);
      return null;
    }
  }

  /**
   * 로컬 스토리지 데이터 삭제
   */
  removeFromLocalStorage(key) {
    try {
      const storageKey = Config.getStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('로컬 스토리지 삭제 실패:', error);
    }
  }
}

// 데이터 서비스 싱글톤 인스턴스
const dataService = new DataService();

// 전역 스코프에 노출
window.DataService = DataService;
window.dataService = dataService; 