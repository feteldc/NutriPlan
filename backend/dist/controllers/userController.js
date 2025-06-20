import { db } from '../config/firebase.js';
import { generarMenuSemanal } from '../services/ai.js';
export const guardarUsuario = async (req, res) => {
    try {
        const { nombre, edad, peso, objetivo, alergias, nivelActividad, preferenciasDieteticas, horarioComida } = req.body;
        // Validar datos requeridos
        if (!nombre || !edad || !peso || !objetivo) {
            res.status(400).json({ error: 'Faltan campos requeridos' });
            return;
        }
        // Validar tipos de datos
        if (typeof edad !== 'number' || typeof peso !== 'number') {
            res.status(400).json({ error: 'Edad y peso deben ser números' });
            return;
        }
        // Crear documento de usuario
        const userRef = db.collection('usuarios').doc();
        await userRef.set({
            nombre,
            edad,
            peso,
            objetivo,
            alergias: alergias || '',
            nivelActividad: nivelActividad || 'moderado',
            preferenciasDieteticas: preferenciasDieteticas || [],
            horarioComida: horarioComida || 'normal',
            fechaCreacion: new Date()
        });
        res.status(201).json({
            mensaje: 'Usuario guardado exitosamente',
            userId: userRef.id
        });
    }
    catch (error) {
        console.error('Error al guardar usuario:', error);
        res.status(500).json({
            error: 'Error al guardar usuario',
            detalles: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
export const generarMenu = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'ID de usuario no proporcionado' });
            return;
        }
        const userDoc = await db.collection('usuarios').doc(userId).get();
        if (!userDoc.exists) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }
        // Acceder directamente a los datos
        const userData = userDoc.data();
        if (!userData) {
            res.status(400).json({ error: 'Datos de usuario incompletos' });
            return;
        }
        // Generar menú usando la IA
        const menu = await generarMenuSemanal({
            edad: userData.edad,
            objetivo: userData.objetivo,
            alergias: userData.alergias,
            nivelActividad: userData.nivelActividad,
            preferenciasDieteticas: userData.preferenciasDieteticas,
            horarioComida: userData.horarioComida
        });
        // Guardar el menú en Firestore
        await userDoc.ref.update({
            menu,
            fechaActualizacion: new Date()
        });
        res.json({ menu });
    }
    catch (error) {
        console.error('Error al generar menú:', error);
        res.status(500).json({
            error: 'Error al generar menú',
            detalles: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
