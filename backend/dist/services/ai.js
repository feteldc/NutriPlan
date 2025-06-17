import { GoogleGenerativeAI } from '@google/generative-ai';
// Verificación más detallada de la API Key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('Error: GEMINI_API_KEY no está configurada en las variables de entorno');
    console.error('Por favor, asegúrate de que el archivo .env existe y contiene GEMINI_API_KEY=tu_clave');
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
export const generarMenuSemanal = async (datosUsuario) => {
    try {
        console.log('Iniciando generación de menú con API Key:', apiKey ? 'Configurada' : 'No configurada');
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro'
        });
        const prompt = `
    Genera un menú saludable para 7 días en formato JSON.
    
    Requisitos específicos:
    - Usuario: ${datosUsuario.edad} años
    - Objetivo: ${datosUsuario.objetivo}
    - Alergias: ${datosUsuario.alergias || 'ninguna'}
    
    Instrucciones:
    1. Genera un menú balanceado y variado para cada día
    2. Incluye desayuno, almuerzo, cena y snacks
    3. Asegúrate de que las comidas sean acordes al objetivo del usuario
    4. Evita cualquier alimento que pueda causar alergias
    5. Incluye una variedad de proteínas, carbohidratos y grasas saludables
    6. Considera la edad del usuario para las porciones y tipos de alimentos
    
    El formato debe ser exactamente:
    {
      "lunes": {
        "desayuno": "descripción detallada",
        "almuerzo": "descripción detallada",
        "cena": "descripción detallada",
        "snacks": "descripción detallada"
      },
      "martes": {
        // ... mismo formato
      },
      // ... resto de los días
    }
    
    IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
    `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Intentar parsear el JSON de la respuesta
        try {
            const menu = JSON.parse(text);
            // Validar la estructura del menú
            const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
            const comidas = ['desayuno', 'almuerzo', 'cena', 'snacks'];
            for (const dia of dias) {
                if (!menu[dia])
                    throw new Error(`Falta el día ${dia}`);
                for (const comida of comidas) {
                    if (!menu[dia][comida])
                        throw new Error(`Falta ${comida} en ${dia}`);
                }
            }
            return menu;
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
