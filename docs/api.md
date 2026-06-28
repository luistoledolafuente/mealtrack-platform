# API del sistema - MealTrack

## Propósito del documento
Este documento define el contrato inicial de la API de MealTrack. Un enfoque contract-first con OpenAPI ayuda a acordar endpoints, payloads, autenticación, respuestas y errores antes de implementar el backend, reduciendo desalineaciones entre frontend y servidor [1][2].

## Objetivo de la API
La API permitirá que la aplicación móvil y futuras interfaces administrativas interactúen con el backend para gestionar autenticación, usuarios, restaurantes, pensiones, consumos, pagos, ajustes, dashboards y auditoría.

## Principios de diseño
- API REST orientada a recursos.
- Respuestas consistentes.
- Errores estandarizados.
- Seguridad por autenticación y rol.
- Aislamiento multi-tenant por restaurante.
- Compatibilidad con clientes móviles offline-first.

## Convenciones generales

### Base URL
```text
/api/v1
```

### Formato de datos
- Request: `application/json`
- Response: `application/json`

### Autenticación
La API usará autenticación basada en token. El cliente enviará el token en la cabecera:

```http
Authorization: Bearer <token>
```

### Versionado
La API comenzará con versión `v1` en la URL para facilitar evolución futura.

## Formato estándar de respuesta

### Respuesta exitosa
```json
{
  "success": true,
  "message": "Operación realizada correctamente",
  "data": {}
}
```

### Respuesta con error
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

## Códigos HTTP principales
- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

## Recursos principales

### 1. Auth

#### POST /auth/login
Inicia sesión.

