# Exportador de bases técnicas

Revisión de trabajo: `1.1.0-draft.2`, posterior a la publicación técnica estable `1.1.0`.
Estado: el exportador prepara para evaluación el contenido del checkout actual. La publicación `1.1.0` está aprobada para su alcance congelado, pero `main` puede contener cambios posteriores; la adopción y validación del producto consumidor siempre quedan pendientes.

[English (United States)](README.en-US.md) · [Inicio](../README.es-419.md)

Para elegir componentes y recorrer el proceso completo, consulta [cómo crear una aplicación con esta base](../docs/getting-started.es-419.md).

## Propósito y requisitos

La herramienta prepara un proyecto nuevo fuera de este repositorio a partir de siete plantillas: `starters/web`, `starters/web-vanilla`, `starters/flutter`, `starters/kotlin-android`, `starters/backend-php`, `starters/backend-node` o `starters/backend-python`. No instala dependencias, ejecuta scripts de paquetes, compila, usa la red ni publica. Copia los cuatro artefactos documentales aprobados sin modificarlos y agrega un perfil bilingüe de selección de capacidades; no extrae el ZIP, no copia `docs/technical` y no modifica los proyectos fuente.

`web` es la opción React/TypeScript/Vite. `web-vanilla` es la alternativa HTML/CSS/JavaScript sin esos frameworks o herramientas: su candidata no incluye dependencias npm y utiliza módulos integrados de Node.js para comprobar y servir archivos localmente. El exportador no agrega paquetes ni ejecuta esos scripts.

Usar Node.js `24.x`; las pruebas aquí se ejecutaron con `24.16.0` en Windows. Ejecutar `npm ci --ignore-scripts` en la raíz para instalar el SDK MCP oficial y el cliente usado por las pruebas; el motor de exportación no incorpora esas dependencias en las soluciones generadas. La carpeta padre inmediata del destino debe existir; el destino completo no debe existir, ni siquiera vacío. Usar una jerarquía local confiable y sin cambios concurrentes de archivos, permisos o enlaces.

## Uso

### Crear una solución completa fácilmente

Desde la raíz del repositorio:

```powershell
npm run create-app
```

El asistente bilingüe permite escoger sitio web sencillo, aplicación web, móvil, escritorio, Android nativo o solo API sin conocer los nombres de las plantillas. Cuando una solución necesita cliente y backend, crea ambos dentro de una carpeta común y genera un `START-HERE` bilingüe. La creación no instala, compila, publica ni sobrescribe. La solución entrega cuatro comandos coordinadores: `npm run doctor`, `npm run setup`, `npm run check` y `npm start`; sólo `setup`, cuando la persona lo ejecuta explícitamente, instala las dependencias fijadas de sus componentes.

### Utilizar la base desde un agente

Un agente con acceso a archivos y terminal sigue [`AGENTS.md`](../AGENTS.md). Un host MCP puede iniciar directamente `tools/mcp-server.mjs` mediante Node.js y descubrir recursos bilingües y tres herramientas limitadas para catálogo, diagnóstico y creación. No se debe iniciar mediante un wrapper que escriba mensajes en `stdout`, porque ese canal pertenece exclusivamente al protocolo. Consulta la [guía de agentes y MCP](../docs/agent-guide.es-419.md).

### Exportar una plantilla individual: modo avanzado

Desde la raíz del repositorio, elegir una ruta absoluta nueva y un nombre ASCII en minúsculas de 1 a 63 caracteres: debe empezar con una letra y puede contener dígitos y guiones simples entre grupos. No admite espacios, `_`, guiones consecutivos o guiones finales.

