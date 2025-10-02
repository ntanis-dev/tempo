import express from 'express';
import { getPool } from '../database.js';
import { authenticateAdmin, verifyToken } from '../auth.js';
import { getLocationFromIP } from '../geoip.js';

const router = express.Router();

// Authentication endpoints
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const result = await authenticateAdmin(username, password);

  if (result.success) {
    res.json({
      token: result.token,
      username: result.username
    });
  } else {
    res.status(401).json({ error: result.error });
  }
});

router.get('/auth/verify', verifyToken, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

// Analytics tracking endpoints
router.post('/track/ping', async (req, res) => {
  const { userId, userAgent } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const location = getLocationFromIP(ipAddress);

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  let conn;
  try {
    conn = await getPool().getConnection();

    // Upsert user with location (IP address is not stored for privacy)
    await conn.query(
      `INSERT INTO users (user_id, user_agent, location)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       last_seen = NOW(),
       user_agent = VALUES(user_agent),
       location = VALUES(location)`,
      [userId, userAgent || 'Unknown', location]
    );

    // Update or create active session
    await conn.query(
      `INSERT INTO active_sessions (user_id, last_ping, is_active)
       VALUES (?, NOW(), TRUE)
       ON DUPLICATE KEY UPDATE
       last_ping = NOW(),
       is_active = TRUE`,
      [userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).json({ error: 'Tracking failed' });
  } finally {
    if (conn) conn.release();
  }
});

router.post('/track/workout', async (req, res) => {
  const {
    userId,
    workoutStart,
    workoutEnd,
    totalSets,
    repsPerSet,
    timeStretched,
    timeExercised,
    timeRested,
    timePaused,
    completed
  } = req.body;

  if (!userId || !workoutStart) {
    return res.status(400).json({ error: 'User ID and workout start required' });
  }

  let conn;
  try {
    conn = await getPool().getConnection();

    // Ensure user exists
    await conn.query(
      'INSERT IGNORE INTO users (user_id) VALUES (?)',
      [userId]
    );

    // Convert dates to MySQL format preserving local timezone
    // The client sends ISO strings which are already in UTC, so we need to parse them correctly
    const startDate = new Date(workoutStart);
    const endDate = workoutEnd ? new Date(workoutEnd) : null;

    // Format for MySQL DATETIME (in UTC to match the ISO input)
    const formatMySQLDateTime = (date) => {
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    const startDateStr = formatMySQLDateTime(startDate);
    const endDateStr = endDate ? formatMySQLDateTime(endDate) : null;

    // Insert workout
    await conn.query(
      `INSERT INTO workouts
       (user_id, workout_start, workout_end, total_sets, reps_per_set,
        time_stretched, time_exercised, time_rested, time_paused, completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, startDateStr, endDateStr, totalSets || 0, repsPerSet || 0,
       timeStretched || 0, timeExercised || 0, timeRested || 0, timePaused || 0, completed || false]
    );

    // Update user stats if workout completed
    if (completed) {
      // Calculate total workout time (excluding pause time)
      const totalWorkoutTime = (timeStretched || 0) + (timeExercised || 0) + (timeRested || 0);

      await conn.query(
        `UPDATE users
         SET total_workouts = total_workouts + 1,
             total_time_exercised = total_time_exercised + ?,
             total_sets_completed = total_sets_completed + ?
         WHERE user_id = ?`,
        [totalWorkoutTime, totalSets || 0, userId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Workout tracking error:', err);
    res.status(500).json({ error: 'Workout tracking failed' });
  } finally {
    if (conn) conn.release();
  }
});

// Dashboard data endpoints (protected)
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  let conn;
  try {
    conn = await getPool().getConnection();

    // Get overall stats
    const totalUsersResult = await conn.query('SELECT COUNT(*) as count FROM users');
    const totalWorkoutsResult = await conn.query('SELECT COUNT(*) as count FROM workouts WHERE completed = TRUE');
    const onlineUsersResult = await conn.query(
      'SELECT COUNT(DISTINCT user_id) as count FROM active_sessions WHERE is_active = TRUE'
    );

    const totalUsers = totalUsersResult[0] || { count: 0 };
    const totalWorkouts = totalWorkoutsResult[0] || { count: 0 };
    const onlineUsers = onlineUsersResult[0] || { count: 0 };

    // Get recent users with user agent and location
    const recentUsersRaw = await conn.query(`
      SELECT user_id, first_seen, last_seen, total_workouts, total_time_exercised,
             user_agent, location
      FROM users
      ORDER BY last_seen DESC
      LIMIT 10
    `);

    // Get recent workouts
    const recentWorkoutsRaw = await conn.query(`
      SELECT w.*, u.user_id as username
      FROM workouts w
      JOIN users u ON w.user_id = u.user_id
      WHERE w.completed = TRUE
      ORDER BY w.workout_end DESC
      LIMIT 20
    `);

    // Get active sessions - use DISTINCT to ensure no duplicates
    const activeSessionsRaw = await conn.query(`
      SELECT DISTINCT s.user_id, s.last_ping, s.session_start, s.is_active,
             u.total_workouts, u.first_seen
      FROM active_sessions s
      JOIN users u ON s.user_id = u.user_id
      WHERE s.is_active = TRUE
      GROUP BY s.user_id
      ORDER BY s.last_ping DESC
      LIMIT 50
    `);

    // Get hourly activity for the last 24 hours
    const hourlyActivityRaw = await conn.query(`
      SELECT
        DATE_FORMAT(workout_start, '%Y-%m-%d %H:00:00') as hour,
        COUNT(*) as workouts
      FROM workouts
      WHERE workout_start >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY hour
      ORDER BY hour DESC
    `);

    // Helper to convert MySQL DATETIME (stored as UTC) to ISO string
    const mysqlToISO = (mysqlDatetime) => {
      if (!mysqlDatetime) return null;
      // MySQL DATETIME format: "YYYY-MM-DD HH:MM:SS"
      // We stored UTC times, so append 'Z' to indicate UTC when parsing
      const isoStr = mysqlDatetime.replace(' ', 'T') + 'Z';
      return new Date(isoStr).toISOString();
    };

    // Convert BigInt values to numbers and dates to ISO strings in all arrays
    const recentUsers = recentUsersRaw.map(user => ({
      ...user,
      total_workouts: Number(user.total_workouts || 0),
      total_time_exercised: Number(user.total_time_exercised || 0),
      // Convert DATETIME to ISO string (MySQL stores as UTC)
      first_seen: mysqlToISO(user.first_seen),
      last_seen: mysqlToISO(user.last_seen)
    }));

    const recentWorkouts = recentWorkoutsRaw.map(workout => ({
      ...workout,
      total_sets: Number(workout.total_sets || 0),
      time_exercised: Number(workout.time_exercised || 0),
      time_rested: Number(workout.time_rested || 0),
      time_stretched: Number(workout.time_stretched || 0),
      // Convert DATETIME to ISO string (MySQL stores as UTC)
      workout_start: mysqlToISO(workout.workout_start),
      workout_end: mysqlToISO(workout.workout_end)
    }));

    const activeSessions = activeSessionsRaw.map(session => ({
      ...session,
      total_workouts: Number(session.total_workouts || 0),
      is_active: Boolean(session.is_active),
      // Convert DATETIME to ISO string (MySQL stores as UTC)
      last_ping: mysqlToISO(session.last_ping),
      session_start: mysqlToISO(session.session_start),
      first_seen: mysqlToISO(session.first_seen)
    }));

    const hourlyActivity = hourlyActivityRaw.map(activity => ({
      ...activity,
      workouts: Number(activity.workouts || 0)
    }));

    res.json({
      stats: {
        totalUsers: Number(totalUsers.count) || 0,
        totalWorkouts: Number(totalWorkouts.count) || 0,
        onlineUsers: Number(onlineUsers.count) || 0,
        avgWorkoutsPerUser: Number(totalUsers.count) > 0 ?
          (Number(totalWorkouts.count || 0) / Number(totalUsers.count)).toFixed(2) : 0
      },
      recentUsers,
      recentWorkouts,
      activeSessions,
      hourlyActivity
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/dashboard/user/:userId/workouts', verifyToken, async (req, res) => {
  const { userId } = req.params;

  let conn;
  try {
    conn = await getPool().getConnection();

    // Get user's workouts
    const workoutsResult = await conn.query(`
      SELECT * FROM workouts
      WHERE user_id = ? AND completed = TRUE
      ORDER BY workout_start DESC
      LIMIT 100
    `, [userId]);

    // Helper to convert MySQL DATETIME (stored as UTC) to ISO string
    const mysqlToISO = (mysqlDatetime) => {
      if (!mysqlDatetime) return null;
      // MySQL DATETIME format: "YYYY-MM-DD HH:MM:SS"
      // We stored UTC times, so append 'Z' to indicate UTC when parsing
      const isoStr = mysqlDatetime.replace(' ', 'T') + 'Z';
      return new Date(isoStr).toISOString();
    };

    // Convert BigInt values and dates to ISO strings
    const convertedWorkouts = workoutsResult.map(workout => ({
      ...workout,
      total_sets: Number(workout.total_sets || 0),
      reps_per_set: Number(workout.reps_per_set || 0),
      time_exercised: Number(workout.time_exercised || 0),
      time_rested: Number(workout.time_rested || 0),
      time_stretched: Number(workout.time_stretched || 0),
      // Convert DATETIME to ISO string (MySQL stores as UTC)
      workout_start: mysqlToISO(workout.workout_start),
      workout_end: mysqlToISO(workout.workout_end)
    }));

    res.json({ workouts: convertedWorkouts });
  } catch (err) {
    console.error('User workouts error:', err);
    res.status(500).json({ error: 'Failed to fetch user workouts' });
  } finally {
    if (conn) conn.release();
  }
});

router.get('/dashboard/user/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  let conn;
  try {
    conn = await getPool().getConnection();

    // Get user info
    const [user] = await conn.query(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's workouts
    const workouts = await conn.query(
      `SELECT * FROM workouts
       WHERE user_id = ?
       ORDER BY workout_start DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      user,
      workouts
    });
  } catch (err) {
    console.error('User detail error:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  } finally {
    if (conn) conn.release();
  }
});

export default router;