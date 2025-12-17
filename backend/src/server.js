
import express from 'express';
import dotenv from 'dotenv';
import router from './routes/index.js';
import dbConnection from './config/database.js';
import logger from './middlewares/logger.js';
import setupGlobalErrorHandlers from './middlewares/globalErrorHandler.js';
import errorHandler from './middlewares/errorHandler.js';
import cors from 'cors';

dotenv.config();

// Configurar manejadores globales ANTES de crear la app
setupGlobalErrorHandlers();

const app = express();
dbConnection();

// Middlewares en el orden correcto
app.use(express.json());
app.use(logger);
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('WELCOME!');
});

// Usar el router principal en /api
app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
  });
});

// El errorHandler debe ir AL FINAL, después de todas las rutas
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
