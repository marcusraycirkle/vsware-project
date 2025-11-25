// ========== CONFIGURATION ==========
const API_URL = '/api'; // Relative URL for same domain
let currentUser = null;
let authToken = null;

// Sound Effects
const sounds = {
    notification: new Audio('https://cdn.pixabay.com/audio/2025/09/02/audio_4e70a465f7.mp3'),
    email: new Audio('https://cdn.pixabay.com/audio/2025/07/09/audio_121db7b43f.mp3'),
    error: new Audio('https://cdn.pixabay.com/audio/2025/10/28/audio_7ce7b3b10b.mp3'),
    success: new Audio('https://cdn.pixabay.com/audio/2023/01/07/audio_cae2a6c2fc.mp3')
};

// Notifications System
let notifications = [];
let notificationCount = 0;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    initializeNotifications();
    loadMockNotifications();
});

function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            const userMenu = document.getElementById('user-menu');
            if (userMenu) userMenu.classList.add('hidden');
        }
        if (!e.target.closest('.notification-bell')) {
            const notifPanel = document.getElementById('notification-panel');
            if (notifPanel) notifPanel.classList.add('hidden');
        }
    });
}
// ========== AUTHENTICATION ==========
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showDashboard();
        loadDashboardData();
    } else {
        showLandingPage();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const pin = document.getElementById('login-pin').value;
    
    await login(email, pin);
}

async function login(email, pin) {
    try {
        showLoading('Logging in...');
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, pin })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('current_user', JSON.stringify(currentUser));
            
            hideLoading();
            showSuccess('Login successful!');
            showDashboard();
            loadDashboardData();
        } else {
            hideLoading();
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        hideLoading();
        showError('Connection error. Please check if the backend is running.');
        console.error('Login error:', error);
    }
}

function quickLogin(email, pin) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-pin').value = pin;
    login(email, pin);
}

function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    authToken = null;
    currentUser = null;
    showLandingPage();
}

// ========== API CALLS ==========
async function apiCall(endpoint, options = {}) {
    try {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ========== PAGE NAVIGATION ==========
function showLandingPage() {
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showLoginPage() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update user display
    if (currentUser) {
        const userName = currentUser.firstName + ' ' + currentUser.lastName;
        document.getElementById('user-display-name').textContent = userName;
        document.getElementById('user-display-role').textContent = currentUser.role || 'User';
    }
}

function showSection(sectionName, subsection = null) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`section-${sectionName}`);
    if (section) {
        section.classList.add('active');
        
        // Load section data
        loadSectionData(sectionName, subsection);
        
        // Handle subsection tabs
        if (subsection) {
            switchTab(sectionName, subsection);
        }
    }
}

