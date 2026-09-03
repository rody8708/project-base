# Aplicabilidad y decisiones del alcance inicial

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](applicability.en-US.md) · [Inicio](../README.es-419.md) · [Gobernanza](foundation-governance.es-419.md) · [Trazabilidad](traceability.es-419.md)

## Alcance de esta evaluación

La primera entrega propuesta es una base documental común: fundamentos y ampliaciones, políticas de calidad, un flujo orientativo, una plantilla y evidencia acotada sobre esos documentos. Incluye cuatro listas orientativas: web; escritorio, incluido macOS; móvil; y código compartido entre plataformas. No constituye un estándar exhaustivo de programación, un conjunto de tecnologías elegido, una aplicación inicial ni soporte técnico certificado para esas plataformas. Los proyectos consumidores se crean aparte.

Esta evaluación resuelve la aplicabilidad documental de los 39 elementos existentes mediante un caso normal y un caso límite o de no aplicabilidad por elemento. Examina si el texto y las decisiones locales permiten distinguir una interpretación adecuada de una incorrecta. No ejecuta los casos hipotéticos en productos ni acredita todas las propiedades mencionadas. Las fuentes conservan el alcance parcial registrado en la trazabilidad; esta matriz no agrega respaldo externo.

Se revisaron los pares de [reglas](immutable-rules.es-419.md), [fundamentos](programming-fundamentals.es-419.md), [flujo](development-workflow.es-419.md), [perfiles](platform-guidelines.es-419.md) y [plantilla](../templates/project-brief.es-419.md). El texto de entrada fue la revisión 0.1.0-draft.3; las decisiones de alcance aquí registradas forman parte de la propuesta 0.1.0-draft.4. Su interpretación no constituye aprobación del usuario.

## Decisiones locales resueltas para esta propuesta

### Automatización y regresión

Para RULE-006 se mantiene la exigencia de pruebas automatizadas donde se incorpora o modifica código ejecutable, incluidos ejemplos ejecutables, con contratos, entorno y alcance identificados. La proporcionalidad ajusta los casos, niveles y profundidad al riesgo; no autoriza eliminar indiscriminadamente la automatización por tratarse de un prototipo, un proyecto pequeño o una prueba difícil. Una corrección de un defecto reproducible en ese código agrega o actualiza una prueba de regresión que distingue el defecto de la corrección. Las comprobaciones manuales complementan las automáticas cuando son necesarias para el comportamiento real.

Un cambio puramente documental se comprueba por contenido, enlaces y equivalencia entre idiomas; no obliga a compilar una aplicación inexistente. Si el documento incluye código ejecutable afectado, también se verifica ese código en su alcance declarado. Un modelo aislado no acredita una integración o dispositivo real. Si una comprobación necesaria no puede ejecutarse, se conserva como pendiente y no se declara terminado el alcance que depende de ella. La decisión reduce regresiones repetibles y reportes no verificables; es política local, no un mandato universal de una fuente externa. Su aprobación sigue siendo una decisión separada.

### Preparación y dependencias

Para RULE-007 se adopta como política local documentar herramientas y versiones necesarias, pasos de preparación, accesos autorizados y configuración explícita. Cuando haya dependencias se registran identidad, procedencia y versiones declaradas y resueltas, usando los mecanismos del ecosistema, incluido un archivo de bloqueo cuando esté disponible. Si el ecosistema no dispone de ese archivo, se documenta el mecanismo equivalente de control y resolución; no se inventa un formato obligatorio.

La preparación se comprueba desde un entorno limpio declarado: sin instalaciones o configuraciones del proyecto no documentadas, aunque puede partir de herramientas previas que estén expresamente enumeradas. El registro identifica entorno, pasos, resultado y limitaciones. Un archivo de bloqueo, una lista de comandos o una demostración previa no sustituyen esa ejecución. No se exige revelar credenciales ni probar accesos sin autorización. Si no hay dependencias o instalación, se declara esa condición y se verifican las instrucciones que sí existen. La razón es eliminar requisitos ocultos y permitir diagnosticar diferencias de preparación; no se promete reproducibilidad binaria.

### Compatibilidad y transición

Para RULE-008 se adopta como política local separar contratos y plataformas previstos, verificados y fuera de soporte. La declaración identifica las versiones o condiciones pertinentes y la evidencia que la sustenta; un proyecto nuevo define ese alcance antes de su primera entrega ejecutable. No necesita comprometerse con todas las plataformas de las listas.

