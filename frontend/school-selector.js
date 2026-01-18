// School Selector JavaScript
const schools = [
    {
        id: 'shannoncomp',
        name: "St. Patrick's Comprehensive School",
        location: 'Shannon, Co. Clare',
        logo: 'https://www.stpatrickscomprehensive.ie/uploads/2/3/2/0/23206024/editor/st-patrick-s-comp-logo-layout-2-1.png?1564671961',
        color: '#667eea'
    }
];

function loadSchools() {
    const grid = document.getElementById('schools-grid');
    
    if (!grid) {
        console.error('School grid element not found');
        return;
    }
    
    grid.innerHTML = schools.map(school => `
        <div class="school-card" style="border-top: 4px solid ${school.color}">
            <div class="school-logo" style="background: linear-gradient(135deg, ${school.color} 0%, ${school.color}dd 100%)">
                <img src="${school.logo}" alt="${school.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E🎓%3C/text%3E%3C/svg%3E'">
            </div>
            <h2 class="school-name">${school.name}</h2>
            <p class="school-location">
                <i class="fas fa-map-marker-alt"></i> ${school.location}
            </p>
            <div class="school-actions">
                <a href="/admin" class="btn btn-primary">
                    <i class="fas fa-user-shield"></i> Admin Portal
                </a>
                <a href="/shannoncomp/login" class="btn btn-secondary" style="background: linear-gradient(135deg, ${school.color} 0%, ${school.color}dd 100%); color: white; border: none;">
                    <i class="fas fa-chalkboard-teacher"></i> Teacher Login
                </a>
                <a href="/shannoncomp/enrolment" class="btn btn-secondary">
                    <i class="fas fa-user-plus"></i> Enrol
                </a>
            </div>
        </div>
    `).join('');
}

// Load schools on page load
document.addEventListener('DOMContentLoaded', loadSchools);
