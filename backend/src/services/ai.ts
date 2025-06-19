import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY no está configurada en las variables de entorno');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface Comidas {
  d?: string;
  a?: string;
  c?: string;
  s?: string[];
  desayuno?: string;
  almuerzo?: string;
  cena?: string;
  snacks?: string[];
}

interface Menu {
  [key: string]: Comidas;
}

// Cache para almacenar menús generados
const menuCache = new Map<string, Menu>();

const validarFormatoMenu = (menu: Menu): boolean => {
  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const comidas = ['desayuno', 'almuerzo', 'cena', 'snacks'];

  try {
    for (const dia of dias) {
      if (!menu[dia]) return false;
      for (const comida of comidas) {
        if (!menu[dia][comida as keyof Comidas]) return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const generarMenuSemanal = async (datosUsuario: {
  edad: number;
  objetivo: string;
  alergias: string;
}) => {
  try {
    const cacheKey = `${datosUsuario.edad}-${datosUsuario.objetivo}-${datosUsuario.alergias}`;
    
    if (menuCache.has(cacheKey)) {
      console.log('Retornando menú desde caché');
      return menuCache.get(cacheKey);
    }

    console.log('Generando nuevo menú con IA...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prompt optimizado para minimizar tokens
    const prompt = `Menu semanal JSON: ${datosUsuario.edad}a, ${datosUsuario.objetivo}, alergias:${datosUsuario.alergias || 'ninguna'}. Formato:{"lunes":{"d":"","a":"","c":"","s":[]}}`;

    console.log('Enviando prompt a la API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Respuesta recibida de la API');
    
    try {
      const menu = JSON.parse(text) as Menu;
      
      // Normalizar las claves del menú
      const menuNormalizado = Object.entries(menu).reduce((acc: Menu, [dia, comidas]) => {
        acc[dia] = {
          desayuno: comidas.d || comidas.desayuno || '',
          almuerzo: comidas.a || comidas.almuerzo || '',
          cena: comidas.c || comidas.cena || '',
          snacks: comidas.s || comidas.snacks || []
        };
        return acc;
      }, {});

      if (!validarFormatoMenu(menuNormalizado)) {
        console.error('El menú generado no tiene el formato correcto');
        throw new Error('Formato de menú inválido');
      }

      menuCache.set(cacheKey, menuNormalizado);
      console.log('Menú generado y guardado en caché exitosamente');
      return menuNormalizado;
    } catch (error) {
      console.error('Error al procesar la respuesta de la IA:', error);
      console.error('Respuesta recibida:', text);
      throw new Error('Error al procesar la respuesta de la IA');
    }
  } catch (error) {
    console.error('Error al generar menú con IA:', error);
    if (error instanceof Error) {
      throw new Error(`Error al generar menú: ${error.message}`);
    }
    throw error;
  }
}; 