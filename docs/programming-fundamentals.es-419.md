# Fundamentos de programación

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](programming-fundamentals.en-US.md) · [Inicio](../README.es-419.md)

## Cómo interpretar estos fundamentos

Estos fundamentos desarrollan doce áreas de razonamiento para proyectos consumidores creados fuera de esta base. Orientan la aplicación de las [reglas propuestas](immutable-rules.es-419.md), pero no constituyen un estándar completo ni una formación integral en programación. Su respaldo documental se identifica por elemento en la [trazabilidad](traceability.es-419.md), junto con decisiones locales, límites y pendientes; no equivale a validación técnica.

No imponen un paradigma, un número de capas ni un conjunto de patrones. Las decisiones concretas deben responder al tamaño del proyecto, sus riesgos y las capacidades del equipo. El lenguaje prescriptivo describe la orientación propuesta, no obligaciones ya adoptadas. La fuerza obligatoria dependerá de las reglas expresamente aprobadas en una futura publicación estable y adoptadas por el proyecto consumidor, según la [gobernanza de la base](foundation-governance.es-419.md).

Los ejemplos y criterios siguientes son diseños locales originales, no código tomado de las fuentes. El pseudocódigo usa índices desde cero, enteros matemáticos y resultados explícitos como `Absent` o `InvalidInput`; no selecciona un lenguaje. Una implementación deberá resolver tipos, límites numéricos y entradas externas en su entorno. Los casos muestran resultados esperados, no ejecuciones de productos. El [registro inicial de modelos](fundamentals-verification.es-419.md) conserva 17 comprobaciones; la [comprobación del núcleo](core-verification.es-419.md) agrega 80 y ocho escenarios documentales. Distinguen ejemplos ejecutados, revisiones de contratos y aspectos no comprobados en productos.

## FUND-001 — Comprender el problema antes de programar

Aplicación propuesta: identificar quién necesita el resultado y describir entradas, salidas, errores y efectos antes de elegir una implementación. Un contrato distingue lo que exige al llamador de lo que garantiza la operación. En una frontera no confiable, esas exigencias no sustituyen la validación real. Aclarar ambigüedades con la persona responsable; cumplir una especificación equivocada no resuelve el problema correcto.

Ejemplo: calcular cuántos paquetes se necesitan para `n` unidades, con capacidad entera positiva. Cero unidades requiere cero paquetes; una fracción de paquete cuenta como uno completo. No se modifican datos externos.

```text
function packageCount(n, capacity):
    if n < 0 or capacity <= 0: return InvalidInput
    return n DIV capacity + (1 if n MOD capacity != 0 else 0)
```

Comprobación esperada: `(0,4) → 0`, `(8,4) → 2`, `(9,4) → 3`; `(-1,4)` y `(3,0)` se rechazan. La variante que devuelve solamente `n DIV capacity` falla en `(9,4)`. El criterio debe distinguir ambas soluciones, no limitarse a decir «calcula bien».

