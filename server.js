const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

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
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());

// Middleware to ensure DB connection on each request (MUST BE EARLY)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins for now since frontend can be anywhere
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
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
    "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; " +
    "img-src 'self' data: https: http:; " +
    "media-src 'self' https://cdn.pixabay.com; " +
    "connect-src 'self' https://vsware-project.vercel.app https://*.vercel.app"
  );
  
  next();
});

// Serve static files from frontend directory
app.use(express.static('frontend', {
  maxAge: '1h', // Cache other static files for 1 hour
  setHeaders: (res, path) => {
    // Don't cache HTML files
    if (path.endsWith('.html')) {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

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

// Page routes
app.get('/home', (req, res) => {
  res.sendFile(__dirname + '/frontend/index.html');
});

app.get('/selector', (req, res) => {
  res.sendFile(__dirname + '/frontend/school-selector.html');
});

app.get('/shannoncomp/login', (req, res) => {
  res.sendFile(__dirname + '/frontend/index.html');
});

app.get('/shannoncomp/enrolment', (req, res) => {
  res.sendFile(__dirname + '/frontend/enrolment.html');
});

// Admin portal route
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/frontend/admin-portal.html');
});

app.get('/admin/*', (req, res) => {
  res.sendFile(__dirname + '/frontend/admin-portal.html');
});

// Dashboard routes (all serve index.html for client-side routing)
app.get('/shannoncomp/*', (req, res) => {
  res.sendFile(__dirname + '/frontend/index.html');
});

// Root redirects to home
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Catch all 404 - serve landing page (this should be LAST)
app.all('*', (req, res) => {
  res.sendFile(__dirname + '/frontend/index.html');
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
