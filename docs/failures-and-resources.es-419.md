# Fallos, cancelación, recursos y recuperación

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](failures-and-resources.en-US.md) · [Inicio](../README.es-419.md)

## Alcance y forma de uso

Esta ampliación desarrolla FUND-003 y FUND-006 de los [fundamentos](programming-fundamentals.es-419.md) y aspectos de RULE-004 y RULE-005. No agrega reglas ni selecciona una plataforma. Los ejemplos son modelos locales originales; las condiciones propuestas requieren implementación y evidencia propias en cada proyecto consumidor, fuera de esta base. El respaldo y sus límites figuran en la [trazabilidad](traceability.es-419.md).

Las tablas describen resultados esperados. El [registro de comprobaciones del núcleo](core-verification.es-419.md) identifica cuáles se ejecutaron y con qué límites; una expectativa no es una prueba superada.

## Propiedad y limpieza de recursos

Antes de usar un archivo, conexión, suscripción u otro recurso, identificar quién lo adquiere, quién puede usarlo y quién lo libera. Recibir un recurso prestado no transfiere automáticamente su propiedad. Tras una adquisición exitosa, programar la limpieza para todas las salidas controladas, incluido un error o una cancelación. Si la adquisición falla parcialmente, su implementación debe atender los recursos internos que no llegó a transferir al llamador.

