import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve dashboard static files
router.use(express.static(path.join(__dirname, '../../../public/dashboard')));

// Dashboard index route
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/dashboard/index.html'));
});

export default router;