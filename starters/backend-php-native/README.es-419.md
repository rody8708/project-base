# Backend PHP propio — sin framework de aplicación

[English (United States)](README.en-US.md)

Una API reutilizable en PHP 8.5 sin Laravel, paquetes Composer ni framework de aplicación. Incluye CRUD de tareas, autenticación/autorización explícitas, contratos JSON versionados, puertos de repositorio, adaptadores SQLite/PostgreSQL/MySQL, migraciones y pruebas aisladas. Revisión de plantilla: `1.3.0-draft.2`; evaluación local verificada, no aprobada para producción.

## Comenzar tu aplicación

En Project Base, ejecuta `npm run create-app` y selecciona **PHP propio — sin framework; SQLite, PostgreSQL o MySQL** cuando solicite el backend. El proyecto generado es independiente: después no necesita conectarse a Project Base. El repositorio original no forma parte de la ejecución de tu producto.

Desde la raíz de la solución generada:

```powershell
npm run doctor
npm run setup
npm run check
npm start
```

Requisitos: Node.js 24 y PHP 8.5 con `pdo_sqlite`, `mbstring` y `openssl`. No necesitas Composer. Setup crea `api/.runtime/local.sqlite`, repite las migraciones de forma segura y nunca emite credenciales automáticamente. Git ignora el directorio de ejecución. Protege sus permisos de carpeta en Windows. Las pruebas usan otras bases temporales, nunca este archivo.

Start escucha únicamente en `http://127.0.0.1:8080`; `/api/health` indica liveness, no aprobación de producción. Configura `NATIVE_PHP_PORT` con un puerto libre si hace falta. Detén con Ctrl+C. El servidor integrado de PHP es solo para desarrollo. El frontend generado comienza en memoria hasta configurar explícitamente la identidad API y su adaptador HTTP.

Para un componente exportado individualmente, usa `node scripts/local.mjs doctor|setup|check|start` desde su carpeta. En el checkout fuente mantenido, setup/start rechazan crear datos de ejecución; las pruebas sí funcionan allí.

## Aprovisionar una identidad local

Desde la carpeta del componente, sustituye la ruta absoluta de ejemplo por la base generada:

```powershell
php scripts/token.php issue C:/products/my-app/api/.runtime/local.sqlite demo-user read-write 3600 --show-token
```

El comando imprime intencionalmente un token secreto nuevo, su hash `id` y vencimiento. Usa una terminal privada sin transcripción; nunca pongas su salida en Git, registros o incidencias. Envía las solicitudes API con `Authorization: Bearer TOKEN`. La base guarda solo el hash SHA-256. Los perfiles son `read` y `read-write`; la duración es de 1 a 86400 segundos.

Revoca con `php scripts/token.php revoke ABSOLUTE_DATABASE HASH_ID`, usando el ID hash, no el token. HTTP también ofrece `GET /api/v1/auth/session` y `DELETE /api/v1/auth/token`. Los tokens aprovisionados no son login con contraseña, recuperación de cuenta ni MFA.

## Construir sobre el ejemplo

- Dominio: entidades puras de tareas, validación y categorías de conflicto.
- Aplicación: casos de uso/servicios, identidad y puertos de repositorio/autenticación/límites; sin SQL ni framework.
- Infraestructura: persistencia SQLite, hashes/almacenamiento de tokens, límites atómicos, migraciones y recuperación.
- Presentación HTTP: solicitudes tipadas/acotadas, errores bilingües seguros, CORS de origen exacto e IDs de solicitud.
- Contrato: [API de tareas v1](contracts/task-api-v1.openapi.json).

Los clientes usan solo la API; nunca los conectes directamente a SQLite. Las lecturas/escrituras se limitan al propietario, los permisos son explícitos y actualizar/eliminar requiere la versión actual. Agrega el comportamiento del negocio en Aplicación/Dominio y conserva los detalles del motor en adaptadores. También están disponibles adaptadores de servidor local PostgreSQL y MySQL. Sigue la [guía de perfiles SQL](sql-engines.es-419.md) para configurarlos. Cambiar de motor no migra los datos existentes.

## Configuración y protecciones

El router lee `NATIVE_PHP_DATABASE` y `API_ALLOWED_ORIGINS` del entorno del proceso, nunca de un archivo `.env` real. El inicio generado proporciona la base local y el origen web seleccionado. Los orígenes deben ser HTTP(S) exactos, sin comodines, rutas ni cookies. La IP directa tiene un límite de 120 solicitudes/minuto; se ignoran encabezados de IP reenviada. Las ventanas fijas permiten ráfagas entre ventanas. No se proporciona identidad mediante proxy inverso ni configuración de servidor web de producción.

