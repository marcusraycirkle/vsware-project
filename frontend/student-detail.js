// STUDENT DETAIL VIEW FUNCTIONALITY
// Complete implementation of student detail page with all tabs

let currentStudentData = null;
let timetableEditMode = false;
let editedTimetable = {};

// Mock student data with complete information
const mockStudentsData = {
    '24corykilmartin@shannoncomp.ie': {
        id: 'STU001',
        firstName: 'Cory',
        lastName: 'Kilmartin',
        email: '24corykilmartin@shannoncomp.ie',
        dob: '2008-05-15',
        gender: 'Male',
        pps: 'A1234567B',
        address: '123 Main Street, Shannon, Co. Clare',
        eircode: 'V14 ABC1',
        phone: '+353 87 123 4567',
        yearGroup: '5th Year',
        classGroup: '5A',
        course: 'Leaving Certificate (Established)',
        programme: 'Leaving Certificate',
        enrollDate: '2020-09-01',
        departmentPupilId: 'SC2024001',
        examNumber: 'LC2026-5678',
        lockerNumber: '142',
        status: 'Active',
        parent1: 'Mary Kilmartin',
        parent1phone: '+353 87 111 2222',
        parent1email: 'mary@email.com',
        parent2: 'John Kilmartin',
        parent2phone: '+353 87 333 4444',
        parent2email: 'john@email.com',
        hasTimetable: true,
        attendancePercentage: 94.5,
        lates: 3,
        absences: 8,
        timetable: {
            // Monday - Full 9 periods
            'Monday-1': { subject: 'English', teacher: 'Eimear McMahon', room: 'B13', color: 'subject-english' },
            'Monday-2': { subject: 'Irish', teacher: 'Cathy Keane', room: 'C21', color: 'subject-irish' },
            'Monday-3': { subject: 'Mathematics', teacher: 'Finola Butler', room: 'N13', color: 'subject-math' },
            'Monday-4': { subject: 'Geography', teacher: 'Grace Killeen', room: 'E19', color: 'subject-geography' },
            'Monday-5': { subject: 'Business Studies', teacher: 'Emer Nugent', room: 'A17', color: 'subject-business' },
            'Monday-6': { subject: 'German', teacher: 'Siobhan Hickey', room: 'B13', color: 'subject-german' },
            'Monday-7': { subject: 'Physical Education', teacher: 'Irene Power', room: 'GYM', color: 'subject-pe' },
            'Monday-8': { subject: 'Home Economics', teacher: 'Elaine Ahearn', room: 'B02', color: 'subject-home-ec' },
            'Monday-9': { subject: 'Study Hall', teacher: 'Supervised Study', room: 'Library', color: 'subject-study' },
            // Tuesday - Full 9 periods  
            'Tuesday-1': { subject: 'German', teacher: 'Siobhan Hickey', room: 'B13', color: 'subject-german' },
            'Tuesday-2': { subject: 'Home Economics', teacher: 'Elaine Ahearn', room: 'B02', color: 'subject-home-ec' },
            'Tuesday-3': { subject: 'Mathematics', teacher: 'Finola Butler', room: 'N14', color: 'subject-math' },
            'Tuesday-4': { subject: 'Irish', teacher: 'Cathy Keane', room: 'C17', color: 'subject-irish' },
            'Tuesday-5': { subject: 'English', teacher: 'Eimear McMahon', room: 'B08', color: 'subject-english' },
            'Tuesday-6': { subject: 'Business Studies', teacher: 'Emer Nugent', room: 'A17', color: 'subject-business' },
            'Tuesday-7': { subject: 'Geography', teacher: 'Grace Killeen', room: 'E19', color: 'subject-geography' },
            'Tuesday-8': { subject: 'Wood Technology', teacher: 'James Kiley', room: 'B14', color: 'subject-wood-tech' },
            'Tuesday-9': { subject: 'Music', teacher: 'Colm Mulryan', room: 'Music Room', color: 'subject-music' },
            // Wednesday - 8 periods only
            'Wednesday-1': { subject: 'Wood Technology', teacher: 'James Kiley', room: 'B14', color: 'subject-wood-tech' },
            'Wednesday-2': { subject: 'Mathematics', teacher: 'Finola Butler', room: 'N14', color: 'subject-math' },
            'Wednesday-3': { subject: 'Geography', teacher: 'Grace Killeen', room: 'E19', color: 'subject-geography' },
            'Wednesday-4': { subject: 'Physical Education', teacher: 'Irene Power', room: 'GYM', color: 'subject-pe' },
            'Wednesday-5': { subject: 'German', teacher: 'Siobhan Hickey', room: 'B13', color: 'subject-german' },
            'Wednesday-6': { subject: 'English', teacher: 'Eimear McMahon', room: 'B13', color: 'subject-english' },
            'Wednesday-7': { subject: 'Irish', teacher: 'Cathy Keane', room: 'C21', color: 'subject-irish' },
            'Wednesday-8': { subject: 'Business Studies', teacher: 'Emer Nugent', room: 'A17', color: 'subject-business' },
            // Thursday - 8 periods only
            'Thursday-1': { subject: 'Business Studies', teacher: 'Emer Nugent', room: 'A17', color: 'subject-business' },
            'Thursday-2': { subject: 'English', teacher: 'Eimear McMahon', room: 'B13', color: 'subject-english' },
            'Thursday-3': { subject: 'Business Studies', teacher: 'Emer Nugent', room: 'A17', color: 'subject-business' },
            'Thursday-4': { subject: 'Geography', teacher: 'Grace Killeen', room: 'E19', color: 'subject-geography' },
            'Thursday-5': { subject: 'Irish', teacher: 'Cathy Keane', room: 'C17', color: 'subject-irish' },
            'Thursday-6': { subject: 'Mathematics', teacher: 'Finola Butler', room: 'N14', color: 'subject-math' },
            'Thursday-7': { subject: 'Physical Education', teacher: 'Irene Power', room: 'GYM', color: 'subject-pe' },
            'Thursday-8': { subject: 'German', teacher: 'Siobhan Hickey', room: 'B13', color: 'subject-german' },
            // Friday - 8 periods only
            'Friday-1': { subject: 'Home Economics', teacher: 'Elaine Ahearn', room: 'B02', color: 'subject-home-ec' },
            'Friday-2': { subject: 'Wood Technology', teacher: 'James Kiley', room: 'B14', color: 'subject-wood-tech' },
            'Friday-3': { subject: 'Physical Education', teacher: 'Irene Power', room: 'GYM', color: 'subject-pe' },
            'Friday-4': { subject: 'Mathematics', teacher: 'Finola Butler', room: 'N14', color: 'subject-math' },
            'Friday-5': { subject: 'German', teacher: 'Siobhan Hickey', room: 'B13', color: 'subject-german' },
            'Friday-6': { subject: 'Irish', teacher: 'Cathy Keane', room: 'C21', color: 'subject-irish' },
            'Friday-7': { subject: 'English', teacher: 'Eimear McMahon', room: 'B08', color: 'subject-english' },
            'Friday-8': { subject: 'Geography', teacher: 'Grace Killeen', room: 'E19', color: 'subject-geography' }
        },
        assessments: {
            christmas2025: [
                { subject: 'Irish', grade: 'Merit / 68%', level: 'Higher', teacher: 'Cathy Keane', status: 'Merit', comment: 'Cory is an excellent student.' },
                { subject: 'English', grade: 'Achieved / 44%', level: 'Higher', teacher: 'Eimear McMahon', status: 'Achieved', comment: 'Good progress this term.' },
                { subject: 'Mathematics', grade: 'Merit / 72%', level: 'Higher', teacher: 'Finola Butler', status: 'Merit', comment: 'Excellent work in mathematics.' },
                { subject: 'Geography', grade: 'Achieved / 58%', level: 'Higher', teacher: 'Grace Killeen', status: 'Achieved', comment: 'Solid understanding of concepts.' },
                { subject: 'Business Studies', grade: 'Merit / 65%', level: 'Higher', teacher: 'Emer Nugent', status: 'Merit', comment: 'Very engaged in class discussions.' }
            ]
        },
        behaviourReports: [
            {
                id: 1,
                type: 'negative',
                title: 'Negatively Impacting on Teaching & Learning',
                date: '3rd February 2026 10:43',
                subject: 'English',
                raisedBy: 'Eimear McMahon',
                points: 0,
                comment: 'Cory spoke to me at the beginning of class to explain that while his homework was completed, he did not have it with him for the lesson...',
                parentResponse: null
            },
            {
                id: 2,
                type: 'positive',
                title: 'Support for Student Learning',
                date: '29th January 2026 12:34',
                subject: 'Outside class',
                raisedBy: 'Darragh Lohan',
                points: 10,
                comment: 'Cory helped organize the school library during lunch break. Great initiative!',
                parentResponse: 'seen'
            }
        ],
        toiletBreaks: [
            { exit: '09:15', return: '09:22', total: 7, class: 'Mathematics', teacher: 'Finola Butler' },
            { exit: '11:30', return: '11:35', total: 5, class: 'Geography', teacher: 'Grace Killeen' },
            { exit: '14:10', return: '14:18', total: 8, class: 'Irish', teacher: 'Cathy Keane' },
        ],
        books: [
            { id: 1, title: 'English Textbook - Higher Level', barcode: '978-1234567890', type: 'Textbook', isbn: '978-1234567890' },
            { id: 2, title: 'Mathematics Workbook', barcode: '978-0987654321', type: 'Workbook', isbn: '978-0987654321' },
            { id: 3, title: 'Scientific Calculator', barcode: 'CALC-001', type: 'Equipment', isbn: 'N/A' }
        ]
    },
    'blank-student': {
        id: 'STU002',
        firstName: 'Jordan',
        lastName: 'Murphy',
        email: '24jordanmurphy@shannoncomp.ie',
        dob: '2008-08-20',
        gender: 'Male',
        yearGroup: '5th Year',
        class: '5B',
        hasTimetable: false,
        attendancePercentage: 89.2,
        lates: 7,
        absences: 15
    }
};

