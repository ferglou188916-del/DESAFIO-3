import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import { RootState } from '../redux/store';
import { Reserva } from '../types/reserva';

export default function MisBoletosScreen() {
  const reservas = useSelector((state: RootState) => state.reservas.reservas);

  const renderItem = ({ item }: { item: Reserva }) => (
    <View style={[styles.boletoTarjeta, item.estado === 'Utilizado' && styles.boletoUtilizado]}>
      <View style={styles.boletoEncabezado}>
        <Text style={styles.codigoReserva}>{item.codigoReserva}</Text>
        <Text style={[styles.estadoBoleto, item.estado === 'Utilizado' ? styles.textoEstadoUtilizado : styles.textoEstadoValido]}>
          {item.estado.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.tituloPelicula}>{item.peliculaNombre}</Text>
      <Text style={styles.fechaFuncion}>{item.funcion} • {item.salaAsignada}</Text>
      
      <View style={styles.cuerpoBoleto}>
        <View style={styles.detalleBoleto}>
          <View style={styles.filaDetalle}>
            <Text style={styles.etiqueta}>Cliente</Text>
            <Text style={styles.valor}>{item.nombreCliente}</Text>
          </View>
          <View style={styles.filaDetalle}>
            <Text style={styles.etiqueta}>Asientos ({item.cantidadBoletos})</Text>
            <Text style={styles.valorAsientos}>{item.asientos.join(', ')}</Text>
          </View>
        </View>

        <View style={styles.qrContenedor}>
          <QRCode
            value={item.codigoReserva}
            size={80}
            color={item.estado === 'Utilizado' ? '#888' : '#fff'}
            backgroundColor="transparent"
          />
        </View>
      </View>
      
      <View style={styles.boletoPie}>
        <Text style={styles.etiquetaTotal}>Total Pagado:</Text>
        <Text style={styles.valorTotal}>${item.totalPagado.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <FlatList
  data={reservas as any[]}
  keyExtractor={(item: any) => item.codigoReserva}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vacioContenedor}>
            <Text style={styles.textoVacio}>Aún no tienes boletos comprados.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#0a0a0a' },
  lista: { padding: 16 },
  vacioContenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  textoVacio: { color: '#888', fontSize: 16 },
  
  boletoTarjeta: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  boletoUtilizado: { opacity: 0.6, borderColor: '#555' },
  
  boletoEncabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  codigoReserva: { color: '#d32f2f', fontWeight: 'bold', fontSize: 14 },
  estadoBoleto: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  textoEstadoValido: { color: '#4caf50', borderColor: '#4caf50', backgroundColor: 'rgba(76, 175, 80, 0.1)' },
  textoEstadoUtilizado: { color: '#888', borderColor: '#888', backgroundColor: 'rgba(136, 136, 136, 0.1)' },
  
  tituloPelicula: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  fechaFuncion: { color: '#c5a059', fontSize: 14, marginBottom: 16 },
  
  cuerpoBoleto: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, backgroundColor: '#111', padding: 12, borderRadius: 6 },
  detalleBoleto: { flex: 1, marginRight: 16 },
  filaDetalle: { marginBottom: 8 },
  etiqueta: { color: '#666', fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  valor: { color: '#ddd', fontSize: 14 },
  valorAsientos: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  qrContenedor: { backgroundColor: '#222', padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  boletoPie: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333', paddingTop: 12 },
  etiquetaTotal: { color: '#aaa', fontSize: 14 },
  valorTotal: { color: '#4caf50', fontSize: 18, fontWeight: 'bold' }
});