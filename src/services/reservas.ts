import { apiFetch } from './api';
import type { Reserva } from '../redux/slices/reservasSlice';

export interface ReservaApi {
  id: number;
  codigo: string;
  pelicula_id: number;
  usuario_id: number;
  pelicula_nombre?: string;
  nombre_cliente: string;
  funcion: string;
  sala?: string;
  asientos: string[] | string;
  cantidad: number;
  total: number | string;
  utilizado: boolean | number;
  fecha_compra?: string;
}

export function adaptarReserva(r: ReservaApi): Reserva {
  const partes = String(r.funcion ?? '').split('|');
  const funcion = partes.length === 3 ? `${partes[1]} a las ${partes[2]}` : String(r.funcion ?? '');
  return {
    codigoReserva: r.codigo,
    peliculaNombre: r.pelicula_nombre || `Película #${r.pelicula_id}`,
    peliculaId: r.pelicula_id,
    funcion,
    salaAsignada: r.sala || partes[0] || '',
    asientos: Array.isArray(r.asientos) ? r.asientos : String(r.asientos || '').split(',').map(a => a.trim()).filter(Boolean),
    cantidadBoletos: Number(r.cantidad),
    totalPagado: Number(r.total),
    nombreCliente: r.nombre_cliente,
    correoCliente: '',
    estado: Boolean(Number(r.utilizado)) ? 'Utilizado' : 'Válido',
  };
}

export const listarReservas = () => apiFetch<ReservaApi[]>('/reservas');
export const consultarOcupados = (peliculaId: number, funcion: string) =>
  apiFetch<ReservaApi[]>(`/reservas?pelicula_id=${encodeURIComponent(peliculaId)}&funcion=${encodeURIComponent(funcion)}`);
export const crearReserva = (datos: {
  usuario_id: number; pelicula_id: number; nombre_cliente: string;
  funcion: string; asientos: string; cantidad: number; total: number;
}) => apiFetch<ReservaApi>('/reservas', { method: 'POST', body: JSON.stringify(datos) });
export const validarReserva = (codigo: string) => apiFetch<{ message: string; codigo: string; utilizado: boolean }>(
  `/reservas/${encodeURIComponent(codigo)}/validar`, { method: 'PUT' }
);
