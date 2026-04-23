// ========== ADMIN PORTAL JAVASCRIPT ==========
// MISpal Administrator Portal - Complete Management System

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://vsware-project.vercel.app/api';

let currentUser = null;
let authToken = null;
let currentSchoolId = null;

const TEACHER_TIER_LEVELS = {
    Avg: {
        level: 1,
        label: 'Avg (Entry)',
        permissionLevel: 'General',
        permissions: ['View grades', 'View attendance', 'Add notes']
    },
    Mid: {
        level: 2,
        label: 'Mid (Standard)',
        permissionLevel: 'Editor',
        permissions: ['All Avg', 'Manage assessments', 'Send messages']
    },
    High: {
        level: 3,
        label: 'High (Senior)',
        permissionLevel: 'Senior',
        permissions: ['All Mid', 'Manage classes', 'Timetable edits']
    },
    HR: {
        level: 4,
        label: 'HR (Highest)',
        permissionLevel: 'Admin',
        permissions: ['All High', 'Manage staff', 'Manage subjects']
    }
};

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getPortalUserName(user) {
    if (!user) return 'Admin User';
    const fullName = `${(user.firstName || '').trim()} ${(user.lastName || '').trim()}`.trim();
    if (fullName) return fullName;
    if (user.name && String(user.name).trim()) return String(user.name).trim();
    if (user.fullName && String(user.fullName).trim()) return String(user.fullName).trim();
    if (user.email && String(user.email).trim()) return String(user.email).trim();
    return 'Admin User';
}

async function adminApiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = payload.message || 'Request failed';
        throw new Error(message);
    }
    return payload;
}

// Global data stores for search
let allStudentsData = [];
let allTeachersData = [];
let allClassesData = [];
let latestTuslaReport = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Portal Initializing...');
    initializeAuth();
    setupEventListeners();
    loadUserData();
    
    // Hide loading overlay after 1 second
    setTimeout(() => {
        const overlay = document.getElementById('portal-loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => overlay.remove(), 500);
        }
    }, 1000);
});

function initializeAuth() {
    // Check both token locations for compatibility
    authToken = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
    
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateUserDisplay();
        } catch (e) {
            console.error('Failed to parse user data:', e);
        }
    }
    
    // Redirect to login if not authenticated
    if (!authToken && window.location.pathname === '/admin-portal.html') {
        window.location.pathname = '/shannoncomp/login';
    }
}

function updateUserDisplay() {
    if (currentUser) {
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');
        
        if (userName) userName.textContent = getPortalUserName(currentUser);
        if (userRole) userRole.textContent = currentUser.role || currentUser.permissionLevel || currentUser.roleHierarchy || 'Principal';
    }
}

function setupEventListeners() {
    // Global search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(handleGlobalSearch, 300));
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) {
                const dropdown = document.getElementById('search-results-dropdown');
                if (dropdown) {
                    dropdown.style.display = 'none';
                }
            }
        });
    }

    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Quick action button
    const quickActionBtn = document.getElementById('quick-action-btn');
    if (quickActionBtn) {
        quickActionBtn.addEventListener('click', openQuickActions);
    }

    // Notification button
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotifications);
    }

    // User menu button
    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserMenu);
    }

    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Mark all read button
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllRead);
    }

    // Logout link
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Quick actions modal buttons
    const quickActionItems = document.querySelectorAll('.quick-action-item');
    quickActionItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (action) {
                quickAction(action);
            }
        });
    });

    // Quick actions close button
    const quickActionsCloseBtn = document.getElementById('quick-actions-close-btn');
    if (quickActionsCloseBtn) {
        quickActionsCloseBtn.addEventListener('click', () => {
            closeModal('quick-actions-modal');
        });
    }

    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Page-specific button listeners
    // Students page
    const exportStudentsBtn = document.getElementById('export-students-btn');
    if (exportStudentsBtn) {
        exportStudentsBtn.addEventListener('click', exportStudents);
    }

    const importStudentsBtn = document.getElementById('import-students-btn');
    if (importStudentsBtn) {
        importStudentsBtn.addEventListener('click', importStudents);
    }

    const addStudentBtn = document.getElementById('add-student-btn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', openAddStudentModal);
    }

    // Teachers page
    const exportTeachersBtn = document.getElementById('export-teachers-btn');
    if (exportTeachersBtn) {
        exportTeachersBtn.addEventListener('click', exportTeachers);
    }

    const addTeacherBtn = document.getElementById('add-teacher-btn');
    if (addTeacherBtn) {
        addTeacherBtn.addEventListener('click', openAddTeacherModal);
    }

    // Customization page
    const resetCustomizationBtn = document.getElementById('reset-customization-btn');
    if (resetCustomizationBtn) {
        resetCustomizationBtn.addEventListener('click', resetCustomization);
    }

    const saveCustomizationBtn = document.getElementById('save-customization-btn');
    if (saveCustomizationBtn) {
        saveCustomizationBtn.addEventListener('click', saveCustomization);
    }

    // School settings
    const saveSchoolSettingsBtn = document.getElementById('save-school-settings-btn');
    if (saveSchoolSettingsBtn) {
        saveSchoolSettingsBtn.addEventListener('click', saveSchoolSettings);
    }

    // Logo upload area
    const logoUploadArea = document.getElementById('logo-upload-area');
    const logoInput = document.getElementById('logo-upload');
    if (logoUploadArea && logoInput) {
        logoUploadArea.addEventListener('click', () => {
            logoInput.click();
        });
        logoInput.addEventListener('change', handleLogoUpload);
    }

    // Users page
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', openAddUserModal);
    }
}

// ========== NAVIGATION ==========
let sidebarCollapsed = false;

function toggleSidebar() {
    // Sidebar is now permanent - toggle disabled
    console.log('Sidebar is now permanent and cannot be toggled');
}

