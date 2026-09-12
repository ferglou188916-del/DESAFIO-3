export interface Pelicula {
  codigo: string;
  nombre: string;
  genero: string;
  duracion: number;
  clasificacion: string;
  salaAsignada: string;
  precio: number;
  estado: 'Disponible' | 'No disponible';
  imagenUrl: string;
  fecha: string;
  hora: string;
}