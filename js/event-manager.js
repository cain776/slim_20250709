/**
 * EventManager.js - 이벤트 관리 시스템
 * eXmate slim 물류 관리 시스템
 */

/**
 * 이벤트 관리자 클래스
 * - 이벤트 등록/해제 관리
 * - 메모리 누수 방지
 * - 이벤트 네임스페이스 지원
 * - 커스텀 이벤트 지원
 */
class EventManager {
  constructor() {
    this.events = new Map();
    this.customEvents = new Map();
    this.delegatedEvents = new Map();
    this.namespaces = new Map();
  }

  // ===========================================
  // 이벤트 등록 메서드
  // ===========================================

  /**
   * 이벤트 리스너 등록
   */
  on(selector, event, handler, namespace = null) {
    const key = this._getEventKey(selector, event, namespace);
    
    if (!this.events.has(key)) {
      this.events.set(key, {
        selector,
        event,
        handler,
        namespace,
        element: null,
        isActive: false
      });
    }

    this._bindEvent(key);
    return this;
  }

  /**
   * 일회성 이벤트 리스너 등록
   */
  once(selector, event, handler, namespace = null) {
    const wrappedHandler = (e) => {
      handler(e);
      this.off(selector, event, namespace);
    };

    return this.on(selector, event, wrappedHandler, namespace);
  }

  /**
   * 이벤트 위임 등록
   */
  delegate(container, selector, event, handler, namespace = null) {
    const key = this._getDelegateKey(container, selector, event, namespace);
    
    if (!this.delegatedEvents.has(key)) {
      const delegatedHandler = (e) => {
        const target = e.target.closest(selector);
        if (target && $(container).find(target).length) {
          handler.call(target, e);
        }
      };

      this.delegatedEvents.set(key, {
        container,
        selector,
        event,
        handler,
        delegatedHandler,
        namespace,
        isActive: false
      });
    }

    this._bindDelegatedEvent(key);
    return this;
  }

  /**
   * 커스텀 이벤트 등록
   */
  onCustom(eventName, handler, namespace = null) {
    const key = this._getCustomEventKey(eventName, namespace);
    
    if (!this.customEvents.has(key)) {
      this.customEvents.set(key, {
        eventName,
        handler,
        namespace,
        isActive: true
      });
    }

    return this;
  }

  // ===========================================
  // 이벤트 해제 메서드
  // ===========================================

  /**
   * 이벤트 리스너 해제
   */
  off(selector, event = null, namespace = null) {
    if (event) {
      const key = this._getEventKey(selector, event, namespace);
      this._unbindEvent(key);
      this.events.delete(key);
    } else {
      // 모든 이벤트 해제
      this._unbindAllEvents(selector, namespace);
    }
    return this;
  }

  /**
   * 이벤트 위임 해제
   */
  undelegate(container, selector, event = null, namespace = null) {
    if (event) {
      const key = this._getDelegateKey(container, selector, event, namespace);
      this._unbindDelegatedEvent(key);
      this.delegatedEvents.delete(key);
    } else {
      // 모든 위임 이벤트 해제
      this._unbindAllDelegatedEvents(container, namespace);
    }
    return this;
  }

  /**
   * 커스텀 이벤트 해제
   */
  offCustom(eventName, namespace = null) {
    const key = this._getCustomEventKey(eventName, namespace);
    this.customEvents.delete(key);
    return this;
  }

  /**
   * 네임스페이스별 이벤트 해제
   */
  offNamespace(namespace) {
    // 일반 이벤트 해제
    for (const [key, eventData] of this.events) {
      if (eventData.namespace === namespace) {
        this._unbindEvent(key);
        this.events.delete(key);
      }
    }

    // 위임 이벤트 해제
    for (const [key, eventData] of this.delegatedEvents) {
      if (eventData.namespace === namespace) {
        this._unbindDelegatedEvent(key);
        this.delegatedEvents.delete(key);
      }
    }

    // 커스텀 이벤트 해제
    for (const [key, eventData] of this.customEvents) {
      if (eventData.namespace === namespace) {
        this.customEvents.delete(key);
      }
    }

    return this;
  }

  /**
   * 모든 이벤트 해제
   */
  offAll() {
    // 모든 일반 이벤트 해제
    for (const key of this.events.keys()) {
      this._unbindEvent(key);
    }
    this.events.clear();

    // 모든 위임 이벤트 해제
    for (const key of this.delegatedEvents.keys()) {
      this._unbindDelegatedEvent(key);
    }
    this.delegatedEvents.clear();

    // 모든 커스텀 이벤트 해제
    this.customEvents.clear();

    return this;
  }

  // ===========================================
  // 이벤트 발생 메서드
  // ===========================================

  /**
   * 이벤트 트리거
   */
  trigger(selector, event, data = null) {
    const $element = $(selector);
    if ($element.length) {
      if (data) {
        $element.trigger(event, data);
      } else {
        $element.trigger(event);
      }
    }
    return this;
  }

  /**
   * 커스텀 이벤트 발생
   */
  triggerCustom(eventName, data = null) {
    for (const [key, eventData] of this.customEvents) {
      if (eventData.eventName === eventName && eventData.isActive) {
        eventData.handler(data);
      }
    }
    return this;
  }

  // ===========================================
  // 네임스페이스 관리
  // ===========================================

  /**
   * 네임스페이스 생성
   */
  createNamespace(name) {
    if (!this.namespaces.has(name)) {
      this.namespaces.set(name, {
        name,
        events: new Set(),
        created: Date.now()
      });
    }
    return this;
  }

