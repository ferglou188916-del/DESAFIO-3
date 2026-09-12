import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pelicula } from '../../types/pelicula';

interface PeliculasState {
  peliculas: Pelicula[];
}

const initialState: PeliculasState = {
  peliculas: [] // <-- Arreglo completamente vacío
};

const peliculasSlice = createSlice({
  name: 'peliculas',
  initialState,
  reducers: {
    agregarPelicula: (state, action: PayloadAction<Pelicula>) => {
      state.peliculas.push(action.payload);
    },
    editarPelicula: (state, action: PayloadAction<Pelicula>) => {
      const index = state.peliculas.findIndex(p => p.codigo === action.payload.codigo);
      if (index !== -1) {
        state.peliculas[index] = action.payload;
      }
    },
    eliminarPelicula: (state, action: PayloadAction<string>) => {
      state.peliculas = state.peliculas.filter(p => p.codigo !== action.payload);
    }
  }
});

export const { agregarPelicula, editarPelicula, eliminarPelicula } = peliculasSlice.actions;
export default peliculasSlice.reducer;