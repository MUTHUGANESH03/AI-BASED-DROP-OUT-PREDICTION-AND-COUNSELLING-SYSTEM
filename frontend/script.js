// Enhanced JavaScript for AI Dropout Prediction System

// Global Variables
let currentPage = 'home';
let currentUser = null;
let studentsData = [];
let currentStudentPage = 1;
let studentsPerPage = 10;
let filteredStudents = [];
let notifications = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    loadMockData();
    updateLiveStatistics();
    setupNotifications();
    // start small robot micro-animations (if login page contains the robot)
    try { startRobotAnimations(); } catch (e) { /* ignore if function missing */ }
});

// Initialize Application
function initializeApp() {
    showPage('home');
    setupCharts();
    setupProgressTracking();
    setupFileUpload();
}

// Setup Event Listeners
function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Student login/register toggle
    const toggleLink = document.getElementById('toggle-link');
    if (toggleLink) {
        toggleLink.addEventListener('click', toggleStudentForm);
    }

    // Form submissions
    setupFormHandlers();

    // Notification bell
    const notificationBell = document.getElementById('notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', toggleNotifications);
    }

    // Close modals when clicking outside
    window.addEventListener('click', function (event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal();
                closeStudentProfile();
            }
        });
    });

    // Search functionality
    const studentSearch = document.getElementById('student-search');
    if (studentSearch) {
        studentSearch.addEventListener('input', debounce(searchStudents, 300));
    }

    // Sort functionality
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', sortStudents);
    }

    // Progress tracking for form
    const formInputs = document.querySelectorAll('#data-input-form input, #data-input-form select');
    formInputs.forEach(input => {
        input.addEventListener('input', updateFormProgress);
    });
}

// Setup Form Handlers
function setupFormHandlers() {
    // Student login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleStudentLogin);
    }

    // Student register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleStudentRegister);
    }

    // Data input form
    const dataInputForm = document.getElementById('data-input-form');
    if (dataInputForm) {
        dataInputForm.addEventListener('submit', handleDataInput);
    }

    // Counselor login form
    const counselorForm = document.getElementById('counselor-form');
    if (counselorForm) {
        counselorForm.addEventListener('submit', handleCounselorLogin);
    }
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageId;

        // Initialize page-specific functionality
        initializePage(pageId);
    }

    // run page-specific entrance animations
    runPageAnimations(pageId);

    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
}

// Initialize Page-Specific Functionality
function initializePage(pageId) {
    switch (pageId) {
        case 'analytics':
            initializeAnalytics();
            break;
        case 'counselor-dashboard':
            initializeCounselorDashboard();
            break;
        case 'student-dashboard':
            initializeStudentDashboard();
            break;
    }
}

function runPageAnimations(pageId) {
    if (pageId === 'home') {
        // add show-up to feature cards and animate stat counters
        const cards = document.querySelectorAll('#home .card, #home .feature-block, #home .stat-card');
        cards.forEach((c, i) => setTimeout(() => c.classList.add('show-up'), 100 * i));

        // Animate each stat value with a slight stagger
        const statCards = document.querySelectorAll('#home .stat-card');
        statCards.forEach((card, idx) => {
            setTimeout(() => {
                const valEl = card.querySelector('.stat-value');
                if (valEl) {
                    // ensure original target is stored (strip formatting)
                    const raw = valEl.getAttribute('data-target') || valEl.textContent;
                    valEl.setAttribute('data-target', raw.trim());
                    const duration = 900 + idx * 120;
                    animateCount(valEl, duration);
                }
            }, 140 * idx);
        });
    }

    if (pageId === 'about') {
        const features = document.querySelectorAll('.about-features .about-feature');
        features.forEach((f, i) => setTimeout(() => f.classList.add('show'), 160 * i));
    }

    // robot dance on student login
    if (pageId === 'student-login') {
        const robot = document.querySelector('.robot-illustration');
        if (robot) robot.classList.add('robot-dance');
    } else {
        const robot = document.querySelector('.robot-illustration.robot-dance');
        if (robot) robot.classList.remove('robot-dance');
    }
}

// Student Form Toggle
function toggleStudentForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const title = document.getElementById('student-form-title');
    const toggleText = document.getElementById('toggle-text');
    const toggleLink = document.getElementById('toggle-link');

    if (loginForm.classList.contains('hidden')) {
        // Show login form
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        title.textContent = 'Student Login';
        toggleText.textContent = "Don't have an account? ";
        toggleLink.textContent = 'Register here';
    } else {
        // Show register form
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        title.textContent = 'Student Registration';
        toggleText.textContent = 'Already have an account? ';
        toggleLink.textContent = 'Login here';
    }
}

// Enhanced Form Handlers
function handleStudentLogin(e) {
    e.preventDefault();
    const rollNo = document.getElementById('student-id').value;
    const password = document.getElementById('student-password').value;

    // Simulate login validation
    if (rollNo && password) {
        currentUser = {
            type: 'student',
            rollNo: rollNo,
            name: 'John Doe',
            department: 'Computer Science'
        };

        showMessage('Login Successful!', 'Welcome back, ' + currentUser.name, 'success');
        setTimeout(() => {
            showPage('student-dashboard');
        }, 1500);
    } else {
        showMessage('Login Failed', 'Please enter valid credentials', 'error');
    }
}

function handleStudentRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const rollNo = document.getElementById('reg-rollno').value;
    const dept = document.getElementById('reg-dept').value;
    const password = document.getElementById('reg-password').value;

    if (name && rollNo && dept && password) {
        showMessage('Registration Successful!', 'Account created successfully. You can now login.', 'success');
        setTimeout(() => {
            toggleStudentForm();
        }, 1500);
    } else {
        showMessage('Registration Failed', 'Please fill all required fields', 'error');
    }
}

function handleCounselorLogin(e) {
    e.preventDefault();
    const counselorId = document.getElementById('counselor-id').value;
    const password = document.getElementById('counselor-password').value;

    if (counselorId && password) {
        currentUser = {
            type: 'counselor',
            id: counselorId,
            name: 'Dr. Sarah Johnson',
            department: 'Student Counseling'
        };

        showMessage('Login Successful!', 'Welcome, ' + currentUser.name, 'success');
        setTimeout(() => {
            showPage('counselor-dashboard');
        }, 1500);
    } else {
        showMessage('Login Failed', 'Please enter valid credentials', 'error');
    }
}

