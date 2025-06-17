import express from 'express';
import { guardarUsuario, generarMenu } from '../controllers/userController.js';
const router = express.Router();
router.post('/guardarUsuario', guardarUsuario);
router.post('/generarMenu/:userId', generarMenu);
export default router;
