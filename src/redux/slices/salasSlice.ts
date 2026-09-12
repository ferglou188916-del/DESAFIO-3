import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Asiento {
  id: string;
  estado: 'Disponible' | 'Seleccionado' | 'Ocupado';
}

export interface Sala {
  nombre: string;
  distribucion: Asiento[];
}

interface SalasState {
  salas: Sala[];
}

const initialState: SalasState = {
  salas: []
};

const salasSlice = createSlice({
  name: 'salas',
  initialState,
  reducers: {
    agregarSala: (state, action: PayloadAction<{ nombre: string; filas: number }>) => {
      const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nuevaDistribucion: Asiento[] = [];
      for (let i = 0; i < action.payload.filas; i++) {
        const letraFila = letras[i];
        for (let j = 1; j <= 5; j++) {
          nuevaDistribucion.push({ id: `${letraFila}${j}`, estado: 'Disponible' });
        }
      }
      state.salas.push({ nombre: action.payload.nombre, distribucion: nuevaDistribucion });
    },
    editarSala: (state, action: PayloadAction<{ nombreOriginal: string; nombreNuevo: string; filas: number }>) => {
      const index = state.salas.findIndex(s => s.nombre === action.payload.nombreOriginal);
      if (index !== -1) {
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nuevaDistribucion: Asiento[] = [];
        for (let i = 0; i < action.payload.filas; i++) {
          const letraFila = letras[i];
          for (let j = 1; j <= 5; j++) {
            nuevaDistribucion.push({ id: `${letraFila}${j}`, estado: 'Disponible' });
          }
        }
        state.salas[index] = { nombre: action.payload.nombreNuevo, distribucion: nuevaDistribucion };
      }
    },
    eliminarSala: (state, action: PayloadAction<string>) => {
      state.salas = state.salas.filter(s => s.nombre !== action.payload);
    },
    ocuparAsientos: (state, action: PayloadAction<{ salaNombre: string; asientosIds: string[] }>) => {
      const sala = state.salas.find(s => s.nombre === action.payload.salaNombre);
      if (sala) {
        action.payload.asientosIds.forEach(id => {
          const asiento = sala.distribucion.find(a => a.id === id);
          if (asiento) asiento.estado = 'Ocupado';
        });
      }
    }
  }
});

export const { agregarSala, editarSala, eliminarSala, ocuparAsientos } = salasSlice.actions;
export default salasSlice.reducer;