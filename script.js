// Global variables
let currentStudySession = null;
let studyTimer = null;
let uploadedFiles = [];
let timerInterval = null;
let timerMinutes = 25;
let timerSeconds = 0;
let timerRunning = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
});

// Initialize the application
function initializeApp() {
    // Show the active section based on URL hash or default to dashboard
    const hash = window.location.hash || '#dashboard';
    showSection(hash.substring(1));
    
    // Update active nav item
    updateActiveNav(hash.substring(1));
    
    // Initialize study timer
    initializeStudyTimer();
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            updateActiveNav(sectionId);
            
            // Update URL hash
            window.location.hash = sectionId;
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.sidebar').classList.add('collapsed');
            }
        });
    });
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Timetable tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTimetableTab(tabId);
        });
    });
    
    // Building categories
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterBuildings(category);
            updateActiveCategory(this);
        });
    });
    
    // Building search
    document.getElementById('search-building-btn').addEventListener('click', searchBuilding);
    document.getElementById('building-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchBuilding();
    });
    
    // Chat functionality
    document.getElementById('send-message').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Voice button
    document.getElementById('voice-btn').addEventListener('click', toggleVoiceInput);
    
    // Study timer button
    document.getElementById('study-timer-btn').addEventListener('click', openStudyTimer);
    
    // PDF upload
    document.getElementById('browse-btn').addEventListener('click', () => {
        document.getElementById('pdf-file').click();
    });
    
    document.getElementById('pdf-file').addEventListener('change', handleFileUpload);
    
    // Drag and drop for file upload
    const uploadArea = document.getElementById('upload-area');
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        this.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleDroppedFiles(files);
    });
    
    // Global search
    document.getElementById('global-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performGlobalSearch();
    });
    
    // Notification button
    document.getElementById('notification-btn').addEventListener('click', toggleNotifications);
    
    // Profile button
    document.getElementById('profile-btn').addEventListener('click', function() {
        alert('Profile settings would open here');
    });
    
    // Interactive map buildings
    document.querySelectorAll('.building').forEach(building => {
        building.addEventListener('click', function() {
            showBuildingInfo(this);
        });
    });
    
    // Timer settings
    document.querySelectorAll('.setting-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.setting-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            timerMinutes = parseInt(this.getAttribute('data-minutes'));
            resetTimer();
        });
    });
    
    // Emergency buttons
    document.querySelectorAll('.emergency-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            handleEmergencyCall(type);
        });
    });
    
    // Help buttons
    document.querySelectorAll('.help-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const guide = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            showHelpGuide(guide);
        });
    });
}

// Load sample data
function loadSampleData() {
    // In a real application, this would be API calls
    console.log('Loading sample data...');
}

// Show section and hide others
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Update active navigation item
function updateActiveNav(sectionId) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`.nav-item a[href="#${sectionId}"]`).parentElement;
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeToggle = document.getElementById('themeToggle');
    
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
}

// Timetable tab switching
function switchTimetableTab(tabId) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
}

// Filter buildings by category
function filterBuildings(category) {
    const buildings = document.querySelectorAll('.building');
    
    buildings.forEach(building => {
        if (category === 'all' || building.classList.contains(category)) {
            building.style.opacity = '1';
            building.style.pointerEvents = 'auto';
        } else {
            building.style.opacity = '0.3';
            building.style.pointerEvents = 'none';
        }
    });
}

// Update active category button
function updateActiveCategory(activeBtn) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// Search building
function searchBuilding() {
    const searchTerm = document.getElementById('building-search').value.toLowerCase();
    
    if (!searchTerm) {
        filterBuildings('all');
        document.querySelector('.category-btn[data-category="all"]').click();
        return;
    }
    
    const buildings = document.querySelectorAll('.building');
    let found = false;
    
    buildings.forEach(building => {
        const buildingName = building.getAttribute('data-name').toLowerCase();
        if (buildingName.includes(searchTerm)) {
            building.style.opacity = '1';
            building.style.pointerEvents = 'auto';
            
            // Highlight the building
            building.style.fill = '#e74c3c';
            setTimeout(() => {
                building.style.fill = '';
            }, 2000);
            
            found = true;
        } else {
            building.style.opacity = '0.3';
            building.style.pointerEvents = 'none';
        }
    });
    
    if (!found) {
        alert('No building found with that name.');
        filterBuildings('all');
        document.querySelector('.category-btn[data-category="all"]').click();
    }
}

