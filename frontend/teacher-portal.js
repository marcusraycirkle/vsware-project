const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : `${window.location.protocol}//${window.location.host}/api`;

const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Excused', 'Half Day', 'SchoolActivity', 'Medical', 'AbsentExplained'];
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const state = {
    token: localStorage.getItem('token') || '',
    user: null,
    teacher: null,
    teacherClasses: [],
    classById: {},
    todaySlots: [],
    timetable: null,
    selectedDay: null,
    chart: null
};

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bg = type === 'error' ? '#ef4444' : '#10b981';
    toast.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:99999;background:${bg};color:#fff;padding:10px 14px;border-radius:8px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.2);`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (state.token) {
        headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.message || 'Request failed');
    }

    return payload;
}

function getUserFullName(user) {
    if (!user) return 'Teacher User';
    const fullName = `${(user.firstName || '').trim()} ${(user.lastName || '').trim()}`.trim();
    return fullName || user.name || user.fullName || user.email || 'Teacher User';
}

function getTodayName() {
    return new Date().toLocaleDateString('en-IE', { weekday: 'long' });
}

function mapPeriodToRoomBookingLabel(periodNumber) {
    const map = {
        1: 'Class 1',
        2: 'Class 2',
        3: 'Class 3',
        4: 'Class 4',
        5: 'Class 5',
        6: 'Class 6',
        7: 'Class 7',
        8: 'Class 8',
        9: 'Class 9'
    };
    return map[periodNumber] || 'Class 1';
}

function supportCardBadge(student) {
    const support = student.supportCard || {};
    const color = (support.color || 'none').toLowerCase();
    if (color === 'none') return '<span class="support-badge support-none" title="No support card"></span>';
    return `<button type="button" class="support-badge support-${color}" data-support='${JSON.stringify({
        color,
        reason: support.reason || 'No reason set',
        description: support.description || 'No description set'
    }).replace(/'/g, '&apos;')}' title="View support card"></button>`;
}

function bindSupportCardPopups() {
    document.querySelectorAll('.support-badge[data-support]').forEach((btn) => {
        btn.addEventListener('click', () => {
            try {
                const data = JSON.parse((btn.getAttribute('data-support') || '{}').replace(/&apos;/g, "'"));
                const modal = document.createElement('div');
                modal.className = 'support-modal-overlay';
                modal.innerHTML = `
                    <div class="support-modal">
                        <h4>${escapeHtml((data.color || '').toUpperCase())} Support Card</h4>
                        <p><strong>Reason:</strong> ${escapeHtml(data.reason || '')}</p>
                        <p><strong>Description:</strong> ${escapeHtml(data.description || '')}</p>
                        <button type="button" class="btn-primary" id="close-support-modal">Close</button>
                    </div>
                `;
                document.body.appendChild(modal);
                document.getElementById('close-support-modal').addEventListener('click', () => modal.remove());
                modal.addEventListener('click', (event) => {
                    if (event.target === modal) modal.remove();
                });
            } catch (error) {
                showToast('Could not open support card', 'error');
            }
        });
    });
}

function getAttendanceFromRows() {
    const rows = document.querySelectorAll('[data-student-row]');
    const attendanceList = [];
    rows.forEach((row) => {
        const studentId = row.getAttribute('data-student-row');
        const status = row.querySelector('.attendance-status')?.value || 'Present';
        const reason = row.querySelector('.attendance-reason')?.value || '';
        const notes = row.querySelector('.attendance-notes')?.value || '';
        attendanceList.push({ studentId, status, reason, notes });
    });
    return attendanceList;
}

