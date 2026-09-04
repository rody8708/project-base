# Gobernanza y validación de la base

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](foundation-governance.en-US.md) · [Inicio](../README.es-419.md) · [Respaldo y trazabilidad](traceability.es-419.md)

> **Registro histórico:** el cuerpo conserva el estado de la propuesta documental anterior a las publicaciones aprobadas. Para el estado y procedimiento vigentes, consulta [cómo crear una aplicación con esta base](getting-started.es-419.md).

## Propósito, alcance y origen

Este documento propone cómo revisar, validar, aprobar y conservar la base maestra. Es una propuesta local de organización: desarrolla la intención del usuario y los hallazgos de la auditoría, no declara conformidad con una norma externa. También debe revisarse y aprobarse antes de regir una publicación estable.

Aquí se mantienen los fundamentos, las propuestas de reglas, las plantillas y la evidencia sobre la propia base. Los proyectos que la utilicen se crearán fuera de ella. Un ejemplo o una prueba de la base no equivale a iniciar una aplicación consumidora. Esta revisión incluye código didáctico en Markdown para comprobar modelos acotados; no incorpora componentes de ejecución reutilizables para productos. Cualquier incorporación futura de esos componentes requiere un alcance y una validación definidos.

## Estado actual y corrección de la etiqueta anterior

- Revisión documental de trabajo: `0.1.0-draft.4`.
- Publicaciones estables aprobadas: ninguna.
- Contenido: núcleo documental, plantilla, perfiles orientativos, modelos didácticos y herramientas de mantenimiento conservadas en Markdown; alcance y evaluación de los 39 elementos en [aplicabilidad](applicability.es-419.md).
- Validación funcional de componentes de producto o plataformas: no realizada. La comprobación didáctica de modelos tiene su propio alcance y registro; no valida íntegramente los fundamentos.
- Mecanismo para conservar y verificar publicaciones: implementado en [herramientas de entrega](release-tools.es-419.md), mediante paquete ZIP, manifiesto e identidad SHA-256. Su evidencia y límites se registran en [preparación de entrega](release-readiness.es-419.md).
- La etiqueta previa `1.0.0` no correspondía a una publicación aprobada. Se reemplaza por una identificación de borrador, conservando los 39 identificadores de contenido. No se retira ni modifica una publicación estable previamente existente.

Revisar el borrador o autorizar su edición no significa aprobar todas sus obligaciones. Los requisitos explícitos del usuario conservan su origen; los detalles añadidos por esta base siguen sujetos a revisión.

## Origen de cada elemento

El [registro de trazabilidad](traceability.es-419.md) distingue requisitos del usuario, propuestas locales y principios contrastados con referencias. Una entrada puede combinar estos orígenes: una fuente puede respaldar el principio, mientras la exigencia exacta, sus límites y su método de comprobación sean decisiones propias.

Para cada elemento deben quedar identificados su origen, el alcance cubierto por la fuente, los límites o pendientes, la comprobación esperada y el estado real. Se registrará la edición o fecha de consulta de las referencias y el apartado utilizado. Una fuente general no respalda automáticamente toda una regla compuesta ni los ejemplos que aún no se han desarrollado.

## Estados y evidencia

Los identificadores de estado son compartidos entre idiomas; su significado no cambia con la traducción.

| Estado | Significado | Evidencia necesaria para asignarlo |
| --- | --- | --- |
| `proposed` | Propuesto para revisión. | Contenido identificable y pendientes declarados; sin presumir respaldo completo. |
| `document-reviewed` | Revisado documentalmente en el alcance indicado. | Origen contrastado, límites registrados y revisión de coherencia y traducción. No demuestra funcionamiento ni aprobación. |
| `validated-in-scope` | Validado únicamente para un alcance explícito. | Criterios acordados, comprobaciones ejecutadas, resultados y limitaciones registrados. En documentación se valida claridad y aplicabilidad mediante casos; en componentes, también su comportamiento real. |
| `approved` | Aprobado para una publicación identificada. | Validación del alcance y aprobación explícita del usuario o de una persona designada, vinculadas al contenido exacto. |

