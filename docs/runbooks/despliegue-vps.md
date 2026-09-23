# Runbook: despliegue del MVP en VPS

## Cuándo usarlo

Usar este procedimiento para publicar el piloto de almuerzo en el VPS. No se
ejecuta contra el servidor hasta que el repositorio haya sido revisado, las
pruebas estén verdes y los cambios estén subidos a la rama protegida `main`.

## Prerrequisitos

- Docker Engine y Docker Compose instalados en el VPS.
- Un dominio o subdominio que resuelva a la IP pública del VPS.
- Puertos 80 y 443 abiertos; SSH restringido a operadores autorizados.
- Acceso al repositorio GitHub por SSH deploy key o token de solo lectura.
- Una copia segura de los secretos; nunca se pegan en Git ni en chat.

## Primera publicación

En el servidor, tras subir la rama validada al remoto:

```bash
mkdir -p ~/project
cd ~/project
git clone https://github.com/luistoledolafuente/mealtrack-platform.git mealtrack
cd mealtrack
cp .env.vps.example .env.vps
chmod 600 .env.vps
nano .env.vps
docker compose --env-file .env.vps -f docker-compose.vps.yml config
docker compose --env-file .env.vps -f docker-compose.vps.yml up -d --build
docker compose --env-file .env.vps -f docker-compose.vps.yml ps
curl --fail http://127.0.0.1:3000/health
curl --fail http://127.0.0.1:3000/ready
```

En `.env.vps`, generar contraseñas diferentes para PostgreSQL y JWT. `JWT_SECRET`
debe tener al menos 32 caracteres. `CORS_ORIGIN` es el dominio HTTPS exacto del
panel web permitido; nunca se usa `*` en producción. Para el panel incluido en
este repositorio, configurar `CORS_ORIGIN=https://mealtrack-admin.example.com`
y `WEB_ADMIN_API_BASE_URL=https://mealtrack-api.example.com/api/v1`.

## Proxy HTTPS

Nginx publica solo HTTPS y reenvía a la API local. Crear
`/etc/nginx/sites-available/mealtrack-api` con el dominio real:

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Después de reemplazar el dominio y comprobar su DNS:

```bash
sudo ln -s /etc/nginx/sites-available/mealtrack-api /etc/nginx/sites-enabled/mealtrack-api
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api.example.com
curl --fail https://api.example.com/health
curl --fail https://api.example.com/ready
```

El APK release se compila con
`--dart-define=API_BASE_URL=https://api.example.com/api/v1`.

## Panel de superadministración

El panel web se sirve internamente en `127.0.0.1:3001`. Crear un subdominio
separado, por ejemplo `mealtrack-admin.example.com`, que apunte al VPS. No
reutilizar subdominios de otros proyectos. Publicarlo mediante Nginx:

```nginx
server {
    listen 80;
    server_name mealtrack-admin.example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Tras comprobar que el DNS resuelve al VPS, ejecutar `sudo certbot --nginx -d
mealtrack-admin.example.com`. El panel solo permite iniciar sesión a cuentas
con rol `superadmin`; gestiona el alta, edición y suspensión de restaurantes.

## Alta inicial del superadmin

No usar `db:seed` en el piloto. Después de que la API y las migraciones estén
operativas, crear una sola cuenta inicial con valores definidos directamente en
la terminal del VPS (no se guardan en Git):

```bash
docker compose --env-file .env.vps -f docker-compose.vps.yml exec \
  -e SUPERADMIN_NAME='Nombre del operador' \
  -e SUPERADMIN_EMAIL='operador@ejemplo.com' \
  -e SUPERADMIN_PASSWORD='una-clave-unica-de-al-menos-16-caracteres' \
  api npm run db:create-superadmin
```

El comando falla si ese correo ya existe, cifra la contraseña y registra el
alta en auditoría. Guardar la contraseña en un gestor de secretos. No pegarla
en capturas, chat ni archivos `.env`.

## Actualización y rollback

Antes de una actualización, hacer un backup y revisar las migraciones. Luego:

```bash
cd ~/project/mealtrack
git fetch origin
git checkout main
git pull --ff-only origin main
docker compose --env-file .env.vps -f docker-compose.vps.yml up -d --build
docker compose --env-file .env.vps -f docker-compose.vps.yml logs --tail=100 api
```

Las migraciones se ejecutan una vez al iniciar el contenedor. Si una migración ya
fue aplicada, el rollback es de aplicación, no de esquema: volver al commit
anterior compatible y reconstruir. No ejecutar `prisma migrate reset` ni `db
push` en el VPS.

## Backup y restauración

Crear un backup lógico desde el contenedor y guardarlo fuera del VPS:

```bash
mkdir -p ~/backups/mealtrack
docker compose --env-file .env.vps -f docker-compose.vps.yml exec -T db \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > ~/backups/mealtrack/mealtrack-$(date +%F-%H%M).dump
```

Ensayar una restauración únicamente en una base temporal. Para incidentes reales,
detener escrituras, preservar evidencia y restaurar con una persona responsable
de operación. El procedimiento de futuro aislamiento por tenant está en
[base de datos por tenant](base-datos-por-tenant.md).

## Smoke test obligatorio

1. `GET /health` y `GET /ready` responden 200.
2. Login válido e inválido tienen el comportamiento esperado.
3. Admin crea QR de almuerzo; estudiante lo escanea una vez; un reintento no
   descuenta otro día.
4. Un usuario de otro restaurante no puede leer ni operar datos del piloto.
5. Se registra una ausencia y un cierre de prueba con auditoría visible.

Detener el despliegue si falla cualquier punto, aparecen secretos en logs o las
migraciones no quedan al día.
