// TEACHER DETAIL VIEW FUNCTIONALITY
// Complete Irish school teacher management system

let currentTeacherData = null;

// Teacher permission levels
const PERMISSION_LEVELS = {
    BASIC: 'Basic Permissions',
    PARTIAL_ADMIN: 'Partial Admin Permissions',
    ADMIN: 'Admin Permissions'
};

// Mock teacher data with EVERYTHING
const mockTeachersData = {
    'eimear.mcmahon@shannoncomp.ie': {
        id: 'TCH001',
        firstName: 'Eimear',
        lastName: 'McMahon',
        email: 'eimear.mcmahon@shannoncomp.ie',
        phone: '+353 87 234 5678',
        dob: '1985-03-12',
        address: '45 Oak Lane, Shannon, Co. Clare',
        eircode: 'V14 XY34',
        pps: 'B2345678C',
        employmentStatus: 'Permanent - Full Time',
        startDate: '2010-09-01',
        department: 'English',
        position: 'Senior Teacher',
        qualifications: 'B.A. (English & History), H.Dip.Ed',
        permissionLevel: PERMISSION_LEVELS.BASIC,
        currentStatus: 'In Lesson',
        roomOwnership: 'B13',
        salary: '€65,000',
        payrollNumber: 'PAY-TC-001',
        bankDetails: 'AIB - ****1234',
        taxCredits: '€3,300',
        subjects: ['English'],
        classes: [
            { group: '5A', subject: 'English', students: 24 },
            { group: '6B', subject: 'English', students: 22 },
            { group: '3C', subject: 'English', students: 26 }
        ],
        timetable: {
            'Monday-1': { subject: 'English', group: '5A', room: 'B13' },
            'Monday-2': { subject: 'English', group: '6B', room: 'B13' },
            'Monday-3': 'Free',
            'Monday-4': { subject: 'English', group: '3C', room: 'B08' },
            'Monday-5': { subject: 'English', group: '5A', room: 'B13' },
            'Monday-6': 'Free',
            'Monday-7': { subject: 'English', group: '6B', room: 'B13' },
            'Monday-8': 'Free',
            'Tuesday-1': { subject: 'English', group: '3C', room: 'B08' },
            'Tuesday-2': { subject: 'English', group: '5A', room: 'B13' },
            'Tuesday-3': 'Free',
            'Tuesday-4': { subject: 'English', group: '6B', room: 'B13' },
            'Tuesday-5': { subject: 'English', group: '5A', room: 'B13' },
            'Tuesday-6': 'Free',
            'Tuesday-7': { subject: 'English', group: '3C', room: 'B08' },
            'Tuesday-8': { subject: 'English', group: '6B', room: 'B13' },
            'Wednesday-1': { subject: 'English', group: '5A', room: 'B13' },
            'Wednesday-2': { subject: 'English', group: '6B', room: 'B13' },
            'Wednesday-3': { subject: 'English', group: '3C', room: 'B08' },
            'Wednesday-4': 'Free',
            'Wednesday-5': { subject: 'English', group: '5A', room: 'B13' },
            'Wednesday-6': { subject: 'English', group: '6B', room: 'B13' },
            'Wednesday-7': 'Free',
            'Wednesday-8': { subject: 'English', group: '3C', room: 'B08' },
            'Thursday-1': 'Free',
            'Thursday-2': { subject: 'English', group: '5A', room: 'B13' },
            'Thursday-3': { subject: 'English', group: '6B', room: 'B13' },
            'Thursday-4': { subject: 'English', group: '3C', room: 'B08' },
            'Thursday-5': 'Free',
            'Thursday-6': { subject: 'English', group: '5A', room: 'B13' },
            'Thursday-7': { subject: 'English', group: '6B', room: 'B13' },
            'Thursday-8': 'Free',
            'Friday-1': { subject: 'English', group: '3C', room: 'B08' },
            'Friday-2': { subject: 'English', group: '5A', room: 'B13' },
            'Friday-3': 'Free',
            'Friday-4': { subject: 'English', group: '6B', room: 'B13' },
            'Friday-5': { subject: 'English', group: '5A', room: 'B13' },
            'Friday-6': 'Free',
            'Friday-7': { subject: 'English', group: '3C', room: 'B08' },
            'Friday-8': { subject: 'English', group: '6B', room: 'B13' }
        },
        coverHistory: [
            { date: '2026-02-03', coveredBy: 'Darragh Lohan', reason: 'Professional Development', periods: [1, 2, 3] },
            { date: '2026-01-15', coveredBy: 'Grace Killeen', reason: 'Sick Leave', periods: [4, 5] }
        ]
    }
};

