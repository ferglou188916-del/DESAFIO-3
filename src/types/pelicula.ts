export interface Pelicula {
  id?: number;
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

export interface PeliculaApi {
  id: number;
  codigo: string;
  nombre: string;
  genero: string;
  duracion: number;
  clasificacion: string;
  sala: string;
  precio: number | string;
  estado: 'Disponible' | 'No disponible';
  imagenUrl: string | null;
  fecha: string | null;
  hora: string | null;
}

export function adaptarPelicula(p: PeliculaApi): Pelicula {
  return {
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
    genero: p.genero,
    duracion: Number(p.duracion),
    clasificacion: p.clasificacion,
    salaAsignada: p.sala,
    precio: Number(p.precio),
    estado: p.estado,
    imagenUrl: p.imagenUrl ?? '',
    fecha: p.fecha ? String(p.fecha).slice(0, 10) : '',
    hora: p.hora ?? '',
  };
}
