// ========== ADMIN PORTAL JAVASCRIPT ==========
// MISpal Administrator Portal - Complete Management System

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://vsware-project.vercel.app/api';

let currentUser = null;
let authToken = null;
let currentSchoolId = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Portal Initializing...');
    initializeAuth();
    setupEventListeners();
    loadUserData();
});

function initializeAuth() {
    authToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            updateUserDisplay();
        } catch (e) {
            console.error('Failed to parse user data:', e);
        }
    }
    
    // Redirect to login if not authenticated
    if (!authToken && window.location.pathname === '/admin') {
        window.location.href = '/selector';
    }
}

function updateUserDisplay() {
    if (currentUser) {
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');
        
        if (userName) userName.textContent = currentUser.name || 'Admin User';
        if (userRole) userRole.textContent = currentUser.role || 'Principal';
    }
}

function setupEventListeners() {
    // Global search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(handleGlobalSearch, 300));
    }
}

// ========== NAVIGATION ==========
let sidebarCollapsed = false;

function toggleSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
    }
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
                <button class="btn-secondary" onclick="exportStudents()">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn-secondary" onclick="importStudents()">
                    <i class="fas fa-upload"></i> Import
                </button>
                <button class="btn-primary" onclick="openAddStudentModal()">
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
            renderStudentsTable(students);
        } else {
            // Show mock data for demo
            const mockStudents = generateMockStudents(50);
            renderStudentsTable(mockStudents);
        }
    } catch (error) {
        console.error('Error loading students:', error);
        const mockStudents = generateMockStudents(50);
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
                            <button onclick="viewStudent('${student._id}')" style="padding: 8px 12px; background: var(--primary-light); color: var(--primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="editStudent('${student._id}')" style="padding: 8px 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteStudent('${student._id}')" style="padding: 8px 12px; background: #FEE2E2; color: #DC2626; border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
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
                <button class="btn-secondary" onclick="exportTeachers()">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="btn-primary" onclick="openAddTeacherModal()">
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
    const mockTeachers = generateMockTeachers(30);
    renderTeachersTable(mockTeachers);
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
                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
                        <td style="padding: 16px; font-size: 14px; font-weight: 600; color: var(--text-primary);">${teacher.teacherId}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-primary);">${teacher.firstName} ${teacher.lastName}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">${teacher.subject}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">${teacher.email}</td>
                        <td style="padding: 16px; font-size: 14px; color: var(--text-secondary);">${teacher.classes} classes</td>
                        <td style="padding: 16px; text-align: right;">
                            <button onclick="viewTeacher('${teacher._id}')" style="padding: 8px 12px; background: var(--primary-light); color: var(--primary); border: none; border-radius: 6px; cursor: pointer; margin-right: 4px;">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="editTeacher('${teacher._id}')" style="padding: 8px 12px; background: var(--bg-secondary); color: var(--text-primary); border: none; border-radius: 6px; cursor: pointer;">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
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
                <button class="btn-secondary" onclick="resetCustomization()">
                    <i class="fas fa-undo"></i> Reset to Default
                </button>
                <button class="btn-primary" onclick="saveCustomization()">
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
                        <div style="width: 100%; height: 150px; border: 2px dashed var(--border-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="document.getElementById('logo-upload').click()">
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
                <button class="btn-primary" onclick="saveSchoolSettings()">
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
                <button class="btn-primary" onclick="openAddUserModal()">
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
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Messages</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-envelope" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Messaging features coming soon</h3></div></div>';
}

function loadAnnouncementsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Announcements</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-bullhorn" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Announcement features coming soon</h3></div></div>';
}

function loadIntegrationsPage(container) {
    container.innerHTML = '<div class="page-header"><h2 class="page-title">Integrations</h2></div><div class="dashboard-card"><div style="padding: 40px; text-align: center;"><i class="fas fa-plug" style="font-size: 48px; color: var(--gray-300);"></i><h3 style="margin-top: 16px; color: var(--text-secondary);">Integration features coming soon</h3></div></div>';
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
    const query = event.target.value;
    console.log('Searching for:', query);
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

console.log('Admin Portal JavaScript loaded successfully');