// Open teacher detail view
function viewTeacher(teacherId) {
    currentTeacherData = mockTeachersData[teacherId];
    
    if (!currentTeacherData) {
        showAlert('Teacher Not Found', 'The requested teacher could not be found.', 'error');
        return;
    }
    
    // Populate header
    document.getElementById('teacher-name').textContent = `${currentTeacherData.firstName} ${currentTeacherData.lastName}`;
    document.getElementById('teacher-role').textContent = currentTeacherData.position;
    document.getElementById('teacher-department').textContent = currentTeacherData.department;
    document.getElementById('teacher-permission-level').textContent = currentTeacherData.permissionLevel;
    
    // Set status badge
    const statusBadge = document.getElementById('teacher-current-status');
    statusBadge.textContent = currentTeacherData.currentStatus;
    statusBadge.className = 'status-badge ' + (currentTeacherData.currentStatus === 'In Lesson' ? 'in-lesson' : 
                            currentTeacherData.currentStatus === 'Available' ? 'online' : 'absent');
    
    // Populate personal details
    populateTeacherPersonalInfo();
    
    // Load timetable
    loadTeacherTimetable();
    
    // Load classes
    loadTeacherClasses();
    
    // Load permissions info
    loadTeacherPermissions();
    
    // Load cover history
    loadCoverHistory();
    
    // Load payroll (if permitted)
    loadPayrollInfo();
    
    // Show overlay
    document.getElementById('teacher-detail-overlay').style.display = 'block';
}

// Close teacher detail view
function closeTeacherDetail() {
    document.getElementById('teacher-detail-overlay').style.display = 'none';
    currentTeacherData = null;
}

// Populate personal information
function populateTeacherPersonalInfo() {
    // Basic Information
    document.getElementById('teacher-info-firstname').textContent = currentTeacherData.firstName;
    document.getElementById('teacher-info-lastname').textContent = currentTeacherData.lastName;
    document.getElementById('teacher-info-email').textContent = currentTeacherData.email;
    document.getElementById('teacher-info-phone').textContent = currentTeacherData.phone;
    document.getElementById('teacher-info-dob').textContent = currentTeacherData.dob;
    
    // Address
    document.getElementById('teacher-info-address').textContent = currentTeacherData.address;
    document.getElementById('teacher-info-eircode').textContent = currentTeacherData.eircode;
    document.getElementById('teacher-info-pps').textContent = currentTeacherData.pps;
    
    // Employment
    document.getElementById('teacher-info-id').textContent = currentTeacherData.id;
    document.getElementById('teacher-info-status').textContent = currentTeacherData.employmentStatus;
    document.getElementById('teacher-info-startdate').textContent = currentTeacherData.startDate;
    document.getElementById('teacher-info-department').textContent = currentTeacherData.department;
    document.getElementById('teacher-info-position').textContent = currentTeacherData.position;
    document.getElementById('teacher-info-qualifications').textContent = currentTeacherData.qualifications;
    document.getElementById('teacher-info-room').textContent = currentTeacherData.roomOwnership || 'Not Assigned';
}

