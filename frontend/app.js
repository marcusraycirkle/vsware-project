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
        // Load recent activity
        loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
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
    showSuccess('Student profile feature coming soon!');
    // TODO: Implement student profile view
}

function addStudent() {
    showSuccess('Add student feature coming soon!');
    // TODO: Implement add student modal
}

function exportStudents() {
    showSuccess('Export functionality coming soon!');
    // TODO: Implement CSV export
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
    showSuccess('Teacher profile feature coming soon!');
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
    showSuccess('Class details feature coming soon!');
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

function bookRoom(roomId) {
    showSuccess('Room booking feature coming soon!');
}

// ========== BEHAVIOR & ATTENDANCE ==========
function takeAttendance() {
    showSuccess('Attendance feature coming soon!');
}

function logPositiveBehavior() {
    showSuccess('Log positive behavior feature coming soon!');
}

function logIncident() {
    showSuccess('Log incident feature coming soon!');
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
function addTeacher() { showSuccess('Feature coming soon!'); }
function exportData(type) { showSuccess(`Export ${type} coming soon!`); }
function sendMessage() { showSuccess('Messaging feature coming soon!'); }
function generateReport() { showSuccess('Report generation coming soon!'); }

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
