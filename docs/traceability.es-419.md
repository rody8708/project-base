# Registro de respaldo y verificación

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](traceability.en-US.md) · [Inicio](../README.es-419.md) · [Gobernanza de la base](foundation-governance.es-419.md)

## Cómo leer este registro

Este registro cubre los 39 elementos existentes: 10 reglas, 12 fundamentos, 5 etapas del flujo, 4 perfiles de plataforma y 8 secciones de la plantilla. No agrega reglas ni sustituye su texto. Expone qué parte tiene respaldo identificado, qué parte sigue siendo una decisión local y qué falta comprobar.

- `USER`: requisito expresado por el usuario en esta conversación, identificado abajo como `REQ-U-...`.
- `LOCAL`: propuesta de diseño de esta base; no es una exigencia atribuible al usuario ni a una fuente externa.
- `REF`: principio contrastado con el apartado concreto de una fuente primaria. No significa adopción íntegra de esa fuente.
- `proposed`: propuesto; aún falta contrastar el respaldo del elemento o justificar suficientemente la decisión local.
- `document-reviewed`: revisado documentalmente en la parte indicada; no significa aprobación, validación funcional ni respaldo de todas sus cláusulas.

El respaldo parcial de una cláusula no prueba las demás. Los procedimientos de verificación de las tablas son propuestas locales de evidencia futura: no son resultados obtenidos, pruebas instaladas ni comprobaciones exigidas literalmente por las fuentes. Para cada ejecución futura se necesitarán el artefacto o cambio identificado, entorno, método, resultado, responsable y limitaciones, según la gobernanza.

La evidencia registrada aquí es el contraste documental realizado por el asistente el **2026-09-02**, limitado a los apartados indicados. No es una revisión independiente. Ninguna fila acredita por sí misma el funcionamiento de código, una plataforma compatible o una publicación estable.

La revisión de aplicabilidad completa la justificación local de todas las filas en esta entrega documental; no expande el respaldo parcial de cada fuente. Las decisiones concretas de consumidores futuros no son pendientes de diseño de esta base.

## Requisitos de origen del usuario

Estos identificadores sirven para rastrear la conversación; no son nuevas reglas del producto.

| Referencia | Requisito expresado | Límite de la atribución |
| --- | --- | --- |
| REQ-U-001 | Crear una base maestra reutilizable para proyectos web, de escritorio, macOS y móviles; los proyectos se construirán aparte con esa base. | No fija arquitecturas, herramientas, sistemas adicionales ni pruebas específicas. |
| REQ-U-002 | Apoyarse en fundamentos sólidos y consolidados y en elementos probados y funcionales cuando existan. | No equivale a declarar validado el contenido actual ni prescribe automatización universal. |
| REQ-U-003 | Comenzar por fundamentos, buenas prácticas y reglas inmutables documentados en `.md`. | La selección de 10 reglas, sus identificadores y el modelo de publicaciones son propuestas locales. |
| REQ-U-004 | Mantener español latinoamericano e inglés de Estados Unidos en archivos separados. | Los códigos `es-419` y `en-US`, el mecanismo de sincronización y las excepciones de material externo son decisiones de implementación; no fija idiomas del producto final. |

## Catálogo de fuentes primarias

Fecha de consulta: **2026-09-02**. La base conserva su formulación propia y las citas, ediciones o revisiones, apartados y límites que identifican el respaldo utilizado; no reproduce obras completas. Las guías mantenidas se vinculan a revisiones concretas de sus repositorios de origen; normas y cursos se identifican por publicación o edición semestral. No se afirma que sean las ediciones más recientes ni certificación o cumplimiento integral de las fuentes.

Una revisión de origen identifica contenido, pero no garantiza disponibilidad externa eterna. Una edición docente identificada no congela los bytes de su sitio. Esos límites no obligan a archivar todos los terceros: se preservan los documentos propios y su referencia precisa; un cambio externo no modifica automáticamente una publicación de esta base. Los 31 identificadores son entradas de referencia, no necesariamente 31 obras independientes: SRC-NIST-SSDF y SRC-NIST-USE remiten a la misma publicación; SWEBOK queda excluido del respaldo técnico.

### SRC-SWEBOK

