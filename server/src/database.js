import mariadb from 'mariadb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Create initial connection pool without database selection
const initialPool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  connectionLimit: 1,
  connectTimeout: 10000
});

// Main connection pool (will be initialized after database creation)
let pool;

// Initialize database and tables
export async function initializeDatabase() {
  let conn;
  try {
    conn = await initialPool.getConnection();

    // Create database if not exists
    await conn.query('CREATE DATABASE IF NOT EXISTS tempo');
    await conn.query('USE tempo');
    console.log('✅ Database "tempo" ready');

    // Create tables
    await createTables(conn);

    // Now create the main pool with database selected
    pool = mariadb.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'tempo',
      connectionLimit: 10,
      acquireTimeout: 30000,
      connectTimeout: 10000,
      dateStrings: true,
      trace: process.env.NODE_ENV === 'development'
    });

    // Start cleanup interval
    startCleanupInterval();

    console.log('✅ Database initialized successfully');
    return true;
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

async function createTables(conn) {
  // Users table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) UNIQUE NOT NULL,
      first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      total_workouts INT DEFAULT 0,
      total_time_exercised INT DEFAULT 0,
      total_sets_completed INT DEFAULT 0,
      user_agent TEXT,
      ip_address VARCHAR(45),
      INDEX idx_user_id (user_id),
      INDEX idx_last_seen (last_seen)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Workouts table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      workout_start TIMESTAMP NOT NULL,
      workout_end TIMESTAMP,
      total_sets INT NOT NULL,
      reps_per_set INT NOT NULL,
      time_stretched INT DEFAULT 0,
      time_exercised INT DEFAULT 0,
      time_rested INT DEFAULT 0,
      time_paused INT DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      INDEX idx_user_workouts (user_id, workout_start),
      INDEX idx_workout_date (workout_start)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Active sessions table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS active_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL UNIQUE,
      last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      INDEX idx_active_sessions (user_id, is_active),
      INDEX idx_last_ping (last_ping)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Dashboard admins table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Create additional indexes
  await conn.query('CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen DESC)');
  await conn.query('CREATE INDEX IF NOT EXISTS idx_workouts_created ON workouts(created_at DESC)');
  await conn.query('CREATE INDEX IF NOT EXISTS idx_sessions_active ON active_sessions(is_active, last_ping DESC)');

  console.log('✅ All tables created successfully');

  // Clean up duplicate active sessions and add unique constraint
  try {
    // First, remove all duplicates keeping only the most recent one
    await conn.query(`
      DELETE s1 FROM active_sessions s1
      LEFT JOIN (
        SELECT user_id, MAX(id) as max_id
        FROM active_sessions
        GROUP BY user_id
      ) s2 ON s1.user_id = s2.user_id AND s1.id = s2.max_id
      WHERE s2.max_id IS NULL
    `);
    console.log('✅ Cleaned up duplicate active sessions');

    // Try to add unique constraint if it doesn't exist
    await conn.query(`
      ALTER TABLE active_sessions
      ADD UNIQUE KEY unique_user_id (user_id)
    `);
    console.log('✅ Added unique constraint to active_sessions.user_id');
  } catch (err) {
    // Constraint might already exist, that's fine
    if (!err.message.includes('Duplicate key name')) {
      console.log('ℹ️  Active sessions constraint already exists or error:', err.message);
    }
  }
}

// Test database connection
export async function testConnection() {
  let conn;
  try {
    const currentPool = getPool();
    conn = await currentPool.getConnection();
    console.log('✅ Database connection test successful');
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

// Initialize admin user
export async function initializeAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.log('⚠️  Admin credentials not configured in .env');
    console.log('   Set ADMIN_USERNAME and ADMIN_PASSWORD in server/.env file');
    return;
  }

  let conn;
  try {
    conn = await getPool().getConnection();

    // Check if admin exists
    const existing = await conn.query(
      'SELECT id, username, password_hash FROM admins WHERE username = ?',
      [adminUsername]
    );

    if (existing.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await conn.query(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        [adminUsername, hashedPassword]
      );

      console.log(`✅ Admin user created: ${adminUsername}`);
    } else {
      // Update existing admin password if it has changed
      const existingAdmin = existing[0];
      const passwordMatch = await bcrypt.compare(adminPassword, existingAdmin.password_hash);

      if (!passwordMatch) {
        // Password in .env has changed, update it
        const newHashedPassword = await bcrypt.hash(adminPassword, 10);
        await conn.query(
          'UPDATE admins SET password_hash = ? WHERE id = ?',
          [newHashedPassword, existingAdmin.id]
        );
        console.log(`✅ Admin password updated for: ${adminUsername}`);
      } else {
        console.log(`ℹ️  Admin user already exists: ${adminUsername}`);
      }
    }
  } catch (err) {
    console.error('❌ Error initializing admin:', err.message);
    console.error('   Make sure MariaDB is running and accessible');
  } finally {
    if (conn) conn.release();
  }
}

// Cleanup inactive sessions
export async function cleanupInactiveSessions() {
  let conn;
  try {
    const currentPool = getPool();
    conn = await currentPool.getConnection();

    // Mark sessions as inactive if no ping for 5 minutes
    await conn.query(`
      UPDATE active_sessions
      SET is_active = FALSE
      WHERE last_ping < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      AND is_active = TRUE
    `);
  } catch (err) {
    // Silent fail - pool might not be initialized yet
    if (err.message && err.message.includes('not initialized')) {
      return;
    }
    console.error('Error cleaning up sessions:', err);
  } finally {
    if (conn) conn.release();
  }
}

// Start periodic cleanup (only after initialization)
let cleanupInterval = null;

function startCleanupInterval() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  cleanupInterval = setInterval(cleanupInactiveSessions, 60000); // Run every minute
}

// Export a getter for the pool
export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

export default { getPool };