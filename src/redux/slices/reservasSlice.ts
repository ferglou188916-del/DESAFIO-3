import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { adaptarReserva, listarReservas } from '../../services/reservas';

export interface Reserva {
  codigoReserva: string;
  peliculaId?: number;
  peliculaNombre: string;
  funcion: string; // Formato esperado: "YYYY-MM-DD a las HH:MM"
  salaAsignada: string;
  asientos: string[];
  cantidadBoletos: number;
  totalPagado: number;
  nombreCliente: string;
  correoCliente: string;
  estado: 'Válido' | 'Utilizado' | 'Cancelado';
}

interface ReservasState {
  reservas: Reserva[];
  loading: boolean;
  error: string | null;
}

const initialState: ReservasState = {
  reservas: [],
  loading: false,
  error: null
};

export const obtenerReservas = createAsyncThunk('reservas/obtener', async () =>
  (await listarReservas()).map(adaptarReserva)
);

const reservasSlice = createSlice({
  name: 'reservas',
  initialState,
  reducers: {
    agregarReserva: (state, action: PayloadAction<Reserva>) => {
      state.reservas.unshift(action.payload);
    },
    marcarBoletoUtilizado: (state, action: PayloadAction<string>) => {
      const reserva = state.reservas.find(r => r.codigoReserva === action.payload);
      if (reserva) {
        reserva.estado = 'Utilizado';
      }
    },
    actualizarClienteReserva: (state, action: PayloadAction<{ codigoReserva: string, nuevoNombre: string, nuevoCorreo: string }>) => {
      const reserva = state.reservas.find(r => r.codigoReserva === action.payload.codigoReserva);
      if (reserva) {
        reserva.nombreCliente = action.payload.nuevoNombre;
        reserva.correoCliente = action.payload.nuevoCorreo;
      }
    },
    // Nueva función para borrar reservas pasadas
    eliminarReserva: (state, action: PayloadAction<string>) => {
      state.reservas = state.reservas.filter(r => r.codigoReserva !== action.payload);
    }
  },
  extraReducers: builder => {
    builder.addCase(obtenerReservas.pending, state => { state.loading = true; state.error = null; });
    builder.addCase(obtenerReservas.fulfilled, (state, action) => { state.loading = false; state.reservas = action.payload; });
    builder.addCase(obtenerReservas.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Error al consultar reservas'; });
  }
});

export const { agregarReserva, marcarBoletoUtilizado, actualizarClienteReserva, eliminarReserva } = reservasSlice.actions;
export default reservasSlice.reducer;