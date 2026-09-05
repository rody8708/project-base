# Cómo crear una aplicación con esta base

Revisión de trabajo: `1.1.0-draft.2`  
Idioma: español latinoamericano (`es-419`)  
[English (United States)](getting-started.en-US.md) · [Inicio](../README.es-419.md)

## Para qué sirve

Este repositorio no es la aplicación final. Es una fuente controlada de fundamentos, decisiones arquitectónicas, plantillas ejecutables y verificaciones reutilizables. Su utilidad es evitar que cada producto empiece con límites improvisados: se elige una revisión conocida, se exportan únicamente los componentes necesarios y se desarrolla el producto en ubicaciones separadas.

La estructura recomendada mantiene estas dependencias:

```text
base de proyectos ──exporta──> proyecto consumidor

web / móvil / escritorio ──HTTPS + contrato API──> backend
backend ──puerto de persistencia + adaptador──> SQLite, PostgreSQL o MySQL
```

Los clientes no acceden a la base de datos ni importan código interno del backend. El contrato API es el único límite compartido. Un framework puede ayudar, pero no es obligatorio: lo obligatorio es conservar contratos, separación, pruebas y evidencia.

## Si todavía no sabes programar

La base puede orientarte y evitar decisiones improvisadas, pero no reemplaza el aprendizaje, el desarrollo ni la revisión humana. Necesitarás un desarrollador o un asistente de programación para ejecutar comandos, adaptar el código y construir las funciones particulares de tu producto.

Antes de escoger tecnologías, escribe en lenguaje común:

- Qué problema resuelve la aplicación.
- Quién la utilizará.
- Las tres funciones imprescindibles de la primera versión.
- En qué dispositivos debe funcionar.
- Qué información guardará y quién puede verla o modificarla.

Con esas respuestas, un desarrollador o asistente puede usar las secciones siguientes para escoger los componentes. Si una decisión todavía no se entiende, se registra como pendiente; no se inventa una respuesta ni se declara lista.

## 1. Elegir los componentes

Elegir solo lo que el producto necesita:

| Necesidad | Base disponible |
| --- | --- |
| Web con React, TypeScript y Vite | [Web](../starters/web/README.es-419.md) |
| Web con HTML, CSS y JavaScript, sin framework | [Web nativa](../starters/web-vanilla/README.es-419.md) |
| Cliente compartido para móvil y escritorio | [Flutter](../starters/flutter/README.es-419.md) |
| Android nativo o funciones que Flutter no cubra adecuadamente | [Kotlin Android](../starters/kotlin-android/README.es-419.md) |
| Backend PHP con Laravel y tres motores SQL | [Backend PHP](../starters/backend-php/README.es-419.md) |
| Backend propio TypeScript/Node sin framework de aplicación | [Backend Node](../starters/backend-node/README.es-419.md) |
| Backend Python con FastAPI y adaptadores SQLAlchemy | [Backend Python](../starters/backend-python/README.es-419.md) |

Es válido usar más de un cliente, escoger uno de los backends, crear otro backend desde cero o reemplazar cualquier adaptador. No se deben copiar todos los starters por defecto.

## 2. Elegir una revisión verificable

- Para máxima reproducibilidad, adoptar la publicación técnica congelada `v1.1.0`, su paquete y sus recibos de integridad.
- Para incorporar mantenimiento posterior, adoptar un commit exacto de `main`, ejecutar nuevamente las comprobaciones y registrar que no es automáticamente otra publicación estable.
- En ambos casos, la aprobación de la base no aprueba el producto nuevo. Su adopción, identidad, riesgos y despliegue requieren evidencia propia.

Definir primero el producto con la [plantilla de definición](../templates/project-brief.es-419.md). Registrar alcance, responsables, clientes, backend, almacenamiento, contrato, amenazas, datos, plataformas y criterios de aceptación antes de convertir decisiones provisionales en arquitectura.

## 3. Exportar a ubicaciones nuevas

### Camino sencillo recomendado

Desde la raíz de Project Base ejecutar:

```powershell
npm run create-app
```

