# Política de seguridad

[US English](SECURITY.en-US.md) · [Inicio](../README.es-419.md) · [Guía de contribución](CONTRIBUTING.es-419.md)

## Versiones con soporte

Zendrhax LLC evalúa reportes contra la publicación estable más reciente. En este momento es `1.1.0`. Las revisiones anteriores y los borradores no reciben correcciones de seguridad independientes. Cada proyecto creado desde esta base es responsable de sus propias dependencias, configuración, despliegue y respuesta a incidentes.

## Informar una vulnerabilidad

No abras un Issue, discusión o pull request público para una vulnerabilidad sospechada. Usa preferentemente el reporte privado de vulnerabilidades de GitHub en este repositorio. Si ese canal no está disponible, escribe a [contact@zendrhax.com](mailto:contact@zendrhax.com) con el asunto `Reporte de seguridad de project-base`.

Incluye, cuando sea posible:

- versión, commit, componente y configuración afectados;
- pasos mínimos para reproducir el problema o una prueba de concepto inocua;
- impacto observado o probable y condiciones necesarias para explotarlo;
- mitigaciones conocidas y una forma segura de contactarte.

No incluyas secretos reales, credenciales activas, datos personales ni información de terceros. Da tiempo razonable para investigar y coordinar una corrección antes de divulgar públicamente. Zendrhax LLC intentará confirmar la recepción y comunicar el siguiente paso, pero esta política no promete un plazo contractual de respuesta o corrección.

## Alcance

Se aceptan reportes sobre código, automatizaciones, documentación ejecutable y artefactos oficiales de este repositorio. Las vulnerabilidades de un producto construido con la base deben comunicarse al responsable de ese producto. La evidencia local o de CI no sustituye la validación del despliegue real, sus secretos, TLS, respaldos, monitoreo ni controles operativos.
