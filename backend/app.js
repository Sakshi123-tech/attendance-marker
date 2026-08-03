const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const faceRoutes = require('./routes/faceRoutes');
const kioskRoutes = require('./routes/kioskRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const systemLogRoutes = require('./routes/systemLogRoutes');
const { globalLimiter } = require('./middleware/rateLimiter');
const { globalErrorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// 1. Enable Security Headers via Helmet
app.use(helmet());

// 2. Configure Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Allow signed cookies to be transmitted
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-kiosk-id', 'x-kiosk-secret']
  })
);

// 3. HTTP Request Logging in Development Mode
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// 4. Parse incoming JSON payloads with body limits
app.use(express.json({ limit: '50mb' }));

// 5. Parse urlencoded form payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 6. Parse Signed Cookie Headers
app.use(cookieParser(process.env.COOKIE_SECRET || 'super_secret_cookie_parser_key_12345'));

// 7. Apply Global Rate Limiting to prevent DoS attacks
app.use('/api', globalLimiter);

// 8. Mount Modular Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/face', faceRoutes);
app.use('/api/v1/kiosks', kioskRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/system-logs', systemLogRoutes);

// 9. Catch Undefined Endpoints (404 Not Found)
app.use(notFound);

// 10. Centralized Global Error Catcher Pipeline
app.use(globalErrorHandler);

module.exports = app;
