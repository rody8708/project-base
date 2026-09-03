# Flujo de desarrollo y calidad

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](development-workflow.en-US.md) · [Inicio](../README.es-419.md)

## Objetivo

Proponer una rutina práctica para proyectos consumidores desarrollados fuera de esta base, a partir de las [reglas propuestas](immutable-rules.es-419.md). No es el procedimiento para aprobar o publicar el núcleo documental: ese proceso está separado en la [gobernanza de la base](foundation-governance.es-419.md). El tamaño del registro y la profundidad de las verificaciones dependen del riesgo; no se requiere una plataforma de colaboración o una herramienta específica.

Este flujo es una propuesta interna, no un estándar exhaustivo ni un proceso técnicamente validado. Su respaldo y sus límites están registrados en la [trazabilidad](traceability.es-419.md). Sus instrucciones y su definición de terminado expresan el funcionamiento previsto tras la aprobación y adopción de una futura publicación estable; no representan obligaciones ya adoptadas.

## FLOW-001 — Definir

- Describir problema, resultado esperado, alcance y criterios de aceptación.
- Identificar plataformas, usuarios, datos, permisos y contratos afectados.
- Declarar suposiciones y resolver decisiones que cambien materialmente el alcance.
- Para un proyecto nuevo y separado de esta base, completar la [definición del proyecto](../templates/project-brief.es-419.md) en ambos idiomas, identificando una publicación estable aprobada antes de declarar su adopción.

## FLOW-002 — Diseñar lo necesario

- Elegir la solución más pequeña que satisfaga los requisitos.
- Definir contratos, validaciones y manejo de fallos relevantes.
- Evaluar seguridad, privacidad, accesibilidad, compatibilidad y rendimiento; establecer objetivos concretos cuando correspondan o justificar su no aplicabilidad.
- Identificar cambios destructivos o incompatibles y establecer, antes de ejecutarlos, autorización, recuperación para los datos que deban conservarse y transición ante rupturas de contrato, según corresponda.
- Registrar alternativas y motivos solo para decisiones con impacto relevante.

## FLOW-003 — Implementar en incrementos

- Trabajar en cambios enfocados y revisables, preservando trabajo existente ajeno.
- Mantener consistencia con las convenciones documentadas del proyecto.
- Agregar pruebas junto con el comportamiento, incluida la regresión de defectos reproducibles.
- Actualizar configuración de ejemplo, contratos y documentación en ambos idiomas.

## FLOW-004 — Verificar

Ejecutar las comprobaciones del proyecto desde un entorno adecuado y registrar qué versión o conjunto de cambios se verificó, cómo y con qué resultado. Usar los comandos reales definidos para ese proyecto; esta base documental no proporciona comandos de compilación ni de prueba de una aplicación.

La tabla siguiente describe comprobaciones previstas para el proyecto consumidor, no verificaciones ya ejecutadas ni evidencia de que esta base sea técnicamente válida. Mantener separados el plan de verificación y el registro de resultados reales; una revisión documental no prueba una implementación, una instalación ni compatibilidad de plataforma.

| Área | Comprobación mínima según corresponda |
| --- | --- |
| Documentación | Pares de idiomas, equivalencia semántica, enlaces, identificadores y versiones consistentes. |
| Código | Formato, análisis estático y comprobación de tipos cuando el ecosistema los ofrezca. |
| Comportamiento | Pruebas automatizadas de los cambios y recorridos afectados; regresión para defectos reproducibles. |
| Límites | Entradas inválidas, errores externos, permisos y reintentos relevantes. |
| Datos | Migración y recuperación verificadas para datos que deban conservarse; alcance autorizado documentado para datos descartables o eliminación definitiva. |
| Seguridad | Revisión de secretos, exposición de datos y permisos; revisión de dependencias cuando existan. |
| Interfaz | Interacción, accesibilidad y tamaños o dispositivos incluidos en el alcance. |
| Distribución | Preparación, compilación, instalación o despliegue según el entregable y las plataformas declaradas. |

Una comprobación fallida debe resolverse o mantenerse como trabajo pendiente visible. Si un control no aplica, se registra el motivo. Si aplica y no se puede ejecutar, no se marca como aprobado y el cambio no cumple la definición de terminado.

## FLOW-005 — Revisar y entregar

- Revisar todos los archivos modificados y confirmar que no hay cambios fuera de alcance ni datos sensibles.
- Comparar el resultado con los criterios de aceptación y las reglas aplicables.
- Explicar qué cambió, qué se verificó, qué no se ejecutó y qué riesgos permanecen.
- Incluir instrucciones de uso y transición cuando cambien contratos o formas de operación.
- Solo identificar el trabajo como terminado cuando se cumpla la lista siguiente. Una entrega parcial se identifica como parcial.

## Definición de terminado

- [ ] El resultado cumple todos los criterios de aceptación acordados.
- [ ] Las reglas aplicables se cumplen y su evidencia está registrada.
- [ ] Los contratos, validaciones, errores y permisos afectados fueron revisados.
- [ ] Las comprobaciones requeridas se ejecutaron y sus resultados son satisfactorios.
- [ ] Los defectos reproducibles corregidos tienen una prueba de regresión.
- [ ] Los cambios de datos o compatibilidad cuentan con autorización y transición verificadas cuando corresponda.
- [ ] Las instrucciones y la documentación están actualizadas y son equivalentes en ambos idiomas.
- [ ] Se revisó el cambio completo y no se incluyeron modificaciones ajenas sin autorización.
- [ ] Los límites del soporte, riesgos residuales y requisitos de operación están comunicados.

## Registro mínimo de verificación

Para cada entrega, conservar: identificación del cambio, entorno o plataforma, comprobación o comando exacto, fecha, resultado, ubicación de la evidencia y limitaciones. Distinguir explícitamente «prevista», «ejecutada con éxito», «ejecutada con fallo» y «no ejecutada»; una comprobación prevista no se registra como superada. El registro propio del proyecto también respeta la separación de idiomas. No incluir tokens, credenciales ni datos personales reales.

La revisión humana es necesaria para criterios de significado, alcance y traducción. Se propone incorporar los controles automáticos al crear cada proyecto consumidor ejecutable, sin presentar una lista de verificación como si ya fuera automatización instalada. Este documento no afirma que tales controles existan en esta base.
