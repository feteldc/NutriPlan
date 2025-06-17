export interface UserData {
  nombre: string;
  edad: number;
  peso: number;
  objetivo: string;
  alergias: string;
  fechaCreacion: Date;
}

export interface Usuario {
  datos: UserData;
  menu?: Menu;
  lista_compras?: string[];
  fechaActualizacion?: Date;
}

export interface Menu {
  [key: string]: {
    desayuno: string;
    almuerzo: string;
    cena: string;
    snacks: string;
  };
}

export interface MenuResponse {
  menu: Menu;
  lista_compras: string[];
} 