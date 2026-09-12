export interface Reserva {
  codigoReserva: string;
  peliculaNombre: string;
  funcion: string;
  salaAsignada: string;
  asientos: string[];
  cantidadBoletos: number;
  totalPagado: number;
  nombreCliente: string;
  correoCliente: string;
  estado: 'Válido' | 'Utilizado'; 
}