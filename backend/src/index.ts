import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { generarMenuSemanal } from './services/ai.js';
import { Usuario, Menu, MenuResponse } from './types/index.js';

// Log de depuración para verificar las variables de entorno
console.log('Variables de entorno:', {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Configurada' : 'No configurada',
  NODE_ENV: process.env.NODE_ENV
});

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Almacenamiento temporal en memoria
const usuarios = new Map<string, Usuario>();

// Endpoints
app.post('/api/guardarUsuario', async (req: Request, res: Response) => {
  try {
    console.log('Recibiendo datos de usuario:', req.body);
    const { nombre, edad, peso, objetivo, alergias } = req.body;
    
    // Generar ID único
    const userId = Date.now().toString();
    
    // Guardar usuario
    usuarios.set(userId, {
      datos: {
        nombre,
        edad,
        peso,
        objetivo,
        alergias,
        fechaCreacion: new Date()
      }
    });

    console.log('Usuario creado con ID:', userId);
    res.json({ userId });
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    res.status(500).json({ error: 'Error al guardar usuario: ' + (error as Error).message });
  }
});

app.post('/api/generarMenu/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const usuario = usuarios.get(userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar menú usando la IA
    const menu = await generarMenuSemanal({
      edad: usuario.datos.edad,
      objetivo: usuario.datos.objetivo,
      alergias: usuario.datos.alergias
    });

    // Generar lista de compras basada en el menú
    const lista_compras = generarListaCompras(menu);

    // Guardar menú y lista de compras
    usuarios.set(userId, {
      ...usuario,
      menu,
      lista_compras,
      fechaActualizacion: new Date()
    });

    res.json({ menu, lista_compras });
  } catch (error) {
    console.error('Error al generar menú:', error);
    res.status(500).json({ error: 'Error al generar menú: ' + (error as Error).message });
  }
});

// Función auxiliar para generar lista de compras
function generarListaCompras(menu: Menu): string[] {
  const ingredientes = new Set<string>();
  
  // Extraer ingredientes de cada comida
  Object.values(menu).forEach(dia => {
    Object.values(dia).forEach(comida => {
      if (typeof comida === 'string') {
        // Dividir la descripción de la comida en palabras
        const palabras = comida.toLowerCase().split(/[\s,]+/);
        palabras.forEach(palabra => {
          // Filtrar palabras comunes y agregar ingredientes
          if (palabra.length > 3 && !['con', 'para', 'una', 'las', 'los', 'del', 'al'].includes(palabra)) {
            ingredientes.add(palabra);
          }
        });
      }
    });
  });

  return Array.from(ingredientes).sort();
}

app.get('/api/menu/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const usuario = usuarios.get(userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!usuario.menu || !usuario.lista_compras) {
      return res.status(404).json({ error: 'Menú no generado' });
    }

    const response: MenuResponse = {
      menu: usuario.menu,
      lista_compras: usuario.lista_compras
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener menú:', error);
    res.status(500).json({ error: 'Error al obtener menú: ' + (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 