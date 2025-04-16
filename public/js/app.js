// 메인 애플리케이션 JavaScript

// 앱 초기화
const initApp = async () => {
  // 로그인 폼 제출 이벤트 리스너
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const committeeNameInput = document.getElementById('committee-name');
      const committeeName = committeeNameInput.value.trim();
      
      if (!committeeName) {
        alert('이름을 입력해주세요.');
        return;
      }
      
      try {
        const response = await login(committeeName);
        
        if (response.status === 'success') {
          // 로그인 성공 후 UI 업데이트
          updateUIAfterLogin();
          
          // 현재 사용자 정보 확인
          const currentUser = getCurrentUser();
          
          // 마스터 관리자인 경우 마스터 대시보드 표시
          if (currentUser && currentUser.role === 'master') {
            initiateMasterDashboard();
          } else {
            // 일반 모니터링 위원인 경우 담당 기관 목록 표시
            loadOrganizations();
          }
        } else {
          alert(response.message || '로그인에 실패했습니다. 이름을 다시 확인해주세요.');
        }
      } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    });
  }
  
  // 로그아웃 버튼 이벤트 리스너
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await logout(); // 비동기 로그아웃 함수 호출 및 완료 대기
        // 성공적으로 로그아웃된 경우, updateUIAfterLogout()는 이미 logout() 함수 내에서 호출됨
      } catch (error) {
        console.error('로그아웃 처리 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
        // 오류 발생 시에도 UI 업데이트 시도
        updateUIAfterLogout();
      }
    });
  }
  
  // 기관 목록으로 돌아가기 버튼 이벤트 리스너
  const backToOrgsBtn = document.getElementById('back-to-orgs-btn');
  if (backToOrgsBtn) {
    backToOrgsBtn.addEventListener('click', () => {
      // 마스터 관리자일 경우 마스터 대시보드로 돌아가기
      if (isMaster()) {
        initiateMasterDashboard();
      } else {
        // 일반 사용자일 경우 기관 선택 화면으로 돌아가기
        document.getElementById('monitoring-indicators').classList.add('hidden');
        document.getElementById('organization-selection').classList.remove('hidden');
      }
    });
  }
  
  // 페이지 로드 시 인증 상태 확인
  try {
    const authResponse = await checkAuth();
    
    if (authResponse.status === 'success') {
      updateUIAfterLogin();
      
      // 현재 사용자 정보 확인
      const currentUser = getCurrentUser();
      
      // 마스터 관리자인 경우 마스터 대시보드 표시
      if (currentUser && currentUser.role === 'master') {
        initiateMasterDashboard();
      } else {
        // 일반 모니터링 위원인 경우 담당 기관 목록 표시
        loadOrganizations();
      }
    } else {
      updateUIAfterLogout();
    }
  } catch (error) {
    console.error('인증 상태 확인 중 오류 발생:', error);
    updateUIAfterLogout();
  }
};

// 페이지 로드 시 실행할 함수
document.addEventListener('DOMContentLoaded', async () => {
  console.log('===== 애플리케이션 초기화 시작 =====');
  
  // 로그인 화면인지 확인
  const loginContainer = document.getElementById('login-container');
  const dashboardContainer = document.getElementById('dashboard-container');
  
  console.log(`- 로그인 컨테이너 존재: ${loginContainer ? 'O' : 'X'}`);
  console.log(`- 대시보드 컨테이너 존재: ${dashboardContainer ? 'O' : 'X'}`);
  
  const isLoginPage = loginContainer && !loginContainer.classList.contains('hidden');
  const isDashboardHidden = dashboardContainer && dashboardContainer.classList.contains('hidden');
  
  console.log(`- 로그인 화면 표시 중: ${isLoginPage ? 'O' : 'X'}`);
  console.log(`- 대시보드 숨김 상태: ${isDashboardHidden ? 'O' : 'X'}`);
  
  // 기존 로직 정리 및 명확화
  if (isLoginPage) {
    console.log('** 로그인 화면 감지 - 자동 API 호출 생략 **');
    // 로그인 화면일 때는 자동 API 호출을 하지 않음
    updateAuthUI(false);
    
    // organization.js에서 자동 실행될 수 있는 함수 방지
    window.skipInitialApiCalls = true;
    
    console.log('- 로그인 폼 이벤트 리스너 설정');
    setupLoginForm();
  } else {
    console.log('** 대시보드 화면 감지 - 인증 상태 확인 **');
    // 로그인 상태 확인
    try {
      console.log('- 인증 상태 확인 시작');
      await checkAuth();
      console.log('- 인증 상태 확인 완료');
    } catch (error) {
      console.error('- 인증 확인 중 오류:', error);
    }
  }
  
  // 기타 이벤트 리스너 설정
  console.log('- 이벤트 리스너 설정 시작');
  setupEventListeners();
  console.log('- 이벤트 리스너 설정 완료');
  
  console.log('===== 애플리케이션 초기화 완료 =====');
});

