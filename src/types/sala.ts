import { Asiento } from './asiento';

export interface Sala {
  id: string; // Ej: "SALA 1"
  filas: number;
  asientosPorFila: number;
  distribucion: Asiento[];
}