La referencia de [C# sobre `using`](traceability.es-419.md#src-dotnet-using) documenta liberación al salir del ámbito, incluso por excepción. Es un mecanismo concreto, no una selección de C# ni una garantía ante terminación abrupta del proceso. Otros entornos requieren comprobar sus propias garantías.

Propuesta local: conservar el resultado del trabajo y el de la limpieza por separado. Un fallo de cierre no debe borrar el fallo original ni convertirse en éxito. Intentar liberar no demuestra que se liberó; tampoco autoriza repetir indiscriminadamente un cierre que pueda tener efectos. La limpieza asíncrona requiere observar su terminación según el contrato. No usar después un recurso liberado ni cerrarlo mientras otro propietario autorizado todavía lo utiliza.

## Cancelación, límites y resultado desconocido

Una solicitud de cancelación pide detener trabajo; no prueba que ya se detuvo. La [documentación de .NET](traceability.es-419.md#src-dotnet-cancellation) explica la cooperación entre quien solicita y quien observa la cancelación. Una llamada bloqueada puede necesitar un mecanismo específico para reaccionar.

Propuesta local: revisar la cancelación antes de iniciar cada unidad de trabajo, limitar la duración de las unidades cuando sea necesario y documentar qué ocurre con lo ya completado. En el modelo de tres unidades, la cancelación observada después de la primera devuelve `Cancelled` con `completed=1`; no deshace esa unidad. Una solicitud recibida después de una terminación confirmada no debe inventar una reversión.

Un tiempo límite agotado termina la espera permitida, no necesariamente la operación remota. Si pudo aplicarse un efecto y se perdió la respuesta, el resultado local es `Unknown`, no `NotApplied`. Conservar la identidad de la operación para consultar o reconciliar su resultado. Definir un presupuesto total, incluido el de los reintentos; no prolongarlo silenciosamente reiniciando el contador. Esta política es local y no implementa relojes, cancelación de red ni confirmación distribuida.

## Concurrencia, reentrada y transiciones

El [respaldo sobre concurrencia](traceability.es-419.md#src-mit-concurrency) contempla confinamiento e inmutabilidad. El contrato local debe identificar la transición completa que preserva el invariante, no solo escrituras aisladas. Para un cupo disponible, comprobar disponibilidad y reservarlo forman una sola transición respecto de solicitudes competidoras.

Ejemplo: con `initialCapacity=1`, tanto A→B como B→A deben producir una aceptación, un rechazo y cero cupos restantes. Si ambas solicitudes leen `1` antes de escribir, pueden aceptar dos veces aunque el valor final sea `0`; comprobar solo ese valor no detecta el defecto.

Un único hilo no excluye reentrada: una llamada a código externo o una suspensión puede permitir otra solicitud antes de completar la anterior. Declarar si eso es posible. Confinamiento, transacciones, operaciones atómicas o exclusión mutua son alternativas dependientes del entorno, no recetas intercambiables. Un bloqueo local no demuestra coordinación entre procesos, y una palabra como `atomic` en pseudocódigo no la implementa. Los modelos seriales no prueban hilos reales, interbloqueos ni recuperación tras caídas.

## Reintentos e idempotencia delimitada

[RFC 9110, sección 9.2.2](traceability.es-419.md#src-rfc9110) define idempotencia por el efecto solicitado de repeticiones idénticas, no por respuestas necesariamente iguales. Distingue cuándo es razonable repetir automáticamente una solicitud HTTP; no proporciona una implementación de deduplicación para cualquier negocio.

Propuesta local: reintentar solo errores clasificados como recuperables cuando repetir sea seguro, con número de intentos y presupuesto total limitados. Definir esperas apropiadas al servicio; un reintento no corrige permisos ni entradas inválidas. Cuando el efecto sea incierto y no exista garantía pertinente, reconciliarlo antes de repetir.

Si se usan claves de idempotencia, especificar:

- Alcance: identidad autorizada, tipo de operación y clave; una clave no sustituye autorización.
- Carga: criterio de igualdad estable; rechazar reutilizar una clave con contenido diferente.
- Coordinación: comprobación, aplicación del efecto y registro del resultado deben evitar duplicaciones frente a solicitudes simultáneas y caídas dentro del alcance prometido.
- Persistencia y vencimiento: duración del registro y tratamiento de solicitudes tardías; perder o vencer el registro puede permitir aplicar otro efecto.

El ejemplo usa un mapa en memoria y solicitudes seriales: `keyA` con carga `2` devuelve `Applied2`; repetir devuelve `Replayed2` sin otro efecto; carga `3` devuelve `Conflict`. No demuestra atomicidad persistente, tolerancia a caídas ni ejecución «exactamente una vez». Si registro y efecto pertenecen a sistemas distintos, resolver esa coordinación exige otro diseño y otras pruebas.

## Recuperación y eliminación definitiva

Cuando los datos deban conservarse, definir el punto recuperable, la pérdida aceptable, el tiempo de recuperación y quién puede restaurar. Identificar contenido, versión, dependencias y permisos necesarios; proteger también las copias. La [guía de restauración de SQL Server](traceability.es-419.md#src-sql-restore) exige comprobar restauraciones en su contexto. Su uso aquí respalda esa distinción, sin adoptar SQL Server ni convertir todas sus instrucciones en reglas universales.

Propuesta local: ensayar una restauración aislada, verificar que el contenido esperado está completo, que su estructura e invariantes son válidos y que puede utilizarse. Un archivo existente, un mensaje de respaldo exitoso o una suma de comprobación por sí solos no demuestran todo eso. Registrar el procedimiento real, sus resultados y límites antes de confiar en él para los datos en alcance.

El modelo esperado es `{version:1, items:[2,3], total:5}`. Restaurar una copia equivalente en memoria satisface ese caso; una copia incompleta o `{version:1, items:[1,4], total:5}` no. Preservar el total no basta para preservar el contenido. No se ensayan discos, respaldos de bases de datos, credenciales ni tiempos reales de recuperación.

Antes de una acción destructiva, confirmar objetivo exacto, alcance y autorización verificable; una política preaprobada puede proporcionarla. Los datos descartables y la eliminación definitiva autorizada no requieren una copia recuperable por principio: documentar su clasificación y límites, incluidas las copias afectadas. No crear retenciones que contradigan una eliminación requerida. Una autorización ambigua impide actuar; estos modelos no autorizan ninguna eliminación real.

## Casos de comprobación

| Caso original | Resultado esperado | Defecto que detecta |
| --- | --- | --- |
| Trabajo y limpieza exitosos tras adquirir | Éxito; un intento de cierre. | Omitir la limpieza normal. |
| Adquisición fallida antes de transferir propiedad | Error de adquisición; cero cierres del llamador. | Cerrar un recurso no adquirido. |
| Trabajo fallido tras adquirir | Error original; un intento de cierre. | Salir antes de limpiar. |
| Fallan trabajo y limpieza | Error original y error secundario conservados. | Ocultar uno o informar éxito. |
| Cancelación tras la primera de tres unidades | `Cancelled`, `completed=1`. | Continuar otras dos unidades. |
| Efecto remoto posible, respuesta perdida | `Unknown`. | Afirmar que no se aplicó. |
| Misma clave y carga repetidas; después carga distinta | `Applied2`, `Replayed2`, `Conflict`; un efecto. | Duplicar o aceptar una clave ambigua. |
| Copia completa; alterada con igual total; incompleta | Aceptar solo la completa. | Verificar solo el total o la existencia. |

Todos estos alcances son deliberadamente pequeños. Superarlos no acredita una estrategia de recuperación operativa, concurrencia segura ni cumplimiento completo de las reglas.