// Enhanced Data Input Handler
function handleDataInput(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submit-text');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Analyzing...';
    loadingSpinner.classList.remove('hidden');

    // Collect form data
    const formData = {
        attendance: parseFloat(document.getElementById('attendance-input').value),
        testScores: parseFloat(document.getElementById('test-scores-input').value),
        backlogs: parseInt(document.getElementById('backlogs-input').value),
        gpa: parseFloat(document.getElementById('gpa-input').value),
        feeStatus: document.getElementById('fee-status-input').value,
        scholarship: document.getElementById('scholarship-input').value,
        familyIncome: document.getElementById('family-income').value,
        distanceHome: parseFloat(document.getElementById('distance-home').value),
        partTimeJob: document.getElementById('part-time-job').value,
        extracurricular: document.getElementById('extracurricular').value,
        mentalHealth: document.getElementById('mental-health').value,
        stressLevel: parseInt(document.getElementById('stress-level').value)
    };

    // Simulate AI processing
    setTimeout(() => {
        const riskScore = calculateEnhancedRiskScore(formData);
        displayEnhancedResults(riskScore, formData);

        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Predict My Risk';
        loadingSpinner.classList.add('hidden');

        // Navigate to dashboard
        setTimeout(() => {
            showPage('student-dashboard');
        }, 1000);
    }, 3000);
}

// Enhanced Risk Calculation
function calculateEnhancedRiskScore(data) {
    let riskScore = 0;
    const factors = [];

    // Attendance (25% weight)
    if (data.attendance < 60) {
        riskScore += 25;
        factors.push({ name: 'Very Low Attendance', impact: 25, severity: 'high' });
    } else if (data.attendance < 75) {
        riskScore += 15;
        factors.push({ name: 'Low Attendance', impact: 15, severity: 'medium' });
    } else if (data.attendance < 85) {
        riskScore += 8;
        factors.push({ name: 'Below Average Attendance', impact: 8, severity: 'low' });
    }

    // Academic Performance (20% weight)
    if (data.testScores < 40) {
        riskScore += 20;
        factors.push({ name: 'Poor Academic Performance', impact: 20, severity: 'high' });
    } else if (data.testScores < 60) {
        riskScore += 12;
        factors.push({ name: 'Below Average Grades', impact: 12, severity: 'medium' });
    }

    // GPA (15% weight)
    if (data.gpa < 2.0) {
        riskScore += 15;
        factors.push({ name: 'Very Low GPA', impact: 15, severity: 'high' });
    } else if (data.gpa < 3.0) {
        riskScore += 8;
        factors.push({ name: 'Low GPA', impact: 8, severity: 'medium' });
    }

    // Backlogs (15% weight)
    if (data.backlogs > 5) {
        riskScore += 15;
        factors.push({ name: 'Multiple Backlogs', impact: 15, severity: 'high' });
    } else if (data.backlogs > 2) {
        riskScore += 8;
        factors.push({ name: 'Some Backlogs', impact: 8, severity: 'medium' });
    }

    // Financial Factors (10% weight)
    if (data.feeStatus === 'overdue') {
        riskScore += 10;
        factors.push({ name: 'Fee Payment Issues', impact: 10, severity: 'medium' });
    } else if (data.feeStatus === 'pending') {
        riskScore += 5;
        factors.push({ name: 'Pending Fee Payment', impact: 5, severity: 'low' });
    }

    // Family Income (5% weight)
    if (data.familyIncome === 'low') {
        riskScore += 5;
        factors.push({ name: 'Financial Constraints', impact: 5, severity: 'low' });
    }

    // Mental Health (10% weight)
    if (data.mentalHealth === 'poor') {
        riskScore += 10;
        factors.push({ name: 'Mental Health Concerns', impact: 10, severity: 'high' });
    } else if (data.mentalHealth === 'fair') {
        riskScore += 5;
        factors.push({ name: 'Mental Health Issues', impact: 5, severity: 'medium' });
    }

    // Stress Level (5% weight)
    if (data.stressLevel > 8) {
        riskScore += 5;
        factors.push({ name: 'High Stress Level', impact: 5, severity: 'medium' });
    }

    // Protective Factors
    if (data.scholarship !== 'none') {
        riskScore -= 5;
        factors.push({ name: 'Scholarship Support', impact: -5, severity: 'protective' });
    }

    if (data.extracurricular === 'high' || data.extracurricular === 'medium') {
        riskScore -= 3;
        factors.push({ name: 'Active in Extracurriculars', impact: -3, severity: 'protective' });
    }

    return {
        score: Math.max(0, Math.min(100, riskScore)),
        factors: factors,
        recommendations: generateRecommendations(factors, data)
    };
}

// Generate Personalized Recommendations
function generateRecommendations(factors, data) {
    const recommendations = [];

    factors.forEach(factor => {
        switch (factor.name) {
            case 'Very Low Attendance':
            case 'Low Attendance':
                recommendations.push({
                    priority: 'high',
                    action: 'Improve Attendance',
                    description: 'Attend all classes regularly. Aim for at least 85% attendance.',
                    icon: '📅'
                });
                break;
            case 'Poor Academic Performance':
            case 'Below Average Grades':
                recommendations.push({
                    priority: 'high',
                    action: 'Academic Support',
                    description: 'Join study groups, seek tutoring, and meet with professors during office hours.',
                    icon: '📚'
                });
                break;
            case 'Mental Health Concerns':
                recommendations.push({
                    priority: 'high',
                    action: 'Mental Health Support',
                    description: 'Schedule a session with the campus counseling center.',
                    icon: '🧠'
                });
                break;
            case 'Fee Payment Issues':
                recommendations.push({
                    priority: 'medium',
                    action: 'Financial Planning',
                    description: 'Meet with financial aid office to discuss payment options.',
                    icon: '💰'
                });
                break;
        }
    });

    // Add general recommendations
    recommendations.push({
        priority: 'medium',
        action: 'Time Management',
        description: 'Create a structured study schedule and stick to it.',
        icon: '⏰'
    });

    recommendations.push({
        priority: 'low',
        action: 'Peer Support',
        description: 'Connect with classmates and form study partnerships.',
        icon: '👥'
    });

    return recommendations;
}

