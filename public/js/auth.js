// 인증 관련 함수들

let isAuthenticated = false;
let currentUser = null;
let authToken = null;

// 토큰 관리
const setToken = (token) => {
  if (!token) {
    console.warn('토큰이 없습니다.');
    return;
  }
  authToken = token;
  localStorage.setItem('authToken', token);
  console.log('인증 토큰 저장됨');
};

const getToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
    console.log('토큰 복구: ' + (authToken ? '성공' : '없음'));
  }
  return authToken;
};

const removeToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
  console.log('인증 토큰 제거됨');
};

// 인증 헤더 가져오기
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// 전역 스코프에 노출
window.getAuthHeaders = getAuthHeaders;

// 로그인 처리
const login = async (committeeName) => {
  try {
    console.log('로그인 시도:', committeeName);
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ committeeName })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '로그인에 실패했습니다.');
    }
    
    const data = await response.json();
    console.log('로그인 응답:', data);
    
    if (data.status === 'success' && data.data && data.data.committee) {
      isAuthenticated = true;
      currentUser = data.data.committee;
      
      if (data.data.token) {
        setToken(data.data.token);
      } else {
        console.warn('토큰이 응답에 없습니다.');
      }
      
      // 로컬 스토리지에 정보 저장
      localStorage.setItem('currentCommittee', JSON.stringify(currentUser));
      console.log('로그인 성공 - 사용자 정보 및 토큰 저장됨');
      
      // UI 업데이트
      updateAuthUI(true);
      return data;
    }
    
    throw new Error('로그인 응답이 올바르지 않습니다.');
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    return { status: 'error', message: error.message || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.' };
  }
};

// 로그아웃 처리
const logout = async () => {
  try {
    console.log('로그아웃 시도');
    const response = await fetch('/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include' // 세션 쿠키 포함
    });
    
    const data = await response.json();
    
    // 로컬 상태 초기화
    isAuthenticated = false;
    currentUser = null;
    removeToken();
    localStorage.removeItem('currentCommittee');
    
    // UI 업데이트
    updateAuthUI(false);
    
    // 메인 화면으로 돌아가기
    window.location.href = '/';
    
    return data;
  } catch (error) {
    console.error('로그아웃 중 오류 발생:', error);
    // 오류가 발생해도 로컬 상태 초기화 및 UI 업데이트
    isAuthenticated = false;
    currentUser = null;
    removeToken();
    localStorage.removeItem('currentCommittee');
    updateAuthUI(false);
    window.location.href = '/';
    return { status: 'error', message: '로그아웃 중 오류가 발생했습니다.' };
  }
};

// 현재 인증 상태 확인
const checkAuth = async () => {
  try {
    // 로그인 화면인지 확인
    const loginContainer = document.getElementById('login-container');
    const isLoginPage = loginContainer && !loginContainer.classList.contains('hidden');
    
    if (isLoginPage) {
      console.log('로그인 화면 - 인증 확인 스킵');
      return { status: 'skip', message: '로그인 화면에서는 인증 확인을 건너뜁니다.' };
    }
    
    const token = getToken();
    if (!token) {
      console.log('인증 확인 실패: 토큰 없음');
      isAuthenticated = false;
      currentUser = null;
      updateAuthUI(false);
      return { status: 'error', message: '인증되지 않은 사용자입니다.' };
    }

    console.log('서버에 인증 상태 확인 요청');
    // 서버에 인증 상태 확인 요청
    const response = await fetch('/auth/current', {
      headers: getAuthHeaders(),
      credentials: 'include' // 세션 쿠키도 함께 전송
    });
    
    if (!response.ok) {
      console.error('인증 확인 실패: 서버 응답 오류', response.status);
      isAuthenticated = false;
      currentUser = null;
      removeToken();
      localStorage.removeItem('currentCommittee');
      updateAuthUI(false);
      return { status: 'error', message: '인증 상태 확인 중 오류가 발생했습니다.' };
    }
    
    const data = await response.json();
    console.log('인증 확인 응답:', data);
    
    if (data.status === 'success' && data.data && data.data.committee) {
      isAuthenticated = true;
      currentUser = data.data.committee;
      
      // 로컬 스토리지에 정보 저장
      localStorage.setItem('currentCommittee', JSON.stringify(currentUser));
      console.log('인증 확인 성공 - 사용자 정보 업데이트됨');
    } else {
      console.warn('인증 확인 실패: 유효하지 않은 응답');
      isAuthenticated = false;
      currentUser = null;
      removeToken();
      localStorage.removeItem('currentCommittee');
    }
    
    // UI 업데이트
    updateAuthUI(isAuthenticated);
    
    return data;
  } catch (error) {
    console.error('인증 상태 확인 중 오류 발생:', error);
    isAuthenticated = false;
    currentUser = null;
    removeToken();
    localStorage.removeItem('currentCommittee');
    updateAuthUI(false);
    return { status: 'error', message: '인증 상태 확인 중 오류가 발생했습니다.' };
  }
};

// 현재 사용자 정보 가져오기
const getCurrentUser = () => {
  if (!currentUser && localStorage.getItem('currentCommittee')) {
    try {
      currentUser = JSON.parse(localStorage.getItem('currentCommittee'));
      console.log('로컬 스토리지에서 사용자 정보 복구됨');
    } catch (e) {
      console.error('로컬 스토리지에서 사용자 정보 복구 실패:', e);
    }
  }
  return currentUser;
};

// 인증이 필요한 화면인지 확인
const requireAuth = () => {
  if (!isAuthenticated) {
    console.log('인증 필요: 로그인 페이지로 리디렉션');
    // 로그인 화면으로 리다이렉트
    window.location.href = '/';
    return false;
  }
  return true;
};

// 마스터 권한 확인
const isMaster = () => {
  const user = getCurrentUser();
  return isAuthenticated && user && user.role === 'master';
};

// 인증 UI 업데이트
const updateAuthUI = (isAuthenticated = false) => {
  const loginContainer = document.getElementById('login-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  const userNameElement = document.getElementById('user-name');
  
  if (isAuthenticated && currentUser) {
    // 로그인 성공 시 UI 업데이트
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    // 사용자 이름 표시
    if (userNameElement) {
      userNameElement.textContent = `${currentUser.name} 위원님`;
    }
    
    // 마스터 계정이면 마스터 대시보드 표시
    if (isMaster()) {
      console.log('마스터 계정 감지: 마스터 대시보드 표시');
      try {
        if (typeof window.showMasterDashboard === 'function') {
          window.showMasterDashboard();
        } else {
          console.error('showMasterDashboard 함수를 찾을 수 없습니다. master.js가 제대로 로드되었는지 확인하세요.');
          alert('마스터 대시보드를 불러올 수 없습니다. 페이지를 새로고침하거나 관리자에게 문의하세요.');
        }
      } catch (error) {
        console.error('마스터 대시보드 표시 중 오류 발생:', error);
        alert('마스터 대시보드를 표시하는 중 오류가 발생했습니다.');
      }
    }
  } else {
    // 로그아웃 상태 UI 업데이트
    loginContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
    
    // 로그인 폼 초기화
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.reset();
    }
  }
}; 