Para una base externa explícita, usa `php scripts/database.php init ABSOLUTE_NEW.sqlite` y después `up` para repetir migraciones. Los padres deben existir; inicializar nunca sobrescribe. Las migraciones con hashes se ejecutan en una transacción. Cada SQL incluye notas de reversión; no existe una reversión destructiva automática. Se protegen las rutas fuente del repositorio y de la base documental congelada exportada.

## Respaldar y restaurar

Desde la carpeta del componente, usa rutas absolutas explícitas en una carpeta privada:

```powershell
php scripts/recovery.php snapshot C:/sandbox/source.sqlite C:/sandbox/snapshot-01
php scripts/recovery.php verify C:/sandbox/snapshot-01
php scripts/recovery.php restore C:/sandbox/snapshot-01 C:/sandbox/restored.sqlite
```

Ambos destinos deben ser nuevos. `VACUUM INTO` de SQLite toma una copia consistente, incluidas páginas WAL confirmadas, sin copiar a ciegas el archivo principal abierto. La verificación comprueba SHA-256, integridad SQLite y claves foráneas. Estos respaldos **no están cifrados**: mantenlos privados y fuera de Git. Los hashes detectan corrupción, no la sustitución maliciosa de base y manifiesto juntos.

Restaurar nunca reemplaza la base activa. Invalida todos los tokens recuperados, limpia contadores de límites y devuelve `RESTORED_NOT_ACTIVATED`. Emite nuevos tokens y verifica la aplicación restaurada antes de cambiar explícitamente su ruta de base de datos. Las operaciones fallidas conservan resultados parciales para inspección; nunca los actives.

## Verificación y límites

Desde este componente:

```powershell
node scripts/local.mjs check
node tests/transport-check.mjs
```

El segundo comando necesita además la CLI OpenSSL (se detecta la incluida en Git para Windows; `TEST_OPENSSL` permite indicar otro ejecutable). Crea material TLS temporal y ocho procesos PHP locales. No modifica almacenes de confianza ni desactiva la verificación de certificados. Se limpian todos los procesos, bases, archivos auxiliares y claves propios. No se leen archivos de entorno reales ni datos de clientes.

Evidencia en Windows/PHP 8.5.1/Node 24.16.0 del 2026-09-04:

- Pasaron dominio/memoria e integración SQLite, migraciones/rechazo de hashes, CRUD HTTP, Unicode, aislamiento por propietario, permisos, tokens vencidos/revocados, CORS, límites de entrada, rechazo de duplicados JSON/query y localización. El defecto de consulta duplicada se había reproducido como 200 en vez de 422 antes de corregirlo.
- Pasó la aceptación compartida de adaptadores React/web nativa contra Laravel y PHP propio dentro de Project Base. La aceptación en navegador pasó CRUD desde el origen permitido y bloqueo del rechazado; se cerraron páginas/procesos de prueba. Estas comprobaciones adicionales entre starters/navegador requieren el repositorio, pero las del componente exportado no.
- La recuperación local pasó conservación del origen, negativa a sobrescribir, rechazo de archivos dañados, invalidación de credenciales y separación de WAL confirmado/escritura sin confirmar.
- Pasaron conexión TLS 1.2/1.3 verificada y rechazo de certificado no confiable y nombre de host incorrecto. Con ocho procesos compartiendo una base: persistieron 24 creaciones concurrentes; una de 12 actualizaciones de la misma versión ganó y 11 devolvieron 409. Después de 38 solicitudes aceptadas, una ráfaga de 144 admitió 82 y rechazó 62 con 429 en la misma ventana.
- Se leyeron y actualizaron datos restaurados por HTTPS usando un token nuevo; el anterior devolvió 401.
- La exportación independiente por el asistente pasó diagnóstico, preparación/repetición, pruebas aisladas, inicio y creación/lectura autenticada de tareas. Se generaron todas las combinaciones de clientes admitidas; no equivale a verificar nuevamente dispositivos nativos.

El laboratorio usa un certificado autofirmado efímero confiado explícitamente por su cliente y un terminador TLS local exclusivo de pruebas. No implementa un proxy de producción ni renovación de certificados. Son pruebas de aceptación acotadas, no capacidad de carga sostenida, garantía RPO/RTO, validación exhaustiva del contrato ni aprobación de producción. TLS real del despliegue, renovación, monitoreo, alertas, cifrado/retención/almacenamiento externo de respaldos e identidad del producto siguen siendo responsabilidad de cada aplicación. La base SQLite pasó CI en el PR #35. Los perfiles SQL adicionales tienen evidencia local y configuración CI propias; aquí no se implica un resultado remoto de esa ampliación.
