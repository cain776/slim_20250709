/**
 * 언어선택 기능 관리 모듈
 * 다른 기능에 영향을 주지 않도록 독립적으로 작동
 */

// 언어선택 기능 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageSelector();
});

/**
 * 언어선택 기능 초기화
 */
function initializeLanguageSelector() {
    // 저장된 언어 설정 불러오기 (기본값: 한국어)
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'ko';
    
    // 초기 언어 설정
    setLanguageDisplay(savedLanguage);
    updateLanguageCheck(savedLanguage);
}

/**
 * 언어 변경 함수
 * @param {string} language - 언어 코드 (ko, ja, en)
 */
function changeLanguage(language) {
    // 언어 매핑 객체
    const languageMap = {
        'ko': '한국어',
        'ja': '日本語',
        'en': 'English'
    };
    
    // 유효한 언어 코드인지 확인
    if (!languageMap[language]) {
        console.warn('지원하지 않는 언어 코드입니다:', language);
        return;
    }
    
    // 현재 언어 표시 업데이트
    setLanguageDisplay(language);
    
    // 체크 표시 업데이트
    updateLanguageCheck(language);
    
    // 언어 설정 저장
    localStorage.setItem('selectedLanguage', language);
    
    // 언어 변경 이벤트 발생 (필요시 다른 모듈에서 감지 가능)
    const languageChangeEvent = new CustomEvent('languageChanged', {
        detail: { 
            language: language,
            languageName: languageMap[language]
        }
    });
    document.dispatchEvent(languageChangeEvent);
    
    // 선택적: 토스트 메시지 표시
    showLanguageChangeToast(languageMap[language]);
}

/**
 * 현재 언어 표시 업데이트
 * @param {string} language - 언어 코드
 */
function setLanguageDisplay(language) {
    const languageMap = {
        'ko': '한국어',
        'ja': '日本語',
        'en': 'English'
    };
    
    const currentLanguageElement = document.getElementById('current-language');
    if (currentLanguageElement) {
        currentLanguageElement.textContent = languageMap[language];
    }
}

/**
 * 체크 표시 업데이트
 * @param {string} selectedLanguage - 선택된 언어 코드
 */
function updateLanguageCheck(selectedLanguage) {
    const languages = ['ko', 'ja', 'en'];
    
    languages.forEach(lang => {
        const checkElement = document.getElementById(`check-${lang}`);
        if (checkElement) {
            if (lang === selectedLanguage) {
                checkElement.classList.remove('d-none');
            } else {
                checkElement.classList.add('d-none');
            }
        }
    });
}

/**
 * 언어 변경 토스트 메시지 표시
 * @param {string} languageName - 언어 이름
 */
function showLanguageChangeToast(languageName) {
    // 기존 토스트 기능이 있는 경우 활용
    if (typeof showToast === 'function') {
        showToast(`언어가 ${languageName}로 변경되었습니다.`, 'success');
    } else {
        // 간단한 알림 표시
        console.log(`언어가 ${languageName}로 변경되었습니다.`);
    }
}

/**
 * 현재 선택된 언어 반환
 * @returns {string} 현재 언어 코드
 */
function getCurrentLanguage() {
    return localStorage.getItem('selectedLanguage') || 'ko';
}

/**
 * 언어선택 기능 상태 확인 (디버깅용)
 */
function getLanguageSelectorStatus() {
    return {
        currentLanguage: getCurrentLanguage(),
        availableLanguages: ['ko', 'ja', 'en'],
        languageNames: {
            'ko': '한국어',
            'ja': '日本語',
            'en': 'English'
        }
    };
}

// 글로벌 스코프로 함수 노출 (onclick 이벤트에서 사용)
window.changeLanguage = changeLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.getLanguageSelectorStatus = getLanguageSelectorStatus; 