No se avanza de estado por antigüedad, número de fuentes o cantidad de documentos. Si cambia la obligación, su alcance o una dependencia relevante, se revisa qué evidencia sigue siendo válida; el contenido afectado no conserva automáticamente su validación. La publicación anterior permanece intacta.

En esta revisión, las 39 filas quedan `document-reviewed` dentro del alcance documental indicado, sin acreditar implementaciones. Los estados de las filas describen esa revisión asistida; la evaluación de casos se registra por separado. El paquete sigue siendo candidato hasta la aprobación explícita; ninguna fila debe leerse como certificación técnica integral.

## Condiciones propuestas para una publicación estable

Para declarar estable una publicación se debe poder demostrar lo siguiente respecto de su alcance:

1. El propósito y los límites están claros, incluida la separación entre la base y sus proyectos consumidores.
2. Cada elemento incluido tiene trazabilidad completa: fuente específica o decisión local justificada, alcance, límites y responsable de su revisión.
3. Las obligaciones propuestas se han evaluado frente a casos aplicables y no aplicables. Las tensiones, excepciones y decisiones materiales pendientes se han resuelto expresamente.
4. Los fundamentos incluidos tienen la profundidad necesaria para su uso declarado, con explicación, ejemplos y comprobaciones pertinentes. No se los presenta como un estándar exhaustivo de toda la programación.
5. Ambos idiomas son semánticamente equivalentes; los enlaces, los identificadores y los metadatos están verificados. La revisión de significado no se sustituye por comparar encabezados.
6. La evidencia distingue lo ejecutado de lo previsto. Si existen componentes técnicos, sus pruebas y condiciones de funcionamiento están registradas; si no existen, la publicación se limita expresamente a documentación.
7. El contenido de la entrega puede conservarse, obtenerse y verificarse mediante el mecanismo de publicación definido abajo.
8. La persona responsable aprueba explícitamente la identidad, el alcance y las obligaciones de esa entrega. Una autorización general para continuar trabajando no cumple esta condición.

Los pendientes de una parte que se excluya de la entrega deben identificarse como fuera de alcance; no se pueden ocultar marcándolos como aprobados. Esta lista no está cumplida por el hecho de haber sido redactada.

## Publicación identificable e inmutable

El registro separa revisión editorial, identidad de bytes y aprobación. El candidato contiene los archivos de ambos idiomas y un manifiesto técnico con rutas, tamaños y SHA-256; el manifiesto no se incluye en su propia lista de huellas. La identidad del ZIP completo se conserva fuera de él. Las instrucciones y ensayos están en [herramientas de entrega](release-tools.es-419.md).

El mecanismo elegido es un archivo local identificado, creado sin sobrescritura y marcado como solo lectura contra cambios accidentales. Se recupera en una carpeta nueva y se comprueban identidad, inventario y contenido antes de usarlo. No es almacenamiento inviolable ni una copia remota: una persona con permisos puede modificar o eliminar archivos. Conservar el paquete y su registro aprobado en una ubicación confiable sigue siendo responsabilidad del titular; la pérdida de ambas copias no es recuperable mediante un hash. No se ha contratado alojamiento ni configurado respaldo externo.

La verificación exige un SHA-256 esperado obtenido del registro confiable, no calculado del archivo recibido para darse permiso a sí mismo. El hash detecta alteraciones respecto de ese valor; no autentica al aprobador. La recuperación y los rechazos se ensayan localmente de forma automatizada. No se atribuye ese ensayo a otra persona ni se afirma una prueba independiente de distribución.

El contenido de una publicación aprobada no se reescribe. Una corrección, incluso editorial, origina otra publicación identificada, con explicación del cambio y su impacto. El historial anterior se conserva.

La revisión editorial usa `0.1.0-draft.N`. Tras aprobar el candidato exacto, un recibo externo podrá asignarle la publicación estable `1.0.0` sin reescribir sus bytes. Incluirá persona o función autorizada, fecha, revisión editorial, versión de publicación, SHA-256 completo, alcance, obligaciones aceptadas y referencia recuperable a la aprobación. No se presupone firma digital: una aprobación textual debe conservarse como tal. Los encabezados y estados internos describen el momento previo a la aprobación; el estado efectivo se obtiene del recibo confiable asociado a esa identidad, nunca del nombre del ZIP solo. Si se solicitan cambios, se genera otro candidato y se vuelve a comprobar; no se aprueba por anticipado.