// Show building info
function showBuildingInfo(buildingElement) {
    const name = buildingElement.getAttribute('data-name');
    const desc = buildingElement.getAttribute('data-desc');
    
    document.getElementById('building-name').textContent = name;
    document.getElementById('building-desc').textContent = desc;
    
    document.querySelector('.info-placeholder').style.display = 'none';
    document.querySelector('.info-content').style.display = 'block';
}

// Send chat message
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addChatMessage(response, 'bot');
    }, 1000);
}

// Add chat message to the UI
function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Format message with line breaks
    const formattedMessage = message.replace(/\n/g, '<br>');
    content.innerHTML = `<p>${formattedMessage}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate AI response based on user input
function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Course-related queries
    if (lowerMessage.includes('schedule') || lowerMessage.includes('timetable')) {
        if (lowerMessage.includes('monday')) {
            return "On Monday, you have:\n• 9:00 AM - Data Structures & Algorithms (Science Bldg, Room 205)\n• 11:00 AM - Calculus II (Math Bldg, Room 101)\n• 2:00 PM - Introduction to AI (CS Bldg, Room 315)";
        } else if (lowerMessage.includes('tuesday')) {
            return "On Tuesday, you have:\n• 10:00 AM - Web Development (CS Bldg, Room 210)\n• 1:00 PM - Database Systems (Science Bldg, Room 305)";
        }
        return "I can help with your class schedule! Try asking about a specific day like 'What's my schedule on Monday?'";
    }
    
    // Faculty queries
    if (lowerMessage.includes('who teaches') || lowerMessage.includes('professor') || lowerMessage.includes('instructor')) {
        if (lowerMessage.includes('data structure')) {
            return "Data Structures & Algorithms is taught by Dr. Sarah Johnson. You can contact her at sjohnson@university.edu";
        } else if (lowerMessage.includes('calculus')) {
            return "Calculus II is taught by Prof. Michael Chen. His office hours are Mon/Wed 2-4 PM in the Math Building.";
        } else if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
            return "Introduction to AI is taught by Dr. Amanda Rodriguez. She specializes in machine learning and AI research.";
        }
        return "I have information about all your instructors. Which course are you asking about?";
    }
    
    // Exam queries
    if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('final')) {
        if (lowerMessage.includes('data structure')) {
            return "Your Data Structures & Algorithms exam is on May 15, 2023 from 9:00-11:00 AM in Science Building, Room 205.";
        } else if (lowerMessage.includes('calculus')) {
            return "Your Calculus II exam is on May 17, 2023 from 1:00-3:00 PM in Main Hall, Room 101.";
        }
        return "You have 5 upcoming exams. The next one is Data Structures & Algorithms on May 15th. Would you like me to help you create a study plan?";
    }
    
    // Location queries
    if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('room')) {
        if (lowerMessage.includes('science') || lowerMessage.includes('sci')) {
            return "The Science Building is located in the north campus, near the Math Building and Student Center. It houses Computer Science, Physics, and Chemistry departments.";
        } else if (lowerMessage.includes('math')) {
            return "The Math Building is next to the Science Building on north campus. Your Calculus II class is in Room 101.";
        } else if (lowerMessage.includes('cs') || lowerMessage.includes('computer science')) {
            return "The Computer Science Building is on north campus, between the Math Building and Student Center. It has specialized labs for AI, networking, and software engineering.";
        }
        return "I can help you find campus locations! Which building are you looking for?";
    }
    
    // Study plan queries
    if (lowerMessage.includes('study') || lowerMessage.includes('homework') || lowerMessage.includes('assignment')) {
        return "Based on your upcoming exams, I recommend focusing on:\n1. Data Structures & Algorithms (HIGH priority)\n2. Calculus II (HIGH priority)\n3. Introduction to AI (MEDIUM priority)\n\nWould you like me to start a study session for any of these?";
    }
    
    // Default response
    const defaultResponses = [
        "I'm here to help with your campus needs! You can ask me about your schedule, faculty, exams, or campus locations.",
        "I'm your AI campus assistant! Try asking about your classes, professors, or upcoming events.",
        "How can I assist you today? I can help with timetables, faculty contacts, exam schedules, and more!"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Toggle voice input
function toggleVoiceInput() {
    const voiceBtn = document.getElementById('voice-btn');
    
    if (!('webkitSpeechRecognition' in window)) {
        alert('Speech recognition is not supported in your browser. Try Chrome or Edge.');
        return;
    }
    
    if (voiceBtn.classList.contains('listening')) {
        // Stop listening
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        return;
    }
    
    // Start listening
    voiceBtn.classList.add('listening');
    voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        console.log('Voice recognition started');
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chat-input').value = transcript;
        
        // Stop listening
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        
        // Automatically send the message
        sendMessage();
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    };
    
    recognition.onend = function() {
        voiceBtn.classList.remove('listening');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    };
    
    recognition.start();
}

// Initialize study timer
function initializeStudyTimer() {
    // Timer would be initialized here
    console.log('Study timer initialized');
}

// Open study timer modal
function openStudyTimer() {
    document.getElementById('studyTimerModal').classList.add('active');
}

// Close study timer modal
function closeStudyTimer() {
    document.getElementById('studyTimerModal').classList.remove('active');
    resetTimer();
}

// Start timer
function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    document.getElementById('startTimerBtn').style.display = 'none';
    document.getElementById('pauseTimerBtn').style.display = 'inline-flex';
    
    timerInterval = setInterval(function() {
        if (timerSeconds === 0) {
            if (timerMinutes === 0) {
                // Timer completed
                clearInterval(timerInterval);
                timerRunning = false;
                alert('Study session completed! Time for a break.');
                document.getElementById('startTimerBtn').style.display = 'inline-flex';
                document.getElementById('pauseTimerBtn').style.display = 'none';
                return;
            }
            timerMinutes--;
            timerSeconds = 59;
        } else {
            timerSeconds--;
        }
        
        updateTimerDisplay();
    }, 1000);
}

// Pause timer
function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('startTimerBtn').style.display = 'inline-flex';
    document.getElementById('pauseTimerBtn').style.display = 'none';
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = 0;
    updateTimerDisplay();
    document.getElementById('startTimerBtn').style.display = 'inline-flex';
    document.getElementById('pauseTimerBtn').style.display = 'none';
}

// Update timer display
function updateTimerDisplay() {
    document.getElementById('timer-minutes').textContent = timerMinutes.toString().padStart(2, '0');
    document.getElementById('timer-seconds').textContent = timerSeconds.toString().padStart(2, '0');
}

// Start study session
function startStudySession(course) {
    currentStudySession = course;
    addChatMessage(`Starting study session for ${course}. Good luck! 🎯`, 'bot');
    
    // Switch to chatbot section
    showSection('chatbot');
    updateActiveNav('chatbot');
    window.location.hash = 'chatbot';
    
    // Open study timer
    openStudyTimer();
}

// Pause study session
function pauseStudySession() {
    addChatMessage(`Paused study session for ${currentStudySession}.`, 'bot');
}

// End study session
function endStudySession() {
    addChatMessage(`Ended study session for ${currentStudySession}. Great work! 🎉`, 'bot');
    currentStudySession = null;
}

// Ask about class
function askAboutClass(course, instructor) {
    const question = `Tell me about ${course} taught by ${instructor}`;
    document.getElementById('chat-input').value = question;
    
    // Switch to chatbot and send message
    showSection('chatbot');
    updateActiveNav('chatbot');
    window.location.hash = 'chatbot';
    
    // Small delay to ensure section is visible
    setTimeout(() => {
        sendMessage();
    }, 300);
}

// Handle file upload
function handleFileUpload(event) {
    const files = event.target.files;
    processUploadedFiles(files);
}

// Handle dropped files
function handleDroppedFiles(files) {
    processUploadedFiles(files);
}

// Process uploaded files
function processUploadedFiles(files) {
    const fileList = document.getElementById('file-list');
    
    for (let file of files) {
        if (file.type === 'application/pdf') {
            // Add to uploaded files array
            uploadedFiles.push({
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
                uploadDate: new Date().toLocaleDateString()
            });
            
            // Create file item
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-pdf file-icon"></i>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">${(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded today</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn-small" onclick="askAboutPDF('${file.name}')">Ask AI</button>
                    <button class="btn-small" style="background: #e74c3c;" onclick="deleteFile('${file.name}')">Delete</button>
                </div>
            `;
            
            // Remove "no files" message if it exists
            const noFiles = fileList.querySelector('.no-files');
            if (noFiles) {
                noFiles.remove();
            }
            
            fileList.appendChild(fileItem);
            
            // Show success message in chat
            addChatMessage(`I've uploaded "${file.name}". You can now ask me questions about this material! 📚`, 'bot');
        }
    }
}

