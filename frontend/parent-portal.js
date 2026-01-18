// Parent Portal JavaScript

let currentStudent = null;
let allStudents = [];
let allNotifications = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeParentPortal();
    setupEventListeners();
    updateGreeting();
    loadStudents();
    loadNotifications();
    setupFeatures();
});

function initializeParentPortal() {
    // Check if user is logged in
    const token = localStorage.getItem('parentToken') || localStorage.getItem('userToken');
    if (!token) {
        window.location.href = '/selector';
        return;
    }

    const parentData = localStorage.getItem('parentUser') || localStorage.getItem('currentUser');
    if (parentData) {
        try {
            const user = JSON.parse(parentData);
            document.getElementById('user-greeting').textContent = `${user.firstName} ${user.lastName}`;
            document.getElementById('parent-name').textContent = `${user.firstName} ${user.lastName}`;
            document.getElementById('parent-email').textContent = user.email || 'No email set';
            document.getElementById('parent-phone').textContent = user.phone || '+353 1 234 5678';
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    
    if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
    } else if (hour >= 17) {
        greeting = 'Good Evening';
    }

    const userName = (localStorage.getItem('parentUser') ? JSON.parse(localStorage.getItem('parentUser')).firstName : 'Parent') || 'Parent';
    document.getElementById('greeting-message').textContent = `${greeting}, ${userName}`;
}

async function loadStudents() {
    try {
        // In a real app, this would fetch from the API
        // For now, simulate some test data
        allStudents = [
            { id: 1, name: 'Cory Kilmartin', grade: 'Year 12', school: "St. Patrick's" },
            { id: 2, name: 'Jane Doe', grade: 'Year 10', school: "St. Patrick's" }
        ];

        displayStudentSelector();
        if (allStudents.length > 0) {
            selectStudent(allStudents[0].id);
        }
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function displayStudentSelector() {
    const selector = document.getElementById('student-selector');
    selector.innerHTML = allStudents.map(student => `
        <button class="student-btn" onclick="selectStudent('${student.id}')" data-student-id="${student.id}">
            <i class="fas fa-user-graduate"></i> ${student.name}
        </button>
    `).join('');
}

function selectStudent(studentId) {
    currentStudent = allStudents.find(s => s.id == studentId);
    
    // Update active button
    document.querySelectorAll('.student-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-student-id="${studentId}"]`).classList.add('active');

    // Reload data for selected student
    loadNotifications();
}

async function loadNotifications() {
    try {
        // Simulate notifications
        allNotifications = [
            {
                id: 1,
                type: 'success',
                title: 'Absence Request Approved',
                message: 'Your absence request for Jan 20 has been approved',
                time: '2 hours ago'
            },
            {
                id: 2,
                type: 'info',
                title: 'Permission Slip Sent',
                message: 'Permission slip for school trip on Feb 15 has been sent',
                time: '5 hours ago'
            },
            {
                id: 3,
                type: 'warning',
                title: 'Payment Due Soon',
                message: 'School fees payment is due on Feb 1',
                time: '1 day ago'
            }
        ];

        displayNotifications();
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function displayNotifications() {
    const container = document.getElementById('notifications-list');
    const recentNotifications = allNotifications.slice(0, 3);

    if (recentNotifications.length === 0) {
        container.innerHTML = '<div class="empty-notifications"><p>No new notifications</p></div>';
        return;
    }

    container.innerHTML = recentNotifications.map(notif => `
        <div class="notification-item-parent ${notif.type}">
            <div class="notification-item-content">
                <div class="notification-text">
                    <div class="notification-text-main">${notif.title}</div>
                    <div class="notification-text-sub">${notif.message}</div>
                </div>
                <div class="notification-time">${notif.time}</div>
            </div>
        </div>
    `).join('');
}

function setupFeatures() {
    const featuresGrid = document.getElementById('features-grid');
    const features = [
        {
            icon: '📚',
            title: 'Attendance',
            subtitle: 'View and submit absences',
            action: 'View Attendance',
            onclick: 'showFeature("attendance")'
        },
        {
            icon: '📅',
            title: 'Timetable',
            subtitle: 'Weekly class schedule',
            action: 'View Timetable',
            onclick: 'showFeature("timetable")'
        },
        {
            icon: '⭐',
            title: 'Behaviour',
            subtitle: 'Behaviour points and feedback',
            action: 'View Behaviour',
            onclick: 'showFeature("behaviour")'
        },
        {
            icon: '📊',
            title: 'Assessments',
            subtitle: 'View test results',
            action: 'View Results',
            onclick: 'showFeature("assessments")'
        },
        {
            icon: '👤',
            title: 'Personal Info',
            subtitle: 'Student profile details',
            action: 'View Profile',
            onclick: 'showFeature("personal")'
        },
        {
            icon: '💳',
            title: 'Payments',
            subtitle: 'Make payments online',
            action: 'Pay Now',
            onclick: 'showFeature("payments")'
        },
        {
            icon: '📋',
            title: 'Permission Slips',
            subtitle: 'View and sign slips',
            action: 'View Slips',
            onclick: 'showFeature("permissions")'
        },
        {
            icon: '📞',
            title: 'Messages',
            subtitle: 'Messages from school',
            action: 'View Messages',
            onclick: 'showFeature("messages")'
        }
    ];

    featuresGrid.innerHTML = features.map(feature => `
        <div class="widget">
            <div class="widget-icon">${feature.icon}</div>
            <div class="widget-title">${feature.title}</div>
            <div class="widget-subtitle">${feature.subtitle}</div>
            <button class="widget-action" onclick="${feature.onclick}">
                ${feature.action} <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `).join('');
}

function showFeature(feature) {
    console.log(`Showing feature: ${feature} for student:`, currentStudent);
    
    // This would navigate to different feature pages
    // For now, just log the action
    alert(`Loading ${feature} for ${currentStudent?.name || 'student'}...`);
}

function setupEventListeners() {
    document.getElementById('parent-logout-btn')?.addEventListener('click', logoutParent);
    document.getElementById('see-all-notifications')?.addEventListener('click', showAllNotifications);
}

function showAllNotifications() {
    const modal = document.getElementById('all-notifications-modal');
    const container = document.getElementById('all-notifications-list');

    container.innerHTML = allNotifications.length === 0 
        ? '<div class="empty-notifications"><p>No notifications</p></div>'
        : allNotifications.map(notif => `
            <div class="notification-item-parent ${notif.type}">
                <div class="notification-item-content">
                    <div class="notification-text">
                        <div class="notification-text-main">${notif.title}</div>
                        <div class="notification-text-sub">${notif.message}</div>
                    </div>
                    <div class="notification-time">${notif.time}</div>
                </div>
            </div>
        `).join('');

    modal.classList.add('active');
}

function closeNotificationsModal() {
    document.getElementById('all-notifications-modal').classList.remove('active');
}

function logoutParent() {
    localStorage.removeItem('parentToken');
    localStorage.removeItem('parentUser');
    localStorage.removeItem('userToken');
    window.location.href = '/selector';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('all-notifications-modal');
    if (e.target === modal) {
        closeNotificationsModal();
    }
});
