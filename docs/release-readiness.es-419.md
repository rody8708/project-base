# Entrega documental preparada

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](release-readiness.en-US.md) · [Inicio](../README.es-419.md) · [Gobernanza](foundation-governance.es-419.md)

## Resultado y alcance de la primera entrega

Se prepara una base documental común para orientar proyectos construidos en otra ubicación. Incluye 32 Markdown en 16 pares, 39 identificadores originales, principios con contratos y ejemplos, reglas delimitadas, flujo y plantilla. Los cuatro perfiles de plataforma se incluyen como listas orientativas, no como procedimientos nativos aprobados ni soporte verificado. Los modelos y herramientas de mantenimiento son código acotado para comprobar esta base; no son componentes de una aplicación consumidora.

La suficiencia se evalúa para ese propósito inicial, no para reemplazar toda la formación en programación, normas sectoriales o decisiones del producto. Los criterios son: propósito y límites explícitos, trazabilidad por elemento, decisiones aplicables/no aplicables distinguibles, equivalencia bilingüe, modelos repetibles y recuperación verificable del conjunto exacto. El usuario conserva la decisión sobre aceptar este alcance y sus obligaciones.

## Cierre de los cinco puntos

| Punto | Trabajo técnico completado | Evidencia y límite |
| --- | --- | --- |
| Fundamentos | Doce áreas, ampliaciones de datos/tiempo y fallos/recursos, contratos y límites de uso. | [Fundamentos](programming-fundamentals.es-419.md), [datos y tiempo](data-and-time.es-419.md) y [fallos y recursos](failures-and-resources.es-419.md); no currículo exhaustivo ni implementaciones universales. |
| Reglas | Diez obligaciones con justificación y condiciones; decisiones de automatización, dependencias y compatibilidad resueltas localmente. | [Reglas](immutable-rules.es-419.md) y [aplicabilidad](applicability.es-419.md); aprobación pendiente, no reglas atribuidas indiscriminadamente a una norma. |
| Evaluación | 39 pares de casos documentales revisados; modelos y controles de mantenimiento reproducibles. | [Aplicabilidad](applicability.es-419.md), [modelos iniciales](fundamentals-verification.es-419.md), [núcleo](core-verification.es-419.md) y [control documental](document-checks.es-419.md); casos documentales separados de pruebas ejecutadas. |
| Fuentes | Origen, edición o revisión, apartados y límites identificados; justificaciones locales explícitas. | [31 entradas de referencia](traceability.es-419.md), no 31 obras independientes. SWEBOK queda como contexto no usado como respaldo. No se promete disponibilidad eterna de sitios ajenos. |
| Conservación | Formato de candidato y herramientas para crear, verificar, recuperar y detectar alteraciones sin sobrescritura. | [Herramientas de entrega](release-tools.es-419.md); paquete local y hash externo, no almacenamiento inviolable, firma ni respaldo remoto. |

## Registro de comprobaciones de esta revisión

Fecha: 2026-09-02. Revisión: `0.1.0-draft.4`. Revisores: asistente de desarrollo con revisión cruzada asistida. No auditoría independiente ni revisión humana ya concluida. Entorno observado: PowerShell 7.6.4, .NET 10.0.10, Windows 10.0.26200.

- Control documental: satisfactorio en ambos idiomas; 32 archivos, 16 pares, 39 identificadores y filas, 31 entradas de referencia por idioma, 410 enlaces locales/anclas resueltos y 96 apariciones de enlaces externos inventariadas. El inventario externo no prueba respaldo.
- Modelos iniciales y del núcleo: 17 y 80 comprobaciones satisfactorias, respectivamente, en ambos idiomas; se detectan los tres defectos deliberados iniciales. Son 97 casos, no 194 por repetir traducciones.
- Herramientas de entrega: 19 casos satisfactorios desde cada idioma, incluidos recuperación exacta, conservación de destinos existentes, alteraciones, entradas extra/faltantes/duplicadas, rutas inseguras, enlaces y tamaño excesivo. El bloque idéntico tiene SHA-256 `14d73c1cb47e45755f33870b8d409ee46fe0b63a526d9f2aa56fb32472e6727c` (UTF-8, saltos LF, un salto final).
- Control documental bajo mutaciones: cinco rechazos esperados en ambos idiomas, sin cambiar archivos. Se corrigieron dos hallazgos de revisión: comparación insensible a mayúsculas que podía ocultar cambios de código y falta de exigir exactamente 16 pares. Ambos tienen regresión.
- Revisión bilingüe: se corrigió «no compatibles» por «fuera de soporte» para conservar el significado de `unsupported`. No quedaron diferencias materiales detectadas en el alcance de la revisión asistida.
- Empaquetado final: el resultado del candidato exacto, su recuperación y la repetición desde esa copia se registran externamente después de fijar el ZIP. Un registro inexistente o con fallo no autoriza adopción; la entrega debe incluir el resultado satisfactorio y el hash comunicado.