// Load teacher timetable
function loadTeacherTimetable() {
    const tbody = document.querySelector('#teacher-timetable-table tbody');
    tbody.innerHTML = '';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = 8;
    
    for (let period = 1; period <= periods; period++) {
        const row = document.createElement('tr');
        
        // Period number
        const periodCell = document.createElement('th');
        periodCell.textContent = `Period ${period}`;
        row.appendChild(periodCell);
        
        // Each day
        days.forEach(day => {
            const cell = document.createElement('td');
            const key = `${day}-${period}`;
            const classData = currentTeacherData.timetable[key];
            
            if (classData === 'Free') {
                cell.innerHTML = '<div class="teacher-class-block free">Free Period</div>';
            } else if (classData) {
                cell.innerHTML = `
                    <div class="teacher-class-block" onclick="viewClassDetails('${classData.group}', '${classData.subject}')">
                        <div class="teacher-class-subject">${classData.subject}</div>
                        <div class="teacher-class-group">${classData.group}</div>
                        <div class="teacher-class-room">Room ${classData.room}</div>
                    </div>
                `;
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    }
}

// Load teacher classes and groups
function loadTeacherClasses() {
    const container = document.getElementById('teacher-classes-container');
    let html = '';
    
    currentTeacherData.classes.forEach(cls => {
        html += `
            <div class="class-card" onclick="viewClassStudents('${cls.group}', '${cls.subject}')">
                <div class="class-card-header">
                    <div class="class-name">${cls.group} - ${cls.subject}</div>
                    <div class="class-students-count">${cls.students} <i class="fas fa-users"></i></div>
                </div>
                <div class="class-info-item">
                    <i class="fas fa-book"></i>
                    <span>${cls.subject}</span>
                </div>
                <div class="class-info-item">
                    <i class="fas fa-user-graduate"></i>
                    <span>${cls.students} Students</span>
                </div>
                <div class="class-info-item">
                    <i class="fas fa-door-open"></i>
                    <span>Room ${currentTeacherData.roomOwnership}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load teacher permissions
function loadTeacherPermissions() {
    const container = document.getElementById('teacher-permissions-container');
    
    const permissionsConfig = {
        [PERMISSION_LEVELS.BASIC]: {
            title: 'Basic Teacher Permissions',
            permissions: [
                'View own timetable',
                'Take class attendance',
                'Record assessment results for own classes',
                'Create behaviour reports for own students',
                'View student profiles (own classes only)',
                'Communicate with parents',
                'Access teaching resources'
            ]
        },
        [PERMISSION_LEVELS.PARTIAL_ADMIN]: {
            title: 'Partial Admin Permissions',
            permissions: [
                'All Basic Permissions',
                'View all student timetables',
                'View all teacher timetables',
                'See cover/substitute arrangements',
                'Access whole-school attendance reports',
                'View all student profiles',
                'Book rooms for activities'
            ]
        },
        [PERMISSION_LEVELS.ADMIN]: {
            title: 'Admin Permissions',
            permissions: [
                'All Partial Admin Permissions',
                'Edit student timetables',
                'Edit teacher timetables (restricted)',
                'Modify student details (except critical data)',
                'Create and manage classes',
                'Assign teachers to classes',
                'Generate school reports',
                'Manage school calendar',
                '✗ Cannot delete student profiles',
                '✗ Cannot modify payroll data'
            ]
        }
    };
    
    const config = permissionsConfig[currentTeacherData.permissionLevel];
    
    let html = `
        <div class="permission-card active">
            <div class="permission-header">
                <div class="permission-title">${config.title}</div>
                <div class="permission-badge">Active</div>
            </div>
            <ul class="permission-list">
                ${config.permissions.map(perm => {
                    const icon = perm.startsWith('✗') ? 'fa-times-circle' : 'fa-check-circle';
                    const color = perm.startsWith('✗') ? '#ef4444' : '#10b981';
                    return `<li><i class="fas ${icon}" style="color: ${color};"></i> ${perm}</li>`;
                }).join('')}
            </ul>
        </div>
    `;
    
    container.innerHTML = html;
}

// Load cover


 history
function loadCoverHistory() {
    const container = document.getElementById('teacher-cover-container');
    let html = '';
    
    if (currentTeacherData.coverHistory.length === 0) {
        html = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No cover records.</p>';
    } else {
        currentTeacherData.coverHistory.forEach(cover => {
            html += `
                <div class="cover-item">
                    <div class="cover-info">
                        <div class="cover-date">${cover.date}</div>
                        <div class="cover-details">
                            <strong>Reason:</strong> ${cover.reason} • 
                            <strong>Periods:</strong> ${cover.periods.join(', ')}
                        </div>
                    </div>
                    <div class="cover-teacher">
                        <i class="fas fa-user"></i> ${cover.coveredBy}
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

// Load payroll information (Admin/Secretary only)
function loadPayrollInfo() {
    const container = document.getElementById('teacher-payroll-container');
    
    // Check if current user has permission to view payroll
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const canViewPayroll = currentUser.role === 'Admin' || currentUser.role === 'Secretary';
    
    if (!canViewPayroll) {
        container.innerHTML = `
            <div class="payroll-restricted">
                <i class="fas fa-lock" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>Restricted Access</h3>
                <p>Payroll information is only available to Administrators and Secretaries.</p>
            </div>
        `;
        return;
    }
    
    // Show payroll data
    container.innerHTML = `
        <div class="payroll-grid">
            <div class="payroll-card">
                <div class="payroll-label">Annual Salary</div>
                <div class="payroll-value">${currentTeacherData.salary}</div>
            </div>
            <div class="payroll-card">
                <div class="payroll-label">Payroll Number</div>
                <div class="payroll-value">${currentTeacherData.payrollNumber}</div>
            </div>
            <div class="payroll-card">
                <div class="payroll-label">Bank Details</div>
                <div class="payroll-value">${currentTeacherData.bankDetails}</div>
            </div>
            <div class="payroll-card">
                <div class="payroll-label">Tax Credits</div>
                <div class="payroll-value">${currentTeacherData.taxCredits}</div>
            </div>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: #fef3c7; border-radius: 8px; color: #92400e;">
            <i class="fas fa-exclamation-triangle"></i> <strong>Sensitive Data:</strong> Payroll information is confidential and should be handled with care.
        </div>
    `;
}

// View class details (opens student list for that class)
function viewClassDetails(group, subject) {
    showAlert('Class Details', `View all students in ${group} - ${subject}. This would open a detailed view with attendance, assessments, and behaviour.`, 'info');
}

// View class students
function viewClassStudents(group, subject) {
    viewClassDetails(group, subject);
}

// Tab switching for teacher detail
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.teacher-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.teacher-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.teacher-tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
});

// Make functions globally available
window.viewTeacher = viewTeacher;
window.closeTeacherDetail = closeTeacherDetail;
window.viewClassDetails = viewClassDetails;
window.viewClassStudents = viewClassStudents;