function navigateToPage(pageName) {
    const targetPage = document.getElementById(`page-${pageName}`);
    if (!targetPage) {
        const mainContent = document.getElementById('admin-content');
        if (mainContent) {
            const dynamicPage = document.createElement('div');
            dynamicPage.id = `page-${pageName}`;
            dynamicPage.className = 'page-content';
            mainContent.appendChild(dynamicPage);
            loadPageContent(pageName, dynamicPage);
        }
    }

    // Hide all pages
    const allPages = document.querySelectorAll('.page-content');
    allPages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const resolvedPage = document.getElementById(`page-${pageName}`);
    if (resolvedPage) {
        resolvedPage.classList.add('active');
        
        // Load page content if empty
        if (resolvedPage.innerHTML.trim() === '') {
            loadPageContent(pageName, resolvedPage);
        }
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeNav = document.querySelector(`[data-page="${pageName}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('page', pageName);
    window.history.pushState({}, '', url);
}

// ========== PAGE CONTENT LOADERS ==========
function loadPageContent(pageName, container) {
    switch(pageName) {
        case 'students':
            loadStudentsPage(container);
            break;
        case 'teachers':
            loadTeachersPage(container);
            break;
        case 'classes':
            loadClassesPage(container);
            break;
        case 'customization':
            loadCustomizationPage(container);
            break;
        case 'school-settings':
            loadSchoolSettingsPage(container);
            break;
        case 'users':
            loadUserManagementPage(container);
            break;
        case 'analytics':
            loadAnalyticsPage(container);
            break;
        case 'calendar':
            loadCalendarPage(container);
            break;
        case 'attendance':
            loadAttendancePage(container);
            break;
        case 'behavior':
            loadBehaviorPage(container);
            break;
        case 'enrollment':
            loadEnrollmentPage(container);
            break;
        case 'timetable':
            loadTimetablePage(container);
            break;
        case 'assessments':
            loadAssessmentsPage(container);
            break;
        case 'subjects':
            loadSubjectsPage(container);
            break;
        case 'rooms':
            loadRoomsPage(container);
            break;
        case 'parents':
            loadParentsPage(container);
            break;
        case 'staff':
            loadStaffPage(container);
            break;
        case 'messages':
            loadMessagesPage(container);
            break;
        case 'announcements':
            loadAnnouncementsPage(container);
            break;
        case 'integrations':
            loadIntegrationsPage(container);
            break;
        default:
            container.innerHTML = '<div class="p-4">Content coming soon...</div>';
    }
}

// ========== STUDENTS PAGE ==========
function loadStudentsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Student Management</h2>
                <p class="page-subtitle">Manage all students and their information</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" id="export-students-btn">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn-secondary" id="import-students-btn">
                    <i class="fas fa-upload"></i> Import
                </button>
                <button class="btn-primary" id="add-student-btn">
                    <i class="fas fa-user-plus"></i> Add Student
                </button>
            </div>
        </div>
        
        <div class="dashboard-card">
            <div class="card-header">
                <h3><i class="fas fa-filter"></i> Filters</h3>
            </div>
            <div style="padding: 20px; display: flex; gap: 16px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Search</label>
                    <input type="text" id="student-search" placeholder="Search by name, ID..." style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Year Group</label>
                    <select id="year-filter" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <option value="">All Years</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                        <option value="6">Year 6</option>
                    </select>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Status</label>
                    <select id="status-filter" style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="dashboard-card mt-3" style="overflow-x: auto;">
            <div class="card-header">
                <h3><i class="fas fa-users"></i> All Students</h3>
                <span class="badge-pill" id="student-count">Loading...</span>
            </div>
            <div id="students-table-container">
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i>
                    <p style="margin-top: 16px; color: var(--text-secondary);">Loading students...</p>
                </div>
            </div>
        </div>
    `;
    
    // Load students data
    loadStudentsData();
}

async function loadStudentsData() {
    try {
        const response = await fetch(`${API_URL}/students`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const students = await response.json();
            allStudentsData = Array.isArray(students) ? students : (students.students || []);
            renderStudentsTable(allStudentsData);
        } else {
            // Show mock data for demo
            const mockStudents = generateMockStudents(50);
            allStudentsData = mockStudents;
            renderStudentsTable(mockStudents);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        const mockStudents = generateMockStudents(50);
        allStudentsData = mockStudents;
        renderStudentsTable(mockStudents);
    }
}

function generateMockStudents(count) {
    const firstNames = ['James', 'Emma', 'Noah', 'Olivia', 'Liam', 'Ava', 'William', 'Sophia', 'Mason', 'Isabella'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    return Array.from({length: count}, (_, i) => ({
        _id: `student-${i}`,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        studentId: `STU${String(i + 1000).padStart(5, '0')}`,
        yearGroup: Math.floor(Math.random() * 6) + 1,
        email: `student${i}@school.ie`,
        status: ['active', 'active', 'active', 'inactive'][Math.floor(Math.random() * 4)]
    }));
}

function renderStudentsTable(students) {
    const container = document.getElementById('students-table-container');
    const countBadge = document.getElementById('student-count');
    
    if (countBadge) countBadge.textContent = `${students.length} students`;
    
    const html = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Student ID</th>
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Name</th>
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Year</th>
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Email</th>
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Status</th>
                    <th style="padding: 16px; text-align: right; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${students.map(student => `
                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 16px; font-size: 14px; font-weight: 600; color: var(--text-primary);">${student.studentId}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">${student.firstName} ${student.lastName}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">Year ${student.yearGroup}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">${student.email}</td>
                        <td style="padding: 16px;">
                            <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; ${student.status === 'active' ? 'background: #D1FAE5; color: #065F46;' : 'background: #FEE2E2; color: #991B1B;'}">
                                ${student.status}
                            </span>
                        </td>
                        <td style="padding: 16px; text-align: right;">
                            <button class="action-btn" data-action="view" data-student-id="${student._id}" style="padding: 8px 12px; background: var(--primary-light); color: var(--primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" data-action="edit" data-student-id="${student._id}" style="padding: 8px 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn" data-action="delete" data-student-id="${student._id}" style="padding: 8px 12px; background: #FEE2E2; color: #DC2626; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
    
    // Add event listeners for action buttons
    container.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            const studentId = this.getAttribute('data-student-id');
            
            if (action === 'view') {
                viewStudent(studentId);
            } else if (action === 'edit') {
                editStudent(studentId);
            } else if (action === 'delete') {
                deleteStudent(studentId);
            }
        });
    });
}

// ========== TEACHERS PAGE ==========
function loadTeachersPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Teacher Management</h2>
                <p class="page-subtitle">Manage teaching staff and assignments</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" id="export-teachers-btn">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn-primary" id="add-teacher-btn">
                    <i class="fas fa-user-plus"></i> Add Teacher
                </button>
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card green">
                <div class="stat-icon">
                    <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Total Teachers</span>
                    <span class="stat-value">87</span>
                    <span class="stat-change positive">
                        <i class="fas fa-arrow-up"></i> 3 new this term
                    </span>
                </div>
            </div>
            
            <div class="stat-card blue">
                <div class="stat-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Subjects Taught</span>
                    <span class="stat-value">24</span>
                    <span class="stat-change neutral">
                        <i class="fas fa-minus"></i> No change
                    </span>
                </div>
            </div>
            
            <div class="stat-card orange">
                <div class="stat-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-label">Teaching Hours</span>
                    <span class="stat-value">2,145</span>
                    <span class="stat-change positive">
                        <i class="fas fa-arrow-up"></i> This week
                    </span>
                </div>
            </div>
        </div>
        
        <div class="dashboard-card mt-3" style="overflow-x: auto;">
            <div class="card-header">
                <h3><i class="fas fa-users"></i> All Teachers</h3>
                <input type="text" placeholder="Search teachers..." style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; width: 250px;">
            </div>
            <div id="teachers-table-container">
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i>
                    <p style="margin-top: 16px; color: var(--text-secondary);">Loading teachers...</p>
                </div>
            </div>
        </div>
    `;
    
    loadTeachersData();
}

async function loadTeachersData() {
    try {
        const response = await fetch(`${API_URL}/teachers`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const teachers = await response.json();
            allTeachersData = Array.isArray(teachers) ? teachers : (teachers.teachers || []);
            renderTeachersTable(allTeachersData);
        } else {
            const mockTeachers = generateMockTeachers(30);
            allTeachersData = mockTeachers;
            renderTeachersTable(mockTeachers);
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
        const mockTeachers = generateMockTeachers(30);
        allTeachersData = mockTeachers;
        renderTeachersTable(mockTeachers);
    }
}

function generateMockTeachers(count) {
    const firstNames = ['John', 'Mary', 'Michael', 'Sarah', 'David', 'Laura', 'Thomas', 'Emma', 'Patrick', 'Catherine'];
    const lastNames = ['O\'Brien', 'Murphy', 'Kelly', 'Walsh', 'Ryan', 'Byrne', 'Connor', 'Sullivan', 'McCarthy', 'Doyle'];
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Irish', 'French', 'Art', 'Music', 'PE'];
    
    return Array.from({length: count}, (_, i) => ({
        _id: `teacher-${i}`,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        teacherId: `TCH${String(i + 1000).padStart(5, '0')}`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        email: `teacher${i}@school.ie`,
        classes: Math.floor(Math.random() * 8) + 3
    }));
}

function renderTeachersTable(teachers) {
    const container = document.getElementById('teachers-table-container');
    
    const html = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Teacher ID</th>
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Name</th>
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Subject</th>
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Email</th>
                    <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Classes</th>
                    <th style="padding: 16px; text-align: right; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${teachers.map(teacher => `
                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;" class="teacher-row">
                        <td style="padding: 16px; font-size: 14px; font-weight: 600; color: var(--text-primary);">${teacher.teacherId}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">${teacher.firstName} ${teacher.lastName}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">${teacher.subject}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">${teacher.email}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">${teacher.classes} classes</td>
                        <td style="padding: 16px; text-align: right;">
                            <button class="action-btn" data-action="view" data-teacher-id="${teacher._id}" style="padding: 8px 12px; background: var(--primary-light); color: var(--primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" data-action="edit" data-teacher-id="${teacher._id}" style="padding: 8px 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
    
    // Add event listeners for teacher table action buttons
    container.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            const teacherId = this.getAttribute('data-teacher-id');
            
            if (action === 'view') {
                viewTeacher(teacherId);
            } else if (action === 'edit') {
                editTeacher(teacherId);
            }
        });
    });
    
    // Add hover effect to teacher rows
    container.querySelectorAll('.teacher-row').forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.background = 'var(--bg-secondary)';
        });
        row.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
    });
}

