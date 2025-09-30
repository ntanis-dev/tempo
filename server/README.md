# Tempo Dashboard Server

Analytics dashboard for tracking Tempo workout app usage.

## Features

- Real-time user tracking
- Workout statistics and history
- Online user monitoring
- Password-protected admin dashboard
- MariaDB database for data persistence

## Setup Instructions

### 1. Install MariaDB

Download and install MariaDB from: https://mariadb.org/download/

### 2. Configure Environment

```bash
# Copy the example env file
cp server/.env.example server/.env

# Edit .env with your settings:
# - Update DB_PASSWORD with your MariaDB password
# - Set ADMIN_USERNAME and ADMIN_PASSWORD for dashboard login
# - Generate a strong JWT_SECRET (use: openssl rand -hex 32)
```

### 3. Install Dependencies

```bash
cd server
npm install
```

### 4. Build Frontend (for production)

```bash
# Build the React app
cd server
npm run build
```

### 5. Start the Server

```bash
# Production mode (serves both app and dashboard)
npm start

# Build and start in one command
npm run build:start

# Development mode (with auto-reload)
npm run dev
```

The server will:
- Automatically create the 'tempo' database if it doesn't exist
- Create all required tables on first run
- Initialize the admin user from your .env settings
- Serve the Tempo app at http://localhost:3001
- Serve the Dashboard at http://localhost:3001/dashboard

## Accessing the Dashboard

1. Navigate to http://localhost:3001/dashboard
2. Login with the credentials you set in .env
3. View real-time analytics and user statistics

## API Endpoints

### Public Endpoints (for tracking)
- `POST /api/track/ping` - Track user activity
- `POST /api/track/workout` - Track workout completion

### Protected Endpoints (require auth)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify auth token
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/user/:userId` - Get user details

## Development Notes

### Running Frontend and Backend Separately

For development with hot reload:

1. Run the backend server:
```bash
cd server
npm run dev
```

2. In another terminal, run the frontend:
```bash
npm run dev
```

The Vite dev server (frontend) will proxy API calls to the backend server.

## Production Deployment

1. Set NODE_ENV=production in .env
2. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server/src/index.js --name tempo-dashboard
pm2 save
pm2 startup
```

3. Configure a reverse proxy (nginx/Apache) to serve the dashboard

## Security Notes

- Always use strong passwords
- Generate a unique JWT_SECRET
- Use HTTPS in production
- Regularly backup your database
- Monitor server logs for suspicious activity

## Database Maintenance

```sql
-- View active sessions
SELECT * FROM active_sessions WHERE is_active = TRUE;

-- Clean old sessions
DELETE FROM active_sessions WHERE last_ping < DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Get user statistics
SELECT user_id, total_workouts, total_time_exercised
FROM users
ORDER BY total_workouts DESC
LIMIT 10;
```