import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generarMenuSemanal = async (datosUsuario: {
  edad: number;
  objetivo: string;
  alergias: string;
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    Genera un menú saludable para 7 días en formato JSON.
    - Usuario: ${datosUsuario.edad} años, objetivo: ${datosUsuario.objetivo}.
    - Alergias: ${datosUsuario.alergias || 'ninguna'}.
    - Incluye desayuno, almuerzo, cena y snacks para cada día.
    - Asegúrate de que las comidas sean balanceadas y acordes al objetivo.
    - El formato debe ser:
    {
      "lunes": {
        "desayuno": "descripción",
        "almuerzo": "descripción",
        "cena": "descripción",
        "snacks": ["snack1", "snack2"]
      },
      // ... resto de los días
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Intentar parsear el JSON de la respuesta
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Error al parsear la respuesta de la IA:', error);
      throw new Error('Error al procesar la respuesta de la IA');
    }
  } catch (error) {
    console.error('Error al generar menú con IA:', error);
    throw error;
  }
}; 