// Open student detail view
function viewStudent(studentId) {
    // In real implementation, fetch from API
    // For now, use mock data
    currentStudentData = mockStudentsData['24corykilmartin@shannoncomp.ie'];
    
    if (!currentStudentData) {
        alert('Student not found');
        return;
    }
    
    // Populate header
    document.getElementById('detail-student-name').textContent = `${currentStudentData.firstName} ${currentStudentData.lastName}`;
    document.getElementById('detail-student-id').textContent = `ID: ${currentStudentData.id}`;
    document.getElementById('detail-student-year').textContent = currentStudentData.yearGroup;
    document.getElementById('detail-student-class').textContent = `Class ${currentStudentData.classGroup || currentStudentData.class}`;
    
    // Populate personal info
    document.getElementById('info-firstname').textContent = currentStudentData.firstName || 'N/A';
    document.getElementById('info-lastname').textContent = currentStudentData.lastName || 'N/A';
    document.getElementById('info-dob').textContent = currentStudentData.dob || 'N/A';
    document.getElementById('info-gender').textContent = currentStudentData.gender || 'N/A';
    document.getElementById('info-pps').textContent = currentStudentData.pps || 'N/A';
    document.getElementById('info-address').textContent = currentStudentData.address || 'N/A';
    document.getElementById('info-eircode').textContent = currentStudentData.eircode || 'N/A';
    document.getElementById('info-phone').textContent = currentStudentData.phone || 'N/A';
    document.getElementById('info-email').textContent = currentStudentData.email || 'N/A';
    document.getElementById('info-studentid').textContent = currentStudentData.id || 'N/A';
    document.getElementById('info-yeargroup').textContent = currentStudentData.yearGroup || 'N/A';
    document.getElementById('info-classgroup').textContent = currentStudentData.classGroup || 'N/A';
    document.getElementById('info-course').textContent = currentStudentData.course || 'N/A';
    document.getElementById('info-programme').textContent = currentStudentData.programme || 'N/A';
    document.getElementById('info-enrolldate').textContent = currentStudentData.enrollDate || 'N/A';
    document.getElementById('info-deptid').textContent = currentStudentData.departmentPupilId || 'N/A';
    document.getElementById('info-examnumber').textContent = currentStudentData.examNumber || 'N/A';
    document.getElementById('info-locker').textContent = currentStudentData.lockerNumber || 'N/A';
    document.getElementById('info-status').textContent = currentStudentData.status || 'N/A';
    document.getElementById('info-parent1').textContent = currentStudentData.parent1 || 'N/A';
    document.getElementById('info-parent1phone').textContent = currentStudentData.parent1phone || 'N/A';
    document.getElementById('info-parent1email').textContent = currentStudentData.parent1email || 'N/A';
    document.getElementById('info-parent2').textContent = currentStudentData.parent2 || 'N/A';
    document.getElementById('info-parent2phone').textContent = currentStudentData.parent2phone || 'N/A';
    document.getElementById('info-parent2email').textContent = currentStudentData.parent2email || 'N/A';
    
    // Load timetable
    generateTimetable();
    
    // Load attendance data
    loadAttendanceData();
    
    // Load assessment results
    loadAssessmentResults();
    
    // Load behaviour reports
    loadBehaviourReports();
    
    // Load books
    loadBooks();
    
    // Show overlay
    document.getElementById('student-detail-overlay').style.display = 'block';
}

