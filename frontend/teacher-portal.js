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

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][currentMonth];
    
    let calendarGrid = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">';
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    dayLabels.forEach(day => {
        calendarGrid += `<div style="text-align: center; font-weight: 700; color: #6b7280; padding: 12px 0; font-size: 12px;">${day}</div>`;
    });
    
    const customDays = JSON.parse(localStorage.getItem('teacher_custom_days') || '[]');
    const customDayMap = {};
    customDays.forEach(d => customDayMap[d.date] = d.type);
    
    let currentDate = new Date(startDate);
    for (let i = 0; i < 42; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isCurrentMonth = currentDate.getMonth() === currentMonth;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        const customType = customDayMap[dateStr];
        
        const bgColor = isToday ? '#4F46E5' : (customType ? '#FEF3C7' : (isWeekend ? '#F3F4F6' : '#FFFFFF'));
        const textColor = isToday ? '#FFFFFF' : (isCurrentMonth ? '#111827' : '#9CA3AF');
        const borderColor = customType ? '#F59E0B' : '#e5e7eb';
        
        calendarGrid += `<div style="
            border: 2px solid ${borderColor};
            border-radius: 8px;
            padding: 12px 8px;
            text-align: center;
            background: ${bgColor};
            color: ${textColor};
            font-weight: ${isToday ? '700' : '500'};
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s ease;
            opacity: ${isCurrentMonth ? '1' : '0.5'};
        " title="${customType || ''}" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
            ${currentDate.getDate()}<br><span style="font-size: 10px; opacity: 0.7;">${customType ? customType.substring(0, 3) : ''}</span>
        </div>`;
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    calendarGrid += '</div>';
    
    // Get upcoming classes for next 7 days
    let upcomingClasses = '';
    if (state.todaySlots && state.todaySlots.length > 0) {
        upcomingClasses = `<div style="margin-top: 16px; padding: 12px; background: #E0E7FF; border-radius: 8px; border-left: 4px solid #4F46E5;">
            <div style="font-weight: 700; color: #4F46E5; margin-bottom: 8px;"><i class="fas fa-clock"></i> Today's Classes (${state.todaySlots.length} slots)</div>
            ${state.todaySlots.slice(0, 3).map((slot, idx) => `
                <div style="background: white; padding: 8px 12px; border-radius: 6px; margin: 4px 0; font-size: 13px;">
                    <strong>${escapeHtml(slot.subject?.name || 'Class')} • ${slot.periodNumber || 'P' + (idx + 1)}</strong><br>
                    <span style="color: #6b7280;">${escapeHtml(slot.startTime || '')} - ${escapeHtml(slot.endTime || '')}</span>
                </div>
            `).join('')}
            ${state.todaySlots.length > 3 ? `<div style="color: #6b7280; font-size: 12px; margin-top: 8px;">+${state.todaySlots.length - 3} more</div>` : ''}
        </div>`;
    }
    
    // Quick actions
    const quickActions = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 16px;">
        <button class="btn-primary" style="padding: 10px; font-size: 13px;" onclick="navigateToTeacherPage('attendance'); return false;"><i class="fas fa-clipboard-check"></i> Mark Attendance</button>
        <button class="btn-secondary" style="padding: 10px; font-size: 13px;" onclick="handleMarkDay(); return false;"><i class="fas fa-star"></i> Mark Special Day</button>
        <button class="btn-secondary" style="padding: 10px; font-size: 13px;" onclick="navigateToTeacherPage('timetable'); return false;"><i class="fas fa-calendar-alt"></i> My Timetable</button>
    </div>`;

    page.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title"><i class="fas fa-calendar-days" style="color: #4F46E5; margin-right: 8px;"></i>Calendar</h2>
                <p class="page-subtitle">SchoolYear 2025/2026 • ${monthName} ${currentYear}</p>
            </div>
        </div>
        <div class="dashboard-card" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">${monthName} ${currentYear}</h3>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-text" onclick="previousMonth()"><i class="fas fa-chevron-left"></i></button>
                    <button class="btn-text" onclick="todayCalendar()">Today</button>
                    <button class="btn-text" onclick="nextMonth()"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            ${calendarGrid}
            ${upcomingClasses}
            ${quickActions}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <h4 style="font-size: 13px; font-weight: 700; color: #6b7280; margin: 0 0 12px 0; text-transform: uppercase;">Legend</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 13px;">
                    <div><span style="display: inline-block; width: 20px; height: 20px; background: #4F46E5; border-radius: 4px; margin-right: 8px;"></span>Today</div>
                    <div><span style="display: inline-block; width: 20px; height: 20px; background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 4px; margin-right: 8px;"></span>Special Day</div>
                    <div><span style="display: inline-block; width: 20px; height: 20px; background: #F3F4F6; border-radius: 4px; margin-right: 8px;"></span>Weekend</div>
                    <div><span style="display: inline-block; width: 20px; height: 20px; background: #FFFFFF; border: 1px solid #e5e7eb; border-radius: 4px; margin-right: 8px;"></span>Regular Day</div>
                </div>
            </div>
        </div>
    `;
}
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
    try {
        const profilePayload = await apiCall('/teachers/me/profile');
        if (profilePayload?.teacher?._id) {
            state.teacher = profilePayload.teacher;
            return;
        }
    } catch (error) {
        console.warn('Profile endpoint failed, trying legacy search:', error.message);
    }

    try {
        const search = encodeURIComponent(state.user.email || '');
        const teacherList = await apiCall(`/teachers?limit=200&search=${search}`);
        let matched = null;

        if (Array.isArray(teacherList)) {
            matched = teacherList.find((teacher) => String(teacher.email || '').toLowerCase() === String(state.user.email || '').toLowerCase());
        } else if (teacherList?.teachers && Array.isArray(teacherList.teachers)) {
            matched = teacherList.teachers.find((teacher) => String(teacher.email || '').toLowerCase() === String(state.user.email || '').toLowerCase());
        }

        if (matched) {
            state.teacher = matched;
            return;
        }
    } catch (error) {
        console.warn('Search endpoint failed:', error.message);
    }

    // Create minimal fallback teacher profile
    state.teacher = {
        _id: state.user.teacherProfile || state.user._id || 'teacher-' + Date.now(),
        email: state.user.email || 'teacher@school.ie',
        firstName: state.user.firstName || 'Teacher',
        lastName: state.user.lastName || 'User',
        classes: [],
        subjects: [],
        timetable: null,
        department: 'General'
    };
}

