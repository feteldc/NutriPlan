"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarMenuSemanal = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const generarMenuSemanal = async (datosUsuario) => {
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
        }
        catch (error) {
            console.error('Error al parsear la respuesta de la IA:', error);
            throw new Error('Error al procesar la respuesta de la IA');
        }
    }
    catch (error) {
        console.error('Error al generar menú con IA:', error);
        throw error;
    }
};
exports.generarMenuSemanal = generarMenuSemanal;