// Close student detail view
function closeStudentDetail() {
    document.getElementById('student-detail-overlay').style.display = 'none';
    timetableEditMode = false;
    editedTimetable = {};
}

// Tab switching
document.addEventListener('DOMContentLoaded', () => {
    // Main tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
    
    // Subtabs (School Life)
    document.querySelectorAll('.subtab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const subtabId = btn.getAttribute('data-subtab');
            document.getElementById(`subtab-${subtabId}`).classList.add('active');
        });
    });
});

// TIMETABLE FUNCTIONS
function generateTimetable() {
    const container = document.getElementById('timetable-grid-container');
    
    if (!currentStudentData.hasTimetable) {
        // Show "No timetable yet" grid
        container.innerHTML = generateEmptyTimetable();
        return;
    }
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [
        { label: 'Period 1', time: '09:00-09:40', type: 'class' },
        { label: 'Period 2', time: '09:40-10:20', type: 'class' },
        { label: 'Period 3', time: '10:20-11:00', type: 'class' },
        { label: 'Break', time: '11:00-11:15', type: 'break' },
        { label: 'Period 4', time: '11:15-11:55', type: 'class' },
        { label: 'Period 5', time: '11:55-12:35', type: 'class' },
        { label: 'Period 6', time: '12:35-13:15', type: 'class' },
        { label: 'Lunch', time: '13:15-14:00', type: 'lunch' },
        { label: 'Period 7', time: '14:00-14:40', type: 'class' },
        { label: 'Period 8', time: '14:40-15:20', type: 'class' },
        { label: 'Period 9', time: '15:20-16:00', type: 'class', daysOnly: ['Monday', 'Tuesday'] }
    ];
    
    let html = '<div class="timetable-grid" style="grid-template-columns: 100px repeat(5, 1fr);">';
    
    // Header row
    html += '<div class="timetable-cell timetable-header-cell"></div>';
    days.forEach(day => {
        html += `<div class="timetable-cell timetable-header-cell">${day}</div>`;
    });
    
    // Period rows
    periods.forEach((period, pIndex) => {
        html += `<div class="timetable-cell timetable-period-cell">
            <div>${period.label}</div>
            <div style="font-size: 0.75rem;">${period.time}</div>
        </div>`;
        
        days.forEach(day => {
            if (period.type === 'break' || period.type === 'lunch') {
                // Show break/lunch cell
                html += `<div class="timetable-cell">
                    <div class="timetable-break ${period.type === 'lunch' ? 'timetable-lunch' : ''}">
                        <i class="fas fa-${period.type === 'lunch' ? 'utensils' : 'coffee'}"></i> ${period.label}
                    </div>
                </div>`;
            } else if (period.daysOnly && !period.daysOnly.includes(day)) {
                // Empty cell for days that don't have this period
                html += '<div class="timetable-cell"><div class="timetable-no-period">—</div></div>';
            } else {
                const key = `${day}-${pIndex + 1}`;
                const classInfo = currentStudentData.timetable?.[key];
                
                if (classInfo) {
                    const editableAttr = timetableEditMode ? `onclick="openEditTimetableModal('${key}')" style="cursor: pointer;"` : '';
                    html += `<div class="timetable-cell">
                        <div class="timetable-class ${classInfo.color}" ${editableAttr} data-key="${key}">
                            <div class="class-subject">${classInfo.subject}</div>
                            <div class="class-teacher">${classInfo.teacher}</div>
                            <div class="class-room">Room ${classInfo.room}</div>
                        </div>
                    </div>`;
                } else {
                    const editableAttr = timetableEditMode ? `onclick="openEditTimetableModal('${key}')" style="cursor: pointer;"` : '';
                    html += `<div class="timetable-cell">
                        <div class="timetable-empty" ${editableAttr} data-key="${key}">
                            ${timetableEditMode ? '<i class="fas fa-plus"></i><br>Add Class' : ''}
                        </div>
                    </div>`;
                }
            }
        });
    });
    
    html += '</div>';
    container.innerHTML = html;
}
            
            if (classInfo) {
                const editableAttr = timetableEditMode ? `onclick="editTimetableCell('${key}')" style="cursor: pointer;"` : '';
                html += `<div class="timetable-cell">
                    <div class="timetable-class ${classInfo.color}" ${editableAttr} data-key="${key}">
                        <div class="class-subject">${classInfo.subject}</div>
                        <div class="class-teacher">${classInfo.teacher}</div>
                        <div class="class-room">Room ${classInfo.room}</div>
                    </div>
                </div>`;
            } else {
                html += '<div class="timetable-cell"></div>';
            }
        });
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function generateEmptyTimetable() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5'];
    
    let html = '<div class="timetable-grid">';
    
    // Header row
    html += '<div class="timetable-cell timetable-header-cell"></div>';
    days.forEach(day => {
        html += `<div class="timetable-cell timetable-header-cell">${day}</div>`;
    });
    
    // Period rows with grey "No timetable yet" boxes
    periods.forEach(period => {
        html += `<div class="timetable-cell timetable-period-cell">${period}</div>`;
        
        days.forEach(() => {
            html += `<div class="timetable-cell">
                <div class="timetable-class no-class">No timetable yet</div>
            </div>`;
        });
    });
    
    html += '</div>';
    return html;
}

