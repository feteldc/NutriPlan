import { db } from '../config/firebase.js';
import { generarMenuSemanal } from '../services/ai.js';
export const guardarUsuario = async (req, res) => {
    try {
        const { nombre, edad, peso, objetivo, alergias } = req.body;
        // Validar datos requeridos
        if (!nombre || !edad || !peso || !objetivo) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }
        // Crear documento de usuario
        const userRef = db.collection('usuarios').doc();
        await userRef.set({
            datos: {
                nombre,
                edad,
                peso,
                objetivo,
                alergias: alergias || '',
                fechaCreacion: new Date()
            }
        });
        res.status(201).json({
            mensaje: 'Usuario guardado exitosamente',
            userId: userRef.id
        });
    }
    catch (error) {
        console.error('Error al guardar usuario:', error);
        res.status(500).json({ error: 'Error al guardar usuario' });
    }
};
export const generarMenu = async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await db.collection('usuarios').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const userData = userDoc.data()?.datos;
        // Generar menú usando la IA
        const menu = await generarMenuSemanal({
            edad: userData.edad,
            objetivo: userData.objetivo,
            alergias: userData.alergias
        });
        // Guardar el menú en Firestore
        await userDoc.ref.update({
            menu
        });
        res.json({ menu });
    }
    catch (error) {
        console.error('Error al generar menú:', error);
        res.status(500).json({ error: 'Error al generar menú' });
    }
};
