import express from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';
import userRoutes from './routes/userRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

// Exportar la función de Cloud Functions
export const api = functions.https.onRequest(app); 