async function submitAttendance() {
    const classId = document.getElementById('attendance-class-select')?.value;
    if (!classId) {
        showToast('Select a class first', 'error');
        return;
    }

    const selectedSlotRaw = document.getElementById('attendance-slot-select')?.value || '';
    const selectedSlot = selectedSlotRaw ? JSON.parse(selectedSlotRaw) : null;
    const period = selectedSlot ? Number(selectedSlot.periodNumber || 1) : 1;
    const subject = selectedSlot ? selectedSlot.subjectId : undefined;

    const attendanceList = getAttendanceFromRows();
    if (attendanceList.length === 0) {
        showToast('No students found in this class', 'error');
        return;
    }

    try {
        await apiCall('/attendance/bulk', {
            method: 'POST',
            body: JSON.stringify({
                class: classId,
                date: new Date().toISOString(),
                period,
                subject,
                attendanceList
            })
        });
        showToast('Attendance saved successfully');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadAttendanceClassRoster() {
    const classId = document.getElementById('attendance-class-select')?.value;
    const rosterWrap = document.getElementById('attendance-roster');
    if (!rosterWrap) return;

    if (!classId) {
        rosterWrap.innerHTML = '<div style="padding:12px;color:#6b7280;">Select a class and slot to take attendance.</div>';
        return;
    }

    rosterWrap.innerHTML = 'Loading students...';
    try {
        const classData = await apiCall(`/classes/${classId}`);
        const students = Array.isArray(classData.students) ? classData.students : [];

        if (students.length === 0) {
            rosterWrap.innerHTML = '<div style="padding:12px;color:#6b7280;">No students found in this class.</div>';
            return;
        }

        rosterWrap.innerHTML = `
            <div class="attendance-table-wrap">
                <table class="attendance-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Support</th>
                            <th>Status</th>
                            <th>Reason</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map((student) => {
                            const user = student.user || {};
                            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || student.studentId;
                            return `
                                <tr data-student-row="${student._id}">
                                    <td>
                                        <div style="font-weight:600;">${escapeHtml(fullName)}</div>
                                        <small style="color:#6b7280;">${escapeHtml(student.studentId || '')}</small>
                                    </td>
                                    <td>${supportCardBadge(student)}</td>
                                    <td>
                                        <select class="attendance-status">
                                            ${ATTENDANCE_STATUSES.map((status) => `<option value="${status}">${status}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td><input type="text" class="attendance-reason" placeholder="Optional"></td>
                                    <td><input type="text" class="attendance-notes" placeholder="Optional"></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        bindSupportCardPopups();
    } catch (error) {
        rosterWrap.innerHTML = `<div style="padding:12px;color:#dc2626;">${escapeHtml(error.message)}</div>`;
    }
}

function renderAttendancePage() {
    const page = document.getElementById('page-attendance');
    if (!page) return;

    const slotOptions = state.todaySlots.map((slot) => {
        const optionValue = JSON.stringify({
            periodNumber: slot.periodNumber,
            subjectId: slot.subject?._id || slot.subject?.id || null
        }).replace(/"/g, '&quot;');
        return `<option value="${optionValue}">Period ${slot.periodNumber} • ${escapeHtml(slot.subject?.name || 'Class')} (${escapeHtml(slot.startTime || '')}-${escapeHtml(slot.endTime || '')})</option>`;
    }).join('');

    page.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Attendance</h2>
                <p class="page-subtitle">Take attendance for today's classes</p>
            </div>
        </div>
        <div class="dashboard-card" style="padding:16px;">
            <div class="teacher-form-grid">
                <div>
                    <label>Class</label>
                    <select id="attendance-class-select">
                        <option value="">Select class</option>
                        ${state.teacherClasses.map((classItem) => `<option value="${classItem._id}">${escapeHtml(classItem.name || `${classItem.yearGroup || ''} ${classItem.section || ''}`)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label>Today's Slot</label>
                    <select id="attendance-slot-select">
                        <option value="">Select slot</option>
                        ${slotOptions}
                    </select>
                </div>
                <div style="display:flex;align-items:flex-end;gap:10px;">
                    <button class="btn-primary" id="take-attendance-now">Take Attendance Now</button>
                    <button class="btn-secondary" id="save-attendance-now">Save Attendance</button>
                </div>
            </div>
            <div id="attendance-roster" style="margin-top:16px;"></div>
        </div>
    `;

    document.getElementById('take-attendance-now')?.addEventListener('click', loadAttendanceClassRoster);
    document.getElementById('save-attendance-now')?.addEventListener('click', submitAttendance);
    document.getElementById('attendance-class-select')?.addEventListener('change', loadAttendanceClassRoster);
}

function getSlotsForDay(dayName) {
    const scheduleDays = Array.isArray(state.timetable?.schedule) ? state.timetable.schedule : [];
    const dayEntry = scheduleDays.find((entry) => entry.day === dayName);
    return dayEntry && Array.isArray(dayEntry.periods) ? dayEntry.periods : [];
}

function renderTimetableDay(dayName) {
    const list = document.getElementById('timetable-day-list');
    if (!list) return;

    const slots = getSlotsForDay(dayName).slice().sort((a, b) => Number(a.periodNumber || 0) - Number(b.periodNumber || 0));
    const slotByPeriod = {};
    slots.forEach((slot) => {
        slotByPeriod[String(slot.periodNumber)] = slot;
    });

    let html = '';
    for (let period = 1; period <= 9; period += 1) {
        const slot = slotByPeriod[String(period)];
        if (!slot || slot.isBreak) {
            html += `
                <div class="timetable-item break-item">
                    <div class="timetable-time">Period ${period}</div>
                    <div class="timetable-main">
                        <strong>Break</strong>
                        <p>No class scheduled</p>
                    </div>
                </div>
            `;
            continue;
        }

        const subjectName = slot.subject?.name || 'Class';
        const roomName = slot.room || 'Room TBC';
        const className = state.timetable?.class?.name || 'Assigned Class';
        const classId = state.timetable?.class?._id || '';

        html += `
            <div class="timetable-item">
                <div class="timetable-time">${escapeHtml(slot.startTime || '')}-${escapeHtml(slot.endTime || '')}</div>
                <div class="timetable-main">
                    <strong>${escapeHtml(className)} • ${escapeHtml(subjectName)}</strong>
                    <p>${escapeHtml(roomName)}</p>
                    <div class="timetable-actions-inline">
                        <button class="btn-text mark-out-btn" data-period="${period}">Mark Myself Out</button>
                        <button class="btn-text room-book-btn" data-period="${period}">Book Another Room</button>
                        <button class="btn-text view-class-students-btn" data-class-id="${classId}">View Students</button>
                    </div>
                </div>
            </div>
        `;
    }

    list.innerHTML = html;

    document.querySelectorAll('.mark-out-btn').forEach((btn) => {
        btn.addEventListener('click', () => showToast(`Marked out for period ${btn.getAttribute('data-period')}`));
    });

    document.querySelectorAll('.room-book-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            try {
                const periodNum = Number(btn.getAttribute('data-period'));
                const roomData = await apiCall('/rooms?limit=1');
                const room = Array.isArray(roomData.rooms) && roomData.rooms.length > 0 ? roomData.rooms[0] : null;
                if (!room) {
                    showToast('No rooms available', 'error');
                    return;
                }
                await apiCall(`/rooms/${room._id}/book`, {
                    method: 'POST',
                    body: JSON.stringify({
                        date: new Date().toISOString(),
                        period: mapPeriodToRoomBookingLabel(periodNum),
                        purpose: 'Teacher timetable reallocation',
                        notes: 'Booked from teacher timetable panel'
                    })
                });
                showToast(`Booked ${room.roomNumber || room.roomName || 'room'} for period ${periodNum}`);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });

    document.querySelectorAll('.view-class-students-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const classId = btn.getAttribute('data-class-id');
            if (!classId) {
                showToast('Class not available for this slot', 'error');
                return;
            }
            try {
                const classData = await apiCall(`/classes/${classId}`);
                const students = Array.isArray(classData.students) ? classData.students : [];
                const names = students.map((student) => {
                    const user = student.user || {};
                    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || student.studentId;
                }).filter(Boolean);
                alert(`Students in ${classData.name || 'class'}:\n\n${names.join('\n') || 'No students found'}`);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    });
}

function renderTeacherCalendar() {
    const container = document.getElementById('teacher-calendar-events');
    if (!container) return;

    const customDays = JSON.parse(localStorage.getItem('teacher_custom_days') || '[]');
    const staticEvents = [
        { type: 'Day Off', date: '2026-05-04', note: 'Bank Holiday' },
        { type: 'Training Day', date: '2026-06-12', note: 'School CPD Day' }
    ];

    const merged = [...staticEvents, ...customDays];
    container.innerHTML = merged.map((event) => `
        <div class="calendar-event-item">
            <strong>${escapeHtml(event.type)}</strong>
            <span>${escapeHtml(event.date)}</span>
            <p>${escapeHtml(event.note || '')}</p>
        </div>
    `).join('') || '<div style="color:#6b7280;">No events yet.</div>';
}

function renderCalendarPage() {
    const page = document.getElementById('page-calendar');
    if (!page) return;

    const selectedDay = state.selectedDay || getTodayName();

    page.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title">Calendar</h2>
                <p class="page-subtitle">Teacher calendar and weekly timetable</p>
            </div>
        </div>
        <div class="dashboard-card" style="padding:16px; margin-bottom:16px;">
            <div class="teacher-tabs">
                <button class="tab-btn active" data-tab="teacher-calendar">Teacher Calendar</button>
                <button class="tab-btn" data-tab="my-timetable">My Timetable</button>
            </div>
            <div id="teacher-calendar-tab" class="teacher-tab-pane" style="margin-top:12px;">
                <div class="teacher-form-grid">
                    <div>
                        <label>Mark My Day</label>
                        <input type="date" id="custom-day-date">
                    </div>
                    <div>
                        <label>Type</label>
                        <select id="custom-day-type">
                            <option value="Day Off">Day Off</option>
                            <option value="Training Day">Training Day</option>
                            <option value="Meeting">Meeting</option>
                        </select>
                    </div>
                    <div>
                        <label>Description</label>
                        <input type="text" id="custom-day-note" placeholder="Optional note">
                    </div>
                    <div style="display:flex;align-items:flex-end;">
                        <button class="btn-primary" id="save-custom-day">Save Day</button>
                    </div>
                </div>
                <div id="teacher-calendar-events" style="margin-top:12px;"></div>
            </div>
            <div id="my-timetable-tab" class="teacher-tab-pane" style="display:none; margin-top:12px;">
                <div class="day-switcher">
                    ${WEEK_DAYS.map((day) => `<button class="day-btn ${day === selectedDay ? 'active' : ''}" data-day="${day}">${day}</button>`).join('')}
                </div>
                <div id="timetable-day-list" style="margin-top:12px;"></div>
            </div>
        </div>
    `;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.getAttribute('data-tab');
            document.getElementById('teacher-calendar-tab').style.display = tab === 'teacher-calendar' ? 'block' : 'none';
            document.getElementById('my-timetable-tab').style.display = tab === 'my-timetable' ? 'block' : 'none';
        });
    });

    document.getElementById('save-custom-day')?.addEventListener('click', () => {
        const date = document.getElementById('custom-day-date')?.value;
        const type = document.getElementById('custom-day-type')?.value;
        const note = document.getElementById('custom-day-note')?.value || '';
        if (!date) {
            showToast('Pick a date first', 'error');
            return;
        }
        const existing = JSON.parse(localStorage.getItem('teacher_custom_days') || '[]');
        existing.push({ date, type, note });
        localStorage.setItem('teacher_custom_days', JSON.stringify(existing));
        renderTeacherCalendar();
        showToast('Day marked');
    });

    document.querySelectorAll('.day-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            state.selectedDay = btn.getAttribute('data-day');
            document.querySelectorAll('.day-btn').forEach((item) => item.classList.remove('active'));
            btn.classList.add('active');
            renderTimetableDay(state.selectedDay);
        });
    });

    renderTeacherCalendar();
    renderTimetableDay(selectedDay);
}

