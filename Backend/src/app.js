'use strict';
import express from 'express'
import 'dotenv/config'
import getConnection from './config/database.js'
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import './jobs/cleanupJob.js';
import { seedDatabase } from './lib/seed.js';

const app = express()
const PORT = +process.env.PORT || 3000

//static files
app.use(express.static('public'))

//config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(','),
  credentials: true,
}));

const startServer = async () => {
  try {
    // connect database
    await getConnection();

    // seed database
    await seedDatabase();
    // routes
    authRoutes(app);
    userRoutes(app);

    // test route
    app.get('/', (req, res) => res.send('Server is running...'));

    // listen
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();