Cambiar obligaciones de una publicación aprobada requiere otra versión principal; una ampliación compatible, una secundaria; una corrección sin cambio de obligaciones, una revisión. Esta convención es local. Las ediciones de fuentes y las formulaciones incorporadas quedan identificadas en el paquete; no se promete disponibilidad eterna ni congelación de todos los sitios externos. Una fuente inaccesible que solo aporta contexto no se utiliza como respaldo técnico.

## Adopción desde otro proyecto

Cuando exista una publicación estable, el proyecto consumidor se creará en una ubicación separada y registrará: ubicación propia, versión adoptada, identidad exacta de la publicación, método y resultado de la verificación de integridad, alcance aplicable, adaptaciones permitidas y responsable de la adopción.

Se podrá conservar una copia o una referencia recuperable al contenido inmutable. Una copia editada no podrá presentarse como la publicación original; deberá distinguir sus cambios locales. Las políticas adicionales del consumidor no eliminarán obligaciones aplicables de la publicación adoptada. Actualizar la base será una decisión explícita, acompañada de revisión de impacto y comprobaciones.

La [plantilla de proyecto](../templates/project-brief.es-419.md) solo prepara ese registro. Actualmente no existe una publicación estable que pueda indicarse como adoptada.

## Registro mínimo de revisión o validación

Cada registro deberá identificar: elemento y revisión examinados, alcance, criterio esperado, método o comando reproducible, entorno cuando corresponda, resultado observado, limitaciones, fecha y persona o función revisora. No debe contener secretos ni datos personales innecesarios.

Para repetir las comprobaciones documentales de esta revisión: inventariar todos los `.md`, comprobar una contraparte por idioma, comparar identificadores y metadatos, resolver cada enlace local y revisar semánticamente cada par. Las fuentes externas se contrastan con el apartado citado y sus límites; un enlace que responde no demuestra que respalde la afirmación.

Una futura comprobación de componentes deberá agregar sus resultados reales. No se crearán aplicaciones consumidoras aquí para aparentar que la base ya está probada. Los [controles documentales](document-checks.es-419.md), los modelos y las herramientas de entrega pueden ejecutarse localmente desde Markdown; no se ha instalado integración continua.

## Registro histórico de la revisión 0.1.0-draft.1

- Fecha: `2026-09-02`.
- Revisión examinada: `0.1.0-draft.1`; alcance documental de los 16 archivos Markdown, incluidos sus ocho pares de idioma.
- Revisor: asistente de desarrollo, con revisión cruzada asistida; no constituye una aprobación del usuario ni una auditoría profesional independiente.
- Método estructural: inventario de archivos, lectura estricta de UTF-8, comparación de metadatos e identificadores, correspondencia del registro con los documentos, y resolución de rutas y anclas de enlaces locales.
- Resultado estructural: satisfactorio; 39 elementos originales conservados, 39 entradas de trazabilidad por idioma, 126 enlaces locales o anclas resueltos y metadatos de borrador consistentes. Cada registro incluye cuatro requisitos de origen del usuario y siete referencias catalogadas.
- Método de contenido: lectura de los pares, contraste de obligaciones, condiciones y traducciones; revisión de la separación entre respaldo parcial, evidencia prevista y resultados reales. Se corrigieron la condición circular de aprobación, la recuperación incondicional en el flujo y el desajuste de preparación verificable en el registro.
- Resultado de contenido: no se encontraron diferencias semánticas materiales pendientes en esta revisión asistida. La distribución de estados coincide entre idiomas: 27 elementos `proposed` y 12 `document-reviewed`; ninguno tiene validación funcional ni aprobación estable.
- Límite de las fuentes: el registro conserva los apartados efectivamente contrastados y el acceso parcial a SWEBOK. No se demuestra exhaustividad de fundamentos ni permanencia o integridad futura de páginas externas. Resolver enlaces locales no valida citas externas.
- No ejecutado: pruebas de componentes, ensayos de plataformas, publicación de un paquete estable y comprobación de su recuperación e integridad. No existen componentes ni una publicación estable en esta ronda.
- Decisión de aprobación: pendiente. Estos resultados cierran las comprobaciones de esta corrección documental, no las condiciones para consolidar y publicar toda la base.

