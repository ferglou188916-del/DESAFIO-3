import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { actualizarClienteReserva, eliminarReserva, Reserva } from '../redux/slices/reservasSlice';

export default function DashboardScreen({ navigation }: any) {
  const peliculas = useSelector((state: RootState) => state.peliculas.peliculas);
  const reservas = useSelector((state: RootState) => state.reservas.reservas);
  const salas = useSelector((state: RootState) => state.salas.salas);
  const dispatch = useDispatch();

  // ESTADISTICAS DEL CINE
  const totalPeliculas = peliculas.length;
  const totalFunciones = peliculas.filter(p => p.estado === 'Disponible').length; 
  
  const totalBoletosVendidos = reservas.reduce((acc, reserva) => acc + reserva.cantidadBoletos, 0);
  const ingresosGenerados = reservas.reduce((acc, reserva) => acc + reserva.totalPagado, 0);

  let totalAsientos = 0;
  let asientosOcupados = 0;
  
  salas.forEach(sala => {
    totalAsientos += sala.distribucion.length;
    asientosOcupados += sala.distribucion.filter(a => a.estado === 'Ocupado').length;
  });
  
  const asientosDisponibles = totalAsientos - asientosOcupados;

  // Lógica para Película Más Reservada
  const conteoPeliculas: { [key: string]: number } = {};
  reservas.forEach(r => {
    conteoPeliculas[r.peliculaNombre] = (conteoPeliculas[r.peliculaNombre] || 0) + r.cantidadBoletos;
  });

  let peliculaMasReservada = 'Ninguna';
  let maxBoletos = 0;

  for (const [nombre, cantidad] of Object.entries(conteoPeliculas)) {
    if (cantidad > maxBoletos) {
      maxBoletos = cantidad;
      peliculaMasReservada = nombre;
    }
  }

//logica de clientes
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reservaActiva, setReservaActiva] = useState<Reserva | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');

  const peliculasConVentas = peliculas.filter(p => p.estado === 'Disponible');
  const reservasMostradas = peliculaSeleccionada 
    ? reservas.filter(r => r.peliculaNombre === peliculaSeleccionada) 
    : [];

  const abrirModalEditar = (reserva: Reserva) => {
    setReservaActiva(reserva);
    setEditNombre(reserva.nombreCliente);
    setEditCorreo(reserva.correoCliente);
    setModalVisible(true);
  };

  const guardarCambiosCliente = () => {
    if (!editNombre.trim() || !editCorreo.trim()) return Alert.alert('Error', 'Campos vacíos.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editCorreo.trim())) return Alert.alert('Error', 'Correo inválido.');

    if (reservaActiva) {
      dispatch(actualizarClienteReserva({
        codigoReserva: reservaActiva.codigoReserva,
        nuevoNombre: editNombre.trim(),
        nuevoCorreo: editCorreo.trim()
      }));
      setModalVisible(false);
      Alert.alert('Éxito', 'Datos actualizados.');
    }
  };

  const confirmarEliminacion = (codigoReserva: string) => {
    Alert.alert('Eliminar', '¿Borrar este boleto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => dispatch(eliminarReserva(codigoReserva)) }
    ]);
  };

  const funcionYaPaso = (funcionString: string) => {
    try {
      const partes = funcionString.split(' a las ');
      if (partes.length !== 2) return false;
      const [year, month, day] = partes[0].split('-').map(Number);
      const [hour, minute] = partes[1].split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute) < new Date();
    } catch (e) {
      return false; 
    }
  };

  return (
    <ScrollView style={styles.contenedor}>
      
      {/* NAVEGACIÓN SUPERIOR */}
      <View style={styles.cabeceraFlex}>
        <Text style={styles.tituloSecundario}>Dashboard General</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={[styles.botonNavegacion, { backgroundColor: '#4caf50', marginRight: 8 }]} onPress={() => navigation.navigate('Salas')}>
            <Text style={styles.textoBoton}>SALAS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonNavegacion} onPress={() => navigation.navigate('Administracion')}>
            <Text style={styles.textoBoton}>CATÁLOGO</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* ==========================================
          RENDERIZADO DE ESTADÍSTICAS
          ========================================== */}
      <View style={styles.cuadricula}>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Ingresos</Text>
          <Text style={[styles.valor, { color: '#4caf50' }]}>${ingresosGenerados.toFixed(2)}</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Ventas</Text>
          <Text style={styles.valor}>{totalBoletosVendidos}</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Películas</Text>
          <Text style={styles.valor}>{totalPeliculas}</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Funciones</Text>
          <Text style={styles.valor}>{totalFunciones}</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Asientos Disp.</Text>
          <Text style={styles.valor}>{asientosDisponibles}</Text>
        </View>
        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Asientos Ocup.</Text>
          <Text style={[styles.valor, { color: '#d32f2f' }]}>{asientosOcupados}</Text>
        </View>
      </View>

      <View style={styles.tarjetaDestacada}>
        <Text style={styles.etiqueta}>Película Más Reservada</Text>
        <Text style={styles.valorDestacado}>{peliculaMasReservada}</Text>
        <Text style={styles.subtexto}>{maxBoletos} boletos vendidos</Text>
      </View>

      {/* ==========================================
          RENDERIZADO DE CLIENTES
          ========================================== */}
      <View style={styles.seccionClientes}>
        <Text style={styles.tituloSecundario}>Lista de Compradores</Text>
        <Text style={styles.instruccionFiltro}>Selecciona una función activa:</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollFiltros}>
          {peliculasConVentas.map((p) => (
            <TouchableOpacity 
              key={p.codigo} 
              style={[styles.botonFiltro, peliculaSeleccionada === p.nombre && styles.botonFiltroActivo]}
              onPress={() => setPeliculaSeleccionada(p.nombre)}
            >
              <Text style={[styles.textoFiltro, peliculaSeleccionada === p.nombre && styles.textoFiltroActivo]}>
                {p.nombre} ({p.hora})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {peliculaSeleccionada ? (
          reservasMostradas.length > 0 ? (
            reservasMostradas.map((item) => (
              <View key={item.codigoReserva} style={styles.tarjetaReserva}>
                <View style={styles.infoReserva}>
                  <Text style={styles.codigoReserva}>{item.codigoReserva}</Text>
                  <Text style={styles.nombreCliente}>{item.nombreCliente}</Text>
                  <Text style={styles.correoCliente}>{item.correoCliente}</Text>
                  <Text style={styles.detalleReserva}>{item.funcion} • {item.salaAsignada}</Text>
                </View>
                <View style={styles.accionesReserva}>
                  <Text style={styles.estadoReserva}>{item.estado}</Text>
                  <TouchableOpacity style={styles.botonEditar} onPress={() => abrirModalEditar(item)}>
                    <Text style={styles.textoBotonEditar}>EDITAR</Text>
                  </TouchableOpacity>
                  {funcionYaPaso(item.funcion) && (
                    <TouchableOpacity style={styles.botonEliminar} onPress={() => confirmarEliminacion(item.codigoReserva)}>
                      <Text style={styles.textoBotonEliminar}>BORRAR</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.textoVacio}>No hay ventas para esta función.</Text>
          )
        ) : (
          <Text style={styles.textoVacio}>Selecciona una función arriba.</Text>
        )}
      </View>

      {/* MODAL DE EDICIÓN */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenedor}>
            <Text style={styles.modalTitulo}>Editar Cliente</Text>
            <TextInput style={styles.input} value={editNombre} onChangeText={setEditNombre} />
            <TextInput style={styles.input} value={editCorreo} onChangeText={setEditCorreo} keyboardType="email-address" autoCapitalize="none" />
            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalVisible(false)}><Text style={styles.textoBotonModal}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardarModal} onPress={guardarCambiosCliente}><Text style={styles.textoBotonModal}>GUARDAR</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0a0a0a', padding: 16 },
  cabeceraFlex: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tituloSecundario: { color: '#888', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  botonNavegacion: { backgroundColor: '#d32f2f', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tarjeta: { backgroundColor: '#1a1a1a', width: '48%', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  etiqueta: { color: '#888', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' },
  valor: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  tarjetaDestacada: { backgroundColor: '#4a1010', padding: 20, borderRadius: 8, borderWidth: 1, borderColor: '#d32f2f', alignItems: 'center', marginTop: 8 },
  valorDestacado: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subtexto: { color: '#aaa', fontSize: 14, marginTop: 4 },
  seccionClientes: { marginTop: 32 },
  instruccionFiltro: { color: '#aaa', fontSize: 12, marginVertical: 12 },
  scrollFiltros: { flexDirection: 'row', marginBottom: 16 },
  botonFiltro: { backgroundColor: '#222', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#444' },
  botonFiltroActivo: { backgroundColor: '#d32f2f', borderColor: '#d32f2f' },
  textoFiltro: { color: '#888', fontWeight: 'bold' },
  textoFiltroActivo: { color: '#fff' },
  textoVacio: { color: '#555', fontSize: 14, textAlign: 'center', marginTop: 20 },
  tarjetaReserva: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#333', flexDirection: 'row', justifyContent: 'space-between' },
  infoReserva: { flex: 1 },
  codigoReserva: { color: '#d32f2f', fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  nombreCliente: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  correoCliente: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  detalleReserva: { color: '#888', fontSize: 12 },
  accionesReserva: { alignItems: 'flex-end', justifyContent: 'space-between' },
  estadoReserva: { color: '#888', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold' },
  botonEditar: { backgroundColor: '#333', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, marginTop: 12 },
  textoBotonEditar: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  botonEliminar: { backgroundColor: '#4a1010', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4, marginTop: 8, borderWidth: 1, borderColor: '#d32f2f' },
  textoBotonEliminar: { color: '#d32f2f', fontSize: 12, fontWeight: 'bold' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  modalContenedor: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#333' },
  modalTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  input: { backgroundColor: '#222', color: '#fff', borderWidth: 1, borderColor: '#444', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  modalBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  botonCancelarModal: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#333', alignItems: 'center', marginRight: 8 },
  botonGuardarModal: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#4caf50', alignItems: 'center', marginLeft: 8 },
  textoBotonModal: { color: '#fff', fontWeight: 'bold' }
});