Una modificación incompatible identifica el contrato afectado, consumidores o datos alcanzados y efectos de la ruptura; requiere autorización y una transición documentada antes de entregarse. Esa transición puede incluir migración, convivencia temporal de versiones o retiro explícito de soporte según el contrato y la autorización, sin imponer un mecanismo único ni conservación perpetua de compatibilidad. Las comprobaciones necesarias de transición deben tener resultados registrados; un plan por sí solo no demuestra que funcionen. Una corrección sin cambio de contrato no necesita una migración ficticia. La política busca evitar que una promesa no comprobada o una ruptura silenciosa llegue al consumidor.

### Flujo y plantilla proporcionales

Las siguientes elecciones quedan justificadas como diseño local orientativo, no como un ciclo universal ni respaldo técnico nativo:

- FLOW-001 registra resultado y límites antes del trabajo que depende de ellos para reducir decisiones basadas en suposiciones. FLOW-002 anticipa fallos, pérdida e incompatibilidades antes de operaciones costosas o irreversibles, sin exigir arquitectura adicional cuando no aporta valor.
- FLOW-003 conserva incrementos revisables, pruebas asociadas y pares de idiomas para poder atribuir resultados y detectar omisiones. No fija un máximo de archivos ni prohíbe un cambio atómico entre varios componentes. FLOW-005 contrasta el resultado completo con la aceptación para separar una entrega parcial de una terminada. La secuencia permite iterar; no exige fases aisladas ni un equipo mínimo.
- BRIEF-001 identifica propósito, ubicación separada y publicación exacta para evitar una adopción ambigua. BRIEF-002 convierte límites y expectativas en aceptación observable. BRIEF-004 hace visibles herramientas, contratos y motivos, sin elegirlos por el consumidor.
- BRIEF-006 enlaza objetivos con métodos y evidencia para impedir que una casilla marcada sustituya una comprobación. BRIEF-007 registra preparación y operación reales para reducir conocimiento oculto. BRIEF-008 identifica quién decide y qué falta antes de una etapa dependiente, sin equiparar campos completos con aprobación.
- PLAT-004 propone compartir código solo ante un beneficio identificable y conservar evidencia por adaptador; así no se extrapola una prueba común a varias plataformas. Mantener implementaciones separadas es una opción válida cuando compartir introduce más costo o acoplamiento.

## Método y significado del resultado

Fecha: 2026-09-02. Revisor: asistente de desarrollo. Método: lectura de las condiciones y evidencias propuestas, comparación de cada par de casos con ellas y revisión de equivalencia del registro bilingüe. Los ejemplos son hipotéticos y no contienen elecciones de un consumidor real.

La columna de resultado registra la decisión documental obtenida al aplicar el criterio. No es una prueba funcional, aprobación humana, auditoría independiente ni asignación automática de los estados de gobernanza. «No aplica» significa que la condición del elemento está ausente en el caso concreto, no una dispensa de una obligación aplicable. Cuando un elemento siempre aplica, su segundo caso muestra proporcionalidad o un límite en vez de una exención.

## Matriz de las reglas