  /**
   * 네임스페이스 삭제
   */
  destroyNamespace(name) {
    this.offNamespace(name);
    this.namespaces.delete(name);
    return this;
  }

  /**
   * 네임스페이스 목록 반환
   */
  getNamespaces() {
    return Array.from(this.namespaces.keys());
  }

  // ===========================================
  // 유틸리티 메서드
  // ===========================================

  /**
   * 이벤트 일시 정지
   */
  pause(selector, event = null, namespace = null) {
    if (event) {
      const key = this._getEventKey(selector, event, namespace);
      const eventData = this.events.get(key);
      if (eventData) {
        eventData.isActive = false;
        this._unbindEvent(key);
      }
    } else {
      // 모든 이벤트 일시 정지
      for (const [key, eventData] of this.events) {
        if (eventData.selector === selector && 
            (!namespace || eventData.namespace === namespace)) {
          eventData.isActive = false;
          this._unbindEvent(key);
        }
      }
    }
    return this;
  }

  /**
   * 이벤트 재시작
   */
  resume(selector, event = null, namespace = null) {
    if (event) {
      const key = this._getEventKey(selector, event, namespace);
      const eventData = this.events.get(key);
      if (eventData) {
        eventData.isActive = true;
        this._bindEvent(key);
      }
    } else {
      // 모든 이벤트 재시작
      for (const [key, eventData] of this.events) {
        if (eventData.selector === selector && 
            (!namespace || eventData.namespace === namespace)) {
          eventData.isActive = true;
          this._bindEvent(key);
        }
      }
    }
    return this;
  }

  /**
   * 이벤트 상태 확인
   */
  isActive(selector, event, namespace = null) {
    const key = this._getEventKey(selector, event, namespace);
    const eventData = this.events.get(key);
    return eventData ? eventData.isActive : false;
  }

  /**
   * 등록된 이벤트 수 반환
   */
  getEventCount() {
    return {
      regular: this.events.size,
      delegated: this.delegatedEvents.size,
      custom: this.customEvents.size,
      total: this.events.size + this.delegatedEvents.size + this.customEvents.size
    };
  }

  /**
   * 메모리 사용량 정보 반환
   */
  getMemoryInfo() {
    return {
      events: this.events.size,
      delegatedEvents: this.delegatedEvents.size,
      customEvents: this.customEvents.size,
      namespaces: this.namespaces.size,
      timestamp: Date.now()
    };
  }

  // ===========================================
  // 내부 메서드
  // ===========================================

  /**
   * 이벤트 키 생성
   */
  _getEventKey(selector, event, namespace) {
    return `${selector}:${event}${namespace ? ':' + namespace : ''}`;
  }

  /**
   * 위임 이벤트 키 생성
   */
  _getDelegateKey(container, selector, event, namespace) {
    return `${container}>${selector}:${event}${namespace ? ':' + namespace : ''}`;
  }

  /**
   * 커스텀 이벤트 키 생성
   */
  _getCustomEventKey(eventName, namespace) {
    return `custom:${eventName}${namespace ? ':' + namespace : ''}`;
  }

  /**
   * 이벤트 바인딩
   */
  _bindEvent(key) {
    const eventData = this.events.get(key);
    if (eventData && !eventData.isActive) {
      const $element = $(eventData.selector);
      if ($element.length) {
        $element.on(eventData.event, eventData.handler);
        eventData.element = $element[0];
        eventData.isActive = true;
      }
    }
  }

  /**
   * 이벤트 언바인딩
   */
  _unbindEvent(key) {
    const eventData = this.events.get(key);
    if (eventData && eventData.isActive) {
      const $element = $(eventData.selector);
      if ($element.length) {
        $element.off(eventData.event, eventData.handler);
        eventData.isActive = false;
      }
    }
  }

  /**
   * 모든 이벤트 언바인딩
   */
  _unbindAllEvents(selector, namespace) {
    for (const [key, eventData] of this.events) {
      if (eventData.selector === selector && 
          (!namespace || eventData.namespace === namespace)) {
        this._unbindEvent(key);
        this.events.delete(key);
      }
    }
  }

  /**
   * 위임 이벤트 바인딩
   */
  _bindDelegatedEvent(key) {
    const eventData = this.delegatedEvents.get(key);
    if (eventData && !eventData.isActive) {
      const $container = $(eventData.container);
      if ($container.length) {
        $container.on(eventData.event, eventData.selector, eventData.delegatedHandler);
        eventData.isActive = true;
      }
    }
  }

  /**
   * 위임 이벤트 언바인딩
   */
  _unbindDelegatedEvent(key) {
    const eventData = this.delegatedEvents.get(key);
    if (eventData && eventData.isActive) {
      const $container = $(eventData.container);
      if ($container.length) {
        $container.off(eventData.event, eventData.selector, eventData.delegatedHandler);
        eventData.isActive = false;
      }
    }
  }

  /**
   * 모든 위임 이벤트 언바인딩
   */
  _unbindAllDelegatedEvents(container, namespace) {
    for (const [key, eventData] of this.delegatedEvents) {
      if (eventData.container === container && 
          (!namespace || eventData.namespace === namespace)) {
        this._unbindDelegatedEvent(key);
        this.delegatedEvents.delete(key);
      }
    }
  }
}

// 전역 인스턴스 생성
const eventManager = new EventManager();

// 전역 스코프에 노출
window.EventManager = EventManager;
window.eventManager = eventManager;

// 페이지 언로드 시 모든 이벤트 정리
$(window).on('beforeunload', function() {
  eventManager.offAll();
}); 