- Fuente: IEEE Computer Society, [Software Engineering Body of Knowledge (SWEBOK)](https://www.computer.org/education/bodies-of-knowledge/software-engineering).
- Edición/consulta: el extracto oficial indexado menciona la versión 4.0, 2024. La apertura directa devolvió acceso denegado; no se revisó el libro ni se comprobó que esa sea la edición más reciente.
- Apartado contrastado: presentación del conocimiento generalmente aceptado y su aplicación contextual, visible en el extracto oficial indexado.
- Límite: referencia contextual excluida del respaldo técnico; no sustenta obligaciones ni filas. La falta de acceso al libro no bloquea este alcance, que no afirma adoptarlo.

### SRC-NIST-SSDF

- Fuente: NIST, [SP 800-218: Secure Software Development Framework (SSDF), versión 1.1](https://csrc.nist.gov/pubs/sp/800/218/final), [publicación](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf).
- Edición/estado: publicación final de febrero de 2022; se referencia esta edición, sin afirmar que no existan revisiones posteriores.
- Apartados consultados: resumen ejecutivo; tabla 1, PO.1.2, PW.4.1/PW.4.4, PW.7.1/PW.7.2 y PW.8.1/PW.8.2.
- Límite: recomendaciones de desarrollo seguro, revisión, componentes y pruebas de seguridad; no un estándar completo de programación. No respalda por sí solo cada prueba funcional, requisito pedagógico o redacción absoluta de esta base.

### SRC-NIST-USE

- Fuente: NIST, [SP 800-218: Secure Software Development Framework (SSDF), versión 1.1](https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf).
- Edición/estado: publicación final de febrero de 2022; sustituye la referencia anterior a la página variable «SSDF Use» por el texto equivalente de esta edición.
- Apartado consultado: sección 1, página impresa 3: selección contextual por riesgo, costo, viabilidad y aplicabilidad; no es una lista uniforme.
- Límite: criterio de interpretación de SRC-NIST-SSDF, no una obra independiente ni respaldo automático de políticas locales más estrictas.

### SRC-OWASP-INPUT

- Fuente: OWASP, [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).
- Revisión consultada: commit [ca485dc590f92b31f6db336335faa619ba68b112](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/ca485dc590f92b31f6db336335faa619ba68b112/cheatsheets/Input_Validation_Cheat_Sheet.md), del `2026-06-29`; apartados contrastados en ese contenido.
- Apartados consultados: objetivos, estrategias y validación en cliente y servidor.
- Límite: respalda validación temprana de entradas no confiables y que la interfaz no sustituya el control de seguridad. No exige contratos formales en todos los módulos ni convierte la validación en defensa suficiente contra todos los ataques.

### SRC-OWASP-AUTH

- Fuente: OWASP, [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- Revisión consultada: commit [0b43888b5d6196711ddb4c42f3db3938fe5f52f4](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/0b43888b5d6196711ddb4c42f3db3938fe5f52f4/cheatsheets/Authorization_Cheat_Sheet.md), del `2026-08-31`; apartados contrastados en ese contenido.
- Apartados consultados: privilegios mínimos, control por solicitud, ubicación confiable del control y salida segura ante rechazo.
- Límite: respalda controles de autorización, no una arquitectura o modelo de permisos único. Su adaptación a capacidades nativas de cada plataforma requiere contraste adicional.

### SRC-OWASP-SECRETS

- Fuente: OWASP, [Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html).
- Revisión consultada: commit [fcd8b68435a268ecaa1a4729c5ac68bb5fb08cc7](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/fcd8b68435a268ecaa1a4729c5ac68bb5fb08cc7/cheatsheets/Secrets_Management_Cheat_Sheet.md), del `2026-08-13`; apartados contrastados en ese contenido.
- Apartados consultados: introducción, 2.2, 2.3 y 9.2.
- Límite: respalda gestión controlada de secretos, acceso mínimo y tratamiento de exposiciones en código o registros. No selecciona un proveedor ni valida nuestra configuración o la gestión de credenciales de cada cliente.

### SRC-OWASP-ERROR

- Fuente: OWASP, [Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html).
- Revisión consultada: commit [752e4d0d8b85061f769fb6b6d3460017f1370d00](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/752e4d0d8b85061f769fb6b6d3460017f1370d00/cheatsheets/Error_Handling_Cheat_Sheet.md), del `2024-04-02`; apartados contrastados en ese contenido.
- Apartados consultados: contexto y objetivo del manejo de errores.
- Límite: respalda respuestas sin detalles internos sensibles y diagnóstico separado, principalmente en aplicaciones web/API. No demuestra consistencia transaccional, liberación de recursos ni idempotencia de reintentos.

### SRC-MIT-SPECIFICATIONS

- Fuente: MIT 6.031, Spring 2021, [Specifications](https://web.mit.edu/6.031/www/sp21/classes/06-specifications/).
- Edición identificada: MIT 6.031, primavera de 2021, lectura 6. Se fija esa identidad editorial y los apartados citados; no se afirma inmutabilidad de los bytes del sitio.
- Apartados consultados: Specification structure; Why specifications.
- Límite: Contratos y garantías de operaciones. No valida descubrimiento de necesidades ni exige Java o la prohibición universal de valores ausentes.

### SRC-MIT-INVARIANTS

- Fuente: MIT 6.031, Spring 2021, [Abstraction Functions & Rep Invariants](https://web.mit.edu/6.031/www/sp21/classes/11-abstraction-functions-rep-invariants/).
- Edición identificada: MIT 6.031, primavera de 2021, lectura 11. Se fija esa identidad editorial y los apartados citados; no se afirma inmutabilidad de los bytes del sitio.
- Apartados consultados: Invariants; Checking the rep invariant; Documenting the AF, RI, and safety from rep exposure.
- Límite: Invariantes y representación protegida. No cubre precisión, calendarios ni toda implementación de inmutabilidad.

### SRC-CORNELL-LOOPS

- Fuente: Cornell CS 2110, Spring 2026, [Loop Invariants](https://courses.cis.cornell.edu/courses/cs2110/2026sp/lectures/lec04/).
- Edición identificada: Cornell CS 2110, primavera de 2026, lección 4. Se fija esa identidad editorial y los apartados citados; no se afirma inmutabilidad de los bytes del sitio.
- Apartados consultados: Writing “Loopy” Code: Initialization, Loop Guard, Loop Body.
- Límite: Razonamiento de ciclos con progreso hacia la salida. No prueba tiempos límite, cancelación ni servicios de larga vida.

### SRC-MIT-COHESION

- Fuente: MIT 6.031, Spring 2021, [Designing Specifications](https://web.mit.edu/6.031/www/sp21/classes/07-designing-specs/).
- Edición identificada: MIT 6.031, primavera de 2021, lectura 7. Se fija esa identidad editorial y los apartados citados; no se afirma inmutabilidad de los bytes del sitio.
- Apartados consultados: Designing good specifications: The specification should be coherent.
- Límite: Coherencia de una operación; no receta universal para dividir módulos.

### SRC-MIT-EFFECTS

- Fuente: MIT 6.031, Spring 2021, [Code Review](https://web.mit.edu/6.031/www/sp21/classes/04-code-review/).
- Edición identificada: MIT 6.031, primavera de 2021, lectura 4. Se fija esa identidad editorial y los apartados citados; no se afirma inmutabilidad de los bytes del sitio.
- Apartados consultados: Methods should return results, not print them.
- Límite: Separación entre resultados e impresión. Su extensión a red, almacenamiento y arquitectura es una propuesta local.

### SRC-MIT-CONCURRENCY

- Fuente: MIT 6.031, Spring 2021, [Thread Safety](https://web.mit.edu/6.031/www/sp21/classes/21-thread-safety/).
- Edición identificada: MIT 6.031, primavera de 2021, lectura 21. Se fija esa identidad editorial y los apartados citados; no se afirma inmutabilidad de los bytes del sitio.
- Apartados consultados: What threadsafe means; Strategy 1: confinement; Strategy 2: immutability.
- Límite: Estrategias de estado compartido. No valida nuestro modelo ni cubre sus recursos, durabilidad o reintentos.

### SRC-OWASP-CRYPTO

- Fuente: OWASP, [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).
- Revisión consultada: commit [efbc9db2542c987a3c6ffe4e7f8cb48cd636182f](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/efbc9db2542c987a3c6ffe4e7f8cb48cd636182f/cheatsheets/Cryptographic_Storage_Cheat_Sheet.md), del `2026-08-31`; apartados contrastados en ese contenido.
- Apartados consultados: Architectural Design; Custom Algorithms.
- Límite: Protección según amenazas y algoritmos establecidos. No selecciona ni verifica una implementación criptográfica.

### SRC-OWASP-THREATS

- Fuente: OWASP, [Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html).
- Revisión consultada: commit [ad32f17e5d68701bc4c73505b90739bf66bd775b](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/ad32f17e5d68701bc4c73505b90739bf66bd775b/cheatsheets/Threat_Modeling_Cheat_Sheet.md), del `2026-03-24`; apartados contrastados en ese contenido.
- Apartados consultados: Overview; Addressing Each Question.
- Límite: Análisis contextual de sistema, amenazas, respuestas y verificación. No impone una metodología única ni certifica seguridad.

### SRC-GOOGLE-REVIEW

- Fuente: Google Engineering Practices, [What to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html).
- Revisión consultada: commit [3e6ba5cfc8c096528173f8f31b2caf15bb78340c](https://raw.githubusercontent.com/google/eng-practices/3e6ba5cfc8c096528173f8f31b2caf15bb78340c/review/reviewer/looking-for.md), del `2022-03-31`; apartados contrastados en ese contenido.
- Apartados consultados: Complexity; Comments; Documentation.
- Límite: Guía contextual de complejidad y documentación. No adopta herramientas internas ni comentarios exclusivamente en inglés.

### SRC-MIT-TESTING

- Fuente: MIT 6.031, Spring 2021, [Testing](https://web.mit.edu/6.031/www/sp21/classes/03-testing/).
- Edición identificada: MIT 6.031, primavera de 2021, lectura 3. Se fija esa identidad editorial y los apartados citados; no se afirma inmutabilidad de los bytes del sitio.
- Apartados consultados: Choosing test cases by partitioning; Include boundaries in the partition; Coverage; Unit and integration testing.
- Límite: Selección y alcance de pruebas. No impone porcentajes, herramientas ni una distribución universal de pruebas.

### SRC-GOOGLE-TESTING

- Fuente: Software Engineering at Google, capítulo 11, [Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html).
- Edición/revisión: libro publicado en marzo de 2020; HTML en commit [e9e24835cb889fe25251cb9ec6d51b79233e358d](https://raw.githubusercontent.com/abseil/abseil.github.io/e9e24835cb889fe25251cb9ec6d51b79233e358d/resources/swe-book/html/ch11.html), del `2026-02-10`.
- Apartados consultados: Case Study: Flaky Tests Are Expensive; Properties common to all test sizes; Test Scope; A Note on Code Coverage.
- Límite: Experiencia contextual sobre aislamiento, no determinismo y cobertura. No se adoptan su infraestructura o métricas como obligaciones.

### SRC-MIT-ALGORITHMS

- Fuente: MIT 6.006, Spring 2020, [Lecture 1: Introduction](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/477c78e0af2df61fa205bcc6cb613ceb_MIT6_006S20_lec1.pdf).
- Edición identificada: MIT 6.006, primavera de 2020, lección 1. Se fija esa identidad editorial y los apartados citados; no se afirma inmutabilidad de los bytes del sitio.
- Apartados consultados: Efficiency; Model of Computation; Data Structure (pp. 2–3).
- Límite: Costo por tamaño y supuestos de cómputo. No respalda un protocolo específico de medición ni predice latencia real.

### SRC-W3C-WCAG22

- Fuente: W3C, [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/2024/REC-WCAG22-20241212/).
- Edición/consulta: Edición fechada indicada; sin afirmar que sea la más reciente.
- Apartados consultados: 2.1.1; 2.4.7; 3.3.1; 3.3.2.
- Límite: Recomendación del 2024-12-12, criterios seleccionados de contenido web. No acredita conformidad completa, accesibilidad nativa ni cumplimiento legal.

### SRC-W3C-I18N

- Fuente: W3C, [Internationalization Quick Tips for the Web](https://www.w3.org/International/quicktips/).
- Revisión consultada: commit [8a11663d7bab071d6c53b238eb1582297497e7fc](https://raw.githubusercontent.com/w3c/i18n-drafts/8a11663d7bab071d6c53b238eb1582297497e7fc/quicktips/index.en.html), del `2025-09-25`; apartados contrastados en ese contenido.
- Apartados consultados: Forms; Text authoring.
- Límite: Guía parcial sobre formatos y texto traducible. No define todos los formatos regionales ni obliga a una técnica de catálogos.

### SRC-RFC8259

- Fuente: IETF, [The JavaScript Object Notation (JSON) Data Interchange Format](https://www.rfc-editor.org/rfc/rfc8259.html).
- Edición: RFC 8259, diciembre de 2017; consulta `2026-09-02`.
- Apartados consultados: 3, 4, 6 y 8.1.
- Límite: valores, precisión e intercambio JSON; no fija significado comercial ni exige este formato.

### SRC-RFC3339

- Fuente: IETF, [Date and Time on the Internet: Timestamps](https://www.rfc-editor.org/rfc/rfc3339.html).
- Edición: RFC 3339, julio de 2002; consulta `2026-09-02`.
- Apartados consultados: 4.2, 5.6 y 5.7.
- Límite: marcas temporales y calendario; no resuelve agendas ni cambios futuros de zonas.

### SRC-UNICODE-NFC

- Fuente: Unicode, [Unicode Normalization Forms, UAX #15](https://www.unicode.org/reports/tr15/tr15-57.html).
- Edición: Unicode 17.0.0, revisión 57, `2025-07-30`; consulta `2026-09-02`.
- Apartados consultados: 1.1 y 1.2.
- Límite: equivalencia y normalización; no impone transformar secretos ni acredita conformidad completa.

### SRC-W3C-CLOCK

- Fuente: W3C, [High Resolution Time Level 2](https://www.w3.org/TR/2019/REC-hr-time-2-20191121/).
- Edición: recomendación del `2019-11-21`; consulta `2026-09-02`.
- Apartados consultados: 1 y 6.
- Límite: reloj monotónico web; no acredita relojes nativos ni sincronización distribuida.

### SRC-JAVA-ZONES

- Fuente: Oracle, [ZoneRules](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/zone/ZoneRules.html).
- Edición/revisión: Java SE 17; Javadoc de OpenJDK 17 en commit [175b65c0a1e9f624bff80ec14f785403c0b2d62d](https://raw.githubusercontent.com/openjdk/jdk17/175b65c0a1e9f624bff80ec14f785403c0b2d62d/src/java.base/share/classes/java/time/zone/ZoneRules.java), del `2021-07-21`, identificado desde `jdk-17+35`. El HTML de Oracle no se declara inmutable.
- Apartado consultado: getValidOffsets(LocalDateTime).
- Límite: distinción entre horas locales normales, inexistentes y ambiguas; no selecciona Java ni valida datos de zonas.

### SRC-DOTNET-NUMBERS

- Fuente: Microsoft, [Floating-point numeric types](https://github.com/dotnet/docs/blob/4b9c7672e087d5f61ade3161ab57ff88e192edcc/docs/csharp/language-reference/builtin-types/floating-point-numeric-types.md).
- Revisión: `4b9c7672e087d5f61ade3161ab57ff88e192edcc`, fecha del commit `2026-01-15`; consulta `2026-09-02`.
- Apartado consultado: Characteristics of the floating-point types.
- Límite: precisión de tipos concretos; no prescribe lenguaje ni redondeo del negocio.

### SRC-DOTNET-USING

- Fuente: Microsoft, [using statement - ensure the correct use of disposable objects](https://raw.githubusercontent.com/dotnet/docs/399ea4a18a9312379c5b3306bbffcc753491c628/docs/csharp/language-reference/statements/using.md).
- Revisión: `399ea4a18a9312379c5b3306bbffcc753491c628`; metadato documental `ms.date: 2026-01-16`, no fecha del commit; consulta `2026-09-02`.
- Apartado consultado: introducción, salida por excepción y return, equivalencia con try/finally.
- Límite: liberación en ámbitos de C#; no garantiza limpieza ante terminación abrupta ni selecciona plataforma.

### SRC-DOTNET-CANCELLATION

- Fuente: Microsoft, [Cancellation in Managed Threads](https://raw.githubusercontent.com/dotnet/docs/8b2033ff9f3b355e8fca60a4b0ee5e6501ab4fc7/docs/standard/threading/cancellation-in-managed-threads.md).
- Revisión: `8b2033ff9f3b355e8fca60a4b0ee5e6501ab4fc7`; metadato documental `ms.date: 2026-03-17`, no fecha del commit; consulta `2026-09-02`.
- Apartados consultados: Introduction; Operation Cancellation Versus Object Cancellation; Listening and Responding to Cancellation Requests; Listening by Polling; Listening by Registering a Callback.
- Límite: cooperación de cancelación en .NET; no garantiza interrupción inmediata ni reversión de efectos.

### SRC-RFC9110

- Fuente: IETF, [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).
- Edición: RFC 9110, junio de 2022; consulta `2026-09-02`.
- Apartado consultado: 9.2.2, Idempotent Methods.
- Límite: efecto solicitado y repetición HTTP; no implementa deduplicación comercial ni ejecución exactamente una vez.

### SRC-SQL-RESTORE

- Fuente: Microsoft, [Back up and restore SQL Server databases](https://raw.githubusercontent.com/MicrosoftDocs/sql-docs/4f5b84b173a7019a9a4c69952f93b7c08921d57b/docs/relational-databases/backup-restore/back-up-and-restore-of-sql-server-databases.md).
- Revisión: `4f5b84b173a7019a9a4c69952f93b7c08921d57b`, fecha del commit `2026-08-27`; consulta `2026-09-02`.
- Apartados consultados: Backup and restore strategies; Test your backups; Document backup/restore strategy.
- Límite: estrategia y ensayos de restauración en SQL Server; no impone esa plataforma ni demuestra recuperación operativa aquí.

## Reglas

Texto de referencia: [reglas propuestas](immutable-rules.es-419.md). En todas las filas, las comprobaciones son esperadas, no ejecutadas.

### Alcance, límites y protección

| ID | Origen y respaldo identificado | Alcance o límite pendiente | Verificación esperada | Estado |
| --- | --- | --- | --- | --- |
| RULE-001 | `LOCAL`; [justificación de políticas](immutable-rules.es-419.md). | Política local justificada para evitar requisitos inventados y ampliaciones no autorizadas, con registro proporcional. Sigue pendiente aprobación de la obligación. | Revisar una descripción de cambio: problema, aceptación observable, exclusiones y suposiciones con responsable; detectar una ampliación no autorizada. | `document-reviewed` |
| RULE-002 | `REF` [SRC-OWASP-INPUT](#src-owasp-input) + `LOCAL`. | Respaldo parcial de entradas no confiables; contratos en límites entre módulos son política local justificada por el riesgo de suposiciones incompatibles y evaluada en aplicabilidad. | Inventariar límites; contrastar contratos y casos válidos, inválidos y extremos; intentar omitir la validación de interfaz sin omitir la protección real. | `document-reviewed` |
| RULE-003 | `REF` [SRC-OWASP-AUTH](#src-owasp-auth), [SRC-OWASP-SECRETS](#src-owasp-secrets), [SRC-OWASP-ERROR](#src-owasp-error) + `LOCAL`. | Respaldo parcial de autorización, secretos y exposición de errores. Distribución de secretos de servicios en cada tipo de cliente y controles nativos requieren revisión específica. | Revisar archivos y registros con datos ficticios; trazar cada operación protegida hasta su control; comprobar acceso permitido y rechazado y ausencia de secretos compartidos en el cliente. | `document-reviewed` |
| RULE-004 | `REF` [SRC-SQL-RESTORE](#src-sql-restore) + `LOCAL`. | Restauración contrastada en contexto SQL; autorización, clasificación y alcance son políticas locales. Ningún modelo demuestra recuperación física ni autoriza una eliminación real. | Usar datos ficticios en dos casos separados: para conservación, probar la recuperación elegida; para eliminación definitiva requerida, confirmar objetivo, alcance y autorización, sin exigir restauración. | `document-reviewed` |
| RULE-005 | `REF` [SRC-OWASP-ERROR](#src-owasp-error), [SRC-DOTNET-USING](#src-dotnet-using), [SRC-DOTNET-CANCELLATION](#src-dotnet-cancellation), [SRC-RFC9110](#src-rfc9110) + `LOCAL`. | Errores, limpieza, cancelación y límites de idempotencia contrastados parcialmente; coordinación persistente y garantías de cada implementación requieren evidencia propia. | Provocar un fallo de operación; inspeccionar resultado, estado final, recursos y registros; repetir la solicitud cuando corresponda y comprobar sus efectos. | `document-reviewed` |

### Calidad, continuidad y documentación

| ID | Origen y respaldo identificado | Alcance o límite pendiente | Verificación esperada | Estado |
| --- | --- | --- | --- | --- |
| RULE-006 | `USER` REQ-U-002 + `REF` [SRC-NIST-SSDF](#src-nist-ssdf), PW.8 + `LOCAL`. | Respaldo parcial de pruebas de seguridad. Automatización para todo código, regresión obligatoria y condición de terminado son políticas locales, no mandatos del SSDF. | Relacionar aceptación y pruebas; registrar ejecuciones, fallos y omisiones; demostrar que una regresión reproduce el defecto y distingue la corrección. Revisar contenido y paridad cuando no haya código. | `document-reviewed` |
| RULE-007 | `LOCAL`; preparación verificable y control de dependencias. | Decisión local justificada en aplicabilidad: procedencia y versiones controladas, bloqueo cuando exista y preparación comprobada. Sin garantía de binarios idénticos; instalaciones del consumidor se verifican allí. | Repetir la preparación e instalación en un entorno limpio declarado con acceso autorizado; comprobar versiones resueltas y ausencia de rutas ocultas; justificar el mecanismo de dependencias elegido sin inferir binarios idénticos. | `document-reviewed` |
| RULE-008 | `LOCAL`; compatibilidad declarada y transición. | Decisión local justificada: preservar promesas declaradas y autorizar/comprobar transiciones ante rupturas. No exige soporte perpetuo ni plataformas no elegidas. | Ejecutar casos de la matriz declarada, identificar cambios incompatibles y ensayar la transición con formatos o consumidores representativos. | `document-reviewed` |
| RULE-009 | `REF` [SRC-NIST-SSDF](#src-nist-ssdf), PW.7 + `LOCAL`. | Respaldo parcial de revisión de seguridad. Revisión integral de cada entrega, decisiones y herramienta de historial son políticas locales; la fuente no exige Git. | Comparar todos los cambios con el alcance; guardar hallazgos y resolución, motivos relevantes y vínculo inequívoco entre entrega y contenido revisado. | `document-reviewed` |
| RULE-010 | `USER` REQ-U-004 + `LOCAL`. | El usuario pidió archivos separados por idioma; simultaneidad, paridad exacta y tratamiento de material externo son propuestas locales. | Inventariar pares; comparar identificadores, versión, estado y enlaces; revisar significado, obligaciones y excepciones en ambos idiomas. | `document-reviewed` |

## Fundamentos

Texto de referencia: [fundamentos propuestos](programming-fundamentals.es-419.md), ampliados por [datos y tiempo](data-and-time.es-419.md) y [fallos y recursos](failures-and-resources.es-419.md). Los ejemplos y métodos son locales, no un currículo completo. El [registro inicial](fundamentals-verification.es-419.md) y la [comprobación del núcleo](core-verification.es-419.md) separan casos ejecutados de revisión documental; las columnas siguientes no afirman una ejecución completa de cada elemento.

### Problema, datos y estructura

| ID | Origen y respaldo identificado | Alcance o límite pendiente | Verificación esperada | Estado |
| --- | --- | --- | --- | --- |
| FUND-001 | `REF` [SRC-MIT-SPECIFICATIONS](#src-mit-specifications) + `LOCAL`. | Contratos contrastados. Interesados, prioridades y solución mínima son decisiones locales; no se valida el descubrimiento del problema. | Formular ejemplos de entrada, salida y error; comprobar que cada parte de una solución propuesta satisface una necesidad identificada. | `document-reviewed` |
| FUND-002 | `REF` [SRC-MIT-INVARIANTS](#src-mit-invariants), [SRC-RFC8259](#src-rfc8259), [SRC-RFC3339](#src-rfc3339), [SRC-UNICODE-NFC](#src-unicode-nfc), [SRC-W3C-CLOCK](#src-w3c-clock), [SRC-JAVA-ZONES](#src-java-zones), [SRC-DOTNET-NUMBERS](#src-dotnet-numbers) + `LOCAL`. | Representación, rangos, redondeo, texto y tiempo desarrollados con modelos. Políticas de dominio y comportamiento de lenguajes, calendarios o zonas reales no se generalizan desde ellos. | Preparar casos de ausencia, vacío, cero y límites; comprobar invariantes y conversiones relevantes sin pérdida no prevista. | `document-reviewed` |
| FUND-003 | `REF` [SRC-CORNELL-LOOPS](#src-cornell-loops), [SRC-DOTNET-CANCELLATION](#src-dotnet-cancellation) + `LOCAL`. | Progreso y cancelación cooperativa desarrollados. El contador de pasos no es un tiempo límite; llamadas bloqueadas y presupuestos reales requieren comprobación específica. | Recorrer ramas con ejemplos; justificar terminación; probar cancelación o límite de una operación larga cuando corresponda. | `document-reviewed` |
| FUND-004 | `REF` [SRC-MIT-COHESION](#src-mit-cohesion) + `LOCAL`. | Coherencia de especificaciones contrastada. No establece tamaños, capas ni una división universal de responsabilidades. | Revisar entradas, efectos y responsabilidad de cada módulo; demostrar que una separación propuesta mejora un cambio o una prueba concreta. | `document-reviewed` |
| FUND-005 | `REF` [SRC-MIT-EFFECTS](#src-mit-effects) + `LOCAL`. | Separación de cálculo e impresión contrastada. Su extensión a red, almacenamiento y sistema operativo es una propuesta local. | Verificar una regla central sin interfaz o red cuando sea práctico; probar por separado el límite con el efecto externo. | `document-reviewed` |
| FUND-006 | `REF` [SRC-MIT-CONCURRENCY](#src-mit-concurrency), [SRC-DOTNET-USING](#src-dotnet-using), [SRC-DOTNET-CANCELLATION](#src-dotnet-cancellation), [SRC-RFC9110](#src-rfc9110) + `LOCAL`. | Propiedad, limpieza, reentrada y reintentos desarrollados. Modelos seriales sin caídas no acreditan hilos reales, durabilidad ni coordinación entre sistemas. | Identificar propietarios y transiciones; ensayar interrupción, solicitudes simultáneas y cierre; detectar fugas o efectos repetidos. | `document-reviewed` |

### Seguridad, calidad y mantenimiento

| ID | Origen y respaldo identificado | Alcance o límite pendiente | Verificación esperada | Estado |
| --- | --- | --- | --- | --- |
| FUND-007 | `REF` [SRC-OWASP-INPUT](#src-owasp-input), [SRC-OWASP-AUTH](#src-owasp-auth), [SRC-OWASP-ERROR](#src-owasp-error), [SRC-OWASP-CRYPTO](#src-owasp-crypto), [SRC-OWASP-THREATS](#src-owasp-threats) + `LOCAL`. | Permisos, entradas, errores, criptografía establecida y análisis contextual contrastados. Taxonomía concreta y controles del caso son locales. | Enumerar amenazas de un caso acotado y sus controles; probar entradas y accesos rechazados; revisar mensajes sin exponer datos internos. | `document-reviewed` |
| FUND-008 | `REF` [SRC-GOOGLE-REVIEW](#src-google-review) + `LOCAL`. | Respaldo contextual contra complejidad especulativa. Políticas independientes y elección de mecanismos requieren justificación local. | Comparar dos diseños para una necesidad real; registrar costos de cambio y probar si el código compartido representa la misma regla de negocio. | `document-reviewed` |
| FUND-009 | `REF` [SRC-NIST-SSDF](#src-nist-ssdf), [SRC-MIT-TESTING](#src-mit-testing), [SRC-GOOGLE-TESTING](#src-google-testing) + `LOCAL`. | SSDF PW.8 respalda pruebas de seguridad; MIT/Google, casos, alcances y determinismo. Automatización obligatoria y distribución concreta son políticas locales. | Elegir casos por comportamiento y riesgo; repetirlos con reloj y dependencias controlados; demostrar un defecto que un porcentaje alto de cobertura no detecta. | `document-reviewed` |
| FUND-010 | `REF` [SRC-MIT-ALGORITHMS](#src-mit-algorithms) + `LOCAL`. | Resultados y conteos de sumas comprobados en modelos. No se midieron tiempos o memoria de producto; el protocolo de medición y las metas son locales. | Medir tiempo y memoria con tamaños representativos; comparar antes y después bajo condiciones iguales y registrar la diferencia y sus costos. | `document-reviewed` |
| FUND-011 | `REF` [SRC-W3C-WCAG22](#src-w3c-wcag22), [SRC-W3C-I18N](#src-w3c-i18n) + `LOCAL`. | Criterios web e internacionalización contrastados parcialmente. Sin interfaz probada, conformidad completa, accesibilidad nativa ni evaluación legal. | Definir tareas de usuario, navegación y asistencia pertinentes; probar formatos y textos con los idiomas del producto y registrar barreras. | `document-reviewed` |
| FUND-012 | `REF` [SRC-NIST-SSDF](#src-nist-ssdf), [SRC-GOOGLE-REVIEW](#src-google-review) + `LOCAL`. | PW.4.1/PW.4.4 y documentación contrastados. Licencias concretas, compatibilidad y costos de dependencias requieren decisiones propias. | Inventariar dependencias y responsables; revisar origen, versiones, licencia y riesgos; comprobar que una persona pueda seguir las instrucciones y entender una decisión significativa. | `document-reviewed` |

## Flujo de desarrollo

Texto de referencia: [flujo propuesto](development-workflow.es-419.md). El orden y la definición de terminado son diseño local; no constituyen un ciclo de desarrollo exigido por las fuentes.

| ID | Origen y respaldo identificado | Alcance o límite pendiente | Verificación esperada | Estado |
| --- | --- | --- | --- | --- |
| FLOW-001 | `LOCAL`; preparación del cambio. | Preparación proporcional justificada para evitar suposiciones ocultas; la plantilla bilingüe implementa REQ-U-004. Escenarios evaluados en aplicabilidad. | Revisar un registro de cambio con aceptación, límites, riesgos y decisiones; detectar datos faltantes antes de la actividad que depende de ellos. | `document-reviewed` |
| FLOW-002 | `LOCAL`; diseño proporcional y prevención. | Selección local de preguntas preventivas justificada por riesgos, sin certificar disciplinas ni exigir controles irrelevantes. No es un proceso universal. | Recorrer un caso con fallo, permiso o pérdida de datos; relacionar requisitos con diseño, controles y decisiones justificadas. | `document-reviewed` |
| FLOW-003 | `LOCAL`; incrementos revisables. | Política local justificada por atribución y revisión de cambios: incrementos coherentes, pruebas y paridad; admite cambios atómicos de varios archivos. | Inspeccionar un incremento: alcance enfocado, trabajo ajeno preservado, pruebas asociadas y documentación equivalente. | `document-reviewed` |
| FLOW-004 | `REF` [SRC-NIST-SSDF](#src-nist-ssdf), PW.7/PW.8 + `LOCAL`. | Respaldo parcial de revisión y pruebas de seguridad. Las demás áreas y condiciones de cierre son propuestas locales. | Ejecutar un conjunto de controles aplicables; guardar identificación, entorno, método, resultado y omisiones; comprobar que ningún control omitido figure como aprobado. | `document-reviewed` |
| FLOW-005 | `LOCAL`; revisión y entrega honesta. | Definición local de terminado evaluada contra entrega completa y parcial. Exige correspondencia con aceptación, no un formato o equipo universal. | Contrastar un paquete de entrega con aceptación y evidencias; comprobar instrucciones, límites, pendientes y correspondencia del contenido entregado con lo revisado. | `document-reviewed` |

## Perfiles de plataforma

Texto de referencia: [perfiles propuestos](platform-guidelines.es-419.md). La revisión cubre estas listas como orientación local, no como guías técnicas nativas. Los requisitos oficiales vigentes y el soporte se comprueban al implementar cada consumidor; las fuentes generales de seguridad no prueban compatibilidad, distribución o funcionamiento nativo.

| ID | Origen y respaldo identificado | Alcance o límite pendiente | Verificación esperada | Estado |
| --- | --- | --- | --- | --- |
| PLAT-001 | `USER` REQ-U-001 + `LOCAL`. | Lista orientativa local para formular requisitos web según funciones existentes; no procedimientos normativos, implementaciones ni soporte de navegadores aprobado. | Crear matriz de navegadores/entornos; comprobar recorridos, conectividad, permisos y despliegue; contrastar los controles elegidos con documentación oficial aplicable. | `document-reviewed` |
| PLAT-002 | `USER` REQ-U-001 + `LOCAL`. | Lista orientativa local de objetivos de escritorio, incluido macOS; evaluación documental no acredita instalación, firma, distribución ni comportamiento nativo. | Elegir sistemas y arquitecturas; verificar instalación, actualización, datos, cierre y accesibilidad; consultar requisitos oficiales del canal elegido, incluido macOS cuando aplique. | `document-reviewed` |
| PLAT-003 | `USER` REQ-U-001 + `LOCAL`. | Lista orientativa local de condiciones móviles; seleccionar Android/iOS, requisitos vigentes y pruebas reales corresponde al consumidor. | En dispositivos o entornos declarados, ensayar interrupciones, permisos, red variable, sincronización y actualización; medir recursos según funciones reales. | `document-reviewed` |
| PLAT-004 | `LOCAL`; compartir código solo con beneficio. | Decisión local justificada: compartir solo con beneficio y comprobar adaptadores por separado. Implementaciones separadas son admisibles; no exige una única aplicación multiplataforma. | Probar una misma regla compartida y cada adaptador; registrar diferencias y evidencia por plataforma sin generalizar un resultado a las demás. | `document-reviewed` |

## Plantilla de proyecto consumidor

Texto de referencia: [plantilla propuesta](../templates/project-brief.es-419.md). Sus campos se completarán en proyectos separados. La estructura no está prescrita por una norma y completar casillas no valida un proyecto.

| ID | Origen y respaldo identificado | Alcance o límite pendiente | Verificación esperada | Estado |
| --- | --- | --- | --- | --- |
| BRIEF-001 | `USER` REQ-U-001 + `LOCAL`. | Campos locales justificados para evitar adopción ambigua; ubicación externa pedida por el usuario. Identidad y aprobación se completan solo cuando existan. | Identificar responsable, propósito y publicación exacta de la base; comprobar que la referencia corresponde al contenido realmente adoptado. | `document-reviewed` |
| BRIEF-002 | `LOCAL`; alcance y aceptación. | Campos locales para hacer observable la aceptación y separar exclusiones/suposiciones; evaluados en aplicabilidad, sin atribuir respaldo externo a un vínculo interno. | Vincular cada resultado con un criterio comprobable; distinguir exclusiones, suposiciones y confirmaciones. | `document-reviewed` |
| BRIEF-003 | `USER` REQ-U-001/REQ-U-004 + `LOCAL`. | Clases de proyecto y separación de idiomas respaldadas por la conversación; versiones y lenguas de interfaz se eligen por proyecto. | Comparar documentos en ambos idiomas; separar plataformas previstas de verificadas y exigir evidencia para estas últimas; declarar idiomas del producto. | `document-reviewed` |
| BRIEF-004 | `LOCAL`; decisiones de diseño y herramientas. | Campos locales justificados para decisiones visibles; no seleccionan lenguaje, arquitectura o gestor para consumidores futuros. | Revisar alternativas y motivos, contratos y responsabilidades; comprobar versiones y que ninguna selección se presente como impuesta por la base sin respaldo. | `document-reviewed` |
| BRIEF-005 | `REF` [SRC-OWASP-INPUT](#src-owasp-input), [SRC-OWASP-AUTH](#src-owasp-auth), [SRC-OWASP-SECRETS](#src-owasp-secrets), [SRC-SQL-RESTORE](#src-sql-restore) + `LOCAL`. | Entradas, permisos, secretos y restauración con respaldo contextual. Conservación y eliminación son decisiones explícitas; no se ha probado una recuperación operativa del consumidor. | Relacionar datos con finalidad, acceso y controles; comprobar recuperación cuando corresponda a datos que deban conservarse; verificar casos de rechazo y configuración ficticia sin secretos reales. | `document-reviewed` |
| BRIEF-006 | `LOCAL`; objetivos y evidencia. | Campos locales justificados para relacionar objetivos con métodos y evidencia; no acreditan calidad por completar casillas. | Comprobar que cada objetivo tiene método, entorno, umbral si aplica y evidencia prevista; revisar razones de no aplicabilidad y pendientes. | `document-reviewed` |
| BRIEF-007 | `LOCAL`; preparación y operación. | Campos locales justificados para reducir conocimiento oculto; comandos y controles se concretan según cada entregable, sin afirmar su ejecución por la plantilla. | Reproducir preparación y entrega con instrucciones reales; probar diagnóstico y transición según riesgo; registrar fallos y plataformas realmente ensayadas. | `document-reviewed` |
| BRIEF-008 | `LOCAL`; pendientes y aprobación. | Campos locales justificados para identificar autoridad y decisiones antes de etapas dependientes; completitud no equivale a aprobación. | Revisar responsable y plazo de cada pendiente; contrastar estado con evidencias y decisión de aprobación, y comprobar la equivalencia bilingüe. | `document-reviewed` |

## Cierre y límites del alcance

Los 39 elementos quedan revisados documentalmente: sus orígenes y decisiones locales están identificados, y [aplicabilidad](applicability.es-419.md) registra 39 pares de casos con criterio y resultado. Revisor: asistente de desarrollo con revisión cruzada asistida, 2026-09-02. No es aprobación humana, auditoría independiente ni validación funcional integral. Las columnas de verificación esperada conservan criterios para implementaciones futuras; no declaran que todos se hayan ejecutado aquí.

Se cierran las condiciones locales de automatización, dependencias y compatibilidad; las entradas de fuentes tienen edición, revisión o curso identificados y límites explícitos. Son 31 entradas, no 31 obras independientes. SWEBOK es contexto excluido del respaldo. Los cuatro perfiles quedan incluidos solo como listas orientativas revisadas, no procedimientos de plataforma aprobados ni soporte comprobado.

La [preparación de entrega](release-readiness.es-419.md) reúne las comprobaciones, conservación e integridad del candidato. Falta aprobación explícita del contenido exacto según la [gobernanza](foundation-governance.es-419.md). No faltan aquí aplicaciones de prueba: instalaciones, interfaces, rendimiento, restauración operativa y pruebas de plataformas pertenecen a los consumidores que las implementen. No se ha evaluado cumplimiento legal o normativo sectorial.
