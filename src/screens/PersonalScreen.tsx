import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { agregarPelicula, editarPelicula, eliminarPelicula } from '../redux/slices/peliculasSlice';
import { Pelicula } from '../types/pelicula';

export default function PersonalScreen({ navigation }: any) {
  const peliculas = useSelector((state: RootState) => state.peliculas.peliculas);
  const salasDisponibles = useSelector((state: RootState) => state.salas.salas);
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState('');
  const [duracion, setDuracion] = useState('');
  const [clasificacion, setClasificacion] = useState('');
  const [salaAsignada, setSalaAsignada] = useState('');
  const [precio, setPrecio] = useState('');
  const [estado, setEstado] = useState<'Disponible' | 'No disponible'>('Disponible');
  const [imagenUrl, setImagenUrl] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const abrirModalCrear = () => {
    if (salasDisponibles.length === 0) {
      Alert.alert('Atención', 'Primero debes crear al menos una sala en la sección "SALAS".');
      return;
    }
    
    setModoEdicion(false);
    setCodigo(`WCH-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    setNombre('');
    setGenero('');
    setDuracion('');
    setClasificacion('');
    setSalaAsignada(salasDisponibles[0].nombre); 
    setPrecio('');
    setEstado('Disponible');
    setImagenUrl('');
    
    const hoy = new Date();
    setFecha(hoy.toISOString().split('T')[0]); 
    setHora('18:00');
    
    setModalVisible(true);
  };

  const abrirModalEditar = (p: Pelicula) => {
    setModoEdicion(true);
    setCodigo(p.codigo);
    setNombre(p.nombre);
    setGenero(p.genero);
    setDuracion(p.duracion.toString());
    setClasificacion(p.clasificacion);
    setSalaAsignada(p.salaAsignada);
    setPrecio(p.precio.toString());
    setEstado(p.estado);
    setImagenUrl(p.imagenUrl);
    setFecha(p.fecha);
    setHora(p.hora);
    setModalVisible(true);
  };

  const guardarPelicula = () => {
    if (!nombre || !genero || !duracion || !clasificacion || !precio || !imagenUrl || !fecha || !hora) {
      Alert.alert('Error', 'Completa todos los campos obligatorios.');
      return;
    }

    const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;
    
    if (!regexFecha.test(fecha) || !regexHora.test(hora)) {
      Alert.alert('Formato Inválido', 'Usa AAAA-MM-DD para la fecha y HH:MM para la hora (24h).');
      return;
    }

    if (parseFloat(precio) < 0) {
      Alert.alert('Error', 'El precio no puede ser negativo.');
      return;
    }

    const conflicto = peliculas.find(
      (p) => 
        p.salaAsignada === salaAsignada && 
        p.fecha === fecha &&
        p.hora === hora &&
        p.estado === 'Disponible' &&
        p.codigo !== codigo 
    );

    if (conflicto && estado === 'Disponible') {
      Alert.alert(
        'Conflicto de Horario',
        `La ${salaAsignada} ya tiene programada "${conflicto.nombre}" el ${fecha} a las ${hora}.`
      );
      return;
    }

    const nuevaPelicula: Pelicula = {
      codigo, nombre: nombre.trim(), genero, duracion: parseInt(duracion),
      clasificacion, salaAsignada, precio: parseFloat(precio), estado, imagenUrl,
      fecha, hora
    };

    if (modoEdicion) dispatch(editarPelicula(nuevaPelicula));
    else dispatch(agregarPelicula(nuevaPelicula));
    
    setModalVisible(false);
  };

  const confirmarEliminacion = (codigoPelicula: string) => {
    Alert.alert('Confirmar', '¿Estás seguro de borrar esta función?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => dispatch(eliminarPelicula(codigoPelicula)) }
    ]);
  };

  const renderItem = ({ item }: { item: Pelicula }) => (
    <View style={styles.filaPelicula}>
      <View style={styles.infoPelicula}>
        <Text style={styles.textoNombre}>{item.nombre}</Text>
        <Text style={styles.textoDetalle}>{item.salaAsignada} • {item.fecha} {item.hora} • {item.estado}</Text>
      </View>
      <View style={styles.acciones}>
        <TouchableOpacity style={styles.botonEditar} onPress={() => abrirModalEditar(item)}><Text style={styles.textoAccion}>EDITAR</Text></TouchableOpacity>
        <TouchableOpacity style={styles.botonEliminar} onPress={() => confirmarEliminacion(item.codigo)}><Text style={styles.textoAccion}>BORRAR</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>Programación</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity style={[styles.botonAgregar, { backgroundColor: '#4caf50', marginRight: 8 }]} onPress={() => navigation.navigate('Escaner')}>
            <Text style={styles.textoBotonAgregar}>📷 ESCANEAR QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalCrear}>
            <Text style={styles.textoBotonAgregar}>+ AGREGAR</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={peliculas}
        keyExtractor={item => item.codigo}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<View style={{ marginTop: 50, alignItems: 'center' }}><Text style={{ color: '#888' }}>No hay funciones registradas.</Text></View>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenedor}>
            <Text style={styles.modalTitulo}>{modoEdicion ? 'Editar Función' : 'Nueva Función'}</Text>
            
            <ScrollView style={styles.scrollModal} showsVerticalScrollIndicator={false}>
              <Text style={styles.codigoAutogenerado}>Código Asignado: {codigo}</Text>
              
              <Text style={styles.labelFormulario}>Título de la película</Text>
              <TextInput style={styles.input} placeholderTextColor="#555" placeholder="Ej: Matrix" value={nombre} onChangeText={setNombre} />
              
              <Text style={styles.labelFormulario}>URL del Póster</Text>
              <TextInput style={styles.input} placeholderTextColor="#555" value={imagenUrl} onChangeText={setImagenUrl} autoCapitalize="none" />
              
              <View style={styles.filaFormulario}>
                <View style={{ flex: 1, marginRight: 8 }}>
                   <Text style={styles.labelFormulario}>Fecha (AAAA-MM-DD)</Text>
                   <TextInput style={styles.input} placeholderTextColor="#555" placeholder="2026-09-10" value={fecha} onChangeText={setFecha} />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={styles.labelFormulario}>Hora (HH:MM)</Text>
                   <TextInput style={styles.input} placeholderTextColor="#555" placeholder="19:00" value={hora} onChangeText={setHora} />
                </View>
              </View>

              <View style={styles.filaFormulario}>
                <View style={{ flex: 1, marginRight: 8 }}>
                   <Text style={styles.labelFormulario}>Género</Text>
                   <TextInput style={styles.input} placeholderTextColor="#555" placeholder="Ej: Animado" value={genero} onChangeText={setGenero} />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={styles.labelFormulario}>Duración (min)</Text>
                   <TextInput style={styles.input} placeholderTextColor="#555" placeholder="120" keyboardType="numeric" value={duracion} onChangeText={setDuracion} />
                </View>
              </View>

              <View style={styles.filaFormulario}>
                <View style={{ flex: 1, marginRight: 8 }}>
                   <Text style={styles.labelFormulario}>Clasificación</Text>
                   <TextInput style={styles.input} placeholderTextColor="#555" placeholder="Ej: A" value={clasificacion} onChangeText={setClasificacion} />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={styles.labelFormulario}>Precio ($)</Text>
                   <TextInput style={styles.input} placeholderTextColor="#555" placeholder="4.50" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
                </View>
              </View>

              <Text style={styles.etiqueta}>Sala Asignada:</Text>
              <View style={[styles.filaBotones, { flexWrap: 'wrap' }]}>
                {salasDisponibles.map(sala => (
                  <TouchableOpacity key={sala.nombre} style={[styles.botonSeleccion, salaAsignada === sala.nombre && styles.botonSeleccionActivo, { marginBottom: 8 }]} onPress={() => setSalaAsignada(sala.nombre)}>
                    <Text style={[styles.textoSeleccion, salaAsignada === sala.nombre && styles.textoSeleccionActivo]}>{sala.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.etiqueta}>Estado:</Text>
              <View style={styles.filaBotones}>
                {['Disponible', 'No disponible'].map(est => (
                  <TouchableOpacity key={est} style={[styles.botonSeleccion, estado === est && styles.botonSeleccionActivo]} onPress={() => setEstado(est as any)}>
                    <Text style={[styles.textoSeleccion, estado === est && styles.textoSeleccionActivo]}>{est}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalVisible(false)}><Text style={styles.textoBotonCancelar}>CANCELAR</Text></TouchableOpacity>
              <TouchableOpacity style={styles.botonGuardarModal} onPress={guardarPelicula}><Text style={styles.textoBotonGuardar}>GUARDAR</Text></TouchableOpacity>
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
  botonAgregar: { backgroundColor: '#d32f2f', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  textoBotonAgregar: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  lista: { padding: 16 },
  filaPelicula: { backgroundColor: '#1a1a1a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  infoPelicula: { flex: 1 },
  textoNombre: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  textoDetalle: { color: '#888', fontSize: 12 },
  acciones: { flexDirection: 'row' },
  botonEditar: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, marginRight: 8 },
  botonEliminar: { backgroundColor: '#4a1010', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: '#d32f2f' },
  textoAccion: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  modalContenedor: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#333', maxHeight: '90%' },
  modalTitulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  scrollModal: { marginBottom: 16 },
  codigoAutogenerado: { color: '#d32f2f', fontSize: 12, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  labelFormulario: { color: '#888', fontSize: 10, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#222', color: '#fff', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  filaFormulario: { flexDirection: 'row', justifyContent: 'space-between' },
  etiqueta: { color: '#888', fontSize: 12, marginBottom: 8, marginTop: 4, fontWeight: 'bold' },
  filaBotones: { flexDirection: 'row', marginBottom: 16 },
  botonSeleccion: { minWidth: '45%', flex: 1, backgroundColor: '#222', borderWidth: 1, borderColor: '#333', paddingVertical: 10, alignItems: 'center', borderRadius: 6, marginHorizontal: 4 },
  botonSeleccionActivo: { backgroundColor: '#4a1010', borderColor: '#d32f2f' },
  textoSeleccion: { color: '#888', fontWeight: 'bold', fontSize: 12 },
  textoSeleccionActivo: { color: '#fff' },
  modalBotones: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 16 },
  botonCancelarModal: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#333', alignItems: 'center', marginRight: 8 },
  textoBotonCancelar: { color: '#aaa', fontWeight: 'bold' },
  botonGuardarModal: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#d32f2f', alignItems: 'center', marginLeft: 8 },
  textoBotonGuardar: { color: '#fff', fontWeight: 'bold' }
});