// 로그인 후 UI 업데이트
const updateUIAfterLogin = () => {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('dashboard-container').classList.remove('hidden');
  
  // 로그인 화면이 아니므로 API 호출 플래그 리셋
  window.skipInitialApiCalls = false;
  console.log('로그인 완료 - API 호출 플래그 리셋됨:', window.skipInitialApiCalls);
  
  // 사용자 이름 표시
  const currentUser = getCurrentUser();
  const userNameElement = document.getElementById('user-name');
  
  if (userNameElement && currentUser) {
    // 마스터 관리자인 경우 다르게 표시
    if (currentUser.role === 'master') {
      userNameElement.textContent = `${currentUser.name}`;
    } else {
      userNameElement.textContent = `${currentUser.name} 위원님`;
    }
  }
};

// 로그아웃 후 UI 업데이트
const updateUIAfterLogout = () => {
  document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('dashboard-container').classList.add('hidden');
  
  // 입력 필드 초기화
  const committeeNameInput = document.getElementById('committee-name');
  if (committeeNameInput) {
    committeeNameInput.value = '';
  }
  
  // 마스터 대시보드가 있으면 숨기기
  const masterDashboard = document.getElementById('master-dashboard');
  if (masterDashboard) {
    masterDashboard.classList.add('hidden');
  }
};

// showMasterDashboard 함수는 master.js에 이미 정의되어 있으므로 여기서는 함수 정의를 제거합니다.
// 대신 함수가 존재하는지 확인하고 호출하는 헬퍼 함수를 만듭니다.
const initiateMasterDashboard = () => {
  // master.js에서 정의된 함수 사용
  if (typeof showMasterDashboard === 'function') {
    showMasterDashboard();
  } else {
    console.error('마스터 대시보드 함수를 찾을 수 없습니다. master.js가 로드되었는지 확인하세요.');
    alert('마스터 대시보드를 로드할 수 없습니다.');
  }
};

// setupLoginForm 함수 추가
const setupLoginForm = () => {
  // 로그인 폼 제출 이벤트 리스너
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const committeeNameInput = document.getElementById('committee-name');
      const committeeName = committeeNameInput.value.trim();
      
      if (!committeeName) {
        alert('이름을 입력해주세요.');
        return;
      }
      
      try {
        console.log(`로그인 시도: ${committeeName}`);
        const response = await login(committeeName);
        
        if (response.status === 'success') {
          // 로그인 성공 후 UI 업데이트
          updateUIAfterLogin();
          
          // 현재 사용자 정보 확인
          const currentUser = getCurrentUser();
          
          // 마스터 관리자인 경우 마스터 대시보드 표시
          if (currentUser && currentUser.role === 'master') {
            initiateMasterDashboard();
          } else {
            // 일반 모니터링 위원인 경우 담당 기관 목록 표시
            loadOrganizations();
          }
        } else {
          alert(response.message || '로그인에 실패했습니다. 이름을 다시 확인해주세요.');
        }
      } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    });
  }
};