## Registro histórico de la revisión 0.1.0-draft.2

- Fecha: `2026-09-02`; revisión de 18 archivos Markdown, en nueve pares de idioma. Se conserva arriba el registro histórico de la revisión anterior.
- Cambio: desarrollo de los doce fundamentos, incorporación de catorce referencias específicas y un par de documentos con modelos reproducibles; no se agregaron reglas ni aplicaciones consumidoras.
- Revisor: asistente de desarrollo con revisión cruzada asistida de contratos, traducción y trazabilidad; no auditoría profesional independiente ni aprobación del usuario.
- Método estructural: inventario y lectura estricta UTF-8; comprobación de metadatos, encabezados, cercas de código, pares, identificadores y estados; resolución de enlaces locales y anclas; comparación de destinos y bloques de código entre idiomas.
- Resultado estructural: satisfactorio; 39 identificadores originales, 39 filas de trazabilidad por idioma, cuatro requisitos del usuario y 21 fuentes por catálogo. Se resolvieron 210 enlaces locales o anclas; 44 apariciones de enlaces externos se inventariaron, sin confundir este conteo con verificación de su respaldo.
- Método de contenido: contraste de fuentes por apartado, revisión de casos normales y defectuosos, supuestos, límites y equivalencia bilingüe. Se corrigió FUND-005 para declarar y propagar `Written` u `OutputError` en vez de dejar ambiguo el fallo de escritura. No se detectaron otras contradicciones materiales en el alcance de la revisión asistida.
- Evidencia de modelos: procedimiento y resultados conservados en el [registro de comprobación](fundamentals-verification.es-419.md). En PowerShell 7.6.4 sobre Windows, ambos archivos produjeron 17 comprobaciones satisfactorias y detectaron tres defectos deliberados; son los mismos casos, no dos conjuntos independientes.
- Estado resultante: 21 elementos `document-reviewed` y 18 `proposed` por idioma. Ninguno pasa a `validated-in-scope` ni `approved`; los tres modelos no cubren todos los criterios de sus fundamentos. Todas las obligaciones siguen pendientes de aprobación estable.
- No ejecutado: otros ejemplos, componentes de producto, hilos reales, interfaces, ensayos de plataforma, conservación de una publicación estable o recuperación de ese paquete. Persisten límites de fuentes y temas por desarrollar en el registro de trazabilidad.
- Decisión de aprobación: pendiente. Se cierra esta ampliación documental y su comprobación acotada, no la consolidación completa de la base.

## Registro histórico: avance de los cinco puntos en 0.1.0-draft.3

El alcance de esta ronda es el núcleo documental común y sus ejemplos, no componentes de producto ni soporte de plataformas. La tabla distingue trabajo realizado de cierre integral; no cambia la autoridad de aprobación ni declara cumplidas las condiciones de publicación estable.

| Punto | Trabajo realizado | Qué falta para el cierre integral |
| --- | --- | --- |
| 1. Fundamentos | Dos ampliaciones bilingües sobre datos, precisión, texto, tiempo, cancelación, recursos y recuperación; contratos y casos revisados. | Revisar la suficiencia del alcance de la primera entrega y sus límites; no convertir ejemplos acotados en garantías de implementaciones futuras. |
| 2. Reglas | Justificación local de las diez obligaciones y escenarios de interpretación que también recorren flujo y plantilla. | Resolver condiciones de aplicación y escenarios aún no cubiertos, especialmente verificación obligatoria, dependencias y compatibilidad; aprobar el contenido exacto cuando corresponda. |
| 3. Validación | 97 comprobaciones de modelos y ocho escenarios documentales; ejemplos ejecutables de nueve fundamentos y revisión documental de los otros tres. | Completar la evaluación exigida para los elementos que se incluyan en la entrega. Los resultados no cubren todas las cláusulas ni pruebas de producto. |
| 4. Fuentes | Diez referencias nuevas con edición o revisión identificada; catálogo de 31 entradas, con límites por fuente. | Fijar revisiones todavía variables de referencias anteriores y del HTML de Java SE 17; resolver cualquier respaldo o justificación pendiente del alcance final. |
| 5. Publicación | Se conservan registros de revisión y huellas de los modelos comprobados. | Implementar conservación y recuperación del paquete exacto, verificar su integridad y obtener aprobación explícita. Las huellas de ejemplos no sustituyen ese mecanismo. |

