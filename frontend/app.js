// ========== CONFIGURATION ==========
// API_URL configuration
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `${window.location.protocol}//${window.location.host}/api`;
let currentUser = null;
let authToken = null;
let currentSchoolId = null;

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
    // Initialize path-based routing
    initializeRouting();
    setupEventListeners();
    initializeNotifications();
    loadMockNotifications();

    // LEGAL DROPDOWN LOGIC
    const legalDropdown = document.querySelector('.legal-dropdown');
    if (legalDropdown) {
        const btn = legalDropdown.querySelector('button');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            legalDropdown.classList.toggle('active');
        });
        // Hide dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!legalDropdown.contains(event.target)) {
                legalDropdown.classList.remove('active');
            }
        });
        // Show loading overlay on legal link click
        const legalLinks = legalDropdown.querySelectorAll('.legal-link');
        legalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                // Navigate directly without loading screen
                window.location.href = href;
            });
        });
    }

    // Landing page reveal animations
    const revealItems = document.querySelectorAll('.reveal-on-scroll');
    if (revealItems.length) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealItems.forEach(item => observer.observe(item));
    }
});

function initializeRouting() {
    // Get current path
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    // Restore auth token and user from localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
        authToken = storedToken;
    }
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
        } catch (e) {
            console.error('Failed to parse stored user:', e);
        }
    }
    
    // Only proceed if we have the expected DOM elements (not on standalone pages)
    const landingPage = document.getElementById('landing-page');
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('dashboard');
    
    // If core elements don't exist, we're on a standalone page (selector, enrolment, etc.)
    if (!landingPage && !loginPage && !dashboard) {
        console.log('Standalone page detected, skipping app.js initialization');
        return;
    }
    
    // Check if we're on a page that requires authentication
    if (currentPath.includes('/shannoncomp/') && !currentPath.includes('/enrolment') && !currentPath.includes('/login')) {
        if (!authToken) {
            // Redirect to login if not authenticated
            console.log('No auth token, redirecting to login');
            window.location.pathname = '/shannoncomp/login';
            return;
        }
    }
    
    // Show appropriate section based on current path
    if (currentPath === '/home' || currentPath === '/' || currentPath === '') {
        showLandingPage();
    } else if (currentPath === '/shannoncomp/login' || currentPath.includes('/login')) {
        showLoginPage();
    } else if (currentPath.includes('/shannoncomp/') && authToken) {
        showDashboard();
        // Extract page name from URL
        const pathParts = currentPath.split('/');
        const page = pathParts[pathParts.length - 1] || 'overview';
        if (page && page !== 'shannoncomp') {
            setTimeout(() => showSection(page), 100);
        }
    }
}

// Navigation function using path-based routing
function navigateTo(path) {
    window.location.pathname = path;
}

function showLandingPage() {
    const landingPage = document.getElementById('landing-page');
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('dashboard');
    
    if (landingPage) landingPage.style.display = 'block';
    if (loginPage) loginPage.style.display = 'none';
    if (dashboard) dashboard.classList.add('hidden');
}

function showLoginPage() {
    const landingPage = document.getElementById('landing-page');
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('dashboard');
    
    if (landingPage) landingPage.style.display = 'none';
    if (loginPage) loginPage.style.display = 'flex';
    if (dashboard) dashboard.classList.add('hidden');
}



function setupEventListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup quick login buttons (for CSP compliance - no inline onclick)
    document.querySelectorAll('.quick-login-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = btn.getAttribute('data-email');
            const pin = btn.getAttribute('data-pin');
            if (email && pin) {
                quickLogin(email, pin);
            }
        });
    });
    
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

    // Modern Dashboard Sidebar Navigation
    const sidebarToggle = document.getElementById('sidebar-toggle-btn');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('dashboard-sidebar');
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
                localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
            }
        });
    }

    const sidebar = document.getElementById('dashboard-sidebar');
    if (sidebar) {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) sidebar.classList.add('collapsed');
    }

    const addClassBtn = document.getElementById('add-class-btn');
    if (addClassBtn) {
        addClassBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addClass();
        });
    }

    const addRoomBtn = document.getElementById('add-room-btn');
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', (e) => {
            e.preventDefault();
            addRoom();
        });
    }

    const addAssignmentBtn = document.getElementById('add-assignment-btn');
    if (addAssignmentBtn) {
        addAssignmentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            createAssignment();
        });
    }

    const createLessonBtn = document.getElementById('create-lesson-btn');
    if (createLessonBtn) {
        createLessonBtn.addEventListener('click', (e) => {
            e.preventDefault();
            createLesson();
        });
    }

    const createPeriodBtn = document.getElementById('create-period-btn');
    if (createPeriodBtn) {
        createPeriodBtn.addEventListener('click', (e) => {
            e.preventDefault();
            createPeriod();
        });
    }

    // Sidebar nav items
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            if (section) {
                // Remove active from all items
                navItems.forEach(n => n.classList.remove('active'));
                // Add active to clicked item
                item.classList.add('active');
                // Show section
                showSection(section);
            }
        });
    });

    // Notification bell
    const notificationBell = document.getElementById('notification-bell-btn');
    if (notificationBell) {
        notificationBell.addEventListener('click', () => {
            const panel = document.getElementById('notification-panel');
            if (panel) panel.classList.toggle('hidden');
        });
    }

    // User avatar menu
    const userAvatar = document.getElementById('user-avatar-btn');
    if (userAvatar) {
        userAvatar.addEventListener('click', () => {
            const menu = document.getElementById('user-menu');
            if (menu) menu.classList.toggle('hidden');
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

// ========== AUTHENTICATION ==========
function checkAuth() {
    if (!router || !router.currentSchool) {
        return false;
    }
    
    const schoolId = router.currentSchool.id;
    currentSchoolId = schoolId;
    
    const token = localStorage.getItem(`token_${schoolId}`);
    const user = localStorage.getItem(`user_${schoolId}`);
    
    if (token && user) {
        authToken = token;
        try {
            currentUser = JSON.parse(user);
            return true;
        } catch (e) {
            console.error('Invalid user data:', e);
            localStorage.removeItem(`token_${schoolId}`);
            localStorage.removeItem(`user_${schoolId}`);
            return false;
        }
    }
    
    return false;
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const pin = document.getElementById('login-pin').value;
    
    await login(email, pin);
}

async function login(email, pin) {
    try {
        showLoading();
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password: pin })
        });
        
        const data = await response.json();
        
        if (response.ok && data.token) {
            authToken = data.token;
            currentUser = data.user;
            
            // Store auth data
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            localStorage.setItem('userRole', currentUser.role);
            localStorage.setItem('permissionLevel', currentUser.permissionLevel || 'General');
            
            showSuccess('Welcome back!');
            
            setTimeout(() => {
                hideLoading();
                
                // Navigate to dashboard page with hash
                window.location.href = '/#/shannoncomp/dashboard';
            }, 1500);
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
    
    // Demo login - don't call the real API
    simulateDemoLogin(email, pin);
}

function simulateDemoLogin(email, pin) {
    try {
        showLoading();
        
        // Production accounts database with test logins
        const demoUsers = {
            'mary.costello@shannoncomp.ie': { email: 'mary.costello@shannoncomp.ie', role: 'Principal', name: 'Mary Costello', permissionLevel: 'Principal', roleHierarchy: 'Principal' },
            'caseyashecontact@gmail.com': { email: 'caseyashecontact@gmail.com', role: 'Secretary', name: 'Casey Ashe', permissionLevel: 'Secretary', roleHierarchy: 'Secretary' },
            '24zuzannafrankowska@shannoncomp.ie': { email: '24zuzannafrankowska@shannoncomp.ie', role: 'Student', name: 'Zuzanna Frankowska', permissionLevel: 'Student', roleHierarchy: 'Student' },
            '24corykilmartin@shannoncomp.ie': { email: '24corykilmartin@shannoncomp.ie', role: 'Teacher', name: 'Cory Kilmartin', permissionLevel: 'Teacher', roleHierarchy: 'Mid' },
            'marcusray@cirkledevelopment.co.uk': { email: 'marcusray@cirkledevelopment.co.uk', role: 'Parent', name: 'Marcus Ray', permissionLevel: 'Parent', roleHierarchy: 'Parent' },
            // Test logins
            'admintest@mispal.ie': { email: 'admintest@mispal.ie', role: 'Admin', name: 'Admin Test User', permissionLevel: 'Admin', roleHierarchy: 'Admin' },
            'teachertest@mispal.ie': { email: 'teachertest@mispal.ie', role: 'Teacher', name: 'Teacher Test User', permissionLevel: 'Teacher', roleHierarchy: 'Mid' },
            'admin@schoolware.com': { email: 'admin@schoolware.com', role: 'Admin', name: 'Schoolware Admin', permissionLevel: 'Admin', roleHierarchy: 'Admin' }
        };
        
        const user = demoUsers[email];
        
        if (user && pin === '1234') {
            // Simulate successful login
            const demoToken = 'demo_token_' + Date.now();
            authToken = demoToken;
            currentUser = user;
            
            // Store auth data
            localStorage.setItem('token', demoToken);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('permissionLevel', user.permissionLevel || 'General');
            
            showSuccess('Welcome back, ' + user.name + '!');
            
            setTimeout(() => {
                // Route based on role
                const role = (user.role || '').toLowerCase();
                
                let nextPage = '/shannoncomp/overview';
                if (role === 'admin') {
                    nextPage = '/admin-portal.html';
                } else if (role === 'parent') {
                    nextPage = '/shannoncomp/parents/dashboard';
                } else if (role === 'student') {
                    nextPage = '/shannoncomp/student/dashboard';
                } else if (role === 'secretary') {
                    nextPage = '/secretary/dashboard';
                } else if (role === 'teacher') {
                    nextPage = '/teacher-portal.html';
                }
                
                // Keep loading screen visible and navigate
                window.location.href = nextPage;
                
                // The loading screen will stay visible for 1 second after page transition starts
                // Then the new page will take over and show its content
            }, 1500);
        } else {
            hideLoading();
            showError('Invalid credentials. Please check your email and PIN.');
        }
    } catch (error) {
        hideLoading();
        showError('Login error: ' + error.message);
        console.error('Demo login error:', error);
    }
}

async function logout() {
    await showGoodbyeAnimation();
    
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('permissionLevel');
    
    authToken = null;
    currentUser = null;
    
    // Redirect to login page
    window.location.pathname = '/shannoncomp/login';
}

function applyRoleBasedNavigation() {
    const permissionLevel = localStorage.getItem('permissionLevel') || 'General';
    const userRole = (localStorage.getItem('userRole') || 'teacher').toLowerCase();
    
    // Hide admin-only elements for general teachers
    if (userRole === 'teacher' && permissionLevel !== 'Principal' && permissionLevel !== 'Admin' && permissionLevel !== 'Deputy Principal') {
        document.querySelectorAll('[data-admin-only="true"]').forEach(element => {
            element.style.display = 'none';
        });
    }
    
    // Show all for admins/principals
    if (permissionLevel === 'Principal' || permissionLevel === 'Admin' || permissionLevel === 'Deputy Principal') {
        document.querySelectorAll('[data-admin-only=\"true\"]').forEach(element => {
            element.style.display = '';
        });
    }
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
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
            // Check if using demo token - don't logout on demo
            const token = localStorage.getItem('token');
            if (!token || !token.startsWith('demo_token_')) {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('current_user');
                localStorage.removeItem('token');
                authToken = null;
                currentUser = null;
                showError('Session expired. Please login again.');
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/shannoncomp/login';
                }, 1500);
                throw new Error('Unauthorized');
            }
        }
        
        // Handle 429 Too Many Requests
        if (response.status === 429) {
            console.warn('Rate limited, retrying in 2 seconds...');
            // Wait 2 seconds and retry
            await new Promise(resolve => setTimeout(resolve, 2000));
            return apiCall(endpoint, options);
        }
        
        // Handle 503 Service Unavailable
        if (response.status === 503) {
            showError('Server temporarily unavailable. Please try again.');
            throw new Error('Service Unavailable');
        }
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // If not JSON, return as text
            data = { message: await response.text() };
        }
        
        if (!response.ok) {
            throw new Error(data.message || `API request failed with status ${response.status}`);
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
        
        // Show role-specific dashboard
        if (currentUser.role === 'student') {
            showSection('student-dashboard');
        } else if (currentUser.role === 'parent') {
            showSection('parent-dashboard');
        } else {
            showSection('overview');
        }
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
        // Check user role and load appropriate dashboard
        const userRole = (currentUser?.role || localStorage.getItem('userRole') || '').toLowerCase();
        
        // Load sidebar notifications for all users
        await loadSidebarNotifications();
        
        if (userRole === 'student') {
            await loadStudentDashboard();
            return;
        } else if (userRole === 'parent') {
            await loadParentDashboard();
            return;
        }
        
        // Admin/Teacher dashboard - only call stats for Admin role
        if (userRole === 'admin') {
            await loadStats();
            await loadHouses();
        }
        
        // These are safe for all roles
        await loadDashboardAttendance();
        await loadRecentActivity();
        await loadQuickStats();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadSidebarNotifications() {
    try {
        const notificationsList = document.getElementById('sidebar-notifications-list');
        if (!notificationsList) return;
        
        // Load notifications from various sources
        const [behaviorData, messagesData] = await Promise.all([
            apiCall('/behavior?limit=5&sort=-createdAt').catch(() => ({ behavior: [] })),
            apiCall('/messages?status=unread&limit=5').catch(() => ({ messages: [] }))
        ]);
        
        const notifications = [];
        
        // Add recent behavior notifications
        const behaviors = behaviorData.behavior || [];
        behaviors.forEach(b => {
            notifications.push({
                type: 'behavior',
                icon: 'fas fa-star',
                title: 'Positive behavior logged',
                time: new Date(b.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        });
        
        // Add unread message notifications
        const messages = messagesData.messages || [];
        messages.forEach(m => {
            notifications.push({
                type: 'message',
                icon: 'fas fa-envelope',
                title: 'Unread message',
                time: new Date(m.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        });
        
        // Render notifications
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<div class="notification-item empty"><p>No new notifications</p></div>';
        } else {
            notificationsList.innerHTML = notifications.map(n => `
                <div class="notification-item">
                    <i class="${n.icon}"></i>
                    <div>
                        <p><strong>${n.title}</strong></p>
                        <small>${n.time}</small>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading sidebar notifications:', error);
    }
}

async function loadQuickStats() {
    try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Load recent behavior logs
        const behaviorData = await apiCall('/behavior?limit=5&sort=-createdAt').catch(() => ({ behavior: [] }));
        const recentBehavior = behaviorData.behavior || [];
        
        // Load today's room bookings (disabled - endpoint not available)
        // const bookingsData = await apiCall(`/rooms/bookings?date=${today}`).catch(() => []);
        const todayBookings = 0;
        
        // Load pending messages
        const messagesData = await apiCall('/messages?status=unread&limit=10').catch(() => ({ messages: [] }));
        const unreadMessages = messagesData.messages?.length || 0;
        
        // Update quick stats cards
        const statsContainer = document.getElementById('quick-stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class=\"quick-stat-card\">
                    <div class=\"stat-icon\" style=\"background: #EEF2FF;\">
                        <i class=\"fas fa-calendar-check\" style=\"color: #4F46E5;\"></i>
                    </div>
                    <div class=\"stat-content\">
                        <h4>${todayBookings}</h4>
                        <p>Room Bookings Today</p>
                    </div>
                </div>
                <div class=\"quick-stat-card\">
                    <div class=\"stat-icon\" style=\"background: #FEF3C7;\">
                        <i class=\"fas fa-clipboard-list\" style=\"color: #F59E0B;\"></i>
                    </div>
                    <div class=\"stat-content\">
                        <h4>${recentBehavior.length}</h4>
                        <p>Recent Behavior Logs</p>
                    </div>
                </div>
                <div class=\"quick-stat-card\">
                    <div class=\"stat-icon\" style=\"background: #DBEAFE;\">
                        <i class=\"fas fa-envelope\" style=\"color: #3B82F6;\"></i>
                    </div>
                    <div class=\"stat-content\">
                        <h4>${unreadMessages}</h4>
                        <p>Unread Messages</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading quick stats:', error);
    }
}

async function loadRecentActivity() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get recent attendance records
        const attendanceData = await apiCall(`/attendance?date=${today}&limit=5&sort=-createdAt`).catch(() => ({ attendance: [] }));
        const attendance = attendanceData.attendance || [];
        
        // Get recent behavior logs
        const behaviorData = await apiCall('/behavior?limit=5&sort=-createdAt').catch(() => ({ behavior: [] }));
        const behavior = behaviorData.behavior || [];
        
        // Combine and sort activities
        const activities = [];
        
        attendance.forEach(record => {
            const student = record.student?.user || {};
            activities.push({
                type: 'attendance',
                icon: record.status === 'Present' ? 'fa-check-circle' : 'fa-times-circle',
                color: record.status === 'Present' ? '#10B981' : '#EF4444',
                text: `${student.firstName || ''} ${student.lastName || ''} marked ${record.status}`,
                time: new Date(record.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(record.date).getTime()
            });
        });
        
        behavior.forEach(log => {
            const student = log.student?.user || {};
            activities.push({
                type: 'behavior',
                icon: log.type === 'Positive' ? 'fa-star' : 'fa-exclamation-triangle',
                color: log.type === 'Positive' ? '#F59E0B' : '#EF4444',
                text: `${log.type} behavior logged for ${student.firstName || ''} ${student.lastName || ''}`,
                time: new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                timestamp: new Date(log.date).getTime()
            });
        });
        
        // Sort by timestamp
        activities.sort((a, b) => b.timestamp - a.timestamp);
        
        // Display recent activity
        const activityContainer = document.getElementById('recent-activity-list');
        if (activityContainer) {
            if (activities.length === 0) {
                activityContainer.innerHTML = '<p class=\"text-muted\" style=\"text-align: center; padding: 2rem;\">No recent activity</p>';
            } else {
                activityContainer.innerHTML = activities.slice(0, 8).map(activity => `
                    <div class=\"activity-item\">
                        <div class=\"activity-icon\" style=\"background: ${activity.color}15; color: ${activity.color};\">
                            <i class=\"fas ${activity.icon}\"></i>
                        </div>
                        <div class=\"activity-content\">
                            <p>${activity.text}</p>
                            <small class=\"text-muted\">${activity.time}</small>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
        const activityContainer = document.getElementById('recent-activity-list');
        if (activityContainer) {
            activityContainer.innerHTML = '<p class=\"text-muted\" style=\"text-align: center; padding: 2rem;\">Unable to load activity</p>';
        }
    }
}

async function loadDashboardAttendance() {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's attendance
        const attendanceData = await apiCall(`/attendance?date=${today}&limit=1000`).catch(() => ({ attendance: [] }));
        
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
            apiCall('/students?limit=1').catch(() => ({ total: 0 })),
            apiCall('/teachers').catch(() => []),
            apiCall('/classes').catch(() => []),
            apiCall('/rooms?limit=1').catch(() => ({ total: 0 }))
        ]);
        
        document.getElementById('stat-students').textContent = students.total || 0;
        document.getElementById('stat-teachers').textContent = (Array.isArray(teachers) ? teachers.length : 0);
        document.getElementById('stat-classes').textContent = (Array.isArray(classes) ? classes.length : 0);
        document.getElementById('stat-rooms').textContent = rooms.total || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
        // Set defaults if all fail
        document.getElementById('stat-students').textContent = '0';
        document.getElementById('stat-teachers').textContent = '0';
        document.getElementById('stat-classes').textContent = '0';
        document.getElementById('stat-rooms').textContent = '0';
    }
}

async function loadHouses() {
    try {
        const students = await apiCall('/students?limit=200').catch(() => ({ students: [] }));
        const houses = {};
        
        (students.students || []).forEach(student => {
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
        case 'enrollments':
            await loadEnrollments();
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
        case 'messages':
            await loadMessages(subsection || 'inbox');
            break;
        case 'payments':
            await loadPayments();
            break;
        case 'timetable':
            await loadMyTimetable();
            break;
        case 'student-dashboard':
            await loadStudentDashboard();
            break;
        case 'parent-dashboard':
            await loadParentDashboard();
            break;
        case 'my-timetable':
            await loadMyPersonalTimetable();
            break;
        case 'fees':
            showSampleFees();
            break;
        case 'payroll':
            showSamplePayroll();
            break;
        case 'overview':
            await loadDashboardData();
            break;
    }
}

async function loadTabData(section, tab) {
    // Load data specific to the tab
    console.log(`Loading ${section} - ${tab}`);
    
    if (section === 'students' && tab === 'attendance') {
        loadAttendanceRecords();
    }

    if (section === 'students' && tab === 'behavior') {
        loadBehaviorLogs();
    }
}

async function loadAttendanceRecords() {
    try {
        showLoading('Loading attendance records...');
        const today = new Date().toISOString().split('T')[0];
        const data = await apiCall(`/attendance?date=${today}&limit=100`);
        const records = data.attendance || [];
        if (records.length === 0) {
            const studentsData = await apiCall('/students?limit=200').catch(() => ({ students: [] }));
            displayAttendanceRoster(studentsData.students || []);
        } else {
            displayAttendanceRecords(records);
        }
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load attendance records');
        console.error('Error loading attendance:', error);
    }
}

function displayAttendanceRoster(students) {
    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;

    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-users" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    No students found. Add students to begin attendance tracking.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${new Date().toLocaleDateString()}</td>
            <td>—</td>
            <td><strong>${student.firstName || ''} ${student.lastName || ''}</strong></td>
            <td>${student.studentId || 'N/A'}</td>
            <td><span class="badge-info">Not Marked</span></td>
            <td>—</td>
        </tr>
    `).join('');
}

function displayAttendanceRecords(records) {
    const tbody = document.getElementById('attendance-table-body');
    if (!tbody) return;
    
    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-clipboard-list" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>
                    No attendance records for today. Click "Take Attendance" to mark attendance.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = records.map(record => {
        const student = record.student || {};
        const user = student.user || {};
        const statusColors = {
            'Present': 'success',
            'Absent': 'danger',
            'Late': 'warning',
            'Excused': 'info',
            'SchoolActivity': 'info',
            'Medical': 'warning',
            'AbsentExplained': 'primary'
        };
        const statusColor = statusColors[record.status] || 'info';
        const abexBadge = record.absenceExplained ? '<span style="margin-left: 0.5rem; background: #3498db; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">AbEx</span>' : '';
        
        return `
            <tr>
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.period || 'All Day'}</td>
                <td><strong>${user.firstName || ''} ${user.lastName || ''}</strong></td>
                <td>${student.studentId || 'N/A'}</td>
                <td><span class="badge-${statusColor}">${record.status}</span> ${abexBadge}</td>
                <td>${record.notes || '-'}</td>
            </tr>
        `;
    }).join('');
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
    
    if (!students || students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 2rem; color: #999;">No students found</td></tr>`;
        return;
    }
    
    tbody.innerHTML = students.map(student => {
        const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IE', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
        const className = student.currentClass?.name || student.currentClass?.className || 'Not Assigned';
        const statusBadge = getStatusBadgeClass(student.status || 'Active');
        
        return `
        <tr style="border-bottom: 1px solid var(--border); transition: var(--transition);" onmouseover="this.style.backgroundColor='rgba(255, 107, 107, 0.05)'" onmouseout="this.style.backgroundColor='transparent'">
            <td style="text-align: center;">
                <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; margin: 0 auto; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                    ${student.photoUrl ? `<img src="${student.photoUrl}" alt="${student.firstName}" style="width: 100%; height: 100%; object-fit: cover;">` : (student.firstName && student.lastName ? (student.firstName[0] + student.lastName[0]).toUpperCase() : 'N/A')}
                </div>
            </td>
            <td><strong>${student.studentId || 'N/A'}</strong></td>
            <td>
                <strong style="color: var(--primary);">${student.firstName} ${student.lastName}</strong>
            </td>
            <td>${student.email}</td>
            <td>${dob}</td>
            <td>
                ${student.gender ? `<span style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.85rem; background: ${student.gender === 'Male' ? '#e3f2fd' : student.gender === 'Female' ? '#fce4ec' : '#f3e5f5'}; color: ${student.gender === 'Male' ? '#1976d2' : student.gender === 'Female' ? '#c2185b' : '#7b1fa2'};">
                    ${student.gender}
                </span>` : 'N/A'}
            </td>
            <td>
                <span style="padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-weight: 600; background: var(--primary-light); color: var(--primary);">
                    ${student.yearGroup || 'N/A'}
                </span>
            </td>
            <td>
                <span class="badge ${getHouseBadgeClass(student.house)}" style="border-radius: 2rem; padding: 0.25rem 0.75rem;">
                    ${student.house || 'N/A'}
                </span>
            </td>
            <td>${className}</td>
            <td>
                <span class="badge ${statusBadge}" style="border-radius: 0.25rem; padding: 0.25rem 0.75rem; font-size: 0.85rem;">
                    ${student.status || 'Active'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-sm btn-primary" style="background: var(--primary); border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; color: white; font-weight: 600;" onclick="viewStudentProfile('${student._id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-info" style="background: #17a2b8; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; color: white; font-weight: 600;" onclick="editStudent('${student._id}')" title="Edit Student">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-danger" style="background: #dc3545; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; color: white; font-weight: 600;" onclick="deleteStudent('${student._id}')" title="Delete Student">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

function getStatusBadgeClass(status) {
    const statusClasses = {
        'Active': 'badge-success',
        'Inactive': 'badge-secondary',
        'Graduated': 'badge-primary',
        'Transferred': 'badge-warning',
        'Expelled': 'badge-danger'
    };
    return statusClasses[status] || 'badge-secondary';
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

        const user = student.user || {};
        const firstName = user.firstName || student.firstName || '';
        const lastName = user.lastName || student.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const initials = (firstName && lastName)
            ? (firstName[0] + lastName[0]).toUpperCase()
            : (user.email ? user.email[0].toUpperCase() : 'S');
        const yearLabel = student.yearGroup || student.yearName || (student.currentYear ? `Year ${student.currentYear}` : 'N/A');
        
        const modalContent = `
            <div class="profile-view">
                <div class="profile-header">
                    <div class="profile-avatar" style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">
                        ${student.photoUrl ? `<img src="${student.photoUrl}" alt="${fullName || 'Student'}" style="width: 100%; height: 100%; object-fit: cover;">` : initials}
                    </div>
                    <div>
                        <h2 style="color: var(--primary);">${fullName || 'Student'}</h2>
                        <p class="text-muted">Student ID: ${student.studentId || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="profile-sections">
                    <div class="profile-section">
                        <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
                        <div class="info-grid">
                            <div><strong>Email:</strong> ${user.email || 'N/A'}</div>
                            <div><strong>Year Group:</strong> ${yearLabel}</div>
                            <div><strong>House:</strong> <span class="badge ${getHouseBadgeClass(student.house)}">${student.house || 'N/A'}</span></div>
                            <div><strong>Date of Birth:</strong> ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                            <div><strong>Gender:</strong> ${student.gender || 'N/A'}</div>
                            <div><strong>Address:</strong> ${user.address?.street || student.address?.street || 'N/A'}</div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h3><i class="fas fa-phone"></i> Contact Information</h3>
                        <div class="info-grid">
                            <div><strong>Phone:</strong> ${user.phoneNumber || student.phone || 'N/A'}</div>
                            <div><strong>Emergency Contact:</strong> ${student.medicalInfo?.emergencyContact?.name || 'N/A'}</div>
                            <div><strong>Emergency Phone:</strong> ${student.medicalInfo?.emergencyContact?.phone || 'N/A'}</div>
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
                        <button class="btn-primary" onclick="viewStudentTimetable('${studentId}')">
                            <i class="fas fa-calendar-alt"></i> View Timetable
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

async function editStudent(studentId) {
    try {
        showLoading('Loading student data...');
        const student = await apiCall(`/students/${studentId}`);
        hideLoading();
        
        // Populate the edit form with existing data
        const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '';
        const admissionDate = student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : '';
        const yearMap = {
            'First Year': 1,
            'Second Year': 2,
            'Third Year': 3,
            'TY': 4,
            'Fifth Year': 5,
            'Sixth Year': 6
        };
        const currentYearValue = student.currentYear || yearMap[student.yearGroup] || yearMap[student.yearName] || '';
        
        const modalContent = `
            <form id="edit-student-form" style="max-height: 70vh; overflow-y: auto; padding-right: 1rem;">
                
                <!-- Basic Information Section -->
                <div class="form-section">
                    <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                        <i class="fas fa-user-circle"></i> Basic Information
                    </h3>
                    <div class="form-grid">
                        <div class="input-group">
                            <label><i class="fas fa-id-card"></i> Student ID</label>
                            <input type="text" id="edit-student-id" value="${student.studentId || ''}" readonly style="background: #f5f5f5;">
                            <small style="color: var(--text-secondary);">Student ID cannot be changed</small>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-user"></i> First Name *</label>
                            <input type="text" id="edit-student-firstname" value="${student.user?.firstName || student.firstName || ''}" required>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-user"></i> Last Name *</label>
                            <input type="text" id="edit-student-lastname" value="${student.user?.lastName || student.lastName || ''}" required>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-envelope"></i> Email *</label>
                            <input type="email" id="edit-student-email" value="${student.user?.email || student.email || ''}" required>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-phone"></i> Phone</label>
                            <input type="tel" id="edit-student-phone" value="${student.user?.phoneNumber || student.phone || ''}" placeholder="+353 XX XXX XXXX">
                        </div>
                    </div>
                </div>

                <!-- Personal Details Section -->
                <div class="form-section" style="margin-top: 1.5rem;">
                    <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                        <i class="fas fa-id-card-alt"></i> Personal Details
                    </h3>
                    <div class="form-grid">
                        <div class="input-group">
                            <label><i class="fas fa-calendar"></i> Date of Birth *</label>
                            <input type="date" id="edit-student-dob" value="${dob}" required>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-venus-mars"></i> Gender *</label>
                            <select id="edit-student-gender" class="select-input" required>
                                <option value="">Select...</option>
                                <option value="Male" ${student.gender === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" ${student.gender === 'Female' ? 'selected' : ''}>Female</option>
                                <option value="Other" ${student.gender === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-fingerprint"></i> PPS Number</label>
                            <input type="text" id="edit-student-pps" value="${student.pps || ''}" placeholder="XXXXXXXA">
                        </div>
                        <div class="input-group full-width">
                            <label><i class="fas fa-map-marker-alt"></i> Address</label>
                            <input type="text" id="edit-student-address" value="${student.user?.address?.street || student.address?.street || ''}" placeholder="Street address, City, County, Eircode">
                        </div>
                    </div>
                </div>

                <!-- Academic Information Section -->
                <div class="form-section" style="margin-top: 1.5rem;">
                    <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                        <i class="fas fa-graduation-cap"></i> Academic Information
                    </h3>
                    <div class="form-grid">
                        <div class="input-group">
                            <label><i class="fas fa-school"></i> Year Group *</label>
                            <select id="edit-student-year" required class="select-input">
                                <option value="">Select year...</option>
                                <option value="1" ${currentYearValue === 1 ? 'selected' : ''}>First Year</option>
                                <option value="2" ${currentYearValue === 2 ? 'selected' : ''}>Second Year</option>
                                <option value="3" ${currentYearValue === 3 ? 'selected' : ''}>Third Year</option>
                                <option value="4" ${currentYearValue === 4 ? 'selected' : ''}>Transition Year (TY)</option>
                                <option value="5" ${currentYearValue === 5 ? 'selected' : ''}>Fifth Year</option>
                                <option value="6" ${currentYearValue === 6 ? 'selected' : ''}>Sixth Year</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-flag"></i> Theaghlach *</label>
                            <select id="edit-student-house" required class="select-input">
                                <option value="">Select theaghlach...</option>
                                <option value="Seanan" ${student.house === 'Seanan' ? 'selected' : ''}>Seanan</option>
                                <option value="Bride" ${student.house === 'Bride' ? 'selected' : ''}>Bride</option>
                                <option value="Ide" ${student.house === 'Ide' ? 'selected' : ''}>Ide</option>
                                <option value="Conaire" ${student.house === 'Conaire' ? 'selected' : ''}>Conaire</option>
                                <option value="Padraig" ${student.house === 'Padraig' ? 'selected' : ''}>Padraig</option>
                                <option value="Tola" ${student.house === 'Tola' ? 'selected' : ''}>Tola</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-key"></i> Locker Number</label>
                            <input type="text" id="edit-student-locker" value="${student.lockerNumber || ''}" placeholder="e.g., L-101">
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-toggle-on"></i> Status</label>
                            <select id="edit-student-status" class="select-input">
                                <option value="Active" ${student.status === 'Active' ? 'selected' : ''}>Active</option>
                                <option value="Inactive" ${student.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="Graduated" ${student.status === 'Graduated' ? 'selected' : ''}>Graduated</option>
                                <option value="Transferred" ${student.status === 'Transferred' ? 'selected' : ''}>Transferred</option>
                                <option value="Expelled" ${student.status === 'Expelled' ? 'selected' : ''}>Expelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Medical Information Section -->
                <div class="form-section" style="margin-top: 1.5rem;">
                    <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                        <i class="fas fa-heartbeat"></i> Medical Information
                    </h3>
                    <div class="form-grid">
                        <div class="input-group">
                            <label><i class="fas fa-tint"></i> Blood Group</label>
                            <select id="edit-student-blood" class="select-input">
                                <option value="">Select...</option>
                                <option value="A+" ${student.medicalInfo?.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                                <option value="A-" ${student.medicalInfo?.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                                <option value="B+" ${student.medicalInfo?.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                                <option value="B-" ${student.medicalInfo?.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                                <option value="AB+" ${student.medicalInfo?.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                                <option value="AB-" ${student.medicalInfo?.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                                <option value="O+" ${student.medicalInfo?.bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
                                <option value="O-" ${student.medicalInfo?.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
                            </select>
                        </div>
                        <div class="input-group full-width">
                            <label><i class="fas fa-allergies"></i> Allergies</label>
                            <input type="text" id="edit-student-allergies" value="${student.medicalInfo?.allergies?.join(', ') || ''}" placeholder="Separate multiple allergies with commas">
                        </div>
                        <div class="input-group full-width">
                            <label><i class="fas fa-notes-medical"></i> Medical Conditions</label>
                            <input type="text" id="edit-student-conditions" value="${student.medicalInfo?.conditions?.join(', ') || ''}" placeholder="Separate multiple conditions with commas">
                        </div>
                        <div class="input-group full-width">
                            <label><i class="fas fa-pills"></i> Medications</label>
                            <input type="text" id="edit-student-medications" value="${student.medicalInfo?.medications?.join(', ') || ''}" placeholder="Separate multiple medications with commas">
                        </div>
                    </div>
                </div>

                <!-- Emergency Contact Section -->
                <div class="form-section" style="margin-top: 1.5rem;">
                    <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                        <i class="fas fa-phone-square"></i> Emergency Contact
                    </h3>
                    <div class="form-grid">
                        <div class="input-group">
                            <label><i class="fas fa-user-shield"></i> Contact Name</label>
                            <input type="text" id="edit-student-emergency-name" value="${student.medicalInfo?.emergencyContact?.name || ''}" placeholder="Full name">
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-users"></i> Relationship</label>
                            <input type="text" id="edit-student-emergency-relation" value="${student.medicalInfo?.emergencyContact?.relationship || ''}" placeholder="e.g., Mother, Father, Guardian">
                        </div>
                        <div class="input-group">
                            <label><i class="fas fa-mobile-alt"></i> Emergency Phone</label>
                            <input type="tel" id="edit-student-emergency-phone" value="${student.medicalInfo?.emergencyContact?.phone || ''}" placeholder="+353 XX XXX XXXX">
                        </div>
                    </div>
                </div>

                <!-- Photo Upload Section -->
                <div class="form-section" style="margin-top: 1.5rem;">
                    <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                        <i class="fas fa-camera"></i> Profile Photo
                    </h3>
                    <div class="input-group full-width">
                        <label><i class="fas fa-image"></i> Photo URL</label>
                        <input type="url" id="edit-student-photo" value="${student.photoUrl || student.profilePhoto || ''}" placeholder="https://example.com/photo.jpg">
                    </div>
                </div>
            </form>
        `;
        
        showModal('Edit Student Information', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Save Changes', type: 'success', action: `updateStudent('${studentId}')`, icon: 'fas fa-save' }
        ], 'large');
        
    } catch (error) {
        hideLoading();
        showError('Failed to load student data: ' + error.message);
        console.error('Edit student error:', error);
    }
}

async function updateStudent(studentId) {
    // Get all form values
    const firstName = document.getElementById('edit-student-firstname').value.trim();
    const lastName = document.getElementById('edit-student-lastname').value.trim();
    const email = document.getElementById('edit-student-email').value.trim();
    const dateOfBirth = document.getElementById('edit-student-dob').value;
    const gender = document.getElementById('edit-student-gender').value;
    const yearGroup = parseInt(document.getElementById('edit-student-year').value);
    const house = document.getElementById('edit-student-house').value;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !dateOfBirth || !gender || !yearGroup || !house) {
        showError('Please fill in all required fields');
        return;
    }
    
    // Compile update data
    const updateData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: document.getElementById('edit-student-phone').value.trim() || undefined,
        dateOfBirth: dateOfBirth,
        gender: gender,
        pps: document.getElementById('edit-student-pps').value.trim() || undefined,
        address: {
            street: document.getElementById('edit-student-address').value.trim() || ''
        },
        yearGroup: yearGroup,
        house: house,
        lockerNumber: document.getElementById('edit-student-locker').value.trim() || undefined,
        status: document.getElementById('edit-student-status').value,
        medicalInfo: {
            bloodGroup: document.getElementById('edit-student-blood').value || undefined,
            allergies: document.getElementById('edit-student-allergies').value.trim() 
                ? document.getElementById('edit-student-allergies').value.split(',').map(a => a.trim()).filter(a => a) 
                : [],
            conditions: document.getElementById('edit-student-conditions').value.trim()
                ? document.getElementById('edit-student-conditions').value.split(',').map(c => c.trim()).filter(c => c)
                : [],
            medications: document.getElementById('edit-student-medications').value.trim()
                ? document.getElementById('edit-student-medications').value.split(',').map(m => m.trim()).filter(m => m)
                : [],
            emergencyContact: {
                name: document.getElementById('edit-student-emergency-name').value.trim() || undefined,
                relationship: document.getElementById('edit-student-emergency-relation').value.trim() || undefined,
                phone: document.getElementById('edit-student-emergency-phone').value.trim() || undefined
            }
        },
        photoUrl: document.getElementById('edit-student-photo').value.trim() || undefined
    };
    
    try {
        closeModal();
        showLoading('Updating student information...');
        
        await apiCall(`/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        hideLoading();
        showSuccess('Student information updated successfully!');
        
        // Reload students list
        await loadStudents();
    } catch (error) {
        hideLoading();
        showError('Failed to update student: ' + error.message);
        console.error('Update error:', error);
    }
}

async function deleteStudent(studentId) {
    const confirmed = confirm('Are you sure you want to delete this student? This action cannot be undone.');
    
    if (!confirmed) return;
    
    try {
        showLoading('Deleting student...');
        
        await apiCall(`/students/${studentId}`, {
            method: 'DELETE'
        });
        
        hideLoading();
        showSuccess('Student deleted successfully');
        
        // Reload students list
        await loadStudents();
    } catch (error) {
        hideLoading();
        showError('Failed to delete student: ' + error.message);
        console.error('Delete error:', error);
    }
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

async function viewStudentTimetable(studentId) {
    try {
        showLoading('Loading student timetable...');
        const student = await apiCall(`/students/${studentId}`);
        const timetableData = await apiCall(`/timetable?student=${studentId}`).catch(() => ({ timetable: [] }));
        hideLoading();
        
        const timetable = timetableData.timetable || [];
        const studentName = `${student.firstName || ''} ${student.lastName || ''}`;
        
        displayTimetableModal(studentName, timetable, 'student');
    } catch (error) {
        hideLoading();
        showError('Failed to load student timetable');
        console.error(error);
    }
}

function displayTimetableModal(userName, timetable, userType) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [
        { name: 'Class 1', time: '9:00-9:40' },
        { name: 'Class 2', time: '9:40-10:20' },
        { name: 'Class 3', time: '10:20-11:00' },
        { name: 'Break', time: '11:00-11:15', isBreak: true },
        { name: 'Class 4', time: '11:15-11:55' },
        { name: 'Class 5', time: '11:55-12:35' },
        { name: 'Class 6', time: '12:35-1:15' },
        { name: 'Lunch', time: '1:15-2:00', isLunch: true },
        { name: 'Class 7', time: '2:00-2:40' },
        { name: 'Class 8', time: '2:40-3:20' },
        { name: 'Class 9', time: '3:20-4:00' }
    ];
    
    // Organize timetable by day and period
    const scheduleMap = {};
    timetable.forEach(entry => {
        const key = `${entry.day}-${entry.period}`;
        scheduleMap[key] = entry;
    });
    
    let timetableHTML = `
        <div class="timetable-modal-view">
            <div class="timetable-header">
                <h3><i class="fas fa-calendar-week"></i> ${userName}'s Timetable</h3>
                <p class="text-muted">${userType === 'teacher' ? 'Teaching Schedule' : 'Class Schedule'}</p>
            </div>
            <div class="timetable-grid-modal">
                <div class="timetable-corner">Period</div>
                ${days.map(day => `<div class="timetable-day-header">${day}</div>`).join('')}
                
                ${periods.map(period => {
                    if (period.isBreak || period.isLunch) {
                        return `
                            <div class="timetable-period-label ${period.isBreak ? 'break-period' : 'lunch-period'}">
                                <strong>${period.name}</strong>
                                <small>${period.time}</small>
                            </div>
                            ${days.map(() => `<div class="timetable-cell ${period.isBreak ? 'break-cell' : 'lunch-cell'}"></div>`).join('')}
                        `;
                    }
                    
                    return `
                        <div class="timetable-period-label">
                            <strong>${period.name}</strong>
                            <small>${period.time}</small>
                        </div>
                        ${days.map(day => {
                            const entry = scheduleMap[`${day}-${period.name}`];
                            if (entry) {
                                return `
                                    <div class="timetable-cell has-class">
                                        <div class="class-subject">${entry.subject?.name || 'Class'}</div>
                                        ${userType === 'student' ? 
                                            `<div class="class-teacher">${entry.teacher?.user?.firstName || ''} ${entry.teacher?.user?.lastName || ''}</div>` :
                                            `<div class="class-name">${entry.class?.name || ''}</div>`
                                        }
                                        <div class="class-room">${entry.room?.roomNumber || ''}</div>
                                    </div>
                                `;
                            }
                            return '<div class="timetable-cell empty-cell">Free</div>';
                        }).join('')}
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    if (timetable.length === 0) {
        timetableHTML = `
            <div class="empty-state" style="padding: 3rem; text-align: center;">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: var(--text-muted); opacity: 0.5; margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-secondary);">No Timetable Available</h3>
                <p class="text-muted">No schedule has been assigned yet.</p>
            </div>
        `;
    }
    
    showModal(`${userName}'s Timetable`, timetableHTML, [
        { text: 'Close', type: 'secondary', action: 'closeModal()' },
        { text: 'Print', type: 'info', action: 'window.print()', icon: 'fas fa-print' }
    ]);
}

async function addStudent() {
    const modalContent = `
        <form id="add-student-form" style="max-height: 70vh; overflow-y: auto; padding-right: 1rem;">
            
            <!-- Basic Information Section -->
            <div class="form-section">
                <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                    <i class="fas fa-user-circle"></i> Basic Information
                </h3>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-id-card"></i> Student ID *</label>
                        <input type="text" id="new-student-id" placeholder="e.g., 24001" required>
                        <small style="color: var(--text-secondary);">Unique identifier for the student</small>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-id-badge"></i> Admission Number</label>
                        <input type="text" id="new-student-admission" placeholder="Auto-generated if empty">
                        <small style="color: var(--text-secondary);">Leave blank to auto-generate</small>
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
                        <label><i class="fas fa-phone"></i> Phone</label>
                        <input type="tel" id="new-student-phone" placeholder="+353 XX XXX XXXX">
                    </div>
                </div>
            </div>

            <!-- Personal Details Section -->
            <div class="form-section" style="margin-top: 1.5rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                    <i class="fas fa-id-card-alt"></i> Personal Details
                </h3>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-calendar"></i> Date of Birth *</label>
                        <input type="date" id="new-student-dob" required>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-venus-mars"></i> Gender *</label>
                        <select id="new-student-gender" class="select-input" required>
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-fingerprint"></i> PPS Number</label>
                        <input type="text" id="new-student-pps" placeholder="XXXXXXXA">
                    </div>
                    <div class="input-group full-width">
                        <label><i class="fas fa-map-marker-alt"></i> Address</label>
                        <input type="text" id="new-student-address" placeholder="Street address, City, County, Eircode">
                    </div>
                </div>
            </div>

            <!-- Academic Information Section -->
            <div class="form-section" style="margin-top: 1.5rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                    <i class="fas fa-graduation-cap"></i> Academic Information
                </h3>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-school"></i> Year Group *</label>
                        <select id="new-student-year" required class="select-input">
                            <option value="">Select year...</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Transition Year (TY)</option>
                            <option value="5">Fifth Year</option>
                            <option value="6">Sixth Year</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-flag"></i> Theaghlach *</label>
                        <select id="new-student-house" required class="select-input">
                            <option value="">Select theaghlach...</option>
                            <option value="Seanan">Seanan</option>
                            <option value="Bride">Bride</option>
                            <option value="Ide">Ide</option>
                            <option value="Conaire">Conaire</option>
                            <option value="Padraig">Padraig</option>
                            <option value="Tola">Tola</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar-plus"></i> Admission Date</label>
                        <input type="date" id="new-student-admission-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-key"></i> Locker Number</label>
                        <input type="text" id="new-student-locker" placeholder="e.g., L-101">
                    </div>
                </div>
            </div>

            <!-- Medical Information Section -->
            <div class="form-section" style="margin-top: 1.5rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                    <i class="fas fa-heartbeat"></i> Medical Information
                </h3>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-tint"></i> Blood Group</label>
                        <select id="new-student-blood" class="select-input">
                            <option value="">Select...</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                        </select>
                    </div>
                    <div class="input-group full-width">
                        <label><i class="fas fa-allergies"></i> Allergies</label>
                        <input type="text" id="new-student-allergies" placeholder="Separate multiple allergies with commas">
                        <small style="color: var(--text-secondary);">e.g., Peanuts, Dairy, Penicillin</small>
                    </div>
                    <div class="input-group full-width">
                        <label><i class="fas fa-notes-medical"></i> Medical Conditions</label>
                        <input type="text" id="new-student-conditions" placeholder="Separate multiple conditions with commas">
                        <small style="color: var(--text-secondary);">e.g., Asthma, Diabetes</small>
                    </div>
                    <div class="input-group full-width">
                        <label><i class="fas fa-pills"></i> Medications</label>
                        <input type="text" id="new-student-medications" placeholder="Separate multiple medications with commas">
                        <small style="color: var(--text-secondary);">e.g., Inhaler, Insulin</small>
                    </div>
                </div>
            </div>

            <!-- Emergency Contact Section -->
            <div class="form-section" style="margin-top: 1.5rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                    <i class="fas fa-phone-square"></i> Emergency Contact
                </h3>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-user-shield"></i> Contact Name</label>
                        <input type="text" id="new-student-emergency-name" placeholder="Full name">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-users"></i> Relationship</label>
                        <input type="text" id="new-student-emergency-relation" placeholder="e.g., Mother, Father, Guardian">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-mobile-alt"></i> Emergency Phone</label>
                        <input type="tel" id="new-student-emergency-phone" placeholder="+353 XX XXX XXXX">
                    </div>
                </div>
            </div>

            <!-- Previous School Section -->
            <div class="form-section" style="margin-top: 1.5rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                    <i class="fas fa-school"></i> Previous School Information
                </h3>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-building"></i> Previous School Name</label>
                        <input type="text" id="new-student-prev-school" placeholder="School name">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-map-pin"></i> Previous School Address</label>
                        <input type="text" id="new-student-prev-address" placeholder="School address">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar-check"></i> Last Year Attended</label>
                        <input type="number" id="new-student-prev-year" placeholder="e.g., 2023" min="2000" max="2030">
                    </div>
                </div>
            </div>

            <!-- Additional Notes Section -->
            <div class="form-section" style="margin-top: 1.5rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                    <i class="fas fa-sticky-note"></i> Additional Notes
                </h3>
                <div class="input-group full-width">
                    <label><i class="fas fa-comment-alt"></i> Notes</label>
                    <textarea id="new-student-notes" rows="3" placeholder="Any additional information about the student..." style="width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.3rem; font-family: inherit;"></textarea>
                </div>
            </div>

            <!-- Photo Upload Section -->
            <div class="form-section" style="margin-top: 1.5rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--border);">
                    <i class="fas fa-camera"></i> Profile Photo
                </h3>
                <div class="input-group full-width">
                    <label><i class="fas fa-image"></i> Photo URL</label>
                    <input type="url" id="new-student-photo" placeholder="https://example.com/photo.jpg">
                    <small style="color: var(--text-secondary);">Provide a URL to the student's profile photo</small>
                </div>
            </div>

            <div style="margin-top: 1.5rem; padding: 1rem; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 0.3rem;">
                <p style="margin: 0; color: #856404;"><i class="fas fa-info-circle"></i> <strong>Note:</strong> Fields marked with * are required. The student will receive login credentials via email after enrollment.</p>
            </div>
        </form>
    `;
    
    showModal('Student Enrollment Form', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Enroll Student', type: 'success', action: 'submitNewStudent()', icon: 'fas fa-user-plus' }
    ], 'large');
}

async function submitNewStudent() {
    // Get all form values
    const studentId = document.getElementById('new-student-id').value.trim();
    const firstName = document.getElementById('new-student-firstname').value.trim();
    const lastName = document.getElementById('new-student-lastname').value.trim();
    const email = document.getElementById('new-student-email').value.trim();
    const dateOfBirth = document.getElementById('new-student-dob').value;
    const gender = document.getElementById('new-student-gender').value;
    const yearGroup = parseInt(document.getElementById('new-student-year').value);
    const house = document.getElementById('new-student-house').value;
    
    // Validate required fields
    if (!studentId || !firstName || !lastName || !email || !dateOfBirth || !gender || !yearGroup || !house) {
        showError('Please fill in all required fields marked with *');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Validate date of birth (student should be between 10 and 25 years old)
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 10 || age > 25) {
        showError('Student age must be between 10 and 25 years');
        return;
    }
    
    // Compile student data
    const studentData = {
        // Basic Information
        studentId: studentId,
        admissionNumber: document.getElementById('new-student-admission').value.trim() || undefined,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: document.getElementById('new-student-phone').value.trim() || undefined,
        
        // Personal Details
        dateOfBirth: dateOfBirth,
        gender: gender,
        pps: document.getElementById('new-student-pps').value.trim() || undefined,
        address: {
            street: document.getElementById('new-student-address').value.trim() || ''
        },
        
        // Academic Information
        yearGroup: yearGroup,
        house: house,
        admissionDate: document.getElementById('new-student-admission-date').value || new Date().toISOString().split('T')[0],
        lockerNumber: document.getElementById('new-student-locker').value.trim() || undefined,
        
        // Medical Information
        medicalInfo: {
            bloodGroup: document.getElementById('new-student-blood').value || undefined,
            allergies: document.getElementById('new-student-allergies').value.trim() 
                ? document.getElementById('new-student-allergies').value.split(',').map(a => a.trim()).filter(a => a) 
                : [],
            conditions: document.getElementById('new-student-conditions').value.trim()
                ? document.getElementById('new-student-conditions').value.split(',').map(c => c.trim()).filter(c => c)
                : [],
            medications: document.getElementById('new-student-medications').value.trim()
                ? document.getElementById('new-student-medications').value.split(',').map(m => m.trim()).filter(m => m)
                : [],
            emergencyContact: {
                name: document.getElementById('new-student-emergency-name').value.trim() || undefined,
                relationship: document.getElementById('new-student-emergency-relation').value.trim() || undefined,
                phone: document.getElementById('new-student-emergency-phone').value.trim() || undefined
            }
        },
        
        // Previous School
        previousSchool: {
            name: document.getElementById('new-student-prev-school').value.trim() || undefined,
            address: document.getElementById('new-student-prev-address').value.trim() || undefined,
            lastYear: document.getElementById('new-student-prev-year').value 
                ? parseInt(document.getElementById('new-student-prev-year').value) 
                : undefined
        },
        
        // Notes
        notes: document.getElementById('new-student-notes').value.trim() || undefined,
        
        // Photo
        photoUrl: document.getElementById('new-student-photo').value.trim() || undefined,
        
        // Status
        status: 'Active'
    };
    
    // Clean up undefined values in nested objects
    if (!studentData.medicalInfo.bloodGroup && studentData.medicalInfo.allergies.length === 0 && 
        studentData.medicalInfo.conditions.length === 0 && studentData.medicalInfo.medications.length === 0 &&
        !studentData.medicalInfo.emergencyContact.name) {
        delete studentData.medicalInfo;
    } else if (!studentData.medicalInfo.emergencyContact.name) {
        delete studentData.medicalInfo.emergencyContact;
    }
    
    if (!studentData.previousSchool.name && !studentData.previousSchool.address && !studentData.previousSchool.lastYear) {
        delete studentData.previousSchool;
    }
    
    try {
        closeModal();
        showLoading('Enrolling student...');
        
        const response = await apiCall('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
        
        hideLoading();
        showSuccess(`Student ${firstName} ${lastName} enrolled successfully!`);
        
        // Reload students list
        await loadStudents();
    } catch (error) {
        hideLoading();
        showError('Failed to enroll student: ' + error.message);
        console.error('Enrollment error:', error);
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
    
    if (!teachers || teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-secondary)"><i class="fas fa-chalkboard-teacher" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.5"></i>No teachers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = teachers.map(teacher => `
        <tr style="border-bottom: 1px solid var(--border); transition: var(--transition);" onmouseover="this.style.backgroundColor='rgba(255, 107, 107, 0.05)'" onmouseout="this.style.backgroundColor='transparent'">
            <td style="text-align: center;">
                <div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; margin: 0 auto; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                    ${teacher.photoUrl ? `<img src="${teacher.photoUrl}" alt="${teacher.firstName}" style="width: 100%; height: 100%; object-fit: cover;">` : (teacher.firstName[0] + teacher.lastName[0]).toUpperCase()}
                </div>
            </td>
            <td><strong style="color: var(--primary);">${teacher.firstName || ''} ${teacher.lastName || ''}</strong></td>
            <td>${teacher.email || 'N/A'}</td>
            <td>${teacher.subject || 'N/A'}</td>
            <td>
                <span class="badge ${getPermissionBadgeClass(teacher.permissionLevel)}" style="border-radius: 2rem; padding: 0.25rem 0.75rem;">
                    ${teacher.permissionLevel || 'General'}
                </span>
            </td>
            <td>
                <button class="btn-sm btn-primary" style="background: var(--primary); border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; color: white; font-weight: 600;" onclick="viewTeacherProfile('${teacher._id}')">
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
                    <div class="profile-avatar" style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">
                        ${teacher.photoUrl ? `<img src="${teacher.photoUrl}" alt="${teacher.firstName}" style="width: 100%; height: 100%; object-fit: cover;">` : (teacher.firstName[0] + teacher.lastName[0]).toUpperCase()}
                    </div>
                    <div>
                        <h2 style="color: var(--primary);">${teacher.firstName} ${teacher.lastName}</h2>
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

async function editTeacher(teacherId) {
    try {
        showLoading('Loading teacher details...');
        const teacher = await apiCall(`/teachers/${teacherId}`);
        hideLoading();
        
        const modalContent = `
            <form id="edit-teacher-form">
                <div class="form-grid-2">
                    <div class="input-group">
                        <label><i class="fas fa-user"></i> First Name *</label>
                        <input type="text" id="teacher-firstName" value="${teacher.user?.firstName || ''}" required>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-user"></i> Last Name *</label>
                        <input type="text" id="teacher-lastName" value="${teacher.user?.lastName || ''}" required>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-envelope"></i> Email *</label>
                        <input type="email" id="teacher-email" value="${teacher.user?.email || ''}" required>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-phone"></i> Phone</label>
                        <input type="tel" id="teacher-phone" value="${teacher.user?.phone || ''}">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-id-card"></i> Employee ID</label>
                        <input type="text" id="teacher-employeeId" value="${teacher.employeeId || ''}" readonly>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-chalkboard"></i> Department</label>
                        <select id="teacher-department" class="select-input">
                            <option value="Mathematics" ${teacher.department === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                            <option value="English" ${teacher.department === 'English' ? 'selected' : ''}>English</option>
                            <option value="Science" ${teacher.department === 'Science' ? 'selected' : ''}>Science</option>
                            <option value="History" ${teacher.department === 'History' ? 'selected' : ''}>History</option>
                            <option value="Geography" ${teacher.department === 'Geography' ? 'selected' : ''}>Geography</option>
                            <option value="Languages" ${teacher.department === 'Languages' ? 'selected' : ''}>Languages</option>
                            <option value="Arts" ${teacher.department === 'Arts' ? 'selected' : ''}>Arts</option>
                            <option value="PE" ${teacher.department === 'PE' ? 'selected' : ''}>Physical Education</option>
                            <option value="Technology" ${teacher.department === 'Technology' ? 'selected' : ''}>Technology</option>
                            <option value="Other" ${teacher.department === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-briefcase"></i> Position</label>
                        <input type="text" id="teacher-position" value="${teacher.position || ''}">
                    </div>
                </div>
            </form>
        `;
        
        showModal('Edit Teacher', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Save Changes', type: 'primary', action: `submitTeacherEdit('${teacherId}')`, icon: 'fas fa-save' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load teacher details');
        console.error(error);
    }
}

async function submitTeacherEdit(teacherId) {
    const firstName = document.getElementById('teacher-firstName').value;
    const lastName = document.getElementById('teacher-lastName').value;
    const email = document.getElementById('teacher-email').value;
    const phone = document.getElementById('teacher-phone').value;
    const department = document.getElementById('teacher-department').value;
    const position = document.getElementById('teacher-position').value;
    
    if (!firstName || !lastName || !email) {
        showError('Please fill in all required fields');
        return;
    }
    
    closeModal();
    showLoading('Updating teacher...');
    
    try {
        await apiCall(`/teachers/${teacherId}`, 'PUT', {
            firstName, lastName, email, phone, department, position
        });
        hideLoading();
        showSuccess('Teacher updated successfully!');
        await loadTeachers();
    } catch (error) {
        hideLoading();
        showError('Failed to update teacher');
        console.error(error);
    }
}

async function viewTeacherTimetable(teacherId) {
    try {
        showLoading('Loading teacher timetable...');
        const teacher = await apiCall(`/teachers/${teacherId}`);
        const timetableData = await apiCall(`/timetable?teacher=${teacherId}`).catch(() => ({ timetable: [] }));
        hideLoading();
        
        const timetable = timetableData.timetable || [];
        const teacherName = `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`;
        
        displayTimetableModal(teacherName, timetable, 'teacher');
    } catch (error) {
        hideLoading();
        showError('Failed to load teacher timetable');
        console.error(error);
    }
}

function viewTeacherClasses(teacherId) {
    showSuccess('Teacher classes view - check Classes section for classes taught by this teacher');
}

// ========== CLASSES ==========
async function loadClasses() {
    try {
        showLoading('Loading classes...');
        const data = await apiCall('/classes');
        const classes = data.classes || [];
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
    
    if (!classes || classes.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-book-open"></i><p>No classes found</p></div>';
        return;
    }
    
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
                            <div><strong>Room:</strong> ${classData.room?.roomNumber || classData.room || 'Not assigned'}</div>
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
    loadClassForEdit(classId);
}

function manageClassStudents(classId) {
    openManageClassStudents(classId);
}

function viewClassTimetable(classId) {
    showSuccess('Class timetable coming soon!');
}

async function addClass() {
    try {
        showLoading('Loading class form...');
        const [roomsData, teachersData] = await Promise.all([
            apiCall('/rooms?limit=200').catch(() => ({ rooms: [] })),
            apiCall('/teachers').catch(() => [])
        ]);
        hideLoading();

        const rooms = roomsData.rooms || [];
        const roomOptions = rooms
            .filter(r => r.isAvailable !== false)
            .map(r => `<option value="${r.roomNumber}">${r.roomNumber} - ${r.roomName || r.category}</option>`)
            .join('');

        const teachers = Array.isArray(teachersData) ? teachersData : (teachersData.teachers || []);
        const teacherOptions = teachers.map(t => `<option value="${t._id}">${t.firstName} ${t.lastName}</option>`).join('');

        const isTeacher = (currentUser?.role || '').toLowerCase() === 'teacher';

        const modalContent = `
            <form id="create-class-form">
                <div class="input-group">
                    <label><i class="fas fa-book"></i> Class Name *</label>
                    <input type="text" id="class-name" required placeholder="e.g., First Year A">
                </div>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-layer-group"></i> Year *</label>
                        <select id="class-year" class="select-input" required>
                            <option value="">Select year...</option>
                            <option value="1">First Year</option>
                            <option value="2">Second Year</option>
                            <option value="3">Third Year</option>
                            <option value="4">Transition Year (TY)</option>
                            <option value="5">Fifth Year</option>
                            <option value="6">Sixth Year</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-tag"></i> Section *</label>
                        <input type="text" id="class-section" required placeholder="A">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar"></i> Academic Year *</label>
                        <input type="text" id="class-academic-year" required placeholder="2025-2026" value="2025-2026">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-users"></i> Capacity</label>
                        <input type="number" id="class-capacity" min="1" value="30">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-door-open"></i> Room</label>
                        <select id="class-room" class="select-input">
                            <option value="">Select room...</option>
                            ${roomOptions}
                        </select>
                    </div>
                    ${isTeacher ? '' : `
                    <div class="input-group">
                        <label><i class="fas fa-chalkboard-teacher"></i> Class Teacher</label>
                        <select id="class-teacher" class="select-input">
                            <option value="">Select teacher...</option>
                            ${teacherOptions}
                        </select>
                    </div>
                    `}
                </div>
            </form>
        `;

        showModal('Create Class', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Create Class', type: 'primary', action: 'submitCreateClass()', icon: 'fas fa-save' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load class form');
        console.error(error);
    }
}

async function submitCreateClass() {
    const name = document.getElementById('class-name').value.trim();
    const year = parseInt(document.getElementById('class-year').value, 10);
    const section = document.getElementById('class-section').value.trim();
    const academicYear = document.getElementById('class-academic-year').value.trim();
    const capacity = parseInt(document.getElementById('class-capacity').value, 10) || 30;
    const room = document.getElementById('class-room').value || undefined;
    const teacherSelect = document.getElementById('class-teacher');
    const classTeacher = teacherSelect ? teacherSelect.value : undefined;

    if (!name || !year || !section || !academicYear) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        closeModal();
        showLoading('Creating class...');

        await apiCall('/classes', {
            method: 'POST',
            body: JSON.stringify({ name, year, section, academicYear, capacity, room, classTeacher })
        });

        hideLoading();
        showSuccess('Class created successfully!');
        loadClasses();
    } catch (error) {
        hideLoading();
        showError('Failed to create class: ' + error.message);
    }
}

async function loadClassForEdit(classId) {
    try {
        showLoading('Loading class...');
        const classData = await apiCall(`/classes/${classId}`);
        hideLoading();

        const modalContent = `
            <form id="edit-class-form">
                <div class="input-group">
                    <label><i class="fas fa-book"></i> Class Name *</label>
                    <input type="text" id="edit-class-name" required value="${classData.name || ''}">
                </div>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-layer-group"></i> Year *</label>
                        <input type="number" id="edit-class-year" min="1" max="6" value="${classData.year || 1}">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-tag"></i> Section *</label>
                        <input type="text" id="edit-class-section" required value="${classData.section || ''}">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar"></i> Academic Year *</label>
                        <input type="text" id="edit-class-academic-year" required value="${classData.academicYear || ''}">
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-users"></i> Capacity</label>
                        <input type="number" id="edit-class-capacity" min="1" value="${classData.capacity || 30}">
                    </div>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-door-open"></i> Room</label>
                    <input type="text" id="edit-class-room" value="${classData.room?.roomNumber || classData.room || ''}" placeholder="Room 101">
                </div>
            </form>
        `;

        showModal('Edit Class', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Save Changes', type: 'primary', action: `submitEditClass('${classId}')`, icon: 'fas fa-save' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load class');
    }
}

async function submitEditClass(classId) {
    const name = document.getElementById('edit-class-name').value.trim();
    const year = parseInt(document.getElementById('edit-class-year').value, 10);
    const section = document.getElementById('edit-class-section').value.trim();
    const academicYear = document.getElementById('edit-class-academic-year').value.trim();
    const capacity = parseInt(document.getElementById('edit-class-capacity').value, 10) || 30;
    const room = document.getElementById('edit-class-room').value.trim();

    if (!name || !year || !section || !academicYear) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        closeModal();
        showLoading('Updating class...');
        await apiCall(`/classes/${classId}`, {
            method: 'PUT',
            body: JSON.stringify({ name, year, section, academicYear, capacity, room })
        });
        hideLoading();
        showSuccess('Class updated successfully!');
        loadClasses();
    } catch (error) {
        hideLoading();
        showError('Failed to update class: ' + error.message);
    }
}

async function openManageClassStudents(classId) {
    try {
        showLoading('Loading class roster...');
        const [classData, studentsData] = await Promise.all([
            apiCall(`/classes/${classId}`),
            apiCall('/students?limit=500')
        ]);
        hideLoading();

        const enrolledIds = new Set((classData.students || []).map(s => s._id));
        const studentOptions = (studentsData.students || []).map(s => `
            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0;">
                <input type="checkbox" name="class-student" value="${s._id}" ${enrolledIds.has(s._id) ? 'checked' : ''}>
                <span>${s.firstName} ${s.lastName} (${s.studentId || 'N/A'})</span>
            </label>
        `).join('');

        const modalContent = `
            <div style="max-height: 400px; overflow-y: auto;">
                ${studentOptions || '<p class="text-muted">No students available</p>'}
            </div>
        `;

        showModal('Manage Class Students', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Save', type: 'primary', action: `submitClassStudents('${classId}')`, icon: 'fas fa-save' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load students');
    }
}

async function submitClassStudents(classId) {
    const selected = Array.from(document.querySelectorAll('input[name="class-student"]:checked'))
        .map(cb => cb.value);

    try {
        closeModal();
        showLoading('Updating class students...');
        await apiCall(`/classes/${classId}/students`, {
            method: 'POST',
            body: JSON.stringify({ studentIds: selected })
        });
        hideLoading();
        showSuccess('Class students updated successfully!');
        loadClasses();
    } catch (error) {
        hideLoading();
        showError('Failed to update class students: ' + error.message);
    }
}

// ========== ROOMS ==========
async function addRoom() {
    const modalContent = `
        <form id="add-room-form">
            <div class="form-grid">
                <div class="input-group">
                    <label><i class="fas fa-door-open"></i> Room Number *</label>
                    <input type="text" id="room-number" required placeholder="e.g., 101">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-door-open"></i> Room Name *</label>
                    <input type="text" id="room-name" required placeholder="e.g., Science Lab">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-tag"></i> Category *</label>
                    <select id="room-category" class="select-input" required>
                        <option value="">Select category...</option>
                        <option value="IT Rooms">IT Rooms</option>
                        <option value="Science Labs">Science Labs</option>
                        <option value="Art Rooms">Art Rooms</option>
                        <option value="General Classrooms">General Classrooms</option>
                        <option value="Lecture Theatre">Lecture Theatre</option>
                        <option value="Library">Library</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-building"></i> Building *</label>
                    <select id="room-building" class="select-input" required>
                        <option value="">Select building...</option>
                        <option value="Main Building">Main Building</option>
                        <option value="New Building">New Building</option>
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-layer-group"></i> Floor *</label>
                    <select id="room-floor" class="select-input" required>
                        <option value="">Select floor...</option>
                        <option value="0">Ground Floor</option>
                        <option value="1">First Floor</option>
                        <option value="2">Second Floor</option>
                        <option value="3">Third Floor</option>
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-users"></i> Capacity</label>
                    <input type="number" id="room-capacity" min="1" value="30">
                </div>
            </div>
        </form>
    `;

    showModal('Add Room', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Create Room', type: 'primary', action: 'submitAddRoom()', icon: 'fas fa-save' }
    ]);
}

async function submitAddRoom() {
    const roomNumber = document.getElementById('room-number').value.trim();
    const roomName = document.getElementById('room-name').value.trim();
    const category = document.getElementById('room-category').value;
    const building = document.getElementById('room-building').value;
    const floor = parseInt(document.getElementById('room-floor').value, 10);
    const capacity = parseInt(document.getElementById('room-capacity').value, 10);

    if (!roomNumber || !roomName || !category || !building || Number.isNaN(floor)) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        closeModal();
        showLoading('Creating room...');
        await apiCall('/rooms', {
            method: 'POST',
            body: JSON.stringify({ 
                roomNumber, 
                roomName, 
                category, 
                floor, 
                capacity,
                location: {
                    building: building
                }
            })
        });
        hideLoading();
        showSuccess('Room created successfully!');
        loadRooms();
    } catch (error) {
        hideLoading();
        showError('Failed to create room: ' + error.message);
    }
}

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

async function displayRooms(rooms) {
    const grid = document.getElementById('rooms-grid');
    if (!grid) return;
    
    // Get today's bookings to show indicators
    const today = new Date().toISOString().split('T')[0];
    let bookingCounts = {};
    try {
        // Fetch all rooms with bookings - endpoint needs to be created or we'll just show basic info
        for (const room of rooms) {
            try {
                const bookings = await apiCall(`/rooms/${room._id}/bookings?startDate=${today}&endDate=${today}`).catch(() => []);
                bookingCounts[room._id] = Array.isArray(bookings) ? bookings.length : 0;
            } catch (e) {
                bookingCounts[room._id] = 0;
            }
        }
    } catch (error) {
        console.log('Could not fetch booking counts:', error);
    }
    
    // Group rooms by building and floor
    const roomsBySection = {
        'mainFloor1': [],
        'mainFloor2': [],
        'mainFloor3': [],
        'newBuildingGround': [],
        'newBuildingFloor1': []
    };
    
    rooms.forEach(room => {
        const building = (room.location?.building || '').toLowerCase();
        const floor = room.floor || 0;
        const isNewBuilding = building.includes('new');
        
        if (isNewBuilding) {
            if (floor === 0) {
                roomsBySection['newBuildingGround'].push(room);
            } else if (floor === 1) {
                roomsBySection['newBuildingFloor1'].push(room);
            }
        } else {
            // Main building
            if (floor === 1) {
                roomsBySection['mainFloor1'].push(room);
            } else if (floor === 2) {
                roomsBySection['mainFloor2'].push(room);
            } else if (floor === 3) {
                roomsBySection['mainFloor3'].push(room);
            }
        }
    });
    
    // Define sections in the required order
    const sections = [
        { key: 'mainFloor1', title: 'Main Building - First Floor', icon: 'fa-building' },
        { key: 'mainFloor2', title: 'Main Building - Second Floor', icon: 'fa-building' },
        { key: 'mainFloor3', title: 'Main Building - Third Floor', icon: 'fa-building' },
        { key: 'newBuildingGround', title: 'New Building - Ground Floor', icon: 'fa-city' },
        { key: 'newBuildingFloor1', title: 'New Building - First Floor', icon: 'fa-city' }
    ];
    
    // Build HTML for each section
    let html = '';
    sections.forEach(section => {
        const sectionRooms = roomsBySection[section.key];
        
        // Skip empty sections
        if (!sectionRooms || sectionRooms.length === 0) return;
        
        // Sort rooms by room number
        sectionRooms.sort((a, b) => {
            const aNum = parseInt(a.roomNumber) || 0;
            const bNum = parseInt(b.roomNumber) || 0;
            return aNum - bNum;
        });
        
        html += `
            <div class="floor-section">
                <h3 class="floor-header">
                    <i class="fas ${section.icon}"></i> 
                    ${section.title}
                    <span class="room-count">${sectionRooms.length} rooms</span>
                </h3>
                <div class="rooms-grid-4col">
                    ${sectionRooms.map(room => {
                        const categoryIcons = {
                            'Classroom': 'fa-chalkboard-teacher',
                            'Laboratory': 'fa-flask',
                            'Office': 'fa-briefcase',
                            'Sports': 'fa-basketball-ball',
                            'Library': 'fa-book',
                            'Staff Room': 'fa-coffee',
                            'Meeting Room': 'fa-users',
                            'Storage': 'fa-box',
                            'Utility': 'fa-tools'
                        };
                        const icon = categoryIcons[room.category] || 'fa-door-open';
                        
                        const bookings = bookingCounts[room._id] || 0;
                        const hasBookings = bookings > 0;
                        
                        const statusClass = room.isAvailable ? 'available' : 'occupied';
                        const statusIcon = room.isAvailable ? 'check-circle' : 'times-circle';
                        
                        return `
                            <div class="room-card ${statusClass}" onclick="bookRoom('${room._id}')">
                                <div class="room-card-header">
                                    <span class="room-number">${room.roomNumber}</span>
                                    <span class="room-status">
                                        <i class="fas fa-${statusIcon}"></i>
                                    </span>
                                </div>
                                <div class="room-card-body">
                                    <div class="room-icon">
                                        <i class="fas ${icon}"></i>
                                    </div>
                                    <h4 class="room-name">${room.roomName || room.category}</h4>
                                    <div class="room-details">
                                        <span class="room-category">
                                            <i class="fas fa-tag"></i> ${room.category}
                                        </span>
                                        ${room.capacity ? `
                                            <span class="room-capacity">
                                                <i class="fas fa-users"></i> ${room.capacity}
                                            </span>
                                        ` : ''}
                                    </div>
                                    ${hasBookings ? `
                                        <div class="booking-indicator">
                                            <i class="fas fa-exclamation-triangle" style="color: #F59E0B;"></i>
                                            <span>${bookings} booking${bookings > 1 ? 's' : ''} today</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="room-card-footer">
                                    <button class="book-btn">
                                        <i class="fas fa-calendar-plus"></i> Book Room
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html || '<p class="empty-state"><i class="fas fa-door-closed"></i> No rooms available</p>';
}

// bookRoom function moved to comprehensive version below with booking indicators and current bookings display

async function checkRoomAvailability(roomId) {
    const date = document.getElementById('booking-date')?.value;
    const period = document.getElementById('booking-period')?.value;
    
    if (!date) {
        showError('Please select a date first');
        document.getElementById('booking-date').focus();
        return;
    }
    
    if (!period) {
        showError('Please select a period first');
        document.getElementById('booking-period').focus();
        return;
    }
    
    try {
        showLoading('Checking availability...');
        
        // Check availability
        const response = await apiCall(`/rooms/${roomId}/bookings?startDate=${date}&endDate=${date}`).catch(() => []);
        
        hideLoading();
        
        // Check if the period is already booked
        const isBooked = Array.isArray(response) && response.some(booking => 
            booking.period === period && booking.date.split('T')[0] === date
        );
        
        if (isBooked) {
            showError(`Room is NOT available for ${period} on ${new Date(date).toLocaleDateString()}. Please select a different period.`);
            return false;
        } else {
            showSuccess(`✓ Room IS AVAILABLE for ${period} on ${new Date(date).toLocaleDateString()}! You can proceed with booking.`);
            return true;
        }
    } catch (error) {
        hideLoading();
        console.warn('Could not verify availability (network issue), proceeding with booking attempt:', error);
        showSuccess('Proceeding with booking attempt...');
        return true; // Allow booking attempt even if check fails
    }
}

function toggleRecurringFields() {
    const type = document.getElementById('booking-type')?.value;
    const endDateField = document.getElementById('recurring-end-date');
    if (endDateField) {
        endDateField.style.display = type === 'weekly' ? 'block' : 'none';
    }
}

async function submitRoomBooking(roomId) {
    const date = document.getElementById('booking-date').value;
    const period = document.getElementById('booking-period').value;
    const purpose = document.getElementById('booking-purpose').value;
    const notes = document.getElementById('booking-notes').value;
    const classId = document.getElementById('booking-class')?.value;
    const bookingType = document.getElementById('booking-type')?.value;
    const endDate = document.getElementById('booking-end-date')?.value;
    
    // Validation
    if (!date) {
        showError('Please select a date');
        document.getElementById('booking-date').focus();
        return;
    }
    
    if (!period) {
        showError('Please select a period/time slot');
        document.getElementById('booking-period').focus();
        return;
    }
    
    if (!purpose) {
        showError('Please select a purpose');
        document.getElementById('booking-purpose').focus();
        return;
    }
    
    // Verify date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showError('Cannot book room for a past date');
        return;
    }
    
    try {
        closeModal();
        showLoading('Booking room...');
        
        const bookingData = {
            date,
            period,
            purpose,
            notes,
            class: classId || undefined,
            recurringBooking: bookingType === 'weekly' && endDate ? {
                isRecurring: true,
                endDate
            } : { isRecurring: false },
            bookedBy: currentUser._id,
            timestamp: new Date().toISOString()
        };
        
        const response = await apiCall(`/rooms/${roomId}/book`, {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
        
        hideLoading();
        showSuccess('Room booked successfully! Confirmation has been sent.');
        
        // Reload rooms to show updated availability
        setTimeout(() => {
            loadRooms();
        }, 1000);
    } catch (error) {
        hideLoading();
        if (error.message.includes('already booked')) {
            showError('This period is already booked. Please select a different time slot.');
        } else if (error.message.includes('not available')) {
            showError('Room is not available for the selected period. Please try another time.');
        } else {
            showError('Failed to book room: ' + error.message);
        }
        console.error(error);
    }
}

// ========== BEHAVIOR & ATTENDANCE ==========
async function takeAttendance() {
    try {
        showLoading('Loading your schedule...');
        
        // Get current day and time
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Try to get teacher's timetable
        let timetable = null;
        try {
            timetable = await apiCall('/timetable?limit=100');
        } catch (err) {
            console.log('No timetable found, will show all classes');
        }
        
        let scheduledClasses = [];
        let currentPeriod = null;
        
        // If timetable exists, get today's schedule
        if (timetable?.timetables?.length > 0) {
            const myTimetable = timetable.timetables[0];
            const todaySchedule = myTimetable.schedule?.find(s => s.day === currentDay);
            
            if (todaySchedule?.periods) {
                // Find current period based on time
                const periodTimes = {
                    1: { start: '09:00', end: '09:40' },
                    2: { start: '09:40', end: '10:20' },
                    3: { start: '10:20', end: '11:00' },
                    4: { start: '11:15', end: '11:55' },
                    5: { start: '11:55', end: '12:35' },
                    6: { start: '12:35', end: '13:15' },
                    7: { start: '14:00', end: '14:40' },
                    8: { start: '14:40', end: '15:20' },
                    9: { start: '15:20', end: '16:00' }
                };
                
                for (let period of todaySchedule.periods) {
                    const times = periodTimes[period.periodNumber];
                    if (times && currentTimeStr >= times.start && currentTimeStr <= times.end) {
                        currentPeriod = period;
                        break;
                    }
                }
                
                scheduledClasses = todaySchedule.periods;
            }
        }
        
        hideLoading();
        
        // If we found current period, auto-select it
        if (currentPeriod) {
            const confirmMsg = `Take attendance for ${currentPeriod.subject?.name || 'current class'} (Period ${currentPeriod.periodNumber})?`;
            if (confirm(confirmMsg)) {
                // Get class from timetable
                const classData = await apiCall('/classes');
                const classes = classData.classes || [];
                if (classes.length > 0) {
                    proceedToAttendanceMarking(null, classes[0]._id, new Date().toISOString().split('T')[0], currentPeriod.periodNumber);
                    return;
                }
            }
        }
        
        // Show schedule-based selection
        if (scheduledClasses.length > 0) {
            const periodOptions = scheduledClasses.map(p => 
                `<option value="${p.periodNumber}">${p.subject?.name || 'Period ' + p.periodNumber} - Period ${p.periodNumber} (${p.startTime}-${p.endTime}) ${p.room ? '@ ' + p.room : ''}</option>`
            ).join('');
            
            const modalContent = `
                <div class="schedule-info">
                    <h3><i class="fas fa-calendar-day"></i> ${currentDay}'s Schedule</h3>
                    <p>Select the period you want to take attendance for:</p>
                </div>
                <form id="attendance-form">
                    <div class="input-group">
                        <label><i class="fas fa-clock"></i> Period from Your Schedule *</label>
                        <select id="attendance-period-select" required class="select-input">
                            <option value="">Select a period...</option>
                            ${periodOptions}
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar"></i> Date</label>
                        <input type="date" id="attendance-date" value="${new Date().toISOString().split('T')[0]}" required>
                    </div>
                </form>
            `;
            
            showModal('Take Attendance from Schedule', modalContent, [
                { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
                { text: 'Continue', type: 'primary', action: 'proceedFromSchedule()', icon: 'fas fa-arrow-right' }
            ]);
        } else {
            // Fallback to manual selection
            showError('No schedule found for today. Please contact administration to set up your timetable.');
        }
    } catch (error) {
        hideLoading();
        showError('Failed to load schedule: ' + error.message);
        console.error(error);
    }
}

async function proceedToAttendanceMarking(e, preselectedClassId = null, preselectedDate = null, preselectedPeriod = null) {
    let classId = preselectedClassId;
    let date = preselectedDate;
    let period = preselectedPeriod;
    
    if (!classId) {
        classId = document.getElementById('attendance-class')?.value;
        date = document.getElementById('attendance-date')?.value;
        period = document.getElementById('attendance-period')?.value;
    }
    
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
        const [studentsData, classesData] = await Promise.all([
            apiCall('/students?limit=200'),
            apiCall('/classes')
        ]);
        hideLoading();
        
        const students = studentsData.students || [];
        const classes = classesData.classes || [];
        
        const studentOptions = students.map(s => 
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
                    <input type="number" id="behavior-points" value="${type === 'Positive' ? 1 : -1}" step="1" readonly>
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
    const points = type === 'Positive' ? 1 : -1;
    const severity = document.getElementById('behavior-severity')?.value || 'Medium';
    
    if (!student || !category || !title || !description) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        closeModal();
        showLoading('Submitting behavior log...');
        
        const payload = {
            student,
            type,
            category,
            severity: type === 'Negative' ? severity : undefined,
            title,
            description,
            date: date || new Date().toISOString().split('T')[0],
            points: points
        };
        
        // Only add class if selected
        if (classId) {
            payload.class = classId;
        }
        
        await apiCall('/behavior', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        hideLoading();
        showSuccess('Behavior logged successfully!');
        loadBehaviorLogs();
    } catch (error) {
        hideLoading();
        showError('Failed to log behavior: ' + error.message);
        console.error(error);
    }
}

async function loadBehaviorLogs() {
    try {
        const data = await apiCall('/behavior?limit=200');
        const logs = data.behaviors || data.behavior || [];

        const behaviorLog = document.getElementById('behavior-log');
        if (!behaviorLog) return;

        const positiveCount = logs.filter(l => l.type === 'Positive').length;
        const negativeCount = logs.filter(l => l.type === 'Negative').length;
        const totalCount = positiveCount + negativeCount;
        const behaviorPercentage = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

        const percentageEl = document.getElementById('behavior-percentage');
        if (percentageEl) percentageEl.textContent = `${behaviorPercentage}%`;

        const positiveEl = document.getElementById('behavior-positive-count');
        if (positiveEl) positiveEl.textContent = positiveCount;

        const negativeEl = document.getElementById('behavior-negative-count');
        if (negativeEl) negativeEl.textContent = negativeCount;

        behaviorLog.innerHTML = logs.length > 0
            ? logs.map(log => `
                <div class="behavior-entry ${log.type?.toLowerCase()}">
                    <div class="behavior-entry-header">
                        <strong>${log.student?.user?.firstName || ''} ${log.student?.user?.lastName || ''}</strong>
                        <span class="badge-${log.type === 'Positive' ? 'success' : 'danger'}">${log.type}</span>
                    </div>
                    <div class="behavior-entry-body">
                        <p><strong>${log.title || 'Behavior Log'}</strong></p>
                        <p class="text-muted">${log.description || ''}</p>
                        <small>${log.date ? new Date(log.date).toLocaleDateString() : ''} · Points: ${log.points ?? 0}</small>
                    </div>
                </div>
            `).join('')
            : `<div class="empty-state"><i class="fas fa-star"></i><p>No behavior logs yet.</p></div>`;

        renderBehaviorChart(positiveCount, negativeCount);
    } catch (error) {
        console.error('Failed to load behavior logs:', error);
    }
}

function renderBehaviorChart(positiveCount, negativeCount) {
    const canvas = document.getElementById('behavior-pie-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (window.behaviorChartInstance) {
        window.behaviorChartInstance.destroy();
    }

    window.behaviorChartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
            labels: ['Positive', 'Negative'],
            datasets: [
                {
                    data: [positiveCount, negativeCount],
                    backgroundColor: ['#10B981', '#EF4444'],
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

async function createAssignment() {
    try {
        showLoading('Loading assignment form...');
        const [classesData, subjectsData] = await Promise.all([
            apiCall('/classes?limit=200').catch(() => ({ classes: [] })),
            apiCall('/subjects').catch(() => ({ subjects: [] }))
        ]);
        hideLoading();

        const classOptions = (classesData.classes || []).map(c => `<option value="${c._id}">${c.name}</option>`).join('');
        const subjectOptions = (subjectsData.subjects || []).map(s => `<option value="${s._id}">${s.name}</option>`).join('');

        const modalContent = `
            <form id="assignment-form">
                <div class="input-group">
                    <label><i class="fas fa-heading"></i> Title *</label>
                    <input type="text" id="assignment-title" required placeholder="Assignment title">
                </div>
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-book"></i> Class *</label>
                        <select id="assignment-class" class="select-input" required>
                            <option value="">Select class...</option>
                            ${classOptions}
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-book-open"></i> Subject *</label>
                        <select id="assignment-subject" class="select-input" required>
                            <option value="">Select subject...</option>
                            ${subjectOptions}
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar"></i> Submission Date *</label>
                        <input type="date" id="assignment-submission" required>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-percent"></i> Passing % *</label>
                        <input type="number" id="assignment-passing" min="1" max="100" value="40" required>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-eye"></i> Visibility</label>
                        <select id="assignment-visible" class="select-input">
                            <option value="true">Visible</option>
                            <option value="false">Hidden</option>
                        </select>
                    </div>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-align-left"></i> Instructions</label>
                    <textarea id="assignment-instructions" rows="4" placeholder="Assignment instructions..."></textarea>
                </div>
            </form>
        `;

        showModal('Create Assignment', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Create', type: 'primary', action: 'submitAssignment()', icon: 'fas fa-save' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load assignment form');
    }
}

async function submitAssignment() {
    const title = document.getElementById('assignment-title').value.trim();
    const classId = document.getElementById('assignment-class').value;
    const subject = document.getElementById('assignment-subject').value;
    const submissionDate = document.getElementById('assignment-submission').value;
    const passingPercentage = parseInt(document.getElementById('assignment-passing').value, 10);
    const isVisible = document.getElementById('assignment-visible').value === 'true';
    const instructions = document.getElementById('assignment-instructions').value.trim();

    if (!title || !classId || !subject || !submissionDate || !passingPercentage) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        closeModal();
        showLoading('Creating assignment...');
        await apiCall('/assessments', {
            method: 'POST',
            body: JSON.stringify({
                title,
                type: 'Assignment',
                class: classId,
                subject,
                academicYear: '2025-2026',
                term: 'Term 1',
                date: submissionDate,
                submissionDate,
                maxMarks: 100,
                passingMarks: passingPercentage,
                passingPercentage,
                isVisible,
                instructions
            })
        });
        hideLoading();
        showSuccess('Assignment created successfully!');
    } catch (error) {
        hideLoading();
        showError('Failed to create assignment: ' + error.message);
    }
}

async function createLesson() {
    try {
        showLoading('Loading lesson form...');
        const [classesData, roomsData, periodsData] = await Promise.all([
            apiCall('/classes?limit=200').catch(() => ({ classes: [] })),
            apiCall('/rooms?limit=200').catch(() => ({ rooms: [] })),
            apiCall('/periods').catch(() => ({ periods: [] }))
        ]);
        hideLoading();

        const classOptions = (classesData.classes || []).map(c => `<option value="${c._id}">${c.name}</option>`).join('');
        const roomOptions = (roomsData.rooms || []).map(r => `<option value="${r._id}">${r.roomNumber} - ${r.roomName}</option>`).join('');
        const periodOptions = (periodsData.periods || []).map(p => `<option value="${p._id}">${p.name} (${p.startTime}-${p.endTime})</option>`).join('');

        const modalContent = `
            <form id="lesson-form">
                <div class="form-grid">
                    <div class="input-group">
                        <label><i class="fas fa-book"></i> Class *</label>
                        <select id="lesson-class" class="select-input" required>
                            <option value="">Select class...</option>
                            ${classOptions}
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar"></i> Day *</label>
                        <select id="lesson-day" class="select-input" required>
                            <option value="">Select day...</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-clock"></i> Period *</label>
                        <select id="lesson-period" class="select-input" required>
                            <option value="">Select period...</option>
                            ${periodOptions}
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-door-open"></i> Room</label>
                        <select id="lesson-room" class="select-input">
                            <option value="">Select room...</option>
                            ${roomOptions}
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar-alt"></i> Start Date *</label>
                        <input type="date" id="lesson-start" required>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-sync"></i> Recurring Weekly</label>
                        <select id="lesson-recurring" class="select-input">
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                        </select>
                    </div>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-align-left"></i> Notes</label>
                    <textarea id="lesson-notes" rows="3" placeholder="Lesson notes..."></textarea>
                </div>
            </form>
        `;

        showModal('Create Lesson', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Create Lesson', type: 'primary', action: 'submitLesson()', icon: 'fas fa-save' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load lesson form');
    }
}

async function createPeriod() {
    const modalContent = `
        <form id="period-form">
            <div class="form-grid">
                <div class="input-group">
                    <label><i class="fas fa-clock"></i> Name *</label>
                    <input type="text" id="period-name" required placeholder="Period 1">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-sort-numeric-up"></i> Order *</label>
                    <input type="number" id="period-order" required min="1" value="1">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-hourglass-start"></i> Start Time *</label>
                    <input type="time" id="period-start" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-hourglass-end"></i> End Time *</label>
                    <input type="time" id="period-end" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-coffee"></i> Break Period</label>
                    <select id="period-break" class="select-input">
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                    </select>
                </div>
            </div>
        </form>
    `;

    showModal('Create Period', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Save Period', type: 'primary', action: 'submitPeriod()', icon: 'fas fa-save' }
    ]);
}

async function submitPeriod() {
    const name = document.getElementById('period-name').value.trim();
    const order = parseInt(document.getElementById('period-order').value, 10);
    const startTime = document.getElementById('period-start').value;
    const endTime = document.getElementById('period-end').value;
    const isBreak = document.getElementById('period-break').value === 'true';

    if (!name || !order || !startTime || !endTime) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        closeModal();
        showLoading('Saving period...');
        await apiCall('/periods', {
            method: 'POST',
            body: JSON.stringify({ name, order, startTime, endTime, isBreak })
        });
        hideLoading();
        showSuccess('Period saved successfully!');
    } catch (error) {
        hideLoading();
        showError('Failed to save period: ' + error.message);
    }
}

async function submitLesson() {
    const classId = document.getElementById('lesson-class').value;
    const dayOfWeek = document.getElementById('lesson-day').value;
    const period = document.getElementById('lesson-period').value;
    const room = document.getElementById('lesson-room').value || undefined;
    const startDate = document.getElementById('lesson-start').value;
    const isRecurring = document.getElementById('lesson-recurring').value === 'true';
    const notes = document.getElementById('lesson-notes').value.trim();

    if (!classId || !dayOfWeek || !period || !startDate) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        closeModal();
        showLoading('Creating lesson...');
        await apiCall('/lessons', {
            method: 'POST',
            body: JSON.stringify({
                class: classId,
                dayOfWeek,
                period,
                room,
                startDate,
                isRecurring,
                notes
            })
        });
        hideLoading();
        showSuccess('Lesson created successfully!');
    } catch (error) {
        hideLoading();
        showError('Failed to create lesson: ' + error.message);
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
            title: 'Welcome to MISpal!',
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
    confirmDialog('Clear All Notifications?', 'This action cannot be undone. All notifications will be permanently deleted.', () => {
        notifications = [];
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
        showSuccess('All notifications cleared');
    });
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
async function addTeacher() { 
    const modalContent = `
        <form id="add-teacher-form">
            <div class="form-grid-2">
                <div class="input-group">
                    <label><i class="fas fa-user"></i> First Name *</label>
                    <input type="text" id="new-teacher-firstName" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-user"></i> Last Name *</label>
                    <input type="text" id="new-teacher-lastName" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-envelope"></i> Email *</label>
                    <input type="email" id="new-teacher-email" required>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-lock"></i> Password *</label>
                    <input type="password" id="new-teacher-password" required placeholder="Minimum 6 characters">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-phone"></i> Phone</label>
                    <input type="tel" id="new-teacher-phone">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-id-card"></i> Employee ID *</label>
                    <input type="text" id="new-teacher-employeeId" required placeholder="e.g., T001">
                </div>
                <div class="input-group">
                    <label><i class="fas fa-chalkboard"></i> Department *</label>
                    <select id="new-teacher-department" class="select-input" required>
                        <option value="">Select department...</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="English">English</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                        <option value="Geography">Geography</option>
                        <option value="Languages">Languages</option>
                        <option value="Arts">Arts</option>
                        <option value="PE">Physical Education</option>
                        <option value="Technology">Technology</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="input-group">
                    <label><i class="fas fa-briefcase"></i> Position</label>
                    <input type="text" id="new-teacher-position" placeholder="e.g., Head of Department">
                </div>
            </div>
        </form>
    `;
    
    showModal('Add New Teacher', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Add Teacher', type: 'primary', action: 'submitNewTeacher()', icon: 'fas fa-user-plus' }
    ]);
}

async function submitNewTeacher() {
    const firstName = document.getElementById('new-teacher-firstName').value;
    const lastName = document.getElementById('new-teacher-lastName').value;
    const email = document.getElementById('new-teacher-email').value;
    const password = document.getElementById('new-teacher-password').value;
    const phone = document.getElementById('new-teacher-phone').value;
    const employeeId = document.getElementById('new-teacher-employeeId').value;
    const department = document.getElementById('new-teacher-department').value;
    const position = document.getElementById('new-teacher-position').value;
    
    if (!firstName || !lastName || !email || !password || !employeeId || !department) {
        showError('Please fill in all required fields');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    closeModal();
    showLoading('Adding teacher...');
    
    try {
        await apiCall('/teachers', 'POST', {
            firstName, lastName, email, password, phone, employeeId, department, position
        });
        hideLoading();
        showSuccess('Teacher added successfully!');
        await loadTeachers();
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to add teacher');
        console.error(error);
    }
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
function showModal(title, content, buttons = [], size = 'medium') {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = `modal-content ${size === 'large' ? 'modal-large' : ''}`;
    
    modal.innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
            <button class="modal-close" data-action="close">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            ${content}
        </div>
        ${buttons.length > 0 ? `
            <div class="modal-footer">
                ${buttons.map(btn => `
                    <button class="btn-${btn.type || 'primary'}" data-action="${btn.action}">
                        ${btn.icon ? `<i class="${btn.icon}"></i>` : ''} ${btn.text}
                    </button>
                `).join('')}
            </div>
        ` : ''}
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;
        const action = button.getAttribute('data-action');
        if (!action || action === 'close' || action === 'closeModal()' || action === 'closeModal') {
            closeModal();
            return;
        }
        try {
            const fn = new Function(action);
            fn();
        } catch (err) {
            console.error('Modal action failed:', err);
        }
    });
    
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
                <button class="btn-primary" data-confirm-action="cancel">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn-danger" data-confirm-action="confirm">
                    <i class="fas fa-check"></i> Confirm
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
        const action = e.target.closest('[data-confirm-action]')?.getAttribute('data-confirm-action');
        if (!action) return;
        if (action === 'cancel') {
            closeConfirm();
        }
        if (action === 'confirm') {
            closeConfirm();
            onConfirm();
        }
    });
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

// ========== ANIMATED LOGIN/LOGOUT ==========
function showAnimatedLogin() {
    const overlay = document.createElement('div');
    overlay.id = 'login-animation';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #FFB3B3 0%, #FF6B6B 50%, #FF5252 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center; color: white;">
            <div class="spinner" style="margin: 0 auto 1.5rem"></div>
            <h2 style="font-size: 1.5rem; font-weight: 600;">Logging in...</h2>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function hideAnimatedLogin() {
    const overlay = document.getElementById('login-animation');
    if (overlay) overlay.remove();
}

async function showWelcomeAnimation() {
    return new Promise((resolve) => {
        const now = new Date();
        const hour = now.getHours();
        let greeting = 'Good Evening';
        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';
        
        const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
        
        const overlay = document.getElementById('login-animation');
        if (!overlay) return resolve();
        
        overlay.innerHTML = `
            <div style="text-align: center; color: white; position: relative; width: 100%;">
                <div id="welcome-person" style="font-size: 8rem; opacity: 0; transform: translateX(-100px); transition: all 0.5s ease-out;">
                    👋
                </div>
                <div id="welcome-text" style="opacity: 0; transform: translateY(20px); transition: all 0.5s ease-out;">
                    <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem;">${greeting}</h1>
                    <p style="font-size: 1.5rem; font-weight: 600;">${fullName}</p>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            document.getElementById('welcome-person').style.opacity = '1';
            document.getElementById('welcome-person').style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            document.getElementById('welcome-text').style.opacity = '1';
            document.getElementById('welcome-text').style.transform = 'translateY(0)';
        }, 600);
        
        setTimeout(() => {
            document.getElementById('welcome-person').style.transform = 'translateX(100px)';
            document.getElementById('welcome-person').style.opacity = '0';
        }, 2600);
        
        setTimeout(() => {
            document.getElementById('welcome-text').style.transform = 'translateY(-50px) scale(1.2)';
            document.getElementById('welcome-text').style.opacity = '0';
        }, 3100);
        
        setTimeout(() => {
            overlay.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 500);
        }, 3600);
    });
}

async function showGoodbyeAnimation() {
    return new Promise((resolve) => {
        const fullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User';
        
        const overlay = document.createElement('div');
        overlay.id = 'goodbye-animation';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #FFB3B3 0%, #FF6B6B 50%, #FF5252 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 8rem; margin-bottom: 1rem;">👋</div>
                <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">Goodbye, ${fullName}</h1>
                <p style="font-size: 1.25rem;">See you soon!</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 500);
        }, 2000);
    });
}

// ========== MESSAGES & COMMUNICATIONS ==========
async function loadMessages(folder = 'inbox') {
    try {
        showLoading('Loading messages...');
        const data = await apiCall(`/messages?folder=${folder}&limit=50`);
        displayMessages(data.messages || [], folder);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load messages');
        console.error(error);
    }
}

function displayMessages(messages, folder) {
    const listEl = document.getElementById('message-list');
    if (!listEl) return;
    
    if (messages.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><i class="fas fa-envelope-open"></i><p>No messages in ' + folder + '</p></div>';
        return;
    }
    
    listEl.innerHTML = messages.map(msg => `
        <div class="message-item ${msg.recipients?.find(r => r.user === currentUser?._id && !r.read) ? 'unread' : ''}" 
             onclick="viewMessage('${msg._id}')">
            <div class="message-avatar">
                ${msg.sender?.profileImage ? 
                    `<img src="${msg.sender.profileImage}" alt="${msg.sender?.firstName}">` :
                    `<i class="fas fa-user-circle"></i>`
                }
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${msg.sender?.firstName} ${msg.sender?.lastName}</span>
                    <span class="message-time">${formatDate(msg.sentAt)}</span>
                </div>
                <div class="message-subject">${msg.subject}</div>
                <div class="message-preview">${msg.body?.substring(0, 100)}...</div>
            </div>
            ${msg.priority === 'High' ? '<span class="priority-badge">High Priority</span>' : ''}
        </div>
    `).join('');
}

async function viewMessage(messageId) {
    try {
        showLoading('Loading message...');
        const message = await apiCall(`/messages/${messageId}`);
        hideLoading();
        
        const modalContent = `
            <div class="message-view">
                <div class="message-meta">
                    <div class="message-sender-info">
                        ${message.sender?.profileImage ? 
                            `<img src="${message.sender.profileImage}" class="avatar-lg">` :
                            `<i class="fas fa-user-circle avatar-lg"></i>`
                        }
                        <div>
                            <h3>${message.sender?.firstName} ${message.sender?.lastName}</h3>
                            <p class="text-muted">${message.sender?.email}</p>
                        </div>
                    </div>
                    <div class="message-date">${formatDateTime(message.sentAt)}</div>
                </div>
                <h2 class="message-subject-full">${message.subject}</h2>
                <div class="message-body">${message.body}</div>
                ${message.attachments?.length ? `
                    <div class="message-attachments">
                        <h4><i class="fas fa-paperclip"></i> Attachments</h4>
                        ${message.attachments.map(att => `
                            <a href="${att.url}" class="attachment-item" target="_blank">
                                <i class="fas fa-file"></i> ${att.filename}
                            </a>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        showModal('Message', modalContent, [
            { text: 'Close', type: 'secondary', action: 'closeModal()' },
            { text: 'Reply', type: 'primary', action: `replyToMessage('${messageId}')`, icon: 'fas fa-reply' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load message');
        console.error(error);
    }
}

async function composeNewMessage() {
    const modalContent = `
        <form id="compose-message-form">
            <div class="input-group">
                <label><i class="fas fa-users"></i> Recipient Type *</label>
                <select id="msg-recipient-type" class="select-input" required onchange="handleRecipientTypeChange(this.value)">
                    <option value="">Select recipient type...</option>
                    <option value="individual">Individual</option>
                    <option value="class">Class</option>
                    <option value="all-students">All Students</option>
                    <option value="all-teachers">All Teachers</option>
                    <option value="all-parents">All Parents</option>
                </select>
            </div>
            <div id="recipient-selector" class="input-group hidden">
                <label><i class="fas fa-user"></i> Select Recipient</label>
                <select id="msg-recipients" multiple class="select-input"></select>
            </div>
            <div class="input-group">
                <label><i class="fas fa-heading"></i> Subject *</label>
                <input type="text" id="msg-subject" required placeholder="Enter subject...">
            </div>
            <div class="input-group">
                <label><i class="fas fa-envelope"></i> Message *</label>
                <textarea id="msg-body" required rows="6" placeholder="Type your message..."></textarea>
            </div>
            <div class="input-group">
                <label><i class="fas fa-flag"></i> Priority</label>
                <select id="msg-priority" class="select-input">
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>
            </div>
        </form>
    `;
    
    showModal('Compose Message', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Send Message', type: 'success', action: 'sendMessage()', icon: 'fas fa-paper-plane' }
    ]);
}

async function handleRecipientTypeChange(type) {
    const selector = document.getElementById('recipient-selector');
    const recipientSelect = document.getElementById('msg-recipients');
    
    if (type === 'individual') {
        selector.classList.remove('hidden');
        // Load users
        const users = await apiCall('/users?limit=100').catch(() => ({ users: [] }));
        recipientSelect.innerHTML = (users.users || []).map(u => 
            `<option value="${u._id}">${u.firstName} ${u.lastName} (${u.email})</option>`
        ).join('');
    } else if (type === 'class') {
        selector.classList.remove('hidden');
        const data = await apiCall('/classes').catch(() => ({ classes: [] }));
        recipientSelect.innerHTML = (data.classes || []).map(c => 
            `<option value="${c._id}">${c.name} - ${c.yearGroup}</option>`
        ).join('');
    } else {
        selector.classList.add('hidden');
    }
}

async function sendMessage() {
    const recipientType = document.getElementById('msg-recipient-type').value;
    const subject = document.getElementById('msg-subject').value;
    const body = document.getElementById('msg-body').value;
    const priority = document.getElementById('msg-priority').value;
    
    if (!recipientType || !subject || !body) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        closeModal();
        showLoading('Sending message...');
        
        const payload = {
            recipientType,
            subject,
            body,
            priority,
            type: 'Broadcast',
            category: 'General'
        };
        
        if (recipientType === 'individual' || recipientType === 'class') {
            const selected = Array.from(document.getElementById('msg-recipients').selectedOptions).map(o => o.value);
            if (recipientType === 'individual') {
                payload.recipients = selected;
            } else {
                payload.relatedClass = selected[0];
            }
        }
        
        await apiCall('/messages', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        hideLoading();
        showSuccess('Message sent successfully!');
        await loadMessages();
    } catch (error) {
        hideLoading();
        showError('Failed to send message: ' + error.message);
        console.error(error);
    }
}

// ========== PAYMENTS & PAYROLL ==========
async function loadPayments() {
    try {
        showLoading('Loading payments...');
        const data = await apiCall('/payments?limit=50');
        displayPayments(data.payments || []);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load payments');
        console.error(error);
    }
}

function displayPayments(payments) {
    const container = document.getElementById('payments-list');
    if (!container) return;
    
    if (payments.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>No payment records found</p></div>';
        return;
    }
    
    const tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${payments.map(payment => `
                    <tr>
                        <td>${payment.student?.user?.firstName || ''} ${payment.student?.user?.lastName || ''}</td>
                        <td>${payment.type}</td>
                        <td>€${payment.amount?.toFixed(2)}</td>
                        <td><span class="status-badge status-${payment.status?.toLowerCase()}">${payment.status}</span></td>
                        <td>${formatDate(payment.dueDate)}</td>
                        <td>
                            <button class="btn-sm" onclick="viewPayment('${payment._id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// ========== TIMETABLE MANAGEMENT ==========
async function loadMyTimetable() {
    try {
        showLoading('Loading timetable...');
        const data = await apiCall('/timetable/teacher/me/current').catch(() => null);
        
        if (!data) {
            // Try loading all timetables and filter
            const allData = await apiCall('/timetable?limit=50');
            displayTimetableGrid(allData.timetables?.[0] || null);
        } else {
            displayTimetableGrid(data);
        }
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error(error);
        displayTimetableGrid(null);
    }
}

function displayTimetableGrid(timetable) {
    const container = document.getElementById('timetable-display');
    if (!container) return;
    
    if (!timetable || !timetable.schedule) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar"></i><p>No timetable available</p></div>';
        return;
    }
    
    const periods = ['Class 1', 'Class 2', 'Class 3', 'Break', 'Class 4', 'Class 5', 'Class 6', 'Lunch', 'Class 7', 'Class 8', 'Class 9'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    let html = `
        <table class="timetable-grid">
            <thead>
                <tr>
                    <th>Period</th>
                    ${days.map(day => `<th>${day}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    periods.forEach((period, idx) => {
        html += `<tr><td class="period-label">${period}</td>`;
        days.forEach(day => {
            const daySchedule = timetable.schedule?.find(s => s.day === day);
            const periodData = daySchedule?.periods?.find(p => p.periodNumber === idx + 1);
            
            if (period === 'Break' || period === 'Lunch') {
                html += `<td class="break-cell">${period}</td>`;
            } else if (periodData) {
                html += `
                    <td class="period-cell">
                        <div class="period-subject">${periodData.subject?.name || 'N/A'}</div>
                        <div class="period-room">${periodData.room || ''}</div>
                        <div class="period-time">${periodData.startTime} - ${periodData.endTime}</div>
                    </td>
                `;
            } else {
                html += '<td class="empty-cell">-</td>';
            }
        });
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ========== UTILITY FUNCTIONS ==========
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IE', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========== SCHEDULE-BASED ATTENDANCE ==========
async function proceedFromSchedule() {
    const periodNum = document.getElementById('attendance-period-select')?.value;
    const date = document.getElementById('attendance-date')?.value;
    
    if (!periodNum || !date) {
        showError('Please select a period and date');
        return;
    }
    
    try {
        closeModal();
        showLoading('Loading class roster...');
        
        // Get classes for this teacher
        const classData = await apiCall('/classes');
        const classes = classData.classes || [];
        
        if (classes.length === 0) {
            hideLoading();
            showError('No classes found. Please contact administration.');
            return;
        }
        
        // Use first class for now (in production, match with timetable)
        const classId = classes[0]._id;
        await proceedToAttendanceMarking(null, classId, date, parseInt(periodNum));
    } catch (error) {
        hideLoading();
        showError('Failed to load class: ' + error.message);
        console.error(error);
    }
}

// ========== STUDENT DASHBOARD ==========
async function loadStudentDashboard() {
    try {
        showLoading('Loading your dashboard...');
        
        // Get student data
        const studentData = await apiCall('/students?limit=1').catch(() => ({ students: [] }));
        const student = studentData.students?.[0];
        
        // Get timetable, attendance, assessments in parallel
        const [timetable, attendance, behavior] = await Promise.all([
            apiCall('/timetable?limit=1').catch(() => ({ timetables: [] })),
            apiCall('/attendance?limit=10').catch(() => ({ attendance: [] })),
            apiCall('/behavior?limit=5').catch(() => ({ behaviors: [] }))
        ]);
        
        hideLoading();
        
        const container = document.getElementById('student-dashboard-content');
        if (!container) return;
        
        const attendanceRate = calculateAttendanceRate(attendance.attendance || []);
        const recentBehavior = (behavior.behaviors || []).slice(0, 5);
        
        container.innerHTML = `
            <div class=\"dashboard-grid-student\">
                <div class=\"dash-card\">
                    <div class=\"dash-card-header\">
                        <h3><i class=\"fas fa-user-circle\"></i> My Profile</h3>
                    </div>
                    <div class=\"dash-card-body\">
                        <div class=\"profile-info\">
                            <p><strong>Name:</strong> ${currentUser?.firstName || ''} ${currentUser?.lastName || ''}</p>
                            <p><strong>Student ID:</strong> ${student?.studentId || 'N/A'}</p>
                            <p><strong>Year:</strong> ${student?.yearGroup || 'N/A'}</p>
                            <p><strong>House:</strong> ${student?.house || 'N/A'}</p>
                            <p><strong>Email:</strong> ${currentUser?.email || 'N/A'}</p>
                        </div>
                        <button class=\"btn-primary full-width\" onclick=\"viewMyProfile()\">
                            <i class=\"fas fa-edit\"></i> Edit Profile
                        </button>
                    </div>
                </div>
                
                <div class=\"dash-card\">
                    <div class=\"dash-card-header\">
                        <h3><i class=\"fas fa-calendar-alt\"></i> My Timetable</h3>
                        <button class=\"btn-sm\" onclick=\"showSection('my-timetable')\">View Full</button>
                    </div>
                    <div class=\"dash-card-body\">
                        ${timetable.timetables?.[0] ? 
                            '<p>Your timetable is available. Click "View Full" to see your weekly schedule.</p>' :
                            '<p class=\"text-muted\">No timetable available yet.</p>'
                        }
                        <button class=\"btn-primary full-width\" onclick=\"showSection('my-timetable')\">
                            <i class=\"fas fa-calendar\"></i> View My Schedule
                        </button>
                    </div>
                </div>
                
                <div class=\"dash-card\">
                    <div class=\"dash-card-header\">
                        <h3><i class=\"fas fa-chart-line\"></i> Attendance</h3>
                    </div>
                    <div class=\"dash-card-body\">
                        <div class=\"stat-large\">
                            <div class=\"stat-value\">${attendanceRate}%</div>
                            <div class=\"stat-label\">Attendance Rate</div>
                        </div>
                        <div class=\"attendance-breakdown\">
                            <div class=\"stat-item\">
                                <i class=\"fas fa-check-circle text-success\"></i>
                                <span>Present: ${(attendance.attendance || []).filter(a => a.status === 'Present').length}</span>
                            </div>
                            <div class=\"stat-item\">
                                <i class=\"fas fa-times-circle text-danger\"></i>
                                <span>Absent: ${(attendance.attendance || []).filter(a => a.status === 'Absent').length}</span>
                            </div>
                            <div class=\"stat-item\">
                                <i class=\"fas fa-clock text-warning\"></i>
                                <span>Late: ${(attendance.attendance || []).filter(a => a.status === 'Late').length}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class=\"dash-card\">
                    <div class=\"dash-card-header\">
                        <h3><i class=\"fas fa-star\"></i> Recent Behavior</h3>
                    </div>
                    <div class=\"dash-card-body\">
                        ${recentBehavior.length > 0 ? `
                            <div class=\"behavior-list\">
                                ${recentBehavior.map(b => `
                                    <div class=\"behavior-item ${b.type?.toLowerCase()}\">
                                        <i class=\"fas fa-${b.type === 'Positive' ? 'smile' : 'exclamation-triangle'}\"></i>
                                        <div>
                                            <strong>${b.title}</strong>
                                            <p class=\"text-muted small\">${formatDate(b.date)}</p>
                                        </div>
                                        <span class=\"badge badge-${b.type?.toLowerCase()}\">${b.type}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class=\"text-muted\">No recent behavior logs.</p>'}
                    </div>
                </div>
                
                <div class=\"dash-card\">
                    <div class=\"dash-card-header\">
                        <h3><i class=\"fas fa-envelope\"></i> Messages</h3>
                        <button class=\"btn-sm\" onclick=\"showSection('messages')\">View All</button>
                    </div>
                    <div class=\"dash-card-body\">
                        <button class=\"btn-primary full-width\" onclick=\"showSection('messages', 'inbox')\">
                            <i class=\"fas fa-inbox\"></i> Check Messages
                        </button>
                    </div>
                </div>
                
                <div class=\"dash-card\">
                    <div class=\"dash-card-header\">
                        <h3><i class=\"fas fa-graduation-cap\"></i> My Assessments</h3>
                    </div>
                    <div class=\"dash-card-body\">
                        <p>View your grades and assessment results</p>
                        <button class=\"btn-primary full-width\" onclick=\"viewMyAssessments()\">
                            <i class=\"fas fa-file-alt\"></i> View Grades
                        </button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        hideLoading();
        console.error('Error loading student dashboard:', error);
        showError('Failed to load dashboard');
    }
}

// ========== PARENT DASHBOARD ==========
async function loadParentDashboard() {
    try {
        showLoading('Loading children information...');
        
        // Parent dashboard is now handled via parent-portal.html
        // This function is for backwards compatibility with teacher portal
        hideLoading();
        
        const container = document.getElementById('parent-dashboard-content');
        if (!container) return;
        
        container.innerHTML = `
            <div class="empty-state">
                <p>Please use the dedicated Parent Portal for the full experience.</p>
                <a href="/parent-portal.html" class="btn-primary" style="display: inline-block; padding: 0.75rem 1.5rem; background: var(--primary); color: white; text-decoration: none; border-radius: 6px; margin-top: 1rem;">
                    Go to Parent Portal
                </a>
            </div>
        `;
    } catch (error) {
        console.error('Error loading parent dashboard:', error);
        hideLoading();
    }
}

// ========== PERSONAL TIMETABLE ==========
async function loadMyPersonalTimetable() {
    try {
        showLoading('Loading your timetable...');
        
        let timetable = null;
        
        // Try different endpoints based on role
        if (currentUser?.role === 'teacher') {
            timetable = await apiCall('/timetable?limit=1').catch(() => null);
        } else if (currentUser?.role === 'student') {
            timetable = await apiCall('/timetable?limit=1').catch(() => null);
        }
        
        hideLoading();
        
        const container = document.getElementById('my-timetable-content');
        if (!container) return;
        
        if (!timetable?.timetables?.[0]) {
            container.innerHTML = `
                <div class=\"empty-state\">
                    <i class=\"fas fa-calendar-times\"></i>
                    <p>No timetable available. Please contact administration.</p>
                </div>
            `;
            return;
        }
        
        const tt = timetable.timetables[0];
        displayPersonalTimetable(tt, container);
    } catch (error) {
        hideLoading();
        console.error('Error loading timetable:', error);
        showError('Failed to load timetable');
    }
}

function createTimetableModal() {
    if (currentUser?.role !== 'teacher') {
        showError('Only teachers can create timetables');
        return;
    }
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = ['Class 1', 'Class 2', 'Class 3', 'Break', 'Class 4', 'Class 5', 'Class 6', 'Lunch', 'Class 7', 'Class 8', 'Class 9'];
    
    let timetableForm = `
        <form id="create-timetable-form">
            <div class="input-group">
                <label><i class="fas fa-book"></i> Select Class *</label>
                <select id="tt-class" class="select-input" required>
                    <option value="">Choose a class...</option>
                </select>
            </div>
            
            <div class="input-group">
                <label><i class="fas fa-user-graduation-cap"></i> Add Students to Class</label>
                <div id="student-selection" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem;">
                    <!-- Students load here -->
                </div>
            </div>
            
            <div style="margin-top: 1.5rem;">
                <h4><i class="fas fa-calendar-grid"></i> Class Schedule</h4>
                <div class="timetable-builder-grid" style="display: grid; grid-template-columns: 120px repeat(5, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-top: 1rem;">
                    <div style="background: var(--bg-main); padding: 1rem; font-weight: 700;">Period</div>
                    ${days.map(day => `<div style="background: var(--primary); color: white; padding: 1rem; font-weight: 700; text-align: center;">${day}</div>`).join('')}
                    
                    ${periods.map(period => {
                        if (period === 'Break' || period === 'Lunch') {
                            return `
                                <div style="background: #FEF3C7; padding: 1rem; font-weight: 700;">${period}</div>
                                <div style="background: #FEF3C7; grid-column: 2 / span 5; padding: 1rem; text-align: center;">
                                    <i class="fas fa-${period === 'Break' ? 'coffee' : 'utensils'}"></i> ${period} Time
                                </div>
                            `;
                        }
                        return `
                            <div style="background: var(--bg-main); padding: 1rem; font-weight: 600;">${period}</div>
                            ${days.map(day => `
                                <label style="display: flex; align-items: center; justify-content: center; padding: 1rem; background: white; cursor: pointer; border: 1px solid var(--border);">
                                    <input type="checkbox" name="period_${period}_${day}" style="cursor: pointer;">
                                </label>
                            `).join('')}
                        `;
                    }).join('')}
                </div>
            </div>
        </form>
    `;
    
    showModal('Create Class Timetable', timetableForm, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Save Timetable', type: 'primary', action: 'submitCreateTimetable()', icon: 'fas fa-save' }
    ]);
    
    // Load classes for selection
    loadTimetableClasses();
}

async function loadTimetableClasses() {
    try {
        const classesData = await apiCall('/classes').catch(() => ({ classes: [] }));
        const classes = classesData.classes || [];
        
        const select = document.getElementById('tt-class');
        if (select) {
            select.innerHTML = '<option value="">Choose a class...</option>' + 
                classes.map(cls => `<option value="${cls._id}" data-class-name="${cls.name}">${cls.name}</option>`).join('');
            select.onchange = () => loadClassStudents();
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function loadClassStudents() {
    const classId = document.getElementById('tt-class')?.value;
    if (!classId) return;
    
    try {
        const studentsData = await apiCall(`/students?class=${classId}`).catch(() => ({ students: [] }));
        const students = studentsData.students || [];
        
        const container = document.getElementById('student-selection');
        if (container) {
            container.innerHTML = students.map(student => `
                <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; cursor: pointer;">
                    <input type="checkbox" name="student_${student._id}" value="${student._id}" style="cursor: pointer;">
                    <span>${student.firstName} ${student.lastName}</span>
                </label>
            `).join('') || '<p class="text-muted">No students in this class</p>';
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function submitCreateTimetable() {
    const classId = document.getElementById('tt-class')?.value;
    if (!classId) {
        showError('Please select a class');
        return;
    }
    
    // Get selected students
    const selectedStudents = Array.from(document.querySelectorAll('input[name^="student_"]:checked')).map(cb => cb.value);
    
    // Get schedule
    const periods = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const schedule = [];
    
    periods.forEach(period => {
        days.forEach(day => {
            const checkbox = document.querySelector(`input[name="period_${period}_${day}"]:checked`);
            if (checkbox) {
                schedule.push({ period, day });
            }
        });
    });
    
    closeModal();
    showLoading('Saving timetable...');
    
    try {
        await apiCall('/timetable', 'POST', {
            class: classId,
            schedule,
            students: selectedStudents,
            academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
            term: 1
        });
        hideLoading();
        showSuccess('Timetable created successfully!');
        await loadMyPersonalTimetable();
    } catch (error) {
        hideLoading();
        showError('Failed to create timetable');
        console.error(error);
    }
}

function displayPersonalTimetable(timetable, container) {
    const periods = [
        { num: 1, time: '09:00', endTime: '09:40', duration: '40min' },
        { num: 2, time: '09:40', endTime: '10:20', duration: '40min' },
        { num: 3, time: '10:20', endTime: '11:00', duration: '40min' },
        { num: 'break', time: '11:00', endTime: '11:15', label: 'Break', duration: '15min' },
        { num: 4, time: '11:15', endTime: '11:55', duration: '40min' },
        { num: 5, time: '11:55', endTime: '12:35', duration: '40min' },
        { num: 6, time: '12:35', endTime: '13:15', duration: '40min' },
        { num: 'lunch', time: '13:15', endTime: '14:00', label: 'Lunch', duration: '45min' },
        { num: 7, time: '14:00', endTime: '14:40', duration: '40min' },
        { num: 8, time: '14:40', endTime: '15:20', duration: '40min' },
        { num: 9, time: '15:20', endTime: '16:00', duration: '40min' }
    ];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    let html = `
        <div class=\"timetable-container\" style="padding: 1.5rem;">
            <div class=\"timetable-header\" style="margin-bottom: 2rem;">
                <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">
                    <i class=\"fas fa-calendar-week\" style="color: var(--primary); margin-right: 0.5rem;\"></i> My Weekly Timetable
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.95rem;">
                    Academic Year: <strong>${timetable.academicYear || '2024-2025'}</strong> | Term: <strong>${timetable.term || '1'}</strong>
                </p>
            </div>
            
            <!-- Days Tabs -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; border-bottom: 2px solid var(--border); padding-bottom: 1rem;">
    `;
    
    days.forEach((day, idx) => {
        const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
        html += `
            <button onclick="switchTimetableDay('${day}')" 
                    id="day-tab-${day}"
                    style="padding: 0.75rem 1.25rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; 
                           background: ${isToday ? 'var(--primary)' : 'var(--bg-hover)'}; 
                           color: ${isToday ? 'white' : 'var(--text-primary)'}; 
                           transition: var(--transition);"
                    class="day-tab-btn">
                ${day}
            </button>
        `;
    });
    
    html += `
            </div>
            
            <!-- Day Schedule -->
            <div class="timetable-day-view">
    `;
    
    days.forEach(day => {
        const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;
        html += `
            <div id="day-view-${day}" style="display: ${isToday ? 'block' : 'none'};">
        `;
        
        periods.forEach((period, idx) => {
            const daySchedule = timetable.schedule?.find(s => s.day === day);
            const periodData = daySchedule?.periods?.find(p => p.periodNumber === period.num);
            
            if (period.label) {
                // Break or Lunch
                const bgColor = period.label === 'Break' ? '#FEF3C7' : '#F0F9FF';
                const icon = period.label === 'Break' ? 'coffee' : 'utensils';
                html += `
                    <div style="background: ${bgColor}; border-left: 4px solid ${period.label === 'Break' ? '#F59E0B' : '#3B82F6'}; 
                               padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center;">
                        <i class="fas fa-${icon}" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
                        <strong style="font-size: 1.1rem;">${period.label}</strong>
                        <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.9rem;">
                            ${period.time} - ${period.endTime} (${period.duration})
                        </p>
                    </div>
                `;
            } else {
                const subjectName = periodData?.subject?.name || 'Free Period';
                const room = periodData?.room || '';
                const teacher = periodData?.teacher ? `${periodData.teacher.firstName} ${periodData.teacher.lastName}` : '';
                const hasPeriod = !!periodData;
                const bgColor = hasPeriod ? '#DBEAFE' : '#F3F4F6';
                const borderColor = hasPeriod ? '#3B82F6' : '#E5E7EB';
                
                html += `
                    <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                            <div>
                                <strong style="font-size: 1.1rem; color: var(--text-primary);">Period ${period.num}</strong>
                                <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.9rem;">
                                    ${period.time} - ${period.endTime}
                                </p>
                            </div>
                            <span style="background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.85rem; font-weight: 600;">
                                ${period.duration}
                            </span>
                        </div>
                        
                        ${hasPeriod ? `
                            <div style="background: white; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid var(--primary);">
                                <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">
                                    <i class="fas fa-book"></i> ${subjectName}
                                </div>
                                ${room ? `<div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.25rem;">
                                    <i class="fas fa-door-open"></i> Room ${room}
                                </div>` : ''}
                                ${teacher && currentUser?.role !== 'teacher' ? `<div style="color: var(--text-secondary); font-size: 0.9rem;">
                                    <i class="fas fa-chalkboard-user"></i> ${teacher}
                                </div>` : ''}
                            </div>
                        ` : `
                            <div style="text-align: center; padding: 1rem; color: var(--text-secondary); font-style: italic;">
                                <i class="fas fa-moon" style="margin-right: 0.5rem;"></i> Free Period
                            </div>
                        `}
                    </div>
                `;
            }
        });
        
        html += `
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div class="timetable-footer" style="margin-top: 2rem; display: flex; gap: 1rem; padding-top: 1.5rem; border-top: 2px solid var(--border);">
                <button onclick="printTimetable()" style="flex: 1; background: var(--primary); color: white; padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-print"></i> Print Timetable
                </button>
                <button onclick="exportTimetable()" style="flex: 1; background: var(--info); color: white; padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-download"></i> Export PDF
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function switchTimetableDay(day) {
    // Hide all day views
    document.querySelectorAll('[id^="day-view-"]').forEach(el => {
        el.style.display = 'none';
    });
    
    // Remove active state from all tabs
    document.querySelectorAll('.day-tab-btn').forEach(btn => {
        btn.style.background = 'var(--bg-hover)';
        btn.style.color = 'var(--text-primary)';
    });
    
    // Show selected day
    const dayView = document.getElementById(`day-view-${day}`);
    if (dayView) dayView.style.display = 'block';
    
    // Highlight selected tab
    const dayTab = document.getElementById(`day-tab-${day}`);
    if (dayTab) {
        dayTab.style.background = 'var(--primary)';
        dayTab.style.color = 'white';
    }
}

// ========== UTILITY FUNCTIONS ==========
function calculateAttendanceRate(attendanceRecords) {
    if (!attendanceRecords || attendanceRecords.length === 0) return 0;
    const present = attendanceRecords.filter(a => a.status === 'Present' || a.status === 'Late').length;
    return Math.round((present / attendanceRecords.length) * 100);
}

function viewMyProfile() {
    showError('Profile editing coming soon!');
}

function viewMyAssessments() {
    showError('Assessments view coming soon!');
}

function viewChildDetails(childId) {
    showError('Child details view coming soon!');
}

function viewChildTimetable(childId) {
    showError('Child timetable view coming soon!');
}

function contactTeacher(childId) {
    showSection('messages', 'compose');
}

function viewCalendar() {
    showError('School calendar coming soon!');
}

function printTimetable() {
    window.print();
}

function exportTimetable() {
    showError('PDF export coming soon!');
}

// ========== ROOM BOOKING WITH AVAILABILITY INDICATORS ==========
async function bookRoom(roomId) {
    try {
        showLoading('Loading room details...');
        const room = await apiCall(`/rooms/${roomId}`);
        const classesData = await apiCall('/classes?limit=200').catch(() => ({ classes: [] }));
        
        // Get today's bookings for this room
        const today = new Date().toISOString().split('T')[0];
        const bookings = await apiCall(`/rooms/${roomId}/bookings?startDate=${today}&endDate=${today}`).catch(() => []);
        
        hideLoading();
        
        // Check which periods are booked
        const bookedPeriods = new Set();
        if (Array.isArray(bookings)) {
            bookings.forEach(booking => {
                if (booking.period) {
                    bookedPeriods.add(booking.period);
                }
            });
        }
        
        const periods = [
            { value: 'Class 1', label: 'Class 1 (9:00 - 9:40)' },
            { value: 'Class 2', label: 'Class 2 (9:40 - 10:20)' },
            { value: 'Class 3', label: 'Class 3 (10:20 - 11:00)' },
            { value: 'Break', label: 'Break (11:00 - 11:15)', disabled: true },
            { value: 'Class 4', label: 'Class 4 (11:15 - 11:55)' },
            { value: 'Class 5', label: 'Class 5 (11:55 - 12:35)' },
            { value: 'Class 6', label: 'Class 6 (12:35 - 1:15)' },
            { value: 'Lunch', label: 'Lunch (1:15 - 2:00)', disabled: true },
            { value: 'Class 7', label: 'Class 7 (2:00 - 2:40)' },
            { value: 'Class 8', label: 'Class 8 (2:40 - 3:20)' },
            { value: 'Class 9', label: 'Class 9 (3:20 - 4:00)' }
        ];
        
        const periodOptions = periods.map(p => {
            const isBooked = bookedPeriods.has(p.value);
            const disabled = p.disabled || isBooked;
            const warningIcon = isBooked ? '⚠️ ' : '';
            const statusText = isBooked ? ' (UNAVAILABLE)' : '';
            return `<option value="${p.value}" ${disabled ? 'disabled' : ''}>${warningIcon}${p.label}${statusText}</option>`;
        }).join('');
        
        // Show current bookings
        let bookingsHTML = '';
        if (Array.isArray(bookings) && bookings.length > 0) {
            bookingsHTML = `
                <div class="current-bookings">
                    <h4><i class="fas fa-calendar-check"></i> Current Bookings (Today)</h4>
                    <div class="bookings-list">
                        ${bookings.map(b => `
                            <div class="booking-item">
                                <span class="booking-period">${b.period || 'N/A'}</span>
                                <span class="booking-purpose">${b.purpose || 'Reserved'}</span>
                                <span class="booking-time">${b.startTime}-${b.endTime}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        const classOptions = (classesData.classes || []).map(c => `<option value="${c._id}">${c.name}</option>`).join('');

        const modalContent = `
            <div class="room-booking-form">
                <div class="room-info">
                    <h3><i class="fas fa-door-open"></i> ${room.roomNumber} - ${room.roomName}</h3>
                    <p><strong>Category:</strong> ${room.category}</p>
                    <p><strong>Capacity:</strong> ${room.capacity || 'N/A'}</p>
                    <p><strong>Floor:</strong> ${room.floor}</p>
                </div>
                
                ${bookingsHTML}
                
                <form id="room-booking-form">
                    <div class="input-group">
                        <label><i class="fas fa-calendar"></i> Date *</label>
                        <input type="date" id="booking-date" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="input-group">
                        <label><i class="fas fa-clock"></i> Period/Time Slot *</label>
                        <select id="booking-period" required class="select-input">
                            <option value="">Select period...</option>
                            ${periodOptions}
                        </select>
                        <small class="help-text">⚠️ = Period already booked</small>
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
                        <label><i class="fas fa-book"></i> Link to Class</label>
                        <select id="booking-class" class="select-input">
                            <option value="">No class</option>
                            ${classOptions}
                        </select>
                    </div>

                    <div class="input-group">
                        <label><i class="fas fa-sync"></i> Booking Type</label>
                        <select id="booking-type" class="select-input" onchange="toggleRecurringFields()">
                            <option value="one-off">One-off</option>
                            <option value="weekly">Recurring Weekly</option>
                        </select>
                    </div>

                    <div class="input-group" id="recurring-end-date" style="display: none;">
                        <label><i class="fas fa-calendar-alt"></i> Recurring End Date</label>
                        <input type="date" id="booking-end-date">
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
        toggleRecurringFields();
    } catch (error) {
        hideLoading();
        showError('Failed to load room details');
        console.error(error);
    }
}

// ========== LEAVE REQUEST SYSTEM ==========
async function requestLeave() {
    const modalContent = `
        <form id="leave-request-form">
            <div class="input-group">
                <label><i class="fas fa-calendar"></i> Leave Type *</label>
                <select id="leave-type" required class="select-input">
                    <option value="">Select type...</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Maternity/Paternity">Maternity/Paternity</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="input-group">
                <label><i class="fas fa-calendar-day"></i> Start Date *</label>
                <input type="date" id="leave-start" required min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="input-group">
                <label><i class="fas fa-calendar-day"></i> End Date *</label>
                <input type="date" id="leave-end" required min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="input-group">
                <label><i class="fas fa-align-left"></i> Reason *</label>
                <textarea id="leave-reason" required rows="4" placeholder="Please explain the reason for leave..."></textarea>
            </div>
            <div class="input-group">
                <label><i class="fas fa-phone"></i> Emergency Contact</label>
                <input type="tel" id="leave-contact" placeholder="Phone number">
            </div>
        </form>
    `;
    
    showModal('Request Leave', modalContent, [
        { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
        { text: 'Submit Request', type: 'primary', action: 'submitLeaveRequest()', icon: 'fas fa-paper-plane' }
    ]);
}

async function submitLeaveRequest() {
    const leaveType = document.getElementById('leave-type').value;
    const startDate = document.getElementById('leave-start').value;
    const endDate = document.getElementById('leave-end').value;
    const reason = document.getElementById('leave-reason').value;
    const contact = document.getElementById('leave-contact').value;
    
    if (!leaveType || !startDate || !endDate || !reason) {
        showError('Please fill in all required fields');
        return;
    }
    
    closeModal();
    showLoading('Submitting leave request...');
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        showSuccess('Leave request submitted successfully! You will be notified once approved.');
    }, 1000);
}

// ========== REPORT GENERATION ==========
async function generateReport(reportType) {
    showLoading('Generating report...');
    
    // Simulate report generation with sample data
    setTimeout(() => {
        hideLoading();
        
        const reportData = getSampleReportData(reportType);
        displayReportModal(reportType, reportData);
    }, 1500);
}

function getSampleReportData(reportType) {
    switch(reportType) {
        case 'academic':
            return {
                title: 'Academic Performance Report',
                period: 'Term 1, 2024-2025',
                data: [
                    { class: 'Fifth Year', avgGrade: '78%', topSubject: 'Mathematics', improvement: '+5%' },
                    { class: 'Fourth Year', avgGrade: '72%', topSubject: 'English', improvement: '+3%' },
                    { class: 'Third Year', avgGrade: '81%', topSubject: 'Science', improvement: '+8%' }
                ]
            };
        case 'attendance':
            return {
                title: 'Attendance Report',
                period: 'November 2025',
                data: [
                    { yearGroup: 'Fifth Year', present: '92%', absent: '5%', late: '3%' },
                    { yearGroup: 'Fourth Year', present: '89%', absent: '7%', late: '4%' },
                    { yearGroup: 'Third Year', present: '94%', absent: '4%', late: '2%' }
                ]
            };
        case 'behavior':
            return {
                title: 'Behavior Report',
                period: 'November 2025',
                data: [
                    { house: 'Bride', positive: 45, negative: 8, points: 185 },
                    { house: 'Ide', positive: 52, negative: 5, points: 235 },
                    { house: 'Tola', positive: 38, negative: 12, points: 140 }
                ]
            };
        case 'financial':
            return {
                title: 'Financial Report',
                period: 'November 2025',
                data: [
                    { category: 'Tuition Fees', collected: '€45,000', outstanding: '€5,000', percentage: '90%' },
                    { category: 'Book Fees', collected: '€12,000', outstanding: '€2,000', percentage: '86%' },
                    { category: 'Activity Fees', collected: '€8,000', outstanding: '€1,500', percentage: '84%' }
                ]
            };
        default:
            return { title: 'Report', data: [] };
    }
}

function displayReportModal(reportType, reportData) {
    let dataTable = '';
    
    if (reportType === 'academic') {
        dataTable = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Class</th>
                        <th>Average Grade</th>
                        <th>Top Subject</th>
                        <th>Improvement</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.data.map(row => `
                        <tr>
                            <td>${row.class}</td>
                            <td><strong>${row.avgGrade}</strong></td>
                            <td>${row.topSubject}</td>
                            <td class="text-success">${row.improvement}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (reportType === 'attendance') {
        dataTable = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Year Group</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.data.map(row => `
                        <tr>
                            <td>${row.yearGroup}</td>
                            <td class="text-success"><strong>${row.present}</strong></td>
                            <td class="text-danger">${row.absent}</td>
                            <td class="text-warning">${row.late}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (reportType === 'behavior') {
        dataTable = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>House</th>
                        <th>Positive</th>
                        <th>Negative</th>
                        <th>Total Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.data.map(row => `
                        <tr>
                            <td><strong>${row.house}</strong></td>
                            <td class="text-success">${row.positive}</td>
                            <td class="text-danger">${row.negative}</td>
                            <td><strong>${row.points}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (reportType === 'financial') {
        dataTable = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Collected</th>
                        <th>Outstanding</th>
                        <th>Collection Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.data.map(row => `
                        <tr>
                            <td>${row.category}</td>
                            <td class="text-success"><strong>${row.collected}</strong></td>
                            <td class="text-warning">${row.outstanding}</td>
                            <td>${row.percentage}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    const modalContent = `
        <div class="report-view">
            <div class="report-header">
                <h2>${reportData.title}</h2>
                <p class="text-muted">Period: ${reportData.period}</p>
            </div>
            <div class="report-body">
                ${dataTable}
            </div>
            <div class="report-footer">
                <p class="text-muted"><i class="fas fa-info-circle"></i> This is a sample report with generated data</p>
            </div>
        </div>
    `;
    
    showModal(reportData.title, modalContent, [
        { text: 'Close', type: 'secondary', action: 'closeModal()' },
        { text: 'Export PDF', type: 'primary', action: 'exportReportPDF()', icon: 'fas fa-file-pdf' },
        { text: 'Print', type: 'info', action: 'window.print()', icon: 'fas fa-print' }
    ]);
}

function exportReportPDF() {
    showSuccess('PDF export feature coming soon! Report will be downloaded.');
}

// ========== SAMPLE DATA GENERATORS ==========
function showSampleFees() {
    const container = document.getElementById('fees-content');
    if (!container) return;
    
    const sampleFees = [
        { type: 'Tuition Fee', amount: '€500', dueDate: '2025-01-15', status: 'Paid' },
        { type: 'Book Rental', amount: '€120', dueDate: '2025-02-01', status: 'Pending' },
        { type: 'Activity Fee', amount: '€80', dueDate: '2025-03-01', status: 'Pending' },
        { type: 'Exam Fee', amount: '€150', dueDate: '2025-05-01', status: 'Not Due' }
    ];
    
    container.innerHTML = `
        <div class="fees-dashboard">
            <div class="fees-summary">
                <h3>Fee Summary</h3>
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="summary-label">Total Fees</div>
                        <div class="summary-value">€850</div>
                    </div>
                    <div class="summary-card success">
                        <div class="summary-label">Paid</div>
                        <div class="summary-value">€500</div>
                    </div>
                    <div class="summary-card warning">
                        <div class="summary-label">Outstanding</div>
                        <div class="summary-value">€350</div>
                    </div>
                </div>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Fee Type</th>
                        <th>Amount</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sampleFees.map(fee => `
                        <tr>
                            <td>${fee.type}</td>
                            <td><strong>${fee.amount}</strong></td>
                            <td>${fee.dueDate}</td>
                            <td><span class="status-badge status-${fee.status.toLowerCase().replace(' ', '-')}">${fee.status}</span></td>
                            <td>
                                <button class="btn-sm" onclick="showSuccess('Payment feature coming soon!')">
                                    <i class="fas fa-credit-card"></i> Pay Now
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showSamplePayroll() {
    const container = document.getElementById('payroll-content');
    if (!container) return;
    
    const samplePayroll = [
        { name: 'John Smith', position: 'Teacher', department: 'Mathematics', salary: '€3,500', status: 'Paid' },
        { name: 'Mary Johnson', position: 'Teacher', department: 'English', salary: '€3,400', status: 'Paid' },
        { name: 'David Wilson', position: 'Principal', department: 'Administration', salary: '€5,000', status: 'Paid' }
    ];
    
    container.innerHTML = `
        <div class="payroll-dashboard">
            <div class="payroll-summary">
                <h3>November 2025 Payroll</h3>
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="summary-label">Total Staff</div>
                        <div class="summary-value">45</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-label">Monthly Payroll</div>
                        <div class="summary-value">€145,000</div>
                    </div>
                    <div class="summary-card success">
                        <div class="summary-label">Processed</div>
                        <div class="summary-value">100%</div>
                    </div>
                </div>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Department</th>
                        <th>Salary</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${samplePayroll.map(emp => `
                        <tr>
                            <td><strong>${emp.name}</strong></td>
                            <td>${emp.position}</td>
                            <td>${emp.department}</td>
                            <td><strong>${emp.salary}</strong></td>
                            <td><span class="status-badge status-paid">${emp.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="payroll-actions">
                <button class="btn-primary" onclick="generateReport('financial')">
                    <i class="fas fa-file-invoice-dollar"></i> Generate Payroll Report
                </button>
            </div>
        </div>
    `;
}

// ========== TIMETABLE BUILDER ==========
async function loadTimetableClasses() {
    try {
        const classesData = await apiCall('/classes').catch(() => ({ classes: [] }));
        const classes = classesData.classes || [];
        
        const select = document.getElementById('tt-class');
        if (select) {
            select.innerHTML = '<option value="">Choose a class...</option>' + 
                classes.map(cls => `<option value="${cls._id}" data-class-name="${cls.name}">${cls.name}</option>`).join('');
            select.onchange = () => loadClassStudents();
        }
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function loadClassStudents() {
    const classId = document.getElementById('tt-class')?.value;
    if (!classId) return;
    
    try {
        const studentsData = await apiCall(`/students?class=${classId}`).catch(() => ({ students: [] }));
        const students = studentsData.students || [];
        
        const container = document.getElementById('student-selection');
        if (container) {
            container.innerHTML = students.map(student => `
                <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; cursor: pointer;">
                    <input type="checkbox" name="student_${student._id}" value="${student._id}" style="cursor: pointer;">
                    <span>${student.firstName} ${student.lastName}</span>
                </label>
            `).join('') || '<p class="text-muted">No students in this class</p>';
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

async function submitCreateTimetable() {
    const classId = document.getElementById('tt-class')?.value;
    if (!classId) {
        showError('Please select a class');
        return;
    }
    
    // Get selected students
    const selectedStudents = Array.from(document.querySelectorAll('input[name^="student_"]:checked')).map(cb => cb.value);
    
    // Get schedule
    const periods = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const schedule = [];
    
    periods.forEach(period => {
        days.forEach(day => {
            const checkbox = document.querySelector(`input[name="period_${period}_${day}"]:checked`);
            if (checkbox) {
                schedule.push({ period, day });
            }
        });
    });
    
    closeModal();
    showLoading('Saving timetable...');
    
    try {
        await apiCall('/timetable', 'POST', {
            class: classId,
            schedule,
            students: selectedStudents,
            academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
            term: 1
        });
        hideLoading();
        showSuccess('Timetable created successfully!');
        await loadMyPersonalTimetable();
    } catch (error) {
        hideLoading();
        showError('Failed to create timetable');
        console.error(error);
    }
}

// ========== ENHANCED ATTENDANCE ==========
async function viewStudentAttendance(studentId) {
    try {
        showLoading('Loading attendance...');
        const student = await apiCall(`/students/${studentId}`);
        const today = new Date().toISOString().split('T')[0];
        const attendanceData = await apiCall(`/attendance?student=${studentId}&startDate=${today}&limit=30`).catch(() => ({ attendance: [] }));
        hideLoading();
        
        const records = attendanceData.attendance || [];
        
        const modalContent = `
            <div class="attendance-view">
                <h3>${student.firstName} ${student.lastName} - Attendance Record</h3>
                <div class="attendance-stats">
                    <div class="stat"><strong>${records.filter(r => r.status === 'Present').length}</strong><p>Present</p></div>
                    <div class="stat"><strong>${records.filter(r => r.status === 'Absent').length}</strong><p>Absent</p></div>
                    <div class="stat"><strong>${records.filter(r => r.status === 'Late').length}</strong><p>Late</p></div>
                    <div class="stat"><strong>${records.filter(r => r.status === 'SA').length}</strong><p>School Activity</p></div>
                </div>
                <table class="data-table" style="margin-top: 1.5rem;">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Period</th>
                            <th>Status</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(record => `
                            <tr>
                                <td>${new Date(record.date).toLocaleDateString()}</td>
                                <td>${record.period || '-'}</td>
                                <td><span class="badge badge-${record.status.toLowerCase()}">${record.status}</span></td>
                                <td>${record.notes || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        showModal('Attendance Record', modalContent, [
            { text: 'Close', type: 'secondary', action: 'closeModal()' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load attendance');
        console.error(error);
    }
}

async function takeEnhancedAttendance() {
    try {
        showLoading('Loading...');
        const classesData = await apiCall('/classes').catch(() => ({ classes: [] }));
        hideLoading();
        
        const classes = classesData.classes || [];
        
        const modalContent = `
            <form id="attendance-selection-form">
                <div class="input-group">
                    <label><i class="fas fa-book"></i> Select Class *</label>
                    <select id="attendance-class" class="select-input" required onchange="loadAttendanceStudents()">
                        <option value="">Choose a class...</option>
                        ${classes.map(cls => `<option value="${cls._id}">${cls.name}</option>`).join('')}
                    </select>
                </div>
                
                <div class="input-group">
                    <label><i class="fas fa-clock"></i> Select Period *</label>
                    <select id="attendance-period" class="select-input" required>
                        <option value="">Choose period...</option>
                        <option value="Class 1">Class 1 (9:00-9:40)</option>
                        <option value="Class 2">Class 2 (9:40-10:20)</option>
                        <option value="Class 3">Class 3 (10:20-11:00)</option>
                        <option value="Class 4">Class 4 (11:15-11:55)</option>
                        <option value="Class 5">Class 5 (11:55-12:35)</option>
                        <option value="Class 6">Class 6 (12:35-1:15)</option>
                        <option value="Class 7">Class 7 (2:00-2:40)</option>
                        <option value="Class 8">Class 8 (2:40-3:20)</option>
                        <option value="Class 9">Class 9 (3:20-4:00)</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label><i class="fas fa-calendar"></i> Date *</label>
                    <input type="date" id="attendance-date" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div id="attendance-students-container" style="max-height: 400px; overflow-y: auto; margin-top: 1.5rem;">
                    <!-- Students load here -->
                </div>
            </form>
        `;
        
        showModal('Take Attendance', modalContent, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Submit Attendance', type: 'primary', action: 'submitEnhancedAttendance()', icon: 'fas fa-check' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load classes');
        console.error(error);
    }
}

async function loadAttendanceStudents() {
    const classId = document.getElementById('attendance-class')?.value;
    if (!classId) return;
    
    try {
        const studentsData = await apiCall(`/students?class=${classId}`).catch(() => ({ students: [] }));
        const students = studentsData.students || [];
        
        const container = document.getElementById('attendance-students-container');
        if (container) {
            container.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <button type="button" class="btn-sm btn-secondary" onclick="quickMarkAllAttendance('present')">Mark All Present</button>
                    <button type="button" class="btn-sm btn-secondary" onclick="quickMarkAllAttendance('absent')" style="margin-left: 0.5rem;">Mark All Absent</button>
                </div>
                <div class="attendance-students-list">
                    ${students.map(student => `
                        <div class="attendance-student-row" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 0.5rem; margin-bottom: 0.75rem; border: 1px solid var(--border);">
                            <div style="flex: 1;">
                                <strong>${student.firstName} ${student.lastName}</strong>
                                ${student.healthInfo || student.allergies ? `
                                    <button type="button" class="btn-xs btn-info" onclick="showStudentHealthInfo('${student._id}', '${student.firstName}', '${student.lastName}', '${(student.healthInfo || '').replace(/'/g, "\\'")}', '${(student.allergies || '').replace(/'/g, "\\'")}')" style="margin-left: 0.5rem;">
                                        <i class="fas fa-info-circle"></i> Health Info
                                    </button>
                                ` : ''}
                            </div>
                            <select name="attendance_${student._id}" class="select-input" style="width: 150px;" required>
                                <option value="">Select...</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                                <option value="SA">School Activity (SA)</option>
                                <option value="Excused">Excused</option>
                            </select>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function showStudentHealthInfo(studentId, firstName, lastName, healthInfo, allergies) {
    const modalContent = `
        <div class="health-info-view">
            <h3>${firstName} ${lastName}</h3>
            <div class="info-section">
                <h4><i class="fas fa-heartbeat"></i> Health Information</h4>
                <p>${healthInfo || 'No health information on file'}</p>
            </div>
            <div class="info-section">
                <h4><i class="fas fa-exclamation-triangle"></i> Allergies</h4>
                <p>${allergies || 'No known allergies'}</p>
            </div>
        </div>
    `;
    
    showModal('Health & Safety Information', modalContent, [
        { text: 'Close', type: 'secondary', action: 'closeModal()' }
    ]);
}

function quickMarkAllAttendance(status) {
    const selects = document.querySelectorAll('select[name^="attendance_"]');
    selects.forEach(select => select.value = status.charAt(0).toUpperCase() + status.slice(1));
}

async function submitEnhancedAttendance() {
    const classId = document.getElementById('attendance-class')?.value;
    const period = document.getElementById('attendance-period')?.value;
    const date = document.getElementById('attendance-date')?.value;
    
    if (!classId || !period || !date) {
        showError('Please fill in all required fields');
        return;
    }
    
    const records = [];
    document.querySelectorAll('select[name^="attendance_"]').forEach(select => {
        const studentId = select.name.replace('attendance_', '');
        const status = select.value;
        if (status) {
            records.push({ student: studentId, status, period, date });
        }
    });
    
    if (records.length === 0) {
        showError('Please mark attendance for at least one student');
        return;
    }
    
    closeModal();
    showLoading('Saving attendance...');
    
    try {
        for (const record of records) {
            await apiCall('/attendance', 'POST', record);
        }
        hideLoading();
        showSuccess(`Attendance saved for ${records.length} student(s)`);
    } catch (error) {
        hideLoading();
        showError('Failed to save attendance');
        console.error(error);
    }
}

// ========== ENHANCED ATTENDANCE SYSTEM ==========
async function openEnhancedAttendance() {
    try {
        showLoading('Loading attendance interface...');
        
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];
        
        // Get teacher's classes
        const classesData = await apiCall('/classes?teacher=' + currentUser._id).catch(() => ({ classes: [] }));
        const classes = classesData.classes || [];
        
        hideLoading();
        
        if (classes.length === 0) {
            showError('No classes assigned to you');
            return;
        }
        
        // Show class selection first
        const classOptions = classes.map(cls => 
            `<option value="${cls._id}">${cls.name} (${cls.students?.length || 0} students)</option>`
        ).join('');
        
        const selectModal = `
            <div class="form-group">
                <label>Select Class for Attendance:</label>
                <select id="attendance-class-select" class="select-input">
                    <option value="">Choose a class...</option>
                    ${classOptions}
                </select>
                <label style="margin-top: 1rem;">Date:</label>
                <input type="date" id="attendance-date-select" value="${now.toISOString().split('T')[0]}" class="select-input">
            </div>
        `;
        
        showModal('Take Attendance', selectModal, [
            { text: 'Cancel', type: 'secondary', action: 'closeModal()' },
            { text: 'Open Attendance', type: 'primary', action: 'proceedToFullAttendance()', icon: 'fas fa-arrow-right' }
        ]);
    } catch (error) {
        hideLoading();
        showError('Failed to load attendance interface');
        console.error(error);
    }
}

async function proceedToFullAttendance() {
    const classId = document.getElementById('attendance-class-select')?.value;
    const date = document.getElementById('attendance-date-select')?.value;
    
    if (!classId) {
        showError('Please select a class');
        return;
    }
    
    try {
        closeModal();
        showLoading('Loading students...');
        
        const classData = await apiCall(`/classes/${classId}`);
        const students = classData.students || [];
        
        hideLoading();
        
        if (students.length === 0) {
            showError('No students in this class');
            return;
        }
        
        // Create full-screen attendance interface
        const attendanceHTML = `
            <div id="attendance-fullscreen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #FFB3B3 0%, #FF6B6B 50%, #FF5252 100%); z-index: 9999; overflow-y: auto; padding: 2rem;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                        
                        <!-- Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 2px solid var(--primary); padding-bottom: 1rem;">
                            <div>
                                <h1 style="margin: 0; color: var(--primary);"><i class="fas fa-check-circle"></i> Mark Attendance</h1>
                                <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">
                                    <strong>${classData.name}</strong> • ${new Date(date).toLocaleDateString()} 
                                </p>
                            </div>
                            <button onclick="closeAttendanceFullscreen()" style="background: #e74c3c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem;">
                                <i class="fas fa-times"></i> Close
                            </button>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                            <button onclick="quickMarkAttendanceStatus('Present', '${classId}', '${date}')" style="flex: 1; min-width: 150px; padding: 0.75rem; background: #27ae60; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-check"></i> Mark All Present
                            </button>
                            <button onclick="quickMarkAttendanceStatus('Absent', '${classId}', '${date}')" style="flex: 1; min-width: 150px; padding: 0.75rem; background: #e74c3c; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-times"></i> Mark All Absent
                            </button>
                            <button onclick="clearAttendanceMarks()" style="flex: 1; min-width: 150px; padding: 0.75rem; background: #95a5a6; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                                <i class="fas fa-redo"></i> Clear All
                            </button>
                        </div>
                        
                        <!-- Student List -->
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f8f9fa; border-bottom: 2px solid var(--primary);">
                                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--primary);">#</th>
                                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--primary);">Student Name</th>
                                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--primary);">ID</th>
                                        <th style="padding: 1rem; text-align: center; font-weight: 600; color: var(--primary);">Status</th>
                                        <th style="padding: 1rem; text-align: left; font-weight: 600; color: var(--primary);">Notes / Reason</th>
                                    </tr>
                                </thead>
                                <tbody id="attendance-student-list" style="display: none;">
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Submit Button -->
                        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                            <button onclick="closeAttendanceFullscreen()" style="padding: 0.75rem 1.5rem; background: #bdc3c7; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                                Cancel
                            </button>
                            <button onclick="submitEnhancedAttendanceMarking('${classId}', '${date}')" style="padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; font-size: 1rem;">
                                <i class="fas fa-save"></i> Submit Attendance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert into DOM
        const container = document.createElement('div');
        container.innerHTML = attendanceHTML;
        document.body.appendChild(container.firstElementChild);
        
        // Generate student rows
        const studentList = document.getElementById('attendance-student-list');
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.style.cssText = 'border-bottom: 1px solid #ecf0f1; hover: background #f8f9fa;';
            row.innerHTML = `
                <td style="padding: 1rem; text-align: left;">${index + 1}</td>
                <td style="padding: 1rem; text-align: left; font-weight: 500;">${student.firstName} ${student.lastName}</td>
                <td style="padding: 1rem; text-align: left; color: #7f8c8d;">${student.studentId || 'N/A'}</td>
                <td style="padding: 1rem; text-align: center;">
                    <select class="enhanced-attendance-status" data-student-id="${student._id}" style="padding: 0.5rem; border: 2px solid #ecf0f1; border-radius: 0.25rem; font-weight: 600;">
                        <option value="" style="color: #7f8c8d;">—</option>
                        <option value="Present" style="color: #27ae60;">✓ Present</option>
                        <option value="Absent" style="color: #e74c3c;">✗ Absent</option>
                        <option value="Late" style="color: #f39c12;">⌚ Late</option>
                        <option value="SchoolActivity" style="color: #3498db;">📋 S.A. (School Activity)</option>
                        <option value="Medical" style="color: #9b59b6;">⚕️ Medical</option>
                    </select>
                </td>
                <td style="padding: 1rem;">
                    <input type="text" class="enhanced-attendance-notes" data-student-id="${student._id}" placeholder="e.g., Dental appointment..." style="width: 100%; padding: 0.5rem; border: 1px solid #ecf0f1; border-radius: 0.25rem;">
                </td>
            `;
            studentList.appendChild(row);
        });
        
        studentList.style.display = 'table-body';
    } catch (error) {
        hideLoading();
        showError('Failed to open attendance interface');
        console.error(error);
    }
}

function quickMarkAttendanceStatus(status) {
    document.querySelectorAll('.enhanced-attendance-status').forEach(select => {
        select.value = status;
        select.style.borderColor = status === 'Present' ? '#27ae60' : status === 'Absent' ? '#e74c3c' : '#f39c12';
    });
}

function clearAttendanceMarks() {
    document.querySelectorAll('.enhanced-attendance-status').forEach(select => {
        select.value = '';
        select.style.borderColor = '#ecf0f1';
    });
    document.querySelectorAll('.enhanced-attendance-notes').forEach(input => {
        input.value = '';
    });
}

function closeAttendanceFullscreen() {
    const fullscreen = document.getElementById('attendance-fullscreen');
    if (fullscreen) {
        fullscreen.parentElement.removeChild(fullscreen);
    }
}

async function submitEnhancedAttendanceMarking(classId, date) {
    const statuses = document.querySelectorAll('.enhanced-attendance-status');
    const attendanceRecords = [];
    
    let hasErrors = false;
    statuses.forEach(select => {
        if (!select.value) {
            hasErrors = true;
            select.style.borderColor = '#e74c3c';
        } else {
            const studentId = select.getAttribute('data-student-id');
            const notes = document.querySelector(`.enhanced-attendance-notes[data-student-id="${studentId}"]`)?.value || '';
            
            attendanceRecords.push({
                student: studentId,
                status: select.value,
                date: date,
                notes: notes,
                teacher: currentUser._id
            });
        }
    });
    
    if (hasErrors) {
        showError('Please mark attendance for all students');
        return;
    }
    
    try {
        closeAttendanceFullscreen();
        showLoading('Saving attendance...');
        
        await apiCall('/attendance/bulk', {
            method: 'POST',
            body: JSON.stringify({
                class: classId,
                date: date,
                records: attendanceRecords
            })
        });
        
        hideLoading();
        showSuccess(`Attendance submitted for ${attendanceRecords.length} students!`);
    } catch (error) {
        hideLoading();
        showError('Failed to save attendance: ' + error.message);
        console.error(error);
    }
}

// ========== ENROLLMENTS ==========
let allEnrollments = [];

async function loadEnrollments() {
    try {
        showLoading('Loading enrollment applications...');
        const data = await apiCall('/enrollments?status=Pending&limit=200');
        allEnrollments = data.enrollments || [];
        displayEnrollments(allEnrollments);
        updateEnrollmentStats();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load enrollments');
        console.error('Error loading enrollments:', error);
    }
}

function displayEnrollments(enrollments) {
    const tbody = document.getElementById('enrollments-table-body');
    if (!tbody) return;
    
    if (!enrollments || enrollments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #999;"><i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>No pending enrollment applications</td></tr>`;
        return;
    }
    
    tbody.innerHTML = enrollments.map(enrollment => {
        const submitDate = new Date(enrollment.submittedAt).toLocaleDateString('en-IE');
        const statusBadge = enrollment.status === 'Pending' ? 'badge-warning' : enrollment.status === 'Approved' ? 'badge-success' : 'badge-danger';
        
        return `
        <tr style="border-bottom: 1px solid var(--border);">
            <td><strong>${enrollment.firstName} ${enrollment.lastName}</strong></td>
            <td>${enrollment.email}</td>
            <td>${enrollment.phone || 'N/A'}</td>
            <td>${submitDate}</td>
            <td><span class="badge ${statusBadge}">${enrollment.status}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-sm" style="background: var(--primary); border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; color: white; font-weight: 600;" onclick="viewEnrollmentDetails('${enrollment._id}')" title="View Details">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${enrollment.status === 'Pending' ? `
                    <button class="btn-sm" style="background: #28a745; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; color: white; font-weight: 600;" onclick="approveEnrollment('${enrollment._id}')" title="Approve">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-sm" style="background: #dc3545; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; color: white; font-weight: 600;" onclick="showDeclineModal('${enrollment._id}')" title="Decline">
                        <i class="fas fa-times"></i> Decline
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

async function viewEnrollmentDetails(enrollmentId) {
    try {
        showLoading('Loading enrollment details...');
        const enrollment = await apiCall(`/enrollments/${enrollmentId}`);
        displayEnrollmentDetailsModal(enrollment.enrollment);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError('Failed to load enrollment details');
        console.error(error);
    }
}

function displayEnrollmentDetailsModal(enrollment) {
    const modal = document.createElement('div');
    modal.id = 'enrollment-details-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const dob = new Date(enrollment.dateOfBirth).toLocaleDateString('en-IE');
    const submitDate = new Date(enrollment.submittedAt).toLocaleDateString('en-IE');
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 1rem; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border);">
                <h2 style="margin: 0; color: var(--primary);">Enrollment Application</h2>
                <button onclick="closeInlineModal('enrollment-details-modal')" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>
            
            <div style="display: grid; gap: 1rem;">
                <div>
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Personal Information</h4>
                    <p><strong>Name:</strong> ${enrollment.firstName} ${enrollment.lastName}</p>
                    <p><strong>Email:</strong> ${enrollment.email}</p>
                    <p><strong>Phone:</strong> ${enrollment.phone || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> ${dob}</p>
                    <p><strong>Gender:</strong> ${enrollment.gender}</p>
                    <p><strong>PPS:</strong> ${enrollment.pps || 'N/A'}</p>
                </div>
                
                <div>
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Address</h4>
                    <p><strong>Street:</strong> ${enrollment.address?.street || 'N/A'}</p>
                    <p><strong>City:</strong> ${enrollment.address?.city || 'N/A'}</p>
                    <p><strong>County:</strong> ${enrollment.address?.county || 'N/A'}</p>
                    <p><strong>Eircode:</strong> ${enrollment.address?.eircode || 'N/A'}</p>
                </div>
                
                <div>
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Previous School</h4>
                    <p><strong>School Name:</strong> ${enrollment.previousSchool?.name || 'N/A'}</p>
                    <p><strong>Roll Number:</strong> ${enrollment.previousSchool?.rollNumber || 'N/A'}</p>
                </div>
                
                <div>
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Medical Information</h4>
                    <p><strong>Allergies:</strong> ${enrollment.medicalInfo?.allergies?.join(', ') || 'None'}</p>
                    <p><strong>Conditions:</strong> ${enrollment.medicalInfo?.conditions?.join(', ') || 'None'}</p>
                </div>
                
                ${enrollment.notes ? `
                <div>
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Additional Notes</h4>
                    <p>${enrollment.notes}</p>
                </div>
                ` : ''}
                
                <div>
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">Application Status</h4>
                    <p><strong>Status:</strong> <span class="badge ${enrollment.status === 'Pending' ? 'badge-warning' : enrollment.status === 'Approved' ? 'badge-success' : 'badge-danger'}">${enrollment.status}</span></p>
                    <p><strong>Submitted:</strong> ${submitDate}</p>
                    ${enrollment.status === 'Declined' ? `<p><strong>Decline Reason:</strong> ${enrollment.declineReason}</p>` : ''}
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem; border-top: 2px solid var(--border); padding-top: 1.5rem;">
                <button onclick="closeInlineModal('enrollment-details-modal')" style="flex: 1; padding: 0.75rem; background: #f0f0f0; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function approveEnrollment(enrollmentId) {
    if (!confirm('Approve this enrollment application? A student account will be created.')) return;
    
    try {
        showLoading('Approving enrollment...');
        await apiCall(`/enrollments/${enrollmentId}/approve`, {
            method: 'PUT',
            body: JSON.stringify({})
        });
        
        hideLoading();
        showSuccess('Enrollment approved! Student account created.');
        closeInlineModal('enrollment-details-modal');
        await loadEnrollments();
    } catch (error) {
        hideLoading();
        showError('Failed to approve enrollment: ' + error.message);
        console.error(error);
    }
}

function showDeclineModal(enrollmentId) {
    const modal = document.createElement('div');
    modal.id = 'decline-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 1rem; padding: 2rem; max-width: 500px; width: 90%;">
            <h2 style="color: var(--primary); margin-bottom: 1rem;">Decline Enrollment</h2>
            <p style="color: #666; margin-bottom: 1.5rem;">Please provide a reason for declining this application:</p>
            
            <textarea id="decline-reason" placeholder="Enter decline reason..." style="width: 100%; min-height: 100px; padding: 0.75rem; border: 2px solid var(--border); border-radius: 0.5rem; font-size: 1rem; font-family: inherit; resize: vertical;"></textarea>
            
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button onclick="closeInlineModal('decline-modal')" style="flex: 1; padding: 0.75rem; background: #f0f0f0; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">Cancel</button>
                <button onclick="confirmDeclineEnrollment('${enrollmentId}')" style="flex: 1; padding: 0.75rem; background: #dc3545; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">Decline</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function confirmDeclineEnrollment(enrollmentId) {
    const reason = document.getElementById('decline-reason').value.trim();
    
    if (!reason) {
        alert('Please provide a reason for declining this application');
        return;
    }
    
    try {
        showLoading('Declining enrollment...');
        await apiCall(`/enrollments/${enrollmentId}/decline`, {
            method: 'PUT',
            body: JSON.stringify({ reason })
        });
        
        hideLoading();
        showSuccess('Enrollment declined.');
        closeInlineModal('decline-modal');
        closeInlineModal('enrollment-details-modal');
        await loadEnrollments();
    } catch (error) {
        hideLoading();
        showError('Failed to decline enrollment: ' + error.message);
        console.error(error);
    }
}

async function updateEnrollmentStats() {
    try {
        const stats = await apiCall('/enrollments/stats/summary');
        if (stats && stats.stats) {
            // Update stats display if elements exist
            const pendingElement = document.getElementById('enrollment-pending-count');
            const approvedElement = document.getElementById('enrollment-approved-count');
            const declinedElement = document.getElementById('enrollment-declined-count');
            
            if (pendingElement) pendingElement.textContent = stats.stats.pending || 0;
            if (approvedElement) approvedElement.textContent = stats.stats.approved || 0;
            if (declinedElement) declinedElement.textContent = stats.stats.declined || 0;
        }
    } catch (error) {
        console.error('Error loading enrollment stats:', error);
    }
}

function closeInlineModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.remove();
}