// ========== CUSTOMIZATION PAGE ==========
function loadCustomizationPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Customization</h2>
                <p class="page-subtitle">Customize the look and feel of your portal</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" id="reset-customization-btn">
                    <i class="fas fa-undo"></i> Reset to Default
                </button>
                <button class="btn-primary" id="save-customization-btn">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-palette"></i> Color Scheme</h3>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Primary Color</label>
                        <input type="color" value="#4F46E5" style="width: 100%; height: 50px; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;">
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Accent Color</label>
                        <input type="color" value="#10B981" style="width: 100%; height: 50px; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer;">
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Theme</label>
                        <select style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            <option>Light Mode</option>
                            <option>Dark Mode</option>
                            <option>Auto (System)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-image"></i> Branding</h3>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 24px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">School Logo</label>
                        <div id="logo-upload-area" style="width: 100%; height: 150px; border: 2px dashed var(--border-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                            <div style="text-align: center; color: var(--text-secondary);">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 32px; margin-bottom: 8px;"></i>
                                <p>Click to upload logo</p>
                            </div>
                            <input type="file" id="logo-upload" style="display: none;" accept="image/*">
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">School Name</label>
                        <input type="text" value="St. Patrick's Comprehensive" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-cog"></i> Layout Options</h3>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" checked style="margin-right: 12px; width: 18px; height: 18px;">
                            <div>
                                <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Compact Sidebar</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Reduce sidebar width for more space</div>
                            </div>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" style="margin-right: 12px; width: 18px; height: 18px;">
                            <div>
                                <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Fixed Header</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Keep header visible when scrolling</div>
                            </div>
                        </label>
                    </div>
                    
                    <div>
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" checked style="margin-right: 12px; width: 18px; height: 18px;">
                            <div>
                                <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">Rounded Corners</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Use rounded corners for cards</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-font"></i> Typography</h3>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Font Family</label>
                        <select style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            <option>Inter (Default)</option>
                            <option>Roboto</option>
                            <option>Open Sans</option>
                            <option>Poppins</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Font Size</label>
                        <select style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            <option>Small</option>
                            <option selected>Medium (Default)</option>
                            <option>Large</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== SCHOOL SETTINGS PAGE ==========
function loadSchoolSettingsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">School Settings</h2>
                <p class="page-subtitle">Configure school information and preferences</p>
            </div>
            <div class="page-actions">
                <button class="btn-primary" id="save-school-settings-btn">
                    <i class="fas fa-save"></i> Save Settings
                </button>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-school"></i> School Information</h3>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">School Name</label>
                        <input type="text" value="St. Patrick's Comprehensive School" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Address</label>
                        <textarea rows="3" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">Shannon, Co. Clare, Ireland</textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Phone</label>
                        <input type="tel" value="+353 61 123456" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Email</label>
                        <input type="email" value="info@stpatricks.ie" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <h3><i class="fas fa-calendar"></i> Academic Year</h3>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Current Year</label>
                        <input type="text" value="2025-2026" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Term Start Date</label>
                        <input type="date" value="2025-09-01" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Term End Date</label>
                        <input type="date" value="2026-06-30" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== USER MANAGEMENT PAGE ==========
function loadUserManagementPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">User Management</h2>
                <p class="page-subtitle">Manage system users and permissions</p>
            </div>
            <div class="page-actions">
                <button class="btn-primary" id="add-user-btn">
                    <i class="fas fa-user-plus"></i> Add User
                </button>
            </div>
        </div>
        
        <div class="dashboard-card">
            <div class="card-header">
                <h3><i class="fas fa-users-cog"></i> System Users</h3>
                <input type="text" placeholder="Search users..." style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; width: 250px;">
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--bg-secondary); border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Name</th>
                            <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Email</th>
                            <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Role</th>
                            <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Status</th>
                            <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Last Login</th>
                            <th style="padding: 16px; text-align: right; font-size: 13px; font-weight: 700; color: var(--text-secondary);">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">Admin User</td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">admin@school.ie</td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #DBEAFE; color: #1E40AF;">Principal</span>
                            </td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #D1FAE5; color: #065F46;">Active</span>
                            </td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">Today, 9:30 AM</td>
                            <td style="padding: 16px; text-align: right;">
                                <button style="padding: 8px 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ========== OTHER PAGE LOADERS (SIMPLIFIED) ==========
function loadClassesPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Classes Management</h2>
                <p class="page-subtitle">View classes, rooms, and assigned teachers</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" onclick="refreshClassesPage()"><i class="fas fa-rotate"></i> Refresh</button>
            </div>
        </div>
        <div class="dashboard-card" id="classes-page-list" style="padding: 20px;">Loading...</div>
    `;
    refreshClassesPage();
}

function loadAnalyticsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Analytics & Insights</h2>
                <p class="page-subtitle">Live high-level counts from core modules</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" onclick="refreshAnalyticsPage()"><i class="fas fa-rotate"></i> Refresh</button>
            </div>
        </div>
        <div class="stats-grid" id="analytics-summary"></div>
    `;
    refreshAnalyticsPage();
}

function loadCalendarPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">School Calendar</h2>
                <p class="page-subtitle">Upcoming lessons and scheduled sessions</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" onclick="refreshCalendarPage()"><i class="fas fa-rotate"></i> Refresh</button>
            </div>
        </div>
        <div class="dashboard-card" id="calendar-list" style="padding: 20px;">Loading...</div>
    `;
    refreshCalendarPage();
}

function loadAttendancePage(container) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const defaultStart = new Date(currentYear, 6, 1);
    const defaultEnd = new Date(currentYear, 11, 31);

    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Attendance Management</h2>
                <p class="page-subtitle">TUSLA report and attendance records</p>
            </div>
        </div>
        <div class="dashboard-card tusla-report-card">
            <div class="card-header tusla-header">
                <h3><i class="fas fa-file-lines"></i> TUSLA Report</h3>
            </div>
            <div class="tusla-controls">
                <div class="tusla-grid">
                    <div class="tusla-field">
                        <label>How Many Absences</label>
                        <input type="number" id="tusla-threshold" min="1" value="20">
                    </div>
                    <div class="tusla-field">
                        <label>Start Date</label>
                        <input type="date" id="tusla-start-date" value="${toDateInputValue(defaultStart)}">
                    </div>
                    <div class="tusla-field">
                        <label>End Date</label>
                        <input type="date" id="tusla-end-date" value="${toDateInputValue(defaultEnd)}">
                    </div>
                    <div class="tusla-field">
                        <label>Include PLC Courses</label>
                        <select id="tusla-include-plc">
                            <option value="no" selected>No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </div>
                    <div class="tusla-field">
                        <label>Include Over 16</label>
                        <select id="tusla-include-over16">
                            <option value="no" selected>No</option>
                            <option value="yes">Yes</option>
                        </select>
                    </div>
                    <div class="tusla-field">
                        <label>Year Group</label>
                        <select id="tusla-year-group">
                            <option value="all" selected>Select Filter</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">TY</option>
                            <option value="5">Fifth Year</option>
                            <option value="6">Sixth Year</option>
                        </select>
                    </div>
                </div>
                <div class="tusla-actions">
                    <button class="btn-primary" onclick="generateTuslaReport()"><i class="fas fa-check"></i> Go</button>
                    <button class="btn-secondary" onclick="exportTuslaCsv()"><i class="fas fa-file-csv"></i> Export to CSV</button>
                    <button class="btn-secondary" onclick="exportTuslaPdf()"><i class="fas fa-file-pdf"></i> Export to PDF</button>
                    <button class="btn-secondary" onclick="createTuslaGroup()"><i class="fas fa-users"></i> Create Group</button>
                </div>
            </div>
            <div class="tusla-results" id="tusla-results">
                <div class="tusla-empty">Click Go to generate report.</div>
            </div>
        </div>
        <div class="dashboard-card" id="attendance-list" style="padding:20px;">Loading attendance records...</div>
    `;
    generateTuslaReport();
    refreshAttendancePage();
}

function toDateInputValue(date) {
    return new Date(date).toISOString().slice(0, 10);
}

function normalizeTuslaPeriod(period) {
    if (period === null || period === undefined || period === '') return 'day';
    const numericPeriod = Number(period);
    if (!Number.isNaN(numericPeriod)) {
        return numericPeriod <= 4 ? 'am' : 'pm';
    }
    const periodText = String(period).toLowerCase();
    if (periodText.includes('am') || periodText.includes('morning')) return 'am';
    if (periodText.includes('pm') || periodText.includes('afternoon')) return 'pm';
    return 'day';
}