// Display Enhanced Results
function displayEnhancedResults(result, data) {
    const riskStatus = document.getElementById('risk-status');
    const riskPercentage = document.getElementById('risk-percentage');

    if (riskStatus && riskPercentage) {
        riskPercentage.textContent = result.score + '%';

        let statusText, statusClass;
        if (result.score > 70) {
            statusText = 'High Risk';
            statusClass = 'bg-red-500';
        } else if (result.score > 40) {
            statusText = 'Medium Risk';
            statusClass = 'bg-yellow-500';
        } else {
            statusText = 'Low Risk';
            statusClass = 'bg-green-500';
        }

        riskStatus.textContent = statusText;
        riskStatus.className = `text-2xl font-bold text-white px-6 py-2 rounded-full ${statusClass}`;
    }

    // Update risk factors list
    updateRiskFactorsList(result.factors);

    // Update recommendations
    updateRecommendationsList(result.recommendations);

    // Update progress tracking
    updateProgressTracking(data);

    // Update risk chart
    updateRiskChart(result.factors);
}

// Update Risk Factors List
function updateRiskFactorsList(factors) {
    const factorsList = document.getElementById('risk-factors-list');
    if (!factorsList) return;

    factorsList.innerHTML = '';

    factors.forEach(factor => {
        const factorElement = document.createElement('div');
        factorElement.className = `flex items-center justify-between p-2 rounded ${factor.severity === 'high' ? 'bg-red-50 border-l-4 border-red-500' :
                factor.severity === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                    factor.severity === 'protective' ? 'bg-green-50 border-l-4 border-green-500' :
                        'bg-gray-50 border-l-4 border-gray-500'
            }`;

        factorElement.innerHTML = `
            <span class="text-sm font-medium ${factor.severity === 'high' ? 'text-red-800' :
                factor.severity === 'medium' ? 'text-yellow-800' :
                    factor.severity === 'protective' ? 'text-green-800' :
                        'text-gray-800'
            }">${factor.name}</span>
            <span class="text-xs ${factor.impact > 0 ? 'text-red-600' : 'text-green-600'
            }">${factor.impact > 0 ? '+' : ''}${factor.impact}%</span>
        `;

        factorsList.appendChild(factorElement);
    });
}

// Update Recommendations List
function updateRecommendationsList(recommendations) {
    const recommendationsList = document.getElementById('recommendations-list');
    if (!recommendationsList) return;

    recommendationsList.innerHTML = '';

    recommendations.forEach(rec => {
        const recElement = document.createElement('div');
        recElement.className = `flex items-start space-x-3 p-3 rounded-lg ${rec.priority === 'high' ? 'bg-red-50 border border-red-200' :
                rec.priority === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-blue-50 border border-blue-200'
            }`;

        recElement.innerHTML = `
            <div class="text-2xl">${rec.icon}</div>
            <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                    <h4 class="font-semibold text-gray-800">${rec.action}</h4>
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
            }">${rec.priority}</span>
                </div>
                <p class="text-sm text-gray-600">${rec.description}</p>
            </div>
        `;

        recommendationsList.appendChild(recElement);
    });
}

// Update Progress Tracking
function updateProgressTracking(data) {
    // Attendance progress
    const attendanceProgress = Math.min(100, (data.attendance / 85) * 100);
    updateProgressBar('attendance-progress', 'attendance-bar', attendanceProgress);

    // Grade progress
    const gradeProgress = Math.min(100, (data.testScores / 80) * 100);
    updateProgressBar('grade-progress', 'grade-bar', gradeProgress);

    // Overall progress
    const overallProgress = (attendanceProgress + gradeProgress) / 2;
    updateProgressBar('overall-progress', 'overall-bar', overallProgress);
}

// Update Progress Bar
function updateProgressBar(textId, barId, percentage) {
    const textElement = document.getElementById(textId);
    const barElement = document.getElementById(barId);

    if (textElement && barElement) {
        textElement.textContent = Math.round(percentage) + '%';
        barElement.style.width = percentage + '%';
    }
}

// Update Form Progress
function updateFormProgress() {
    const form = document.getElementById('data-input-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input[required], select[required]');
    let filledInputs = 0;

    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            filledInputs++;
        }
    });

    const progress = (filledInputs / inputs.length) * 100;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (progressBar && progressText) {
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }
}

// Update Stress Level Display
function updateStressValue(value) {
    const stressValue = document.getElementById('stress-value');
    if (stressValue) {
        stressValue.textContent = value;
    }
}

