import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pelicula, PeliculaApi, adaptarPelicula } from '../../types/pelicula';
import { apiFetch } from '../../services/api';

interface PeliculasState {
  peliculas: Pelicula[];
  loading: boolean;
  error: string | null;
}

const initialState: PeliculasState = { peliculas: [], loading: false, error: null };

export const obtenerPeliculas = createAsyncThunk<Pelicula[], void, { rejectValue: string }>(
  'peliculas/obtener',
  async (_, { rejectWithValue }) => {
    try {
      const datos = await apiFetch<PeliculaApi[]>('/peliculas');
      return datos.map(adaptarPelicula);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'No se pudo cargar la cartelera.');
    }
  },
);

const peliculasSlice = createSlice({
  name: 'peliculas',
  initialState,
  reducers: {
    agregarPelicula: (state, action: PayloadAction<Pelicula>) => { state.peliculas.push(action.payload); },
    editarPelicula: (state, action: PayloadAction<Pelicula>) => {
      const i = state.peliculas.findIndex(p => p.codigo === action.payload.codigo);
      if (i !== -1) state.peliculas[i] = action.payload;
    },
    eliminarPelicula: (state, action: PayloadAction<string>) => {
      state.peliculas = state.peliculas.filter(p => p.codigo !== action.payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(obtenerPeliculas.pending, state => { state.loading = true; state.error = null; });
    builder.addCase(obtenerPeliculas.fulfilled, (state, action) => {
      state.loading = false;
      state.peliculas = action.payload;
    });
    builder.addCase(obtenerPeliculas.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? 'No se pudo consultar la API.';
    });
  },
});

export const { agregarPelicula, editarPelicula, eliminarPelicula } = peliculasSlice.actions;
export default peliculasSlice.reducer;
