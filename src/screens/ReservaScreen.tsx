import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { Pelicula } from '../types/pelicula';
import { ocuparAsientos } from '../redux/slices/salasSlice';
import { agregarReserva } from '../redux/slices/reservasSlice';

export default function ReservaScreen({ route, navigation }: any) {
  const { pelicula } = route.params as { pelicula: Pelicula };
  const dispatch = useDispatch();

  const sala = useSelector((state: RootState) => 
    state.salas.salas.find(s => s.nombre === pelicula.salaAsignada)
  );

  const [cantidadBoletos, setCantidadBoletos] = useState(1);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreCliente, setNombreCliente] = useState('');
  const [correoCliente, setCorreoCliente] = useState('');

  if (!sala) return <View style={styles.contenedor}><Text style={styles.textoBlanco}>Sala no encontrada</Text></View>;

  const toggleAsiento = (id: string) => {
    if (asientosSeleccionados.includes(id)) {
      setAsientosSeleccionados(prev => prev.filter(asientoId => asientoId !== id));
    } else {
      if (asientosSeleccionados.length >= cantidadBoletos) {
        Alert.alert('Límite alcanzado', `Solo puedes seleccionar ${cantidadBoletos} asientos a la vez.`);
        return;
      }
      setAsientosSeleccionados(prev => [...prev, id]);
    }
  };

  const totalPagado = cantidadBoletos * pelicula.precio;

  const procesarPago = () => {
    if (!nombreCliente.trim() || !correoCliente.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre y correo.');
      return;
    }

    // Validación estricta de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoCliente.trim())) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido (ej: usuario@correo.com).');
      return;
    }

    const codigoGenerado = Math.random().toString(36).substring(2, 10).toUpperCase();

    dispatch(agregarReserva({
      codigoReserva: codigoGenerado,
      peliculaNombre: pelicula.nombre,
      funcion: `${pelicula.fecha} a las ${pelicula.hora}`,
      salaAsignada: pelicula.salaAsignada,
      asientos: asientosSeleccionados,
      cantidadBoletos: cantidadBoletos,
      totalPagado: totalPagado,
      nombreCliente: nombreCliente.trim(),
      correoCliente: correoCliente.trim(),
      estado: 'Válido'
    }));

    dispatch(ocuparAsientos({
      salaNombre: sala.nombre,
      asientosIds: asientosSeleccionados
    }));

    setModalVisible(false);
    setNombreCliente('');
    setCorreoCliente('');
    Alert.alert('Compra Exitosa', 'Tus boletos han sido reservados.', [
      { text: 'Ver mis boletos', onPress: () => navigation.navigate('Mis Boletos') }
    ]);
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.infoPelicula}>
        <Text style={styles.titulo}>{pelicula.nombre}</Text>
        <Text style={styles.subtitulo}>{pelicula.salaAsignada} • {pelicula.fecha} {pelicula.hora}</Text>
        <Text style={styles.precio}>Precio: ${pelicula.precio.toFixed(2)}</Text>
      </View>

      <View style={styles.selectorCantidad}>
        <Text style={styles.labelCantidad}>Cantidad de boletos:</Text>
        <View style={styles.controlesCantidad}>
          <TouchableOpacity style={styles.botonCantidad} onPress={() => setCantidadBoletos(Math.max(1, cantidadBoletos - 1))}><Text style={styles.textoBotonCantidad}>-</Text></TouchableOpacity>
          <Text style={styles.textoCantidad}>{cantidadBoletos}</Text>
          <TouchableOpacity style={styles.botonCantidad} onPress={() => setCantidadBoletos(Math.min(20, cantidadBoletos + 1))}><Text style={styles.textoBotonCantidad}>+</Text></TouchableOpacity>
        </View>
      </View>

      <Text style={styles.instruccion}>Toca la cuadrícula para seleccionar tus asientos</Text>

      <View style={styles.pantallaCineContenedor}>
        <View style={styles.pantallaCine} />
        <Text style={styles.textoPantalla}>PANTALLA</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.mapaAsientos}>
          {Array.from(new Set(sala.distribucion.map(a => a.id.charAt(0)))).map(filaLetra => (
            <View key={filaLetra} style={styles.filaAsientos}>
              <Text style={styles.letraFila}>{filaLetra}</Text>
              {sala.distribucion.filter(a => a.id.charAt(0) === filaLetra).map(asiento => {
                const isSeleccionado = asientosSeleccionados.includes(asiento.id);
                const isOcupado = asiento.estado === 'Ocupado';

                return (
                  <TouchableOpacity
                    key={asiento.id}
                    style={[styles.asiento, isSeleccionado && styles.asientoSeleccionado, isOcupado && styles.asientoOcupado]}
                    disabled={isOcupado}
                    onPress={() => toggleAsiento(asiento.id)}
                  >
                    <Text style={styles.textoAsiento}>{asiento.id.substring(1)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.leyenda}>
        <View style={styles.itemLeyenda}><View style={[styles.cuadroLeyenda, styles.asientoLibre]} /><Text style={styles.textoLeyenda}>Libre</Text></View>
        <View style={styles.itemLeyenda}><View style={[styles.cuadroLeyenda, styles.asientoSeleccionado]} /><Text style={styles.textoLeyenda}>Seleccionado</Text></View>
        <View style={styles.itemLeyenda}><View style={[styles.cuadroLeyenda, styles.asientoOcupado]} /><Text style={styles.textoLeyenda}>Ocupado</Text></View>
      </View>

      <View style={styles.resumenCompra}>
        <Text style={styles.textoResumen}>Total: ${totalPagado.toFixed(2)}</Text>
        <TouchableOpacity 
          style={[styles.botonComprar, asientosSeleccionados.length !== cantidadBoletos && styles.botonDeshabilitado]}
          disabled={asientosSeleccionados.length !== cantidadBoletos}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.textoBotonComprar}>PAGAR</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenedor}>
            <Text style={styles.modalTitulo}>Confirmar Compra</Text>
            <TextInput style={styles.input} placeholder="Tu Nombre" placeholderTextColor="#888" value={nombreCliente} onChangeText={setNombreCliente} />
            <TextInput style={styles.input} placeholder="Tu Correo" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" value={correoCliente} onChangeText={setCorreoCliente} />
            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalVisible(false)}><Text style={styles.textoBotonCancelar}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardarModal} onPress={procesarPago}><Text style={styles.textoBotonGuardar}>CONFIRMAR</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0a0a0a' },
  textoBlanco: { color: '#fff' },
  infoPelicula: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
  titulo: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  subtitulo: { color: '#aaa', fontSize: 16, marginTop: 4 },
  precio: { color: '#4caf50', fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  selectorCantidad: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  labelCantidad: { color: '#fff', fontSize: 16 },
  controlesCantidad: { flexDirection: 'row', alignItems: 'center' },
  botonCantidad: { backgroundColor: '#333', width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  textoBotonCantidad: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  textoCantidad: { color: '#fff', fontSize: 18, marginHorizontal: 16, fontWeight: 'bold' },
  instruccion: { color: '#888', textAlign: 'center', marginVertical: 10 },
  pantallaCineContenedor: { alignItems: 'center', marginBottom: 20 },
  pantallaCine: { width: '80%', height: 5, backgroundColor: '#d32f2f', borderRadius: 5, shadowColor: '#d32f2f', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  textoPantalla: { color: '#888', fontSize: 10, marginTop: 8, letterSpacing: 2 },
  mapaAsientos: { paddingHorizontal: 20 },
  filaAsientos: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  letraFila: { color: '#888', width: 30, fontSize: 16, fontWeight: 'bold' },
  asiento: { width: 40, height: 40, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  asientoSeleccionado: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  asientoOcupado: { backgroundColor: '#222', borderColor: '#111', opacity: 0.5 },
  textoAsiento: { color: '#fff', fontSize: 12 },
  leyenda: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, paddingBottom: 20 },
  itemLeyenda: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  cuadroLeyenda: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },
  asientoLibre: { backgroundColor: '#333' },
  textoLeyenda: { color: '#888', fontSize: 12 },
  resumenCompra: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#111', borderTopWidth: 1, borderTopColor: '#333' },
  textoResumen: { color: '#4caf50', fontSize: 20, fontWeight: 'bold' },
  botonComprar: { backgroundColor: '#d32f2f', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  botonDeshabilitado: { backgroundColor: '#555' },
  textoBotonComprar: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  modalContenedor: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#333' },
  modalTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#222', color: '#fff', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 12 },
  modalBotones: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 16 },
  botonCancelarModal: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#333', alignItems: 'center', marginRight: 8 },
  textoBotonCancelar: { color: '#aaa', fontWeight: 'bold' },
  botonGuardarModal: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#4caf50', alignItems: 'center', marginLeft: 8 },
  textoBotonGuardar: { color: '#fff', fontWeight: 'bold' }
});