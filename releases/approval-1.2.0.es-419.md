# Aprobación de la publicación técnica 1.2.0

[US English](approval-1.2.0.en-US.md) · [Candidato y alcance](candidate-1.2.0.es-419.md) · [Verificación](project-foundation-1.2.0-candidate.verification.json)

Estado: aprobada para el alcance técnico y las excepciones registrados. Licencia original: MPL-2.0.

## Autoridad

El usuario propietario de este proyecto aprobó explícitamente la entrega en esta tarea el 4 de septiembre de 2026. Después de enlazar el candidato exacto y su alcance, el asistente preguntó: «¿Apruebas publicarlo como versión estable, con MPL-2.0 y las excepciones documentadas, incluido macOS/iOS pendiente?». La respuesta inmediata fue: «si».

Este recibo registra esa decisión, no una aprobación autónoma del asistente ni una firma digital.

## Identidad aprobada

- Versión estable: `1.2.0`.
- Paquete: [project-foundation-1.2.0-candidate.zip](project-foundation-1.2.0-candidate.zip).
- SHA-256: `fa353b14d2c7101d21074778513c7a15fbb13e0c81dbab29d582cd9c6c8fb5a6`.
- Tamaño: 2,844,053 bytes; 573 archivos.
- Fuente: `9007083275cb083bc39479288d5adbc60496cc1a`.
- Identidad verificada nuevamente tanto en el archivo local como en el digest del asset de GitHub antes de registrar la aprobación.

## Alcance y límites aceptados

Siete plantillas, fundamentos bilingües, asistente guiado, MCP local, exportación, contrato API y laboratorios operativos Node/Python, con las pruebas y limitaciones del candidato enlazado. Los helpers de aplicación Node requieren await; el contrato HTTP no cambia. Las dependencias mantienen sus propias licencias.

macOS/iOS siguen no verificados por falta de Mac; Linux de escritorio y dispositivos físicos carecen de aceptación completa. No incluye login humano con contraseña, recuperación ni MFA. No se concede certificación, auditoría independiente, capacidad sostenida, RPO/RTO ni aprobación productiva de las aplicaciones consumidoras.

## Conservación

El ZIP y su inventario previo a aprobación permanecen intactos. Sus nombres y estados internos de candidato describen el momento de captura; este recibo externo asigna la publicación estable 1.2.0 a los bytes exactos. Las publicaciones anteriores no cambian. Conservar paquete, verificación y ambos recibos juntos; las revisiones posteriores no heredan esta aprobación automáticamente.