function buildTuslaSummary(records, threshold) {
    const absentStatuses = new Set(['Absent', 'AbsentExplained', 'Medical', 'Excused']);
    let absentAm = 0;
    let absentPm = 0;
    let fullDayAbsences = 0;
    const daysByStudent = new Map();

    records.forEach((record) => {
        if (!absentStatuses.has(record.status)) return;

        const periodType = normalizeTuslaPeriod(record.period);
        if (periodType === 'am') absentAm += 1;
        if (periodType === 'pm') absentPm += 1;

        const studentId = String(record.student?._id || 'unknown');
        const dayKey = `${studentId}_${new Date(record.date).toISOString().slice(0, 10)}`;

        if (!daysByStudent.has(dayKey)) {
            daysByStudent.set(dayKey, { am: false, pm: false, count: 0, studentId });
        }
        const dayEntry = daysByStudent.get(dayKey);
        dayEntry.count += 1;
        if (periodType === 'am') dayEntry.am = true;
        if (periodType === 'pm') dayEntry.pm = true;
    });

    const fullDaysPerStudent = new Map();
    daysByStudent.forEach((entry) => {
        if (entry.am && entry.pm) {
            fullDayAbsences += 1;
            fullDaysPerStudent.set(entry.studentId, (fullDaysPerStudent.get(entry.studentId) || 0) + 1);
        }
    });

    let studentsAboveThreshold = 0;
    fullDaysPerStudent.forEach((days) => {
        if (days >= threshold) studentsAboveThreshold += 1;
    });

    return {
        absentAm,
        absentPm,
        fullDayAbsences,
        studentsAboveThreshold
    };
}

function renderTuslaReport(summary, startDate, endDate, threshold, totalRecords) {
    const resultsEl = document.getElementById('tusla-results');
    if (!resultsEl) return;

    const rangeLabel = `${new Date(startDate).toISOString().slice(0, 10)} to ${new Date(endDate).toISOString().slice(0, 10)}`;

    resultsEl.innerHTML = `
        <div class="tusla-summary-head">
            <strong>TUSLA Report</strong>
            <span>${escapeHtml(rangeLabel)}</span>
            <span>${totalRecords} attendance records matched</span>
        </div>
        <div class="tusla-table-wrap">
            <table class="tusla-table">
                <thead>
                    <tr>
                        <th>Absence Type (For All Ages)</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Absent Marks (A, B, C, D, E, F or H from NEWB) for all students in all courses for rollcall AM</td>
                        <td>${summary.absentAm}</td>
                    </tr>
                    <tr>
                        <td>Absent Marks (A, B, C, D, E, F or H from NEWB) for all students in all courses for rollcall PM</td>
                        <td>${summary.absentPm}</td>
                    </tr>
                    <tr>
                        <td>Full day absences</td>
                        <td>${summary.fullDayAbsences}</td>
                    </tr>
                    <tr>
                        <td>Number of students that have missed ${threshold} or more full days</td>
                        <td>${summary.studentsAboveThreshold}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

async function generateTuslaReport() {
    const startDate = document.getElementById('tusla-start-date')?.value;
    const endDate = document.getElementById('tusla-end-date')?.value;
    const thresholdValue = Number(document.getElementById('tusla-threshold')?.value || 20);
    const yearGroupFilter = document.getElementById('tusla-year-group')?.value || 'all';
    const includeOver16 = document.getElementById('tusla-include-over16')?.value === 'yes';

    if (!startDate || !endDate) {
        showToast('Please choose a start and end date', 'error');
        return;
    }

    const resultsEl = document.getElementById('tusla-results');
    if (resultsEl) resultsEl.innerHTML = '<div class="tusla-empty">Generating report...</div>';

    try {
        const data = await adminApiCall(`/attendance?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&limit=5000`);
        let records = Array.isArray(data.attendance) ? data.attendance : [];

        if (yearGroupFilter !== 'all') {
            records = records.filter((record) => String(record.class?.year || '') === String(yearGroupFilter));
        }

        if (!includeOver16) {
            const studentsData = await adminApiCall('/students?limit=2000');
            const students = Array.isArray(studentsData.students) ? studentsData.students : [];
            const allowedStudentIds = new Set(
                students
                    .filter((student) => {
                        const dob = student.dateOfBirth ? new Date(student.dateOfBirth) : null;
                        if (!dob || Number.isNaN(dob.getTime())) return true;
                        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                        return age <= 16;
                    })
                    .map((student) => String(student._id))
            );
            records = records.filter((record) => allowedStudentIds.has(String(record.student?._id || '')));
        }

        const summary = buildTuslaSummary(records, thresholdValue);
        latestTuslaReport = {
            generatedAt: new Date().toISOString(),
            startDate,
            endDate,
            threshold: thresholdValue,
            summary,
            totalRecords: records.length
        };
        renderTuslaReport(summary, startDate, endDate, thresholdValue, records.length);
    } catch (error) {
        if (resultsEl) {
            resultsEl.innerHTML = `<div class="tusla-empty" style="color:#991b1b;">Failed to generate report: ${escapeHtml(error.message)}</div>`;
        }
    }
}

function exportTuslaCsv() {
    if (!latestTuslaReport) {
        showToast('Generate report first', 'error');
        return;
    }

    const rows = [
        ['Metric', 'Count'],
        ['Absent Marks AM', latestTuslaReport.summary.absentAm],
        ['Absent Marks PM', latestTuslaReport.summary.absentPm],
        ['Full day absences', latestTuslaReport.summary.fullDayAbsences],
        [`Students with ${latestTuslaReport.threshold}+ full day absences`, latestTuslaReport.summary.studentsAboveThreshold]
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tusla-report-${latestTuslaReport.startDate}-to-${latestTuslaReport.endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function exportTuslaPdf() {
    if (!latestTuslaReport) {
        showToast('Generate report first', 'error');
        return;
    }
    window.print();
}

function createTuslaGroup() {
    if (!latestTuslaReport) {
        showToast('Generate report first', 'error');
        return;
    }
    showToast('Group creation queued from current TUSLA report');
}

function loadBehaviorPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Behavior Management</h2></div><div class="dashboard-card" id="behavior-list" style="padding:20px;">Loading...</div>';
    refreshBehaviorPage();
}

function loadEnrollmentPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Enrollment Management</h2></div><div class="dashboard-card" id="enrollment-list" style="padding:20px;">Loading...</div>';
    refreshEnrollmentPage();
}

function loadTimetablePage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Timetable Management</h2>
                <p class="page-subtitle">Create and publish class timetables from the principal portal</p>
            </div>
            <div class="page-actions">
                <button class="btn-primary" onclick="openCreateTimetableModal()">
                    <i class="fas fa-plus"></i> Create Timetable
                </button>
                <button class="btn-secondary" onclick="refreshAdminTimetables()">
                    <i class="fas fa-rotate"></i> Refresh
                </button>
            </div>
        </div>
        <div class="dashboard-card">
            <div class="card-header">
                <h3><i class="fas fa-calendar-week"></i> Existing Timetables</h3>
            </div>
            <div id="admin-timetables-list" style="padding: 20px;">Loading...</div>
        </div>
    `;
    refreshAdminTimetables();
}

function loadAssessmentsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Assessments</h2></div><div class="dashboard-card" id="assessments-list" style="padding:20px;">Loading...</div>';
    refreshAssessmentsPage();
}

function loadSubjectsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Subjects</h2></div><div class="dashboard-card" id="subjects-list" style="padding:20px;">Loading...</div>';
    refreshSubjectsPage();
}

function loadRoomsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Room Management</h2></div><div class="dashboard-card" id="rooms-list" style="padding:20px;">Loading...</div>';
    refreshRoomsPage();
}

function loadParentsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Parent Management</h2>
                <p class="page-subtitle">View and manage parent accounts</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" onclick="refreshParentsPage()">
                    <i class="fas fa-rotate"></i> Refresh
                </button>
            </div>
        </div>
        <div class="dashboard-card" style="overflow-x:auto;">
            <div class="card-header">
                <h3><i class="fas fa-users"></i> Parent Accounts</h3>
                <span class="badge-pill" id="parents-count">0 parents</span>
            </div>
            <div id="parents-table-container" style="padding: 20px;">Loading...</div>
        </div>
    `;
    refreshParentsPage();
}

function loadStaffPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Staff Management</h2>
                <p class="page-subtitle">Manage teacher role tiers from lowest to highest permissions</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" onclick="refreshStaffPage()"><i class="fas fa-rotate"></i> Refresh</button>
            </div>
        </div>
        <div class="dashboard-card">
            <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                <strong>Tier Order:</strong> Avg (lowest) -> Mid -> High -> HR (highest)
            </div>
            <div id="staff-table-container" style="padding: 20px;">Loading...</div>
        </div>
    `;
    refreshStaffPage();
}

function loadMessagesPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Messages</h2>
                <p class="page-subtitle">Inbox, sent mail, and direct communication</p>
            </div>
            <div class="page-actions">
                <button class="btn-primary" onclick="openComposeAdminMessageModal()"><i class="fas fa-pen"></i> Compose</button>
                <button class="btn-secondary" onclick="refreshAdminMessages()"><i class="fas fa-rotate"></i> Refresh</button>
            </div>
        </div>
        <div class="dashboard-card">
            <div class="card-header">
                <h3><i class="fas fa-inbox"></i> Message Folder</h3>
                <select id="admin-message-folder" onchange="refreshAdminMessages(this.value)" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    <option value="inbox">Inbox</option>
                    <option value="sent">Sent</option>
                    <option value="starred">Starred</option>
                    <option value="archived">Archived</option>
                </select>
            </div>
            <div id="admin-messages-list" style="padding: 20px;">Loading...</div>
        </div>
    `;
    refreshAdminMessages('inbox');
}

function loadAnnouncementsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Announcements</h2>
                <p class="page-subtitle">Send school-wide updates to teachers, parents, or students</p>
            </div>
            <div class="page-actions">
                <button class="btn-secondary" onclick="refreshAnnouncements()"><i class="fas fa-rotate"></i> Refresh</button>
            </div>
        </div>
        <div class="dashboard-card" style="margin-bottom: 16px;">
            <div style="padding: 20px; display: grid; gap: 12px;">
                <input id="announcement-subject" type="text" placeholder="Announcement title" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                <textarea id="announcement-body" rows="4" placeholder="Announcement message" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;"></textarea>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <select id="announcement-target" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px; min-width: 220px;">
                        <option value="all-parents">All Parents</option>
                        <option value="all-teachers">All Teachers</option>
                        <option value="all-students">All Students</option>
                    </select>
                    <button class="btn-primary" onclick="submitAnnouncement()"><i class="fas fa-bullhorn"></i> Send Announcement</button>
                </div>
            </div>
        </div>
        <div class="dashboard-card">
            <div class="card-header">
                <h3><i class="fas fa-list"></i> Recent Announcements</h3>
            </div>
            <div id="announcements-list" style="padding: 20px;">Loading...</div>
        </div>
    `;
    refreshAnnouncements();
}

function loadIntegrationsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Integrations</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-plug" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Integration features coming soon</h3></div></div>';
}

// ========== UI INTERACTIONS ==========
function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    if (panel) panel.classList.toggle('open');
}

function toggleUserMenu() {
    const menu = document.getElementById('user-menu-dropdown');
    if (menu) menu.classList.toggle('open');
}

async function refreshParentsPage() {
    const container = document.getElementById('parents-table-container');
    if (!container) return;
    container.innerHTML = 'Loading parent accounts...';
    try {
        const data = await adminApiCall('/users?role=parent&limit=300');
        const parents = data.users || [];
        const count = document.getElementById('parents-count');
        if (count) count.textContent = `${parents.length} parents`;

        if (parents.length === 0) {
            container.innerHTML = '<div style="padding: 20px; color: var(--text-secondary); text-align: center;">No parent accounts found.</div>';
            return;
        }

        container.innerHTML = `
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 12px; text-align:left;">Name</th>
                        <th style="padding: 12px; text-align:left;">Email</th>
                        <th style="padding: 12px; text-align:left;">Phone</th>
                        <th style="padding: 12px; text-align:left;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${parents.map(parent => {
                        const name = `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || parent.name || 'Unnamed Parent';
                        return `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px;">${escapeHtml(name)}</td>
                                <td style="padding: 12px;">${escapeHtml(parent.email || '-')}</td>
                                <td style="padding: 12px;">${escapeHtml(parent.phoneNumber || '-')}</td>
                                <td style="padding: 12px;">${parent.isActive ? '<span style="color:#166534;">Active</span>' : '<span style="color:#991b1b;">Inactive</span>'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div style="padding: 20px; color: #991b1b;">Failed to load parents: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshStaffPage() {
    const container = document.getElementById('staff-table-container');
    if (!container) return;
    container.innerHTML = 'Loading staff...';
    try {
        const data = await adminApiCall('/users?role=teacher&limit=300');
        const staff = data.users || [];

        if (staff.length === 0) {
            container.innerHTML = '<div style="padding: 20px; color: var(--text-secondary); text-align: center;">No teacher staff found.</div>';
            return;
        }

        container.innerHTML = `
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 12px; text-align:left;">Teacher</th>
                        <th style="padding: 12px; text-align:left;">Email</th>
                        <th style="padding: 12px; text-align:left;">Current Tier</th>
                        <th style="padding: 12px; text-align:left;">Set Tier</th>
                        <th style="padding: 12px; text-align:left;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${staff.map(user => {
                        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Unnamed Teacher';
                        const currentTier = user.roleHierarchy && TEACHER_TIER_LEVELS[user.roleHierarchy] ? user.roleHierarchy : 'Avg';
                        const options = Object.keys(TEACHER_TIER_LEVELS)
                            .map(tier => `<option value="${tier}" ${tier === currentTier ? 'selected' : ''}>${TEACHER_TIER_LEVELS[tier].label}</option>`)
                            .join('');
                        return `
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px;">${escapeHtml(name)}</td>
                                <td style="padding: 12px;">${escapeHtml(user.email || '-')}</td>
                                <td style="padding: 12px;">${escapeHtml(currentTier)}</td>
                                <td style="padding: 12px;">
                                    <select id="tier-${user._id}" style="padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 6px;">
                                        ${options}
                                    </select>
                                </td>
                                <td style="padding: 12px;">
                                    <button class="btn-primary" onclick="updateTeacherTier('${user._id}')">Save Tier</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div style="padding: 20px; color: #991b1b;">Failed to load staff: ${escapeHtml(error.message)}</div>`;
    }
}

async function updateTeacherTier(userId) {
    const select = document.getElementById(`tier-${userId}`);
    if (!select) return;
    const roleHierarchy = select.value;
    const permissionLevel = TEACHER_TIER_LEVELS[roleHierarchy]?.permissionLevel || 'General';
    try {
        await adminApiCall(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ roleHierarchy, permissionLevel })
        });
        showToast(`Updated teacher tier to ${roleHierarchy}`);
        await refreshStaffPage();
    } catch (error) {
        showToast(`Failed to update tier: ${error.message}`, 'error');
    }
}