Las pruebas de interfaces, sistemas operativos, distribución, bases de datos o servicios reales solo pueden exigirse a un alcance que incluya esas implementaciones. No son operaciones ejecutadas aquí ni condiciones ficticiamente cumplidas para esta documentación. Tampoco se declaran aprobados los perfiles de plataforma por excluir sus implementaciones de esta ronda.

## Registro histórico de la revisión 0.1.0-draft.3

- Fecha: `2026-09-02`; 24 archivos Markdown en doce pares de idioma. Los registros históricos anteriores se mantienen sin sustituir sus resultados por los nuevos.
- Cambio: dos capítulos bilingües y un par de registros de comprobación; ampliación de trazabilidad, justificación de reglas y navegación. Se conservan los 39 identificadores originales; no se crearon aplicaciones ni se instalaron dependencias.
- Revisor: asistente de desarrollo con revisión cruzada asistida de contratos, traducción, modelos y límites. No corresponde a una auditoría independiente ni aprobación del usuario.
- Método estructural: lectura estricta UTF-8, metadatos, encabezados, cercas, pares, identificadores, estados, fuentes, destinos y anclas de enlaces; comparación de bloques de código y enlaces entre idiomas.
- Resultado estructural: satisfactorio; 39 elementos y 39 filas de trazabilidad por idioma, cuatro requisitos del usuario y 31 fuentes por catálogo; 320 enlaces locales o anclas resueltos y 76 apariciones de enlaces externos inventariadas. El inventario no prueba el respaldo de las fuentes.
- Evidencia ejecutada: el [registro del núcleo](core-verification.es-419.md) conserva método, entorno, huella y resultados de 80 comprobaciones nuevas, más la reejecución de las 17 iniciales; ambos idiomas produjeron los mismos resultados satisfactorios. No se duplica el número de casos por idioma.
- Evidencia documental: ocho escenarios revisados; se comprobaron interpretaciones de alcance, verificación proporcional, compatibilidad, conservación/eliminación y los casos documentales de seguridad, accesibilidad y dependencias. No se ejecutaron esos controles en productos.
- Corrección de contenido: se precisó que la comparación de secuencias de texto es ordinal antes y después de NFC; comparación cultural e identidad de secuencias no se usan como equivalentes. Se alinearon rangos y resultados de los modelos con sus contratos. No quedaron contradicciones materiales detectadas en los casos revisados.
- Estado: 23 elementos `document-reviewed` y 16 `proposed` por idioma. RULE-001 queda revisada en su justificación local y RULE-004 en su respaldo contextual y clasificación de datos. Ningún elemento se declara íntegramente `validated-in-scope` o `approved`.
- No ejecutado: pruebas de productos, plataformas, recursos físicos, redes, concurrencia real, respaldo/restauración operativa, rendimiento de producción y preservación/recuperación de una publicación estable.
- Decisión: trabajo de esta ronda documentado y comprobado en su alcance; cierre integral de los cinco puntos y aprobación estable todavía pendientes según la tabla anterior.

## Cierre técnico de la revisión 0.1.0-draft.4

El [registro de entrega](release-readiness.es-419.md) reúne el alcance final, la evaluación de los 39 elementos, las comprobaciones repetibles y la identidad externa del candidato. Los pendientes descritos en las secciones históricas anteriores corresponden a esas revisiones; no sustituyen el estado actual. La decisión restante es la aprobación explícita del paquete exacto y de sus obligaciones, no una nueva autorización para realizar trabajo técnico ya incluido.
