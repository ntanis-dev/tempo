import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPool } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key';

export async function authenticateAdmin(username, password) {
  let conn;
  try {
    conn = await getPool().getConnection();

    // Query for admin
    const result = await conn.query(
      'SELECT id, username, password_hash FROM admins WHERE username = ?',
      [username]
    );

    if (result.length === 0) {
      console.log(`❌ Login attempt failed: User "${username}" not found`);
      return { success: false, error: 'Invalid credentials' };
    }

    const admin = result[0];
    console.log(`🔐 Login attempt for user: ${username}`);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      console.log(`❌ Login attempt failed: Invalid password for user "${username}"`);

      // In development, show if this is a hash mismatch issue
      if (process.env.NODE_ENV === 'development') {
        const testHash = await bcrypt.hash(password, 10);
        console.log('   Debug: Password would hash to:', testHash.substring(0, 20) + '...');
        console.log('   Debug: Expected hash starts:', admin.password_hash.substring(0, 20) + '...');
      }

      return { success: false, error: 'Invalid credentials' };
    }

    // Update last login
    await conn.query(
      'UPDATE admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Login successful for user: ${username}`);
    return { success: true, token, username: admin.username };
  } catch (err) {
    console.error('❌ Authentication error:', err);
    return { success: false, error: 'Authentication failed' };
  } finally {
    if (conn) conn.release();
  }
}

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}