// Ask about PDF content
function askAboutPDF(filename) {
    document.getElementById('chat-input').value = `Can you explain the key concepts from ${filename}?`;
    
    // Switch to chatbot
    showSection('chatbot');
    updateActiveNav('chatbot');
    window.location.hash = 'chatbot';
}

// Delete file
function deleteFile(filename) {
    uploadedFiles = uploadedFiles.filter(file => file.name !== filename);
    
    // Update UI
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '<p class="no-files">No PDFs uploaded yet</p>';
    } else {
        uploadedFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-pdf file-icon"></i>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">${file.size} • Uploaded ${file.uploadDate}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn-small" onclick="askAboutPDF('${file.name}')">Ask AI</button>
                    <button class="btn-small" style="background: #e74c3c;" onclick="deleteFile('${file.name}')">Delete</button>
                </div>
            `;
            fileList.appendChild(fileItem);
        });
    }
    
    addChatMessage(`I've removed "${filename}" from your study materials.`, 'bot');
}

// Perform global search
function performGlobalSearch() {
    const query = document.getElementById('global-search').value.trim();
    
    if (!query) return;
    
    // Simple search logic - in a real app, this would be more sophisticated
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('class') || lowerQuery.includes('schedule') || lowerQuery.includes('timetable')) {
        showSection('timetable');
        updateActiveNav('timetable');
        window.location.hash = 'timetable';
    } else if (lowerQuery.includes('exam') || lowerQuery.includes('test')) {
        showSection('exams');
        updateActiveNav('exams');
        window.location.hash = 'exams';
    } else if (lowerQuery.includes('professor') || lowerQuery.includes('faculty') || lowerQuery.includes('teacher')) {
        showSection('faculty');
        updateActiveNav('faculty');
        window.location.hash = 'faculty';
    } else if (lowerQuery.includes('event') || lowerQuery.includes('workshop')) {
        showSection('events');
        updateActiveNav('events');
        window.location.hash = 'events';
    } else if (lowerQuery.includes('map') || lowerQuery.includes('location') || lowerQuery.includes('building')) {
        showSection('campus-map');
        updateActiveNav('campus-map');
        window.location.hash = 'campus-map';
    } else {
        // Default to chatbot for general queries
        showSection('chatbot');
        updateActiveNav('chatbot');
        window.location.hash = 'chatbot';
        document.getElementById('chat-input').value = query;
        setTimeout(sendMessage, 500);
    }
}