| ID | Aplicabilidad | Caso normal | Caso límite o no aplica | Criterio de revisión | Resultado documental evaluado |
| --- | --- | --- | --- | --- | --- |
| RULE-001 | Todo cambio. | Corregir un enlace con destino esperado definido. | Añadir cuentas de usuario a esa corrección sin autorización. | Distinguir aceptación, suposición y ampliación material. | La corrección cabe en un registro breve; las cuentas quedan fuera del alcance autorizado. |
| RULE-002 | Límites de código o sistemas. | Importar cantidades con rango y errores definidos. | Texto explicativo sin importador; o interfaz que valida pero servicio que no lo hace. | Exigir contrato y validación donde existe el límite de confianza. | No se inventa un importador; la validación visual sola no satisface el caso con servicio. |
| RULE-003 | Todo proyecto; autorización si hay operaciones protegidas. | Ejemplo usa valores ficticios y lectura protegida con control de permiso. | Documento público sin cuentas. | No incluir secretos; no crear permisos ficticios ni omitir controles existentes. | Sigue aplicando la revisión de secretos; las pruebas de autorización no aplican al documento sin operación protegida. |
| RULE-004 | Operaciones con riesgo de pérdida. | Migración de registros a conservar, con recuperación verificada. | Caché descartable bajo política verificable de eliminación acotada. | Separar autorización, objetivo exacto y conservación de eliminación requerida. | Se exige recuperación para conservar; no restauración ficticia de caché, ni permiso para borrar otros datos. |
| RULE-005 | Fallos, recursos o efectos posibles. | Fallo de escritura se propaga sin éxito y se libera el recurso adquirido. | Error esperado manejado sin mensaje; cálculo sin recurso adquirido. | Respetar el contrato y no inventar limpieza o éxito. | Silencio definido puede ser correcto; ocultar un fallo relevante no lo es. |
| RULE-006 | Todo cambio; automatización cuando hay código. | Corregir una frontera reproducible y agregar regresión. | Cambio solo de texto; prueba necesaria que no puede ejecutarse. | Aplicar la decisión local de automatización y separar previsto de ejecutado. | El texto recibe revisión documental; la prueba impedida no pasa ni permite declarar terminado su alcance. |
| RULE-007 | Preparación; dependencias cuando existen. | Instrucciones enumeran herramientas, procedencia, versiones y ejecución limpia. | Ecosistema sin archivo de bloqueo; ejemplo sin dependencias externas. | Revisar control equivalente y evidencia de los pasos aplicables. | No se exige un archivo inexistente; tampoco se infiere instalación exitosa desde un manifiesto. |
| RULE-008 | Contratos y plataformas declarados. | Cambio de formato identifica ruptura y transición autorizada y comprobada. | Plataforma solo prevista; corrección que conserva el contrato. | Separar intención de soporte y exigir transición solo ante ruptura. | No se etiqueta prevista como verificada; no se inventa migración para una corrección compatible. |
| RULE-009 | Toda entrega. | Resumen y revisión cubren todos los archivos modificados. | Cambio pequeño revisado por su autor. | Relacionar contenido, motivo y alcance; no exigir otro integrante por defecto. | La autorrevisión registrada es admisible; un archivo ajeno sin autorización sigue siendo una desviación. |
| RULE-010 | Markdown mantenido por el proyecto. | Cambio de obligación actualizado en ambos idiomas. | Licencia original de tercero que debe preservarse. | Distinguir traducción propia de material externo intacto. | Se exige equivalencia del contenido propio; no se reescribe la licencia ni se la usa como sustituto. |

## Matriz de los fundamentos

| ID | Aplicabilidad | Caso normal | Caso límite o no aplica | Criterio de revisión | Resultado documental evaluado |
| --- | --- | --- | --- | --- | --- |
| FUND-001 | Definición del problema y contrato. | Nueve unidades con capacidad cuatro requieren tres paquetes. | Cero unidades; capacidad cero; usuario no confirmó la necesidad. | Especificar salidas y rechazos sin presentar suposiciones como requisitos. | Se distinguen cero paquetes, entrada inválida y necesidad no confirmada. |
| FUND-002 | Datos y estados representados. | Intervalo entero de dos a cinco. | Extremos iguales válidos; intervalo de cuatro a tres inválido. | Relacionar representación, invariantes y límites declarados. | La igualdad no se rechaza; la inversión sí. El caso no acredita inmutabilidad de un lenguaje. |
| FUND-003 | Control de flujo y progreso. | Buscar primer negativo en una secuencia finita. | Secuencia vacía; servicio intencionalmente continuo. | Diferenciar terminación de una operación de progreso y cierre de un servicio. | Vacío produce ausencia; no se exige terminar espontáneamente un servicio continuo. |
| FUND-004 | Responsabilidades y contratos. | Sumar unidades sin requerir etiquetas opcionales. | Operación legítima que necesita varios resultados relacionados. | Justificar separación con una necesidad real, no por tamaño fijo. | La etiqueta no bloquea la suma; varios resultados no implican por sí mismos falta de cohesión. |
| FUND-005 | Cálculo y efectos distinguibles. | Calcular pendientes sin salida; presentación propaga error de escritura. | Operación cuyo contrato exige un efecto transaccional conjunto. | Hacer explícitos los efectos sin imponer capas. | Separar cálculo aporta evidencia; el criterio no obliga a romper una transacción coherente. |
| FUND-006 | Estado compartido y recursos adquiridos. | Un propietario completa una reserva antes de la siguiente. | Función sin estado compartido; recurso nunca adquirido por fallo previo. | Declarar coordinación y limpieza realmente necesarias. | Se identifica la doble reserva sin coordinación; no se exige liberar un recurso inexistente. |
| FUND-007 | Entradas, permisos y fallos relevantes. | Propietario autorizado obtiene un documento después del control. | Otra persona conoce el identificador; almacenamiento falla con ruta interna. | No confundir conocimiento del identificador con permiso ni exponer diagnóstico sensible. | Se requiere rechazo y error público controlado; no se acredita un control implementado. |
| FUND-008 | Elección de complejidad y reutilización. | Límites independientes para libros y salas. | Compartir una comparación sin fusionar las políticas. | Conservar contratos y justificar el costo de una abstracción. | Cambiar el límite de libros no cambia salas; compartir código no se prohíbe si preserva esa independencia. |
| FUND-009 | Evidencia del comportamiento. | Comparar antes, en y después del cierre. | Reloj controlado para una unidad; integración cuyo reloj real es objeto de prueba. | Elegir casos y dependencias según lo que se intenta demostrar. | La frontera distingue menor de menor o igual; un reloj simulado no sustituye la integración que se quiere probar. |
| FUND-010 | Algoritmos, tamaño y rendimiento relevante. | Totales acumulados con resultados iguales y menos sumas. | Entrada vacía; mejora de tiempo afirmada sin medición. | Separar conteo analítico de tiempo y memoria medidos. | El vacío tiene salida vacía; menos sumas no demuestra una aceleración real de igual proporción. |
| FUND-011 | Personas, interfaz y contexto regional. | Fecha con etiqueta, formato y error comprensible. | No existe interfaz; fecha numérica ambigua sin región. | Exigir comprobaciones pertinentes sin inferir un formato único por idioma. | No se inventa prueba de teclado sin interfaz; la fecha ambigua requiere contexto. |
| FUND-012 | Dependencias y conocimiento mantenido. | Candidato con versión, procedencia, motivo y revisiones identificados. | Demostración funcional con licencia o procedencia pendiente; sin dependencia externa. | Separar candidato evaluable de adopción aprobada y registrar lo aplicable. | La demostración no elimina pendientes; sin paquete no se inventa instalación, pero se mantienen instrucciones. |