// setupEventListeners 함수 추가
const setupEventListeners = () => {
  // 로그아웃 버튼 이벤트 리스너
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await logout(); // 비동기 로그아웃 함수 호출 및 완료 대기
      } catch (error) {
        console.error('로그아웃 처리 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
        // 오류 발생 시에도 UI 업데이트 시도
        updateUIAfterLogout();
      }
    });
  }
  
  // 기관 목록으로 돌아가기 버튼 이벤트 리스너
  const backToOrgsBtn = document.getElementById('back-to-orgs-btn');
  if (backToOrgsBtn) {
    backToOrgsBtn.addEventListener('click', () => {
      // 마스터 관리자일 경우 마스터 대시보드로 돌아가기
      if (isMaster()) {
        initiateMasterDashboard();
      } else {
        // 일반 사용자일 경우 기관 선택 화면으로 돌아가기
        document.getElementById('monitoring-indicators').classList.add('hidden');
        document.getElementById('organization-selection').classList.remove('hidden');
      }
    });
  }
};

// 주기 탭 클릭 처리를 위한 이벤트 설정
document.addEventListener('DOMContentLoaded', () => {
  console.log('app.js - DOMContentLoaded 이벤트 발생');
  
  // 로그인 화면인지 확인
  const loginContainer = document.getElementById('login-container');
  if (loginContainer && !loginContainer.classList.contains('hidden')) {
    console.log('app.js - 로그인 화면 감지, 초기화 건너뛰기');
    return;
  }
  
  // 주기 탭 직접 접근 및 이벤트 처리
  setTimeout(() => {
    console.log('app.js - 주기 탭 직접 접근');
    
    // 각 주기 탭에 직접 클릭 이벤트 추가
    const tabMonthly = document.getElementById('tab-monthly');
    const tabSemiannual = document.getElementById('tab-semiannual');
    const tabQ1 = document.getElementById('tab-q1');
    
    console.log('주기 탭 요소:', { 
      매월: tabMonthly, 
      반기: tabSemiannual, 
      '1~3월': tabQ1 
    });
    
    // 특별 클릭 이벤트 처리
    if (tabSemiannual) {
      tabSemiannual.addEventListener('click', (e) => {
        console.log('app.js - 반기 탭 클릭 감지');
        // 기존 이벤트 처리 이후
        setTimeout(() => {
          // 기관이 선택되었는지 확인
          const selectedOrg = window.selectedOrganization;
          if (!selectedOrg) {
            console.log('기관이 선택되지 않음');
            return;
          }
          
          // 로딩 표시
          const sidebar = document.getElementById('indicators-list-sidebar');
          if (sidebar && sidebar.innerHTML.includes('지표가 없습니다') || sidebar.innerHTML.trim() === '') {
            console.log('지표 없음 - 직접 지표 로드 시도');
            sidebar.innerHTML = '<div class="p-4 text-center text-gray-500">반기 지표를 불러오는 중...</div>';
            
            // 반기 지표 직접 로드 시도
            try {
              // 전역 함수 호출
              if (typeof loadIndicatorsByPeriod === 'function') {
                console.log('loadIndicatorsByPeriod 함수 호출');
                loadIndicatorsByPeriod('반기');
              }
            } catch (error) {
              console.error('반기 지표 직접 로드 중 오류:', error);
            }
          }
        }, 500);
      });
    }
    
    if (tabQ1) {
      tabQ1.addEventListener('click', (e) => {
        console.log('app.js - 1~3월 탭 클릭 감지');
        // 기존 이벤트 처리 이후
        setTimeout(() => {
          // 기관이 선택되었는지 확인
          const selectedOrg = window.selectedOrganization;
          if (!selectedOrg) {
            console.log('기관이 선택되지 않음');
            return;
          }
          
          // 로딩 표시
          const sidebar = document.getElementById('indicators-list-sidebar');
          if (sidebar && sidebar.innerHTML.includes('지표가 없습니다') || sidebar.innerHTML.trim() === '') {
            console.log('지표 없음 - 직접 지표 로드 시도');
            sidebar.innerHTML = '<div class="p-4 text-center text-gray-500">1~3월 지표를 불러오는 중...</div>';
            
            // 1~3월 지표 직접 로드 시도
            try {
              // 전역 함수 호출
              if (typeof loadIndicatorsByPeriod === 'function') {
                console.log('loadIndicatorsByPeriod 함수 호출');
                loadIndicatorsByPeriod('1~3월');
              }
            } catch (error) {
              console.error('1~3월 지표 직접 로드 중 오류:', error);
            }
          }
        }, 500);
      });
    }
    
    console.log('주기 탭 이벤트 직접 등록 완료');
  }, 2000); // 페이지 로드 후 2초 지연
});