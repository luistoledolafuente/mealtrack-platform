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

## Offline-first

- Los datos se guardan localmente primero
- Las acciones se encolan en SyncQueue
- Los repositorios coordinan fuente local y remota
- IDs UUID generados en cliente