```powershell
node tools/create-project.mjs --template web --name my-web-project --destination "D:\projects\my-web-project"
node tools/create-project.mjs --template web-vanilla --name my-plain-site --destination "D:\projects\my-plain-site"
node tools/create-project.mjs --template flutter --name my-flutter-project --destination "D:\projects\my-flutter-project"
node tools/create-project.mjs --template kotlin-android --name my-native-project --destination "D:\projects\my-native-project"
node tools/create-project.mjs --template backend-php --name my-api-project --destination "D:\projects\my-api-project"
node tools/create-project.mjs --template backend-node --name my-node-api --destination "D:\projects\my-node-api"
node tools/create-project.mjs --template backend-python --name my-python-api --destination "D:\projects\my-python-api"
```

Estas rutas son ejemplos; elegir carpetas propias cuyo padre ya exista. En un sistema POSIX usar su ruta absoluta local, por ejemplo `/projects/my-web-project`; esto no representa una prueba de ejecución en ese sistema.

```powershell
node tools/create-project.mjs --help
```

La CLI solo admite `--template`, `--name` y `--destination`, o `--help` por separado. No hay opciones para forzar sobrescritura, omitir checksums, cambiar la versión aprobada o aprobar la adopción. Devuelve JSON y código de salida `0` al completar la copia; devuelve un error JSON y código `1` si falla.

En `web`, `web-vanilla` y `backend-node`, `--name` modifica únicamente el nombre de `package.json`, el nombre superior del lock npm y su paquete raíz cuando existe; el recibo indica `packageNameChanged: true`. Conserva los demás campos y registros de dependencias; esto no verifica que puedan instalarse. No cambia títulos HTML ni textos visibles. En `flutter`, el nombre solo identifica la preparación en el recibo JSON: no cambia `pubspec.yaml`, paquetes, nombres visibles ni bundle/application IDs. Los identificadores de distribución quedan pendientes de decisión y verificación del consumidor.

En `kotlin-android` tampoco se cambian paquetes ni application IDs; en `backend-php` no se cambia la identidad de Composer y en `backend-python` no se cambia el paquete Python ni el namespace importable. Se conservan wrappers, manifiestos y bloqueos. La herramienta comprueba la presencia de archivos esenciales, no resuelve dependencias ni certifica el contenido de esos bloqueos.

## Qué se entrega

Además de los archivos permitidos de la plantilla, la carpeta `foundation/` contiene:

| Archivo | Propósito |
| --- | --- |
| `foundation-0.1.0-draft.4.zip` | Snapshot documental aprobado como versión `1.0.0`; mantiene su nombre editorial histórico. |
| `approval-1.0.0.es-419.md` | Recibo de aprobación en español latinoamericano. |
| `approval-1.0.0.en-US.md` | Recibo de aprobación en inglés estadounidense. |
| `foundation-0.1.0-draft.4.verification.json` | Registro histórico enlazado por los recibos; no se reescribe su estado previo a la aprobación. |
| `capability-profile.es-419.md` | Registro de selección y aceptación del consumidor en español latinoamericano. |
| `capability-profile.en-US.md` | Registro equivalente en inglés estadounidense. |
| `adoption.json` | Inventario y resultado de esta preparación, no aprobación del consumidor. |

Los cuatro artefactos históricos se comparan con SHA-256 fijados en el código antes de crear el destino. Cada archivo escrito se vuelve a leer y se compara byte a byte con el contenido preparado. Los recibos históricos conservan sus enlaces entre esos archivos. Estos hashes detectan una diferencia respecto de los valores fijados; no son una firma digital ni autentican por sí solos un repositorio o herramienta comprometidos.

El registro `adoption.json` distingue:

```json
{
  "foundationReleaseApproved": true,
  "consumerAdoptionStatus": "pending-consumer-confirmation",
  "capabilityProfiles": {
    "selectionStatus": "pending-consumer-selection"
  },
  "technicalTemplate": {
    "revision": "1.1.0-draft.2",
    "stage": "draft",
    "status": "not-approved",
    "generationStatus": "generated-for-evaluation"
  }
}
```

