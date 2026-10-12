
import { Platform } from 'react-native';

type CompraConfirmada = {
  pelicula: string;
  cantidad: number;
  total: number;
  codigo: string;
};

export async function notificarCompraConfirmada(compra: CompraConfirmada): Promise<void> {
  try {
    if (Platform.OS === 'web') return;

    const Notifications = await import('expo-notifications');

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('compras', {
        name: 'Compras confirmadas',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    const permisoActual = await Notifications.getPermissionsAsync();

    const permiso = permisoActual.granted
      ? permisoActual
      : await Notifications.requestPermissionsAsync();

    if (!permiso.granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Compra confirmada en Wáchalo',
        body: `${compra.pelicula} · ${compra.cantidad} boleto${compra.cantidad === 1 ? '' : 's'} · $${compra.total.toFixed(2)}`,
        data: { codigo: compra.codigo },
        sound: 'default',
      },
      trigger: Platform.OS === 'android'
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
            channelId: 'compras',
          }
        : null,
    });
  } catch (error) {
    console.warn('No se pudo mostrar la notificación local:', error);
  }
}
