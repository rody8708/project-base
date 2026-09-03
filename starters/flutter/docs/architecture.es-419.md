# Arquitectura de la base Flutter

Revisión técnica: `1.1.0-draft.1`  
Estado: candidato técnico local; no es una nueva aprobación de la base documental.  
Idioma: español latinoamericano (`es-419`)  
[US English](architecture.en-US.md) · [Inicio](../README.es-419.md) · [Verificación](verification.es-419.md)

## Responsabilidades y dirección de dependencias

| Ubicación | Responsabilidad | Límite deliberado |
| --- | --- | --- |
| `lib/domain/task.dart` | Título válido y tarea inmutable | Dart puro; sin Flutter, almacenamiento ni mensajes traducidos |
| `lib/application/task_repository.dart` | Contrato de lectura, creación y estado de completado | Dart puro; no presupone una base de datos |
| `lib/application/task_controller.dart` | Estado de aplicación, validación, errores y exclusión de reentrada | Usa `ChangeNotifier` de Flutter; no se presenta como dominio independiente del framework |
| `lib/infrastructure/memory_task_repository.dart` | Implementación local del contrato | Memoria de una instancia, en un solo isolate |
| `lib/presentation/task_app.dart` | Composición, interacción y presentación | Inyecta el repositorio; es reemplazable por otra interfaz |
| `lib/l10n/strings_es_419.dart` / `strings_en_us.dart` | Mensajes por idioma | Selector de sesión, sin persistencia de preferencia |
| Runners nativos | Alojar el motor Flutter | La generación no prueba cada sistema operativo |

La UI depende del controlador; el controlador depende del contrato y del dominio. El adaptador implementa el contrato. `TaskApp` es el punto de composición que elige el adaptador en memoria por defecto y acepta uno inyectado para pruebas. Esta separación es una decisión local de la plantilla, no una arquitectura universal ni una obligación de crear capas vacías en todos los proyectos.

## Contratos observables

`TaskTitle` elimina espacios en los extremos con `trim`, rechaza un resultado vacío, controles U+0000–U+001F y U+007F–U+009F y separadores de línea U+2028/U+2029 dentro del resultado, y limita el título a 120 puntos de código Unicode. No normaliza NFC, no mide grafemas y no impone unicidad del título. Un emoji fuera del plano básico cuenta como un punto; una letra y su marca combinante cuentan como dos. Es una política del ejemplo que el proyecto consumidor debe reconsiderar, no un estándar de programación.

El repositorio asigna IDs únicos dentro de su instancia y entrega listas e ítems inmutables. Dos títulos iguales pueden producir dos tareas. `setCompleted(id, true)` expresa un estado deseado, por lo que repetirlo conserva el resultado local; no demuestra entrega exactamente una vez ni idempotencia distribuida. Un ID desconocido produce `notFound` sin crear datos. El adaptador no suspende su mutación interna con `await`; no se afirma seguridad entre threads, isolates o procesos.

El controlador permite una operación pendiente por instancia. Una segunda acción devuelve `false` sin ejecutar el repositorio; no se encola ni se reintenta. Al comenzar una operación, limpia el error anterior; un fallo conserva la lista conocida y se representa con un código de error. `false` también puede significar reentrada rechazada o finalización posterior al descarte del controlador: no es una prueba de que una escritura remota no ocurrió. La UI se deshabilita durante la operación.

Después de una escritura exitosa se usa el ítem devuelto, sin hacer otra lectura que pudiera fallar después del commit. Para este adaptador, el resultado es conocido localmente. Una futura API remota necesita extender el contrato para tiempos límite, cancelación, estado remoto desconocido, reconciliación, autenticación y autorización; no debe interpretar cualquier excepción como ausencia de efectos ni agregar reintentos automáticos a `add`.

## Errores, ciclo de vida y datos

Los errores de validación y de repositorio se traducen para la persona; los detalles internos no se muestran. El controlador ofrece un callback diagnóstico opcional para errores inesperados. Si el propio diagnóstico falla, se conserva el error de la operación y no se propaga esa segunda excepción. La UI de ejemplo no configura un servicio de telemetría ni envía datos; el consumidor debe definir observabilidad y redacción de información sensible si añade ese callback.

La vista es dueña de `TextEditingController` y `TaskController` y los libera en `dispose`. Una operación que termina tarde no actualiza la lista ni notifica a una vista descartada. Esto no cancela un efecto ya iniciado en el repositorio. No hay suscripciones externas, archivos abiertos por la aplicación, red, autenticación, base de datos, backups ni migraciones. Los datos se pierden al terminar la instancia; la advertencia es visible. No uses esta implementación para datos que deban conservarse.

## Reemplazo del ejemplo

Define primero el dominio del nuevo producto, sus límites de confianza y los datos que debe conservar. Después sustituye `TaskItem` y sus reglas; adapta el contrato y sus pruebas; implementa almacenamiento durable o red con contratos explícitos; finalmente cambia UI, textos, IDs de paquete, nombres e íconos nativos. Revalida cada plataforma y cada modo de compilación que pretendas entregar. No mezcles lógica de almacenamiento con widgets ni asumas que una prueba en memoria demuestra recuperación durable.

Los mensajes se mantienen en archivos separados `es-419` y `en-US`; los delegates del SDK cubren controles Material. El selector no cambia el idioma del sistema ni todos los metadatos del runner. Los controles tienen etiquetas, el error usa una región semántica viva y la página admite desplazamiento con teclado abierto. Las pruebas de widgets cubren un tamaño pequeño concreto; no equivalen a auditoría de accesibilidad, lector de pantalla, todas las escalas de texto o todos los dispositivos.

La [verificación](verification.es-419.md) separa análisis, modelos unitarios, widgets, ejecución nativa y artefactos. No hay una certificación implícita de seguridad, accesibilidad, tiendas o disponibilidad por el hecho de que una compilación pase.
