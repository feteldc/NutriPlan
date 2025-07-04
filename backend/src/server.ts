import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRoutes } from './routes/userRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'https://nutri-plan-frontend.vercel.app', // dominio de Vercel
  'http://localhost:5173' // desarrollo local
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de NutriPlan funcionando correctamente' });
});

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 