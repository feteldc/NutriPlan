import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserFormData } from '../types/user';
import type { MenuResponse, Menu, Comidas } from '../types/menu';

// Función para reemplazar alimentos según alergias
const reemplazarAlimentosPorAlergia = (menu: any, alergias: string) => {
  const alergiasList = alergias.toLowerCase().split(',').map(a => a.trim());
  const menuCopia = JSON.parse(JSON.stringify(menu));

  const sustitutos = {
    'lacteos': {
      'yogur griego': 'yogur de almendras',
      'yogur': 'yogur de almendras',
      'leche': 'leche de almendras',
      'queso': 'tofu',
      'crema': 'crema de coco'
    },
    'gluten': {
      'pan integral': 'pan sin gluten',
      'pasta integral': 'pasta de arroz',
      'pasta': 'pasta de arroz',
      'avena': 'quinoa',
      'trigo': 'arroz'
    },
    'huevos': {
      'huevos': 'tofu revuelto',
      'huevo': 'tofu revuelto'
    },
    'frutos secos': {
      'nueces': 'semillas de girasol',
      'almendras': 'semillas de calabaza',
      'mantequilla de almendras': 'mantequilla de semillas de girasol',
      'frutos secos': 'semillas mixtas'
    },
    'mariscos': {
      'salmón': 'pollo',
      'pescado': 'pollo',
      'atún': 'pollo'
    },
    'soja': {
      'tofu': 'tempeh',
      'soja': 'garbanzos'
    }
  };

  // Función para reemplazar ingredientes en una comida
  const reemplazarEnComida = (comida: string) => {
    let nuevaComida = comida;
    alergiasList.forEach(alergia => {
      if (sustitutos[alergia as keyof typeof sustitutos]) {
        Object.entries(sustitutos[alergia as keyof typeof sustitutos]).forEach(([original, sustituto]) => {
          nuevaComida = nuevaComida.replace(new RegExp(original, 'gi'), sustituto);
        });
      }
    });
    return nuevaComida;
  };

  // Aplicar reemplazos en todo el menú
  Object.keys(menuCopia).forEach(dia => {
    Object.keys(menuCopia[dia]).forEach(comida => {
      menuCopia[dia][comida] = reemplazarEnComida(menuCopia[dia][comida]);
    });
  });

  return menuCopia;
};

// Función para ajustar lista de compras según alergias
const ajustarListaComprasPorAlergia = (lista: string[], alergias: string) => {
  const alergiasList = alergias.toLowerCase().split(',').map(a => a.trim());
  const listaCopia = [...lista];

  const alimentosAEliminar = {
    'lacteos': ['yogur griego', 'leche', 'queso', 'crema'],
    'gluten': ['pan integral', 'pasta integral', 'avena'],
    'huevos': ['huevos'],
    'frutos secos': ['nueces', 'almendras', 'mantequilla de almendras', 'frutos secos'],
    'mariscos': ['salmón', 'pescado', 'atún'],
    'soja': ['tofu', 'soja']
  };

  const alimentosAAgregar = {
    'lacteos': ['yogur de almendras', 'leche de almendras', 'tofu', 'crema de coco'],
    'gluten': ['pan sin gluten', 'pasta de arroz', 'quinoa'],
    'huevos': ['tofu revuelto'],
    'frutos secos': ['semillas de girasol', 'semillas de calabaza', 'mantequilla de semillas de girasol'],
    'mariscos': ['pollo'],
    'soja': ['tempeh', 'garbanzos']
  };

  // Eliminar alimentos según alergias
  alergiasList.forEach(alergia => {
    if (alimentosAEliminar[alergia as keyof typeof alimentosAEliminar]) {
      alimentosAEliminar[alergia as keyof typeof alimentosAEliminar].forEach(alimento => {
        const index = listaCopia.indexOf(alimento);
        if (index > -1) {
          listaCopia.splice(index, 1);
        }
      });
    }
  });

  // Agregar sustitutos
  alergiasList.forEach(alergia => {
    if (alimentosAAgregar[alergia as keyof typeof alimentosAAgregar]) {
      alimentosAAgregar[alergia as keyof typeof alimentosAAgregar].forEach(alimento => {
        if (!listaCopia.includes(alimento)) {
          listaCopia.push(alimento);
        }
      });
    }
  });

  return listaCopia;
};