El asistente pregunta en lenguaje común qué se quiere crear, el backend preferido cuando haga falta, un nombre y una carpeta donde guardarlo. Genera una sola solución con `app/` y/o `api/`, un manifiesto `project-base.json` y archivos `START-HERE.es-419.md` y `START-HERE.en-US.md`. Dentro de la solución sólo hay que recordar cuatro comandos de raíz:

```powershell
npm run doctor
npm run setup
npm run check
npm start
```

`doctor` revisa versiones y herramientas; `setup` instala dependencias bloqueadas y prepara el almacenamiento local aplicable; `check` coordina pruebas y verificaciones; `start` inicia los componentes de desarrollo. Ninguno instala herramientas del sistema, inventa credenciales, publica o aprueba el producto para producción.

La creación inicial no instala dependencias, no usa credenciales, no publica y no sobrescribe carpetas. La instalación sólo ocurre después si la persona ejecuta explícitamente `npm run setup`. Si la creación queda incompleta, conserva la carpeta identificada para inspección y no la presenta como terminada.

### Camino avanzado

La herramienta crea un destino que todavía no existe. Cada comando produce un proyecto independiente; por eso una solución con API y web puede usar carpetas hermanas o repositorios separados:

```powershell
node tools/create-project.mjs --template backend-php --name ejemplo-api --destination "D:\products\ejemplo-api"
node tools/create-project.mjs --template web --name ejemplo-web --destination "D:\products\ejemplo-web"
```

También se puede sustituir `backend-php` por `backend-node` o `backend-python`, o el cliente por `web-vanilla`, `flutter` o `kotlin-android`. La referencia completa de opciones, restricciones y archivos excluidos está en las [instrucciones del exportador](../tools/README.es-419.md).

Después de cada exportación:

1. Revisar `foundation/adoption.json`, el recibo y los hashes; no cambiar su significado para aparentar aprobación.
2. Completar los dos archivos de idioma `foundation/capability-profile`. Marcar cada perfil como no aplica, planificado o habilitado; nunca declararlo habilitado sin implementación y evidencia.
3. Inicializar el control de versiones del proyecto consumidor.
4. Reemplazar nombres visibles, dominios, package names, bundle/application IDs, namespaces y configuración de ejemplo. Conservar los avisos exigidos por la licencia.
5. Instalar dependencias y ejecutar las pruebas indicadas por el README exportado antes de agregar funciones.

## 4. Fijar el contrato antes de conectar clientes

El [límite API](technical/api-boundary.es-419.md) define responsabilidades, autenticación, errores, compatibilidad y la prohibición de acceso directo a persistencia. La [integración ejecutable](technical/api-integration.es-419.md) muestra el patrón probado por los starters.

Para el producto consumidor, mantener una especificación OpenAPI canónica y versionada. El backend la implementa; cada cliente genera o implementa su adaptador HTTP contra ella. Los modelos de pantalla y los modelos SQL permanecen internos. Un cambio incompatible exige una nueva versión o una migración explícita, no una modificación silenciosa.

## 5. Mantener reemplazable la persistencia

La lógica de aplicación depende de una interfaz o puerto de repositorio. SQLite, PostgreSQL y MySQL se conectan mediante adaptadores que implementan ese puerto. Cambiar de motor requiere configuración, migraciones y pruebas del adaptador, pero no debe cambiar el contrato público de la API ni obligar a modificar los clientes. Consultar los criterios de [selección de tecnologías y datos](technical/technology-choices.es-419.md).

La abstracción no garantiza compatibilidad por sí sola. Se deben probar restricciones, transacciones, Unicode, migraciones, concurrencia, respaldos y restauración en cada motor que el producto declare compatible.

## 6. Completar identidad, autenticación y autorización

Los starters demuestran tokens provisionados, permisos y propiedad de recursos. Una aplicación real debe decidir además registro o aprovisionamiento de usuarios, almacenamiento seguro de contraseñas si existen, sesiones o renovación de tokens, revocación, recuperación, MFA cuando el riesgo lo exija, roles, auditoría, límites de intentos y manejo de secretos.

