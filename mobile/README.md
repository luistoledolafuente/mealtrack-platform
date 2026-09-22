# MealTrack Mobile

Aplicación Flutter para estudiantes y administradores de MealTrack.

## Stack

- **Framework:** Flutter 3.x
- **State management:** Provider
- **Navigation:** GoRouter
- **Local storage:** SharedPreferences
- **Sync:** Connectivity-aware offline queue

## Inicio rápido

```bash
flutter pub get
flutter run
flutter test
```

## Estructura

```
lib/
├── core/         # Config, network, storage, theme, routes, errors
├── features/     # 9 features (auth, dashboards, calendar, etc.)
├── shared/       # Widgets, providers, helpers compartidos
└── main.dart
```

Cada feature se organiza en: `data/` → `domain/` → `presentation/` → `widgets/`.

## Features

| Feature | Descripción |
|---|---|
| auth | Login, logout, sesión |
| student_dashboard | Resumen de días, saldo, vencimiento |
| meal_calendar | Calendario de consumo diario |
| subscriptions | Planes activos e historial |
| payments | Pagos y estado de cuenta |
| adjustments | Solicitudes de ajuste |
| notifications | Alertas y recordatorios |
| admin_dashboard | Dashboard operativo |
| audit | Visualización de auditoría |

## Compilación y Entornos

### Desarrollo Local (Debug)

Por defecto, la app apunta a `http://10.0.2.2:3000/api/v1` (Android Emulator):

```bash
flutter run
```

### VPS de prueba (Release interno)

Para compilar un APK interno contra la API HTTPS del VPS:

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.example.com/api/v1
```

> **Nota de Seguridad:** En construcciones Release (`--release`), el tráfico HTTP sin cifrar (`http://`) está totalmente prohibido a nivel de código Dart y manifiesto Android. Solo se permiten conexiones HTTPS.

### Pendientes para Distribución Externa (Producción)

Para una distribución externa pública o de producción (Google Play / App Store), se requiere:

1. **`applicationId` definitivo:** Reemplazar `com.example.mealtrack` en `android/app/build.gradle.kts` por el identificador de paquete oficial (ej. `com.mealtrack.app`).
2. **Keystore de Producción:** Generar una llave privada de firma Java KeyStore (`key.jks`) almacenada de forma segura (fuera de Git).
3. **Configuración de Firma Release en Gradle:** Configurar `signingConfigs` en `android/app/build.gradle.kts` con variables de entorno o `key.properties` para firmar el APK/AAB de producción.
