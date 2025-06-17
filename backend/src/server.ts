import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import { requestLogger } from './middleware/logging';
import userRoutes from './routes/userRoutes';
import { User, UserMap } from './models/User';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(requestLogger);

// Almacenamiento temporal en memoria
export const usuarios: UserMap = {};

// Rutas
app.use('/api/users', userRoutes);

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Iniciar servidor local si no estamos en producción
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });
}

// Exportar la función de Cloud Functions
export const api = functions.https.onRequest(app); 