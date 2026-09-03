# Seguridad de API y preparación para producción

[Respaldo y restauración SQLite verificados](../../starters/backend-php/recovery.es-419.md).

[Recuperación nativa PostgreSQL/MySQL verificada localmente](../../starters/backend-php/server-recovery.es-419.md).

[Cifrado y operación segura de respaldos](../../starters/backend-php/backup-operations.es-419.md).

[Laboratorio Docker aislado: PHP 8.5 y HTTPS](../../starters/backend-php/docker-local.es-419.md).

Revisión técnica: `1.1.0-draft.1`. Contrato: `1.0.0-draft.2`. Evaluación local: `2026-09-03`. No aprobado para producción.

[US English](security-production.en-US.md) · [Inicio](../../README.es-419.md) · [Integración API](api-integration.es-419.md)

## Alcance implementado

La API exige tokens bearer opacos, aleatorios (256 bits), con vencimiento y revocación. Solo se almacena su hash SHA-256. Un operador confiable provisiona cada identidad; no hay registro público, contraseña compartida, token incorporado en la aplicación, ni modo anónimo alternativo.

Este perfil es de acceso API provisionado. No es un sistema completo de cuentas humanas: pantalla de inicio de sesión, contraseñas, recuperación, MFA, consentimiento OAuth y refresh tokens no están implementados. Para esos requisitos se debe seleccionar un proveedor OIDC/OAuth o un adaptador de identidad adicional; no inventar un protocolo criptográfico.

Los puertos `TokenAuthenticator`, `IdentityContext` y `Principal` no dependen de Laravel. El adaptador SQL autentica; el límite HTTP establece y limpia el contexto en cada solicitud; el repositorio exige permisos y filtra por propietario incluso en actualizaciones y eliminaciones condicionales. Un backend propio puede sustituir ambos adaptadores, pero debe conservar estas garantías y sus pruebas.

## Permisos y propiedad

| Caso | Comportamiento |
| --- | --- |
| Sin token, inválido, vencido o revocado | 401, UNAUTHENTICATED, WWW-Authenticate: Bearer |
| reader | tasks:read; listado y lectura propios |
| editor | tasks:read y tasks:write; CRUD propio |
| Sin permiso suficiente | 403, FORBIDDEN |
| ID perteneciente a otra identidad | 404; listado no lo incluye |
| Propietario enviado en JSON o cabecera | No concede autoridad; campo JSON desconocido se rechaza |
| Exceso de solicitudes | 429 con Retry-After; sin reintento automático |

No existe permiso administrativo global ni multitenencia empresarial. La unidad de aislamiento del ejemplo es `subject`. Reutilizar el mismo subject concede acceso a los mismos datos: el operador debe controlar su asignación. La revocación afecta solicitudes posteriores; una solicitud ya autorizada puede terminar.

La migración conserva las filas antiguas con `owner_id=null`: son inaccesibles por API. No asigna datos existentes a un usuario ni los borra. Revisar propietario, respaldar y migrar deliberadamente antes del despliegue. Revertir la migración elimina la información de propiedad: no es una estrategia segura de rollback de producción.

## Uso y clientes

La [guía backend](../../starters/backend-php/security-production.es-419.md) describe emisión, revocación y comandos. Las guías de [React](../../starters/web/security-production.es-419.md), [web nativa](../../starters/web-vanilla/security-production.es-419.md), [Flutter](../../starters/flutter/security-production.es-419.md) y [Kotlin](../../starters/kotlin-android/security-production.es-419.md) documentan la inyección del proveedor de token.

El modo memoria permanece independiente. Para HTTP ya no basta con establecer la URL: la composición debe proporcionar una credencial obtenida en tiempo de ejecución. Los starters no incluyen una pantalla para introducirla ni guardan secretos por su cuenta. No colocar tokens en VITE_*, BuildConfig, --dart-define, archivos públicos, URL, localStorage ni repositorios.

