'use strict';
import express from 'express'
import 'dotenv/config'
import getConnection from './config/database.js'
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './jobs/cleanupJob.js';
import { seedDatabase } from './lib/seed.js';


const app = express()
const PORT = +process.env.PORT || 3000

//static files
app.use(express.static('public'))

app.use(cookieParser());

//config req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS
const origins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim());
app.use(cors({
  origin: origins,
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
    cartRoutes(app);
    productRoutes(app);

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