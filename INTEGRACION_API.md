# Watchalo · Integración inicial de cartelera

Esta entrega conecta `GET /peliculas` con Redux mediante `createAsyncThunk` y conserva la interfaz, los filtros y las pantallas originales. Incluye errores de conexión, indicador de carga y uso del caché persistido al fallar una actualización.

## Configurar

1. Copia `.env.example` como `.env`.
2. Sustituye `192.168.1.100` por la IP IPv4 LAN del equipo que ejecuta `api-cine` (en PowerShell: `ipconfig`). Teléfono y PC deben compartir una red que permita conectarse entre sí.
3. Mantén funcionando la API en puerto 3000. Comprueba desde el navegador del teléfono `http://IP_DEL_PC:3000/peliculas` antes de abrir Expo.
4. Ejecuta `npm install` y `npx expo start --clear` en la carpeta de Watchalo.
5. Abre la app con Expo Go si tu SDK es compatible con la versión instalada o utiliza un development build.

Emulador Android local con el emulador estándar: usa `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`; dispositivo físico: usa `http://IP_DEL_PC:3000`. En Railway: usa la URL HTTPS pública para ambos.

## Pendiente de esta primera entrega

El CRUD desde Personal, el registro de reservas, ocupación de asientos, QR, Dashboard y notificaciones **siguen usando la implementación previa local**. No presentar esta entrega como el Desafío 3 completo; es la integración de la cartelera y el servicio HTTP tipado. No subas `.env` a GitHub.