function switchTab(section, tab) {
    // Update tab buttons
    const tabs = document.querySelectorAll(`[data-section="${section}"] .tab`);
    tabs.forEach(t => t.classList.remove('active'));
    
    const activeTab = document.querySelector(`[data-section="${section}"][data-tab="${tab}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Show tab content
    const tabContents = document.querySelectorAll(`#section-${section} .tab-content`);
    tabContents.forEach(content => content.classList.remove('active'));
    
    const activeContent = document.getElementById(`${section}-${tab}`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // Load tab-specific data
    loadTabData(section, tab);
}

function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    menu.classList.toggle('hidden');
}

// ========== DATA LOADING ==========
async function loadDashboardData() {
    try {
        // Load stats
        await loadStats();
        // Load houses
        await loadHouses();
        // Load attendance data
        await loadDashboardAttendance();
        // Load recent activity
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadDashboardAttendance() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's attendance
        const attendanceData = await apiCall(`/attendance?date=${today}&limit=1000`);
        
        const attendance = attendanceData.attendance || [];
        
        const present = attendance.filter(a => a.status === 'Present').length;
        const absent = attendance.filter(a => a.status === 'Absent').length;
        const late = attendance.filter(a => a.status === 'Late').length;
        
        document.getElementById('attendance-present').textContent = present;
        document.getElementById('attendance-absent').textContent = absent;
        document.getElementById('attendance-late').textContent = late;
    } catch (error) {
        console.error('Error loading attendance:', error);
        // Set to 0 if error
        document.getElementById('attendance-present').textContent = '0';
        document.getElementById('attendance-absent').textContent = '0';
        document.getElementById('attendance-late').textContent = '0';
    }
}

async function loadStats() {
    try {
        const [students, teachers, classes, rooms] = await Promise.all([
            apiCall('/students?limit=1'),
            apiCall('/teachers'),
            apiCall('/classes'),
            apiCall('/rooms?limit=1')
        ]);
        
        document.getElementById('stat-students').textContent = students.total || 0;
        document.getElementById('stat-teachers').textContent = teachers.length || 0;
        document.getElementById('stat-classes').textContent = classes.length || 0;
        document.getElementById('stat-rooms').textContent = rooms.total || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadHouses() {
    try {
        const students = await apiCall('/students?limit=200');
        const houses = {};
        
        students.students.forEach(student => {
            if (student.house) {
                houses[student.house] = (houses[student.house] || 0) + 1;
            }
        });
        
        const housesGrid = document.getElementById('houses-display');
        if (housesGrid) {
            housesGrid.innerHTML = Object.entries(houses)
                .map(([name, count]) => `
                    <div class="house-card ${name.toLowerCase()}" onclick="filterByHouse('${name}')">
                        <h3>${name}</h3>
                        <p>${count}</p>
                        <small>students</small>
                    </div>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading houses:', error);
    }
}

function loadRecentActivity() {
    // Placeholder for recent activity
    // In production, this would fetch real activity data
}

async function loadSectionData(section, subsection) {
    switch(section) {
        case 'students':
            await loadStudents();
            break;
        case 'teachers':
            await loadTeachers();
            break;
        case 'classes':
            await loadClasses();
            break;
        case 'rooms':
            await loadRooms();
            break;
        case 'overview':
            await loadDashboardData();
            break;
    }
}

async function loadTabData(section, tab) {
    // Load data specific to the tab
    console.log(`Loading ${section} - ${tab}`);
}

// ========== STUDENTS ==========
let allStudents = [];

async function loadStudents() {
    try {
        showLoading('Loading students...');
        const data = await apiCall('/students?limit=200');
        allStudents = data.students || [];
        displayStudents(allStudents);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load students');
        console.error('Error loading students:', error);
    }
}

function displayStudents(students) {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.studentId || 'N/A'}</td>
            <td>
                <strong>${student.firstName} ${student.lastName}</strong>
            </td>
            <td>${student.email}</td>
            <td>Year ${student.yearGroup}</td>
            <td>
                <span class="badge ${getHouseBadgeClass(student.house)}">
                    ${student.house || 'N/A'}
                </span>
            </td>
            <td>
                <span class="badge success">Active</span>
            </td>
            <td>
                <button class="btn-sm btn-primary" onclick="viewStudentProfile('${student._id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

function filterStudents() {
    const search = document.getElementById('student-search').value.toLowerCase();
    const house = document.getElementById('filter-house').value;
    const year = document.getElementById('filter-year').value;
    
    let filtered = allStudents.filter(student => {
        const matchesSearch = !search || 
            student.firstName.toLowerCase().includes(search) ||
            student.lastName.toLowerCase().includes(search) ||
            student.email.toLowerCase().includes(search);
        
        const matchesHouse = !house || student.house === house;
        const matchesYear = !year || student.yearGroup === parseInt(year);
        
        return matchesSearch && matchesHouse && matchesYear;
    });
    
    displayStudents(filtered);
}

function filterByHouse(house) {
    showSection('students', 'list');
    document.getElementById('filter-house').value = house;
    filterStudents();
}

function viewStudentProfile(studentId) {
    loadStudentProfile(studentId);
}

async function loadStudentProfile(studentId) {
    try {
        showLoading('Loading student profile...');
        const student = await apiCall(`/students/${studentId}`);
        hideLoading();
        
        const modalContent = `
            <div class="profile-view">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div>
                        <h2>${student.firstName} ${student.lastName}</h2>
                        <p class="text-muted">Student ID: ${student.studentId || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="profile-sections">
                    <div class="profile-section">
                        <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
                        <div class="info-grid">
                            <div><strong>Email:</strong> ${student.email}</div>
                            <div><strong>Year Group:</strong> Year ${student.yearGroup}</div>
                            <div><strong>House:</strong> <span class="badge ${getHouseBadgeClass(student.house)}">${student.house || 'N/A'}</span></div>
                            <div><strong>Date of Birth:</strong> ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                            <div><strong>Gender:</strong> ${student.gender || 'N/A'}</div>
                            <div><strong>Address:</strong> ${student.address?.street || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h3><i class="fas fa-phone"></i> Contact Information</h3>
                        <div class="info-grid">
                            <div><strong>Phone:</strong> ${student.phone || 'N/A'}</div>
                            <div><strong>Emergency Contact:</strong> ${student.emergencyContact?.name || 'N/A'}</div>
                            <div><strong>Emergency Phone:</strong> ${student.emergencyContact?.phone || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h3><i class="fas fa-graduation-cap"></i> Academic Information</h3>
                        <div class="info-grid">
                            <div><strong>Classes:</strong> ${student.classes?.length || 0}</div>
                            <div><strong>Subjects:</strong> ${student.subjects?.length || 0}</div>
                            <div><strong>Status:</strong> <span class="badge success">Active</span></div>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn-primary" onclick="editStudent('${studentId}')">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                        <button class="btn-primary" onclick="viewStudentAttendance('${studentId}')">
                            <i class="fas fa-calendar-check"></i> View Attendance
                        </button>
                        <button class="btn-primary" onclick="viewStudentBehavior('${studentId}')">
                            <i class="fas fa-star"></i> View Behavior
                        </button>
                        <button class="btn-primary" onclick="viewStudentGrades('${studentId}')">
                            <i class="fas fa-chart-line"></i> View Grades
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Student Profile', modalContent, [
            { text: 'Close', type: 'secondary', action: 'closeModal()' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load student profile');
        console.error(error);
    }
}

function editStudent(studentId) {
    showSuccess('Edit student feature coming soon!');
}

function viewStudentAttendance(studentId) {
    showSuccess('Student attendance details coming soon!');
}

function viewStudentBehavior(studentId) {
    showSuccess('Student behavior details coming soon!');
}

function viewStudentGrades(studentId) {
    showSuccess('Student grades details coming soon!');
}

async function addStudent() {
    const modalContent = `
        <form id="add-student-form">
            <div class="form-grid">
                <div class="input-group">
                    <label><i class="fas fa-id-card"></i> Student ID</label>
                    <input type="text" id="new-student-id" placeholder="e.g., 24001" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-user"></i> First Name *</label>
                    <input type="text" id="new-student-firstname" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-user"></i> Last Name *</label>
                    <input type="text" id="new-student-lastname" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-envelope"></i> Email *</label>
                    <input type="email" id="new-student-email" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-calendar"></i> Date of Birth</label>
                    <input type="date" id="new-student-dob">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-venus-mars"></i> Gender</label>
                    <select id="new-student-gender" class="select-input">
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-graduation-cap"></i> Year Group *</label>
                    <select id="new-student-year" required class="select-input">
                        <option value="">Select year...</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                        <option value="6">Year 6</option>
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-flag"></i> House</label>
                    <select id="new-student-house" class="select-input">
                        <option value="">Select house...</option>
                        <option value="Bride">Bride</option>
                        <option value="Ide">Ide</option>
                        <option value="Tola">Tola</option>
                        <option value="Seanan">Seanan</option>
                        <option value="Padraig">Padraig</option>
                        <option value="Conaire">Conaire</option>
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-phone"></i> Phone</label>
                    <input type="tel" id="new-student-phone">
                </div>
                <div class="input-group full-width">
                    <label><i class="fas fa-map-marker-alt"></i> Address</label>
                    <input type="text" id="new-student-address" placeholder="Street address">
                </div>
            </div>
        </form>
    `;
    
    showModal('Add New Student', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Add Student', type: 'success', action: 'submitNewStudent()', icon: 'fas fa-user-plus' }
    ]);
}

async function submitNewStudent() {
    const studentData = {
        studentId: document.getElementById('new-student-id').value,
        firstName: document.getElementById('new-student-firstname').value,
        lastName: document.getElementById('new-student-lastname').value,
        email: document.getElementById('new-student-email').value,
        dateOfBirth: document.getElementById('new-student-dob').value,
        gender: document.getElementById('new-student-gender').value,
        yearGroup: parseInt(document.getElementById('new-student-year').value),
        house: document.getElementById('new-student-house').value,
        phone: document.getElementById('new-student-phone').value,
        address: {
            street: document.getElementById('new-student-address').value
        }
    };
    
    if (!studentData.firstName || !studentData.lastName || !studentData.email || !studentData.yearGroup) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        closeModal();
        showLoading('Adding student...');
        
        await apiCall('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
        
        hideLoading();
        showSuccess('Student added successfully!');
        
        // Reload students list
        await loadStudents();
    } catch (error) {
        hideLoading();
        showError('Failed to add student: ' + error.message);
        console.error(error);
    }
}

async function exportStudents() {
    try {
        showLoading('Preparing export...');
        
        // Get all students
        const data = await apiCall('/students?limit=1000');
        const students = data.students || [];
        
        if (students.length === 0) {
            hideLoading();
            showError('No students to export');
            return;
        }
        
        // Create CSV content
        const headers = ['Student ID', 'First Name', 'Last Name', 'Email', 'Year Group', 'House', 'Phone', 'Status'];
        const csvRows = [headers.join(',')];
        
        students.forEach(student => {
            const row = [
                student.studentId || '',
                student.firstName || '',
                student.lastName || '',
                student.email || '',
                student.yearGroup || '',
                student.house || '',
                student.phone || '',
                'Active'
            ];
            csvRows.push(row.join(','));
        });
        
        const csvContent = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        hideLoading();
        showSuccess(`Exported ${students.length} students to CSV`);
    } catch (error) {
        hideLoading();
        showError('Failed to export students');
        console.error(error);
    }
}

// ========== TEACHERS ==========
async function loadTeachers() {
    try {
        showLoading('Loading teachers...');
        const teachers = await apiCall('/teachers');
        displayTeachers(teachers);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load teachers');
        console.error('Error loading teachers:', error);
    }
}

function displayTeachers(teachers) {
    const tbody = document.getElementById('teachers-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = teachers.map(teacher => `
        <tr>
            <td><strong>${teacher.firstName} ${teacher.lastName}</strong></td>
            <td>${teacher.email}</td>
            <td>${teacher.subject || 'N/A'}</td>
            <td>
                <span class="badge ${getPermissionBadgeClass(teacher.permissionLevel)}">
                    ${teacher.permissionLevel || 'General'}
                </span>
            </td>
            <td><span class="badge success">Active</span></td>
            <td>
                <button class="btn-sm btn-primary" onclick="viewTeacherProfile('${teacher._id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
}

function viewTeacherProfile(teacherId) {
    loadTeacherProfile(teacherId);
}

async function loadTeacherProfile(teacherId) {
    try {
        showLoading('Loading teacher profile...');
        const teacher = await apiCall(`/teachers/${teacherId}`);
        hideLoading();
        
        const modalContent = `
            <div class="profile-view">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-chalkboard-teacher"></i>
                    </div>
                    <div>
                        <h2>${teacher.firstName} ${teacher.lastName}</h2>
                        <p class="text-muted">${teacher.subject || 'Teacher'}</p>
                    </div>
                </div>
                
                <div class="profile-sections">
                    <div class="profile-section">
                        <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
                        <div class="info-grid">
                            <div><strong>Email:</strong> ${teacher.email}</div>
                            <div><strong>Phone:</strong> ${teacher.phone || 'N/A'}</div>
                            <div><strong>Subject:</strong> ${teacher.subject || 'N/A'}</div>
                            <div><strong>Permission Level:</strong> <span class="badge ${getPermissionBadgeClass(teacher.permissionLevel)}">${teacher.permissionLevel || 'General'}</span></div>
                            <div><strong>Department:</strong> ${teacher.department || 'N/A'}</div>
                            <div><strong>Status:</strong> <span class="badge success">Active</span></div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h3><i class="fas fa-book"></i> Teaching Information</h3>
                        <div class="info-grid">
                            <div><strong>Classes:</strong> ${teacher.classes?.length || 0}</div>
                            <div><strong>Subjects Teaching:</strong> ${teacher.subjects?.length || 0}</div>
                            <div><strong>Form Teacher:</strong> ${teacher.isFormTeacher ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button class="btn-primary" onclick="editTeacher('${teacherId}')">
                            <i class="fas fa-edit"></i> Edit Profile
                        </button>
                        <button class="btn-primary" onclick="viewTeacherTimetable('${teacherId}')">
                            <i class="fas fa-calendar"></i> View Timetable
                        </button>
                        <button class="btn-primary" onclick="viewTeacherClasses('${teacherId}')">
                            <i class="fas fa-book"></i> View Classes
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Teacher Profile', modalContent, [
            { text: 'Close', type: 'secondary', action: 'closeModal()' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load teacher profile');
        console.error(error);
    }
}

function editTeacher(teacherId) {
    showSuccess('Edit teacher feature coming soon!');
}

function viewTeacherTimetable(teacherId) {
    showSuccess('Teacher timetable coming soon!');
}

function viewTeacherClasses(teacherId) {
    showSuccess('Teacher classes coming soon!');
}

// ========== CLASSES ==========
async function loadClasses() {
    try {
        showLoading('Loading classes...');
        const classes = await apiCall('/classes');
        displayClasses(classes);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load classes');
        console.error('Error loading classes:', error);
    }
}

function displayClasses(classes) {
    const grid = document.getElementById('classes-grid');
    if (!grid) return;
    
    grid.innerHTML = classes.map(cls => `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-book-open"></i> ${cls.name}</h3>
            </div>
            <div style="padding: 1.5rem;">
                <p><strong>Year:</strong> ${cls.yearGroup}</p>
                <p><strong>Students:</strong> ${cls.students?.length || 0}</p>
                <p><strong>Teacher:</strong> ${cls.teacher?.firstName || 'TBA'}</p>
                <button class="btn-primary" onclick="viewClass('${cls._id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
}

function viewClass(classId) {
    loadClassDetails(classId);
}

async function loadClassDetails(classId) {
    try {
        showLoading('Loading class details...');
        const classData = await apiCall(`/classes/${classId}`);
        hideLoading();
        
        const studentsHtml = classData.students?.length > 0 
            ? classData.students.map(s => `
                <div class="student-item">
                    <i class="fas fa-user"></i>
                    <span>${s.firstName} ${s.lastName}</span>
                </div>
            `).join('')
            : '<p class="text-muted">No students enrolled</p>';
        
        const modalContent = `
            <div class="class-details-view">
                <div class="class-header">
                    <div class="class-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <div>
                        <h2>${classData.name}</h2>
                        <p class="text-muted">Year ${classData.yearGroup} ${classData.section ? ' - ' + classData.section : ''}</p>
                    </div>
                </div>
                
                <div class="class-sections">
                    <div class="class-section">
                        <h3><i class="fas fa-info-circle"></i> Class Information</h3>
                        <div class="info-grid">
                            <div><strong>Year Group:</strong> ${classData.yearGroup}</div>
                            <div><strong>Section:</strong> ${classData.section || 'N/A'}</div>
                            <div><strong>Capacity:</strong> ${classData.capacity || 'N/A'}</div>
                            <div><strong>Room:</strong> ${classData.room?.roomNumber || 'Not assigned'}</div>
                            <div><strong>Students Enrolled:</strong> ${classData.students?.length || 0}</div>
                            <div><strong>Status:</strong> <span class="badge success">Active</span></div>
                        </div>
                    </div>
                    
                    <div class="class-section">
                        <h3><i class="fas fa-chalkboard-teacher"></i> Teachers</h3>
                        <div class="teachers-list">
                            ${classData.teachers?.length > 0 
                                ? classData.teachers.map(t => `
                                    <div class="teacher-item">
                                        <i class="fas fa-user-tie"></i>
                                        <span>${t.firstName} ${t.lastName} - ${t.subject || 'N/A'}</span>
                                    </div>
                                `).join('')
                                : '<p class="text-muted">No teachers assigned</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="class-section">
                        <h3><i class="fas fa-users"></i> Students (${classData.students?.length || 0})</h3>
                        <div class="students-list" style="max-height: 200px; overflow-y: auto;">
                            ${studentsHtml}
                        </div>
                    </div>
                    
                    <div class="class-actions">
                        <button class="btn-primary" onclick="editClass('${classId}')">
                            <i class="fas fa-edit"></i> Edit Class
                        </button>
                        <button class="btn-primary" onclick="manageClassStudents('${classId}')">
                            <i class="fas fa-users"></i> Manage Students
                        </button>
                        <button class="btn-primary" onclick="viewClassTimetable('${classId}')">
                            <i class="fas fa-calendar"></i> View Timetable
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Class Details', modalContent, [
            { text: 'Close', type: 'secondary', action: 'closeModal()' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load class details');
        console.error(error);
    }
}

function editClass(classId) {
    showSuccess('Edit class feature coming soon!');
}

function manageClassStudents(classId) {
    showSuccess('Manage students feature coming soon!');
}

function viewClassTimetable(classId) {
    showSuccess('Class timetable coming soon!');
}

// ========== ROOMS ==========
async function loadRooms() {
    try {
        showLoading('Loading rooms...');
        const data = await apiCall('/rooms?limit=100');
        displayRooms(data.rooms || []);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load rooms');
        console.error('Error loading rooms:', error);
    }
}

function displayRooms(rooms) {
    const grid = document.getElementById('rooms-grid');
    if (!grid) return;
    
    grid.innerHTML = rooms.map(room => `
        <div class="card">
            <div class="card-header">
                <h3><i class="fas fa-door-open"></i> ${room.roomNumber}</h3>
            </div>
            <div style="padding: 1.5rem;">
                <p><strong>Building:</strong> ${room.building || 'Main'}</p>
                <p><strong>Type:</strong> ${room.type}</p>
                <p><strong>Capacity:</strong> ${room.capacity || 'N/A'}</p>
                <button class="btn-primary" onclick="bookRoom('${room._id}')">
                    <i class="fas fa-calendar-plus"></i> Book
                </button>
            </div>
        </div>
    `).join('');
}

async function bookRoom(roomId) {
    try {
        showLoading('Loading room details...');
        const room = await apiCall(`/rooms/${roomId}`);
        hideLoading();
        
        const modalContent = `
            <div class="room-booking-form">
                <div class="room-info">
                    <h3><i class="fas fa-door-open"></i> ${room.roomNumber} - ${room.roomName}</h3>
                    <p><strong>Category:</strong> ${room.category}</p>
                    <p><strong>Capacity:</strong> ${room.capacity || 'N/A'}</p>
                    <p><strong>Floor:</strong> ${room.floor}</p>
                </div>
                
                <form id="room-booking-form">
                    <div class="input-group">
                        <label><i class="fas fa-calendar"></i> Date *</label>
                        <input type="date" id="booking-date" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-row">
                        <div class="input-group">
                            <label><i class="fas fa-clock"></i> Start Time *</label>
                            <input type="time" id="booking-start-time" required>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-clock"></i> End Time *</label>
                            <input type="time" id="booking-end-time" required>
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <label><i class="fas fa-tag"></i> Purpose *</label>
                        <select id="booking-purpose" required class="select-input">
                            <option value="">Select purpose...</option>
                            <option value="Class">Class</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Exam">Exam</option>
                            <option value="Extra-curricular">Extra-curricular</option>
                            <option value="Event">Event</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div class="input-group">
                        <label><i class="fas fa-align-left"></i> Notes</label>
                        <textarea id="booking-notes" rows="3" placeholder="Additional information..."></textarea>
                    </div>
                </form>
            </div>
        `;
        
        showModal('Book Room', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Check Availability', type: 'info', action: `checkRoomAvailability('${roomId}')`, icon: 'fas fa-search' },
            { text: 'Book Room', type: 'success', action: `submitRoomBooking('${roomId}')`, icon: 'fas fa-check' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load room details');
        console.error(error);
    }
}

async function checkRoomAvailability(roomId) {
    const date = document.getElementById('booking-date').value;
    const startTime = document.getElementById('booking-start-time').value;
    const endTime = document.getElementById('booking-end-time').value;
    
    if (!date || !startTime || !endTime) {
        showError('Please fill in date and time fields');
        return;
    }
    
    try {
        showLoading('Checking availability...');
        const response = await apiCall(`/rooms/${roomId}/availability?date=${date}&startTime=${startTime}&endTime=${endTime}`);
        hideLoading();
        
        if (response.isAvailable) {
            showSuccess('Room is available for the selected time!');
        } else {
            showError('Room is not available. There are conflicting bookings.');
        }
    } catch (error) {
        hideLoading();
        showError('Failed to check availability');
        console.error(error);
    }
}

async function submitRoomBooking(roomId) {
    const date = document.getElementById('booking-date').value;
    const startTime = document.getElementById('booking-start-time').value;
    const endTime = document.getElementById('booking-end-time').value;
    const purpose = document.getElementById('booking-purpose').value;
    const notes = document.getElementById('booking-notes').value;
    
    if (!date || !startTime || !endTime || !purpose) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        closeModal();
        showLoading('Booking room...');
        
        await apiCall(`/rooms/${roomId}/book`, {
            method: 'POST',
            body: JSON.stringify({
                date,
                startTime,
                endTime,
                purpose,
                notes
            })
        });
        
        hideLoading();
        showSuccess('Room booked successfully!');
    } catch (error) {
        hideLoading();
        showError('Failed to book room: ' + error.message);
        console.error(error);
    }
}

// ========== BEHAVIOR & ATTENDANCE ==========
async function takeAttendance() {
    try {
        // Get all classes first
        const classes = await apiCall('/classes');
        
        if (classes.length === 0) {
            showError('No classes found. Please create classes first.');
            return;
        }
        
        // Show class selection modal
        const classOptions = classes.map(c => 
            `<option value="${c._id}">${c.name} - Year ${c.yearGroup}</option>`
        ).join('');
        
        const modalContent = `
            <form id="attendance-form">
                <div class="input-group">
                    <label><i class="fas fa-book"></i> Select Class</label>
                    <select id="attendance-class" required class="select-input">
                        <option value="">Choose a class...</option>
                        ${classOptions}
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-calendar"></i> Date</label>
                    <input type="date" id="attendance-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-clock"></i> Period (optional)</label>
                    <input type="number" id="attendance-period" min="1" max="9" placeholder="e.g., 1">
                </div>
            </form>
        `;
        
        showModal('Take Attendance', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Continue', type: 'primary', action: 'proceedToAttendanceMarking()', icon: 'fas fa-arrow-right' }
        ]);
    } catch (error) {
        showError('Failed to load classes');
        console.error(error);
    }
}

async function proceedToAttendanceMarking() {
    const classId = document.getElementById('attendance-class').value;
    const date = document.getElementById('attendance-date').value;
    const period = document.getElementById('attendance-period').value;
    
    if (!classId) {
        showError('Please select a class');
        return;
    }
    
    try {
        closeModal();
        showLoading('Loading students...');
        
        // Get class with students
        const classData = await apiCall(`/classes/${classId}`);
        
        if (!classData.students || classData.students.length === 0) {
            hideLoading();
            showError('No students found in this class');
            return;
        }
        
        hideLoading();
        
        // Show attendance marking interface
        const studentsHtml = classData.students.map((student, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${student.firstName} ${student.lastName}</strong></td>
                <td>${student.studentId || 'N/A'}</td>
                <td>
                    <select class="attendance-status select-input" data-student-id="${student._id}">
                        <option value="Present">✓ Present</option>
                        <option value="Absent">✗ Absent</option>
                        <option value="Late">⌚ Late</option>
                        <option value="Excused">⚠ Excused</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="attendance-notes" data-student-id="${student._id}" placeholder="Optional notes...">
                </td>
            </tr>
        `).join('');
        
        const modalContent = `
            <div class="attendance-marking-interface">
                <div class="attendance-info">
                    <p><strong>Class:</strong> ${classData.name}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    ${period ? `<p><strong>Period:</strong> ${period}</p>` : ''}
                </div>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student Name</th>
                                <th>ID</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>${studentsHtml}</tbody>
                    </table>
                </div>
                <div class="quick-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn-sm" onclick="markAllPresent()">Mark All Present</button>
                    <button class="btn-sm" onclick="markAllAbsent()">Mark All Absent</button>
                </div>
            </div>
        `;
        
        showModal('Mark Attendance', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Submit Attendance', type: 'success', action: `submitAttendance('${classId}', '${date}', '${period}')`, icon: 'fas fa-check' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load students');
        console.error(error);
    }
}

function markAllPresent() {
    document.querySelectorAll('.attendance-status').forEach(select => {
        select.value = 'Present';
    });
}

function markAllAbsent() {
    document.querySelectorAll('.attendance-status').forEach(select => {
        select.value = 'Absent';
    });
}

async function submitAttendance(classId, date, period) {
    const statusSelects = document.querySelectorAll('.attendance-status');
    const attendanceList = [];
    
    statusSelects.forEach(select => {
        const studentId = select.getAttribute('data-student-id');
        const status = select.value;
        const notesInput = document.querySelector(`.attendance-notes[data-student-id="${studentId}"]`);
        const notes = notesInput ? notesInput.value : '';
        
        attendanceList.push({
            studentId,
            status,
            notes
        });
    });
    
    try {
        closeModal();
        showLoading('Submitting attendance...');
        
        await apiCall('/attendance/bulk', {
            method: 'POST',
            body: JSON.stringify({
                class: classId,
                date,
                period: period || undefined,
                attendanceList
            })
        });
        
        hideLoading();
        showSuccess('Attendance submitted successfully!');
        
        // Refresh attendance data if on attendance tab
        if (document.getElementById('students-attendance').classList.contains('active')) {
            loadAttendanceData();
        }
    } catch (error) {
        hideLoading();
        showError('Failed to submit attendance: ' + error.message);
        console.error(error);
    }
}

async function logPositiveBehavior() {
    await showBehaviorLogModal('Positive');
}

async function logIncident() {
    await showBehaviorLogModal('Negative');
}

async function showBehaviorLogModal(type) {
    try {
        showLoading('Loading data...');
        const [students, classes] = await Promise.all([
            apiCall('/students?limit=200'),
            apiCall('/classes')
        ]);
        hideLoading();
        
        const studentOptions = students.students.map(s => 
            `<option value="${s._id}">${s.firstName} ${s.lastName} (${s.studentId || 'N/A'})</option>`
        ).join('');
        
        const classOptions = classes.map(c => 
            `<option value="${c._id}">${c.name}</option>`
        ).join('');
        
        const categories = type === 'Positive' 
            ? ['Excellent Work', 'Helpfulness', 'Leadership', 'Participation', 'Improvement', 'Other']
            : ['Disruption', 'Late to Class', 'Incomplete Work', 'Disrespect', 'Phone Usage', 'Uniform Violation', 'Fighting', 'Other'];
        
        const severityOptions = type === 'Negative' 
            ? `<option value="Low">Low</option>
               <option value="Medium">Medium</option>
               <option value="High">High</option>
               <option value="Critical">Critical</option>`
            : '';
        
        const modalContent = `
            <form id="behavior-form">
                <div class="input-group">
                    <label><i class="fas fa-user"></i> Student *</label>
                    <select id="behavior-student" required class="select-input">
                        <option value="">Select student...</option>
                        ${studentOptions}
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-book"></i> Class</label>
                    <select id="behavior-class" class="select-input">
                        <option value="">Select class...</option>
                        ${classOptions}
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-tag"></i> Category *</label>
                    <select id="behavior-category" required class="select-input">
                        <option value="">Select category...</option>
                        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                ${type === 'Negative' ? `
                <div class="input-group">
                    <label><i class="fas fa-exclamation-triangle"></i> Severity *</label>
                    <select id="behavior-severity" required class="select-input">
                        ${severityOptions}
                    </select>
                </div>
                ` : ''}
                <div class="input-group">
                    <label><i class="fas fa-heading"></i> Title *</label>
                    <input type="text" id="behavior-title" required placeholder="Brief description">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-align-left"></i> Description *</label>
                    <textarea id="behavior-description" required rows="4" placeholder="Detailed description of the behavior..."></textarea>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-calendar"></i> Date</label>
                    <input type="date" id="behavior-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-star"></i> Points</label>
                    <input type="number" id="behavior-points" value="${type === 'Positive' ? 5 : -5}" step="1">
                </div>
            </form>
        `;
        
        showModal(
            type === 'Positive' ? 'Log Positive Behavior' : 'Log Incident',
            modalContent,
            [
                { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
                { text: 'Submit', type: type === 'Positive' ? 'success' : 'warning', action: `submitBehaviorLog('${type}')`, icon: 'fas fa-check' }
            ]
        );
    } catch (error) {
        hideLoading();
        showError('Failed to load data');
        console.error(error);
    }
}

async function submitBehaviorLog(type) {
    const student = document.getElementById('behavior-student').value;
    const classId = document.getElementById('behavior-class').value;
    const category = document.getElementById('behavior-category').value;
    const title = document.getElementById('behavior-title').value;
    const description = document.getElementById('behavior-description').value;
    const date = document.getElementById('behavior-date').value;
    const points = document.getElementById('behavior-points').value;
    const severity = document.getElementById('behavior-severity')?.value || 'Medium';
    
    if (!student || !category || !title || !description) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        closeModal();
        showLoading('Submitting behavior log...');
        
        await apiCall('/behavior', {
            method: 'POST',
            body: JSON.stringify({
                student,
                class: classId || undefined,
                type,
                category,
                severity,
                title,
                description,
                date,
                points: parseInt(points)
            })
        });
        
        hideLoading();
        showSuccess('Behavior logged successfully!');
    } catch (error) {
        hideLoading();
        showError('Failed to log behavior: ' + error.message);
        console.error(error);
    }
}

// ========== HELPER FUNCTIONS ==========
function getHouseBadgeClass(house) {
    const houseClasses = {
        'Bride': 'danger',
        'Ide': 'info',
        'Tola': 'success',
        'Seanan': 'warning',
        'Padraig': 'info',
        'Conaire': 'danger'
    };
    return houseClasses[house] || 'info';
}

function getPermissionBadgeClass(permission) {
    const permClasses = {
        'Admin': 'danger',
        'Editor': 'warning',
        'General': 'info'
    };
    return permClasses[permission] || 'info';
}

// ========== UI FEEDBACK ==========
function showLoading(message = 'Loading...') {
    showLoadingModal(message);
}

function hideLoading() {
    hideLoadingModal();
}

function showSuccess(message) {
    showNotification(message, 'success');
    playNotificationSound('success');
}

function showError(message) {
    showNotification(message, 'error');
    playNotificationSound('error');
}

function showNotification(message, type = 'info') {
    // Add to notification center
    addNotification({
        type: type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        message: message,
        timestamp: Date.now()
    });
    
    // Show toast
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        min-width: 300px;
        max-width: 400px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 1rem;
    `;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" style="font-size: 1.5rem;"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ========== NOTIFICATION SYSTEM ==========
function initializeNotifications() {
    notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    updateNotificationBadge();
}

function loadMockNotifications() {
    // Add some demo notifications if none exist
    if (notifications.length === 0) {
        addNotification({
            type: 'info',
            title: 'Welcome to CompMIS!',
            message: 'Explore all the features of your new school management system.',
            timestamp: Date.now()
        });
        
        addNotification({
            type: 'warning',
            title: 'Attendance Reminder',
            message: '5 students are absent today. Please review attendance records.',
            timestamp: Date.now() - 3600000
        });
        
        addNotification({
            type: 'success',
            title: 'Report Generated',
            message: 'Your monthly academic report is ready for download.',
            timestamp: Date.now() - 7200000
        });
    }
}

function addNotification(notification) {
    notification.id = Date.now() + Math.random();
    notification.read = false;
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (notifications.length > 50) {
        notifications = notifications.slice(0, 50);
    }
    
    saveNotifications();
    updateNotificationBadge();
    
    // Play sound based on type
    playNotificationSound(notification.type);
}

function playNotificationSound(type) {
    try {
        let sound;
        switch(type) {
            case 'email':
                sound = sounds.email;
                break;
            case 'error':
            case 'danger':
                sound = sounds.error;
                break;
            case 'success':
                sound = sounds.success;
                break;
            default:
                sound = sounds.notification;
        }
        sound.volume = 0.3;
        sound.play().catch(err => console.log('Sound play failed:', err));
    } catch (err) {
        console.log('Sound error:', err);
    }
}

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function updateNotificationBadge() {
    const unreadCount = notifications.filter(n => !n.read).length;
    notificationCount = unreadCount;
    
    const badges = document.querySelectorAll('.notification-badge');
    badges.forEach(badge => {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    });
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;
    
    const isHidden = panel.classList.contains('hidden');
    
    if (isHidden) {
        panel.classList.remove('hidden');
        renderNotifications();
    } else {
        panel.classList.add('hidden');
    }
}

function renderNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="notification-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No notifications</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notifications.map(notif => {
        const time = formatNotificationTime(notif.timestamp);
        const iconClass = getNotificationIcon(notif.type);
        const colorClass = getNotificationColor(notif.type);
        
        return `
            <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
                <div class="notification-icon ${colorClass}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content" onclick="markAsRead('${notif.id}')">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <small>${time}</small>
                </div>
                <button class="notification-close" onclick="removeNotification('${notif.id}')" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'danger': 'fas fa-exclamation-triangle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle',
        'email': 'fas fa-envelope',
        'message': 'fas fa-comment',
        'default': 'fas fa-bell'
    };
    return icons[type] || icons.default;
}

function getNotificationColor(type) {
    const colors = {
        'success': 'notif-success',
        'error': 'notif-error',
        'danger': 'notif-error',
        'warning': 'notif-warning',
        'info': 'notif-info',
        'email': 'notif-email',
        'default': 'notif-info'
    };
    return colors[type] || colors.default;
}

function formatNotificationTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

function markAsRead(notifId) {
    const notif = notifications.find(n => n.id == notifId);
    if (notif && !notif.read) {
        notif.read = true;
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
    }
}

function removeNotification(notifId) {
    notifications = notifications.filter(n => n.id != notifId);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
}

function clearAllNotifications() {
    if (confirm('Clear all notifications?')) {
        notifications = [];
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
        showSuccess('All notifications cleared');
    }
}

function markAllAsRead() {
    notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
    showSuccess('All notifications marked as read');
}

// ========== PLACEHOLDER FUNCTIONS ==========
// These will be implemented as needed
function addTeacher() { 
    showSuccess('Add teacher feature - contact admin to add teachers through the system.'); 
}

function exportData(type) { 
    showSuccess(`Export ${type} - available in respective sections.`); 
}

async function sendMessage() {
    const modalContent = `
        <form id="message-form">
            <div class="input-group">
                <label><i class="fas fa-users"></i> Recipient Type *</label>
                <select id="message-recipient-type" class="select-input" onchange="updateRecipientOptions()" required>
                    <option value="">Select recipient type...</option>
                    <option value="individual">Individual User</option>
                    <option value="class">Class</option>
                    <option value="year">Year Group</option>
                    <option value="house">House</option>
                    <option value="all-students">All Students</option>
                    <option value="all-teachers">All Teachers</option>
                    <option value="all-parents">All Parents</option>
                </select>
            </div>
            
            <div class="input-group" id="recipient-select-container" style="display: none;">
                <label><i class="fas fa-user"></i> Select Recipient *</label>
                <select id="message-recipients" class="select-input" multiple>
                    <!-- Options will be populated dynamically -->
                </select>
            </div>
            
            <div class="input-group">
                <label><i class="fas fa-heading"></i> Subject *</label>
                <input type="text" id="message-subject" required placeholder="Enter message subject">
            </div>
            
            <div class="input-group">
                <label><i class="fas fa-align-left"></i> Message *</label>
                <textarea id="message-body" required rows="6" placeholder="Type your message here..."></textarea>
            </div>
            
            <div class="input-group">
                <label>
                    <input type="checkbox" id="message-priority"> 
                    <span>High Priority</span>
                </label>
            </div>
        </form>
    `;
    
    showModal('Send Message', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Send Message', type: 'primary', action: 'submitMessage()', icon: 'fas fa-paper-plane' }
    ]);
}

async function submitMessage() {
    const recipientType = document.getElementById('message-recipient-type').value;
    const subject = document.getElementById('message-subject').value;
    const body = document.getElementById('message-body').value;
    const priority = document.getElementById('message-priority').checked;
    
    if (!recipientType || !subject || !body) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        closeModal();
        showLoading('Sending message...');
        
        await apiCall('/messages', {
            method: 'POST',
            body: JSON.stringify({
                recipientType,
                subject,
                body,
                priority
            })
        });
        
        hideLoading();
        showSuccess('Message sent successfully!');
    } catch (error) {
        hideLoading();
        showError('Failed to send message: ' + error.message);
        console.error(error);
    }
}

function generateReport() { 
    const modalContent = `
        <form id="report-form">
            <div class="input-group">
                <label><i class="fas fa-file-alt"></i> Report Type *</label>
                <select id="report-type" class="select-input" required>
                    <option value="">Select report type...</option>
                    <option value="academic">Academic Performance</option>
                    <option value="attendance">Attendance Report</option>
                    <option value="behavior">Behavior Report</option>
                    <option value="student-list">Student List</option>
                    <option value="class-summary">Class Summary</option>
                    <option value="house-points">House Points</option>
                </select>
            </div>
            
            <div class="input-group">
                <label><i class="fas fa-calendar"></i> Date Range *</label>
                <div class="form-row">
                    <input type="date" id="report-start-date" required>
                    <input type="date" id="report-end-date" required>
                </div>
            </div>
            
            <div class="input-group">
                <label><i class="fas fa-file"></i> Format *</label>
                <select id="report-format" class="select-input" required>
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="excel">Excel</option>
                </select>
            </div>
        </form>
    `;
    
    showModal('Generate Report', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Generate', type: 'primary', action: 'submitReportGeneration()', icon: 'fas fa-file-download' }
    ]);
}

function submitReportGeneration() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const format = document.getElementById('report-format').value;
    
    if (!reportType || !startDate || !endDate || !format) {
        showError('Please fill in all required fields');
        return;
    }
    
    closeModal();
    showSuccess(`Generating ${reportType} report in ${format} format. This may take a moment...`);
    
    // In a real implementation, this would call the API to generate the report
    setTimeout(() => {
        showSuccess('Report generated successfully! Check your downloads folder.');
    }, 2000);
}

// ========== MODAL & DIALOG UTILITIES ==========
function showModal(title, content, buttons = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
            <button class="modal-close" onclick="closeModal()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            ${content}
        </div>
        ${buttons.length > 0 ? `
            <div class="modal-footer">
                ${buttons.map(btn => `
                    <button class="btn-${btn.type || 'primary'}" onclick="${btn.action}">
                        ${btn.icon ? `<i class="${btn.icon}"></i>` : ''} ${btn.text}
                    </button>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.2s ease-out';
        setTimeout(() => overlay.remove(), 200);
    }
}

function confirmDialog(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'confirm-overlay';
    
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-dialog-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-dialog-buttons">
                <button class="btn-primary" onclick="closeConfirm()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn-danger" onclick="confirmAction()">
                    <i class="fas fa-check"></i> Confirm
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    window.confirmAction = () => {
        closeConfirm();
        onConfirm();
    };
}

function closeConfirm() {
    const overlay = document.getElementById('confirm-overlay');
    if (overlay) overlay.remove();
    delete window.confirmAction;
}

// ========== ENHANCED LOADING STATES ==========
function showLoadingModal(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loading-modal';
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
    `;
    
    overlay.innerHTML = `
        <div class="spinner"></div>
        <p style="margin-top: 1.5rem; font-size: 1.125rem; font-weight: 600;">${message}</p>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    if (modal) modal.remove();
}

// ========== AUDIO PRELOADING ==========
// Preload sounds for better performance
Object.values(sounds).forEach(sound => {
    sound.preload = 'auto';
    sound.load();
});
