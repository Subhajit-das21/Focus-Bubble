/**
 * FOCUS BUBBLE - JavaScript Functionality
 * A minimal focus timer app with bubble visualization
 */

// ==========================================================================
// APP STATE VARIABLES
// ==========================================================================

let currentTask = '';
let selectedMinutes = 25;
let timeRemaining = 25 * 60;
let totalTime = 25 * 60;
let timerInterval = null;
let isPaused = false;
let hasShownWarning = false;

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================

const inputScreen = document.getElementById('inputScreen');
const timerScreen = document.getElementById('timerScreen');
const celebrationScreen = document.getElementById('celebrationScreen');
const taskInput = document.getElementById('taskInput');
const startBtn = document.getElementById('startBtn');
const currentTaskElement = document.getElementById('currentTask');
const timerDisplay = document.getElementById('timerDisplay');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const newTaskBtn = document.getElementById('newTaskBtn');
const timeOptions = document.querySelectorAll('.time-option');
const customMinutes = document.getElementById('customMinutes');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const warningNotification = document.getElementById('warningNotification');
const warningTime = document.getElementById('warningTime');
const progressCircle = document.getElementById('progressCircle');
const backgroundBubbles = document.getElementById('backgroundBubbles');

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================

/**
 * Create animated background bubbles
 */
function createBackgroundBubbles() {
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.top = Math.random() * 100 + '%';
        bubble.style.width = bubble.style.height = (Math.random() * 100 + 20) + 'px';
        bubble.style.animationDelay = Math.random() * 8 + 's';
        bubble.style.animationDuration = (Math.random() * 4 + 6) + 's';
        backgroundBubbles.appendChild(bubble);
    }
}

/**
 * Format seconds into MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Update the circular progress indicator
 */
function updateProgress() {
    const circumference = 879.646; // 2 * π * 140
    const progress = (totalTime - timeRemaining) / totalTime;
    const offset = circumference - (progress * circumference);
    progressCircle.style.strokeDashoffset = offset;
}

/**
 * Show a specific screen and hide others
 * @param {string} screenName - ID of screen to show
 */
function showScreen(screenName) {
    inputScreen.style.display = 'none';
    timerScreen.style.display = 'none';
    celebrationScreen.style.display = 'none';
    
    document.getElementById(screenName).style.display = 'block';
}

/**
 * Play notification sound
 * @param {string} type - Type of sound ('warning' or 'success')
 */
function playSound(type) {
    try {
        let audioData;
        if (type === 'warning') {
            audioData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgeB1CFyfLZgyMFJn/N8daUOQgSa7jo75BBAgjE2/LNdWIDKHPL8N';
        } else {
            audioData = 'data:audio/wav;base64,UklGRvIBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Yc4BAAAAAwAAAAEAAAACAAAAAwAAAAEAAAACAAAAAwAAAAEAAAACAAAA';
        }
        const audio = new Audio(audioData);
        audio.play().catch(e => {}); // Ignore errors if sound fails
    } catch (e) {
        // Sound not supported, continue silently
    }
}

// ==========================================================================
// TIME SELECTION HANDLERS
// ==========================================================================

/**
 * Handle time option selection
 */
timeOptions.forEach(option => {
    option.addEventListener('click', () => {
        timeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        selectedMinutes = parseInt(option.dataset.minutes);
        customMinutes.value = '';
    });
});

/**
 * Handle custom time input
 */
customMinutes.addEventListener('input', () => {
    if (customMinutes.value) {
        timeOptions.forEach(opt => opt.classList.remove('active'));
        selectedMinutes = parseInt(customMinutes.value) || 25;
    }
});

// ==========================================================================
// TIMER FUNCTIONS
// ==========================================================================

/**
 * Start a new focus session
 */
function startFocus() {
    currentTask = taskInput.value.trim();
    
    // Validate input
    if (!currentTask) {
        taskInput.focus();
        return;
    }

    // Set time based on selection
    if (customMinutes.value) {
        selectedMinutes = parseInt(customMinutes.value) || 25;
    }

    timeRemaining = selectedMinutes * 60;
    totalTime = timeRemaining;
    hasShownWarning = false;

    // Setup timer screen
    currentTaskElement.textContent = currentTask;
    timerDisplay.textContent = formatTime(timeRemaining);
    showScreen('timerScreen');
    
    // Initialize progress
    updateProgress();
    
    // Start the timer
    startTimer();
}

/**
 * Start or resume the timer
 */