// Toggle notifications
function toggleNotifications() {
    document.getElementById('notificationPanel').classList.toggle('active');
    
    // Clear notification badge
    document.querySelector('.notification-badge').style.display = 'none';
}

// Close notifications
function closeNotifications() {
    document.getElementById('notificationPanel').classList.remove('active');
}

// Generate study plan
function generateStudyPlan() {
    addChatMessage("I've generated a new study plan based on your upcoming exams and current progress. Check the Study Hub for details! 📚", 'bot');
    showSection('studyhub');
    updateActiveNav('studyhub');
    window.location.hash = 'studyhub';
}

// Study tools functions
function openFlashcards() {
    addChatMessage("Opening AI Flashcards. I'll generate flashcards from your study materials! 📇", 'bot');
}

function openQuizGenerator() {
    addChatMessage("Opening Quiz Generator. I'll create practice questions based on your weak areas! ❓", 'bot');
}

function openStudyGroups() {
    addChatMessage("Opening Study Groups. You can join or create collaborative study sessions! 👥", 'bot');
}

function openWhiteboard() {
    addChatMessage("Opening Virtual Whiteboard. Perfect for collaborative problem solving! 🎨", 'bot');
}

// Handle emergency call
function handleEmergencyCall(type) {
    let message = '';
    
    switch(type) {
        case 'security':
            message = "Calling Campus Security...\n\nEmergency Line: +1 (555) 123-EMER\nLocation: Security Building, Room 101\n\nStay on the line, help is on the way! 🚨";
            break;
        case 'health':
            message = "Contacting Health Center...\n\nMedical Line: +1 (555) 123-HELP\nHours: Mon-Fri 8AM-6PM\n\nDescribe your symptoms clearly for faster assistance. 🏥";
            break;
        case 'academic':
            message = "Connecting to Academic Support...\n\nTutoring Line: +1 (555) 123-LEARN\nEmail: tutoring@university.edu\n\nWhat subject do you need help with? 📚";
            break;
        case 'counseling':
            message = "Reaching Counseling Services...\n\nSupport Line: +1 (555) 123-CARE\nAvailable: 24/7\n\nYou're not alone - help is available whenever you need it. 💙";
            break;
    }
    
    // Show in chatbot
    showSection('chatbot');
    updateActiveNav('chatbot');
    window.location.hash = 'chatbot';
    
    setTimeout(() => {
        addChatMessage(message, 'bot');
    }, 500);
}

