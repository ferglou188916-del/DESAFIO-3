import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { agregarSala, editarSala, eliminarSala, Sala } from '../redux/slices/salasSlice';

export default function SalasScreen() {
  const salas = useSelector((state: RootState) => state.salas.salas);
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nombreOriginal, setNombreOriginal] = useState('');
  
  const [nombreSala, setNombreSala] = useState('');
  const [cantidadFilas, setCantidadFilas] = useState('');

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setNombreSala('');
    setCantidadFilas('');
    setModalVisible(true);
  };

  const abrirModalEditar = (sala: Sala) => {
    setModoEdicion(true);
    setNombreOriginal(sala.nombre);
    setNombreSala(sala.nombre);
    setCantidadFilas((sala.distribucion.length / 5).toString());
    setModalVisible(true);
  };

  const confirmarEliminacion = (nombre: string) => {
    Alert.alert('Confirmar', `¿Estás seguro de borrar la ${nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => dispatch(eliminarSala(nombre)) }
    ]);
  };

  const guardarSala = () => {
    const filasInt = parseInt(cantidadFilas);
    
    if (!nombreSala.trim() || isNaN(filasInt) || filasInt <= 0 || filasInt > 20) {
      Alert.alert('Error', 'Ingresa un nombre válido y una cantidad de filas entre 1 y 20.');
      return;
    }

    const nombreLimpio = nombreSala.trim().toUpperCase();

    if (modoEdicion) {
      if (nombreLimpio !== nombreOriginal) {
        const existe = salas.find(s => s.nombre === nombreLimpio);
        if (existe) {
          Alert.alert('Error', 'Ya existe otra sala con ese nombre.');
          return;
        }
      }
      dispatch(editarSala({ nombreOriginal, nombreNuevo: nombreLimpio, filas: filasInt }));
    } else {
      const existe = salas.find(s => s.nombre === nombreLimpio);
      if (existe) {
        Alert.alert('Error', 'Ya existe una sala con ese nombre.');
        return;
      }
      dispatch(agregarSala({ nombre: nombreLimpio, filas: filasInt }));
    }

    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Sala }) => (
    <View style={styles.tarjetaSala}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nombreSala}>{item.nombre}</Text>
        <Text style={styles.detalleSala}>Capacidad: {item.distribucion.length} asientos</Text>
      </View>
      <View style={styles.acciones}>
        <TouchableOpacity style={styles.botonEditar} onPress={() => abrirModalEditar(item)}>
          <Text style={styles.textoAccion}>EDITAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.botonEliminar} onPress={() => confirmarEliminacion(item.nombre)}>
          <Text style={styles.textoAccion}>BORRAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Gestión de Salas</Text>
        <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalCrear}>
          <Text style={styles.textoBotonAgregar}>+ NUEVA SALA</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={salas}
        keyExtractor={item => item.nombre}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={{ color: '#888', textAlign: 'center', marginTop: 50 }}>No hay salas registradas.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenedor}>
            <Text style={styles.modalTitulo}>{modoEdicion ? 'Editar Sala' : 'Crear Nueva Sala'}</Text>
            
            <Text style={styles.label}>Nombre de la sala</Text>
            <TextInput style={styles.input} placeholderTextColor="#888" placeholder="Ej: SALA 1" value={nombreSala} onChangeText={setNombreSala} />
            
            <Text style={styles.label}>Cantidad de filas (máximo 20)</Text>
            <TextInput style={styles.input} placeholderTextColor="#888" placeholder="Ej: 11" keyboardType="numeric" value={cantidadFilas} onChangeText={setCantidadFilas} />

            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.textoBotonCancelar}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardar} onPress={guardarSala}>
                <Text style={styles.textoBotonGuardar}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0a0a0a' },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#333' },
  titulo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  botonAgregar: { backgroundColor: '#4caf50', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  textoBotonAgregar: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  lista: { padding: 16 },
  tarjetaSala: { flexDirection: 'row', backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  nombreSala: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  detalleSala: { color: '#888', fontSize: 14 },
  acciones: { flexDirection: 'row' },
  botonEditar: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, marginRight: 8 },
  botonEliminar: { backgroundColor: '#4a1010', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: '#d32f2f' },
  textoAccion: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  modalContenedor: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#333' },
  modalTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { color: '#888', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: '#222', color: '#fff', borderWidth: 1, borderColor: '#555', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 16 },
  modalBotones: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 16 },
  botonCancelar: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#333', alignItems: 'center', marginRight: 8 },
  textoBotonCancelar: { color: '#aaa', fontWeight: 'bold' },
  botonGuardar: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#4caf50', alignItems: 'center', marginLeft: 8 },
  textoBotonGuardar: { color: '#fff', fontWeight: 'bold' }
});