# Integración API

**Actualización de seguridad:** HTTP ahora exige autenticación; una URL por sí sola no basta. Consulta [autenticación y producción](security-production.es-419.md) antes de seguir los ejemplos anteriores.

Revisión técnica: `1.1.0-draft.1`. Candidata para evaluación local; no producción.

[US English](api-integration.en-US.md) · [Inicio](README.es-419.md)

## Configuración

En PowerShell, con JDK/SDK preparados como indica el README:

```powershell
$env:API_BASE_URL='http://127.0.0.1:8080/api/v1'
.\gradlew.bat --no-daemon :app:assembleDebug
```

La URL pública se incorpora a `BuildConfig`. Seleccionar el emulador propio y ejecutar `adb -s SERIAL reverse tcp:8080 tcp:8080` antes de abrir el APK. Retirar el reverse al terminar. HTTP se permite solo para loopback/emulador en debug; release requiere HTTPS. La interfaz ejecuta el repositorio HTTP en un executor dedicado, publica resultados en el hilo principal y bloquea operaciones superpuestas.

Para las pruebas instrumentadas, indicar `ANDROID_SERIAL` y pasar `-Pandroid.testInstrumentationRunnerArguments.apiBaseUrl=URL_DEL_FIXTURE` a `:app:connectedDebugAndroidTest`. Sin ese argumento, las dos pruebas de integración externa se omiten explícitamente. Quitar `API_BASE_URL` antes de comprobar las pruebas de interfaz del modo memoria.

## Contrato y límites

Esta integración usa el [contrato OpenAPI incluido](contracts/task-api-v1.openapi.json), revisión `1.0.0-draft.1`. El contrato no depende de PHP, Laravel ni del lenguaje del cliente. Un backend propio puede implementarlo y demostrar conformidad con las mismas operaciones y errores.

El servidor asigna IDs UUID canónicos y versiones. Los títulos tienen de 1 a 80 puntos de código Unicode tras recortar los bordes. Esta revisión reduce el límite anterior de PHP/Flutter de 120 a 80: es un cambio incompatible del ejemplo candidato; revisar datos existentes antes de adoptarlo, sin truncarlos automáticamente.

Los clientes recorren páginas de 100 elementos hasta una página vacía, con un máximo de 100 solicitudes por listado. Rechazan datos malformados y conservan la versión observada para las escrituras. Un conflicto no se resuelve releyendo y sobrescribiendo silenciosamente. No se reintentan escrituras automáticamente: una desconexión, un timeout o una respuesta inválida puede ocurrir después del commit. La interfaz solicita recargar antes de repetir; algunos fallos, incluidos conflictos, se presentan mediante el aviso genérico de operación no confirmada.

La API no proporciona fecha de creación. Las representaciones web/Kotlin utilizan `null` para indicar fecha desconocida; Flutter no expone ese campo. Los IDs/relojes locales del modo memoria no son autoridad en modo HTTP: el adaptador envía solamente el título al crear y conserva el resultado del servidor.

Las respuestas se limitan a 1 MiB. Se usan plazos de red de 10 segundos; JavaScript/Dart limitan cada solicitud completa, Android limita conexión y lecturas. No hay caché offline, sincronización automática, autenticación ni autorización. La paginación no representa una instantánea bajo cambios concurrentes.

## Seguridad de la evaluación

Esta es una integración local de referencia, no una configuración de producción. Mantener el backend sin autenticación en loopback. CORS no es autenticación ni protege frente a otros programas locales. HTTPS es obligatorio para destinos no locales; no incluir secretos del servidor en aplicaciones distribuidas.

Los repositorios en memoria siguen siendo la opción predeterminada de los clientes. Configurar una URL selecciona HTTP explícitamente; un fallo remoto nunca cambia silenciosamente a memoria. Cada exportación incluye contrato, adaptador y esta guía; no importa archivos de la base maestra.