async function loadTeacherProfile() {
    const search = encodeURIComponent(state.user.email || '');
    const teacherList = await apiCall(`/teachers?limit=200&search=${search}`);
    const matched = Array.isArray(teacherList)
        ? teacherList.find((teacher) => String(teacher.email || '').toLowerCase() === String(state.user.email || '').toLowerCase())
        : null;

    if (!matched) {
        throw new Error('Teacher profile not found');
    }

    state.teacher = matched;
}

async function loadTeacherClasses() {
    const classData = await apiCall('/classes?limit=400');
    const classes = Array.isArray(classData.classes) ? classData.classes : [];
    const teacherId = String(state.teacher?._id || '');

    state.teacherClasses = classes.filter((classItem) => {
        const classTeacherMatch = String(classItem.classTeacher?._id || classItem.classTeacher || '') === teacherId;
        const teacherLinkMatch = Array.isArray(classItem.teachers) && classItem.teachers.some((entry) => String(entry.teacher?._id || entry.teacher || '') === teacherId);
        return classTeacherMatch || teacherLinkMatch;
    });

    state.classById = {};
    state.teacherClasses.forEach((classItem) => {
        state.classById[String(classItem._id)] = classItem;
    });
}

async function loadTeacherTimetable() {
    try {
        state.timetable = await apiCall(`/timetable/teacher/${state.teacher._id}/current`);
    } catch (error) {
        state.timetable = null;
    }

    const todayName = getTodayName();
    state.todaySlots = getSlotsForDay(todayName)
        .filter((slot) => !slot.isBreak)
        .sort((a, b) => Number(a.periodNumber || 0) - Number(b.periodNumber || 0));
}

