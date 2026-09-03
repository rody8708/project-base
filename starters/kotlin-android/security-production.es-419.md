# Autenticación, autorización y producción

[US English](security-production.en-US.md) · [Inicio](README.es-419.md) · [Contrato API](contracts/task-api-v1.openapi.json)

## Perfil de seguridad

Contrato `1.0.0-draft.2`: HTTP requiere bearer opaco de 64 caracteres hexadecimales minúsculos. El operador emite tokens por identidad, con vigencia máxima de 24 horas y permisos reader (lectura propia) o editor (lectura/escritura propias). Las credenciales vencidas o revocadas dan 401; falta de permiso, 403; datos de otro propietario, 404. No se permite fijar el propietario desde el cliente.

El modo memoria no requiere credenciales. El modo HTTP necesita inyectar un proveedor en tiempo de ejecución. Establecer solo la URL ya no habilita acceso al backend. El starter no incluye formulario de login, recuperación ni almacenamiento de credenciales.

## Uso

```text
HttpTaskRepository(apiUrl) { sessionToken }
```

El fragmento muestra la composición: apiUrl y sessionToken deben venir de tu aplicación, no son constantes proporcionadas por la plantilla. El token va exclusivamente en Authorization: Bearer. El adaptador no sigue redirects ni reintenta escrituras. Está ligado a la primera credencial utilizada: al cambiar token o cerrar sesión, descartar repositorio y estado visible y crear una instancia nueva. Esto también aplica a una renovación legítima.

Las interfaces actuales muestran algunos fallos remotos de manera genérica. Implementar una experiencia de sesión completa corresponde al producto; no se afirma que ya exista una pantalla de autenticación.

Nunca incorporar tokens en VITE_*, BuildConfig, --dart-define, archivos públicos, URL, localStorage, logs o control de versiones. Mantenerlos en memoria durante la sesión; si el producto exige persistencia nativa, seleccionar y verificar el almacén seguro de su sistema operativo. Para cuentas humanas con login, recuperación y MFA, integrar un proveedor OIDC/OAuth mediante el puerto de identidad; este perfil no implementa esas funciones.

## Preparación para producción

Exigir HTTPS para destinos remotos y nunca desactivar la validación de certificados. La configuración de red debug solo permite HTTP local/emulador. El backend debe verificar autenticación, permisos y propiedad: ocultar botones en la UI no protege datos. No guardar datos de otra sesión en vistas/cachés. Probar expiración, revocación, cambio de identidad y errores sin repetir escrituras inciertas.

La aprobación requiere evidencia real del despliegue: TLS/proxy, mínimo privilegio de DB, respaldo/restauración, rotación de secretos, carga/límites, monitoreo, revisión de seguridad y responsable de liberación. No se despliega nada con esta guía. macOS/iOS continúan sin verificación por falta de Mac.

## Pruebas de integración

Usar un backend desechable y un token exclusivo de pruebas. No usar credenciales de producción. El archivo temporal de credenciales debe estar fuera del código exportado y eliminarse al terminar.

La instrumentación usa apiBaseUrl y apiTokenFile; el segundo es una ruta a JSON privado dentro de la aplicación de prueba en el emulador desechable. No pasar el token como argumento Gradle/instrumentación. Borrar el archivo y detener el emulador propio al finalizar.
