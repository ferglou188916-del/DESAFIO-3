export interface Asiento {
  id: string; // Identificador visual, ej: "A1", "C4"
  fila: string; // Para agruparlos visualmente en la interfaz
  columna: number;
  estado: 'Disponible' | 'Seleccionado' | 'Ocupado';
}