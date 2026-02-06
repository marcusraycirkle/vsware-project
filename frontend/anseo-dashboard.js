// ANSEO ATTENDANCE DASHBOARD
// 3-tier Irish school attendance tracking system

function loadANSEODashboard() {
    // Mock data for 3-tier system
    const attendanceData = {
        tier1: { count: 847, percentage: 67.9, label: 'Excellent', threshold: '95% or more', color: '#10b981' },
        tier2: { count: 285, percentage: 22.9, label: 'Moderate', threshold: '91-94%', color: '#f59e0b' },
        tier3: { count: 115, percentage: 9.2, label: 'Needs Support', threshold: '90% or less', color: '#ef4444' }
    };
    
    const totalStudents = attendanceData.tier1.count + attendanceData.tier2.count + attendanceData.tier3.count;
    
    // Populate tier cards
    document.getElementById('anseo-tier1-count').textContent = attendanceData.tier1.count;
    document.getElementById('anseo-tier1-percentage').textContent = `${attendanceData.tier1.percentage}%`;
    document.getElementById('anseo-tier1-threshold').textContent = attendanceData.tier1.threshold;
    
    document.getElementById('anseo-tier2-count').textContent = attendanceData.tier2.count;
    document.getElementById('anseo-tier2-percentage').textContent = `${attendanceData.tier2.percentage}%`;
    document.getElementById('anseo-tier2-threshold').textContent = attendanceData.tier2.threshold;
    
    document.getElementById('anseo-tier3-count').textContent = attendanceData.tier3.count;
    document.getElementById('anseo-tier3-percentage').textContent = `${attendanceData.tier3.percentage}%`;
    document.getElementById('anseo-tier3-threshold').textContent = attendanceData.tier3.threshold;
    
    document.getElementById('anseo-total-students').textContent = totalStudents;
    
    // Generate charts
    generateANSEOCharts(attendanceData);
}

function generateANSEOCharts(data) {
    // Attendance Trends Line Chart
    const trendCtx = document.getElementById('anseo-trend-chart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                datasets: [
                    {
                        label: 'Tier 1 (Excellent)',
                        data: [65, 67, 68, 69, 67, 68],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Tier 2 (Moderate)',
                        data: [25, 24, 23, 22, 23, 23],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Tier 3 (Needs Support)',
                        data: [10, 9, 9, 9, 10, 9],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Attendance Trends by Tier (%)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Monthly Distribution Bar Chart
    const distCtx = document.getElementById('anseo-distribution-chart');
    if (distCtx) {
        new Chart(distCtx, {
            type: 'bar',
            data: {
                labels: ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                datasets: [
                    {
                        label: 'Tier 1',
                        data: [812, 837, 850, 862, 838, 847],
                        backgroundColor: '#10b981'
                    },
                    {
                        label: 'Tier 2',
                        data: [312, 300, 287, 275, 287, 285],
                        backgroundColor: '#f59e0b'
                    },
                    {
                        label: 'Tier 3',
                        data: [123, 112, 110, 110, 122, 115],
                        backgroundColor: '#ef4444'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Monthly Student Distribution by Tier'
                    }
                },
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true
                    }
                }
            }
        });
    }
}

function viewANSEOTierDetails(tier) {
    showAlert(`Tier ${tier} Students`, `This would show a detailed list of all students in Tier ${tier} with filtering options by year group and class.`, 'info');
}

function exportANSEOData(format) {
    showToast(`Exporting ANSEO data as ${format.toUpperCase()}...`, 'info');
}

function openANSEOFilters() {
    showPrompt('ANSEO Advanced Filters', [
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
        { name: 'yearGroup', label: 'Year Group', type: 'select', options: [
            { value: '', label: 'All Year Groups' },
            { value: '1', label: '1st Year' },
            { value: '2', label: '2nd Year' },
            { value: '3', label: '3rd Year' },
            { value: '4', label: '4th Year' },
            { value: '5', label: '5th Year' },
            { value: '6', label: '6th Year' }
        ]},
        { name: 'classGroup', label: 'Class', type: 'text', placeholder: 'e.g., 5A' }
    ], (values) => {
        showLoading('Applying filters...');
        setTimeout(() => {
            hideLoading();
            showToast('Filters applied successfully!', 'success');
            loadANSEODashboard();
        }, 1000);
    });
}

// Initialize ANSEO dashboard when page loads
window.loadANSEODashboard = loadANSEODashboard;
window.viewANSEOTierDetails = viewANSEOTierDetails;
window.exportANSEOData = exportANSEOData;
window.openANSEOFilters = openANSEOFilters;
