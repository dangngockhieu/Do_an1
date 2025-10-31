'use strict';
import express from 'express'
import 'dotenv/config'
import getConnection from './config/database.js'
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import './jobs/cleanupJob.js';
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

// connect database
getConnection();


// routes
authRoutes(app);
userRoutes(app);

// check
app.get('/', (req, res) => res.send('Server is running...'));

app.listen(PORT, () => {
    console.log(`Example app listening on PORT ${PORT}`)
})