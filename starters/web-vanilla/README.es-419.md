# Base web: HTML, CSS y JavaScript

**Actualización de seguridad:** HTTP ahora exige autenticación; una URL por sí sola no basta. Consulta [autenticación y producción](security-production.es-419.md) antes de seguir los ejemplos anteriores.

Versión técnica: `1.1.0-draft.2`. Estado: propuesta técnica no aprobada, para evaluación; no es un producto terminado.

[English (United States)](README.en-US.md) · [Arquitectura](docs/architecture.es-419.md) · [Cambios](CHANGELOG.es-419.md) · [Verificación](docs/verification.es-419.md)

Una base independiente con HTML, CSS y módulos JavaScript nativos. No usa React, TypeScript, Vite, un empaquetador ni paquetes npm de terceros. La lista de tareas es un ejemplo reemplazable: permite agregar tareas, completarlas, dejarlas pendientes, volver a consultar la lista en memoria y seguir la apariencia clara/oscura del sistema. No incluye un servidor backend ni persistencia local; el modo HTTP delega la persistencia al servidor. Autenticación, sincronización offline, despliegue y soporte certificado de navegadores no están incluidos.

El código original se distribuye bajo [MPL-2.0](LICENSE). Las dependencias o materiales externos conservan sus propias licencias.

## Conexión API opcional

El contrato y los adaptadores HTTP ya están implementados. El modo memoria sigue siendo el predeterminado de los clientes; las descripciones de pérdida de datos se refieren a ese modo. Consultar la [guía de integración](api-integration.es-419.md) para configurar la conexión y revisar sus límites. No se incluye autenticación de producción.

## Ejecutar una copia local

Perfil declarado: Node.js `>=24.16.0 <25`; referencia de herramientas Node.js `24.16.0` y npm `11.17.0`. No hay instalación global de frameworks ni paso de compilación. [package.json](package.json) declara los comandos y [package-lock.json](package-lock.json) conserva la identidad npm sin dependencias de terceros.

Desde la carpeta de una copia recién exportada:

```powershell
node --version
npm --version
npm run check
npm start -- --port 5180
```

Abre `http://127.0.0.1:5180/`, no el archivo HTML con `file://`. JavaScript es necesario para las acciones interactivas; el HTML inicial en español incluye un aviso `noscript` visible cuando está deshabilitado y deja sus controles inactivos. `noscript` no reemplaza la aplicación ni implementa un modo interactivo sin JavaScript. [HTML: noscript](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element).

Es opcional comprobar la instalación npm en esa copia nueva, antes de ejecutar `check`:

```powershell
npm ci --ignore-scripts
```

El comando utiliza el lock y omite scripts de instalación; la candidata no tiene paquetes de terceros que instalar. `npm ci` puede retirar un `node_modules` existente: usarlo en la copia nueva, no sobre material ajeno. `--ignore-scripts` no convierte `npm run check` en una operación sin ejecución de código; ese comando ejecuta deliberadamente los scripts locales revisados. [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/).

Detén el servidor con `Ctrl+C`. El servidor toma una instantánea de los archivos públicos al arrancar: reinícialo después de cambiar HTML, CSS o JavaScript y luego recarga el navegador. No hay actualización automática, generación de `dist` ni `npm run build`.

## Contrato del ejemplo

| Dato u operación | Contrato |
| --- | --- |
| Título | String recortado en sus bordes; de 1 a 80 puntos de código Unicode. |
| Contenido del título | Sin controles C0/C1, sustitutos Unicode aislados ni separadores U+2028/U+2029 internos; no es un límite de grafemas visuales. |
| ID | De 1 a 100 caracteres ASCII: letras, dígitos, `_` o `-`. No se exige UUID en el dominio. |
| Creación | `createdAtMs`: entero seguro entre `0` y `8640000000000000`, inclusive. No es un reloj lógico ni una garantía de orden entre dispositivos. |
| Estado | `completed` es booleano; completar/dejar pendiente crea un nuevo valor. |
| Repositorio | Memoria de esta instancia de página, con IDs únicos y orden de inserción. |

El recorte de bordes ocurre antes de validar el contenido restante: por ejemplo, una nueva línea solo en el borde puede desaparecer al recortar. No se normaliza el texto a NFC. Los títulos se muestran como texto literal, no se interpretan como HTML. Las instantáneas de tareas y listas están congeladas y no exponen el `Map` interno.

