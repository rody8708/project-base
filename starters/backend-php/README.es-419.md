# Base API PHP / Laravel

[Respaldo y restauración SQLite verificados](recovery.es-419.md).

[Respaldo y restauración nativos PostgreSQL/MySQL](server-recovery.es-419.md).

[Cifrado y operación segura de respaldos](backup-operations.es-419.md).

[Laboratorio Docker aislado: PHP 8.5 y HTTPS](docker-local.es-419.md).

**Actualización de seguridad:** HTTP ahora exige autenticación; una URL por sí sola no basta. Consulta [autenticación y producción](security-production.es-419.md) antes de seguir los ejemplos anteriores.

Versión técnica: `1.1.0-draft.2`. Estado: propuesta técnica no aprobada, para evaluación; no es un producto terminado.

[English (United States)](README.en-US.md) · [Arquitectura y decisiones](architecture.es-419.md) · [Verificación](verification.es-419.md)

Esta base independiente incluye una API JSON ilustrativa de tareas, persistencia SQL, migraciones, pruebas, tokens provisionados, autorización por propietario y límites de tasa. El recurso de tareas se debe reemplazar según el dominio consumidor. Incluye ensayos locales de HTTPS y recuperación, no despliegue ni respaldo/restauración de producción. No incluye cuentas humanas completas, multitenencia empresarial ni facturación. No exponerla públicamente tal como está.

## Conexión API opcional

El contrato y los adaptadores HTTP ya están implementados. El modo memoria sigue siendo el predeterminado de los clientes; las descripciones de pérdida de datos se refieren a ese modo. Consultar la [guía de integración](api-integration.es-419.md) para configurar la conexión y revisar sus límites. No se incluye autenticación de producción.

## Herramientas y ejecución local

El código original se distribuye bajo [MPL-2.0](LICENSE), también declarada en Composer. Laravel y cada dependencia conservan su propia licencia; revisa y conserva sus avisos al distribuir.

Perfil de esta candidata: PHP `8.5.x`, Composer `2.x`, Laravel `13.30.1`, PHPUnit `12.5.34` y Mockery `1.6.15`. Las dependencias transitivas se fijan en [composer.lock](composer.lock); [composer.json](composer.json) conserva la revisión de la plantilla en `extra`, porque Composer no admite `draft` como etiqueta de versión de paquete.

Se requieren las extensiones que comprueba Composer y `pdo_sqlite` para la primera ejecución. La matriz observada usa PHP `8.5.1` en Windows; no demuestra todas las versiones `8.5.x` ni otros sistemas operativos. Las instalaciones son locales al proyecto: no usar un instalador Laravel global ni instalar servicios globales para estos pasos.

Desde una copia recién exportada de este starter:

```powershell
composer install --no-interaction --prefer-dist
composer validate --strict --no-check-all
composer check-platform-reqs
composer check
composer audit
php scripts/setup-local.php
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8080 --no-reload
```

`--no-check-all` omite el aviso de Composer sobre restricciones exactas, una decisión deliberada de esta plantilla; no omite requisitos de plataforma ni auditorías. Actualizar paquetes requiere revisar avisos, regenerar el lock y repetir las pruebas. Un resultado de auditoría sin avisos conocidos no certifica ausencia de vulnerabilidades.

`setup-local.php` crea exclusivamente una `.env` nueva, una clave aleatoria sin imprimirla y un archivo SQLite vacío. Se niega si ya existe `.env` o la base; no sobrescribe ni elimina. Usa `umask(0077)` durante la creación en POSIX y comprueba escritura/sincronización; en Windows deben revisarse los permisos ACL de la carpeta. Si falla a mitad de la operación, conserva lo creado para inspección. No hay garantía de transacción de ambos archivos.

El servidor incorporado es solo para desarrollo/QA. Abre `http://127.0.0.1:8080/api/health`; detén el proceso con `Ctrl+C`. Esa ruta informa vida del proceso HTTP, no disponibilidad de la base de datos. `.env.example` mantiene `APP_DEBUG=false`; no contiene claves, contraseñas o endpoints reales.

## Contrato ilustrativo

Las rutas usan el prefijo `/api/v1`. Las escrituras requieren `Content-Type: application/json`, un objeto JSON y un cuerpo de hasta 8192 bytes. No se aceptan campos de escritura desconocidos.

| Operación | Entrada | Resultado |
| --- | --- | --- |
| `POST /tasks` | `title` string | `201`, tarea nueva, `Location` y versión `1`. |
| `GET /tasks/{id}` | UUID ASCII canónico en minúsculas | `200` o `404`. |
| `GET /tasks` | `limit` de 1 a 100, predeterminado 20; `after` opcional | `200`, lista ordenada por UUID y cursor `next_after`. |
| `PUT /tasks/{id}` | `title`, `completed` boolean JSON, `version` entero JSON | `200` y versión incrementada; `409` si la versión ya cambió. |
| `DELETE /tasks/{id}` | Objeto JSON con `version` entero | `204`; `409` ante versión antigua. |

