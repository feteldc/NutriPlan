import { UserFormData, UserFormErrors } from '../types/user';

export const validateForm = (data: UserFormData): UserFormErrors => {
  const errors: UserFormErrors = {};

  if (!data.nombre.trim()) {
    errors.nombre = 'El nombre es requerido';
  }

  if (!data.edad) {
    errors.edad = 'La edad es requerida';
  } else if (data.edad < 1 || data.edad > 120) {
    errors.edad = 'La edad debe estar entre 1 y 120 años';
  }

  if (!data.peso) {
    errors.peso = 'El peso es requerido';
  } else if (data.peso < 20 || data.peso > 300) {
    errors.peso = 'El peso debe estar entre 20 y 300 kg';
  }

  if (!data.objetivo) {
    errors.objetivo = 'El objetivo es requerido';
  }

  return errors;
}; 