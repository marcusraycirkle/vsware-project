const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// MongoDB connection caching for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }

  if (mongoose.connection.readyState === 1) {
    cachedDb = mongoose.connection;
    return cachedDb;
  }

  // Check if MongoDB URI is set
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set - database connection will be skipped');
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedDb = mongoose.connection;
  console.log('✅ MongoDB connected successfully');
  return cachedDb;
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const classRoutes = require('./routes/classes');
const timetableRoutes = require('./routes/timetable');
const attendanceRoutes = require('./routes/attendance');
const behaviorRoutes = require('./routes/behavior');
const assessmentRoutes = require('./routes/assessments');
const messageRoutes = require('./routes/messages');
const reportRoutes = require('./routes/reports');
const paymentRoutes = require('./routes/payments');
const roomRoutes = require('./routes/rooms');
const enrollmentRoutes = require('./routes/enrollments');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();

// Only use HTTP server with Socket.IO in development
let server, io;
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  server = http.createServer(app);
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });
  
  // Socket.IO connection
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  // Make io accessible to routes
  app.set('io', io);
} else {
  server = app;
}

// Middleware
app.use(helmet());

// CORS configuration for production - MUST be early
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for loading screen - MUST be before static middleware
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'loading.html'));
});

// Serve static files FIRST (before any middleware that could fail)
app.use(express.static(path.join(__dirname, 'frontend'), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Add cache control and security headers
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  
  // Set Content Security Policy
  res.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "script-src-attr 'none'; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
    "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; " +
    "img-src 'self' data: https: http:; " +
    "media-src 'self' https://cdn.pixabay.com; " +
    "connect-src 'self' https://vsware-project.vercel.app https://*.vercel.app http://localhost:5000"
  );
  
  next();
});

// Middleware to ensure DB connection on each request (AFTER static files)
app.use(async (req, res, next) => {
  // Skip DB connection for health check and certain paths
  if (req.path === '/api/health' || req.path === '/' || req.path === '/home' || req.path === '/selector') {
    return next();
  }
  
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    // Allow next middleware to handle
    next();
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/behavior', behaviorRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SchoolWare API is running', dbState: mongoose.connection.readyState });
});

// Page routes - serve HTML files from frontend directory
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/selector', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'school-selector.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/shannoncomp/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/shannoncomp/enrolment', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'enrolment.html'));
});

// Role-based dashboard routes
app.get('/shannoncomp/teacher/:page', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/shannoncomp/parents/:page', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'parent-portal.html'));
});

app.get('/shannoncomp/student/:page', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'student-portal.html'));
});

app.get('/admin/:page', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin-portal.html'));
});

app.get('/secretary/:page', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'secretary-portal.html'));
});

// Dashboard routes (all serve index.html for client-side routing)
app.get('/shannoncomp/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Catch all 404 - serve landing page (this should be LAST)
app.all('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    server.listen(PORT, () => {
      console.log(`🚀 SchoolWare server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
}

// Export for Vercel serverless
module.exports = app;
