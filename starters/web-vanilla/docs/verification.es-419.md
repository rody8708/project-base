# Verificación de la base web sin framework

Versión técnica: `1.1.0-draft.2`. Estado: propuesta técnica no aprobada; un resultado de ejecución no equivale a aprobación del consumidor.

[English (United States)](verification.en-US.md) · [Inicio](../README.es-419.md) · [Arquitectura](architecture.es-419.md)

## Seguimiento enfocado — 2026-09-04

La revisión 2 pasó el comprobador de fuentes y las 86 pruebas. Se controló Microsoft Edge a 390×844 con una preferencia oscura explícita; los colores calculados de raíz/área de trabajo fueron `rgb(16, 23, 20)` y `rgb(23, 33, 29)`, sin errores de consola. La línea base más amplia que aparece debajo pertenece a la revisión 1 y continúa como evidencia histórica.

## Registro de ejecución

Registro local de fuente: `2026-09-03`, Windows, Node.js `24.16.0` y npm `11.17.0`. `npm run check` terminó con código `0`: 15 archivos JavaScript revisados, 52 claves por idioma, 74 pruebas aprobadas y ninguna fallida, cancelada u omitida.

| Comprobación | Resultado observado |
| --- | --- |
| `npm ci --ignore-scripts` | Aprobado; un paquete raíz y ninguna dependencia de terceros. |
| Sintaxis, shell HTML y paridad de idiomas | 15 archivos; recursos acordados; 52 claves coincidentes por idioma. |
| Dominio, servicio y repositorio | 18 pruebas aprobadas. |
| Controlador e idiomas | 14 pruebas aprobadas. |
| Servidor HTTP y CLI | 32 pruebas aprobadas con fixtures locales propios. |
| Comprobador de fuente | 10 pruebas aprobadas, incluidos casos que deben fallar. |
| `npm audit --json` | Cero avisos en la consulta registrada; no certifica ausencia de vulnerabilidades. |

No hay paso de build ni bundle compilado que declarar aprobado. La ausencia de dependencias npm de terceros se comprueba en el manifiesto y el lock, no mediante una supuesta compilación.

El lock npm v3 contiene únicamente `packages[""]`. Su SHA-256 de fuente es:

```text
aa09cc732f61b0927512577cb9bdd71d9213c590ae952fe6990f3e2391afe473
```

El exportador cambia los nombres raíz npm al preparar otra identidad de proyecto; por ello el hash del lock exportado puede ser distinto sin que se añadan dependencias.

## Repetición y criterio

Desde una copia local revisada:

```powershell
node --version
npm --version
npm run check
```

El proceso debe terminar con código `0` y sin pruebas fallidas, canceladas u omitidas. Registrar fecha, sistema operativo, versiones, archivos revisados, claves de idioma y total real de pruebas. Un conteo sin la versión o el contexto de ejecución no demuestra el estado de otra copia.

La suite del servidor usa fixtures propios y puertos efímeros de loopback. Comprueba recursos/MIME, `HEAD`, cabeceras, consultas, rutas privadas y traversal, codificación, métodos, `Host`, `Origin`, instantáneas, enlaces, límites, puerto ocupado y cierre. La aceptación de autoridades/orígenes HTTP del puerto `80` se comprobó con helpers puros: no se abrió ese puerto. Los casos no significan que el servidor haya sido probado en Internet o auditado contra todas las amenazas.

Las pruebas de dominio/controlador cubren límites Unicode 80/81, IDs y tiempo, instantáneas congeladas, duplicados, errores de dependencias/almacenamiento, operaciones superpuestas y fallos del callback de render. Los intercalados del adaptador sincrónico no demuestran concurrencia distribuida.

## Navegador observado

La QA local del `2026-09-03` usó Microsoft Edge headless en Windows; el agente de usuario reportó `Edg/151.0.0.0`. No se extrapola ese resultado a otros navegadores, versiones o dispositivos físicos.

| Escenario | Resultado registrado |
| --- | --- |
| Lista vacía y validación | Estado vacío visible; título vacío y 81 puntos rechazados; borrador conservado; 80 puntos aceptados. |
| Acciones de tareas | Agregar con Enter y botón, completar y reabrir con Espacio; foco conservado en el checkbox. |
| Idiomas y texto literal | ES/EN conservó dos tareas y el borrador; `lang` del HTML cambió; un título con `<b>` se mostró literalmente sin crear elementos `b`. |
| Recarga de lista/página | Recargar la lista conservó tres tareas; recargar completamente la página las descartó. |
| Fuente después del cierre | Servidor reiniciado para tomar la fuente congelada, página recargada y agregado mediante Enter aprobado. |
| Tamaños revisados | `1280×900`, `390×844` y `320×800`; `scrollWidth` igual al ancho del viewport, sin desbordamiento horizontal observado. |
| Capturas | Escritorio, móvil y JavaScript deshabilitado inspeccionados visualmente con resultado satisfactorio para este ejemplo. |
| Recursos y consola | Sesión de dos cargas: 22 solicitudes estáticas locales `200`, 11 por carga; cero errores y advertencias de consola registrados. |
| JavaScript deshabilitado | Sesión independiente `390×844`: contenido HTML y aviso `noscript` visibles, controles deshabilitados. |

Las capturas verifican esas presentaciones concretas, no todos los estados posibles. La prueba de teclado y las etiquetas no constituyen una auditoría WCAG, evaluación con lector de pantalla ni certificación de accesibilidad. El contador de recursos pertenece a esa sesión y no es un benchmark.

## Comprobación de una copia

Este registro corresponde a la fuente y QA descritas arriba. La copia exportada debe conservar ambos idiomas, módulos y scripts requeridos, sin depender de rutas del repositorio original. Su comprobación, identidad del lock, recibo de adopción y resultado HTTP se registran por separado para no introducir un inventario que se referencia a sí mismo. No se atribuyen automáticamente estos resultados a otra copia. Una exportación correcta no es aprobación técnica ni exime de cumplir MPL-2.0.

## Límites permanentes

La candidata no demuestra autenticación, backend, persistencia tras cerrar la página, sincronización entre pestañas, concurrencia distribuida, despliegue, rendimiento bajo carga, restauración de datos o seguridad integral. Las pruebas de controlador sin DOM no sustituyen la interacción real con el navegador; una revisión visual tampoco sustituye un análisis completo de accesibilidad. La documentación de arquitectura describe decisiones del ejemplo, no un estándar exhaustivo de desarrollo web.
