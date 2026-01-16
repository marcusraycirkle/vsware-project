// MISpal Router - Multi-School Routing System
class MISpalRouter {
  constructor() {
    this.currentSchool = null;
    this.currentPage = 'dashboard';
    this.routes = {
      'school-select': this.showSchoolSelection.bind(this),
      'login': this.showLogin.bind(this),
      'dashboard': this.showDashboard.bind(this),
      'students': this.showStudents.bind(this),
      'teachers': this.showTeachers.bind(this),
      'attendance': this.showAttendance.bind(this),
      'timetable': this.showTimetable.bind(this),
      'behavior': this.showBehavior.bind(this),
      'assessments': this.showAssessments.bind(this),
      'messages': this.showMessages.bind(this),
      'rooms': this.showRooms.bind(this),
      'reports': this.showReports.bind(this),
      'payments': this.showPayments.bind(this)
    };
    
    this.schools = [
      {
        id: 'shannoncomp',
        name: "St. Patrick's Comprehensive School",
        location: 'Shannon, Co. Clare',
        logo: '🎓',
        color: '#2563EB'
      },
      {
        id: 'ennis-sec',
        name: 'Ennis Secondary School',
        location: 'Ennis, Co. Clare',
        logo: '📚',
        color: '#7C3AED'
      },
      {
        id: 'limerick-col',
        name: 'Limerick College',
        location: 'Limerick City',
        logo: '🏫',
        color: '#059669'
      },
      {
        id: 'demo-school',
        name: 'Demo School',
        location: 'Demo Mode',
        logo: '🎯',
        color: '#DC2626'
      }
    ];
    
    this.init();
  }
  
  init() {
    // Parse URL: mispal.cirkledevelopment.co.uk/shannoncomp/pages/dashboard
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p);
    
    if (parts.length === 0) {
      // No school selected, show school selection
      this.navigate('school-select');
      return;
    }
    
    const schoolId = parts[0];
    const school = this.schools.find(s => s.id === schoolId);
    
    if (!school) {
      // Invalid school, redirect to selection
      this.navigate('school-select');
      return;
    }
    
    this.currentSchool = school;
    
    // Check if logged in
    const token = localStorage.getItem(`token_${schoolId}`);
    if (!token && parts[2] !== 'login') {
      // Not logged in, show login for this school
      this.navigate('login', schoolId);
      return;
    }
    
    // Navigate to requested page or dashboard
    const page = parts[2] || 'dashboard';
    this.currentPage = page;
    this.loadPage(page);
    
    // Setup popstate listener
    window.addEventListener('popstate', (e) => {
      if (e.state) {
        this.loadPage(e.state.page, e.state.school);
      }
    });
  }
  
  navigate(page, schoolId = null) {
    if (page === 'school-select') {
      window.history.pushState({ page }, 'Select School', '/');
      this.showSchoolSelection();
      return;
    }
    
    const school = schoolId || this.currentSchool?.id;
    if (!school) {
      this.navigate('school-select');
      return;
    }
    
    const url = page === 'login' ? `/${school}/login` : `/${school}/pages/${page}`;
    window.history.pushState({ page, school }, page, url);
    this.loadPage(page);
  }
  
  loadPage(page, schoolId = null) {
    if (schoolId) {
      const school = this.schools.find(s => s.id === schoolId);
      if (school) this.currentSchool = school;
    }
    
    const handler = this.routes[page];
    if (handler) {
      handler();
    } else {
      this.showDashboard();
    }
  }
  
  showSchoolSelection() {
    if (typeof hideLoading === 'function') hideLoading();
    
    const schoolPage = document.getElementById('school-selection-page');
    const loginPage = document.getElementById('login-page');
    const dashboardContainer = document.getElementById('dashboard');
    const landingPage = document.getElementById('landing-page');
    
    if (schoolPage) schoolPage.classList.remove('hidden');
    if (loginPage) loginPage.classList.add('hidden');
    if (dashboardContainer) dashboardContainer.classList.add('hidden');
    if (landingPage) landingPage.classList.add('hidden');
    
    // Render school cards
    const container = document.getElementById('schools-grid');
    if (!container) return;
    
    container.innerHTML = this.schools.map(school => `
      <div class="school-card" onclick="router.selectSchool('${school.id}')" style="border-color: ${school.color}">
        <div class="school-logo" style="background: ${school.color}">${school.logo}</div>
        <h3>${school.name}</h3>
        <p>${school.location}</p>
        <button class="btn btn-primary" style="background: ${school.color}">Continue</button>
      </div>
    `).join('');
  }
  
  selectSchool(schoolId) {
    const school = this.schools.find(s => s.id === schoolId);
    if (!school) return;
    
    this.currentSchool = school;
    if (typeof showLoading === 'function') showLoading();
    
    setTimeout(() => {
      this.navigate('login', schoolId);
    }, 800);
  }
  
  showLogin() {
    if (typeof hideLoading === 'function') hideLoading();
    
    const schoolPage = document.getElementById('school-selection-page');
    const loginPage = document.getElementById('login-page');
    const dashboardContainer = document.getElementById('dashboard');
    const landingPage = document.getElementById('landing-page');
    
    if (schoolPage) schoolPage.classList.add('hidden');
    if (loginPage) loginPage.classList.remove('hidden');
    if (dashboardContainer) dashboardContainer.classList.add('hidden');
    if (landingPage) landingPage.classList.add('hidden');
    
    // Update login page with school branding
    if (this.currentSchool) {
      const nameEl = document.querySelector('.login-school-name');
      const logoEl = document.querySelector('.login-school-logo');
      if (nameEl) nameEl.textContent = this.currentSchool.name;
      if (logoEl) {
        logoEl.textContent = this.currentSchool.logo;
        logoEl.style.background = this.currentSchool.color;
      }
      document.documentElement.style.setProperty('--primary', this.currentSchool.color);
    }
  }
  
  showDashboard() {
    if (typeof hideLoading === 'function') hideLoading();
    
    const schoolPage = document.getElementById('school-selection-page');
    const loginPage = document.getElementById('login-page');
    const dashboardContainer = document.getElementById('dashboard');
    const landingPage = document.getElementById('landing-page');
    
    if (schoolPage) schoolPage.classList.add('hidden');
    if (loginPage) loginPage.classList.add('hidden');
    if (dashboardContainer) dashboardContainer.classList.remove('hidden');
    if (landingPage) landingPage.classList.add('hidden');
    
    // Load dashboard data
    if (window.loadDashboardData) {
      window.loadDashboardData();
    }
  }
  
  showStudents() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('students');
    }
  }
  
  showTeachers() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('teachers');
    }
  }
  
  showAttendance() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('attendance');
    }
  }
  
  showTimetable() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('timetable');
    }
  }
  
  showBehavior() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('behavior');
    }
  }
  
  showAssessments() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('assessments');
    }
  }
  
  showMessages() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('messages');
    }
  }
  
  showRooms() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('rooms');
    }
  }
  
  showReports() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('reports');
    }
  }
  
  showPayments() {
    this.showDashboard();
    if (window.showSection) {
      window.showSection('payments');
    }
  }
  
  logout() {
    if (this.currentSchool) {
      localStorage.removeItem(`token_${this.currentSchool.id}`);
      localStorage.removeItem(`user_${this.currentSchool.id}`);
    }
    this.navigate('login', this.currentSchool?.id);
  }
}

// Initialize router
let router;
document.addEventListener('DOMContentLoaded', () => {
  router = new MISpalRouter();
});
