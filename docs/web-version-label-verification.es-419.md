# Verificación de la etiqueta de versión web

[English (United States)](web-version-label-verification.en-US.md)

- Fecha: 2026-09-04. Rama de mantenimiento probada: `codex/remove-template-version-badge`, revisiones web `1.1.0-draft.3`, basadas en `e8983fc`.
- Entorno: Windows, Node 24.16.0, npm 11.17.0; servidores de desarrollo aislados en puertos de bucle local 5181 (web nativa) y 5174 (React). No se usaron backend, credenciales ni datos reales.
- Reproducción: la nueva regresión de fuentes nativas y la de interfaz renderizada de React fallaron con el texto original de candidata/versión antes de la corrección.
- Resultado automatizado: pasaron las comprobaciones documentales y de arquitectura; 74 pruebas de mantenimiento, 87 de web nativa y 46 de React. Pasaron los tipos y la compilación de producción de React.
- Aceptación en navegador: ninguna página mostró la versión de la plantilla en español ni en inglés. Se agregó y completó una tarea sintética, se cambió el idioma y se observó una tarea completada en ambas aplicaciones. Recargar cada página reinició la lista en memoria a cero, como se esperaba. También se inspeccionó visualmente el encabezado nativo.
- Limitación del controlador de navegador: `check()` sobre la casilla nativa informó un tiempo agotado porque completar cambia el nombre accesible; una inspección nueva del DOM confirmó la casilla marcada y el total completado. No se registró como una acción exitosa de la herramienta.
- Limpieza: la recarga descartó las tareas sintéticas; se cerraron las pestañas y los servidores temporales de verificación. No se modificaron el servidor existente del usuario en el puerto 5180 ni su aplicación generada.
- Alcance: se verifica la interfaz de las plantillas mantenidas, no una aprobación nueva de producción, un archivo publicado ni una actualización de una copia consumidora existente.