**Body**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "fullName": "Luis Miguel",
      "email": "user@example.com",
      "role": "student"
    }
  }
}
```

#### POST /auth/logout
Cierra la sesión actual.

#### GET /auth/me
Devuelve información del usuario autenticado.

### 2. Users

#### GET /users/me
Obtiene el perfil del usuario autenticado.

#### PATCH /users/me
Actualiza datos básicos del perfil.

**Body sugerido**
```json
{
  "fullName": "Nuevo nombre",
  "phone": "999999999"
}
```

### 3. Restaurants

#### GET /restaurants
Lista restaurantes visibles para el rol autorizado.

#### POST /restaurants
Crea un restaurante. Solo superadmin.

#### GET /restaurants/{restaurantId}
Obtiene detalle de restaurante.

#### PATCH /restaurants/{restaurantId}
Actualiza datos del restaurante.

### 4. Meal plans

#### GET /meal-plans
Lista planes de comida del restaurante actual.

#### POST /meal-plans
Crea un plan de comida.

**Body**
```json
{
  "name": "Plan mensual 30 días",
  "description": "Plan de almuerzos para estudiantes",
  "price": 270,
  "contractedDays": 30
}
```

#### GET /meal-plans/{mealPlanId}
Obtiene detalle del plan.

#### PATCH /meal-plans/{mealPlanId}
Actualiza un plan.

### 5. Subscriptions

#### GET /subscriptions
Lista suscripciones según el rol.

#### POST /subscriptions
Crea una suscripción para un estudiante.

**Body**
```json
{
  "studentUserId": "uuid",
  "mealPlanId": "uuid",
  "startDate": "2026-07-01"
}
```

#### GET /subscriptions/{subscriptionId}
Obtiene detalle de suscripción.

#### PATCH /subscriptions/{subscriptionId}
Actualiza estado o datos permitidos.

### 6. Daily meals

#### GET /daily-meals
Lista consumos diarios con filtros.

**Query params sugeridos**
- `studentUserId`
- `subscriptionId`
- `from`
- `to`
- `status`

#### POST /daily-meals
Registra consumo diario.

**Body**
```json
{
  "subscriptionId": "uuid",
  "mealDate": "2026-07-03",
  "status": "consumed",
  "validationSource": "manual"
}
```

#### GET /daily-meals/{dailyMealId}
Obtiene detalle del registro diario.

### 7. Adjustment requests

#### GET /adjustment-requests
Lista solicitudes de ajuste.

#### POST /adjustment-requests
Crea una solicitud de ajuste.

**Body**
```json
{
  "dailyMealId": "uuid",
  "reason": "No asistí ese día por motivo académico",
  "requestedStatus": "not_consumed"
}
```

#### PATCH /adjustment-requests/{requestId}/review
Aprueba o rechaza solicitud.

**Body**
```json
{
  "decision": "approved",
  "resolutionNotes": "Se valida la evidencia presentada"
}
```

### 8. Payments

#### GET /payments
Lista pagos con filtros.

#### POST /payments
Registra pago.

**Body**
```json
{
  "subscriptionId": "uuid",
  "amount": 270,
  "paymentDate": "2026-07-01",
  "paymentMethod": "cash",
  "referenceCode": "PAGO-001"
}
```

#### GET /payments/{paymentId}
Obtiene detalle de pago.

### 9. Dashboards

#### GET /dashboards/student
Devuelve resumen del estudiante autenticado.

**Response sugerida**
```json
{
  "success": true,
  "message": "Resumen obtenido correctamente",
  "data": {
    "remainingDays": 12,
    "consumedDays": 18,
    "estimatedEndDate": "2026-07-18",
    "nextPaymentDate": "2026-08-01"
  }
}
```

#### GET /dashboards/admin
Devuelve resumen operativo del restaurante.

#### GET /dashboards/superadmin
Devuelve resumen global del sistema.

### 10. Notifications

#### GET /notifications
Lista notificaciones del usuario.

#### PATCH /notifications/{notificationId}/read
Marca notificación como leída.

### 11. Audit logs

#### GET /audit-logs
Lista eventos auditables visibles para el rol autorizado.

### 12. QR validation

#### POST /qr/issue
Genera token QR para validación.

#### POST /qr/validate
Valida QR y registra o confirma el consumo.

## Esquemas base sugeridos

### User
```json
{
  "id": "uuid",
  "fullName": "Luis Miguel",
  "email": "user@example.com",
  "role": "student"
}
```

### Subscription
```json
{
  "id": "uuid",
  "studentUserId": "uuid",
  "mealPlanId": "uuid",
  "startDate": "2026-07-01",
  "contractedDays": 30,
  "consumedDays": 10,
  "remainingDays": 20,
  "status": "active"
}
```

### DailyMeal
```json
{
  "id": "uuid",
  "subscriptionId": "uuid",
  "mealDate": "2026-07-03",
  "status": "consumed",
  "validationSource": "manual"
}
```

### Payment
```json
{
  "id": "uuid",
  "subscriptionId": "uuid",
  "amount": 270,
  "paymentDate": "2026-07-01",
  "paymentMethod": "cash"
}
```

## Errores comunes de negocio
- `SUBSCRIPTION_NOT_ACTIVE`
- `DAILY_MEAL_ALREADY_EXISTS`
- `HISTORICAL_EDIT_NOT_ALLOWED`
- `ADJUSTMENT_NOT_ALLOWED`
- `PAYMENT_INVALID`
- `QR_EXPIRED`
- `TENANT_ACCESS_DENIED`

## Filtros y paginación
Los endpoints de listado deben soportar:
- `page`
- `limit`
- `sortBy`
- `sortOrder`
- filtros por rango de fechas cuando aplique

## Seguridad y permisos
- Estudiante: acceso a sus propios datos.
- Admin: acceso a datos de su restaurante.
- Superadmin: acceso global controlado.
- Toda operación sensible debe pasar por validación de permisos y auditoría.

## Próximos pasos del contrato
- Convertir este documento a OpenAPI YAML.
- Definir schemas reutilizables.
- Definir ejemplos de errores por endpoint.
- Agregar casos de uso de sincronización offline.
