# Reglas inmutables

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](immutable-rules.en-US.md) · [Inicio](../README.es-419.md)

## Carácter propuesto y fuerza prevista

Estas reglas son propuestas para revisión; no constituyen obligaciones ya aprobadas ni un estándar universal de programación. «Debe», «no debe» y «obligación» expresan la fuerza prevista únicamente después de su aprobación e inclusión en una futura publicación estable adoptada por un proyecto consumidor. Cada regla tiene un identificador estable, una condición de aplicación y evidencia mínima prevista de cumplimiento. La evidencia puede ser breve y debe ser proporcional al riesgo; no requiere una herramienta o un proveedor específico. Especificar evidencia no demuestra que ya se haya obtenido.

El respaldo, sus límites y las decisiones pendientes de cada regla se registran en la [trazabilidad](traceability.es-419.md). La aprobación, la identidad de las publicaciones y los cambios se rigen por la [gobernanza de la base](foundation-governance.es-419.md). El nombre «inmutables» describe el compromiso previsto con el contenido de una publicación estable identificable; no vuelve incuestionable este borrador.

Para una futura adopción estable, se propone no admitir excepciones informales: una condición «no aplica» requiere justificación dentro del alcance aprobado de la regla, no una dispensa silenciosa. Las reglas de seguridad también abarcarían prototipos y ejemplos que puedan ejecutarse o compartirse.

## RULE-001 — Alcance y resultado explícitos

**Obligación:** Antes de implementar un cambio, se debe definir el problema, el resultado esperado, los criterios de aceptación y los límites del trabajo. No se debe presentar una suposición como requisito confirmado ni ampliar el alcance material sin autorización de la persona responsable del proyecto.

**Aplicación:** Todo cambio. Una corrección pequeña puede describirse en unas pocas líneas.

**Evidencia:** Descripción del cambio, criterios comprobables y registro de las suposiciones o decisiones pendientes.

## RULE-002 — Contratos y validación en los límites

**Obligación:** Las entradas, salidas y errores de los límites entre módulos o sistemas deben tener contratos explícitos, mediante tipos, interfaces, esquemas o documentación. Se deben validar los datos no confiables al ingresar a un límite de confianza; la validación visual no reemplaza la validación en la capa que protege la operación o los datos.

**Aplicación:** Código con entradas, salidas o comunicación entre componentes. Incluye archivos, red, almacenamiento, vínculos externos y mensajes del sistema operativo.

**Evidencia:** Contratos identificables y verificaciones de entradas válidas, inválidas y límites relevantes.

## RULE-003 — Secretos, permisos y datos sensibles

**Obligación:** No se deben incorporar secretos reales al código, la documentación, los ejemplos, los archivos versionados ni los registros. Deben utilizarse mecanismos de configuración segura y el mínimo de permisos necesario. Cada operación protegida debe comprobar autorización en una capa de confianza; ocultar una opción en la interfaz no es control de acceso. No se deben exponer datos sensibles innecesarios en errores o registros. Las aplicaciones cliente no deben distribuir secretos compartidos de servicios; esos secretos deben permanecer en un entorno de confianza.

**Aplicación:** Todo proyecto. Las verificaciones de autorización aplican cuando existen operaciones protegidas; se debe registrar explícitamente si no existen.

**Evidencia:** Revisión de secretos y permisos, ejemplos con valores ficticios, revisión de registros y pruebas de acceso permitido y rechazado cuando corresponda.

## RULE-004 — Protección de datos y acciones destructivas

**Obligación:** Antes de una operación que pueda eliminar o transformar datos de forma irreversible, se deben confirmar el objetivo exacto, el alcance y la autorización. La autorización puede provenir de una política preaprobada y verificable que cubra la operación y sus límites; no exige un diálogo humano nuevo en cada eliminación. Cuando existan datos que deban conservarse, se debe preparar y verificar una vía de recuperación adecuada. No se deben sobrescribir cambios ajenos ni ejecutar una operación destructiva con alcance ambiguo.

**Aplicación:** Eliminaciones, migraciones, restablecimientos, sobrescrituras y otras acciones con riesgo de pérdida, tanto durante el desarrollo como en el producto.

**Evidencia:** Alcance aprobado y, cuando corresponda, respaldo y verificación de restauración, migración reversible u otra estrategia de recuperación comprobada. Para datos temporales o eliminaciones definitivas requeridas, se documentan su carácter descartable o la eliminación autorizada y sus límites.

## RULE-005 — Errores visibles y estado consistente