function editTimetable() {
    timetableEditMode = true;
    editedTimetable = { ...currentStudentData.timetable };
    
    document.getElementById('publish-timetable-btn').style.display = 'inline-flex';
    
    // Show edit UI hints
    showAlert('Timetable Edit Mode', 'Click on any class to edit it. Changes will be saved locally until you click \"Publish Timetable\".', 'info');
    
    generateTimetable();
}

// UPDATED: Open custom modal for timetable editing instead of browser prompts
function openEditTimetableModal(key) {
    if (!timetableEditMode) return;
    
    const classInfo = editedTimetable[key] || currentStudentData.timetable[key] || {};
    
    showPrompt('Edit Timetable Period', [
        { name: 'subject', label: 'Subject', type: 'text', value: classInfo.subject || '', placeholder: 'e.g., Mathematics', required: true },
        { name: 'teacher', label: 'Primary Teacher', type: 'text', value: classInfo.teacher || '', placeholder: 'e.g., Ms. Smith', required: true },
        { name: 'room', label: 'Room', type: 'text', value: classInfo.room || '', placeholder: 'e.g., B13', required: false }
    ], (values) => {
        // Determine color based on subject
        const color = getSubjectColor(values.subject);
        
        // Save to temporary edit storage
        editedTimetable[key] = {
            subject: values.subject,
            teacher: values.teacher,
            room: values.room,
            color: color
        };
        
        // Update display immediately
        const cell = document.querySelector(`[data-key="${key}"]`);
        if (cell) {
            cell.className = `timetable-class ${color}`;
            cell.innerHTML = `
                <div class="class-subject">${values.subject}</div>
                <div class="class-teacher">${values.teacher}</div>
                <div class="class-room">Room ${values.room}</div>
            `;
        }
        
        showToast('Period updated successfully!', 'success');
    });
}

