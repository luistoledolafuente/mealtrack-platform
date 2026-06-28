# ADR-0001: Usar Flutter como frontend principal móvil

**Estado:** Aceptado

## Contexto
MealTrack necesita una aplicación móvil para estudiantes y administradores operativos. Se evaluaron opciones como React Native, Flutter y desarrollo nativo (Kotlin/Swift). Los criterios considerados incluyen: rendimiento, velocidad de desarrollo, curva de aprendizaje, experiencia multiplataforma y alineación con el objetivo mobile-first del proyecto.

## Decisión
Usar Flutter como tecnología principal para el cliente móvil de MealTrack.

## Consecuencias
- Positivas: una sola base de código para Android e iOS, buena experiencia visual, alineación con el objetivo mobile-first, productividad alta con Hot Reload.
- Negativas: curva de aprendizaje en Dart, necesidad de definir bien la integración con backend y almacenamiento local.
- Seguimiento: definir arquitectura Flutter por capas y estrategia de sincronización offline-first.