La evaluación de aplicabilidad revisó 39 filas y 78 casos documentales (normal y límite por fila); conserva ocho escenarios de la revisión anterior, con solapamiento, por lo que no se presenta una suma como cobertura independiente. Las 31 entradas de fuentes se contrastaron con sus apartados y límites; las políticas locales no se disfrazan de requisitos externos.

La revisión semántica compara alcance, condiciones, resultados y límites de cada par. Los controles estructurales complementan esa revisión, no la sustituyen. Los registros históricos mantienen sus resultados originales; no se actualizan retroactivamente.

## Identidad, conservación y repetición

El candidato final se conserva como `releases/foundation-0.1.0-draft.4.zip`. Su `manifest.json` técnico enumera exactamente los 32 documentos y sus huellas. No contiene un hash de sí mismo. La huella SHA-256 de todo el ZIP y el resultado final de recuperación se guardan en el registro técnico externo `releases/foundation-0.1.0-draft.4.verification.json` y se comunican junto con la entrega; no se insertan dentro del ZIP, lo que evitaría una referencia circular.

Para repetir: revisar el código de mantenimiento; cargarlo desde el documento correspondiente; usar `Test-FoundationCandidate` con ruta explícita y `ExpectedSha256` de un registro confiable. Recuperar solo a una carpeta nueva. Desde la raíz recuperada, abrir `pwsh -NoProfile` y ejecutar el control documental y los bloques de los dos registros de modelos. No requiere red, módulos adicionales, credenciales ni configuración de proyecto oculta; PowerShell es requisito previo declarado. Esto comprueba preparación de la copia sobre ese entorno existente, no instalación limpia del sistema operativo o de PowerShell.

Los ensayos quedan en `.validation` como artefactos identificados; no se eliminaron documentos del usuario. El registro externo se produce después del paquete y no es aprobación. Obtener un ZIP y un hash ambos alterados desde el mismo lugar no establece identidad confiable: conservar por separado la referencia de aprobación y las copias necesarias.

## Decisión que requiere al usuario

Aprobar o rechazar el contenido exacto identificado por el SHA-256, su alcance documental y sus obligaciones; esta decisión no puede autoasignarla el asistente. Incluye la política local de pruebas automatizadas/regresión cuando hay código, control de dependencias y compatibilidad declarada, con las condiciones especificadas.

Si se aprueba, se registra fuera del paquete: responsable, fecha, revisión editorial `0.1.0-draft.4`, versión de publicación `1.0.0`, SHA-256 completo, alcance y referencia a la aprobación. No se modifica el ZIP para cambiar sus encabezados: son la instantánea previa a aprobación, y el recibo confiable vinculado determina el estado efectivo según la gobernanza. Una respuesta solicitando cambios produce otro candidato, no una aprobación implícita.

## Fuera de alcance, no pendientes encubiertos

No se construyeron aplicaciones ni se verificaron soporte nativo, tiendas, firma, redes reales, concurrencia de producción, accesibilidad de interfaz, rendimiento de producto o restauración operativa de datos del consumidor. Tampoco se hizo una evaluación legal, certificación, instalación desde cero de herramientas o respaldo externo. Esas actividades solo pertenecen a futuros alcances que las implementen o contraten; no son motivos para inventar evidencia ni para iniciar productos aquí.