**Obligación:** Un fallo relevante no debe ocultarse ni informarse como éxito. Se deben manejar o propagar los errores de manera explícita, conservar un estado consistente y liberar los recursos utilizados. Los reintentos no deben introducir efectos duplicados no controlados.

**Aplicación:** Operaciones que puedan fallar o afectar recursos, estado o sistemas externos.

**Evidencia:** Verificaciones de fallos representativos, limpieza de recursos y comportamiento de recuperación o reintento cuando corresponda. Los errores esperados pueden tratarse sin mensajes al usuario si el resultado continúa siendo correcto y el tratamiento está definido.

## RULE-006 — Verificación y reporte honestos

**Obligación:** Todo cambio debe verificarse frente a sus criterios de aceptación y los comportamientos afectados. El código ejecutable debe incluir pruebas automatizadas proporcionales al riesgo. Una corrección de un defecto reproducible debe agregar o actualizar una prueba de regresión. No se deben desactivar verificaciones válidas para ocultar fallos ni afirmar que una prueba pasó cuando no se ejecutó.

**Aplicación:** Todo cambio. En documentación, la verificación cubre contenido, enlaces y equivalencia de idiomas. Si una verificación necesaria no puede ejecutarse, el trabajo no se declara terminado: se informa qué falta, por qué y su impacto.

**Evidencia:** Comprobaciones ejecutadas con resultados, pruebas de regresión cuando correspondan y limitaciones explícitas. Las verificaciones manuales complementan las automáticas cuando la plataforma o la interacción lo requieren.

**Decisión local definida:** La automatización y la regresión son requisitos internos, no mandatos universales atribuidos a NIST. Se aplican también a herramientas de mantenimiento y ejemplos ejecutables: casos deterministas automatizados para contratos y defectos reproducibles, complementados con revisión manual para interacciones o significado. La proporcionalidad ajusta profundidad y casos, no elimina el requisito donde hay código. En cambios exclusivamente documentales se comprueban contenido, enlaces y paridad, sin exigir compilar una aplicación inexistente. Una comprobación necesaria bloqueada se informa como pendiente; no es una excepción implícita. Esta política está delimitada y evaluada, pero requiere aprobación de la entrega.

## RULE-007 — Preparación verificable y control de dependencias

**Obligación:** Se deben documentar los requisitos y los pasos necesarios para preparar, ejecutar y verificar el proyecto desde un entorno limpio. Cuando se utilicen dependencias, sus versiones deben controlarse mediante los mecanismos del ecosistema, incluidos archivos de bloqueo cuando estén disponibles, y se debe verificar la instalación en el entorno declarado. Los accesos y permisos necesarios, incluida la obtención y configuración de credenciales, deben documentarse sin revelar secretos. Cada persona debe utilizar sus propias credenciales autorizadas cuando corresponda. No se debe depender de rutas locales no documentadas ni configuraciones implícitas.

**Aplicación:** Todo proyecto; las instrucciones de ejecución y dependencias aplican cuando existen código ejecutable o herramientas. Un proyecto solo documental debe declarar esa condición.

**Evidencia:** Instrucciones comprobadas, versiones requeridas, configuración de ejemplo sin secretos y manifiestos o archivos de bloqueo aplicables.

**Límite:** Un archivo de bloqueo no demuestra por sí solo que la instalación funcione ni que una compilación produzca binarios idénticos. La reproducibilidad binaria, si se exige en un proyecto consumidor, necesita alcance, controles y evidencia propios, separados de la preparación y la instalación verificables.

**Decisión local definida:** Identificar procedencia, versión y licencia de cada dependencia; usar el mecanismo de bloqueo del ecosistema si existe y registrar la identidad exacta o restricciones resueltas si no existe. Verificar la preparación en el entorno declarado, sin atribuir al archivo de bloqueo una instalación que no se ejecutó. Registrar herramientas preinstaladas, accesos necesarios y pasos no comprobados. No elegir aquí las dependencias de futuros consumidores. El mantenimiento de esta base declara y comprueba su propio entorno por separado.

## RULE-008 — Compatibilidad y cambios de contrato

**Obligación:** Se deben respetar los contratos y las plataformas declarados como compatibles. Un cambio que rompa compatibilidad debe identificarse, aprobarse y acompañarse de una estrategia de transición antes de entregarse. No se debe afirmar compatibilidad con una plataforma o versión que no se haya verificado.

**Aplicación:** Interfaces entre componentes, formatos persistidos, integraciones y versiones de plataforma declaradas. Un proyecto nuevo debe definir su alcance de compatibilidad antes de su primera entrega ejecutable.

**Evidencia:** Matriz de compatibilidad, verificaciones pertinentes y, cuando corresponda, nota de cambio y plan de migración.