Una tarea serializa exclusivamente `id`, `title`, `completed` y `version`. El título se recorta en sus bordes y debe conservar de 1 a 80 puntos de código Unicode; no admite controles o separadores de línea/párrafo internos. No se trata de un límite de grafemas visuales. Se preservan mayúsculas y acentos; no se implementan búsquedas textuales ni unicidad por título.

Los identificadores no canónicos que llegan al servicio se rechazan antes de consultar SQL. Las versiones válidas llegan hasta `2147483646`; una actualización requiere como máximo `2147483645`. No hay reinicio automático del contador. `PUT` reemplaza los campos editables completos; no es `PATCH`. El cursor es el último ID entregado, no una garantía de que exista una página siguiente. La paginación es estable para un conjunto sin cambios, no una instantánea durante inserciones concurrentes.

Las respuestas correctas usan `data`; los errores usan `error.code` y `error.message`, con nombres de campos inválidos cuando corresponde. Códigos relevantes: `400` JSON inválido, `404` no encontrado, `405` método no permitido con `Allow`, `409` conflicto de versión, `413` cuerpo grande, `415` tipo de contenido incorrecto, `422` contrato inválido, `503` error SQL y `500` error inesperado. Los errores no devuelven SQL, valores privados, trazas o rutas internas.

Cada respuesta incluye `X-Request-Id`. Se conserva un UUID canónico enviado por el llamador; un valor ausente o inválido se reemplaza. Los fallos del servidor producen una entrada operacional estructurada con ese identificador, método, plantilla de ruta, estado y tipo de excepción, sin cuerpos, tokens, mensajes de excepción ni trazas. El producto consumidor debe configurar retención y acceso. Estos registros operacionales no son una bitácora de auditoría de negocio.

Las traducciones están separadas en [es-419](lang/es-419/api.php) y [en-US](lang/en-US/api.php). Se seleccionan mediante `Accept-Language` (`es-419`/`es` o `en-US`/`en`, considerando calidad positiva); otras preferencias usan `en-US`. Se devuelve `Content-Language` y `Vary: Accept-Language`. Los códigos de máquina no se traducen.

## Perfiles de base de datos

SQLite es el perfil local predeterminado. MySQL y PostgreSQL exigen declarar host, puerto, base, usuario y contraseña en un entorno privado; no se hereda una URL de conexión ni se cambia silenciosamente de motor.

- `mysql`: la candidata solo permite `127.0.0.1`, `localhost` o `::1`; habilitar un host remoto requiere implementar y verificar TLS/autenticación apropiados. No es una configuración de producción remota.
- `pgsql`: el modo TLS predeterminado es `verify-full`; `DB_SSLROOTCERT` permite señalar un certificado raíz apropiado. La QA aislada utiliza `DB_SSLMODE=disable` únicamente contra su instancia desechable en loopback. No copiar esa excepción a una conexión remota.
- `sqlite`: utiliza `database/database.sqlite`, claves foráneas activadas y espera de bloqueo de 5000 ms; no se configura como servicio de red.

Las versiones realmente probadas y sus límites están en [verificación](verification.es-419.md). Usar SQLite en pruebas no demuestra compatibilidad con MySQL/PostgreSQL. El sistema de base de datos no debe elegirse según el dispositivo cliente: una app web, Flutter o Kotlin puede consumir la misma API.

## Pruebas aisladas y exportación

`composer check` revisa sintaxis de fuente y ejecuta PHPUnit con SQLite temporal propio. Ignora conexiones de `.env`, aísla cachés de configuración y elimina únicamente sus archivos temporales identificados. La suite prueba contratos y operaciones SQL del ejemplo, no cobertura total de Laravel.

La matriz adicional requiere Windows, WSL `Ubuntu-24.04`, Docker local operativo y los tres drivers PDO disponibles; no instala WSL/Docker. Si `pdo_pgsql` ya está cargado, omite la opción `-d` para no cargarlo dos veces:

```powershell
php -d extension=pdo_pgsql scripts/qa-databases.php --wsl-docker
```

Ese comando descarga imágenes oficiales fijadas por versión/digest, verifica puertos libres en Windows/WSL y crea contenedores propios de PostgreSQL/MySQL en `127.0.0.1:15432` y `127.0.0.1:13306`. Usa tmpfs, raíz de contenedor de solo lectura, capacidades restringidas y límites de recursos; no monta carpetas del host ni usa `--privileged`. Las credenciales sintéticas van por stdin, nunca por argumentos/salida o archivos exportables. Se conservan reportes locales en `.validation/`; al terminar se verifican nombre y etiqueta antes de retirar exclusivamente esos contenedores y sus datos efímeros. Las imágenes descargadas permanecen en caché. No usa la instancia del usuario en `3306`.

No exportar `vendor`, `.env`, bases locales, cachés, logs, `.validation` o claves. Conservar ambos idiomas, fuente, pruebas, migraciones, `composer.lock` y `.env.example`. El exportador del proyecto añade la documentación aprobada `1.0.0` bajo `foundation/`; su recibo mantiene la adopción del consumidor pendiente y la plantilla técnica no aprobada. La aprobación documental no valida automáticamente esta API.
