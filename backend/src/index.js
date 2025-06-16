import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Almacenamiento temporal en memoria
const usuarios = new Map();

// Endpoints
app.post('/api/guardarUsuario', async (req, res) => {
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
    res.status(500).json({ error: 'Error al guardar usuario: ' + error.message });
  }
});

app.post('/api/generarMenu/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const usuario = usuarios.get(userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar menú de ejemplo
    const menu = {
      lunes: {
        desayuno: "Avena con frutas y miel",
        almuerzo: "Pollo a la plancha con ensalada",
        cena: "Salmón con verduras al vapor",
        snacks: "Yogur griego con nueces"
      },
      martes: {
        desayuno: "Tostadas de aguacate con huevo",
        almuerzo: "Quinoa con vegetales y garbanzos",
        cena: "Sopa de verduras con pollo",
        snacks: "Manzana con mantequilla de almendras"
      },
      miercoles: {
        desayuno: "Smoothie de frutas con proteína",
        almuerzo: "Ensalada César con pollo",
        cena: "Pasta integral con salsa de tomate",
        snacks: "Mix de frutos secos"
      },
      jueves: {
        desayuno: "Huevos revueltos con pan integral",
        almuerzo: "Bowl de arroz con vegetales",
        cena: "Pescado al horno con papas",
        snacks: "Yogur con granola"
      },
      viernes: {
        desayuno: "Panqueques de avena con frutas",
        almuerzo: "Wrap de pollo con vegetales",
        cena: "Sopa de lentejas",
        snacks: "Fruta fresca"
      },
      sabado: {
        desayuno: "Tostadas con aguacate y huevo",
        almuerzo: "Ensalada de quinoa",
        cena: "Pollo al curry con arroz",
        snacks: "Batido de proteína"
      },
      domingo: {
        desayuno: "Burrito de desayuno",
        almuerzo: "Pasta con salsa pesto",
        cena: "Ensalada de atún",
        snacks: "Frutos secos"
      }
    };

    const lista_compras = [
      "Avena",
      "Frutas variadas",
      "Pollo",
      "Salmón",
      "Verduras",
      "Quinoa",
      "Garbanzos",
      "Yogur griego",
      "Nueces",
      "Aguacate",
      "Huevos",
      "Pan integral",
      "Miel",
      "Aceite de oliva",
      "Sal y pimienta",
      "Especias variadas"
    ];

    // Guardar menú
    usuarios.set(userId, {
      ...usuario,
      menu,
      lista_compras,
      fechaActualizacion: new Date()
    });

    res.json({ menu, lista_compras });
  } catch (error) {
    console.error('Error al generar menú:', error);
    res.status(500).json({ error: 'Error al generar menú: ' + error.message });
  }
});

app.get('/api/menu/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const usuario = usuarios.get(userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      menu: usuario.menu,
      lista_compras: usuario.lista_compras
    });
  } catch (error) {
    console.error('Error al obtener menú:', error);
    res.status(500).json({ error: 'Error al obtener menú: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 