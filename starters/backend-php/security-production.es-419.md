# Autenticación, autorización y producción

[US English](security-production.en-US.md) · [Inicio](README.es-419.md) · [Contrato API](contracts/task-api-v1.openapi.json)

## Perfil de seguridad

Contrato `1.0.0-draft.2`: HTTP requiere bearer opaco de 64 caracteres hexadecimales minúsculos. El operador emite tokens por identidad, con vigencia máxima de 24 horas y permisos reader (lectura propia) o editor (lectura/escritura propias). Las credenciales vencidas o revocadas dan 401; falta de permiso, 403; datos de otro propietario, 404. No se permite fijar el propietario desde el cliente.

Los puertos de identidad son independientes del framework. La implementación SQL almacena solamente el hash SHA-256 de tokens aleatorios de 256 bits. El middleware limpia la identidad después de cada solicitud. Las migraciones agregan propiedad, tokens y caché SQL del limitador; datos antiguos sin propietario quedan inaccesibles hasta revisión. No ejecutar migraciones en datos reales sin respaldo y asignación revisada.

## Uso

```text
php scripts/token.php issue demo-user editor 3600
php scripts/token.php revoke TOKEN_ID
php scripts/check-production.php
```

Ejecutar desde una copia del backend con configuración privada y migraciones aplicadas. La emisión imprime el token en texto plano una sola vez: ejecutar en una terminal privada, entregarlo por un canal seguro y no registrar su salida. TOKEN_ID es el identificador hash de esa salida, no el token. Cambiar de propietario implica un subject distinto; reutilizar el mismo subject comparte los datos de esa identidad. La CLI es una herramienta de operador con acceso a la base, no una API pública para crear cuentas.

GET /api/v1/auth/session devuelve identidad y permisos. DELETE /api/v1/auth/token, con Authorization: Bearer y cuerpo JSON {}, revoca el token actual. No hay refresh automático. Una operación ya autorizada puede terminar tras la revocación. Para rotar: emitir uno nuevo, cambiar sesión de forma controlada y revocar el anterior.

Nunca incorporar tokens en VITE_*, BuildConfig, --dart-define, archivos públicos, URL, localStorage, logs o control de versiones. Mantenerlos en memoria durante la sesión; si el producto exige persistencia nativa, seleccionar y verificar el almacén seguro de su sistema operativo. Para cuentas humanas con login, recuperación y MFA, integrar un proveedor OIDC/OAuth mediante el puerto de identidad; este perfil no implementa esas funciones.

## Preparación para producción

El comando check-production es de solo lectura. BLOCKED/código 1 señala problemas; LOCAL_CHECKS_PASS no aprueba el despliegue. Comprueba configuración básica, cachés, migraciones, propiedad heredada, superficie pública y dependencias de desarrollo. Siempre informa productionApproved=false y evidencia externa pendiente. La configuración production insegura se rechaza al arrancar; fuera de local/testing se rechaza HTTP. Configurar explícitamente proxies de confianza; no asumir que X-Forwarded-Proto convierte una conexión en segura.

El limitador SQL aplica 120 solicitudes/minuto por IP y devuelve 429 con Retry-After. Es una defensa básica: probar concurrencia, NAT, proxies y capacidad, y usar controles de borde para abuso/DDoS. CORS permite orígenes exactos y Authorization, sin cookies. No confundir CORS con autorización.

La aprobación requiere evidencia real del despliegue: TLS/proxy, mínimo privilegio de DB, respaldo/restauración, rotación de secretos, carga/límites, monitoreo, revisión de seguridad y responsable de liberación. No se despliega nada con esta guía. macOS/iOS continúan sin verificación por falta de Mac.

## Pruebas de integración

composer check repite pruebas aisladas, nunca usa una base de consumidor. php -d extension=pdo_pgsql scripts/qa-databases.php --wsl-docker repite la matriz en instancias propias, con los requisitos documentados en la guía del backend.
