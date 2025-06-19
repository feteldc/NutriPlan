import { Router } from 'express';
import { guardarUsuario, generarMenu } from '../controllers/userController.js';
const router = Router();
router.post('/guardarUsuario', guardarUsuario);
router.post('/generarMenu/:userId', generarMenu);
export { router as userRoutes };