// Menús personalizados según el objetivo
const menusPorObjetivo = {
  perder: {
    lunes: {
      desayuno: "Avena con frutas y canela (sin azúcar)",
      almuerzo: "Ensalada de pollo a la plancha con vegetales verdes",
      cena: "Salmón al horno con espárragos",
      snacks: "Yogur griego bajo en grasa"
    },
    martes: {
      desayuno: "Huevos revueltos con espinacas",
      almuerzo: "Quinoa con vegetales y tofu",
      cena: "Sopa de verduras con pollo",
      snacks: "Manzana con mantequilla de almendras"
    },
    miércoles: {
      desayuno: "Smoothie verde (espinaca, manzana, jengibre)",
      almuerzo: "Ensalada César light con pollo a la plancha",
      cena: "Pescado blanco con brócoli al vapor",
      snacks: "Mix de frutos secos (porción controlada)"
    },
    jueves: {
      desayuno: "Tostadas integrales con aguacate",
      almuerzo: "Bowl de arroz integral con vegetales",
      cena: "Pechuga de pollo a la plancha con ensalada",
      snacks: "Yogur con semillas de chía"
    },
    viernes: {
      desayuno: "Panqueques de avena con frutas",
      almuerzo: "Wrap de lechuga con pollo y vegetales",
      cena: "Sopa de lentejas light",
      snacks: "Fruta fresca"
    },
    sábado: {
      desayuno: "Huevos con aguacate y pan integral",
      almuerzo: "Ensalada de quinoa con vegetales",
      cena: "Pescado al horno con verduras",
      snacks: "Batido de proteína con agua"
    },
    domingo: {
      desayuno: "Tostadas con huevo y tomate",
      almuerzo: "Pasta integral con salsa de tomate natural",
      cena: "Ensalada de atún con vegetales",
      snacks: "Frutos secos (porción controlada)"
    }
  },
  mantener: {
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
    miércoles: {
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
    sábado: {
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
  },
  ganar: {
    lunes: {
      desayuno: "Avena con proteína, frutas y mantequilla de maní",
      almuerzo: "Pechuga de pollo con arroz y vegetales",
      cena: "Salmón con batata y brócoli",
      snacks: "Yogur griego con granola y miel"
    },
    martes: {
      desayuno: "Huevos con aguacate y pan integral",
      almuerzo: "Carne de res con quinoa y vegetales",
      cena: "Pasta integral con salsa boloñesa",
      snacks: "Batido de proteína con leche y plátano"
    },
    miércoles: {
      desayuno: "Smoothie de proteína con frutas y avena",
      almuerzo: "Pollo al curry con arroz basmati",
      cena: "Pescado con puré de papas",
      snacks: "Mix de frutos secos y fruta"
    },
    jueves: {
      desayuno: "Tostadas con huevo, aguacate y queso",
      almuerzo: "Bowl de arroz con pollo y vegetales",
      cena: "Carne de res con papas y ensalada",
      snacks: "Yogur con granola y frutas"
    },
    viernes: {
      desayuno: "Panqueques de proteína con frutas y miel",
      almuerzo: "Wrap de pollo con aguacate y queso",
      cena: "Pasta con salsa de crema y pollo",
      snacks: "Batido de proteína con avena"
    },
    sábado: {
      desayuno: "Burrito de desayuno con huevo y queso",
      almuerzo: "Ensalada de quinoa con pollo y aguacate",
      cena: "Carne de res con arroz y vegetales",
      snacks: "Frutos secos y fruta"
    },
    domingo: {
      desayuno: "Huevos con tostadas y aguacate",
      almuerzo: "Pasta con salsa pesto y pollo",
      cena: "Pescado con arroz y vegetales",
      snacks: "Batido de proteína con leche"
    }
  }
};

// Listas de compras personalizadas según el objetivo
const listasComprasPorObjetivo = {
  perder: [
    "Avena", "Frutas variadas", "Canela", "Pollo", "Vegetales verdes",
    "Salmón", "Espárragos", "Yogur griego bajo en grasa", "Huevos",
    "Espinacas", "Quinoa", "Tofu", "Manzanas", "Mantequilla de almendras",
    "Jengibre", "Brócoli", "Frutos secos", "Pan integral", "Aguacate",
    "Arroz integral", "Lentejas", "Semillas de chía", "Atún"
  ],
  mantener: [
    "Avena", "Frutas variadas", "Miel", "Pollo", "Lechuga", "Tomate",
    "Salmón", "Verduras variadas", "Yogur griego", "Nueces", "Aguacate",
    "Huevos", "Quinoa", "Garbanzos", "Manzanas", "Mantequilla de almendras",
    "Proteína en polvo", "Pan integral", "Arroz", "Pasta integral",
    "Salsa de tomate", "Pescado", "Papas", "Granola", "Lentejas",
    "Curry", "Atún"
  ],
  ganar: [
    "Avena", "Proteína en polvo", "Frutas variadas", "Mantequilla de maní",
    "Pollo", "Arroz", "Vegetales variados", "Salmón", "Batata", "Brócoli",
    "Yogur griego", "Granola", "Miel", "Huevos", "Aguacate", "Pan integral",
    "Carne de res", "Quinoa", "Pasta integral", "Salsa boloñesa", "Leche",
    "Plátanos", "Arroz basmati", "Curry", "Pescado", "Papas", "Queso",
    "Frutos secos", "Crema", "Salsa pesto"
  ]
};

export const api = {
  async guardarUsuario(data: UserFormData) {
    try {
      const docRef = await addDoc(collection(db, 'usuarios'), {
        ...data,
        fechaCreacion: new Date().toISOString()
      });
      
      return { userId: docRef.id };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async generarMenu(data: { userId: string }): Promise<MenuResponse> {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', data.userId));
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data();
      
      // Llamar a la API del backend para generar el menú
      const response = await fetch(`http://localhost:3000/api/generarMenu/${data.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar el menú');
      }

      const { menu } = await response.json();

      // Generar lista de compras basada en el menú
      const lista_compras = generarListaCompras(menu);

      // Actualizar el documento con el menú y la lista de compras
      await updateDoc(doc(db, 'usuarios', data.userId), {
        menu,
        lista_compras
      });

      return {
        menu,
        lista_compras
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

// Función auxiliar para generar la lista de compras basada en el menú
const generarListaCompras = (menu: Menu): string[] => {
  const ingredientes = new Set<string>();
  
  // Lista de palabras a ignorar (calorías, preposiciones, etc.)
  const palabrasAIgnorar = [
    'con', 'para', 'y', 'o', 'de', 'la', 'el', 'los', 'las', 'del', 'al', 'por',
    'calorías', 'calorias', 'gramos', 'g', 'kg', 'ml', 'l', 'taza', 'tazas',
    'cucharada', 'cucharadas', 'cda', 'cdas', 'cucharadita', 'cucharaditas',
    'puñado', 'puñados', 'porción', 'porciones', 'pequeña', 'pequeño',
    'grande', 'mediana', 'mediano', 'natural', 'ligera', 'ligero',
    'integral', 'bajo', 'alta', 'alto', 'fresca', 'fresco', 'casera', 'casero'
  ];
  
  // Lista de ingredientes principales que queremos capturar
  const ingredientesPrincipales = [
    'pollo', 'pavo', 'ternera', 'carne', 'res', 'cerdo', 'cordero',
    'salmón', 'atún', 'pescado', 'mariscos', 'camarones', 'langosta',
    'huevos', 'huevo', 'claras', 'yemas',
    'leche', 'yogur', 'queso', 'crema', 'mantequilla',
    'arroz', 'pasta', 'quinoa', 'avena', 'pan', 'tostadas', 'tortillas',
    'tomate', 'tomates', 'lechuga', 'espinacas', 'brócoli', 'zanahoria',
    'cebolla', 'ajo', 'pimiento', 'calabacín', 'calabaza', 'patata',
    'batata', 'papa', 'papas', 'aguacate', 'limón', 'limones',
    'manzana', 'plátano', 'naranja', 'fresa', 'fresas', 'uva', 'uvas',
    'almendra', 'almendras', 'nuez', 'nueces', 'cacahuete', 'cacahuetes',
    'aceite', 'oliva', 'vinagre', 'sal', 'pimienta', 'especias',
    'azúcar', 'miel', 'canela', 'vainilla', 'chocolate', 'cacao'
  ];
  
  Object.values(menu).forEach((dia: Comidas) => {
    Object.values(dia).forEach((comida: string) => {
      if (typeof comida === 'string') {
        // Limpiar el texto de calorías y paréntesis
        let textoLimpio = comida
          .replace(/\(\d+\s*calorías?\)/gi, '') // Eliminar (250 calorías)
          .replace(/\(\d+\s*calorias?\)/gi, '') // Eliminar (250 calorias)
          .replace(/\(\d+\s*g\)/gi, '') // Eliminar (100g)
          .replace(/\(\d+\s*ml\)/gi, '') // Eliminar (200ml)
          .replace(/\(\d+\s*kg\)/gi, '') // Eliminar (1kg)
          .replace(/\([^)]*\)/g, '') // Eliminar cualquier cosa entre paréntesis
          .replace(/[0-9]+/g, '') // Eliminar números
          .replace(/\./g, ' ') // Reemplazar puntos con espacios
          .replace(/,/g, ' ') // Reemplazar comas con espacios
          .toLowerCase();
        
        // Dividir en palabras y filtrar
        const palabras = textoLimpio.split(/\s+/).filter(palabra => 
          palabra.length > 2 && 
          !palabrasAIgnorar.includes(palabra) &&
          ingredientesPrincipales.some(ingrediente => 
            palabra.includes(ingrediente) || ingrediente.includes(palabra)
          )
        );
        
        palabras.forEach(palabra => {
          // Encontrar el ingrediente principal más cercano
          const ingredienteEncontrado = ingredientesPrincipales.find(ingrediente => 
            palabra.includes(ingrediente) || ingrediente.includes(palabra)
          );
          
          if (ingredienteEncontrado) {
            ingredientes.add(ingredienteEncontrado);
          }
        });
      }
    });
  });

  return Array.from(ingredientes).sort();
}; 