async function loadTeacherClasses() {
    try {
        const classDataResponse = await apiCall('/classes?limit=400');
        let classes = [];

        if (Array.isArray(classDataResponse)) {
            classes = classDataResponse;
        } else if (classDataResponse && Array.isArray(classDataResponse.classes)) {
            classes = classDataResponse.classes;
        }

        if (!Array.isArray(classes)) {
            throw new Error('Invalid class data format');
        }

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
    } catch (error) {
        state.teacherClasses = [];
        state.classById = {};
        showToast('Could not load classes: ' + error.message, 'error');
    }
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
    if (pageElement) {
        pageElement.classList.add('active');
        pageElement.style.display = 'block';
    }

    if (pageName === 'attendance') {
        renderAttendancePage();
    } else if (pageName === 'calendar') {
        renderCalendarPage();
    } else if (pageName === 'assessments') {
        renderAssessmentsPage();
    } else if (pageName === 'messages') {
        renderMessagesPage();
    } else if (pageName === 'timetable') {
        renderTimetablePage();
    }
}

function renderAssessmentsPage() {
    const page = document.getElementById('page-assessments');
    if (!page) return;

    page.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title"><i class="fas fa-chart-bar" style="color: #4F46E5; margin-right: 8px;"></i>Assessments</h2>
                <p class="page-subtitle">View and manage class assessments</p>
            </div>
            <div class="page-actions">
                <button class="btn-primary" onclick="createNewAssessment()"><i class="fas fa-plus"></i> New Assessment</button>
            </div>
        </div>
        <div class="dashboard-card">
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
                    ${state.teacherClasses.length > 0 ? state.teacherClasses.slice(0, 6).map((classItem) => `
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 16px; color: white; cursor: pointer;" onclick="viewClassAssessments('${classItem._id}')">
                            <h4 style="margin: 0 0 8px 0; font-size: 15px;">${escapeHtml(classItem.name || `${classItem.yearGroup} ${classItem.section}`)}</h4>
                            <p style="margin: 0; font-size: 13px; opacity: 0.9;">Click to view assessments</p>
                            <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 12px; opacity: 0.8;">${classItem.students?.length || 0} students</span>
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    `).join('') : `
                        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #6b7280;">
                            <i class="fas fa-inbox" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                            <p>No classes assigned yet</p>
                        </div>
                    `}
                </div>
                
                <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 16px;"><i class="fas fa-history"></i> Recent Assessments</h3>
                    <div style="space-y: 8px;">
                        ${[
                            { name: 'Mid-term Exam', class: 'Year 12A', date: '2 days ago', status: 'Completed' },
                            { name: 'Quiz 3', class: 'Year 11B', date: '5 days ago', status: 'Completed' },
                            { name: 'Project Review', class: 'Year 10C', date: '1 week ago', status: 'Completed' }
                        ].map((a, i) => `
                            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600; color: #111827; font-size: 13px;">${a.name}</div>
                                    <div style="font-size: 12px; color: #6b7280;">${a.class} • ${a.date}</div>
                                </div>
                                <span style="background: #D1FAE5; color: #065F46; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${a.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderMessagesPage() {
    const page = document.getElementById('page-messages');
    if (!page) return;

    page.innerHTML = `
        <div class="page-header">
            <div>
                <h2 class="page-title"><i class="fas fa-envelope" style="color: #4F46E5; margin-right: 8px;"></i>Messages</h2>
                <p class="page-subtitle">Communication with parents and staff</p>
            </div>
            <div class="page-actions">
                <button class="btn-primary" onclick="composeNewMessage()"><i class="fas fa-pen"></i> New Message</button>
            </div>
        </div>
        <div class="dashboard-card">
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: 300px 1fr; gap: 16px; height: 500px;">
                    <!-- Folders -->
                    <div style="background: #f9fafb; border-radius: 10px; padding: 16px; border-right: 1px solid #e5e7eb;">
                        <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280;">Folders</h4>
                        <div style="space-y: 4px;">
                            ${[
                                { name: 'Inbox', count: 5, icon: 'inbox', active: true },
                                { name: 'Sent', count: 12, icon: 'paper-plane'},
                                { name: 'Drafts', count: 1, icon: 'file-alt' },
                                { name: 'Archived', count: 24, icon: 'archive' }
                            ].map(f => `
                                <div style="padding: 10px 12px; border-radius: 6px; cursor: pointer; background: ${f.active ? '#E0E7FF' : 'transparent'}; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: ${f.active ? '#4F46E5' : '#374151'}; font-weight: 500; font-size: 13px;"><i class="fas fa-${f.icon}" style="width: 16px; margin-right: 8px;"></i>${f.name}</span>
                                    <span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">${f.count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Messages List -->
                    <div style="overflow-y: auto; border-left: 1px solid #e5e7eb;">
                        ${[
                            { from: 'Parent - John Smith', subject: 'Question about homework', time: '2 hours ago', unread: true },
                            { from: 'Principal Graham', subject: 'Staff meeting reminder', time: '5 hours ago', unread: false },
                            { from: 'Parent - Sarah O\'Brien', subject: 'Attendance concern', time: 'Yesterday', unread: false },
                            { from: 'Staff - Emma Wilson', subject: 'Timetable clash', time: 'Yesterday', unread: false },
                            { from: 'Parent - Michael Brown', subject: 'Positive feedback', time: '2 days ago', unread: false }
                        ].map((m, i) => `
                            <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; cursor: pointer; background: ${m.unread ? '#F0F9FF' : '#FFFFFF'}; transition: background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='${m.unread ? '#F0F9FF' : '#FFFFFF'}'">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                                    <div>
                                        <div style="font-weight: ${m.unread ? '700' : '500'}; color: #111827; font-size: 13px;">${escapeHtml(m.from)}</div>
                                        <div style="color: #6b7280; font-size: 12px;">${escapeHtml(m.subject)}</div>
                                    </div>
                                    ${m.unread ? '<span style="width: 8px; height: 8px; background: #4F46E5; border-radius: 50%;"></span>' : ''}
                                </div>
                                <div style="font-size: 11px; color: #9CA3AF;">${m.time}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderTimetablePage() {
    const page = document.getElementById('page-timetable');
    if (!page) return;

    const selectedDay = state.selectedDay || getTodayName();
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
                <h2 class="page-title"><i class="fas fa-calendar-alt" style="color: #4F46E5; margin-right: 8px;"></i>My Timetable</h2>
                <p class="page-subtitle">Your weekly schedule and class sessions</p>
            </div>
        </div>
        <div class="dashboard-card" style="padding: 20px;">
            <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700;">Select Day</h3>
                <div class="day-switcher" style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${WEEK_DAYS.map((day) => `
                        <button class="day-btn ${day === selectedDay ? 'active' : ''}" data-day="${day}" style="padding: 8px 16px; border-radius: 6px; border: 1px solid #e5e7eb; background: ${day === selectedDay ? '#4F46E5' : '#FFFFFF'}; color: ${day === selectedDay ? '#FFFFFF' : '#374151'}; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s;">${day}</button>
                    `).join('')}
                </div>
            </div>
            <div id="timetable-day-list"></div>
        </div>
    `;
    
    // Setup day buttons
    document.querySelectorAll('.day-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            state.selectedDay = btn.getAttribute('data-day');
            document.querySelectorAll('.day-btn').forEach((item) => item.style.background = item === btn ? '#4F46E5' : '#FFFFFF');
            document.querySelectorAll('.day-btn').forEach((item) => item.style.color = item === btn ? '#FFFFFF' : '#374151');
            renderTimetableDay(state.selectedDay);
        });
    });
    
    renderTimetableDay(selectedDay);
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

    document.getElementById('user-menu-btn')?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const menu = document.getElementById('user-menu-dropdown');
        if (menu) {
            const isHidden = menu.style.display === 'none' || !menu.style.display;
            menu.style.display = isHidden ? 'block' : 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#user-menu-btn') && !e.target.closest('#user-menu-dropdown')) {
            const menu = document.getElementById('user-menu-dropdown');
            if (menu) {
                menu.style.display = 'none';
            }
        }
    });
}

async function initTeacherPortal() {
    const overlay = document.getElementById('portal-loading-overlay');

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

        try {
            await loadTeacherProfile();
        } catch (error) {
            console.warn('Profile load error (using fallback):', error.message);
            state.teacher = {
                _id: state.user.teacherProfile || state.user._id || 'teacher-local',
                email: state.user.email || '',
                firstName: state.user.firstName || '',
                lastName: state.user.lastName || ''
            };
        }

        try {
            await loadTeacherClasses();
        } catch (error) {
            state.teacherClasses = [];
            state.classById = {};
            console.warn('Classes load error:', error.message);
        }

        try {
            await loadTeacherTimetable();
        } catch (error) {
            state.timetable = null;
            state.todaySlots = [];
            console.warn('Timetable load error:', error.message);
        }

        try {
            await renderDashboardData();
        } catch (error) {
            console.warn('Dashboard render error:', error.message);
        }
    } catch (error) {
        console.error('Portal init error:', error.message);
    } finally {
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.4s ease-out';
            setTimeout(() => overlay.remove(), 400);
        }
    }
}

// ===== CALENDAR HELPER FUNCTIONS =====
function previousMonth() {
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    renderCalendarPage();
}

function nextMonth() {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    renderCalendarPage();
}

function todayCalendar() {
    renderCalendarPage();
}

function handleMarkDay() {
    const dateInput = prompt('Enter date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!dateInput) return;
    
    const type = prompt('Type (Day Off / Training Day / Meeting):', 'Day Off');
    if (!type) return;
    
    const note = prompt('Description (optional):', '');
    
    const existing = JSON.parse(localStorage.getItem('teacher_custom_days') || '[]');
    existing.push({ date: dateInput, type, note: note || '' });
    localStorage.setItem('teacher_custom_days', JSON.stringify(existing));
    
    renderCalendarPage();
    showToast(`Marked ${dateInput} as ${type}`);
}

// ===== STUB/PLACEHOLDER FUNCTIONS FOR ACTION BUTTONS =====
function createNewAssessment() {
    showToast('Create assessment feature coming soon!', 'error');
}

function viewClassAssessments(classId) {
    showToast('View class assessments feature coming soon!', 'error');
}

function composeNewMessage() {
    showToast('Compose message feature coming soon!', 'error');
}

document.addEventListener('DOMContentLoaded', initTeacherPortal);

window.navigateToTeacherPage = navigateToTeacherPage;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.todayCalendar = todayCalendar;
window.handleMarkDay = handleMarkDay;
window.createNewAssessment = createNewAssessment;
window.viewClassAssessments = viewClassAssessments;
window.composeNewMessage = composeNewMessage;
