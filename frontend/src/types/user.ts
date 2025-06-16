export type Objetivo = 'perder peso' | 'mantener' | 'ganar masa';

export interface UserFormData {
  nombre: string;
  edad: number;
  peso: number;
  objetivo: Objetivo;
  alergias: string;
}

export interface UserFormErrors {
  nombre?: string;
  edad?: string;
  peso?: string;
  objetivo?: string;
  alergias?: string;
} 