async function refreshAdminMessages(folder) {
    const list = document.getElementById('admin-messages-list');
    if (!list) return;
    const selectedFolder = folder || document.getElementById('admin-message-folder')?.value || 'inbox';
    list.innerHTML = 'Loading messages...';
    try {
        const data = await adminApiCall(`/messages?folder=${encodeURIComponent(selectedFolder)}&limit=100`);
        const messages = data.messages || [];
        if (messages.length === 0) {
            list.innerHTML = `<div style="padding: 20px; color: var(--text-secondary); text-align: center;">No messages in ${escapeHtml(selectedFolder)}.</div>`;
            return;
        }

        list.innerHTML = messages.map(msg => {
            const sender = msg.sender ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() : 'System';
            return `
                <div style="border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; margin-bottom: 10px;">
                    <div style="display:flex; justify-content:space-between; gap: 8px; flex-wrap: wrap;">
                        <strong>${escapeHtml(msg.subject || '(No Subject)')}</strong>
                        <small style="color: var(--text-secondary);">${new Date(msg.sentAt || msg.createdAt || Date.now()).toLocaleString()}</small>
                    </div>
                    <div style="color: var(--text-secondary); margin-top: 4px;">From: ${escapeHtml(sender || 'Unknown')}</div>
                    <div style="margin-top: 8px;">${escapeHtml((msg.body || '').slice(0, 220))}${(msg.body || '').length > 220 ? '...' : ''}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        list.innerHTML = `<div style="padding: 20px; color: #991b1b;">Failed to load messages: ${escapeHtml(error.message)}</div>`;
    }
}

function openComposeAdminMessageModal() {
    const content = `
        <div style="display:grid; gap: 10px;">
            <select id="compose-target" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                <option value="all-parents">All Parents</option>
                <option value="all-teachers">All Teachers</option>
                <option value="all-students">All Students</option>
            </select>
            <input id="compose-subject" type="text" placeholder="Subject" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
            <textarea id="compose-body" rows="5" placeholder="Message" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;"></textarea>
        </div>
    `;
    showModal('Compose Message', content, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Send', type: 'primary', action: 'submitAdminMessage()' }
    ]);
}

async function submitAdminMessage() {
    const targetGroup = document.getElementById('compose-target')?.value;
    const subject = document.getElementById('compose-subject')?.value?.trim();
    const body = document.getElementById('compose-body')?.value?.trim();
    if (!subject || !body) {
        showToast('Subject and message are required', 'error');
        return;
    }

    try {
        await adminApiCall('/messages/broadcast', {
            method: 'POST',
            body: JSON.stringify({
                targetGroup,
                subject,
                body,
                priority: 'Normal',
                category: 'General'
            })
        });
        closeModal();
        showToast('Message sent successfully');
        await refreshAdminMessages('sent');
    } catch (error) {
        showToast(`Failed to send message: ${error.message}`, 'error');
    }
}

async function submitAnnouncement() {
    const subject = document.getElementById('announcement-subject')?.value?.trim();
    const body = document.getElementById('announcement-body')?.value?.trim();
    const targetGroup = document.getElementById('announcement-target')?.value;

    if (!subject || !body) {
        showToast('Announcement title and message are required', 'error');
        return;
    }

    try {
        await adminApiCall('/messages/broadcast', {
            method: 'POST',
            body: JSON.stringify({
                subject,
                body,
                targetGroup,
                priority: 'High',
                category: 'Announcement'
            })
        });
        document.getElementById('announcement-subject').value = '';
        document.getElementById('announcement-body').value = '';
        showToast('Announcement sent');
        await refreshAnnouncements();
    } catch (error) {
        showToast(`Failed to send announcement: ${error.message}`, 'error');
    }
}

async function refreshAnnouncements() {
    const list = document.getElementById('announcements-list');
    if (!list) return;
    list.innerHTML = 'Loading announcements...';
    try {
        const data = await adminApiCall('/messages?folder=sent&category=Announcement&limit=100');
        const announcements = data.messages || [];

        if (announcements.length === 0) {
            list.innerHTML = '<div style="padding: 20px; color: var(--text-secondary); text-align: center;">No announcements sent yet.</div>';
            return;
        }

        list.innerHTML = announcements.map(item => `
            <div style="border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; margin-bottom: 10px;">
                <div style="display:flex; justify-content:space-between; gap: 8px; flex-wrap: wrap;">
                    <strong>${escapeHtml(item.subject || 'Announcement')}</strong>
                    <small style="color: var(--text-secondary);">${new Date(item.sentAt || item.createdAt || Date.now()).toLocaleString()}</small>
                </div>
                <div style="margin-top: 8px;">${escapeHtml(item.body || '')}</div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = `<div style="padding: 20px; color: #991b1b;">Failed to load announcements: ${escapeHtml(error.message)}</div>`;
    }
}

function getDefaultPeriodSchedule() {
    return [
        { periodNumber: 1, startTime: '09:00', endTime: '09:40' },
        { periodNumber: 2, startTime: '09:40', endTime: '10:20' },
        { periodNumber: 3, startTime: '10:20', endTime: '11:00' },
        { periodNumber: 4, startTime: '11:15', endTime: '11:55' },
        { periodNumber: 5, startTime: '11:55', endTime: '12:35' },
        { periodNumber: 6, startTime: '13:15', endTime: '13:55' },
        { periodNumber: 7, startTime: '13:55', endTime: '14:35' }
    ];
}

async function refreshAdminTimetables() {
    const list = document.getElementById('admin-timetables-list');
    if (!list) return;
    list.innerHTML = 'Loading timetables...';
    try {
        const data = await adminApiCall('/timetable?limit=200');
        const timetables = data.timetables || [];
        if (timetables.length === 0) {
            list.innerHTML = '<div style="padding: 20px; color: var(--text-secondary); text-align: center;">No timetables found.</div>';
            return;
        }
        list.innerHTML = timetables.map(tt => {
            const className = tt.class?.name || 'Unassigned Class';
            const teacherName = tt.teacher ? `${tt.teacher.firstName || ''} ${tt.teacher.lastName || ''}`.trim() : 'Not assigned';
            const periods = (tt.schedule || []).reduce((sum, day) => sum + ((day.periods || []).length), 0);
            return `
                <div style="border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; margin-bottom: 10px;">
                    <div style="display:flex; justify-content:space-between; gap: 8px; flex-wrap: wrap;">
                        <strong>${escapeHtml(className)} - ${escapeHtml(tt.term || 'Term')}</strong>
                        <span style="padding: 3px 10px; border-radius: 999px; background: #eef2ff; color: #3730a3;">${escapeHtml(tt.status || 'Draft')}</span>
                    </div>
                    <div style="color: var(--text-secondary); margin-top: 4px;">Teacher: ${escapeHtml(teacherName || 'Not assigned')} | Year: ${escapeHtml(tt.academicYear || '-')}</div>
                    <div style="margin-top: 6px;">Total scheduled periods: ${periods}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        list.innerHTML = `<div style="padding: 20px; color: #991b1b;">Failed to load timetables: ${escapeHtml(error.message)}</div>`;
    }
}

async function openCreateTimetableModal() {
    try {
        const [classesData, teachersData] = await Promise.all([
            adminApiCall('/classes?limit=300').catch(() => ({ classes: [] })),
            adminApiCall('/teachers?limit=300').catch(() => ([]))
        ]);

        const classes = classesData.classes || [];
        const teachers = Array.isArray(teachersData) ? teachersData : (teachersData.teachers || []);

        const content = `
            <div style="display:grid; gap: 10px;">
                <select id="tt-create-class" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    <option value="">Select class</option>
                    ${classes.map(c => `<option value="${c._id}">${escapeHtml(c.name || 'Class')}</option>`).join('')}
                </select>
                <select id="tt-create-teacher" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    <option value="">Optional teacher</option>
                    ${teachers.map(t => `<option value="${t._id}">${escapeHtml(`${t.firstName || ''} ${t.lastName || ''}`.trim() || t.email || 'Teacher')}</option>`).join('')}
                </select>
                <input id="tt-create-year" type="text" value="${new Date().getFullYear()}-${new Date().getFullYear() + 1}" placeholder="Academic year" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                <select id="tt-create-term" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                </select>
                <textarea id="tt-create-notes" rows="3" placeholder="Optional notes" style="padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;"></textarea>
                <small style="color: var(--text-secondary);">Creates a draft timetable with standard period times for Monday to Friday.</small>
            </div>
        `;

        showModal('Create Timetable', content, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Create Draft', type: 'primary', action: 'submitCreateAdminTimetable()' }
        ]);
    } catch (error) {
        showToast(`Failed to open timetable creator: ${error.message}`, 'error');
    }
}

async function submitCreateAdminTimetable() {
    const classId = document.getElementById('tt-create-class')?.value;
    const teacherId = document.getElementById('tt-create-teacher')?.value;
    const academicYear = document.getElementById('tt-create-year')?.value?.trim();
    const term = document.getElementById('tt-create-term')?.value;
    const notes = document.getElementById('tt-create-notes')?.value?.trim();

    if (!classId || !academicYear || !term) {
        showToast('Class, academic year, and term are required', 'error');
        return;
    }

    const basePeriods = getDefaultPeriodSchedule();
    const schedule = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
        day,
        periods: basePeriods.map(period => ({
            periodNumber: period.periodNumber,
            startTime: period.startTime,
            endTime: period.endTime,
            teacher: teacherId || undefined
        }))
    }));

    try {
        await adminApiCall('/timetable', {
            method: 'POST',
            body: JSON.stringify({
                class: classId,
                teacher: teacherId || undefined,
                academicYear,
                term,
                schedule,
                effectiveFrom: new Date().toISOString(),
                notes: notes || undefined
            })
        });
        closeModal();
        showToast('Draft timetable created');
        await refreshAdminTimetables();
    } catch (error) {
        showToast(`Failed to create timetable: ${error.message}`, 'error');
    }
}

async function refreshClassesPage() {
    const container = document.getElementById('classes-page-list');
    if (!container) return;
    container.innerHTML = 'Loading classes...';
    try {
        const data = await adminApiCall('/classes?limit=300');
        const classes = data.classes || [];
        if (classes.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No classes found.</div>';
            return;
        }
        container.innerHTML = `
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 12px; text-align:left;">Class</th>
                        <th style="padding: 12px; text-align:left;">Year</th>
                        <th style="padding: 12px; text-align:left;">Section</th>
                        <th style="padding: 12px; text-align:left;">Room</th>
                        <th style="padding: 12px; text-align:left;">Students</th>
                    </tr>
                </thead>
                <tbody>
                    ${classes.map(cls => `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 12px;">${escapeHtml(cls.name || '-')}</td>
                            <td style="padding: 12px;">${escapeHtml(String(cls.year || cls.yearGroup || '-'))}</td>
                            <td style="padding: 12px;">${escapeHtml(cls.section || '-')}</td>
                            <td style="padding: 12px;">${escapeHtml(cls.room || '-')}</td>
                            <td style="padding: 12px;">${Array.isArray(cls.students) ? cls.students.length : 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load classes: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshAnalyticsPage() {
    const container = document.getElementById('analytics-summary');
    if (!container) return;
    container.innerHTML = '<div>Loading analytics...</div>';
    try {
        const [students, teachers, classes, messages] = await Promise.all([
            adminApiCall('/students?limit=1').catch(() => ({ total: 0 })),
            adminApiCall('/teachers?limit=300').catch(() => []),
            adminApiCall('/classes?limit=1').catch(() => ({ total: 0 })),
            adminApiCall('/messages?folder=inbox&limit=1').catch(() => ({ total: 0 }))
        ]);

        const teacherCount = Array.isArray(teachers) ? teachers.length : (teachers.total || 0);
        const cards = [
            { label: 'Students', value: students.total || (students.students || []).length || 0, icon: 'fa-user-graduate', color: 'blue' },
            { label: 'Teachers', value: teacherCount, icon: 'fa-chalkboard-teacher', color: 'green' },
            { label: 'Classes', value: classes.total || (classes.classes || []).length || 0, icon: 'fa-door-open', color: 'orange' },
            { label: 'Inbox Messages', value: messages.total || (messages.messages || []).length || 0, icon: 'fa-envelope', color: 'purple' }
        ];

        container.innerHTML = cards.map(card => `
            <div class="stat-card ${card.color}">
                <div class="stat-icon"><i class="fas ${card.icon}"></i></div>
                <div class="stat-info">
                    <span class="stat-label">${card.label}</span>
                    <span class="stat-value">${card.value}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load analytics: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshCalendarPage() {
    const container = document.getElementById('calendar-list');
    if (!container) return;
    container.innerHTML = 'Loading schedule...';
    try {
        const data = await adminApiCall('/lessons?limit=100');
        const lessons = data.lessons || data || [];
        if (!Array.isArray(lessons) || lessons.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No scheduled lessons found.</div>';
            return;
        }
        container.innerHTML = lessons.slice(0, 25).map(lesson => `
            <div style="border:1px solid var(--border-color);border-radius:10px;padding:12px;margin-bottom:10px;">
                <strong>${escapeHtml(lesson.dayOfWeek || 'Day')} - Period ${escapeHtml(String(lesson.period?.name || lesson.period?.order || '-'))}</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">Class: ${escapeHtml(lesson.class?.name || '-')} | Subject: ${escapeHtml(lesson.subject?.name || '-')} | Room: ${escapeHtml(lesson.room?.roomNumber || lesson.room?.roomName || '-')}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load calendar: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshAttendancePage() {
    const container = document.getElementById('attendance-list');
    if (!container) return;
    container.innerHTML = 'Loading attendance...';
    try {
        const data = await adminApiCall('/attendance?limit=50');
        const records = data.attendance || [];
        if (records.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No attendance records found.</div>';
            return;
        }
        container.innerHTML = records.slice(0, 30).map(record => `
            <div style="border-bottom:1px solid var(--border-color);padding:10px 0;">
                <strong>${escapeHtml(record.student?.user?.firstName || '')} ${escapeHtml(record.student?.user?.lastName || '')}</strong>
                <span style="margin-left:8px;">${escapeHtml(record.status || '-')}</span>
                <small style="display:block;color:var(--text-secondary);">${new Date(record.date).toLocaleDateString()} | ${escapeHtml(record.period || 'All Day')}</small>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load attendance: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshBehaviorPage() {
    const container = document.getElementById('behavior-list');
    if (!container) return;
    container.innerHTML = 'Loading behavior logs...';
    try {
        const data = await adminApiCall('/behavior?limit=50');
        const logs = data.behavior || data.logs || [];
        if (!logs.length) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No behavior logs found.</div>';
            return;
        }
        container.innerHTML = logs.slice(0, 30).map(log => `
            <div style="border-bottom:1px solid var(--border-color);padding:10px 0;">
                <strong>${escapeHtml(log.title || log.category || 'Behavior log')}</strong>
                <div style="color:var(--text-secondary);">${escapeHtml(log.type || '-')} | ${escapeHtml(log.severity || 'Low')}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load behavior logs: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshEnrollmentPage() {
    const container = document.getElementById('enrollment-list');
    if (!container) return;
    container.innerHTML = 'Loading enrollments...';
    try {
        const data = await adminApiCall('/enrollments?status=Pending&limit=100');
        const enrollments = data.enrollments || [];
        if (!enrollments.length) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No pending enrollments.</div>';
            return;
        }
        container.innerHTML = enrollments.map(en => `
            <div style="border-bottom:1px solid var(--border-color);padding:10px 0;">
                <strong>${escapeHtml(en.firstName || '')} ${escapeHtml(en.lastName || '')}</strong>
                <div style="color:var(--text-secondary);">${escapeHtml(en.email || '-')} | ${escapeHtml(en.yearGroup || '-')}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load enrollments: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshAssessmentsPage() {
    const container = document.getElementById('assessments-list');
    if (!container) return;
    container.innerHTML = 'Loading assessments...';
    try {
        const data = await adminApiCall('/assessments?limit=100');
        const assessments = data.assessments || [];
        if (!assessments.length) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No assessments found.</div>';
            return;
        }
        container.innerHTML = assessments.slice(0, 30).map(item => `
            <div style="border-bottom:1px solid var(--border-color);padding:10px 0;">
                <strong>${escapeHtml(item.title || '-')}</strong>
                <div style="color:var(--text-secondary);">${escapeHtml(item.type || '-')} | ${escapeHtml(item.subject?.name || '-')} | ${escapeHtml(item.class?.name || '-')}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load assessments: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshSubjectsPage() {
    const container = document.getElementById('subjects-list');
    if (!container) return;
    container.innerHTML = 'Loading subjects...';
    try {
        const data = await adminApiCall('/subjects');
        const subjects = data.subjects || [];
        if (!subjects.length) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No subjects found.</div>';
            return;
        }
        container.innerHTML = subjects.map(subject => `
            <div style="border-bottom:1px solid var(--border-color);padding:10px 0;">
                <strong>${escapeHtml(subject.name || '-')}</strong>
                <div style="color:var(--text-secondary);">Code: ${escapeHtml(subject.code || '-')} | Dept: ${escapeHtml(subject.department || '-')}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load subjects: ${escapeHtml(error.message)}</div>`;
    }
}

async function refreshRoomsPage() {
    const container = document.getElementById('rooms-list');
    if (!container) return;
    container.innerHTML = 'Loading rooms...';
    try {
        const data = await adminApiCall('/rooms?limit=200');
        const rooms = data.rooms || [];
        if (!rooms.length) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">No rooms found.</div>';
            return;
        }
        container.innerHTML = rooms.map(room => `
            <div style="border-bottom:1px solid var(--border-color);padding:10px 0;">
                <strong>${escapeHtml(room.roomNumber || room.roomName || '-')}</strong>
                <div style="color:var(--text-secondary);">Category: ${escapeHtml(room.category || '-')} | Floor: ${escapeHtml(String(room.floor ?? '-'))} | Capacity: ${escapeHtml(String(room.capacity ?? '-'))}</div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = `<div style="color:#991b1b;">Failed to load rooms: ${escapeHtml(error.message)}</div>`;
    }
}

function openQuickActions() {
    const modal = document.getElementById('quick-actions-modal');
    modal.classList.add('open');
}

function closeModal(modalId) {
    if (!modalId) {
        const generic = document.getElementById('portal-generic-modal');
        if (generic) generic.remove();
        return;
    }
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('open');
    }
}

function showModal(title, content, actions = []) {
    const existing = document.getElementById('portal-generic-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'portal-generic-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.45);z-index:10001;display:flex;align-items:center;justify-content:center;padding:16px;';

    overlay.innerHTML = `
        <div style="width:min(720px,95vw); max-height:90vh; overflow:auto; background:white; border-radius:12px; box-shadow:0 20px 50px rgba(0,0,0,0.25);">
            <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid #e5e7eb;">
                <h3 style="margin:0;">${escapeHtml(title)}</h3>
                <button id="portal-generic-modal-close" style="border:none;background:transparent;cursor:pointer;font-size:18px;">&times;</button>
            </div>
            <div style="padding:16px;">${content}</div>
            <div style="display:flex; gap:8px; justify-content:flex-end; padding:12px 16px; border-top:1px solid #e5e7eb;">
                ${actions.map((btn, idx) => `
                    <button data-modal-action-index="${idx}" style="padding:9px 12px; border:none; border-radius:8px; cursor:pointer; ${btn.type === 'primary' ? 'background:#4f46e5;color:#fff;' : 'background:#e5e7eb;color:#111827;'}">${escapeHtml(btn.text || 'Action')}</button>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('portal-generic-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal());

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    overlay.querySelectorAll('[data-modal-action-index]').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.getAttribute('data-modal-action-index'));
            const action = actions[index]?.action;
            if (!action) return;
            try {
                const fn = new Function(action);
                fn();
            } catch (error) {
                console.error('Modal action failed:', error);
            }
        });
    });
}

function quickAction(action) {
    console.log('Quick action:', action);
    closeModal('quick-actions-modal');
    alert(`Opening ${action.replace('-', ' ')} form...`);
}

function handleGlobalSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    const dropdown = document.getElementById('search-results-dropdown');
    
    // Hide dropdown if query is empty
    if (!query) {
        dropdown.innerHTML = '';
        dropdown.style.display = 'none';
        return;
    }
    
    // Perform search if we have data
    const results = performGlobalSearch(query);
    
    if (results.length === 0) {
        dropdown.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-secondary);">No results found</div>';
        dropdown.style.display = 'block';
        return;
    }
    
    // Build results HTML
    let resultHTML = '<div style="padding: 8px;">';
    
    // Group results by type
    const studentResults = results.filter(r => r.type === 'student');
    const teacherResults = results.filter(r => r.type === 'teacher');
    const classResults = results.filter(r => r.type === 'class');
    
    // Display students
    if (studentResults.length > 0) {
        resultHTML += '<div style="padding: 8px 0;"><div style="padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Students</div>';
        studentResults.forEach(result => {
            resultHTML += `
                <div class="search-result-item" data-id="${result.id}" data-type="student" style="padding: 12px 12px; cursor: pointer; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                    <div style="font-weight: 500; color: var(--text-primary);">${result.highlight}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${result.subtitle}</div>
                </div>
            `;
        });
        resultHTML += '</div>';
    }
    
    // Display teachers
    if (teacherResults.length > 0) {
        resultHTML += '<div style="padding: 8px 0; border-top: 1px solid var(--border-color);"><div style="padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Teachers</div>';
        teacherResults.forEach(result => {
            resultHTML += `
                <div class="search-result-item" data-id="${result.id}" data-type="teacher" style="padding: 12px 12px; cursor: pointer; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                    <div style="font-weight: 500; color: var(--text-primary);">${result.highlight}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${result.subtitle}</div>
                </div>
            `;
        });
        resultHTML += '</div>';
    }
    
    // Display classes
    if (classResults.length > 0) {
        resultHTML += '<div style="padding: 8px 0; border-top: 1px solid var(--border-color);"><div style="padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase;">Classes</div>';
        classResults.forEach(result => {
            resultHTML += `
                <div class="search-result-item" data-id="${result.id}" data-type="class" style="padding: 12px 12px; cursor: pointer; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                    <div style="font-weight: 500; color: var(--text-primary);">${result.highlight}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${result.subtitle}</div>
                </div>
            `;
        });
        resultHTML += '</div>';
    }
    
    resultHTML += '</div>';
    dropdown.innerHTML = resultHTML;
    dropdown.style.display = 'block';
    
    // Add click handlers to results
    dropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            const type = item.getAttribute('data-type');
            handleSearchResultClick(type, id);
        });
    });
}

function performGlobalSearch(query) {
    const results = [];
    const maxResults = 10;
    
    // Helper function to check if text contains the query as consecutive characters
    function containsConsecutive(text, query) {
        text = text.toLowerCase();
        let queryIndex = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === query[queryIndex]) {
                queryIndex++;
                if (queryIndex === query.length) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Helper function to highlight matched characters
    function highlightMatch(text, query) {
        const textLower = text.toLowerCase();
        let queryIndex = 0;
        let highlighted = '';
        let lastIndex = 0;
        
        for (let i = 0; i < textLower.length; i++) {
            if (queryIndex < query.length && textLower[i] === query[queryIndex]) {
                highlighted += text.substring(lastIndex, i);
                highlighted += `<mark style="background-color: #FCD34D; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${text[i]}</mark>`;
                lastIndex = i + 1;
                queryIndex++;
            }
        }
        highlighted += text.substring(lastIndex);
        return highlighted;
    }
    
    // Search students
    allStudentsData.forEach(student => {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`;
        const studentId = student.studentId || '';
        const email = student.email || '';
        
        if (containsConsecutive(fullName, query) || containsConsecutive(studentId, query) || containsConsecutive(email, query)) {
            results.push({
                type: 'student',
                id: student._id,
                highlight: highlightMatch(fullName, query),
                subtitle: `${studentId} • Year ${student.yearGroup || 'N/A'}`,
                name: fullName
            });
        }
    });
    
    // Search teachers
    allTeachersData.forEach(teacher => {
        const fullName = `${teacher.firstName || ''} ${teacher.lastName || ''}`;
        const email = teacher.email || '';
        
        if (containsConsecutive(fullName, query) || containsConsecutive(email, query)) {
            results.push({
                type: 'teacher',
                id: teacher._id,
                highlight: highlightMatch(fullName, query),
                subtitle: teacher.subject || 'Teacher',
                name: fullName
            });
        }
    });
    
    // Search classes
    allClassesData.forEach(cls => {
        const className = cls.name || '';
        
        if (containsConsecutive(className, query)) {
            results.push({
                type: 'class',
                id: cls._id,
                highlight: highlightMatch(className, query),
                subtitle: `${cls.yearGroup || 'N/A'} • ${cls.capacity || 0} students`,
                name: className
            });
        }
    });
    
    // Sort by relevance (exact matches first, then by type)
    results.sort((a, b) => {
        const aExact = a.name.toLowerCase() === query;
        const bExact = b.name.toLowerCase() === query;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return 0;
    });
    
    return results.slice(0, maxResults);
}

function handleSearchResultClick(type, id) {
    // Clear the search and hide dropdown
    const searchInput = document.getElementById('global-search');
    searchInput.value = '';
    const dropdown = document.getElementById('search-results-dropdown');
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    
    // Navigate based on type
    if (type === 'student') {
        viewStudent(id);
    } else if (type === 'teacher') {
        viewTeacher(id);
    } else if (type === 'class') {
        // Navigate to class or show class details
        console.log('View class:', id);
    }
}


function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/selector';
}

// ========== UTILITY FUNCTIONS ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'success') {
    // Simple toast notification
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// ========== PLACEHOLDER FUNCTIONS ==========
function loadUserData() {
    // Load user-specific data
    console.log('Loading user data...');
}

function viewStudent(id) { showToast('Viewing student ' + id); }
function editStudent(id) { showToast('Editing student ' + id); }
function deleteStudent(id) { if(confirm('Delete this student?')) showToast('Deleted student ' + id); }
function viewTeacher(id) { showToast('Viewing teacher ' + id); }
function editTeacher(id) { showToast('Editing teacher ' + id); }
function exportStudents() { showToast('Exporting students...'); }
function importStudents() { showToast('Opening import dialog...'); }
function exportTeachers() { showToast('Exporting teachers...'); }
function openAddStudentModal() { showToast('Opening add student form...'); }
function openAddTeacherModal() { showToast('Opening add teacher form...'); }
function openAddUserModal() { showToast('Opening add user form...'); }
function saveCustomization() { showToast('Customization saved!'); }
function resetCustomization() { if(confirm('Reset to default?')) showToast('Reset to defaults'); }
function saveSchoolSettings() { showToast('School settings saved!'); }
function markAllRead() { showToast('All notifications marked as read'); }
function handleLogoUpload(e) { 
    const file = e.target.files[0];
    if (file) {
        showToast('Logo uploaded: ' + file.name);
    }
}

console.log('Admin Portal JavaScript loaded successfully');