// Setup Charts
function setupCharts() {
    // Risk Chart for Student Dashboard
    const riskChartCanvas = document.getElementById('riskChart');
    if (riskChartCanvas) {
        const ctx = riskChartCanvas.getContext('2d');
        window.riskChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Academic', 'Attendance', 'Financial', 'Personal', 'Protective'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#ef4444',
                        '#f97316',
                        '#eab308',
                        '#8b5cf6',
                        '#10b981'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
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

    // Counselor Risk Chart
    const counselorRiskChartCanvas = document.getElementById('counselorRiskChart');
    if (counselorRiskChartCanvas) {
        const ctx = counselorRiskChartCanvas.getContext('2d');
        window.counselorRiskChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    label: 'Number of Students',
                    data: [150, 450, 900],
                    backgroundColor: [
                        '#ef4444',
                        '#eab308',
                        '#10b981'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Update Risk Chart
function updateRiskChart(factors) {
    if (!window.riskChart) return;

    const categories = {
        'Academic': 0,
        'Attendance': 0,
        'Financial': 0,
        'Personal': 0,
        'Protective': 0
    };

    factors.forEach(factor => {
        if (factor.name.includes('Academic') || factor.name.includes('GPA') || factor.name.includes('Grade')) {
            categories['Academic'] += Math.abs(factor.impact);
        } else if (factor.name.includes('Attendance')) {
            categories['Attendance'] += Math.abs(factor.impact);
        } else if (factor.name.includes('Fee') || factor.name.includes('Financial')) {
            categories['Financial'] += Math.abs(factor.impact);
        } else if (factor.severity === 'protective') {
            categories['Protective'] += Math.abs(factor.impact);
        } else {
            categories['Personal'] += Math.abs(factor.impact);
        }
    });

    window.riskChart.data.datasets[0].data = Object.values(categories);
    window.riskChart.update();
}

// Initialize Analytics Page
function initializeAnalytics() {
    setupAnalyticsCharts();
    updateAnalyticsData();
}

// Setup Analytics Charts
function setupAnalyticsCharts() {
    // Trend Chart
    const trendChartCanvas = document.getElementById('trendChart');
    if (trendChartCanvas) {
        const ctx = trendChartCanvas.getContext('2d');
        window.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'High Risk Students',
                    data: [180, 165, 155, 145, 140, 135],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Medium Risk Students',
                    data: [320, 310, 305, 295, 290, 285],
                    borderColor: '#eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Department Chart
    const departmentChartCanvas = document.getElementById('departmentChart');
    if (departmentChartCanvas) {
        const ctx = departmentChartCanvas.getContext('2d');
        window.departmentChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Computer Science', 'Electrical Eng.', 'Mechanical Eng.', 'Civil Eng.', 'Information Tech.'],
                datasets: [{
                    label: 'Risk Percentage',
                    data: [15, 12, 18, 14, 16],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 25
                    }
                }
            }
        });
    }

    // Intervention Chart
    const interventionChartCanvas = document.getElementById('interventionChart');
    if (interventionChartCanvas) {
        const ctx = interventionChartCanvas.getContext('2d');
        window.interventionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Counseling', 'Academic Support', 'Financial Aid', 'Mental Health', 'Peer Support'],
                datasets: [{
                    label: 'Success Rate (%)',
                    data: [85, 78, 92, 88, 75],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#8b5cf6',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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

    // Accuracy Chart
    const accuracyChartCanvas = document.getElementById('accuracyChart');
    if (accuracyChartCanvas) {
        const ctx = accuracyChartCanvas.getContext('2d');
        window.accuracyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Prediction Accuracy (%)',
                    data: [82, 85, 87, 89],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 75,
                        max: 95
                    }
                }
            }
        });
    }
}

// Initialize Counselor Dashboard
function initializeCounselorDashboard() {
    loadStudentsData();
    updateCounselorStatistics();
    renderStudentsTable();
}

// Add Student Modal Controls
function openAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if (modal) modal.classList.add('show');
}

function closeAddStudentModal() {
    const modal = document.getElementById('addStudentModal');
    if (modal) modal.classList.remove('show');
}

// Hook add student form after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.getElementById('add-student-form');
    if (addForm) {
        addForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('add-name').value.trim();
            const roll = document.getElementById('add-roll').value.trim();
            const dept = document.getElementById('add-dept').value;
            const semester = parseInt(document.getElementById('add-semester').value) || 1;
            const email = document.getElementById('add-email').value.trim();
            const phone = document.getElementById('add-phone').value.trim();
            const gpa = parseFloat(document.getElementById('add-gpa').value) || 0;

            if (!name || !roll) {
                showMessage('Validation', 'Please enter at least Name and Roll No', 'error');
                return;
            }

            // construct a simple student object compatible with studentsData used elsewhere
            const newStudent = {
                id: Date.now(),
                name: name,
                rollNo: roll,
                department: dept,
                semester: semester,
                riskLevel: 'unknown',
                riskScore: 0,
                factors: [],
                lastContact: new Date().toISOString().split('T')[0],
                email: email,
                phone: phone,
                gpa: gpa,
                attendance: 0
            };

            // add to data arrays and re-render
            studentsData.unshift(newStudent);
            filteredStudents = [...studentsData];
            currentStudentPage = 1;
            renderStudentsTable();

            showMessage('Student Added', `${name} (${roll}) added successfully`, 'success');
            closeAddStudentModal();
            addForm.reset();
        });
    }
});

// Load Mock Students Data
function loadStudentsData() {
    studentsData = [
        {
            id: 1,
            name: 'Ganesh',
            rollNo: '101ME',
            department: 'Computer Science',
            semester: 3,
            riskLevel: 'high',
            riskScore: 78,
            factors: ['Low Attendance', 'Poor Grades', 'Financial Issues'],
            lastContact: '2024-01-15',
            email: 'john.doe@university.edu',
            phone: '+1234567890',
            gpa: 2.1,
            attendance: 65
        },
        {
            id: 2,
            name: 'Chanthrika',
            rollNo: '205CS',
            department: 'Computer Science',
            semester: 4,
            riskLevel: 'medium',
            riskScore: 45,
            factors: ['Stress', 'Part-time Job'],
            lastContact: '2024-01-12',
            email: 'jane.smith@university.edu',
            phone: '+1234567891',
            gpa: 3.2,
            attendance: 78
        },
        {
            id: 3,
            name: 'Shirivanth',
            rollNo: '301EE',
            department: 'Electrical Engineering',
            semester: 6,
            riskLevel: 'low',
            riskScore: 25,
            factors: [],
            lastContact: '2024-01-10',
            email: 'bob.johnson@university.edu',
            phone: '+1234567892',
            gpa: 3.8,
            attendance: 92
        },
        {
            id: 4,
            name: 'Shanjana',
            rollNo: '102CE',
            department: 'Civil Engineering',
            semester: 2,
            riskLevel: 'high',
            riskScore: 82,
            factors: ['Very Low Attendance', 'Multiple Backlogs', 'Mental Health'],
            lastContact: '2024-01-14',
            email: 'alice.brown@university.edu',
            phone: '+1234567893',
            gpa: 1.8,
            attendance: 45
        },
        {
            id: 5,
            name: 'Charlie Wilson',
            rollNo: '403IT',
            department: 'Information Technology',
            semester: 8,
            riskLevel: 'medium',
            riskScore: 55,
            factors: ['Job Pressure', 'Final Year Stress'],
            lastContact: '2024-01-11',
            email: 'charlie.wilson@university.edu',
            phone: '+1234567894',
            gpa: 2.9,
            attendance: 72
        }
    ];

    filteredStudents = [...studentsData];
}

