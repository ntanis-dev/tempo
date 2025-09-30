// Dashboard Application
const API_URL = window.location.origin + '/api';
let authToken = localStorage.getItem('dashboard_token');
let refreshInterval = null;

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Check auth on load
window.addEventListener('DOMContentLoaded', async () => {
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

  // Update active users table
  const activeUsersTable = document.getElementById('activeUsersTable');
  activeUsersTable.innerHTML = '';

  if (data.activeSessions && data.activeSessions.length > 0) {
    data.activeSessions.slice(0, 10).forEach(session => {
      const row = document.createElement('tr');
      row.className = 'text-sm text-gray-300';
      row.innerHTML = `
        <td class="py-2">
          <span class="font-mono text-xs text-gray-200">${truncateUserId(session.user_id)}</span>
        </td>
        <td class="py-2 text-gray-400">${getRelativeTime(session.last_ping)}</td>
        <td class="py-2">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
            ${session.total_workouts || 0}
          </span>
        </td>
      `;
      activeUsersTable.appendChild(row);
    });
  } else {
    activeUsersTable.innerHTML = '<tr><td colspan="3" class="text-center text-gray-500 py-4">No Active Users</td></tr>';
  }

  // Update recent workouts table
  const recentWorkoutsTable = document.getElementById('recentWorkoutsTable');
  recentWorkoutsTable.innerHTML = '';

  if (data.recentWorkouts && data.recentWorkouts.length > 0) {
    data.recentWorkouts.slice(0, 10).forEach(workout => {
      const row = document.createElement('tr');
      row.className = 'text-sm text-gray-300';
      const duration = workout.time_exercised + workout.time_rested + workout.time_stretched;
      row.innerHTML = `
        <td class="py-2">
          <span class="font-mono text-xs text-gray-200">${truncateUserId(workout.username)}</span>
        </td>
        <td class="py-2">${workout.total_sets}</td>
        <td class="py-2">${formatDuration(duration)}</td>
        <td class="py-2 text-gray-400">${getRelativeTime(workout.workout_end)}</td>
      `;
      recentWorkoutsTable.appendChild(row);
    });
  } else {
    recentWorkoutsTable.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500 py-4">No Recent Workouts</td></tr>';
  }

  // Update recent users table
  const recentUsersTable = document.getElementById('recentUsersTable');
  recentUsersTable.innerHTML = '';

  if (data.recentUsers && data.recentUsers.length > 0) {
    data.recentUsers.forEach(user => {
      const row = document.createElement('tr');
      row.className = 'text-sm text-gray-300';
      row.innerHTML = `
        <td class="py-3">
          <span class="font-mono text-xs text-gray-200">${truncateUserId(user.user_id)}</span>
        </td>
        <td class="py-3 text-gray-400 text-xs">${getDeviceInfo(user.user_agent)}</td>
        <td class="py-3 text-gray-400 text-xs">${user.ip_address || 'Unknown'}</td>
        <td class="py-3 text-gray-400">${formatDate(user.first_seen)}</td>
        <td class="py-3 text-gray-400">${getRelativeTime(user.last_seen)}</td>
        <td class="py-3">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">
            ${user.total_workouts || 0}
          </span>
        </td>
        <td class="py-3 text-gray-300">${formatDuration(user.total_time_exercised || 0)}</td>
      `;
      recentUsersTable.appendChild(row);
    });
  } else {
    recentUsersTable.innerHTML = '<tr><td colspan="7" class="text-center text-gray-500 py-4">No Users Yet</td></tr>';
  }
}

// Utility functions
function truncateUserId(userId) {
  if (!userId) return 'Unknown';
  return userId; // Show full user ID without truncation
}

function formatDuration(seconds) {
  if (!seconds) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
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

  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // Difference in seconds

  if (diff < 60) return 'Just Now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return formatDate(dateString);
}

function getDeviceInfo(userAgent) {
  if (!userAgent || userAgent === 'Unknown') return 'Unknown';

  // Detect mobile devices
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/Windows Phone/i.test(userAgent)) return 'Windows Phone';

  // Detect desktop browsers
  if (/Edg/i.test(userAgent)) return 'Edge';
  if (/Chrome/i.test(userAgent)) return 'Chrome';
  if (/Firefox/i.test(userAgent)) return 'Firefox';
  if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'Safari';
  if (/Opera|OPR/i.test(userAgent)) return 'Opera';

  // Detect OS
  if (/Windows/i.test(userAgent)) return 'Windows';
  if (/Mac/i.test(userAgent)) return 'macOS';
  if (/Linux/i.test(userAgent)) return 'Linux';

  return 'Other';
}