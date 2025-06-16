import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserFormData } from '../types/user';
import type { MenuResponse } from '../types/menu';

const API_URL = 'http://localhost:3000/api';

export const api = {
  async guardarUsuario(data: UserFormData) {
    try {
      // Guardar en Firebase
      const docRef = await addDoc(collection(db, 'usuarios'), {
        ...data,
        fechaCreacion: new Date().toISOString()
      });

      // Guardar en el backend
      const response = await fetch(`${API_URL}/guardarUsuario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, userId: docRef.id }),
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar usuario');
      }
      
      return { userId: docRef.id };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  async generarMenu(data: { userId: string }): Promise<MenuResponse> {
    try {
      // Verificar si el usuario existe en Firebase
      const userDoc = await getDoc(doc(db, 'usuarios', data.userId));
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      // Generar menú en el backend
      const response = await fetch(`${API_URL}/generarMenu/${data.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al generar menú');
      }
      
      const menuData = await response.json();
      return menuData;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}; 