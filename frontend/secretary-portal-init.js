// Secretary Portal Initialization
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role.toLowerCase() !== 'secretary') {
        window.location.href = '/shannoncomp/login';
        return;
    }
    
    loadSecretaryData();
});

// Tab Switching
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const btns = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    btns.forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Load initial data
function loadSecretaryData() {
    loadAbsenceRequests();
    loadLateArrivals();
    loadStudents();
    loadTeachers();
    loadPayments();
    loadFinancialSummary();
}

// Absence Requests
function loadAbsenceRequests() {
    const absences = [
        { id: 1, student: 'John Smith', class: '6A', date: 'Today', reason: 'Medical appointment', type: 'Pending' },
        { id: 2, student: 'Emma Johnson', class: '5B', date: 'Yesterday', reason: 'Family emergency', type: 'Pending' },
        { id: 3, student: 'Michael Brown', class: '6C', date: 'Jan 17', reason: 'Sick leave', type: 'Pending' }
    ];

    const list = document.getElementById('absenceList');
    if (!list) return;
    
    list.innerHTML = absences.map(absence => `
        <div class="request-item">
            <div class="request-info">
                <h4>${absence.student}</h4>
                <p><strong>Class:</strong> ${absence.class}</p>
                <p><strong>Date:</strong> ${absence.date}</p>
                <p><strong>Reason:</strong> ${absence.reason}</p>
            </div>
            <div class="request-actions">
                <button class="btn-approve" onclick="approveAbsence(${absence.id})"><i class="fas fa-check"></i> Approve</button>
                <button class="btn-reject" onclick="rejectAbsence(${absence.id})"><i class="fas fa-times"></i> Reject</button>
            </div>
        </div>
    `).join('');
}

// Placeholder functions for other data loading
function loadLateArrivals() {}
function loadStudents() {}
function loadTeachers() {}
function loadPayments() {}
function loadFinancialSummary() {}

function approveAbsence(id) {
    alert(`Approved absence request #${id}`);
}

function rejectAbsence(id) {
    alert(`Rejected absence request #${id}`);
}

function logout() {
    localStorage.clear();
    window.location.href = '/shannoncomp/login';
}
