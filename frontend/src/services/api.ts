import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserFormData } from '../types/user';
import type { MenuResponse, Menu, Comidas } from '../types/menu';

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