Todos los starters actuales están en `1.1.0-draft.2`; el recibo registra siempre la revisión exacta de la plantilla seleccionada en vez de asignar una sola revisión global. Los dos archivos de capacidades se copian byte a byte y sus valores SHA-256 quedan en `adoption.json`. Exigen que el consumidor seleccione `no aplica`, `planificado` o `habilitado` para identidad, multitenancy/privacidad, pagos/licencias, móvil seguro, offline/sincronización y distribución. Seleccionar no equivale a implementar ni aprobar.

También incluye fecha UTC, hashes de fuente y copia, modificaciones de nombres y comprobaciones no ejecutadas. El hash del inventario identifica los archivos fuente incluidos en esa preparación; no es un identificador Git, una firma o evidencia de reproducibilidad binaria. No incluye rutas absolutas del equipo. La aprobación documental disponible no concede aprobación técnica, adopción del consumidor ni soporte de plataforma.

## Copia y exclusiones

Se conservan, cuando existen, ambos README de la plantilla, `.env.example`, archivos fuente permitidos, assets y lockfiles. Es obligatorio que existan los dos README y el manifiesto/lock correspondiente. No se ejecuta ni traduce el contenido; los JSON npm y `.npmrc` se analizan para las comprobaciones descritas. Salvo los dos JSON npm personalizados y el nuevo recibo, se conservan los bytes de los archivos incluidos.

`web-vanilla` exige además `index.html`, `styles.css`, `favicon.svg`, `src/main.js`, `scripts/serve.mjs`, `scripts/server.mjs` y `scripts/check.mjs`. Su `package.json` y `package-lock.json` pasan las mismas comprobaciones de JSON, identidad y versiones de lock npm (`1`, `2` o `3`) que `web`. Exigir esos archivos no certifica el funcionamiento del navegador ni que todo script futuro esté libre de dependencias.

La política de nombres en [el exportador](lib/project-export.mjs) excluye, incluso en directorios anidados y sin distinguir mayúsculas:

- Dependencias, cachés y resultados conocidos: `node_modules`, `build`, `dist`, `.dart_tool`, `.fvm` (conservando `.fvmrc`), `.gradle`, `outputs`, `output`, `coverage`, `.cache`, `.next`, `.turbo`, `Pods`, `ephemeral` y `.symlinks`.
- Metadatos locales y resultados internos: `.git`, `.idea`, `.validation`, `releases`, archivos `.iml`, registros y archivos temporales conocidos.
- Configuración local nativa: `local.properties`, `key.properties`, archivos locales generados de Flutter y ubicaciones conocidas de datos de Xcode.
- Archivos de entorno reales reconocidos por nombre: `.env`, `.env.*` excepto `.env.example`, `.envrc` y nombres terminados en `.env`.
- Directorios y archivos reconocidos como secretos/credenciales, claves y almacenes de firma, configuración de servicios y gestores de paquetes que puede contener credenciales.
- Dependencias y resultados PHP/Kotlin: `vendor`, `.phpunit.cache`, `.kotlin`, `.cxx`, `artifacts`, `auth.json` y caché de resultados PHPUnit. Archivos `*.sqlite`, `*.sqlite3`, `*.db` y sus archivos `-wal`, `-shm` y `-journal` se excluyen: la base se crea con migraciones, no copiando datos.

En Laravel, se conservan los directorios estructurales reconocidos de `storage` y sus `.gitignore`, pero se excluyen los datos, sesiones, vistas compiladas, caché, archivos subidos y registros. En `bootstrap/cache` solo se conserva `.gitignore`. Las migraciones y configuración fuente sí se copian.

`.npmrc` es una excepción revisada: solo se aceptan las líneas `engine-strict=true` y/o `save-exact=true`, sin duplicados, con separadores LF/CRLF y líneas vacías opcionales. Se preservan sus bytes. Cualquier otra configuración detiene la exportación antes de crear el destino; el error no muestra su contenido. `.npmrc` vacío también se rechaza.

