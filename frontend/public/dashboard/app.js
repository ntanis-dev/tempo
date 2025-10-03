// Dashboard Application
const API_URL = window.location.origin + '/api';
let authToken = localStorage.getItem('dashboard_token');
let refreshInterval = null;

// Pagination state
let usersPage = 1;
let workoutsPage = 1;
let modalPage = 1;
let currentModalUserId = null;
const ITEMS_PER_PAGE = 10;

// Cache for dashboard data
let cachedData = null;
let cachedUserWorkouts = {};

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Modal elements - will be initialized after DOM load
let userWorkoutsModal = null;
let modalUserId = null;
let closeModalBtn = null;
let modalWorkoutsTable = null;

// Pagination elements
const usersPrevBtn = document.getElementById('usersPrevBtn');
const usersNextBtn = document.getElementById('usersNextBtn');
const workoutsPrevBtn = document.getElementById('workoutsPrevBtn');
const workoutsNextBtn = document.getElementById('workoutsNextBtn');
const modalPrevBtn = document.getElementById('modalPrevBtn');
const modalNextBtn = document.getElementById('modalNextBtn');

// Check auth on load
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize modal elements after DOM is ready
  userWorkoutsModal = document.getElementById('userWorkoutsModal');
  modalUserId = document.getElementById('modalUserId');
  closeModalBtn = document.getElementById('closeModalBtn');
  modalWorkoutsTable = document.getElementById('modalWorkoutsTable');

  // Setup modal event listeners
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => closeModal());
  }
  if (userWorkoutsModal) {
    userWorkoutsModal.addEventListener('click', (e) => {
      if (e.target === userWorkoutsModal) {
        closeModal();
      }
    });
  }

  if (authToken) {
    const isValid = await verifyToken();
    if (isValid) {
      showDashboard();
    } else {
      showLogin();
    }
  } else {
    showLogin();
  }
});

// Login form handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('dashboard_token', authToken);
      showDashboard();
    } else {
      loginError.textContent = data.error || 'Login failed';
      loginError.classList.remove('hidden');
    }
  } catch (error) {
    loginError.textContent = 'Connection error. Please try again.';
    loginError.classList.remove('hidden');
  }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('dashboard_token');
  authToken = null;
  showLogin();
});

// Modal handlers are now initialized in DOMContentLoaded

// Pagination handlers
if (usersPrevBtn) {
  usersPrevBtn.addEventListener('click', () => {
    if (usersPage > 1) {
      usersPage--;
      renderUsers();
    }
  });
}

if (usersNextBtn) {
  usersNextBtn.addEventListener('click', () => {
    if (cachedData && cachedData.recentUsers) {
      const totalPages = Math.ceil(cachedData.recentUsers.length / ITEMS_PER_PAGE);
      if (usersPage < totalPages) {
        usersPage++;
        renderUsers();
      }
    }
  });
}

if (workoutsPrevBtn) {
  workoutsPrevBtn.addEventListener('click', () => {
    if (workoutsPage > 1) {
      workoutsPage--;
      renderWorkouts();
    }
  });
}

if (workoutsNextBtn) {
  workoutsNextBtn.addEventListener('click', () => {
    if (cachedData && cachedData.recentWorkouts) {
      const totalPages = Math.ceil(cachedData.recentWorkouts.length / ITEMS_PER_PAGE);
      if (workoutsPage < totalPages) {
        workoutsPage++;
        renderWorkouts();
      }
    }
  });
}

if (modalPrevBtn) {
  modalPrevBtn.addEventListener('click', () => {
    if (modalPage > 1) {
      modalPage--;
      renderModalWorkouts();
    }
  });
}

if (modalNextBtn) {
  modalNextBtn.addEventListener('click', () => {
    const workouts = cachedUserWorkouts[currentModalUserId];
    if (workouts) {
      const totalPages = Math.ceil(workouts.length / ITEMS_PER_PAGE);
      if (modalPage < totalPages) {
        modalPage++;
        renderModalWorkouts();
      }
    }
  });
}

// Verify token
async function verifyToken() {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Show login screen
function showLogin() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  dashboardContainer.classList.add('hidden');
  dashboardContainer.classList.remove('visible');
  loginContainer.classList.remove('hidden');
  // Add visible class after a small delay to trigger fade-in
  setTimeout(() => loginContainer.classList.add('visible'), 10);
  loginError.classList.add('hidden');
  loginForm.reset();
}

