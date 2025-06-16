export interface Comidas {
  desayuno: string;
  almuerzo: string;
  cena: string;
}

export interface Menu {
  dias: {
    [key: string]: Comidas;
  };
  listaCompras: string[];
}

export interface MenuResponse {
  menu: Menu;
  userId: string;
} 