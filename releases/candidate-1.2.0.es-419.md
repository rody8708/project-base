# Candidato técnico 1.2.0

[US English](candidate-1.2.0.en-US.md) · [Paquete](project-foundation-1.2.0-candidate.zip) · [Verificación e inventario](project-foundation-1.2.0-candidate.verification.json)

Estado: verificado, pendiente de aprobación explícita del propietario. No es todavía una publicación estable aprobada.

## Identidad exacta

- Versión propuesta: `1.2.0`; revisión de mantenimiento y Node: `1.2.0-rc.1`.
- Fuente: commit `9007083275cb083bc39479288d5adbc60496cc1a`, integrado mediante [PR #30](https://github.com/rody8708/project-base/pull/30).
- Archivo: `project-foundation-1.2.0-candidate.zip`; 2,844,053 bytes y 573 archivos.
- SHA-256: `fa353b14d2c7101d21074778513c7a15fbb13e0c81dbab29d582cd9c6c8fb5a6`.
- Licencia original: MPL-2.0; las dependencias mantienen sus propias licencias.

## Alcance y verificación

Incluye las siete plantillas, fundamentos bilingües, asistente guiado, MCP local, exportación, contrato API y laboratorios operativos de Node/Python. Node incorpora PostgreSQL/MySQL, repositorios asíncronos y limitación compartida; Python conserva sus correcciones de bloqueos reproducidos. Los helpers Node requieren await; el contrato HTTP permanece compatible. No incluye cuentas humanas con contraseña, recuperación ni MFA.

Se capturaron exclusivamente archivos controlados por Git de una revisión limpia; cada contenido se comparó con su blob aplicando los filtros declarados. El ZIP preserva los bytes de checkout, incluido el recibo histórico CRLF, y cada archivo recuperado se comparó por SHA-256 con los bytes capturados. El inventario externo identifica todas las entradas. No contiene dependencias instaladas, bases de datos de ejecución, configuraciones reales ni claves privadas; las credenciales escritas en pruebas son sintéticas.

Desde una recuperación nueva, sin dependencias preinstaladas en ella, aprobaron: 73 pruebas de mantenimiento; documentación/arquitectura; nueve pruebas rápidas Node; laboratorios Node SQLite/PostgreSQL/MySQL; integración Node con React/web nativa; Ruff, mypy y 31 pruebas Python con HTTPS/SQLite. La [CI del código fuente](https://github.com/rody8708/project-base/actions/runs/33927228907) aprobó además las matrices Python, PHP, web, Flutter portátil y Kotlin Android. No se infiere una ejecución nativa de Apple de esos resultados.

Se conservaron la recuperación local y sus dependencias como evidencia. Una copia sintética anterior de adopción en el directorio temporal de Windows quedó retenida porque la política del host bloqueó su eliminación manual; sus procesos fueron detenidos. Los laboratorios retiraron sus propios contenedores, bases y material TLS. No se alteraron datos del usuario.

## Límites y decisión

macOS/iOS siguen aplazados por falta de Mac; Linux de escritorio y dispositivos físicos no tienen aceptación completa. No se certifican capacidad sostenida, RPO/RTO, despliegue público ni producción. Esas evidencias corresponden a cada aplicación y su infraestructura.

Las publicaciones 1.0.0 y 1.1.0 permanecen intactas. Aprobar este candidato requiere aceptar expresamente esta identidad SHA-256, alcance, licencia y excepciones. La aprobación se conservará en un recibo externo; no se modificará el ZIP para cambiar sus encabezados. Cualquier cambio solicitado produce otro candidato, nunca una sobrescritura del paquete.
