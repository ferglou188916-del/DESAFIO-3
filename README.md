# Wáchalo - Desafío Práctico 3

Aplicación móvil desarrollada con React Native, TypeScript y Expo para la gestión de funciones de cine, compra de boletos y validación de entradas mediante códigos QR.

Este proyecto continúa el desarrollo del Desafío 2 e incorpora una API REST, persistencia en MySQL y notificaciones locales.

## Tecnologías utilizadas

- React Native y Expo SDK 57
- TypeScript
- Redux Toolkit
- Node.js y Express (backend)
- MySQL
- Railway
- expo-notifications
- EAS Build

## Funcionalidades

- Cartelera de películas conectada a Railway.
- Administración de películas y salas.
- Compra de boletos y selección de asientos.
- Bloqueo de asientos ocupados.
- Historial de compras con códigos QR.
- Validación de entradas desde otro dispositivo.
- Dashboard de ventas e ingresos.
- Sincronización de información entre dispositivos.
- Notificaciones locales después de una compra confirmada.

## Instalación

1. Clonar este repositorio:

   git clone https://github.com/ferglou188916-del/DESAFIO-3.git

2. Ingresar a la carpeta:

   cd DESAFIO-3

3. Instalar las dependencias:

   npm install

4. Crear el archivo .env a partir de .env.example y configurar:

   EXPO_PUBLIC_API_URL=https://watchalo-api-production-8d5a.up.railway.app

5. Iniciar el proyecto:

   npx expo start --clear

6. Abrir la aplicación utilizando Expo Go para las funcionalidades compatibles.

## APK Android

Para probar la aplicación completa, incluyendo las notificaciones locales, se recomienda utilizar la APK generada mediante EAS Build.

Comando:

   npx eas build --platform android --profile preview

La configuración correspondiente se encuentra en eas.json.

## API REST

Repositorio del backend:

https://github.com/ferglou188916-del/watchalo-api

API desplegada en Railway:

https://watchalo-api-production-8d5a.up.railway.app

Endpoints de consulta:

- GET /peliculas
- GET /salas
- GET /reservas

La API utiliza MySQL para almacenar películas, salas, usuarios y reservas.

## Requisitos

- Node.js y npm
- Expo CLI
- Android o emulador compatible
- Conexión a Internet
- API REST disponible

## Consideraciones

- El archivo .env no se incluye en el repositorio.
- La configuración de ejemplo está disponible en .env.example.
- Expo Go tiene limitaciones para determinadas funciones nativas de notificaciones.
- La APK permite ejecutar la aplicación sin depender del servidor Metro.
- El servicio Railway debe estar disponible para consultar y guardar información.
- Las credenciales privadas de MySQL no forman parte de este repositorio.

## Proyecto académico

Desafío Práctico 3 - Aplicación móvil Wáchalo.