**Decisión local definida:** Distinguir objetivos previstos, comprobados y fuera de soporte, con versión y entorno. Antes de entregar una ruptura, identificar consumidores afectados, aprobarla y comprobar la transición aplicable (migración, coexistencia o retiro comunicado). Una biblioteca multiplataforma no acredita sus adaptadores ni sistemas operativos; una instalación local no acredita todas las versiones. Una primera entrega sin contratos previos declara ese límite, no inventa una migración.

## RULE-009 — Trazabilidad y revisión del cambio

**Obligación:** Antes de entregar, se debe revisar el cambio completo, explicar su propósito e impacto y actualizar la documentación afectada. Las modificaciones ajenas al alcance deben separarse o autorizarse expresamente. Las decisiones que condicionen el mantenimiento futuro deben conservar su motivo y consecuencias.

**Aplicación:** Todo cambio. La revisión puede ser propia o de otra persona según el riesgo; la base no exige un equipo mínimo.

**Evidencia:** Resumen de cambios, revisión registrada y decisiones relevantes documentadas. Si se utiliza control de versiones, cada entrega debe poder vincularse con los cambios revisados.

## RULE-010 — Paridad documental entre idiomas

**Obligación:** Cada documento Markdown mantenido por el proyecto debe existir en archivos separados para `es-419` y `en-US`, con el mismo alcance, obligaciones, identificadores, versión y estado. Toda modificación debe actualizar ambas versiones en la misma entrega. No se debe resolver una contradicción eligiendo silenciosamente un idioma como superior.

**Aplicación:** Documentación y plantillas mantenidas por el proyecto. Los archivos originales de terceros que deban preservarse íntegros, como licencias, se conservan sin alteraciones y se identifican como material externo; no sustituyen documentación propia.

**Evidencia:** Pares de archivos completos, enlaces funcionales y revisión de equivalencia semántica. Comparar nombres o encabezados no basta para demostrar una traducción correcta.

## Justificación de las obligaciones propuestas

Estas razones son decisiones locales de diseño, no mandatos atribuidos a una fuente externa. Explican el riesgo que se busca reducir; no reemplazan la obligación ni amplían su alcance. Los [escenarios documentales](core-verification.es-419.md) contrastan interpretaciones concretas. La aprobación de las políticas, incluida la de pruebas automatizadas, sigue pendiente.

| Regla | Razón de la política | Límite que debe conservarse |
| --- | --- | --- |
| RULE-001 | Evitar implementar una expectativa equivocada o ampliar el trabajo sin autorización. | Un cambio pequeño admite un registro pequeño; no exige burocracia uniforme. |
| RULE-002 | Evitar supuestos incompatibles y entradas no confiables que eludan controles. | El contrato puede ser un tipo o documentación breve; no exige una herramienta formal. |
| RULE-003 | Reducir exposición de secretos y acceso indebido. | Autorizar operaciones donde existan; no inventar un sistema de cuentas si no se necesita. |
| RULE-004 | Evitar pérdida no autorizada y recuperación solo supuesta. | Distinguir datos a preservar de datos descartables o eliminación definitiva requerida. |
| RULE-005 | Evitar éxito ficticio, fugas y efectos repetidos no controlados. | Manejar un error esperado no exige siempre mostrar un mensaje; sí respetar el resultado. |
| RULE-006 | Detectar defectos repetibles y conservar evidencia honesta del cambio. | La profundidad depende del riesgo; en documentación se comprueban contenido y paridad, no aplicaciones inexistentes. |
| RULE-007 | Evitar que preparar el proyecto dependa de conocimiento oculto de una persona. | Controlar versiones no garantiza instalación exitosa ni binarios idénticos. |
| RULE-008 | Evitar que consumidores dependan de promesas de compatibilidad no comprobadas. | Solo cubre contratos y plataformas declarados; no obliga a soportarlos todos. |
| RULE-009 | Poder comprender cambios, motivos y consecuencias de mantenimiento. | Revisión propia o compartida según riesgo; no impone tamaño de equipo ni Git. |
| RULE-010 | Evitar que el idioma altere obligaciones o deje instrucciones desactualizadas. | Se aplica a documentación mantenida; originales externos que deban preservarse no se reescriben. |

Las condiciones de las diez reglas y sus casos aplicables y no aplicables quedan evaluados en [aplicabilidad](applicability.es-419.md). Las elecciones concretas de cada futuro consumidor pertenecen a su proyecto y no son pendientes técnicos de esta entrega documental. Lo pendiente aquí es aprobar el alcance y las obligaciones del paquete exacto.
