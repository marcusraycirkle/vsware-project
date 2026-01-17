// MISpal Router - Multi-School Hash-Based Routing System
class MISpalRouter {
  constructor() {
    this.currentSchool = null;
    this.currentPage = null;
    this.routes = {};
    
    this.schools = [
      {
        id: 'shannoncomp',
        name: "St. Patrick's Comprehensive School",
        location: 'Shannon, Co. Clare',
        logo: 'https://www.stpatrickscomprehensive.ie/uploads/2/3/2/0/23206024/editor/st-patrick-s-comp-logo-layout-2-1.png?1564671961',
        color: '#dfbf7b'
      }
    ];
    
    this.init();
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
    
    // Set initial route
    if (!window.location.hash) {
      window.location.hash = '#/selector';
    }
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/selector';
    const parts = hash.split('/').filter(p => p);
    
    console.log('Route:', hash, 'Parts:', parts);
    
    // Route structure: /<school-id>/<page>
    // or /selector for school selection
    // or /<school-id>/enrolment for public enrolment
    
    if (parts.length === 0 || parts[0] === 'selector') {
      this.showSchoolSelector();
    } else if (parts.length >= 2) {
      const schoolId = parts[0];
      const page = parts[1];
      
      this.currentSchool = this.schools.find(s => s.id === schoolId);
      
      if (!this.currentSchool) {
        console.error('School not found:', schoolId);
        window.location.hash = '#/selector';
        return;
      }
      
      // Handle different pages
      if (page === 'enrolment') {
        this.showEnrolmentPage(schoolId);
      } else if (page === 'login') {
        this.showLoginPage(schoolId);
      } else {
        // Dashboard pages (requires authentication)
        this.showDashboardPage(schoolId, page);
      }
    } else {
      window.location.hash = '#/selector';
    }
  }

  showSchoolSelector() {
    console.log('Showing school selector');
    window.location.href = 'school-selector.html';
  }

  showEnrolmentPage(schoolId) {
    console.log('Showing enrolment page for:', schoolId);
    window.location.href = `enrolment.html#/${schoolId}/enrolment`;
  }

  showLoginPage(schoolId) {
    console.log('Showing login page for:', schoolId);
    // Store school ID for after login
    localStorage.setItem('selectedSchool', schoolId);
    
    // If we're already on index.html, show login
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      const landingPage = document.getElementById('landing-page');
      const loginSection = document.getElementById('login-section');
      
      if (landingPage && loginSection) {
        landingPage.style.display = 'none';
        loginSection.style.display = 'flex';
      }
    } else {
      window.location.href = `index.html#/${schoolId}/login`;
    }
  }

  showDashboardPage(schoolId, page) {
    console.log('Showing dashboard page:', page, 'for school:', schoolId);
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = `#/${schoolId}/login`;
      return;
    }
    
    // Store school context
    localStorage.setItem('selectedSchool', schoolId);
    
    // Navigate to dashboard with context
    if (window.showSection) {
      window.showSection(page);
    }
  }

  getSchoolById(schoolId) {
    return this.schools.find(s => s.id === schoolId);
  }

  getCurrentSchool() {
    return this.currentSchool;
  }

  setSchool(schoolId) {
    this.currentSchool = this.schools.find(s => s.id === schoolId);
    localStorage.setItem('selectedSchool', schoolId);
  }

  navigateTo(page) {
    if (this.currentSchool) {
      window.location.hash = `#/${this.currentSchool.id}/${page}`;
    } else {
      const storedSchool = localStorage.getItem('selectedSchool');
      if (storedSchool) {
        window.location.hash = `#/${storedSchool}/${page}`;
      } else {
        window.location.hash = '#/selector';
      }
    }
  }
}

// Initialize router
let router;
document.addEventListener('DOMContentLoaded', () => {
  router = new MISpalRouter();
});
