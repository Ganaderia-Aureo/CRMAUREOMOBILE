# Ganadería Áureo Mobile PWA

Aplicación móvil para gestión de campo (Altas y Bajas) optimizada para smartphones.

## Instalación

1.  Instalar dependencias:
    ```bash
    npm install
    ```

2.  Configurar Supabase:
    -   Crear un archivo `.env` en la raíz (basado en `.env.example`).
    -   Ejecutar el script SQL proporcionado en `SQL_SETUP.sql` en su dashboard de Supabase (Editor SQL).

3.  Ejecutar en desarrollo:
    ```bash
    npm run dev
    ```

## Características
-   **PWA**: Instalable en Android/iOS.
-   **Offline First**: Persistencia básica de sesión.
-   **Escáner QR/Barras**: Integrado para lectura de crotales.
-   **Diseño Fat Finger**: Botones grandes para facilitar el uso en campo.

## Iconos PWA
Para que la PWA sea instalable, asegúrese de añadir los iconos `pwa-192x192.png` y `pwa-512x512.png` en la carpeta `public`.