// Render Students Table
function renderStudentsTable() {
    const tableBody = document.getElementById('students-table-body');
    if (!tableBody) return;

    const startIndex = (currentStudentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const studentsToShow = filteredStudents.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    studentsToShow.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors duration-200';

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="text-blue-600 font-medium text-sm">${student.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${student.name}</div>
                        <div class="text-sm text-gray-500">${student.rollNo} • ${student.department}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                student.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
            }">
                    ${student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)} (${student.riskScore}%)
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                    ${student.factors.slice(0, 2).map(factor =>
                `<span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">${factor}</span>`
            ).join('')}
                    ${student.factors.length > 2 ? `<span class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">+${student.factors.length - 2} more</span>` : ''}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(student.lastContact)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewStudentProfile(${student.id})" class="text-blue-600 hover:text-blue-900 mr-3">View Profile</button>
                <button onclick="contactStudent(${student.id})" class="text-green-600 hover:text-green-900">Contact</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    updatePagination();
}

// Update Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const startIndex = (currentStudentPage - 1) * studentsPerPage + 1;
    const endIndex = Math.min(currentStudentPage * studentsPerPage, filteredStudents.length);

    // Update showing text
    document.getElementById('showing-start').textContent = startIndex;
    document.getElementById('showing-end').textContent = endIndex;
    document.getElementById('total-students').textContent = filteredStudents.length;

    // Update page numbers
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = `px-3 py-2 border rounded-lg ${i === currentStudentPage ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
            }`;
        pageButton.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageButton);
    }

    // Update prev/next buttons
    document.getElementById('prev-page').disabled = currentStudentPage === 1;
    document.getElementById('next-page').disabled = currentStudentPage === totalPages;
}

// Page Navigation
function changePage(direction) {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const newPage = currentStudentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentStudentPage = newPage;
        renderStudentsTable();
    }
}

function goToPage(page) {
    currentStudentPage = page;
    renderStudentsTable();
}

// Search Students
function searchStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();

    filteredStudents = studentsData.filter(student =>
        student.name.toLowerCase().includes(searchTerm) ||
        student.rollNo.toLowerCase().includes(searchTerm) ||
        student.department.toLowerCase().includes(searchTerm)
    );

    currentStudentPage = 1;
    renderStudentsTable();
}

// Sort Students
function sortStudents() {
    const sortBy = document.getElementById('sort-by').value;

    filteredStudents.sort((a, b) => {
        switch (sortBy) {
            case 'risk-desc':
                return b.riskScore - a.riskScore;
            case 'risk-asc':
                return a.riskScore - b.riskScore;
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });

    currentStudentPage = 1;
    renderStudentsTable();
}

// Apply Filters
function applyFilters() {
    const deptFilter = document.getElementById('dept-filter').value;
    const riskFilter = document.getElementById('risk-filter').value;
    const semesterFilter = document.getElementById('semester-filter').value;

    filteredStudents = studentsData.filter(student => {
        let matches = true;

        if (deptFilter !== 'all') {
            const deptMap = {
                'cs': 'Computer Science',
                'ee': 'Electrical Engineering',
                'me': 'Mechanical Engineering',
                'ce': 'Civil Engineering',
                'it': 'Information Technology'
            };
            matches = matches && student.department === deptMap[deptFilter];
        }

        if (riskFilter !== 'all') {
            matches = matches && student.riskLevel === riskFilter;
        }

        if (semesterFilter !== 'all') {
            matches = matches && student.semester === parseInt(semesterFilter);
        }

        return matches;
    });

    currentStudentPage = 1;
    renderStudentsTable();
}

// Reset Filters
function resetFilters() {
    document.getElementById('dept-filter').value = 'all';
    document.getElementById('risk-filter').value = 'all';
    document.getElementById('semester-filter').value = 'all';
    document.getElementById('student-search').value = '';

    filteredStudents = [...studentsData];
    currentStudentPage = 1;
    renderStudentsTable();
}

// View Student Profile
function viewStudentProfile(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    const modal = document.getElementById('studentProfileModal');
    const content = document.getElementById('student-profile-content');

    content.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">Basic Information</h4>
                    <div class="space-y-2 text-sm">
                        <div><span class="font-medium">Name:</span> ${student.name}</div>
                        <div><span class="font-medium">Roll No:</span> ${student.rollNo}</div>
                        <div><span class="font-medium">Department:</span> ${student.department}</div>
                        <div><span class="font-medium">Semester:</span> ${student.semester}</div>
                        <div><span class="font-medium">Email:</span> ${student.email}</div>
                        <div><span class="font-medium">Phone:</span> ${student.phone}</div>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">Academic Performance</h4>
                    <div class="space-y-2 text-sm">
                        <div><span class="font-medium">GPA:</span> ${student.gpa}</div>
                        <div><span class="font-medium">Attendance:</span> ${student.attendance}%</div>
                        <div><span class="font-medium">Risk Score:</span> ${student.riskScore}%</div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">Risk Factors</h4>
                    <div class="space-y-2">
                        ${student.factors.map(factor =>
        `<span class="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded">${factor}</span>`
    ).join('')}
                        ${student.factors.length === 0 ? '<span class="text-green-600 text-sm">No significant risk factors</span>' : ''}
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-2">Recommended Actions</h4>
                    <div class="space-y-2 text-sm">
                        ${student.riskLevel === 'high' ?
            '<div class="text-red-600">• Schedule immediate counseling session</div><div class="text-red-600">• Contact parents/guardians</div><div class="text-red-600">• Develop intervention plan</div>' :
            student.riskLevel === 'medium' ?
                '<div class="text-yellow-600">• Regular check-ins</div><div class="text-yellow-600">• Academic support if needed</div><div class="text-yellow-600">• Monitor progress</div>' :
                '<div class="text-green-600">• Continue current support</div><div class="text-green-600">• Periodic assessments</div>'
        }
                    </div>
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="scheduleAppointment(${student.id})" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                        Schedule Meeting
                    </button>
                    <button onclick="sendNotification(${student.id})" class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300">
                        Send Message
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('show');
}

// Close Student Profile
function closeStudentProfile() {
    const modal = document.getElementById('studentProfileModal');
    modal.classList.remove('show');
}

// Contact Student
function contactStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    showMessage('Contact Options', `
        <div class="space-y-3">
            <button onclick="window.open('mailto:${student.email}')" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Send Email
            </button>
            <button onclick="window.open('tel:${student.phone}')" class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300">
                Call Student
            </button>
            <button onclick="scheduleAppointment(${studentId})" class="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300">
                Schedule Meeting
            </button>
        </div>
    `, 'info');
}

