import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
// Cache para almacenar menús generados
const menuCache = new Map();
// Función para normalizar nombres de días
const normalizarDia = (dia) => {
    const normalizaciones = {
        'miercoles': 'miércoles',
        'sabado': 'sábado'
    };
    return normalizaciones[dia] || dia;
};
const validarFormatoMenu = (menu) => {
    const diasEsperados = ['lunes', 'martes', 'miercoles', 'miércoles', 'jueves', 'viernes', 'sabado', 'sábado', 'domingo'];
    try {
        // Verificar que tengamos al menos 7 días
        const diasEncontrados = Object.keys(menu);
        if (diasEncontrados.length < 7) {
            console.error(`Solo se encontraron ${diasEncontrados.length} días:`, diasEncontrados);
            return false;
        }
        // Verificar que tengamos los días básicos (con o sin acentos)
        const diasBasicos = ['lunes', 'martes', 'jueves', 'viernes', 'domingo'];
        for (const dia of diasBasicos) {
            if (!diasEncontrados.includes(dia)) {
                console.error(`Falta el día: ${dia}`);
                return false;
            }
        }
        // Verificar que tengamos al menos una versión de miércoles y sábado
        const tieneMiercoles = diasEncontrados.includes('miercoles') || diasEncontrados.includes('miércoles');
        const tieneSabado = diasEncontrados.includes('sabado') || diasEncontrados.includes('sábado');
        if (!tieneMiercoles) {
            console.error('Falta miércoles/miercoles');
            return false;
        }
        if (!tieneSabado) {
            console.error('Falta sábado/sabado');
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('Error en validación:', error);
        return false;
    }
};
export const generarMenuSemanal = async (datosUsuario) => {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'TU_API_KEY_DE_GEMINI') {
        console.error('Error: La clave de API de Gemini no está configurada en el servidor.');
        throw new Error('El servicio de IA no está configurado. Por favor, contacta al administrador.');
    }
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const cacheKey = `${datosUsuario.edad}-${datosUsuario.objetivo}-${datosUsuario.alergias}`;
        if (menuCache.has(cacheKey)) {
            console.log('Retornando menú desde caché');
            return menuCache.get(cacheKey);
        }
        console.log('Generando nuevo menú con IA...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        // Prompt optimizado para incluir toda la información personalizada
        const prompt = `Genera un menú semanal personalizado en formato JSON para una persona de ${datosUsuario.edad} años con objetivo de ${datosUsuario.objetivo}.

Información adicional:
- Nivel de actividad: ${datosUsuario.nivelActividad || 'moderado'}
- Preferencias dietéticas: ${datosUsuario.preferenciasDieteticas?.join(', ') || 'ninguna'}
- Horario de comida: ${datosUsuario.horarioComida || 'normal'}
- Alergias: ${datosUsuario.alergias || 'ninguna'}

Formato requerido:
{
  "lunes": {
    "d": "Desayuno detallado",
    "a": "Almuerzo detallado", 
    "c": "Cena detallada",
    "s": ["Snack 1", "Snack 2"]
  },
  "martes": { ... },
  "miércoles": { ... },
  "jueves": { ... },
  "viernes": { ... },
  "sábado": { ... },
  "domingo": { ... }
}

Considera las preferencias dietéticas y alergias al generar las comidas. Incluye snacks saludables apropiados para el objetivo.`;
        console.log('Enviando prompt a la API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Respuesta recibida de la API');
        try {
            // Limpiar la respuesta para extraer solo el JSON
            let jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            // Buscar el inicio y fin del JSON válido
            const jsonStart = jsonText.indexOf('{');
            const jsonEnd = jsonText.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
                jsonText = jsonText.substring(jsonStart, jsonEnd);
            }
            const menu = JSON.parse(jsonText);
            // Normalizar las claves del menú
            const menuNormalizado = Object.entries(menu).reduce((acc, [dia, comidas]) => {
                // Generar snacks automáticamente si no los hay
                let snacks = '';
                if (Array.isArray(comidas.s) && comidas.s.length > 0) {
                    snacks = comidas.s.join(', ');
                }
                else if (comidas.snacks && comidas.snacks.trim() !== '') {
                    snacks = comidas.snacks;
                }
                else {
                    // Snacks por defecto según el objetivo
                    const snacksPorObjetivo = {
                        'perder peso': [
                            'Fruta fresca (manzana, pera, naranja)',
                            'Yogur griego bajo en grasa',
                            'Vegetales crudos (zanahoria, apio, pepino)',
                            'Té verde sin azúcar',
                            'Un puñado de almendras (10-12 unidades)',
                            'Agua con limón',
                            'Gelatina sin azúcar'
                        ],
                        'mantener': [
                            'Fruta fresca variada',
                            'Yogur griego con miel',
                            'Un puñado de frutos secos mixtos',
                            'Queso fresco bajo en grasa',
                            'Batido de proteína con agua',
                            'Té verde o infusiones',
                            'Galletas integrales (2-3 unidades)'
                        ],
                        'ganar masa': [
                            'Batido de proteína con leche y plátano',
                            'Yogur griego con granola y miel',
                            'Un puñado de frutos secos (almendras, nueces)',
                            'Queso cottage con fruta',
                            'Pan integral con mantequilla de maní',
                            'Leche con cacao en polvo',
                            'Barra de proteína'
                        ]
                    };
                    const objetivo = datosUsuario.objetivo === 'perder peso' ? 'perder peso' :
                        datosUsuario.objetivo === 'ganar masa' ? 'ganar masa' : 'mantener';
                    const snacksDisponibles = snacksPorObjetivo[objetivo] || snacksPorObjetivo.mantener;
                    snacks = snacksDisponibles[Math.floor(Math.random() * snacksDisponibles.length)];
                }
                acc[normalizarDia(dia)] = {
                    desayuno: comidas.d || comidas.desayuno || '',
                    almuerzo: comidas.a || comidas.almuerzo || '',
                    cena: comidas.c || comidas.cena || '',
                    snacks: snacks
                };
                return acc;
            }, {});
            if (!validarFormatoMenu(menuNormalizado)) {
                console.error('El menú generado no tiene el formato correcto');
                console.error('Menú normalizado:', JSON.stringify(menuNormalizado, null, 2));
                throw new Error('Formato de menú inválido');
            }
            menuCache.set(cacheKey, menuNormalizado);
            console.log('Menú generado y guardado en caché exitosamente');
            return menuNormalizado;
        }
        catch (error) {
            console.error('Error al procesar la respuesta de la IA:', error);
            console.error('Respuesta recibida:', text);
            throw new Error('Error al procesar la respuesta de la IA');
        }
    }
    catch (error) {
        console.error('Error al generar menú con IA:', error);
        if (error instanceof Error) {
            throw new Error(`Error al generar menú: ${error.message}`);
        }
        throw error;
    }
};