“Volver a cargar” consulta el repositorio actual: conserva las tareas. Recargar o cerrar la página destruye esa memoria; otra pestaña mantiene otra instancia. No se usa `localStorage`, IndexedDB ni una base SQL. La base no implementa editar títulos o eliminar tareas.

El servicio recibe repositorio, generador de IDs y reloj explícitos; la composición local usa `crypto.randomUUID()` y `Date.now()`. El tiempo de creación se conserva como dato, pero no se muestran fechas en esta interfaz. Una dependencia inválida o una operación fallida devuelve un código estable; los mensajes de interfaz se traducen por separado. No hay reintentos automáticos ni confirmación optimista de cambios. El controlador evita iniciar otra operación de datos mientras está ocupado y conserva el estado ya confirmado ante un fallo.

## Idiomas y estructura

Los textos están separados en [es-419](src/i18n/es-419.js) y [en-US](src/i18n/en-US.js), un archivo por idioma. El selector cambia los mensajes de la interfaz; los códigos de error y los títulos ingresados no se traducen. El idioma inicial del HTML es español latinoamericano, elegido de forma determinista; no se detecta ni persiste una preferencia del navegador. Recargar la página restablece es-419. La selección de idioma no representa compatibilidad certificada con otras regiones.

La organización es intencionalmente pequeña: dominio, servicio, repositorio en memoria, controlador y vista DOM. No es un framework general de componentes ni un sistema universal de estado. Consulta [arquitectura](docs/architecture.es-419.md) antes de sustituir el dominio o añadir persistencia.

## Servidor local y límites

[scripts/serve.mjs](scripts/serve.mjs) usa [scripts/server.mjs](scripts/server.mjs), módulos integrados de Node.js y exclusivamente `127.0.0.1`. El puerto predeterminado es `5180`; un puerto ocupado produce un error, sin detener su propietario ni elegir otro silenciosamente.

Solo se sirven `/` o `/index.html`, `/styles.css`, `/favicon.svg` y módulos `.js` admitidos bajo `/src/`, incluidos los idiomas. No se sirven `scripts`, `tests`, `docs`, manifiestos npm, `.env` ni `foundation/`; tampoco hay listado de directorios o rutas de aplicación con fallback. No colocar secretos en los archivos públicos, aunque el servidor sea local.

El servidor limita la instantánea a 512 archivos, 1 MiB por archivo y 8 MiB totales. Rechaza enlaces detectados, rutas codificadas/ambiguas y peticiones con `Host` u origen no admitidos; permite únicamente `GET` y `HEAD`. Sus cabeceras de desarrollo restringen código inline y conexiones de la página. No son autenticación, TLS ni un sandbox ante procesos maliciosos que cambien el sistema de archivos. Usar únicamente una carpeta local confiable, sin modificaciones concurrentes durante el arranque.

No exponer este servidor a una red pública, usarlo como alojamiento de producción ni presentar sus pruebas como auditoría integral de seguridad. Añadir una API requiere revisar la política de conexiones, contratos, credenciales y autenticación; no basta con quitar una cabecera.

## Verificación y adopción

`npm run check` revisa sintaxis, recursos HTML acordados, paridad de claves/interpolaciones de idiomas y ejecuta las pruebas locales. Es un comprobador acotado del ejemplo, no un parser completo de HTML, compilador, auditor de accesibilidad o prueba de todos los navegadores. Las pruebas pueden crear y retirar fixtures temporales propios y abrir puertos efímeros de loopback.

Los resultados efectivamente observados, sus versiones y sus límites están en [verificación](docs/verification.es-419.md). Al exportar desde el repositorio base, `foundation/adoption.json` mantiene la adopción del consumidor pendiente y la plantilla técnica no aprobada. La documentación aprobada `1.0.0`, cuando se adjunta, conserva un alcance documental independiente. Esta base funciona sin importar documentos desde fuera de su carpeta.

## Versión de la aplicación y origen

La interfaz de ejemplo no muestra la versión de Project Base. Al exportar, `foundation/adoption.json` registra el origen técnico; no es una conexión activa con este repositorio. Define la versión de tu producto de forma independiente. Los cambios de la plantilla no actualizan las aplicaciones ya creadas: aplica la corrección en tu copia o genera una nueva en otra carpeta, sin sobrescribir tu trabajo.
