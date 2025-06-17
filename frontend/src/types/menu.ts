export interface Comidas {
  desayuno: string;
  almuerzo: string;
  cena: string;
  snacks: string;
}

export interface Menu {
  lunes: Comidas;
  martes: Comidas;
  miércoles: Comidas;
  jueves: Comidas;
  viernes: Comidas;
  sábado: Comidas;
  domingo: Comidas;
}

export interface MenuResponse {
  menu: Menu;
  lista_compras: string[];
} 