Implementar estas decisiones detrás del límite API. Ningún cliente debe recibir secretos del servidor ni decidir por sí solo una autorización que proteja datos.

## 7. Construir por cortes verticales

Agregar una capacidad a la vez: contrato, regla de dominio, persistencia, endpoint, adaptador del cliente, interfaz y pruebas. El [flujo de desarrollo](development-workflow.es-419.md) define revisión, cambios pequeños, trazabilidad y criterios de terminación.

Una estructura común puede ser:

```text
producto/
├── api/                 # backend independiente
├── clients/
│   ├── web/             # cliente opcional
│   ├── mobile/          # cliente opcional
│   └── desktop/         # cliente opcional
├── contracts/openapi/   # contrato API canónico
├── docs/                # decisiones y operación del producto
└── foundation/          # revisión adoptada, recibos y evidencia
```

No es obligatorio usar un monorepo. En repositorios separados, el contrato debe publicarse o fijarse con una versión inmutable y cada consumidor debe verificarla.

## 8. Validar antes de llamar estable al producto

Ejecutar pruebas unitarias, de contrato, integración, migración y extremo a extremo en ambientes aislados. Luego completar los controles de [seguridad y producción](technical/security-production.es-419.md) y registrar el resultado sin ampliar lo que la evidencia demuestra. El [estado de estabilidad](technical/stability-status.es-419.md) de esta base es una referencia de cómo distinguir aprobado, pendiente y no comprobado.

La simulación local puede preparar TLS, secretos, servicios, bases, fallos, carga, respaldo y restauración. La validación final del producto también debe comprobar su infraestructura real, monitoreo, dominio, certificados, proveedor, dispositivos soportados y proceso de recuperación. macOS/iOS permanece pendiente hasta disponer de una Mac adecuada; esa limitación no debe ocultarse ni bloquear productos que no declaren esas plataformas.

## Cuándo está lista la adopción

La base está correctamente adoptada cuando el proyecto consumidor identifica una revisión exacta, conserva sus recibos, tiene identidad propia, usa la API como único enlace cliente-servidor, aísla persistencia con adaptadores, implementa su modelo real de seguridad, pasa las pruebas de las plataformas y motores declarados, y documenta responsables y pendientes. A partir de ahí se construye el producto; no se modifica esta base para guardar el código de la aplicación.

## Selección guiada por tecnologías

Ejecuta `npm run create-app` desde Project Base. Primero elige web, móvil, escritorio o solo API; después el asistente muestra las tecnologías existentes para esa categoría, con sus lenguajes y frameworks. Si la plantilla requiere backend, elige TypeScript con Node.js sin framework de aplicación, PHP con Laravel o Python con FastAPI. Antes de confirmar verás la tecnología y la carpeta de destino.

Consola y MCP consultan el mismo catálogo. El catálogo describe las seis combinaciones existentes, no añade nuevas plantillas ni aprobación de plataformas. La base de datos todavía se configura siguiendo la documentación del backend: este cambio no incluye un selector de motor. La creación no instala dependencias ni ejecuta pruebas; cancela con `n` antes de crear archivos.

La aplicación gráfica de escritorio, el registro de proyectos y los indicadores de verificación siguen pendientes. Se prevé que reutilicen este catálogo y el motor de creación; no hay un instalador de escritorio en esta entrega.

Verificación de mantenimiento (2026-09-04, rama `codex/shared-creation-catalog`, basada en `697610c`): pasaron 77 pruebas del repositorio y las comprobaciones documentales/de arquitectura en Windows. Se recorrió la entrada real de consola en español: Web → React + TypeScript → Python + FastAPI → resumen del destino → cancelación; terminó correctamente sin crear la carpeta sintética propuesta. Las pruebas automatizadas cubren todas las categorías en ambos idiomas, cancelación sin escrituras, creación de un sitio independiente y paridad del catálogo mediante la entrada MCP stdio. No cambiaron interfaces de aplicaciones, flujos de base de datos ni despliegues de producción.
