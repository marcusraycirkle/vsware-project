// TUSLA ATTENDANCE REPORT
// Irish school TUSLA (Child and Family Agency) compliance reporting

function loadTUSLAReport() {
    // Initialize date fields with current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    document.getElementById('tusla-start-date').valueAsDate = firstDay;
    document.getElementById('tusla-end-date').valueAsDate = lastDay;
    document.getElementById('tusla-absence-threshold').value = '20';
}

function generateTUSLAReport() {
    const startDate = document.getElementById('tusla-start-date').value;
    const endDate = document.getElementById('tusla-end-date').value;
    const absenceThreshold = document.getElementById('tusla-absence-threshold').value;
    const yearGroup = document.getElementById('tusla-year-group').value;
    
    if (!startDate || !endDate) {
        showToast('Please select both start and end dates', 'error');
        return;
    }
    
    showLoading('Generating TUSLA report...');
    
    // Simulate API call
    setTimeout(() => {
        hideLoading();
        
        // Mock TUSLA data
        const reportData = {
            dateRange: `${startDate} to ${endDate}`,
            totalStudents: yearGroup ? 210 : 1247,
            absenceTypes: [
                { code: 'A', description: 'Absent (No Reason)', count: 45, percentage: 3.6 },
                { code: 'B', description: 'Absent (Notified)', count: 123, percentage: 9.9 },
                { code: 'C', description: 'Absent (Medical Cert)', count: 67, percentage: 5.4 },
                { code: 'D', description: 'Absent (Bereavement)', count: 8, percentage: 0.6 },
                { code: 'E', description: 'Absent (Approved Leave)', count: 34, percentage: 2.7 },
                { code: 'F', description: 'Absent (Family Event)', count: 21, percentage: 1.7 },
                { code: 'H', description: 'Absent (NEWB approved)', count: 12, percentage: 1.0 }
            ],
            fullDayAbsences: 310,
            studentsOver20Days: 23,
            highRiskStudents: [
                { name: 'Student A', yearGroup: '3rd Year', absences: 28, lastContact: '2026-01-15' },
                { name: 'Student B', yearGroup: '5th Year', absences: 25, lastContact: '2026-01-22' },
                { name: 'Student C', yearGroup: '2nd Year', absences: 23, lastContact: '2026-02-01' }
            ]
        };
        
        displayTUSLAReport(reportData);
    }, 1500);
}

function displayTUSLAReport(data) {
    const container = document.getElementById('tusla-results-container');
    
    let html = `
        <div style="background: white; border-radius: 12px; padding: 2rem; border: 2px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; color: #1f2937;">TUSLA Attendance Report</h2>
                    <p style="margin: 0; color: #6b7280;"><strong>Period:</strong> ${data.dateRange}</p>
                    <p style="margin: 0; color: #6b7280;"><strong>Total Students:</strong> ${data.totalStudents}</p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn-secondary" onclick="exportTUSLA('pdf')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                    <button class="btn-secondary" onclick="exportTUSLA('csv')">
                        <i class="fas fa-file-csv"></i> Export CSV
                    </button>
                    <button class="btn-primary" onclick="createTUSLAGroup()">
                        <i class="fas fa-users"></i> Create Group
                    </button>
                </div>
            </div>
            
            <!-- Absence Types Table -->
            <h3 style="margin: 2rem 0 1rem 0; color: #1f2937;">
                <i class="fas fa-table"></i> Absence Types (NEWB Codes)
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Code</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Description</th>
                        <th style="padding: 1rem; text-align: right; font-weight: 600;">Count</th>
                        <th style="padding: 1rem; text-align: right; font-weight: 600;">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.absenceTypes.map((type, index) => `
                        <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 0 ? 'background: #fafafa;' : ''}">
                            <td style="padding: 1rem; font-weight: 700; color: #667eea;">${type.code}</td>
                            <td style="padding: 1rem;">${type.description}</td>
                            <td style="padding: 1rem; text-align: right; font-weight: 600;">${type.count}</td>
                            <td style="padding: 1rem; text-align: right; color: #6b7280;">${type.percentage}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 2rem;">
                <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">Full Day Absences</div>
                    <div style="font-size: 2.5rem; font-weight: 700; margin: 0.5rem 0;">${data.fullDayAbsences}</div>
                    <div style="font-size: 0.85rem; opacity: 0.8;">Across all students</div>
                </div>
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 1.5rem; border-radius: 12px;">
                    <div style="font-size: 0.9rem; opacity: 0.9;">Students Over ${document.getElementById('tusla-absence-threshold').value} Days</div>
                    <div style="font-size: 2.5rem; font-weight: 700; margin: 0.5rem 0;">${data.studentsOver20Days}</div>
                    <div style="font-size: 0.85rem; opacity: 0.8;">Requires intervention</div>
                </div>
            </div>
            
            <!-- High Risk Students -->
            <h3 style="margin: 2rem 0 1rem 0; color: #1f2937;">
                <i class="fas fa-exclamation-triangle"></i> High-Risk Students (20+ Days Absent)
            </h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${data.highRiskStudents.map(student => `
                    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 700; color: #1f2937; margin-bottom: 0.25rem;">${student.name}</div>
                            <div style="color: #6b7280; font-size: 0.9rem;">
                                ${student.yearGroup} • ${student.absences} days absent • Last contact: ${student.lastContact}
                            </div>
                        </div>
                        <button class="btn-primary" onclick="contactStudent('${student.name}')">
                            <i class="fas fa-phone"></i> Contact
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
}

function exportTUSLA(format) {
    showLoading(`Exporting TUSLA report as ${format.toUpperCase()}...`);
    setTimeout(() => {
        hideLoading();
        showToast(`TUSLA report exported successfully!`, 'success');
        if (format === 'pdf') {
            // In real implementation, open PDF in a new tab
            window.open('#', '_blank');
        }
    }, 1500);
}

function createTUSLAGroup() {
    showPrompt('Create Intervention Group', [
        { name: 'groupName', label: 'Group Name', type: 'text', placeholder: 'e.g., Attendance Support Group', required: true },
        { name: 'description', label: 'Description', type: 'text', placeholder: 'Purpose of the group' },
    ], (values) => {
        showToast(`Group "${values.groupName}" created successfully!`, 'success');
    });
}

function contactStudent(studentName) {
    showAlert('Contact Student/Guardian', `This would open communication options for ${studentName}'s guardian, including email, SMS, and call history.`, 'info');
}

// Initialize TUSLA report when page loads
window.loadTUSLAReport = loadTUSLAReport;
window.generateTUSLAReport = generateTUSLAReport;
window.exportTUSLA = exportTUSLA;
window.createTUSLAGroup = createTUSLAGroup;
window.contactStudent = contactStudent;
