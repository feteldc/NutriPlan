interface Menu {
  lunes: Comidas;
  martes: Comidas;
  miércoles: Comidas;
  jueves: Comidas;
  viernes: Comidas;
  sábado: Comidas;
  domingo: Comidas;
}

interface Comidas {
  desayuno: string;
  almuerzo: string;
  cena: string;
  snacks: string;
}

interface UserData {
  nombre: string;
  edad: number;
  peso: number;
  objetivo: string;
  alergias: string[];
  fechaCreacion: Date;
}

export interface User {
  datos: UserData;
  menu?: Menu;
  lista_compras?: string[];
  fechaActualizacion?: Date;
}

export interface UserMap {
  [key: string]: User;
} 