Esta política no es un detector universal de secretos. Revisar el contenido de la plantilla, incluidos los ejemplos de entorno y assets, antes de exportarla: una credencial incrustada en un archivo con nombre corriente no se detecta por estos filtros. No se copian automáticamente todas las configuraciones necesarias para un registro npm privado, firma o distribución.

## Límites de seguridad y recuperación

Se rechazan rutas de destino relativas, traversal explícito, nombres de dispositivos/streams de Windows, UNC y namespaces de dispositivos. Se comprueba que el destino esté fuera del repositorio por ubicación léxica y resuelta. Se rechazan symlinks, junctions y aliases detectables en las rutas inspeccionadas, así como hard links en archivos incluidos. Los directorios excluidos no se recorren.

La copia rechaza colisiones de nombres por mayúsculas o normalización Unicode NFC, además de la ruta reservada `foundation` en una plantilla. Acepta hasta 10 000 archivos fuente, 128 MiB de fuente en total y 32 MiB por archivo leído. Los archivos se abren para creación exclusiva; la herramienta nunca sobrescribe ni elimina archivos o directorios, ni inicializa Git.

Las comprobaciones de ruta y creación exclusiva se apoyan en [las APIs oficiales de archivos de Node.js](https://nodejs.org/docs/latest-v24.x/api/fs.html). No constituyen un sandbox contra procesos maliciosos que cambian la jerarquía entre operaciones; tampoco certifican todos los tipos de reparse point, montajes, filesystems de red o semánticas de nombres. No ejecutar sobre jerarquías compartidas o no confiables. No se garantiza una transacción de todo el directorio ni durabilidad frente a un corte de energía.

Si falla después de crear el destino, devuelve `partialDestinationRetained` y conserva la carpeta parcial para inspección; no la declara una preparación terminada. No reanuda sobre esa carpeta. Tras investigar la causa, usar otro destino nuevo si corresponde. El consumidor debe revisar la plantilla, confirmar o rechazar la adopción documental y verificar sus entornos, dependencias, identificadores y requisitos de producto.

## Pruebas del exportador

```powershell
node --test tools/create-project.test.mjs
```

Resultado local registrado: `40` pruebas aprobadas, `0` fallidas y `0` omitidas en Windows con Node.js `24.16.0`, el 2026-09-04. La suite cubre presencia de perfiles de capacidad, recibos de bytes/hashes, revisiones exactas por plantilla, copias sintéticas web/Flutter/Kotlin/PHP, exclusiones de datos y cachés, tipos de archivos estructurales, adopción pendiente, nombres portables y competencia de dos creadores por un destino. Se conserva la cobertura anterior de web sin framework: fuente sin dependencias, renombrado npm/recibo, exclusiones, `.npmrc`, archivos requeridos, manifiestos/locks y protecciones de destino/enlaces.

Las pruebas crean fixtures sintéticos aislados en directorios temporales propios y retiran únicamente esos directorios tras verificar su ubicación. Sus supuestos artefactos de aprobación son datos de prueba, no nuevos recibos; el reemplazo de pins solo existe en la interfaz importable para pruebas, no en la CLI. La suite usa [el ejecutor integrado de Node.js](https://nodejs.org/docs/latest-v24.x/api/test.html). Los casos léxicos POSIX se ejecutan como funciones de cadenas en Windows: no prueban un filesystem POSIX. Esta suite no instala ni prueba React, Flutter, navegadores, dispositivos, compilaciones nativas o proyectos consumidores reales.

La prueba `node --test tools/mcp-server.test.mjs` inicia el servidor por `stdio` usando el cliente SDK oficial. Comprueba descubrimiento, lectura de recursos, catálogo, diagnóstico, creación aislada, rechazo de rutas relativas y negociación tanto con el protocolo heredado de 2025 como con la revisión fijada `2026-07-28`.
