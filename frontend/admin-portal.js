// ========== ADMIN PORTAL JAVASCRIPT ==========
// MISpal Administrator Portal - Complete Management System

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://vsware-project.vercel.app/api';

let currentUser = null;
let authToken = null;
let currentSchoolId = null;

// Global data stores for search
let allStudentsData = [];
let allTeachersData = [];
let allClassesData = [];

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
        
        if (userName) {
            const displayName = currentUser.name || 
                               (currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : '') ||
                               currentUser.firstName || 
                               'Admin User';
            userName.textContent = displayName;
        }
        if (userRole) userRole.textContent = currentUser.role || currentUser.permissionLevel || 'Principal';
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
    // Hide all pages
    const allPages = document.querySelectorAll('.page-content');
    allPages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page content if empty
        if (targetPage.innerHTML.trim() === '') {
            loadPageContent(pageName, targetPage);
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
        case 'emails':
            loadEmailsPage(container);
            break;
        case 'announcements':
            loadAnnouncementsPage(container);
            break;
        case 'integrations':
            loadIntegrationsPage(container);
            break;
        case 'anseo':
            // ANSEO dashboard already has HTML in admin-portal.html
            // Just initialize it
            if (typeof loadANSEODashboard === 'function') {
                setTimeout(() => loadANSEODashboard(), 100);
            }
            break;
        case 'tusla':
            // TUSLA report already has HTML in admin-portal.html
            // Just initialize it
            if (typeof loadTUSLAReport === 'function') {
                setTimeout(() => loadTUSLAReport(), 100);
            }
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
                    <h3><i class="fas fa-calendar"></i> Academic Year & Terms</h3>
                </div>
                <div style="padding: 24px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Current Year</label>
                        <input type="text" value="2025-2026" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                    </div>
                    
                    <div style="border-top: 2px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
                        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary);"><i class="fas fa-calendar-day"></i> Term 1</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Start Date</label>
                                <input type="date" id="term1-start" value="2025-09-01" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">End Date</label>
                                <input type="date" id="term1-end" value="2025-12-22" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            </div>
                        </div>
                    </div>
                    
                    <div style="border-top: 2px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
                        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary);"><i class="fas fa-calendar-day"></i> Term 2</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Start Date</label>
                                <input type="date" id="term2-start" value="2026-01-06" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">End Date</label>
                                <input type="date" id="term2-end" value="2026-03-27" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            </div>
                        </div>
                    </div>
                    
                    <div style="border-top: 2px solid var(--border-color); padding-top: 20px; margin-top: 20px;">
                        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 16px; color: var(--text-primary);"><i class="fas fa-calendar-day"></i> Term 3</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">Start Date</label>
                                <input type="date" id="term3-start" value="2026-04-13" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">End Date</label>
                                <input type="date" id="term3-end" value="2026-06-30" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            </div>
                        </div>
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
                            <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">Michael Murphy</td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">m.murphy@school.ie</td>
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
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">Sarah O'Connor</td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">s.oconnor@school.ie</td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #E0E7FF; color: #3730A3;">Deputy Principal</span>
                            </td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #D1FAE5; color: #065F46;">Active</span>
                            </td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">Today, 8:45 AM</td>
                            <td style="padding: 16px; text-align: right;">
                                <button style="padding: 8px 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">Mary Kelly</td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">m.kelly@school.ie</td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #FEF3C7; color: #92400E;">Secretary</span>
                            </td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #D1FAE5; color: #065F46;">Active</span>
                            </td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">Yesterday, 4:20 PM</td>
                            <td style="padding: 16px; text-align: right;">
                                <button style="padding: 8px 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">Tom Brennan</td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">t.brennan@school.ie</td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #FED7AA; color: #7C2D12;">SNA</span>
                            </td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #D1FAE5; color: #065F46;">Active</span>
                            </td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">Today, 7:15 AM</td>
                            <td style="padding: 16px; text-align: right;">
                                <button style="padding: 8px 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">Patrick Walsh</td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">p.walsh@school.ie</td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #E5E7EB; color: #374151;">Caretaker</span>
                            </td>
                            <td style="padding: 16px;">
                                <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #D1FAE5; color: #065F46;">Active</span>
                            </td>
                            <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">Today, 6:30 AM</td>
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
                <p class="page-subtitle">Manage classes and student assignments</p>
            </div>
            <div class="page-actions">
                <button class="btn-primary">
                    <i class="fas fa-plus"></i> Create Class
                </button>
            </div>
        </div>
        <div class="dashboard-card">
            <div style="padding: 40px; text-align: center;">
                <i class="fas fa-door-open" style="font-size: 48px; color: var(--gray-300);"></i>
                <h3 style="margin-top: 16px; color: var(--text-secondary);">Classes management coming soon</h3>
            </div>
        </div>
    `;
}

function loadAnalyticsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Analytics & Insights</h2>
                <p class="page-subtitle">Comprehensive school performance metrics</p>
            </div>
        </div>
        <div class="dashboard-card">
            <div style="padding: 40px; text-align: center;">
                <i class="fas fa-chart-line" style="font-size: 48px; color: var(--gray-300);"></i>
                <h3 style="margin-top: 16px; color: var(--text-secondary);">Advanced analytics coming soon</h3>
            </div>
        </div>
    `;
}

function loadCalendarPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">School Calendar</h2>
                <p class="page-subtitle">Manage events and important dates</p>
            </div>
            <div class="page-actions">
                <button class="btn-primary">
                    <i class="fas fa-plus"></i> Add Event
                </button>
            </div>
        </div>
        <div class="dashboard-card">
            <div style="padding: 40px; text-align: center;">
                <i class="fas fa-calendar-alt" style="font-size: 48px; color: var(--gray-300);"></i>
                <h3 style="margin-top: 16px; color: var(--text-secondary);">Calendar feature coming soon</h3>
            </div>
        </div>
    `;
}

function loadAttendancePage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Attendance Management</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-calendar-check" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Attendance features coming soon</h3></div></div>';
}

function loadBehaviorPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Behavior Management</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-star" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Behavior tracking coming soon</h3></div></div>';
}

function loadEnrollmentPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Enrollment Management</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-user-plus" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Enrollment features coming soon</h3></div></div>';
}

function loadTimetablePage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Timetable Management</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-clock" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Timetable features coming soon</h3></div></div>';
}

function loadAssessmentsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Assessments</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-file-alt" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Assessment features coming soon</h3></div></div>';
}

function loadSubjectsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Subjects</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-book" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Subject management coming soon</h3></div></div>';
}

function loadRoomsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Room Management</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-building" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Room features coming soon</h3></div></div>';
}

function loadParentsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Parent Management</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-users" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Parent features coming soon</h3></div></div>';
}

function loadStaffPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Staff Management</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-user-tie" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Staff features coming soon</h3></div></div>';
}

function loadMessagesPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title"><i class="fas fa-envelope"></i> Messages</h2>
            <button class="btn-primary" onclick="openComposeModal('message')">
                <i class="fas fa-plus"></i> Compose Message
            </button>
        </div>
        
        <div class="communication-container">
            <div class="comm-sidebar">
                <button class="comm-sidebar-btn active" onclick="switchCommTab('incoming')">
                    <i class="fas fa-inbox"></i> Incoming
                </button>
                <button class="comm-sidebar-btn" onclick="switchCommTab('drafts')">
                    <i class="fas fa-file"></i> Drafts
                </button>
                <button class="comm-sidebar-btn" onclick="switchCommTab('sent')">
                    <i class="fas fa-paper-plane"></i> Sent
                </button>
                <button class="comm-sidebar-btn" onclick="switchCommTab('deleted')">
                    <i class="fas fa-trash"></i> Deleted
                </button>
            </div>
            <div class="comm-main" id="comm-content">
                <!-- Messages will be loaded here -->
            </div>
        </div>
    `;
    
    // Initialize communication system for messages
    if (typeof initCommunicationSystem === 'function') {
        setTimeout(() => initCommunicationSystem(), 100);
    }
}

function loadEmailsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title"><i class="fas fa-paper-plane"></i> Emails</h2>
            <button class="btn-primary" onclick="openComposeModal('email')">
                <i class="fas fa-plus"></i> Compose Email
            </button>
        </div>
        
        <div class="communication-container">
            <div class="comm-sidebar">
                <button class="comm-sidebar-btn active" onclick="switchCommTab('incoming')">
                    <i class="fas fa-inbox"></i> Incoming
                </button>
                <button class="comm-sidebar-btn" onclick="switchCommTab('drafts')">
                    <i class="fas fa-file"></i> Drafts
                </button>
                <button class="comm-sidebar-btn" onclick="switchCommTab('sent')">
                    <i class="fas fa-paper-plane"></i> Sent
                </button>
                <button class="comm-sidebar-btn" onclick="switchCommTab('deleted')">
                    <i class="fas fa-trash"></i> Deleted
                </button>
            </div>
            <div class="comm-main" id="comm-content">
                <!-- Emails will be loaded here -->
            </div>
        </div>
    `;
    
    // Initialize communication system for emails
    if (typeof switchCommType === 'function') {
        setTimeout(() => switchCommType('emails'), 100);
    }
}

function loadAnnouncementsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title"><i class="fas fa-bullhorn"></i> Announcements</h2>
            <button class="btn-primary" onclick="openComposeModal('announcement')">
                <i class="fas fa-plus"></i> New Announcement
            </button>
        </div>
        
        <div id="comm-content" style="padding: 2rem;">
            <!-- Announcements will be loaded here -->
        </div>
    `;
    
    // Initialize communication system for announcements
    if (typeof switchCommType === 'function') {
        setTimeout(() => switchCommType('announcements'), 100);
    }
}

function loadIntegrationsPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2 class="page-title"><i class="fas fa-plug"></i> Integrations</h2>
            <p class="page-subtitle">Connect external services to enhance your school management</p>
        </div>
        
        <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));">
            <!-- SumUp Payment Integration -->
            <div class="dashboard-card" style="position: relative;">
                <div style="padding: 24px;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                        <div style="width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%); display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-credit-card" style="font-size: 28px; color: white;"></i>
                        </div>
                        <div>
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">SumUp Payments</h3>
                            <span style="font-size: 12px; color: var(--text-secondary); background: #fef3c7; padding: 4px 8px; border-radius: 4px; font-weight: 600;">Coming Soon</span>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 16px; line-height: 1.6;">Connect your SumUp account to accept payments for school fees, trips, and events directly through the portal.</p>
                    <button class="btn-secondary" disabled style="width: 100%; opacity: 0.6; cursor: not-allowed;">
                        <i class="fas fa-link"></i> Connect SumUp
                    </button>
                </div>
            </div>
            
            <!-- Microsoft Suite Integration -->
            <div class="dashboard-card" style="position: relative;">
                <div style="padding: 24px;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                        <div style="width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #0078d4 0%, #50e6ff 100%); display: flex; align-items: center; justify-content: center;">
                            <i class="fab fa-microsoft" style="font-size: 28px; color: white;"></i>
                        </div>
                        <div>
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">Microsoft Suite</h3>
                            <span style="font-size: 12px; color: var(--text-secondary); background: #fef3c7; padding: 4px 8px; border-radius: 4px; font-weight: 600;">Coming Soon</span>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 16px; line-height: 1.6;">Connect all your favorite Microsoft apps in one place with Microsoft Suite integration - Teams, OneDrive, Outlook, and more.</p>
                    <button class="btn-secondary" disabled style="width: 100%; opacity: 0.6; cursor: not-allowed;">
                        <i class="fas fa-link"></i> Connect Microsoft
                    </button>
                </div>
            </div>
            
            <!-- Google Sheets Integration (existing) -->
            <div class="dashboard-card" style="position: relative;">
                <div style="padding: 24px;">
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                        <div style="width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #34a853 0%, #fbbc04 100%); display: flex; align-items: center; justify-content: center;">
                            <i class="fab fa-google" style="font-size: 28px; color: white;"></i>
                        </div>
                        <div>
                            <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">Google Sheets</h3>
                            <span style="font-size: 12px; color: var(--text-secondary); background: #d1fae5; padding: 4px 8px; border-radius: 4px; font-weight: 600;">Available</span>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 16px; line-height: 1.6;">Sync enrollment data directly from Google Sheets for easy management and bulk imports.</p>
                    <button class="btn-primary" style="width: 100%;">
                        <i class="fas fa-check-circle"></i> Connected
                    </button>
                </div>
            </div>
            
            <!-- More integrations coming soon -->
            <div class="dashboard-card" style="position: relative; border: 2px dashed var(--border-color); background: var(--gray-50);">
                <div style="padding: 40px; text-align: center;">
                    <i class="fas fa-plus-circle" style="font-size: 48px; color: var(--gray-300); margin-bottom: 16px;"></i>
                    <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);">More Integrations Coming Soon</h3>
                    <p style="font-size: 14px; color: var(--text-secondary);">We're working on bringing you more powerful integrations</p>
                </div>
            </div>
        </div>
    `;
}

// ========== UI INTERACTIONS ==========
function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('open');
}

function toggleUserMenu() {
    const menu = document.getElementById('user-menu-dropdown');
    menu.classList.toggle('open');
}

function openQuickActions() {
    const modal = document.getElementById('quick-actions-modal');
    modal.classList.add('open');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('open');
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
