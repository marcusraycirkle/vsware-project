#!/bin/bash
echo "🎨 Building Complete CompMIS Frontend..."
cd frontend

# Create comprehensive CSS
cat > styles.css << 'CSSEOF'
/* ========== VARIABLES & RESET ========== */
:root {
    --primary: #4F46E5;
    --primary-dark: #4338CA;
    --secondary: #10B981;
    --danger: #EF4444;
    --warning: #F59E0B;
    --info: #3B82F6;
    --success: #10B981;
    
    --bg-main: #F9FAFB;
    --bg-card: #FFFFFF;
    --bg-hover: #F3F4F6;
    
    --text-primary: #111827;
    --text-secondary: #6B7280;
    --text-muted: #9CA3AF;
    
    --border: #E5E7EB;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
    --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
    
    --house-bride: #EF4444;
    --house-ide: #3B82F6;
    --house-tola: #10B981;
    --house-seanan: #F59E0B;
    --house-padraig: #8B5CF6;
    --house-conaire: #EC4899;
    
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg-main);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
}

.hidden { display: none !important; }

/* ========== LANDING PAGE ========== */
.landing-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.landing-nav {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255,255,255,0.2);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
}

.logo-brand i { font-size: 2rem; }

.nav-menu {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.nav-menu a {
    color: rgba(255,255,255,0.9);
    text-decoration: none;
    font-weight: 500;
    transition: var(--transition);
}

.nav-menu a:hover {
    color: white;
    transform: translateY(-2px);
}

.btn-login-hero {
    background: white;
    color: var(--primary);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-login-hero:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.hero-section {
    min-height: calc(100vh - 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}

.animated-bg {
    position: absolute;
    width: 200%;
    height: 200%;
    background: 
        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(-50px, -50px); }
}

.hero-content {
    max-width: 1200px;
    padding: 4rem 2rem;
    text-align: center;
    position: relative;
    z-index: 1;
}

.hero-title {
    font-size: 4.5rem;
    font-weight: 900;
    color: white;
    margin-bottom: 1.5rem;
    line-height: 1.1;
}

.gradient-text {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.5rem;
    color: rgba(255,255,255,0.95);
    margin-bottom: 1rem;
    font-weight: 600;
}

.hero-description {
    font-size: 1.125rem;
    color: rgba(255,255,255,0.85);
    max-width: 800px;
    margin: 0 auto 2.5rem;
    line-height: 1.8;
}

.btn-hero-primary {
    background: white;
    color: var(--primary);
    border: none;
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.btn-hero-primary:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in { animation: fadeIn 0.8s ease-out; }
.animate-fade-in-delay { animation: fadeIn 0.8s ease-out 0.2s backwards; }
.animate-fade-in-delay-2 { animation: fadeIn 0.8s ease-out 0.4s backwards; }
.animate-fade-in-delay-3 { animation: fadeIn 0.8s ease-out 0.6s backwards; }

/* Features Section */
.features-showcase {
    background: white;
    padding: 6rem 2rem;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
}

.section-title {
    font-size: 3rem;
    font-weight: 800;
    text-align: center;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.section-subtitle {
    font-size: 1.25rem;
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: 4rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    border: 2px solid var(--border);
    transition: var(--transition);
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
}

.feature-icon {
    width: 70px;
    height: 70px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: white;
}

.feature-icon.blue { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.feature-icon.green { background: linear-gradient(135deg, #10B981, #059669); }
.feature-icon.purple { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }
.feature-icon.orange { background: linear-gradient(135deg, #F59E0B, #D97706); }
.feature-icon.red { background: linear-gradient(135deg, #EF4444, #DC2626); }
.feature-icon.cyan { background: linear-gradient(135deg, #06B6D4, #0891B2); }
.feature-icon.pink { background: linear-gradient(135deg, #EC4899, #DB2777); }
.feature-icon.yellow { background: linear-gradient(135deg, #EAB308, #CA8A04); }
.feature-icon.indigo { background: linear-gradient(135deg, #6366F1, #4F46E5); }
.feature-icon.teal { background: linear-gradient(135deg, #14B8A6, #0D9488); }
.feature-icon.lime { background: linear-gradient(135deg, #84CC16, #65A30D); }
.feature-icon.amber { background: linear-gradient(135deg, #F59E0B, #D97706); }

.feature-card h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.feature-card ul {
    list-style: none;
    color: var(--text-secondary);
}

.feature-card li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
}

.feature-card li:before {
    content: "✓";
    position: absolute;
    left: 0;
    color: var(--success);
    font-weight: bold;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up { animation: slideUp 0.6s ease-out; }
.animate-slide-up.delay-1 { animation-delay: 0.1s; animation-fill-mode: backwards; }
.animate-slide-up.delay-2 { animation-delay: 0.2s; animation-fill-mode: backwards; }
.animate-slide-up.delay-3 { animation-delay: 0.3s; animation-fill-mode: backwards; }
.animate-slide-up.delay-4 { animation-delay: 0.4s; animation-fill-mode: backwards; }
.animate-slide-up.delay-5 { animation-delay: 0.5s; animation-fill-mode: backwards; }
.animate-slide-up.delay-6 { animation-delay: 0.6s; animation-fill-mode: backwards; }
.animate-slide-up.delay-7 { animation-delay: 0.7s; animation-fill-mode: backwards; }
.animate-slide-up.delay-8 { animation-delay: 0.8s; animation-fill-mode: backwards; }
.animate-slide-up.delay-9 { animation-delay: 0.9s; animation-fill-mode: backwards; }
.animate-slide-up.delay-10 { animation-delay: 1.0s; animation-fill-mode: backwards; }
.animate-slide-up.delay-11 { animation-delay: 1.1s; animation-fill-mode: backwards; }

/* ========== LOGIN PAGE ========== */
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
}

.login-particles {
    width: 100%;
    height: 100%;
    background-image: 
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: particleFloat 20s linear infinite;
}

@keyframes particleFloat {
    from { background-position: 0 0; }
    to { background-position: 50px 50px; }
}

.login-container {
    max-width: 500px;
    width: 100%;
    padding: 2rem;
    position: relative;
    z-index: 1;
}

.btn-back-landing {
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    margin-bottom: 2rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    transition: var(--transition);
}

.btn-back-landing:hover {
    background: rgba(255,255,255,0.3);
    transform: translateX(-5px);
}

.login-card {
    background: white;
    border-radius: 1.5rem;
    padding: 3rem;
    box-shadow: var(--shadow-xl);
    animation: fadeIn 0.5s ease-out;
}

.login-header {
    text-align: center;
    margin-bottom: 2.5rem;
}

.login-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: white;
    font-size: 2.5rem;
}

.login-header h2 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.login-header p {
    color: var(--text-secondary);
    font-size: 1rem;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-group label {
    font-weight: 600;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.input-group input {
    padding: 1rem;
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: var(--transition);
    font-family: inherit;
}

.input-group input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-login-submit {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: white;
    border: none;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 700;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.btn-login-submit:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.login-divider {
    text-align: center;
    color: var(--text-muted);
    margin: 1.5rem 0;
    position: relative;
}

.login-divider:before,
.login-divider:after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: var(--border);
}

.login-divider:before { left: 0; }
.login-divider:after { right: 0; }

.quick-login-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.quick-login-btn {
    padding: 1rem;
    border: 2px solid var(--border);
    background: white;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--text-secondary);
}

.quick-login-btn i {
    font-size: 1.5rem;
    color: var(--primary);
}

.quick-login-btn:hover {
    border-color: var(--primary);
    background: var(--bg-hover);
    transform: translateY(-2px);
}

/* ========== DASHBOARD ========== */
.dashboard {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.top-navbar {
    background: white;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 2rem;
    gap: 2rem;
    height: 70px;
    position: sticky;
    top: 0;
    z-index: 999;
    box-shadow: var(--shadow-sm);
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--primary);
    min-width: 200px;
}

.navbar-brand i { font-size: 1.75rem; }

.navbar-menu {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.nav-item {
    position: relative;
    padding: 1rem 1.25rem;
    cursor: pointer;
    transition: var(--transition);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-primary);
    font-weight: 500;
}

.nav-item:hover {
    background: var(--bg-hover);
    color: var(--primary);
}

.nav-item i { font-size: 1.125rem; }

.dropdown {
    position: relative;
}

.dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    box-shadow: var(--shadow-lg);
    min-width: 250px;
    padding: 0.5rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: var(--transition);
    z-index: 1000;
}

.dropdown:hover .dropdown-content {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-content a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-primary);
    text-decoration: none;
    border-radius: 0.5rem;
    transition: var(--transition);
}

.dropdown-content a:hover {
    background: var(--bg-hover);
    color: var(--primary);
}

.notification-badge {
    background: var(--danger);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    min-width: 20px;
    text-align: center;
}

.navbar-user {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
}

.user-info {
    text-align: right;
}

.user-info span {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
}

.user-info small {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.user-avatar {
    width: 45px;
    height: 45px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: var(--transition);
}

.user-avatar:hover {
    transform: scale(1.1);
}

.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    box-shadow: var(--shadow-lg);
    min-width: 200px;
    padding: 0.5rem;
    margin-top: 0.5rem;
}

.user-dropdown a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-primary);
    text-decoration: none;
    border-radius: 0.5rem;
    transition: var(--transition);
}

.user-dropdown a:hover {
    background: var(--bg-hover);
}

/* ========== MAIN CONTENT ========== */
.main-content {
    flex: 1;
    padding: 2.5rem;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
}

.content-section {
    display: none;
    animation: fadeIn 0.3s ease-out;
}

.content-section.active {
    display: block;
}

.page-header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-header h1 {
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.page-header p {
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

/* Stats Cards */
.stats-grid-4 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    border: 1px solid var(--border);
    transition: var(--transition);
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
}

.stat-card.bg-blue { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; border: none; }
.stat-card.bg-green { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; }
.stat-card.bg-purple { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; border: none; }
.stat-card.bg-orange { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; border: none; }

.stat-icon {
    width: 60px;
    height: 60px;
    background: rgba(255,255,255,0.2);
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
}

.stat-details h3 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
}

.stat-details p {
    font-size: 1rem;
    opacity: 0.95;
}

.stat-change {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    opacity: 0.9;
}

/* Dashboard Layout */
.dashboard-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
}

.dashboard-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.dashboard-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.card {
    background: white;
    border-radius: 1rem;
    border: 1px solid var(--border);
    overflow: hidden;
}

.card-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

/* Houses Grid */
.houses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
}

.house-card {
    padding: 1.5rem;
    border-radius: 0.75rem;
    text-align: center;
    color: white;
    transition: var(--transition);
    cursor: pointer;
}

.house-card:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: var(--shadow-lg);
}

.house-card.bride { background: linear-gradient(135deg, #EF4444, #DC2626); }
.house-card.ide { background: linear-gradient(135deg, #3B82F6, #2563EB); }
.house-card.tola { background: linear-gradient(135deg, #10B981, #059669); }
.house-card.seanan { background: linear-gradient(135deg, #F59E0B, #D97706); }
.house-card.padraig { background: linear-gradient(135deg, #8B5CF6, #7C3AED); }
.house-card.conaire { background: linear-gradient(135deg, #EC4899, #DB2777); }

.house-card h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.house-card p {
    font-size: 2rem;
    font-weight: 800;
}

/* Tabs */
.tabs-container {
    margin-bottom: 2rem;
}

.tabs {
    display: flex;
    gap: 0.5rem;
    border-bottom: 2px solid var(--border);
    overflow-x: auto;
}

.tab {
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    color: var(--text-secondary);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
}

.tab:hover {
    color: var(--primary);
    background: var(--bg-hover);
}

.tab.active {
    color: var(--primary);
    border-bottom-color: var(--primary);
}

.tab-content {
    display: none;
    animation: fadeIn 0.3s ease-out;
}

.tab-content.active {
    display: block;
}

/* Content Card */
.content-card {
    background: white;
    border-radius: 1rem;
    border: 1px solid var(--border);
    padding: 2rem;
}

.card-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.search-bar {
    flex: 1;
    min-width: 300px;
    position: relative;
    display: flex;
    align-items: center;
}

.search-bar i {
    position: absolute;
    left: 1rem;
    color: var(--text-muted);
}

.search-bar input {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: var(--transition);
}

.search-bar input:focus {
    outline: none;
    border-color: var(--primary);
}

.toolbar-filters {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.select-input {
    padding: 0.875rem 1rem;
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    transition: var(--transition);
}

.select-input:focus {
    outline: none;
    border-color: var(--primary);
}

/* Buttons */
.btn-primary, .btn-success, .btn-warning, .btn-danger {
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
}

.btn-primary {
    background: var(--primary);
    color: white;
}

.btn-success {
    background: var(--success);
    color: white;
}

.btn-warning {
    background: var(--warning);
    color: white;
}

.btn-danger {
    background: var(--danger);
    color: white;
}

.btn-primary:hover, .btn-success:hover, .btn-warning:hover, .btn-danger:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

/* Data Table */
.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: var(--bg-hover);
}

.data-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 700;
    color: var(--text-primary);
    border-bottom: 2px solid var(--border);
}

.data-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--border);
}

.data-table tbody tr {
    transition: var(--transition);
}

.data-table tbody tr:hover {
    background: var(--bg-hover);
}

.badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    display: inline-block;
}

.badge.success { background: #D1FAE5; color: #065F46; }
.badge.warning { background: #FEF3C7; color: #92400E; }
.badge.danger { background: #FEE2E2; color: #991B1B; }
.badge.info { background: #DBEAFE; color: #1E40AF; }

/* Responsive */
@media (max-width: 1200px) {
    .dashboard-layout {
        grid-template-columns: 1fr;
    }
    
    .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}

@media (max-width: 768px) {
    .navbar-menu {
        display: none;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .stats-grid-4 {
        grid-template-columns: 1fr;
    }
    
    .main-content {
        padding: 1rem;
    }
}
CSSEOF

echo "✅ CSS created ($(wc -l < styles.css) lines)"