// Schedule Appointment
function scheduleAppointment(studentId) {
    const student = studentId ? studentsData.find(s => s.id === studentId) : null;
    const message = student ?
        `Schedule a counseling session with ${student.name}?` :
        'Schedule a counseling session?';

    showMessage('Schedule Appointment', message, 'confirm', () => {
        showMessage('Success', 'Appointment scheduled successfully!', 'success');
        if (student) {
            addNotification(`Appointment scheduled with ${student.name}`, 'appointment');
        }
    });
}

// Join Study Group
function joinStudyGroup() {
    showMessage('Study Groups', `
        <div class="space-y-3">
            <div class="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div class="font-medium">Mathematics Study Group</div>
                <div class="text-sm text-gray-600">Tuesdays & Thursdays, 4:00 PM</div>
            </div>
            <div class="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div class="font-medium">Programming Study Group</div>
                <div class="text-sm text-gray-600">Mondays & Wednesdays, 6:00 PM</div>
            </div>
            <div class="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div class="font-medium">General Academic Support</div>
                <div class="text-sm text-gray-600">Daily, 2:00 PM - 5:00 PM</div>
            </div>
        </div>
    `, 'info');
}

// Access Resources
function accessResources() {
    showMessage('Learning Resources', `
        <div class="space-y-3">
            <a href="#" class="block p-3 border rounded-lg hover:bg-gray-50">
                <div class="font-medium">📚 Online Library</div>
                <div class="text-sm text-gray-600">Access digital books and journals</div>
            </a>
            <a href="#" class="block p-3 border rounded-lg hover:bg-gray-50">
                <div class="font-medium">🎥 Video Tutorials</div>
                <div class="text-sm text-gray-600">Subject-specific learning videos</div>
            </a>
            <a href="#" class="block p-3 border rounded-lg hover:bg-gray-50">
                <div class="font-medium">📝 Practice Tests</div>
                <div class="text-sm text-gray-600">Mock exams and quizzes</div>
            </a>
            <a href="#" class="block p-3 border rounded-lg hover:bg-gray-50">
                <div class="font-medium">💬 Discussion Forums</div>
                <div class="text-sm text-gray-600">Connect with peers and instructors</div>
            </a>
        </div>
    `, 'info');
}

// Setup Notifications
function setupNotifications() {
    notifications = [
        {
            id: 1,
            title: 'High Risk Alert',
            message: '3 students require immediate attention',
            time: '2 hours ago',
            type: 'alert',
            unread: true
        },
        {
            id: 2,
            title: 'Weekly Report Ready',
            message: 'Your weekly analytics report is available',
            time: '1 day ago',
            type: 'info',
            unread: true
        },
        {
            id: 3,
            title: 'Appointment Reminder',
            message: 'Meeting with John Doe at 3:00 PM today',
            time: '3 hours ago',
            type: 'reminder',
            unread: false
        }
    ];

    updateNotificationBadge();
    renderNotifications();
}

// Toggle Notifications
function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.classList.toggle('hidden');
}

