// Teacher Portal Initialization
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role.toLowerCase() !== 'teacher') {
        window.location.href = '/shannoncomp/login';
        return;
    }
    
    // Update user name
    const userNameEl = document.querySelector('.user-name');
    if (userNameEl && user.name) {
        userNameEl.textContent = user.name;
    }
    
    initAttendanceChart();
});

// Initialize attendance pie chart
function initAttendanceChart() {
    const ctx = document.getElementById('attendance-chart');
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