Respaldo y límites: [MIT, Specifications](traceability.es-419.md#src-mit-specifications) respalda contratos y sus garantías. Elegir interesados, priorizar necesidades y buscar una solución mínima son propuestas locales; este ejemplo no valida el proceso de descubrimiento de requisitos ni entradas de cualquier tipo.

## FUND-002 — Modelar datos e invariantes

Aplicación propuesta: definir qué representa cada dato y qué condiciones hacen válido su estado. Un invariante es una condición que las operaciones públicas preservan. Evitar que otras partes del programa modifiquen directamente la representación y eludan sus controles. Distinguir dato ausente, texto vacío y cero cuando tengan significados diferentes.

Ejemplo: un intervalo cerrado de posiciones enteras cumple `0 <= start <= end`. La igualdad representa una posición válida, no un intervalo inválido.

```text
function makeInterval(start, end):
    if start < 0 or end < start: return InvalidInterval
    return immutable {start: start, end: end}
```

Comprobación esperada: `(2,5)` y `(3,3)` son válidos; `(4,3)` y `(-1,3)` se rechazan. Validar solo `start >= 0` deja entrar un intervalo invertido. En una implementación, revisar también que ninguna operación pública ni referencia compartida pueda romper el invariante después de construir el valor.

Respaldo y límites: [MIT, Abstraction Functions & Rep Invariants](traceability.es-419.md#src-mit-invariants) respalda invariantes y protección de la representación. `immutable` describe una propiedad requerida, no una palabra que la garantice en todo lenguaje. [Datos y tiempo](data-and-time.es-419.md) desarrolla unidades, límites, precisión, codificación y fechas con fuentes y casos propios. El intervalo por sí solo no verifica esos aspectos ni su adaptación a un dominio real.

## FUND-003 — Usar control de flujo claro

Aplicación propuesta: hacer visibles las condiciones, el progreso y las salidas. Para una operación que debe terminar, explicar qué permanece cierto y qué cantidad disminuye hasta la salida. Un servicio que debe permanecer activo requiere otro criterio: progreso del trabajo, límites y cierre controlado; no se exige que todo proceso termine espontáneamente.

Ejemplo: buscar la posición del primer valor negativo en una secuencia finita que no cambia durante el recorrido.

```text
function firstNegative(values):
    i = 0
    while i < length(values):
        if values[i] < 0: return Present(i)
        i = i + 1
    return Absent
```

Comprobación esperada: `[] → Absent`, `[3,0,-2] → Present(2)`, `[0] → Absent`. Antes de cada evaluación del ciclo, `0 <= i <= length(values)` y ningún elemento anterior a `i` es negativo. Si no retorna, `length(values)-i` disminuye. La variante que avanza solo sobre valores positivos se estanca en `[0]`; un límite de pasos permite detectarlo sin ejecutar un ciclo infinito.

Respaldo y límites: [Cornell, Loop Invariants](traceability.es-419.md#src-cornell-loops) respalda ese razonamiento. Se supone que cada acceso y comparación termina. [Fallos y recursos](failures-and-resources.es-419.md) desarrolla cancelación cooperativa, presupuestos y resultados desconocidos. El contador de pasos no es un tiempo límite de producción; las llamadas bloqueadas necesitan mecanismos y comprobaciones propios del entorno.

## FUND-004 — Diseñar funciones y módulos cohesivos

Aplicación propuesta: asignar a cada operación una responsabilidad explicable y un contrato coherente. Separar tareas cuando una necesidad real de cambio o una prueba muestre el beneficio; no dividir por un número arbitrario de líneas. Elegir nombres que expresen intención y declarar los efectos.

Ejemplo: sumar unidades no requiere generar etiquetas. Cada fila tiene `units` entero no negativo; `label` es opcional y no afecta la suma.

```text
function totalUnits(rows):
    total = 0
    for row in rows:
        total = total + row.units
    return total
```

Comprobación esperada: `[] → 0`; dos filas con unidades `3` y `2` producen `5`, aunque la primera no tenga etiqueta. Agregar, cambiar o quitar etiquetas conserva el total. Una operación combinada que exige etiqueta para sumar incumple este contrato. Los controles de filas externas y el formato de etiquetas se comprueban en sus propios límites.

Respaldo y límites: [MIT, Designing Specifications](traceability.es-419.md#src-mit-cohesion) respalda especificaciones coherentes, sin ofrecer una receta infalible. Esta separación es una decisión del ejemplo; varios resultados o efectos pueden pertenecer legítimamente a una misma operación. No demuestra una arquitectura ni una regla universal de tamaño de módulos.

## FUND-005 — Aislar reglas de negocio y efectos externos

Aplicación propuesta: distinguir cálculo de interacción con el exterior cuando permita entender y probar cada responsabilidad. Declarar qué operación calcula un resultado y cuál lo muestra, guarda o transmite. Una separación útil no necesita, por sí misma, clases, servicios remotos o múltiples capas.

Ejemplo: calcular unidades pendientes a partir de enteros no negativos; completar más de lo requerido deja cero pendientes. En este modelo, `output.write(value)` devuelve `Written` u `OutputError`; la presentación devuelve ese resultado sin ocultarlo.

```text
function remainingUnits(required, completed):
    return max(0, required - completed)

function displayRemaining(required, completed, output):
    return output.write(remainingUnits(required, completed))
```

Comprobación esperada: el cálculo devuelve `7` para `(10,3)` y `0` para `(3,10)` sin abrir una pantalla. Una escritura exitosa devuelve `Written`; una fallida devuelve `OutputError`, sin cambiar el resultado matemático ni informar éxito. Una variante que exige una salida disponible dentro del cálculo introduce un efecto no declarado; otra que descarta el error de escritura incumple el contrato de presentación.

Respaldo y límites: [MIT, Code Review](traceability.es-419.md#src-mit-effects) respalda devolver resultados separadamente de su impresión. Extender este criterio a red, almacenamiento y sistema operativo es una propuesta local que requiere valorar costos y contratos. El caso no prueba un adaptador real ni exige separar operaciones inseparables por su contrato transaccional.

## FUND-006 — Controlar estado, concurrencia y recursos

Aplicación propuesta: identificar quién posee el estado, quién puede modificarlo y cómo se coordina una transición completa. Considerar confinamiento o inmutabilidad cuando simplifiquen la corrección; no basta con esperar que dos operaciones «normalmente» no coincidan. Documentar además la adquisición y liberación de archivos, conexiones o suscripciones cuando existan.

Ejemplo: queda un solo cupo. Un propietario procesa cada solicitud completa en serie, sin suspenderla ni permitir otra solicitud dentro de `reserve`.

```text
remaining = 1
function reserve():
    if remaining == 0: return Rejected
    remaining = remaining - 1
    return Accepted
```

Comprobación esperada: los órdenes completos A→B y B→A producen una aceptación y un rechazo, con `remaining == 0`. Sin coordinación: A lee `1`, B lee `1`, A escribe `0` y acepta, B escribe `0` y acepta. Dos aceptaciones violan `acceptedCount + remaining == initialCapacity`.

Respaldo y límites: [MIT, Thread Safety](traceability.es-419.md#src-mit-concurrency) respalda confinamiento e inmutabilidad como estrategias. Serializar es una hipótesis del modelo, no una implementación concurrente instalada. [Fallos y recursos](failures-and-resources.es-419.md) amplía reentrada, reintentos, limpieza e idempotencia con supuestos explícitos. Sus modelos no prueban hilos reales, durabilidad, coordinación entre sistemas ni ausencia de bloqueos de interfaz.

## FUND-007 — Tratar errores y seguridad como parte del diseño

Aplicación propuesta: prever entradas no confiables, accesos rechazados y fallos externos como parte del comportamiento. Separar el mensaje público del diagnóstico interno; proteger también los registros. No inventar algoritmos criptográficos. Relacionar cada control con una amenaza y revisar cómo se comprobará, sin suponer que una lista genérica demuestra seguridad.

Ejemplo documental: solo la persona propietaria puede leer un documento protegido. El almacenamiento puede fallar con un mensaje que contiene una ruta ficticia.

| Caso | Resultado esperado | Fallo que debe detectar |
| --- | --- | --- |
| Propietario autorizado; documento disponible | Contenido permitido después del control de acceso. | Devolver contenido antes de comprobar el permiso. |
| Otra persona solicita el mismo identificador | Rechazo sin contenido. | Omitir el permiso por conocer el identificador. |
| Propietario autorizado; falla el almacenamiento | Error público útil sin la ruta interna; diagnóstico controlado. | Mostrar directamente el error interno. |

Comprobación esperada: revisar el control real, no solo la visibilidad del botón. Si la existencia del documento es sensible, tampoco revelarla mediante mensajes diferentes. Un error no autoriza automáticamente un reintento; depende de los efectos de la operación.

Respaldo y límites: OWASP respalda [entradas](traceability.es-419.md#src-owasp-input), [autorización](traceability.es-419.md#src-owasp-auth), [errores](traceability.es-419.md#src-owasp-error), [criptografía establecida](traceability.es-419.md#src-owasp-crypto) y [análisis de amenazas](traceability.es-419.md#src-owasp-threats). La clasificación concreta de errores y este caso son decisiones locales; no hay almacenamiento, controles ni criptografía implementados o probados aquí.

## FUND-008 — Buscar simplicidad y reutilización comprobada

Aplicación propuesta: evitar complejidad para necesidades meramente hipotéticas. Antes de compartir código, identificar si representa una misma política o solo operaciones de apariencia similar. Valorar comprensión y costo de cambio, no únicamente líneas eliminadas.

Ejemplo: préstamos de libros y reservas de salas tienen límites independientes; los conteos y límites son enteros no negativos.

```text
function canBorrowBook(active, loans, bookLimit):
    return active and loans < bookLimit

function canReserveRoom(active, reservations, roomLimit):
    return active and reservations < roomLimit
```

Comprobación esperada: para una persona activa, `loans=2`, `bookLimit=3`, `reservations=0` y `roomLimit=1` permiten ambas acciones. Cambiar solo `bookLimit` a `2` rechaza el préstamo, pero conserva la reserva. Una abstracción que convierte ambos límites en una política global incumple esa independencia. Compartir una comparación puede ser correcto si conserva ambos contratos; mantener funciones separadas también puede serlo.

Respaldo y límites: [Google, revisión de complejidad](traceability.es-419.md#src-google-review) orienta a evitar generalizaciones especulativas. Es una guía contextual, no una norma universal. La independencia de políticas del ejemplo es local; composición, herencia o duplicación no se eligen automáticamente con esta cita.

## FUND-009 — Verificar comportamientos observables

Aplicación propuesta: elegir pruebas por contrato y riesgo. Combinar reglas aisladas, límites de integración y recorridos completos cuando aporten evidencia distinta. Controlar reloj, aleatoriedad o dependencias cuando introduzcan variación no deseada; conservar pruebas con dependencias reales cuando el comportamiento de esa integración sea lo que se necesita comprobar. Registrar ejecuciones y omisiones por separado.

Ejemplo: una operación permanece abierta solo antes del cierre. `now` y `closesAt` son enteros no negativos en la misma escala temporal; el extremo de cierre es exclusivo.

```text
function isOpen(now, closesAt):
    return now < closesAt
```

Comprobación esperada: `(8,10) → true`, `(10,10) → false`, `(11,10) → false`, repetibles con los mismos valores. La variante incorrecta `<=` pasa los casos de `8` y `11`, pero falla en `10`. Ejecutar toda la expresión sin comprobar la frontera puede ocultar el defecto; cobertura de líneas no equivale a corrección del resultado.

Respaldo y límites: [MIT, Testing](traceability.es-419.md#src-mit-testing) respalda particiones, fronteras y alcances; [Software Engineering at Google](traceability.es-419.md#src-google-testing), control del no determinismo y límites de cobertura. No se adoptan sus porcentajes ni infraestructura. El ejemplo no prueba un reloj real, zonas horarias ni un sistema distribuido. El requisito de regresión de RULE-006 sigue siendo una política local pendiente de aprobación.

## FUND-010 — Evaluar complejidad y medir rendimiento

Aplicación propuesta: distinguir el crecimiento del trabajo de una medición de tiempo real. Identificar tamaño de entrada, operaciones contadas y supuestos. Una optimización solo aporta evidencia útil si conserva el contrato y se evalúa en condiciones pertinentes al proyecto.

Ejemplo: producir totales acumulados. `[3,-1,4] → [3,2,6]`; una entrada vacía produce una salida vacía. El diseño A vuelve a sumar desde el inicio para cada posición; el diseño B agrega cada valor una vez a un acumulador y guarda cada total. Ambos cuentan una suma por valor visitado, incluido el primero.

Con sumas de costo constante y `n` valores, A realiza `n(n+1)/2` sumas y B realiza `n`: para `n=3`, son `6` y `3`. Ambos almacenan `n` resultados; el acumulador no elimina ese costo. Son conteos analíticos, no tiempos medidos ni una promesa de acelerar un producto en determinada proporción.

Comprobación esperada: comparar primero resultados con vacío, ceros y negativos. Para medir, declarar implementación, entorno, tamaños, datos y si se incluye la preparación; repetir en condiciones equivalentes y registrar variación y memoria. Si la supuesta mejora cambia resultados o las mediciones son inconsistentes, no presentarla como demostrada.

Respaldo y límites: [MIT, Introduction to Algorithms](traceability.es-419.md#src-mit-algorithms) respalda análisis por tamaño y modelo de cómputo. El protocolo de medición es local. Se comprobaron resultados y conteos de sumas en el [registro del núcleo](core-verification.es-419.md), no el experimento de tiempo y memoria. Límites numéricos, costos reales y metas deben definirse para el proyecto consumidor.

## FUND-011 — Diseñar para las personas y su contexto

Aplicación propuesta: declarar las tareas de las personas, sus contextos y los objetivos de accesibilidad pertinentes a la interfaz. En contenido web, considerar teclado, foco visible, etiquetas y errores identificables. Planear localización sin suponer que cada idioma corresponde a un único formato regional. Los idiomas de estos documentos no determinan los del producto.

Ejemplo documental: un campo para elegir fecha de entrega. El diseño indica su propósito y formato, cómo llegar por teclado, reconocer el foco, modificar el valor y confirmar.

Comprobación esperada: ante `31/02/2026`, identificar el campo y explicar el problema con texto, no solo color. No interpretar silenciosamente `04/03/2026` sin contexto regional o formato declarado. Para representar el 3 de abril del ejemplo, «3 de abril de 2026» y «April 3, 2026» deben referirse a la misma fecha; esto no fija una convención numérica única para Latinoamérica. Una traducción ensamblada con fragmentos rígidos debe revisarse si impide una frase natural.

Respaldo y límites: [W3C, WCAG 2.2](traceability.es-419.md#src-w3c-wcag22), criterios 2.1.1, 2.4.7, 3.3.1 y 3.3.2; [W3C, Internationalization Quick Tips](traceability.es-419.md#src-w3c-i18n), formatos y texto traducible. Son referencias web parciales. Sin interfaz ejecutable no se han probado teclado, lectura asistida ni presentación. No se acredita conformidad WCAG completa, accesibilidad nativa ni cumplimiento legal; requieren su propia evaluación.

## FUND-012 — Mantener dependencias y conocimiento

Aplicación propuesta: tratar cada dependencia como una decisión mantenida, no como una instalación que termina el trabajo. Registrar identidad, procedencia, versión, motivo de selección, revisiones pertinentes y responsable. Mantener explicaciones de decisiones e instrucciones de uso cuando cambien.

Ejemplo documental, sin paquete instalado:

```text
candidate:
    identity: identified
    artifactVersion: identified
    provenanceEvidence: linked
    licenseReview: pending
    behaviorChecks: pending
decision: pending
```

Comprobación esperada: con la información y revisiones requeridas completas, el candidato queda listo para una decisión responsable, no aprobado automáticamente. Si falta procedencia o hay revisiones pendientes, conservar `pending`, aunque una demostración funcione. Pedir a otra persona que encuentre versión, motivo, verificaciones y pendientes; registrar dudas reales. Esa revisión de transferencia de conocimiento está prevista, no realizada.

Respaldo y límites: [NIST SSDF, PW.4.1/PW.4.4](traceability.es-419.md#src-nist-ssdf) respalda evaluar y mantener componentes; [Google, comentarios y documentación](traceability.es-419.md#src-google-review), explicaciones e instrucciones útiles. Las fuentes no aprueban un paquete concreto ni determinan obligaciones de una licencia, costos aceptables o frecuencia universal de actualización. Esta base tampoco adopta la preferencia de Google por comentarios solo en inglés.

## Preguntas para revisar una solución

- ¿El comportamiento y los estados inválidos están claros?
- ¿Se puede entender y probar la lógica sin detalles innecesarios?
- ¿Qué sucede con datos inválidos, permisos insuficientes, interrupciones o fallos externos?
- ¿Se protegen los datos y se liberan los recursos?
- ¿La complejidad responde a una necesidad real y comprobable?
- ¿Otra persona puede preparar el proyecto y verificar el cambio con la documentación disponible?
