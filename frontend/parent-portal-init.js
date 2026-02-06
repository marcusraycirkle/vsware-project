// Parent Portal Initialization
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role.toLowerCase() !== 'parent') {
        window.location.href = '/shannoncomp/login';
        return;
    }
    
    const userDisplayName = document.getElementById('user-display-name');
    if (userDisplayName && user.name) {
        userDisplayName.textContent = user.name;
    }
    if (user.email) {
        const emailEl = document.getElementById('contact-email');
        if (emailEl) emailEl.textContent = user.email;
    }

    setupEventListeners();
});

function setupEventListeners() {
    const userMenuTrigger = document.getElementById('user-menu-trigger');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuTrigger) {
        userMenuTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#user-menu-trigger') && !e.target.closest('#user-dropdown')) {
            if (userDropdown) {
                userDropdown.classList.remove('active');
            }
        }
    });

    const logoutBtn = document.getElementById('logout-btn-menu');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
}

function navigateSection(section, studentName, studentDetails) {
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.remove('active');
    });

    if (studentName) {
        const nameEl = document.getElementById('profile-name');
        const detailsEl = document.getElementById('profile-details');
        if (nameEl) nameEl.textContent = studentName;
        if (detailsEl) detailsEl.textContent = studentDetails;
    }

    const sectionEl = document.getElementById(`${section}-section`);
    if (sectionEl) {
        sectionEl.classList.add('active');
    }

    // Initialize attendance chart when attendance section is opened
    if (section === 'attendance') {
        setTimeout(() => initAttendanceChart(), 100);
    }

    window.scrollTo(0, 0);
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/shannoncomp/login';
    }
}

// Initialize attendance pie chart
function initAttendanceChart() {
    const ctx = document.getElementById('attendance-pie-chart');
    if (ctx && typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'Late'],
                datasets: [{
                    data: [120, 5, 3],
                    backgroundColor: [
                        '#10B981',
                        '#EF4444',
                        '#F59E0B'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
}
