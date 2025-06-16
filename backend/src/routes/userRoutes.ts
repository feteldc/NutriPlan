import { Router } from 'express';
import { guardarUsuario, generarMenu } from '../controllers/userController';

const router = Router();

router.post('/guardarUsuario', guardarUsuario);
router.post('/generarMenu/:userId', generarMenu);

export default router; 