// Show help guide
function showHelpGuide(guide) {
    let message = '';
    
    switch(guide) {
        case 'lost':
            message = "🔄 I Can Help You Find Your Way!\n\n• Use the Campus Map to see building locations\n• Ask me: 'Where is the Science Building?'\n• Campus Security can escort you: +1 (555) 123-EMER\n\nYou'll find your way! 🗺️";
            break;
        case 'sick':
            message = "🤒 Feeling Unwell?\n\n• Contact Health Center: +1 (555) 123-HELP\n• Location: Next to Student Center\n• Hours: Mon-Fri 8AM-6PM\n• For after-hours emergencies, call Campus Security\n\nTake care of yourself! 💊";
            break;
        case 'anxious':
            message = "😌 Managing Anxiety\n\n• Counseling Services: +1 (555) 123-CARE (24/7)\n• Breathing exercise: Inhale 4s, hold 4s, exhale 6s\n• Campus mindfulness workshops every Wednesday\n• You're not alone - many students feel this way\n\nThis feeling will pass. 🌈";
            break;
        case 'academic':
            message = "📚 Academic Stress Relief\n\n• Academic Support: +1 (555) 123-LEARN\n• Free tutoring for all subjects\n• Time management workshop this Friday\n• Remember: Your worth isn't defined by grades\n\nYou've got this! 💪";
            break;
    }
    
    // Show in chatbot
    showSection('chatbot');
    updateActiveNav('chatbot');
    window.location.hash = 'chatbot';
    
    setTimeout(() => {
        addChatMessage(message, 'bot');
    }, 500);
}

// Contact support (simulated)
function contactSupport(type) {
    alert(`Connecting to ${type} support. In a real application, this would initiate contact.`);
}

// Call emergency (simulated)
function callEmergency(type) {
    alert(`Simulated call to ${type} services. In a real application, this would dial the emergency number.`);
}

// Export functions for global access
window.startStudySession = startStudySession;
window.askAboutClass = askAboutClass;
window.askAboutPDF = askAboutPDF;
window.deleteFile = deleteFile;
window.callEmergency = callEmergency;
window.contactSupport = contactSupport;
window.showHelpGuide = showHelpGuide;
window.openFlashcards = openFlashcards;
window.openQuizGenerator = openQuizGenerator;
window.openStudyGroups = openStudyGroups;
window.openWhiteboard = openWhiteboard;
window.pauseStudySession = pauseStudySession;
window.endStudySession = endStudySession;
window.generateStudyPlan = generateStudyPlan;
window.showSection = showSection;