function getSubjectColor(subject) {
    const lowerSubject = subject.toLowerCase();
    if (lowerSubject.includes('english')) return 'subject-english';
    if (lowerSubject.includes('math')) return 'subject-math';
    if (lowerSubject.includes('irish')) return 'subject-irish';
    if (lowerSubject.includes('geography')) return 'subject-geography';
    if (lowerSubject.includes('business')) return 'subject-business';
    if (lowerSubject.includes('german')) return 'subject-german';
    if (lowerSubject.includes('history')) return 'subject-history';
    if (lowerSubject.includes('home')) return 'subject-home-ec';
    if (lowerSubject.includes('wood')) return 'subject-wood-tech';
    if (lowerSubject.includes('physical') || lowerSubject.includes('pe')) return 'subject-pe';
    if (lowerSubject.includes('science')) return 'subject-science';
    if (lowerSubject.includes('art')) return 'subject-art';
    if (lowerSubject.includes('music')) return 'subject-music';
    if (lowerSubject.includes('computer')) return 'subject-computer';
    if (lowerSubject.includes('study')) return 'subject-study';
    return 'subject-english'; // default
}

function publishTimetable() {
    // Save to backend (in real implementation)
    currentStudentData.timetable = { ...currentStudentData.timetable, ...editedTimetable };
    currentStudentData.hasTimetable = true;
    
    timetableEditMode = false;
    document.getElementById('publish-timetable-btn').style.display = 'none';
    
    // WHITE FLASH ANIMATION
    const whiteFlash = document.createElement('div');
    whiteFlash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 12000;
        animation: flashWhite 0.4s ease;
    `;
    document.body.appendChild(whiteFlash);
    
    setTimeout(() => {
        whiteFlash.remove();
        
        // Show success overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(16, 185, 129, 0.95);
            z-index: 12000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <i class="fas fa-check-circle" style="font-size: 5rem; margin-bottom: 1rem; animation: checkmark 0.6s ease;"></i>
                <h2 style="font-size: 2rem; margin: 0; animation: slideUp 0.5s ease 0.2s both;">Timetable Published!</h2>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                overlay.remove();
                
                // Refresh timetable display
                generateTimetable();
                
                // Show subtle success toast
                showToast('Timetable has been updated and is now live!', 'success');
            }, 300);
        }, 1800);
    }, 400);
}

// ATTENDANCE FUNCTIONS
function loadAttendanceData() {
    if (!currentStudentData) return;
    
    const attendance = currentStudentData.attendancePercentage || 0;
    const lates = currentStudentData.lates || 0;
    const absences = currentStudentData.absences || 0;
    
    document.getElementById('attendance-percentage').textContent = attendance + '%';
    document.getElementById('attendance-lates').textContent = lates;
    document.getElementById('attendance-absences').textContent = absences;
    
    // Create pie chart
    const pieCtx = document.getElementById('attendance-pie-chart');
    if (pieCtx && typeof Chart !== 'undefined') {
        new Chart(pieCtx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Partial', 'Absent'],
                datasets: [{
                    data: [attendance, 5, 100 - attendance - 5],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Create bar chart for missed subjects
    const barCtx = document.getElementById('missed-subjects-chart');
    if (barCtx && typeof Chart !== 'undefined') {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Math', 'English', 'Irish', 'Geography', 'Business'],
                datasets: [{
                    label: 'Missed Classes',
                    data: [2, 3, 1, 2, 0],
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// ASSESSMENT FUNCTIONS
function loadAssessmentResults() {
    const term = document.getElementById('term-selector').value;
    const container = document.getElementById('assessment-results-container');
    
    const results = currentStudentData.assessments?.[term] || [];
    
    let html = '';
    results.forEach(result => {
        const gradeClass = result.status === 'Merit' ? 'grade-merit' : 
                          result.status === 'Achieved' ? 'grade-achieved' :
                          result.status === 'Partial' ? 'grade-partial' : 'grade-not-achieved';
        
        html += `
            <div class="assessment-card">
                <div>
                    <div class="assessment-subject">${result.subject}</div>
                    <div class="assessment-teacher">Teacher: ${result.teacher} • Level: ${result.level}</div>
                </div>
                <div class="assessment-grade ${gradeClass}">${result.grade.split(' / ')[1] || result.grade}</div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="text-align: center; color: #6b7280; padding: 2rem;">No results available for this term.</p>';
}