async function renderDashboardData() {
    const scheduleList = document.querySelector('.schedule-list');
    const scheduleBadge = document.querySelector('#page-dashboard .badge-mini');
    const attendanceStats = document.querySelector('.attendance-stats');

    if (scheduleList) {
        scheduleList.innerHTML = state.todaySlots.map((slot) => {
            const className = state.timetable?.class?.name || 'Class';
            return `
                <div class="schedule-item">
                    <div class="schedule-time">${escapeHtml(slot.startTime || '')} - ${escapeHtml(slot.endTime || '')}</div>
                    <div class="schedule-content">
                        <p><strong>${escapeHtml(className)} - ${escapeHtml(slot.subject?.name || 'Subject')}</strong></p>
                        <p class="schedule-detail">Room ${escapeHtml(slot.room || 'TBC')}</p>
                    </div>
                    <button class="btn-text" onclick="navigateToTeacherPage('attendance')"><i class="fas fa-arrow-right"></i></button>
                </div>
            `;
        }).join('') || '<div style="padding:12px;color:#6b7280;">No classes today.</div>';
    }

    if (scheduleBadge) {
        scheduleBadge.textContent = `${state.todaySlots.length} classes`;
    }

    const today = new Date().toISOString().slice(0, 10);
    try {
        const attendanceData = await apiCall(`/attendance?startDate=${today}&endDate=${today}&limit=5000`);
        const records = Array.isArray(attendanceData.attendance) ? attendanceData.attendance : [];
        const classIds = new Set(state.teacherClasses.map((classItem) => String(classItem._id)));
        const teacherRecords = records.filter((record) => classIds.has(String(record.class?._id || record.class || '')));

        const present = teacherRecords.filter((record) => record.status === 'Present').length;
        const absent = teacherRecords.filter((record) => record.status === 'Absent').length;
        const late = teacherRecords.filter((record) => record.status === 'Late').length;
        const total = teacherRecords.length || 1;
        const percent = Math.round(((present + late) / total) * 1000) / 10;

        const attendanceValue = document.querySelector('.stat-card.green .stat-value');
        if (attendanceValue) attendanceValue.textContent = `${percent}%`;

        if (attendanceStats) {
            attendanceStats.innerHTML = `
                <div class="attendance-stat-item"><span class="stat-dot present"></span><span>Present: ${present}</span></div>
                <div class="attendance-stat-item"><span class="stat-dot absent"></span><span>Absent: ${absent}</span></div>
                <div class="attendance-stat-item"><span class="stat-dot late"></span><span>Late: ${late}</span></div>
            `;
        }

        const canvas = document.getElementById('attendance-chart');
        if (canvas && window.Chart) {
            if (state.chart) state.chart.destroy();
            state.chart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: ['Present', 'Absent', 'Late'],
                    datasets: [{
                        data: [present, absent, late],
                        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    } catch (error) {
        // Keep static dashboard if API call fails
    }
}

function navigateToTeacherPage(pageName) {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (navItem) navItem.classList.add('active');

    document.querySelectorAll('.page-content').forEach((page) => page.classList.remove('active'));
    const pageElement = document.getElementById(`page-${pageName}`);
    if (pageElement) pageElement.classList.add('active');

    if (pageName === 'attendance') {
        renderAttendancePage();
    } else if (pageName === 'calendar') {
        renderCalendarPage();
    }
}

function setupNavigation() {
    const brandLogo = document.querySelector('.brand-logo');
    if (brandLogo) {
        brandLogo.addEventListener('error', () => {
            brandLogo.style.display = 'none';
        });
    }

    document.querySelectorAll('.nav-item').forEach((item) => {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            const page = item.getAttribute('data-page');
            if (page) navigateToTeacherPage(page);
        });
    });

    document.getElementById('logout-link')?.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        window.location.href = '/shannoncomp/login';
    });

    document.getElementById('user-menu-btn')?.addEventListener('click', () => {
        const menu = document.getElementById('user-menu-dropdown');
        if (menu) {
            menu.classList.toggle('open');
            menu.style.display = menu.classList.contains('open') ? 'block' : 'none';
        }
    });
}

async function initTeacherPortal() {
    try {
        state.user = JSON.parse(localStorage.getItem('user') || '{}');
        const role = String(state.user.role || '').toLowerCase();

        if (!state.token || role !== 'teacher') {
            window.location.href = '/shannoncomp/login';
            return;
        }

        const userName = document.querySelector('.user-name');
        if (userName) userName.textContent = getUserFullName(state.user);

        setupNavigation();
        await loadTeacherProfile();
        await loadTeacherClasses();
        await loadTeacherTimetable();
        await renderDashboardData();

        const overlay = document.getElementById('portal-loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.4s ease-out';
            setTimeout(() => overlay.remove(), 400);
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initTeacherPortal);

window.navigateToTeacherPage = navigateToTeacherPage;