// Show dashboard
function showDashboard() {
  loginContainer.classList.add('hidden');
  loginContainer.classList.remove('visible');
  dashboardContainer.classList.remove('hidden');
  // Add visible class after a small delay to trigger fade-in
  setTimeout(() => dashboardContainer.classList.add('visible'), 10);

  // Load initial data
  loadDashboardData();

  // Refresh every 30 seconds
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  refreshInterval = setInterval(loadDashboardData, 30000);
}

// Load dashboard data
async function loadDashboardData() {
  try {
    const response = await fetch(`${API_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        showLogin();
      }
      return;
    }

    const data = await response.json();
    cachedData = data;
    updateDashboard(data);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
}

// Update dashboard UI
function updateDashboard(data) {
  // Update stats
  document.getElementById('totalUsers').textContent = data.stats.totalUsers || '0';
  document.getElementById('onlineUsers').textContent = data.stats.onlineUsers || '0';
  document.getElementById('totalWorkouts').textContent = data.stats.totalWorkouts || '0';
  document.getElementById('avgWorkouts').textContent = data.stats.avgWorkoutsPerUser || '0';

  // Sort users by last_seen (most recent first)
  if (data.recentUsers) {
    data.recentUsers.sort((a, b) => {
      // Handle "Just Now" cases
      const aTime = new Date(a.last_seen).getTime();
      const bTime = new Date(b.last_seen).getTime();
      return bTime - aTime; // Most recent first
    });
  }

  // Render paginated data
  renderUsers();
  renderWorkouts();
}

// Render paginated users
function renderUsers() {
  if (!cachedData || !cachedData.recentUsers) return;

  const users = cachedData.recentUsers;
  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const startIndex = (usersPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, users.length);
  const pageUsers = users.slice(startIndex, endIndex);

  const recentUsersTable = document.getElementById('recentUsersTable');
  recentUsersTable.innerHTML = '';

  if (pageUsers.length > 0) {
    pageUsers.forEach(user => {
      const row = document.createElement('tr');
      row.className = 'text-sm text-gray-300';
      const relativeTime = getRelativeTime(user.last_seen);
      const isJustNow = relativeTime === 'Just Now';

      row.innerHTML = `
        <td class="py-3">
          <span class="font-mono text-xs text-gray-200">${truncateUserId(user.user_id)}</span>
        </td>
        <td class="py-3 text-gray-400 text-xs">${getDeviceInfo(user.user_agent)}</td>
        <td class="py-3 text-gray-400 text-xs">${user.location || 'Unknown'}</td>
        <td class="py-3 text-gray-400">${formatDate(user.first_seen)}</td>
        <td class="py-3 text-gray-400">
          <div class="flex items-center space-x-2">
            ${isJustNow ? '<div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>' : ''}
            <span>${relativeTime}</span>
          </div>
        </td>
        <td class="py-3">
          <button onclick="showUserWorkouts('${user.user_id}')" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors cursor-pointer">
            ${user.total_workouts || 0}
          </button>
        </td>
        <td class="py-3 text-gray-300">${formatDuration(user.total_time_exercised || 0)}</td>
      `;
      recentUsersTable.appendChild(row);
    });

    // Show pagination info
    const paginationDiv = document.getElementById('usersPagination');
    if (users.length > 0 && totalPages > 1) {
      paginationDiv.classList.remove('hidden');
      document.getElementById('usersCurrentPage').textContent = usersPage;
      document.getElementById('usersTotalPages').textContent = totalPages;

      // Enable/disable buttons
      usersPrevBtn.disabled = usersPage === 1;
      usersNextBtn.disabled = usersPage >= totalPages;
    } else {
      paginationDiv.classList.add('hidden');
    }
  } else {
    recentUsersTable.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-4">No Users Yet</td></tr>';
  }
}

// Render paginated workouts
function renderWorkouts() {
  if (!cachedData || !cachedData.recentWorkouts) return;

  const workouts = cachedData.recentWorkouts;
  const totalPages = Math.ceil(workouts.length / ITEMS_PER_PAGE);
  const startIndex = (workoutsPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, workouts.length);
  const pageWorkouts = workouts.slice(startIndex, endIndex);

  const recentWorkoutsTable = document.getElementById('recentWorkoutsTable');
  recentWorkoutsTable.innerHTML = '';

  if (pageWorkouts.length > 0) {
    pageWorkouts.forEach(workout => {
      const row = document.createElement('tr');
      row.className = 'text-sm text-gray-300';
      const total = workout.time_exercised + workout.time_rested + workout.time_stretched;
      row.innerHTML = `
        <td class="py-2">
          <button onclick="showUserWorkouts('${workout.username}')" class="font-mono text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors cursor-pointer">
            ${truncateUserId(workout.username)}
          </button>
        </td>
        <td class="py-2">${workout.total_sets}</td>
        <td class="py-2">${workout.reps_per_set || 0}</td>
        <td class="py-2">${formatDuration(workout.time_exercised)}</td>
        <td class="py-2">${formatDuration(workout.time_rested)}</td>
        <td class="py-2">${formatDuration(workout.time_stretched)}</td>
        <td class="py-2 font-semibold">${formatDuration(total)}</td>
        <td class="py-2 text-gray-400">${getRelativeTime(workout.workout_end)}</td>
      `;
      recentWorkoutsTable.appendChild(row);
    });

    // Show pagination info
    const paginationDiv = document.getElementById('workoutsPagination');
    if (workouts.length > 0 && totalPages > 1) {
      paginationDiv.classList.remove('hidden');
      document.getElementById('workoutsCurrentPage').textContent = workoutsPage;
      document.getElementById('workoutsTotalPages').textContent = totalPages;

      // Enable/disable buttons
      workoutsPrevBtn.disabled = workoutsPage === 1;
      workoutsNextBtn.disabled = workoutsPage >= totalPages;
    } else {
      paginationDiv.classList.add('hidden');
    }
  } else {
    recentWorkoutsTable.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-4">No Recent Workouts</td></tr>';
  }
}

// Show user workouts modal
async function showUserWorkouts(userId) {
  currentModalUserId = userId;
  modalPage = 1;
  modalUserId.textContent = userId;

  // Load user workouts if not cached
  if (!cachedUserWorkouts[userId]) {
    await loadUserWorkouts(userId);
  }

  // Render content COMPLETELY first while modal is still hidden
  renderModalWorkouts();

  // Wait a tiny bit to ensure rendering is done, then show
  setTimeout(() => {
    userWorkoutsModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      userWorkoutsModal.classList.remove('opacity-0');
    });
  }, 10);
}

// Load user workouts
async function loadUserWorkouts(userId) {
  try {
    const response = await fetch(`${API_URL}/dashboard/user/${encodeURIComponent(userId)}/workouts`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      cachedUserWorkouts[userId] = data.workouts || [];
    } else {
      // Set empty array on error to prevent undefined
      cachedUserWorkouts[userId] = [];
    }
  } catch (error) {
    console.error('Failed to load user workouts:', error);
    // Set empty array on error to prevent undefined
    cachedUserWorkouts[userId] = [];
  }
}

// Helper function to format date and time together
function formatDateAndTime(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `${dateStr} at ${timeStr}`;
}

// Render modal workouts
function renderModalWorkouts() {
  const workouts = cachedUserWorkouts[currentModalUserId] || [];

  const totalPages = Math.ceil(workouts.length / ITEMS_PER_PAGE);
  const startIndex = (modalPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, workouts.length);
  const pageWorkouts = workouts.slice(startIndex, endIndex);

  // Build ALL content as HTML string first, then insert once
  let tableHTML = '';

  if (pageWorkouts.length > 0) {
    pageWorkouts.forEach(workout => {
      const total = workout.time_exercised + workout.time_rested + workout.time_stretched;
      tableHTML += `
        <tr class="text-sm text-gray-300">
          <td class="py-2">${workout.total_sets}</td>
          <td class="py-2">${workout.reps_per_set}</td>
          <td class="py-2">${formatDuration(workout.time_exercised)}</td>
          <td class="py-2">${formatDuration(workout.time_rested)}</td>
          <td class="py-2">${formatDuration(workout.time_stretched)}</td>
          <td class="py-2 font-semibold">${formatDuration(total)}</td>
          <td class="py-2">${formatDateAndTime(workout.workout_start)}</td>
        </tr>
      `;
    });
  } else {
    tableHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-4">No Workouts</td></tr>';
  }

  // Update DOM once with complete content
  modalWorkoutsTable.innerHTML = tableHTML;

  // Show pagination info
  const paginationDiv = document.getElementById('modalPagination');
  if (pageWorkouts.length > 0 && workouts.length > 0 && totalPages > 1) {
    paginationDiv.classList.remove('hidden');
    document.getElementById('modalCurrentPage').textContent = modalPage;
    document.getElementById('modalTotalPages').textContent = totalPages;

    // Enable/disable buttons
    modalPrevBtn.disabled = modalPage === 1;
    modalNextBtn.disabled = modalPage >= totalPages;
  } else {
    paginationDiv.classList.add('hidden');
  }
}

// Close modal
function closeModal() {
  userWorkoutsModal.classList.add('opacity-0');
  setTimeout(() => {
    userWorkoutsModal.classList.add('hidden');
  }, 200);
  currentModalUserId = null;
}

// Make showUserWorkouts globally available
window.showUserWorkouts = showUserWorkouts;

// Utility functions
function truncateUserId(userId) {
  if (!userId) return 'Unknown';
  return userId; // Show full user ID without truncation
}

function formatDuration(seconds, showApprox = false) {
  if (!seconds) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);

  let result = '';
  let isApprox = false;

  if (hours > 0) {
    result = `${hours}h`;
    if (minutes > 0) {
      result += ` ${minutes}m`;
    }
    // If we have hours and are hiding seconds, it's approximate
    if (secs > 0) isApprox = true;
  } else if (minutes > 0) {
    result = `${minutes}m`;
    if (secs > 0) {
      result += ` ${secs}s`;
    }
  } else {
    result = `${secs}s`;
  }

  // Add approximation symbol if requested and value is approximate
  if (showApprox && isApprox) {
    result = '~' + result;
  }

  return result;
}

function formatDate(dateString) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getRelativeTime(dateString) {
  if (!dateString) return 'Never';

  // Parse the date string - it comes from server as ISO string
  const date = new Date(dateString);
  const now = new Date();

  // Ensure both dates are in the same timezone context
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // Difference in seconds

  // Handle negative differences (future dates)
  if (diff < 0) return 'Just Now';
  if (diff < 60) return 'Just Now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return formatDate(dateString);
}

function getDeviceInfo(userAgent) {
  if (!userAgent || userAgent === 'Unknown') return 'Unknown';

  let os = '';
  let browser = '';
  let device = '';

  // Detect OS and device type
  if (/iPhone/i.test(userAgent)) {
    device = 'iPhone';
    os = 'iOS';
  } else if (/iPad/i.test(userAgent)) {
    device = 'iPad';
    os = 'iOS';
  } else if (/iPod/i.test(userAgent)) {
    device = 'iPod';
    os = 'iOS';
  } else if (/Android/i.test(userAgent)) {
    os = 'Android';
    device = /Mobile/i.test(userAgent) ? 'Phone' : 'Tablet';
  } else if (/Windows Phone/i.test(userAgent)) {
    os = 'Windows Phone';
    device = 'Phone';
  } else if (/Windows NT 10/i.test(userAgent)) {
    os = 'Win 10/11';
    device = 'Desktop';
  } else if (/Windows/i.test(userAgent)) {
    os = 'Windows';
    device = 'Desktop';
  } else if (/Mac OS X/i.test(userAgent)) {
    os = 'macOS';
    device = 'Desktop';
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux';
    device = 'Desktop';
  } else if (/CrOS/i.test(userAgent)) {
    os = 'ChromeOS';
    device = 'Desktop';
  }

  // Detect browser
  if (/Edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Opera|OPR/i.test(userAgent)) {
    browser = 'Opera';
  }

  // Format the output
  if (device === 'Desktop' && browser && os) {
    return `${browser} / ${os}`;
  } else if (device && os) {
    return `${os} ${device}`;
  } else if (os && browser) {
    return `${browser} / ${os}`;
  } else if (os) {
    return os;
  } else if (browser) {
    return browser;
  }

  return 'Unknown';
}