import { apiFetch } from './api';
export interface SalaRemota { id:number; nombre:string; filas:number }
export const listarSalas = () => apiFetch<SalaRemota[]>('/salas');
export const crearSala = (p:{nombre:string;filas:number}) => apiFetch<SalaRemota>('/salas',{method:'POST',body:JSON.stringify(p)});
export const editarSala = (id:number,p:{nombre:string;filas:number}) => apiFetch<SalaRemota>(`/salas/${id}`,{method:'PUT',body:JSON.stringify(p)});
export const borrarSala = (id:number) => apiFetch<{message:string}>(`/salas/${id}`,{method:'DELETE'});