// Update Notification Badge
function updateNotificationBadge() {
    const badge = document.getElementById('notification-count');
    const unreadCount = notifications.filter(n => n.unread).length;

    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Render Notifications
function renderNotifications() {
    const notificationList = document.getElementById('notification-list');
    if (!notificationList) return;

    notificationList.innerHTML = '';

    if (notifications.length === 0) {
        notificationList.innerHTML = '<div class="p-4 text-center text-gray-500">No notifications</div>';
        return;
    }

    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item ${notification.unread ? 'notification-unread' : ''}`;
        notificationElement.onclick = () => markAsRead(notification.id);

        notificationElement.innerHTML = `
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${notification.time}</div>
        `;

        notificationList.appendChild(notificationElement);
    });
}

// Mark Notification as Read
function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.unread = false;
        updateNotificationBadge();
        renderNotifications();
    }
}

// Add Notification
function addNotification(message, type = 'info') {
    const newNotification = {
        id: Date.now(),
        title: type === 'appointment' ? 'Appointment Scheduled' : 'New Notification',
        message: message,
        time: 'Just now',
        type: type,
        unread: true
    };

    notifications.unshift(newNotification);
    updateNotificationBadge();
    renderNotifications();
}

// Send Bulk Notifications
function sendBulkNotifications() {
    showMessage('Send Notifications', `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Recipient Group</label>
                <select class="w-full px-3 py-2 border rounded-lg">
                    <option>High Risk Students</option>
                    <option>Medium Risk Students</option>
                    <option>All Students</option>
                    <option>Specific Department</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea class="w-full px-3 py-2 border rounded-lg" rows="3" placeholder="Enter your message..."></textarea>
            </div>
            <button class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Send Notifications
            </button>
        </div>
    `, 'info');
}

// Export Functions
function exportAnalytics() {
    showMessage('Export Report', 'Analytics report exported successfully!', 'success');
}

function exportCounselorReport() {
    showMessage('Export Report', 'Counselor report exported successfully!', 'success');
}

function generateStudentReport() {
    showMessage('Generate Report', 'Student report generated successfully!', 'success');
}

// File Upload Handler
function setupFileUpload() {
    const fileInput = document.getElementById('file-input');
    const uploadArea = fileInput?.parentElement;

    if (!uploadArea) return;

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload({ files: files });
        }
    });
}

function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    if (!allowedTypes.includes(file.type)) {
        showMessage('Invalid File Type', 'Please upload a CSV or Excel file.', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showMessage('File Too Large', 'Please upload a file smaller than 10MB.', 'error');
        return;
    }

    showMessage('File Upload', 'File uploaded successfully! Processing data...', 'success');

    // Simulate file processing
    setTimeout(() => {
        showMessage('Processing Complete', 'Data has been processed and risk analysis is ready.', 'success');
    }, 2000);
}

// Update Live Statistics
function updateLiveStatistics() {
    // Simulate real-time updates
    setInterval(() => {
        const totalStudents = document.getElementById('total-students');
        const highRiskCount = document.getElementById('high-risk-count');
        const successRate = document.getElementById('success-rate');
        const interventions = document.getElementById('interventions');

        if (totalStudents) {
            const current = parseInt(totalStudents.textContent.replace(',', ''));
            totalStudents.textContent = (current + Math.floor(Math.random() * 3)).toLocaleString();
        }

        if (highRiskCount) {
            const current = parseInt(highRiskCount.textContent);
            const change = Math.floor(Math.random() * 3) - 1;
            highRiskCount.textContent = Math.max(0, current + change);
        }

        if (successRate) {
            const current = parseFloat(successRate.textContent.replace('%', ''));
            const change = (Math.random() - 0.5) * 0.2;
            successRate.textContent = (current + change).toFixed(1) + '%';
        }

        if (interventions) {
            const current = parseInt(interventions.textContent);
            interventions.textContent = current + Math.floor(Math.random() * 2);
        }
    }, 30000); // Update every 30 seconds
}

// Update Counselor Statistics
function updateCounselorStatistics() {
    const totalStudentsEl = document.getElementById('counselor-total-students');
    const highRiskEl = document.getElementById('counselor-high-risk');
    const sessionsEl = document.getElementById('counselor-sessions');
    const successRateEl = document.getElementById('counselor-success-rate');

    if (totalStudentsEl) totalStudentsEl.textContent = studentsData.length.toLocaleString();
    if (highRiskEl) highRiskEl.textContent = studentsData.filter(s => s.riskLevel === 'high').length;
    if (sessionsEl) sessionsEl.textContent = '24';
    if (successRateEl) successRateEl.textContent = '87%';
}

// Load Mock Data
function loadMockData() {
    // This function can be expanded to load data from an API
    console.log('Mock data loaded');
}

// Enhanced Message Modal
function showMessage(title, message, type = 'info', onConfirm = null) {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modalMessage');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');

    modalTitle.textContent = title;

    if (typeof message === 'string') {
        modalMessage.innerHTML = message;
    } else {
        modalMessage.appendChild(message);
    }

    // Configure buttons based on type
    if (type === 'confirm' && onConfirm) {
        modalCancel.style.display = 'inline-block';
        modalConfirm.textContent = 'Confirm';
        modalConfirm.onclick = () => {
            onConfirm();
            closeModal();
        };
    } else {
        modalCancel.style.display = 'none';
        modalConfirm.textContent = 'OK';
        modalConfirm.onclick = closeModal;
    }

    // Set color scheme based on type
    const confirmBtn = modalConfirm;
    confirmBtn.className = 'px-4 py-2 rounded-lg transition-colors duration-300 ';

    switch (type) {
        case 'success':
            confirmBtn.className += 'bg-green-600 text-white hover:bg-green-700';
            break;
        case 'error':
            confirmBtn.className += 'bg-red-600 text-white hover:bg-red-700';
            break;
        case 'warning':
            confirmBtn.className += 'bg-yellow-600 text-white hover:bg-yellow-700';
            break;
        default:
            confirmBtn.className += 'bg-blue-600 text-white hover:bg-blue-700';
    }

    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('messageModal');
    modal.classList.remove('show');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize Student Dashboard
function initializeStudentDashboard() {
    // This would typically load the student's actual data
    // For demo purposes, we'll use mock data
    const mockRiskResult = {
        score: 65,
        factors: [
            { name: 'Low Attendance', impact: 20, severity: 'high' },
            { name: 'Below Average Grades', impact: 15, severity: 'medium' },
            { name: 'Financial Constraints', impact: 10, severity: 'low' }
        ],
        recommendations: [
            {
                priority: 'high',
                action: 'Improve Attendance',
                description: 'Attend all classes regularly. Aim for at least 85% attendance.',
                icon: '📅'
            },
            {
                priority: 'high',
                action: 'Academic Support',
                description: 'Join study groups and seek tutoring assistance.',
                icon: '📚'
            }
        ]
    };

    const mockData = {
        attendance: 70,
        testScores: 65,
        gpa: 2.8
    };

    displayEnhancedResults(mockRiskResult, mockData);
}

// Setup Progress Tracking
function setupProgressTracking() {
    // Initialize progress tracking functionality
    console.log('Progress tracking initialized');
}

// Update Analytics Data
function updateAnalyticsData() {
    // Update analytics charts with real-time data
    console.log('Analytics data updated');
}

// Risk Trend Analysis (Line Chart)
new Chart(document.getElementById("trendChart"), {
    type: "line",
    data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
            label: "Risk Score",
            data: [20, 35, 40, 28, 50, 65],
            borderColor: "rgba(59,130,246,1)", // blue-500
            backgroundColor: "rgba(59,130,246,0.2)",
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: true } }
    }
});

// Department Risk Comparison (Bar Chart)
new Chart(document.getElementById("departmentChart"), {
    type: "bar",
    data: {
        labels: ["CSE", "ECE", "ME", "CE", "EE"],
        datasets: [{
            label: "High Risk Students",
            data: [15, 8, 12, 5, 10],
            backgroundColor: [
                "rgba(59,130,246,0.7)",  // blue
                "rgba(16,185,129,0.7)",  // green
                "rgba(239,68,68,0.7)",   // red
                "rgba(245,158,11,0.7)",  // amber
                "rgba(139,92,246,0.7)"   // purple
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } }
    }
});

// Intervention Success Rate (Doughnut Chart)
new Chart(document.getElementById("interventionChart"), {
    type: "doughnut",
    data: {
        labels: ["Successful", "Ongoing", "Failed"],
        datasets: [{
            data: [65, 20, 15],
            backgroundColor: [
                "rgba(34,197,94,0.8)",  // green
                "rgba(59,130,246,0.8)", // blue
                "rgba(239,68,68,0.8)"   // red
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } }
    }
});

// AI Model Accuracy (Pie Chart)
new Chart(document.getElementById("accuracyChart"), {
    type: "pie",
    data: {
        labels: ["Correct Predictions", "Incorrect Predictions"],
        datasets: [{
            data: [85, 15],
            backgroundColor: [
                "rgba(16,185,129,0.8)", // green
                "rgba(239,68,68,0.8)"   // red
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } }
    }
});

// --- Chat Widget Behavior ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        const chatToggle = document.getElementById('chat-toggle');
        const chatPanel = document.getElementById('chat-panel');
        const chatClose = document.getElementById('chat-close');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');

        if (chatToggle && chatPanel) {
            chatToggle.addEventListener('click', () => {
                chatPanel.classList.toggle('hidden');
                // focus input when opening
                setTimeout(() => chatInput?.focus(), 150);
            });
        }

        if (chatClose) {
            chatClose.addEventListener('click', () => chatPanel.classList.add('hidden'));
        }

        function appendMessage(text, from = 'bot') {
            if (!chatMessages) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'w-full flex';
            const msg = document.createElement('div');
            msg.className = 'message text-sm px-3 py-2';
            msg.textContent = text;

            if (from === 'user') {
                msg.classList.add('chat-msg-user');
            } else {
                msg.classList.add('chat-msg-bot');
            }

            wrapper.appendChild(msg);
            chatMessages.appendChild(wrapper);
            // animate in and scroll to bottom
            setTimeout(() => {
                msg.classList.add('show');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 30);
        }

        // Simple bot reply (local simulation)
        function botReply(userText) {
            // basic canned responses for demo
            const t = userText.toLowerCase();
            if (t.includes('hello') || t.includes('hi')) return 'Hello! I am the EduTrack assistant. How can I help you today?';
            if (t.includes('risk') || t.includes('predict')) return 'To get a risk prediction, go to Predict Risk and submit your details. I can help guide you through the form.';
            if (t.includes('counsel') || t.includes('counseling')) return 'If you need counseling, you can schedule a session from the student dashboard or contact your counselor.';
            if (t.includes('thanks') || t.includes('thank')) return 'You\'re welcome — glad I could help!';
            return "I'm here to help — please describe your question and I'll do my best to assist.";
        }

        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (!text) return;
                appendMessage(text, 'user');
                chatInput.value = '';

                // simulate bot thinking
                setTimeout(() => {
                    const reply = botReply(text);
                    appendMessage(reply, 'bot');
                }, 600);
            });
        }

        // seed greeting when panel opens for the first time
        if (chatPanel && chatPanel.classList.contains('hidden')) {
            // nothing - wait for open
        } else {
            // if it's visible on load, show greeting
            appendMessage('Hi! I\'m the EduTrack assistant. Ask me about predictions, counseling, or how to use this tool.', 'bot');
        }
        // expose globally so other code can reuse the same animated function
        try { window.appendMessage = appendMessage; } catch (e) { /* ignore if readonly */ }
    } catch (err) {
        console.error('Chat widget initialization error:', err);
    }
});

// --- Page Entrance Animations ---
function runEntranceAnimations() {
    // stagger reveal for cards (general entrance)
    const container = document.querySelector('.animated-ui') || document.body;
    const cards = container.querySelectorAll('.card');
    cards.forEach((c, i) => {
        setTimeout(() => c.classList.add('show-up'), 120 * i);
    });
}

// animateCount: increment number text content from 0 to target over duration (ms)
function animateCount(el, duration) {
    const raw = el.getAttribute('data-target') || el.textContent;
    const text = String(raw).trim();
    const isPercent = text.endsWith('%');
    const numeric = parseFloat(text.replace(/[,\s%]+/g, '')) || 0;
    const startTime = performance.now();
    function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = easeOutCubic(t);
        const current = numeric * eased;
        if (isPercent) {
            el.textContent = current.toFixed(1) + '%';
        } else {
            el.textContent = Math.round(current).toLocaleString();
        }
        if (t < 1) requestAnimationFrame(step);
        else {
            // pop effect
            el.classList.add('pop');
            setTimeout(() => el.classList.remove('pop'), 600);
            // final exact value
            el.textContent = isPercent ? numeric.toFixed(1) + '%' : String(numeric).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    }
    requestAnimationFrame(step);
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

// Robot animation: subtle blink and eye movement on student-login page
function startRobotAnimations() {
    const leftEye = document.querySelector('.robot-illustration .left-eye, .robot-eye.left-eye');
    const rightEye = document.querySelector('.robot-illustration .right-eye, .robot-eye.right-eye');
    // fallback: try robot-eye class if named differently
    const l = document.querySelector('.robot-eye.left-eye') || document.querySelector('.left-eye');
    const r = document.querySelector('.robot-eye.right-eye') || document.querySelector('.right-eye');
    const le = leftEye || l;
    const re = rightEye || r;
    if (!le || !re) return;
    setInterval(() => {
        le.style.transform = 'scaleY(0.18)';
        re.style.transform = 'scaleY(0.18)';
        setTimeout(() => {
            le.style.transform = '';
            re.style.transform = '';
        }, 220);
    }, 4000 + Math.random() * 3000);
}

function animateNumber(el, start, end, duration) {
    const startTime = performance.now();
    function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad-ish
        const current = Math.round(start + (end - start) * eased);
        el.textContent = current + (el.textContent.includes('%') ? '%' : '');
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ensure animations run when page shown
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runEntranceAnimations, 400);
});

// (no-op) chat messages are animated by the appendMessage function which is exposed on window
