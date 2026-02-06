// Student Portal Initialization
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role.toLowerCase() !== 'student') {
        window.location.href = '/shannoncomp/login';
        return;
    }
    
    // Set user name
    const userName = user.name || 'Student User';
    const userEl = document.getElementById('sidebar-user');
    if (userEl) {
        userEl.textContent = userName;
    }
});

function switchTab(e, tabName) {
    e.preventDefault();
    
    // Hide all tabs
    document.querySelectorAll('.tab-container').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active from nav items
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const tabEl = document.getElementById(tabName);
    if (tabEl) {
        tabEl.classList.add('active');
    }

    // Mark nav item as active
    e.target.closest('.sidebar-nav-item').classList.add('active');
}

function logout() {
    localStorage.clear();
    window.location.href = '/shannoncomp/login';
}
