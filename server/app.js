const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // behind Render's proxy

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(logger);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/internships', require('./routes/internshipRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Production: serve the built React app from this server (one URL, no CORS needed)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  // SPA fallback so deep links such as /internships/123 load the app; /api/* still 404s as JSON
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