function startTimer() {
    if (timerInterval) return; // Prevent multiple intervals
    
    pauseBtn.innerHTML = '⏸️ Pause';
    pauseBtn.classList.remove('btn-primary');
    pauseBtn.classList.add('btn-secondary');
    isPaused = false;

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = formatTime(timeRemaining);
        updateProgress();

        // Show warning at 2 minutes remaining
        if (timeRemaining === 120 && !hasShownWarning) {
            showWarning('2 minutes');
            hasShownWarning = true;
        }

        // Show final warning at 30 seconds
        if (timeRemaining === 30) {
            showWarning('30 seconds');
        }

        // Timer finished
        if (timeRemaining <= 0) {
            finishSession();
        }
    }, 1000);
}

/**
 * Pause or resume the timer
 */
function pauseTimer() {
    if (isPaused) {
        // Resume timer
        startTimer();
    } else {
        // Pause timer
        clearInterval(timerInterval);
        timerInterval = null;
        pauseBtn.innerHTML = '▶️ Resume';
        pauseBtn.classList.remove('btn-secondary');
        pauseBtn.classList.add('btn-primary');
        isPaused = true;
        hideWarning();
    }
}

/**
 * Reset the timer and return to input screen
 */
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeRemaining = selectedMinutes * 60;
    totalTime = timeRemaining;
    isPaused = false;
    hasShownWarning = false;
    
    taskInput.value = '';
    currentTask = '';
    hideWarning();
    showScreen('inputScreen');
    taskInput.focus();
}

/**
 * Complete the focus session
 */
function finishSession() {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = false;
    hasShownWarning = false;
    
    // Reset for next session
    timeRemaining = selectedMinutes * 60;
    totalTime = timeRemaining;
    
    hideWarning();
    showScreen('celebrationScreen');
    
    // Play success sound
    playSound('success');
}

/**
 * Start a new task (from celebration screen)
 */
function startNewTask() {
    taskInput.value = '';
    currentTask = '';
    showScreen('inputScreen');
    taskInput.focus();
}

// ==========================================================================
// NOTIFICATION FUNCTIONS
// ==========================================================================

/**
 * Show warning notification
 * @param {string} timeText - Time remaining text
 */
function showWarning(timeText) {
    warningTime.textContent = timeText;
    warningNotification.style.display = 'block';
    
    // Play warning sound
    playSound('warning');
    
    // Auto-hide after 3 seconds
    setTimeout(hideWarning, 3000);
}

/**
 * Hide warning notification
 */
function hideWarning() {
    warningNotification.style.display = 'none';
}

// ==========================================================================
// FULLSCREEN FUNCTIONS
// ==========================================================================

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            document.body.classList.add('fullscreen');
            fullscreenBtn.innerHTML = '⛉';
        }).catch(err => {
            console.log('Fullscreen not supported:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            document.body.classList.remove('fullscreen');
            fullscreenBtn.innerHTML = '⛶';
        });
    }
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================

// Button event listeners
startBtn.addEventListener('click', startFocus);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
newTaskBtn.addEventListener('click', startNewTask);
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    // Enter key to start focus (only on input screen)
    if (e.key === 'Enter' && inputScreen.style.display !== 'none') {
        startFocus();
    }
    
    // Spacebar to pause/resume (only on timer screen)
    if (e.key === ' ' && timerScreen.style.display !== 'none') {
        e.preventDefault();
        pauseTimer();
    }
    
    // Escape to exit fullscreen
    if (e.key === 'Escape' && document.fullscreenElement) {
        toggleFullscreen();
    }
});

// Input field enter key handler
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startFocus();
    }
});

// ==========================================================================
// INITIALIZATION
// ==========================================================================

/**
 * Initialize the application
 */
window.addEventListener('load', () => {
    // Create animated background
    createBackgroundBubbles();
    
    // Focus on task input
    taskInput.focus();
    
    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            document.body.classList.remove('fullscreen');
            fullscreenBtn.innerHTML = '⛶';
        }
    });
});

// ==========================================================================
// PAGE VISIBILITY HANDLER
// ==========================================================================

/**
 * Handle page visibility changes
 * Optional: Pause timer when tab is hidden
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden && timerInterval && !isPaused) {
        // Uncomment the line below to auto-pause when tab is hidden
        // pauseTimer();
    }
});

// ==========================================================================
// CONTEXT MENU PREVENTION
// ==========================================================================

/**
 * Prevent right-click context menu on fullscreen button
 */
fullscreenBtn.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});