Cada adaptador queda asociado al token de su primera solicitud. Un cambio de token exige recrear repositorio y estado de interfaz: evita mezclar datos de identidades distintas, incluso durante paginación. Borrar el estado visible al cerrar sesión es responsabilidad de la composición del producto. Flutter/Kotlin y las interfaces web conservan algunos errores de red como aviso genérico; los códigos 401/403/429 están disponibles en el contrato y en el transporte web, no hay una experiencia completa de login.

## Verificación de producción

Desde el backend: `php scripts/check-production.php`. Es una inspección de solo lectura: no migra ni cambia configuración ni muestra secretos. Devuelve BLOCKED y código 1 ante fallas; LOCAL_CHECKS_PASS solo significa que pasaron sus comprobaciones locales y siempre devuelve `productionApproved: false`.

Comprueba entorno, debug desactivado, clave de aplicación de formato válido, URL HTTPS, CORS exacto HTTPS, almacenamiento persistente del limitador, cachés de configuración/rutas, ausencia de PHPUnit en dependencias desplegadas, superficie pública mínima, migraciones aplicadas y ausencia de datos heredados sin dueño. No demuestra que una clave sea secreta o aleatoria solo por tener longitud correcta.

El arranque en APP_ENV=production rechaza configuración básica insegura. Fuera de local/testing la API rechaza HTTP sin TLS. La caché de límites usa SQL: 120 solicitudes/minuto por IP, incluidos intentos no autenticados. Es una defensa básica, no una cuota estricta bajo concurrencia ni protección DDoS; NAT puede agrupar usuarios. No se confía automáticamente en X-Forwarded-For/Proto: cualquier proxy debe configurarse y verificarse explícitamente.

La prueba raíz `node scripts/test-api-integration.mjs` crea datos y credenciales desechables; además prueba un perfil production aislado con cachés y configuración válidos. Verifica que siga bloqueado por dependencias de desarrollo. Se corrigió la resolución de rutas absolutas de caché en Windows para mantener esos archivos fuera del starter.

## Evidencia local

- Backend: 63 pruebas, 271 aserciones por motor en matriz `320ecdd2dbebb766`: SQLite 3.49.2, PostgreSQL 18.6 y MySQL 8.4.11. Contenedores propios eliminados. Una modificación posterior del bootstrap corrige rutas de caché Windows; la integración HTTP verifica esa corrección.
- React: 44 pruebas, tipos y compilación. Web nativa: 85 pruebas. Transporte HTTP real: autenticación, CRUD, permisos, aislamiento, revocación y control de configuración de producción.
- Flutter: análisis limpio y 31 pruebas con backend autenticado; un flujo de interfaz Windows con token leído de un archivo privado de prueba.
- Kotlin: pruebas JVM, lint, APK debug y APK de pruebas compilados; cinco pruebas instrumentadas aprobadas en emulador API 35, incluidas API autenticada e interfaz remota.
- Mantenimiento: 46 pruebas; 100 documentos, 50 pares de idioma y 800 enlaces locales verificados. Las pruebas de exportación conservan los archivos nuevos y el núcleo aprobado anterior no se modificó.
- Composer audit --locked y npm audit de React: sin avisos conocidos en esta ejecución. No son auditorías de Flutter/Kotlin ni una garantía de ausencia de vulnerabilidades.

## Lo que no puede cerrarse solo en esta máquina

Para aprobar un producto faltan evidencias del destino real: certificado/cadena TLS, proxy y host permitidos; mínimo privilegio de DB; secret management y rotación; restore de respaldo medido; rollback de aplicación/migraciones; pruebas de carga y límites; monitoreo/alertas; revisión de seguridad y responsable de aprobación. El limitador no sustituye un gateway; los logs no son todavía una bitácora de auditoría de negocio. macOS/iOS siguen pendientes de Mac. No hubo despliegue público ni certificación ASVS.

## Fundamento

La separación entre autenticación y autorización, mínimo privilegio, rechazo predeterminado y verificación de cada recurso siguen [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). HTTPS, credenciales fuera de URL y CORS restringido siguen [OWASP REST Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html). Para un futuro login federado consultar [OWASP OAuth2](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html). Estas referencias justifican decisiones; no certifican esta implementación.
