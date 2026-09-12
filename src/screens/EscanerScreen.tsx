import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { marcarBoletoUtilizado } from '../redux/slices/reservasSlice';

export default function EscanerScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  const reservas = useSelector((state: RootState) => state.reservas.reservas);
  const dispatch = useDispatch();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const manejarCodigoEscaneado = ({ type, data }: any) => {
    setScanned(true);
    
    const reserva = reservas.find(r => r.codigoReserva === data);

    if (!reserva) {
      Alert.alert(
        'Boleto Inválido',
        `El código ${data} no se encuentra registrado en el sistema.`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    if (reserva.estado === 'Utilizado') {
      Alert.alert(
        'Boleto ya utilizado',
        `El código ${data} ya fue escaneado anteriormente.\nCliente: ${reserva.nombreCliente}`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    if (reserva.estado === 'Cancelado') {
      Alert.alert(
        'Boleto Cancelado',
        `Esta reserva fue cancelada y no es válida.`,
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    dispatch(marcarBoletoUtilizado(data));
    
    Alert.alert(
      'Acceso Permitido',
      `Boleto válido.\n\nCliente: ${reserva.nombreCliente}\nPelícula: ${reserva.peliculaNombre}\nAsientos: ${reserva.asientos.join(', ')}\nSala: ${reserva.salaAsignada}`,
      [{ text: 'OK', onPress: () => setScanned(false) }]
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.textoFondo}>Solicitando permiso de cámara...</Text></View>;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.textoFondo}>No hay acceso a la cámara.</Text>
        <Button title="Volver" onPress={() => navigation.goBack()} color="#d32f2f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => navigation.goBack()}>
          <Text style={styles.textoBoton}>CERRAR ESCÁNER</Text>
        </TouchableOpacity>
        <Text style={styles.instruccion}>Apunta la cámara al código QR del boleto</Text>
      </View>
      
      <CameraView
        onBarcodeScanned={scanned ? undefined : manejarCodigoEscaneado}
        style={styles.camaraFull}
      />
      
      {/* El pointerEvents va como propiedad del View, no en los estilos */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.marcoQR} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center' },
  textoFondo: { color: '#fff', textAlign: 'center', marginBottom: 20 },
  header: { position: 'absolute', top: 40, left: 0, right: 0, zIndex: 10, alignItems: 'center', paddingHorizontal: 20 },
  botonVolver: { backgroundColor: '#d32f2f', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginBottom: 16 },
  textoBoton: { color: '#fff', fontWeight: 'bold' },
  instruccion: { color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 6, fontWeight: 'bold' },
  
  // Reemplazo de StyleSheet.absoluteFillObject
  camaraFull: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  
  marcoQR: { width: 250, height: 250, borderWidth: 2, borderColor: '#4caf50', backgroundColor: 'transparent' }
});