## Matriz del flujo

| ID | Aplicabilidad | Caso normal | Caso límite o no aplica | Criterio de revisión | Resultado documental evaluado |
| --- | --- | --- | --- | --- | --- |
| FLOW-001 | Preparar un cambio del consumidor. | Registro relaciona problema, aceptación y exclusiones. | Corrección pequeña; aún no existe publicación estable adoptable. | Mantener registro proporcional y no inventar identidad de adopción. | Bastan detalles pertinentes; planificar no equivale a adoptar este borrador como estable. |
| FLOW-002 | Decisiones previas a acciones con impacto. | Migración analiza autorización, conservación y transición. | Corrección de texto sin migración ni interfaz. | Revisar riesgos reales sin imponer arquitectura o controles inexistentes. | Se anticipa recuperación donde se necesita; se justifica lo que no aplica al texto. |
| FLOW-003 | Implementar cambios revisables. | Comportamiento, pruebas y documentación bilingüe cambian juntos. | Corrección coherente que afecta varios archivos inseparables. | Preservar trabajo ajeno y poder atribuir el resultado al incremento. | Varios archivos no invalidan el incremento; cambios ajenos o traducción omitida sí lo desvían. |
| FLOW-004 | Verificación del alcance consumidor. | Registro identifica cambio, entorno, método y resultado. | Comprobación necesaria no ejecutada; compilación no aplicable a texto. | Separar éxito, fallo, pendiente y no aplicabilidad. | Lo impedido queda pendiente; lo inaplicable se justifica sin etiquetarlo como prueba pasada. |
| FLOW-005 | Entrega del consumidor. | Evidencia satisface aceptación y se revisa el cambio completo. | Solo parte del alcance está comprobada. | Confrontar entrega con aceptación sin ocultar riesgos. | La parte comprobada puede informarse como parcial, no como cumplimiento completo. |

## Matriz de las listas de plataforma

| ID | Aplicabilidad | Caso normal | Caso límite o no aplica | Criterio de revisión | Resultado documental evaluado |
| --- | --- | --- | --- | --- | --- |
| PLAT-001 | Evaluación de un proyecto web. | Proyecto hipotético con interfaz y servicio identifica ambos límites. | Servicio sin interfaz visual. | Aplicar controles y recorridos a funciones que existen. | Navegación visual no aplica al servicio solo; contratos y seguridad del servicio sí requieren definición propia. |
| PLAT-002 | Evaluación de escritorio, incluido macOS. | Proyecto hipotético declara un sistema, versión y arquitectura. | Herramienta multiplataforma sin ensayos en otros sistemas. | No transformar capacidad de la herramienta en soporte del producto. | Los demás sistemas permanecen previstos o excluidos; no se presume firma, instalación o accesibilidad nativa. |
| PLAT-003 | Evaluación de un proyecto móvil. | Diseño contempla interrupción y conectividad variable. | Sin sincronización ni tareas diferidas. | Vincular cada criterio con una función o condición real. | No se inventa una cola sin conexión; permisos, ciclo de vida y pruebas se concretan solo en el consumidor. |
| PLAT-004 | Decisión de compartir entre plataformas. | Una regla común y adaptadores separados con evidencia por destino. | No hay beneficio real de compartir. | Comparar beneficio y costo; no extrapolar pruebas comunes. | Se permiten implementaciones separadas; probar la regla común no verifica los adaptadores. |

