import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export default function PeliculasScreen({ navigation }: any) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');

  // 1. Extraemos las películas sin filtrarlas 
  const todasLasPeliculas = useSelector((state: RootState) => state.peliculas.peliculas);

  // 2. Filtramos las fechas vigentes de forma independiente
  const peliculasVigentes = todasLasPeliculas.filter(p => {
    if (p.estado !== 'Disponible') return false;
    
    const [year, month, day] = p.fecha.split('-').map(Number);
    const [hour, minute] = p.hora.split(':').map(Number);
    const fechaFuncion = new Date(year, month - 1, day, hour, minute);
    
    return fechaFuncion > new Date();
  });

  // 3. Aplicamos el buscador y los filtros de género
  const peliculasFiltradas = peliculasVigentes.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             p.salaAsignada.toLowerCase().includes(busqueda.toLowerCase());
    const coincideGenero = filtroGenero ? p.genero === filtroGenero : true;
    return coincideBusqueda && coincideGenero;
  });

  const generosDisponibles = Array.from(new Set(peliculasVigentes.map(p => p.genero)));

  return (
    <View style={styles.contenedor}>
      
      <View style={styles.contenedorBuscador}>
        <TextInput
          style={styles.inputBuscador}
          placeholder="Buscar película o sala..."
          placeholderTextColor="#888"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <View style={styles.contenedorFiltros}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.botonFiltro, filtroGenero === '' && styles.botonFiltroActivo]}
            onPress={() => setFiltroGenero('')}
          >
            <Text style={[styles.textoFiltro, filtroGenero === '' && styles.textoFiltroActivo]}>Todos</Text>
          </TouchableOpacity>
          {generosDisponibles.map(genero => (
            <TouchableOpacity 
              key={genero}
              style={[styles.botonFiltro, filtroGenero === genero && styles.botonFiltroActivo]}
              onPress={() => setFiltroGenero(genero)}
            >
              <Text style={[styles.textoFiltro, filtroGenero === genero && styles.textoFiltroActivo]}>{genero}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={peliculasFiltradas}
        keyExtractor={item => item.codigo}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.tarjetaPelicula}
            onPress={() => navigation.navigate('Reserva', { pelicula: item })}
          >
            {item.imagenUrl ? (
              <Image source={{ uri: item.imagenUrl }} style={styles.poster} />
            ) : (
              <View style={styles.posterPlaceholder}>
                <Text style={styles.textoPlaceholder}>Sin Imagen</Text>
              </View>
            )}
            <View style={styles.infoPelicula}>
              <Text style={styles.tituloPelicula}>{item.nombre}</Text>
              <Text style={styles.detallePelicula}>{item.genero} • {item.clasificacion} • {item.duracion} min</Text>
              <Text style={styles.funcionPelicula}>{item.salaAsignada} | {item.fecha} a las {item.hora}</Text>
              <Text style={styles.precioPelicula}>${item.precio.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text style={{ color: '#888' }}>No hay funciones programadas.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0a0a0a' },
  contenedorBuscador: { padding: 16, paddingBottom: 8 },
  inputBuscador: { backgroundColor: '#1a1a1a', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  contenedorFiltros: { paddingHorizontal: 16, paddingBottom: 16 },
  botonFiltro: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  botonFiltroActivo: { backgroundColor: '#d32f2f', borderColor: '#d32f2f' },
  textoFiltro: { color: '#888', fontWeight: 'bold' },
  textoFiltroActivo: { color: '#fff' },
  lista: { padding: 16, paddingTop: 0 },
  tarjetaPelicula: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 12, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  poster: { width: 100, height: 150, resizeMode: 'cover' },
  posterPlaceholder: { width: 100, height: 150, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' },
  textoPlaceholder: { color: '#555', fontSize: 10 },
  infoPelicula: { flex: 1, padding: 12, justifyContent: 'center' },
  tituloPelicula: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  detallePelicula: { color: '#888', fontSize: 12, marginBottom: 8 },
  funcionPelicula: { color: '#fff', fontSize: 13, fontWeight: 'bold', backgroundColor: '#333', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  precioPelicula: { color: '#4caf50', fontSize: 16, fontWeight: 'bold' }
});