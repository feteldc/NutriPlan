import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();
// Inicializar Firebase Admin
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};
// Verificar que todas las credenciales necesarias estén presentes
if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
    console.error('Faltan credenciales de Firebase. Por favor, verifica tu archivo .env');
    process.exit(1);
}
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase inicializado correctamente');
}
catch (error) {
    console.error('Error al inicializar Firebase:', error);
    process.exit(1);
}
export const db = admin.firestore();
