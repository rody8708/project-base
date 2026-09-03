# Aprobación de la publicación técnica 1.1.0

Versión de publicación: `1.1.0`  
Revisión interna conservada: `1.1.0-draft.1`  
Estado: aprobada para el alcance técnico y las excepciones descritas.  
Licencia: `MPL-2.0`  
Idioma: español latinoamericano (`es-419`)  
[US English](approval-1.1.0.en-US.md)

## Autoridad y referencia de aprobación

Aprobador: usuario propietario responsable de este proyecto. Fecha de registro: 2026-09-03. Registrado por el asistente a partir de la respuesta explícita del usuario, no por decisión propia ni mediante firma digital.

En esta tarea de Codex, el asistente presentó la versión propuesta, el SHA-256 completo, MPL-2.0, el alcance y las excepciones, y preguntó: «¿Apruebas exactamente este paquete y su SHA-256 como publicación estable `1.1.0`, aceptando su alcance, la licencia MPL-2.0 y las excepciones declaradas?». La respuesta inmediata del usuario fue: «si lo apruebo». Esta respuesta satisface el requisito local de aprobación explícita.

## Identidad exacta

- Archivo: [project-foundation-1.1.0-candidate.zip](project-foundation-1.1.0-candidate.zip).
- SHA-256 aprobado: `85fbb1ccaaad6a987b68e09c0767bf3d3ff25cc0ec6635d2f4fd1ea5c53ea848`.
- Tamaño: 1,390,677 bytes.
- Contenido: 494 archivos fuente, 3,363,402 bytes antes de compresión y un manifiesto interno.
- Evidencia: [verificación del candidato](project-foundation-1.1.0-candidate.verification.json) y [resumen bilingüe](candidate-1.1.0.es-419.md).
- Integridad al registrar la aprobación: comprobada nuevamente; archivo conservado como solo lectura y sin cambios.

El nombre físico conserva `candidate` porque identifica los bytes creados antes de la aprobación. Este recibo externo asigna a esos bytes la publicación estable `1.1.0`; no se renombra ni reescribe el ZIP para evitar cambiar su identidad.

## Alcance y obligaciones aceptados

Se aprueba una base reutilizable compuesta por el núcleo documental, seis starters técnicos exportables —React, web nativa, Flutter, Kotlin/Android, PHP/Laravel y TypeScript/Node sin framework de aplicación—, contrato API compartido, autenticación/autorización de referencia, adaptadores de persistencia, herramientas de exportación y mantenimiento, documentación `es-419`/`en-US` y licencia MPL-2.0.

La aprobación acepta las obligaciones de MPL-2.0 y los límites registrados. No convierte la base en certificación, auditoría independiente ni aprobación productiva de futuras aplicaciones. Cada consumidor debe decidir dominio, proveedores, secretos, despliegue, monitoreo, carga, recuperación y controles operativos, y verificar su producto real.

macOS e iOS permanecen `no verificados` por falta de una Mac. Tampoco se infiere soporte ejecutado de Linux de escritorio o dispositivos físicos desde la evidencia disponible. Node permanece como perfil opcional de alcance menor que PHP; la publicación estable no los declara equivalentes.

## Conservación

Este recibo queda fuera del ZIP y no modifica su manifiesto previo a aprobación. El paquete, este recibo bilingüe y la verificación deben conservarse juntos en una ubicación confiable. El SHA-256 detecta cambios respecto de la identidad aprobada, pero no autentica por sí mismo a quien aprobó.

Los cambios posteriores pertenecen a otra revisión y no heredan automáticamente esta aprobación. La adopción por un proyecto externo requiere verificar este hash y registrar su propia decisión.
