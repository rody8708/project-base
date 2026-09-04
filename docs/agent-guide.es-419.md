# Uso de Project Base mediante agentes y MCP

Revisión de trabajo: `1.2.0-rc.1`  
Idioma: español latinoamericano (`es-419`)  
[English (United States)](agent-guide.en-US.md) · [Inicio](../README.es-419.md)

## Dos formas de comunicación

Project Base no es un servicio permanente ni un modelo de inteligencia artificial. Un agente puede utilizarlo directamente mediante archivos y terminal, o mediante el servidor MCP local. Ambos caminos llaman al mismo motor de generación; MCP no mantiene otra copia de las plantillas ni decide la arquitectura por su cuenta.

```text
persona o agente ──> CLI o MCP ──> motor de Project Base ──> proyecto consumidor nuevo
```

Un agente sin MCP debe leer `AGENTS.md`, ejecutar `npm run create-app`, consultar el `project-base.json` generado y usar `doctor`, `setup`, `check` y `start` desde la raíz de la solución. Un host compatible con MCP puede descubrir recursos y herramientas estructuradas.

## Servidor MCP local

Instalar exactamente las dependencias bloqueadas desde la raíz de Project Base:

```powershell
npm ci --ignore-scripts
```

Después configurar el host MCP para iniciar:

```text
command: node
arguments: D:\ruta\absoluta\project-base\tools\mcp-server.mjs
working directory: D:\ruta\absoluta\project-base
transport: stdio
```

Cada host guarda esta configuración de manera diferente; no existe un archivo de configuración universal entre todos los clientes. Utilizar siempre rutas absolutas propias. El proceso no abre un puerto ni recibe conexiones de red. `stdout` se reserva para el protocolo MCP y los errores del transporte se envían a `stderr` sin detalles internos.

La implementación fija `@modelcontextprotocol/server` `2.0.0` y utiliza `serveStdio`, de acuerdo con la [guía oficial del transporte stdio](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/stdio.md) y el [paquete oficial del servidor](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/packages/server). El lockfile conserva la resolución exacta utilizada por este checkout.

## Recursos disponibles

El servidor expone versiones en español e inglés de:

- procedimiento para comenzar;
- reglas inmutables;
- estándares de ingeniería;
- límite API entre clientes y backend.

Los recursos se leen desde el checkout actual. No sustituyen la selección de una revisión verificable ni convierten cambios de `main` en una publicación estable.

## Herramientas disponibles

| Herramienta | Efecto |
| --- | --- |
| `project_base_list_templates` | Devuelve presets y backends admitidos; sólo lectura. |
| `project_base_doctor` | Comprueba las herramientas que necesita una selección; sólo lectura. |
| `project_base_create_solution` | Crea una solución nueva en una ruta absoluta; modifica únicamente un destino inexistente. |

La creación rechaza destinos existentes, rutas internas del repositorio, nombres inseguros y plantillas desconocidas. No instala dependencias, no ejecuta código del proyecto generado, no usa credenciales y no publica. `setup`, `check` y `start` permanecen como acciones explícitas desde la terminal del proyecto consumidor: ejecutar scripts de un proyecto posteriormente modificado mediante una llamada MCP silenciosa ampliaría innecesariamente el riesgo de ejecución de código.

## Secuencia recomendada para un agente

1. Preguntar o inferir únicamente con evidencia qué producto, usuarios y plataformas están dentro del alcance.
2. Leer las reglas y el límite API mediante recursos MCP o sus archivos equivalentes.
3. Consultar `project_base_list_templates`; no inventar una opción ausente.
4. Ejecutar `project_base_doctor` para la selección prevista y presentar cualquier requisito faltante.
5. Pedir confirmación de nombre y destino antes de llamar `project_base_create_solution`.
6. Cambiar el contexto de trabajo al proyecto generado y leer su `START-HERE` y `project-base.json`.
7. Ejecutar `npm run setup`, `npm run check` y `npm start` sólo con autorización normal para trabajar en ese proyecto.
8. Construir funciones particulares sin modificar Project Base ni declarar listo para producción lo que no tenga evidencia propia.

## Límite de confianza

Las anotaciones MCP informan qué herramientas son de lectura y cuál crea archivos, pero un host o modelo no debe tratarlas como un mecanismo de seguridad. La persona conserva control sobre permisos de archivos y aprobación de acciones. No se ofrece transporte HTTP remoto, autenticación MCP, acceso a GitHub, instalación de herramientas del sistema, manejo de secretos ni ejecución arbitraria de comandos.