function downloadResults() {
    showToast('Downloading assessment results...', 'info', 2000);
    // In real implementation, generate PDF download
}

// BEHAVIOUR FUNCTIONS
function loadBehaviourReports() {
    const container = document.getElementById('behaviour-reports-container');
    const reports = currentStudentData.behaviourReports || [];
    
    let html = '';
    reports.forEach(report => {
        const icon = report.type === 'positive' ? '<i class="fas fa-thumbs-up"></i>' :
                    report.type === 'negative' ? '<i class="fas fa-thumbs-down"></i>' :
                    '<i class="fas fa-info-circle"></i>';
        
        const responseHtml = report.parentResponse ? 
            '<div class="parent-response seen"><i class="fas fa-eye"></i> Parent Viewed</div>' : '';
        
        html += `
            <div class="behaviour-card ${report.type}" onclick="viewBehaviourDetail(${report.id})">
                <div class="behaviour-header">
                    <div class="behaviour-type">${icon} ${report.title}</div>
                    <div class="behaviour-date">${report.date}</div>
                </div>
                <div class="behaviour-content">${report.comment.substring(0, 150)}${report.comment.length > 150 ? '...' : ''}</div>
                <div class="behaviour-footer">
                    <div><strong>Subject:</strong> ${report.subject} • <strong>Raised By:</strong> ${report.raisedBy}</div>
                    ${responseHtml}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="text-align: center; color: #6b7280; padding: 2rem;">No behaviour reports.</p>';
    
    // Load toilet breaks
    loadToiletBreaks();
}

function viewBehaviourDetail(id) {
    const report = currentStudentData.behaviourReports.find(r => r.id === id);
    if (report) {
        showAlert(
            'Behaviour Report Details',
            `<strong>Report:</strong><br>${report.comment}<br><br><strong>Parent Response:</strong><br>${report.parentResponse || 'No response yet'}`,
            report.type === 'positive' ? 'success' : 'warning'
        );
    }
}

function loadToiletBreaks() {
    const breaks = currentStudentData.toiletBreaks || [];
    
    document.getElementById('toilet-total').textContent = breaks.length;
    const avgDuration = breaks.reduce((sum, b) => sum + b.total, 0) / breaks.length || 0;
    document.getElementById('toilet-avg-duration').textContent = Math.round(avgDuration) + ' min';
    document.getElementById('toilet-term-count').textContent = breaks.length; // In real app, filter by term
    
    const listContainer = document.getElementById('toilet-breaks-list');
    let html = '';
    breaks.forEach(br => {
        html += `
            <div class="toilet-break-item">
                <div><span class="label">Exit:</span> <span class="value">${br.exit}</span></div>
                <div><span class="label">Return:</span> <span class="value">${br.return}</span></div>
                <div><span class="label">Duration:</span> <span class="value">${br.total} min</span></div>
                <div><span class="label">Class:</span> <span class="value">${br.class}</span></div>
            </div>
        `;
    });
    listContainer.innerHTML = html;
    
    // Create chart
    const ctx = document.getElementById('toilet-breaks-chart');
    if (ctx && typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Term 1', 'Term 2', 'Term 3', 'Full Year'],
                datasets: [{
                    label: 'Toilet Breaks',
                    data: [breaks.length, 0, 0, breaks.length],
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// ABSENCES MODAL
function viewAbsences() {
    // Mock absences data
    const absences = [
        { date: '2026-01-15', reason: 'Medical appointment', status: 'approved', submittedBy: 'Mary Kilmartin' },
        { date: '2026-01-22', reason: 'Family emergency', status: 'approved', submittedBy: 'Mary Kilmartin' },
        { date: '2026-02-03', reason: 'Illness - Flu', status: 'pending', submittedBy: 'Mary Kilmartin' }
    ];
    
    let html = '';
    absences.forEach(abs => {
        const statusClass = abs.status === 'approved' ? 'text-green-600' : abs.status === 'rejected' ? 'text-red-600' : 'text-orange-600';
        const statusIcon = abs.status === 'approved' ? '✓' : abs.status === 'rejected' ? '✗' : '⏳';
        
        html += `
            <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>${abs.date}</strong>
                    <span class="${statusClass}" style="font-weight: 600;">${statusIcon} ${abs.status.toUpperCase()}</span>
                </div>
                <div style="color: #6b7280; margin-bottom: 0.25rem;"><strong>Reason:</strong> ${abs.reason}</div>
                <div style="color: #6b7280; font-size: 0.85rem;"><strong>Submitted by:</strong> ${abs.submittedBy}</div>
            </div>
        `;
    });
    
    document.getElementById('absences-list').innerHTML = html;
    document.getElementById('absences-modal').style.display = 'flex';
}

function closeAbsencesModal() {
    document.getElementById('absences-modal').style.display = 'none';
}

// BOOKS FUNCTIONS
function loadBooks() {
    const container = document.getElementById('books-list-container');
    const books = currentStudentData.books || [];
    
    let html = '';
    books.forEach(book => {
        const icon = book.type === 'Textbook' ? 'fa-book' :
                    book.type === 'Workbook' ? 'fa-book-open' :
                    book.type === 'Equipment' ? 'fa-calculator' : 'fa-box';
        
        html += `
            <div class="book-item">
                <div class="book-info">
                    <div class="book-icon"><i class="fas ${icon}"></i></div>
                    <div class="book-details">
                        <h4>${book.title}</h4>
                        <p>Type: ${book.type} • Barcode: ${book.barcode}</p>
                    </div>
                </div>
                <div class="book-actions">
                    <button onclick="removeBook(${book.id})"><i class="fas fa-trash"></i> Remove</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="text-align: center; color: #6b7280; padding: 2rem;">No books or supplies assigned yet.</p>';
}

function showBarcodeScanner() {
    document.getElementById('barcode-scanner-modal').style.display = 'flex';
    document.getElementById('book-barcode').focus();
}

function closeBarcodeScanner() {
    document.getElementById('barcode-scanner-modal').style.display = 'none';
    document.getElementById('book-barcode').value = '';
    document.getElementById('book-title').value = '';
}

function saveBook() {
    const barcode = document.getElementById('book-barcode').value;
    const title = document.getElementById('book-title').value;
    const type = document.getElementById('book-type').value;
    
    if (!barcode || !title) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Add to current student data
    if (!currentStudentData.books) currentStudentData.books = [];
    
    currentStudentData.books.push({
        id: Date.now(),
        title,
        barcode,
        type,
        isbn: barcode
    });
    
    closeBarcodeScanner();
    loadBooks();
    
    // Show success
    showToast('Book added successfully!', 'success');
}

function removeBook(bookId) {
    showConfirm(
        'Remove Book/Supply',
        'Are you sure you want to remove this item from the student\'s books and supplies list?',
        () => {
            currentStudentData.books = currentStudentData.books.filter(b => b.id !== bookId);
            loadBooks();
            showToast('Book removed successfully', 'success');
        }
    );
}

function addBehaviourReport() {
    showAlert('Add Behaviour Report', 'This feature will open a form to create a new behaviour report for the student.', 'info');
}

// Make functions globally available
window.viewStudent = viewStudent;
window.closeStudentDetail = closeStudentDetail;
window.editTimetable = editTimetable;
window.openEditTimetableModal = openEditTimetableModal;
window.publishTimetable = publishTimetable;
window.loadAssessmentResults = loadAssessmentResults;
window.downloadResults = downloadResults;
window.viewAbsences = viewAbsences;
window.closeAbsencesModal = closeAbsencesModal;
window.viewBehaviourDetail = viewBehaviourDetail;
window.showBarcodeScanner = showBarcodeScanner;
window.closeBarcodeScanner = closeBarcodeScanner;
window.saveBook = saveBook;
window.removeBook = removeBook;
window.addBehaviourReport = addBehaviourReport;

console.log('Student Detail View JavaScript loaded');
