import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors'; // Import cors

import dotenv from 'dotenv';

dotenv.config();

// Create Express app
const app = express();

// Define the port (use environment variable or default to 3000)
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Add CORS middleware
app.use(cors({
  origin: '*', // Allow all origins (you can specify specific origins if needed)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
import indexRoutes from './routes';
app.use('/', indexRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Server is shutting down...');
  process.exit(0);
});