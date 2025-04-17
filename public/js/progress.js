// 진행률 표시 컴포넌트
class ProgressDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with id ${containerId} not found`);
      return;
    }
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <span class="font-medium">매월 점검</span>
          <span class="text-blue-600" id="monthly-progress">0%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div id="monthly-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>

        <div class="flex justify-between items-center">
          <span class="font-medium">반기 점검</span>
          <span class="text-blue-600" id="semi-progress">0%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div id="semi-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>

        <div class="flex justify-between items-center">
          <span class="font-medium">1~3월 점검</span>
          <span class="text-blue-600" id="quarter-progress">0%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div id="quarter-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>
    `;
  }

  updateProgress(type, percentage) {
    const progressElement = document.getElementById(`${type}-progress`);
    const progressBar = document.getElementById(`${type}-progress-bar`);
    
    if (progressElement && progressBar) {
      progressElement.textContent = `${percentage}%`;
      progressBar.style.width = `${percentage}%`;
    }
  }

  // 진행률 계산 및 업데이트
  async calculateAndUpdateProgress(orgCode) {
    try {
      // API에서 결과 데이터 가져오기
      const response = await fetch(`/api/results/me?orgCode=${orgCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      if (!data.results) return;

      const results = data.results;
      
      // 매월 점검 진행률 계산
      const monthlyResults = results.filter(r => !r.indicatorCode.startsWith('H') && !r.indicatorCode.startsWith('Q'));
      const monthlyProgress = this.calculateProgress(monthlyResults);
      this.updateProgress('monthly', monthlyProgress);

      // 반기 점검 진행률 계산
      const semiResults = results.filter(r => r.indicatorCode.startsWith('H'));
      const semiProgress = this.calculateProgress(semiResults);
      this.updateProgress('semi', semiProgress);

      // 1~3월 점검 진행률 계산
      const quarterResults = results.filter(r => r.indicatorCode.startsWith('Q'));
      const quarterProgress = this.calculateProgress(quarterResults);
      this.updateProgress('quarter', quarterProgress);
    } catch (error) {
      console.error('Error calculating progress:', error);
    }
  }

  calculateProgress(results) {
    if (!results || results.length === 0) return 0;
    
    // 중복 제거된 실제 지표 완료 수 계산
    const uniqueCompletions = new Set();
    results.forEach(result => {
      const key = `${result.indicatorId}_${result.month || ''}`;
      if (result.status === 'completed') {
        uniqueCompletions.add(key);
      }
    });

    // 진행률 계산 (완료된 지표 / 전체 지표 * 100)
    return Math.round((uniqueCompletions.size / results.length) * 100);
  }
}

// 전역 인스턴스 생성
let progressDisplay;

// 문서 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  progressDisplay = new ProgressDisplay('progress-container');
  
  // 현재 선택된 기관의 코드가 있다면 진행률 업데이트
  const currentOrgCode = window.selectedOrganization?.code;
  if (currentOrgCode) {
    progressDisplay.calculateAndUpdateProgress(currentOrgCode);
  }
});

// 기관 선택 시 진행률 업데이트 이벤트 리스너
document.addEventListener('organizationSelected', (event) => {
  const orgCode = event.detail.orgCode;
  if (progressDisplay && orgCode) {
    progressDisplay.calculateAndUpdateProgress(orgCode);
  }
}); 