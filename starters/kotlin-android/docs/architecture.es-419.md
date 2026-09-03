# Arquitectura de la base Kotlin Android

Revisión técnica: `1.1.0-draft.1`. Estado: candidata, sin aprobación de producto.

[English (US)](architecture.en-US.md) · [Inicio](../README.es-419.md) · [Verificación](verification.es-419.md)

## Límites de las capas

```text
app: MainActivity -> TaskViewModel -> TaskService
                                      |      |
                                      |      +--> dominio puro
                                      +---------> TaskRepository
                                                     ^
                                                     |
                                            MemoryTaskRepository
```

`core` es un módulo Kotlin/JVM sin Android ni Compose. El dominio valida y transforma valores; no consulta reloj, disco, UI o red. `TaskService` coordina casos de uso mediante `TaskRepository` y funciones de ID/tiempo inyectadas. `MemoryTaskRepository` es un adaptador intercambiable. `app` depende de `core`; `core` no depende de `app`. `MainActivity` conecta dependencias, y `TaskViewModel` administra estado observable para `TaskScreen`.

La interfaz del repositorio es síncrona porque este ejemplo solo trabaja con una colección pequeña en memoria. No conectes directamente una base de datos, red o trabajo pesado a estas llamadas en el hilo de UI. Si el producto necesita E/S, rediseña el límite asíncrono, cancelación, estados de carga y consistencia y compruébalos antes de sustituir el adaptador.

## Contratos del ejemplo

| Entrada o acción | Resultado observable |
| --- | --- |
| Título `"  Revisar  "` | `"Revisar"`, tarea pendiente |
| `null`, número, vacío, solo espacios, control interno o separador de línea | `INVALID_TITLE`; no genera ID ni consulta reloj |
| 80 puntos de código / 81 | Aceptación / `TITLE_TOO_LONG` |
| ID con 1–100 caracteres `[A-Za-z0-9_-]` | Aceptado; espacios o ID vacío producen `INVALID_ID` |
| Epoch milisegundos entre 0 y 8640000000000000, inclusive | Aceptado; fuera del rango produce `INVALID_TIME` |
| ID repetido al agregar | `DUPLICATE_ID`; no sobrescribe |
| Alternar un ID inexistente | `NOT_FOUND`; no crea tarea |
| Dos alternancias de la misma tarea | Regresa al estado original |

El límite temporal es una política del ejemplo, no un estándar Android ni una garantía de orden total. El reloj civil sirve aquí para registrar creación, no para medir duración. Se cuentan puntos de código, no grafemas visibles ni bytes; una letra con marcas combinadas puede contar más de uno. Se recortan extremos antes de validar; no se aplica NFC ni cambio de mayúsculas. El dominio no pretende validar nombres de personas o secretos.

Los valores `Task` son inmutables. Constructor y `copy` comprueban ID, tiempo y título ya recortado; una construcción interna inválida lanza `IllegalArgumentException`. Para entradas externas, `createTask` devuelve errores tipados, no exige controlar esa excepción. También se rechazan sustitutos UTF-16 sin pareja. El repositorio devuelve una lista separada de su colección y conserva orden de inserción. `update` aplica una transformación pura bajo el mismo monitor JVM; éxito o ausencia de modificación es el contrato. No acepta cambiar el ID. La prueba concurrente cubre esta instancia de memoria, no transacciones de base de datos, múltiples procesos ni una garantía distribuida.

`TaskResult.Success` y `TaskResult.Failure(TaskError)` separan éxito y fallo. Fallas conocidas conservan su código; excepciones de dependencias se convierten en errores genéricos sin detalles privados. No se capturan errores fatales de la máquina virtual. No hay reintentos automáticos: un futuro adaptador podría haber aplicado un efecto antes de fallar. La UI conserva el borrador ante fallo, muestra un mensaje y ofrece recarga para errores no relacionados con el título; recargar no promete recuperación de un backend inexistente.

Una escritura confirmada actualiza la lista local con el `Task` devuelto por el servicio, conservando el orden de las demás tareas. No depende de una segunda lectura para mostrar el éxito: agregar limpia el borrador después de confirmar, y alternar refleja el estado confirmado. La recarga es una operación separada; si falla, muestra su error sin borrar tareas o cambios ya confirmados. Ese estado local no pretende ser una instantánea completa de un servidor externo.

## Estado, idioma y acceso

Un ViewModel retenido mantiene tareas, borrador, error e idioma durante recreación de actividad. No hay `SavedStateHandle` ni persistencia. Una app suspendida puede conservar memoria o perderla si Android termina el proceso; volver a primer plano no promete datos durables. La app no declara permisos de Internet o almacenamiento. Las reglas de backup no convierten memoria en almacenamiento ni constituyen una certificación de todos los mecanismos de transferencia del dispositivo.

Los recursos completos en inglés estadounidense son el respaldo Android; el directorio `values-b+es+419` contiene exclusivamente los textos españoles. El selector usa recursos localizados sin cambiar el idioma global del dispositivo. La app no divide recursos por idioma al producir bundles, para no depender de descargas de idiomas. No se probó distribución de bundles. `localeConfig` se interpreta desde API 33; en API 26–32 el selector interno sigue disponible. La anotación de lint `tools:targetApi="33"` documenta esos atributos de manifiesto ignorados por sistemas anteriores, no eleva el mínimo de ejecución.

Las tareas son texto nativo, no HTML. Campo etiquetado, acción de teclado, fila alternable con rol de casilla, encabezado y regiones vivas aportan semántica accesible. Eso no equivale a una auditoría con TalkBack, tamaño de fuente máximo o toda tecnología asistiva. El diseño usa desplazamiento e insets del sistema/teclado; cada producto debe verificar sus dispositivos y contenidos reales.

## Qué conservar y qué sustituir

Conserva los contratos explícitos, capas sin dependencia inversa, errores tipados, inyección, recursos por idioma y controles verificables. Sustituye el dominio de tareas, límites, estrategia de IDs, reloj, almacenamiento, apariencia e identidad según la necesidad. La separación es conceptual y comprobable por dependencias de módulos; no impone una arquitectura única para todos los proyectos.

Antes de producción, decide recuperación/persistencia, amenazas, privilegios, accesibilidad, soporte mínimo real, firma segura, licencias, actualización de dependencias y pruebas de release. La carpeta se puede copiar completa sin referencias al repositorio padre. Las máquinas, caches, SDK, resultados generados y claves no forman parte de la base portátil. Copiar no adopta reglas por otro equipo ni aprueba el producto resultante.
