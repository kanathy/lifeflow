const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize DB connection
connectDB();

const app = express();

// Express middlewares
app.use(cors());
app.use(express.json());

// Base health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: process.env.USE_MOCK_DB === 'true' ? 'mock-in-memory' : 'mongodb',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  console.log(`\x1b[36m%s\x1b[0m`, `🔗 Healthcheck: http://localhost:${PORT}/api/health`);
});
