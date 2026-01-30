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
    // Don't initialize router on standalone pages (legal pages, etc.)
    if (window.STANDALONE_PAGE) {
      console.log('Standalone page detected, router disabled');
      return;
    }
    
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
    
    // Handle the route immediately if there's already a hash
    if (window.location.hash) {
      this.handleRoute();
    } else {
      // Only set default if no hash exists
      window.location.hash = '#/landing';
    }
  }

  handleRoute() {
    const hash = window.location.hash.slice(1) || '/landing';
    const parts = hash.split('/').filter(p => p);
    
    console.log('Route:', hash, 'Parts:', parts);
    
    // Route structure: /landing, /<school-id>/<page>, /enrolment
    
    if (parts.length === 0 || parts[0] === 'landing' || parts[0] === 'selector') {
      // Show landing page
      this.showLandingPage();
      return;
    }
    
    // Check if it's a standalone route like /enrolment
    if (parts[0] === 'enrolment') {
      this.showEnrolmentPage('shannoncomp');
      return;
    }
    
    const schoolId = parts[0] || 'shannoncomp';
    const page = parts[1] || 'dashboard';
    
    this.currentSchool = this.schools.find(s => s.id === schoolId);
    
    if (!this.currentSchool) {
      console.error('School not found:', schoolId);
      window.location.hash = '#/landing';
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
  }
  
  showLandingPage() {
    console.log('Showing landing page');
    const landingPage = document.getElementById('landing-page');
    const loginSection = document.getElementById('login-section');
    const enrollmentSection = document.getElementById('enrollment-section');
    const dashboardSection = document.getElementById('dashboard-section');
    
    if (landingPage && loginSection && enrollmentSection && dashboardSection) {
      landingPage.style.display = 'block';
      loginSection.style.display = 'none';
      enrollmentSection.style.display = 'none';
      dashboardSection.style.display = 'none';
    }
  }

  showSchoolSelector() {
    // Show landing page instead
    this.showLandingPage();
  }

  showEnrolmentPage(schoolId) {
    console.log('Showing enrolment page for:', schoolId);
    window.location.href = `/enrolment.html#/${schoolId}/enrolment`;
  }

  showLoginPage(schoolId) {
    console.log('Showing login page for:', schoolId);
    // Store school ID for after login
    localStorage.setItem('selectedSchool', schoolId);
    
    // Navigate to login with absolute path
    window.location.href = `/login#/${schoolId}/login`;
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
    
    // Hide landing page, show dashboard
    const landingPage = document.getElementById('landing-page');
    const dashboard = document.getElementById('dashboard');
    
    if (landingPage) landingPage.style.display = 'none';
    if (dashboard) {
      dashboard.classList.remove('hidden');
      dashboard.style.display = 'flex';
    }
    
    // Navigate to specific section if available
    if (window.showSection) {
      window.showSection(page || 'overview');
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
  // Don't initialize router on standalone pages
  if (!window.STANDALONE_PAGE) {
    router = new MISpalRouter();
  }
});
