export type Objetivo = 'perder peso' | 'mantener' | 'ganar masa';
export type NivelActividad = 'sedentario' | 'ligero' | 'moderado' | 'activo' | 'muy-activo';
export type HorarioComida = 'normal' | 'intermitente' | 'frecuente';

export interface UserFormData {
  nombre: string;
  edad: number;
  peso: number;
  objetivo: Objetivo;
  alergias: string;
  nivelActividad: NivelActividad;
  preferenciasDieteticas: string[];
  horarioComida: HorarioComida;
}

export interface UserFormErrors {
  nombre?: string;
  edad?: string;
  peso?: string;
  objetivo?: string;
  alergias?: string;
  nivelActividad?: string;
  preferenciasDieteticas?: string;
  horarioComida?: string;
} 