## Matriz de la plantilla

| ID | Aplicabilidad | Caso normal | Caso límite o no aplica | Criterio de revisión | Resultado documental evaluado |
| --- | --- | --- | --- | --- | --- |
| BRIEF-001 | Identidad de un consumidor separado. | Propósito, responsable y referencia exacta de una futura publicación aprobada. | Planificación antes de que exista esa publicación. | Conservar campos pendientes sin inventar aprobación o integridad. | Se puede preparar la definición; no declarar una adopción estable inexistente. |
| BRIEF-002 | Alcance y aceptación del consumidor. | Función incluida tiene entrada y resultado observables. | «Debe funcionar bien» sin criterio; idea fuera de alcance. | Distinguir aceptación verificable, exclusión y suposición. | La frase vaga no cierra aceptación; la idea queda excluida o pendiente de autorización. |
| BRIEF-003 | Plataformas e idiomas declarados. | Documentación en ambos idiomas; plataforma verificada con evidencia. | Plataforma prevista sin ensayo; producto sin interfaz. | Separar idiomas documentales de producto y soporte previsto de probado. | No se fuerza una interfaz bilingüe ni se eleva la plataforma prevista a verificada. |
| BRIEF-004 | Diseño y herramientas elegidos por el consumidor. | Alternativas, contratos, versiones y motivos registrados. | Aún no existe elección de lenguaje; no hay dependencia externa. | Mantener decisiones visibles y resolverlas antes de su etapa dependiente. | La plantilla no elige un conjunto de tecnologías ni obliga a instalar un paquete. |
| BRIEF-005 | Datos y riesgos del consumidor. | Clasificación vincula acceso, conservación y recuperación. | Datos descartables con eliminación acotada; ausencia de operación protegida. | Distinguir conservación, eliminación y autorización aplicable. | No se exige restaurar lo descartable ni inventar cuentas; tampoco se exime la protección de secretos. |
| BRIEF-006 | Objetivos y evidencia del consumidor. | Objetivo tiene método, entorno y resultado previsto separados de la ejecución. | Meta de rendimiento sin umbral cuando ese umbral es necesario; interfaz ausente. | Poder decidir cumplimiento y justificar cada no aplicabilidad. | La meta incompleta sigue sin criterio suficiente; accesibilidad de una interfaz inexistente no se marca como pasada. |
| BRIEF-007 | Preparación y operación reales. | Pasos y comandos corresponden al entregable y su entorno. | Documento sin instalación; comandos copiados de otra tecnología. | Verificar lo existente sin inventar operaciones o resultados. | El documento explica acceso y comprobación; los comandos ajenos no cuentan como instrucciones verificadas. |
| BRIEF-008 | Decisiones, pendientes y aprobación. | Pregunta tiene responsable, impacto y etapa de resolución. | Todos los campos llenos pero ninguna decisión de aprobación. | Separar completitud de campos, estado del consumidor y autoridad de aprobación. | La plantilla completa no aprueba al consumidor ni a la base; un pendiente material impide la etapa que depende de él. |

## Cierre de la evaluación documental

Se evaluaron 39 filas y 78 casos documentales, sin contar la traducción como otro conjunto independiente. En el alcance declarado, los criterios permiten distinguir las interpretaciones descritas; las decisiones de automatización, dependencias y compatibilidad quedan explícitas, no remitidas a una elección técnica indefinida. No se detectaron contradicciones materiales entre las decisiones de estos casos después de precisar su alcance.

Este resultado completa esta evaluación asistida de aplicabilidad. No afirma que todo el contenido esté probado en cualquier contexto, que las fuentes respalden cada cláusula, que una persona haya confirmado su comprensión o que exista aprobación estable. Los registros de modelos mantienen sus resultados propios; no se suman estos 78 casos como pruebas automatizadas.

Las pruebas de código consumidor, instalación, rendimiento, accesibilidad, sistemas operativos, recuperación física y distribución son obligaciones condicionales de los proyectos que incorporen esas implementaciones, no trabajo ficticiamente ejecutado ni una aplicación que deba construirse aquí. La conservación y aprobación de una publicación exacta se juzgan separadamente según la gobernanza.
