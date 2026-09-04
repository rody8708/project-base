# Base maestra para proyectos de software

[Laboratorio Docker aislado: PHP 8.5 y HTTPS](starters/backend-php/docker-local.es-419.md).

**Estado actualizado:** se implementó el perfil de tokens, permisos y propiedad; consulta [seguridad y preparación para producción](docs/technical/security-production.es-419.md). Las pruebas y limitaciones anteriores a esta revisión son históricas: la API ya no admite acceso anónimo. El [estado para publicación estable](docs/technical/stability-status.es-419.md) registra macOS/iOS como pendiente no bloqueante y MPL-2.0 como licencia adoptada.

Revisión de trabajo posterior a la congelación: `1.1.0-draft.1`  
Estado: publicación técnica `1.1.0` aprobada para su alcance declarado; el árbol de trabajo puede contener registros externos posteriores.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](README.en-US.md)

Licencia del código y la documentación original: [Mozilla Public License 2.0](LICENSE). Consulta el [alcance de licencia](LICENSE-SCOPE.es-419.md) y la [política de marcas](TRADEMARKS.es-419.md).

El proyecto es mantenido por **Zendrhax LLC** bajo la marca **Zendrhax**. Para colaborar, consulta la [guía de contribución](.github/CONTRIBUTING.es-419.md); para informar una vulnerabilidad, sigue la [política de seguridad](.github/SECURITY.es-419.md).

**Empieza aquí:** [cómo utilizar esta base para crear una aplicación](docs/getting-started.es-419.md). Esa guía reúne la utilidad, la selección de componentes, la exportación, la integración por API y la validación final.

Publicación estable: [aprobación técnica 1.1.0](releases/approval-1.1.0.es-419.md), vinculada al paquete y SHA-256 exactos sin reescribir sus bytes.

## Qué contiene

Este proyecto conserva las bases reutilizables. Las aplicaciones finales se crean en ubicaciones separadas a partir de ellas.

| Capa | Contenido | Estado |
| --- | --- | --- |
| Núcleo documental | Fundamentos, diez reglas, flujo de trabajo, perfiles y plantilla de definición. | Publicación `1.0.0` aprobada; paquete intacto. |
| Base web | HTML y CSS; comportamiento JavaScript escrito en TypeScript, con React y Vite; dominio, servicio, memoria, interfaz y pruebas. | Código de referencia en [starter web](starters/web/README.es-419.md); evidencia acotada en el registro técnico. |
| Base web sin framework | HTML, CSS y JavaScript nativos, módulos ES y pruebas sin dependencias de terceros; sin compilación. | [Starter web-vanilla](starters/web-vanilla/README.es-419.md); independiente de React, TypeScript y Vite. |
| Base escritorio/móvil | Flutter con código común y proyectos Windows, macOS, Linux, Android e iOS. | Código de referencia en [starter Flutter](starters/flutter/README.es-419.md); cada destino conserva su estado de verificación. |
| Base Android nativa | Kotlin y Jetpack Compose, independiente de Flutter. | [Starter Kotlin](starters/kotlin-android/README.es-419.md); su alcance es Android. |
| Base backend | API PHP/Laravel con migraciones y perfiles SQLite, PostgreSQL y MySQL. | [Starter PHP](starters/backend-php/README.es-419.md); resultados por motor en su registro. |
| Base backend propia | API TypeScript/Node sin framework de aplicación, con puertos y SQLite local. | [Starter Node](starters/backend-node/README.es-419.md); candidato exportable con límites explícitos. |
| Herramientas | Exportación a destinos nuevos, comprobaciones, CI automática para pull requests y matrices ampliadas bajo ejecución manual. | [Instrucciones de mantenimiento](tools/README.es-419.md); no crea servicios ni publica aplicaciones. |

Las bases ejecutables son puntos de partida reemplazables, no una aplicación comercial ni una arquitectura obligatoria para todos los proyectos. Usar un framework existente es opcional: un proyecto puede adoptar uno, combinar componentes o implementar una arquitectura propia desde cero. En todos los casos debe demostrar sus contratos, límites y funcionamiento con la misma disciplina antes de considerarse una base consolidada. El ejemplo de tareas permite recorrer contratos, validación, estados y pruebas. Los clientes pierden sus datos al terminar su instancia; en web, también con una recarga completa de la página. Las API incorporan persistencia, tokens provisionados y autorización por propietario. Los clientes se conectan mediante sus adaptadores HTTP y el contrato compartido. No incluyen credenciales reales, cuentas humanas completas ni un producto desplegado.

## Empezar por una base

En web se distinguen los fundamentos de las herramientas: HTML para estructura y semántica, CSS para presentación y adaptabilidad, y JavaScript para comportamiento cuando haga falta. `web` usa React, TypeScript y Vite; `web-vanilla` implementa su propia interfaz con HTML/CSS/JavaScript y no necesita esas herramientas. Son plantillas independientes, no dos modos de la misma aplicación. Node sirve para las pruebas y el servidor local de la variante nativa, no como dependencia del código que ejecuta el navegador.

Consultar primero el [alcance técnico](docs/technical/implementation.es-419.md), el [límite API entre clientes y backend](docs/technical/api-boundary.es-419.md) y la [selección de tecnologías y bases de datos](docs/technical/technology-choices.es-419.md), después las instrucciones del starter elegido y su [registro de verificación](docs/technical/verification.es-419.md). La dirección adoptada exige que cualquier cliente con backend remoto use la API como único límite de comunicación y nunca acceda directamente a la base de datos o implementación del servidor. La [integración ejecutable](docs/technical/api-integration.es-419.md) tiene evidencia local acotada; tener archivos de una plataforma no significa que se haya ejecutado allí.

Las seis opciones de `--template` describen el catálogo actual del exportador, no las únicas arquitecturas permitidas. Para otra base propia desde cero se puede partir del núcleo documental y definir una implementación independiente; no es obligatorio seleccionar una plantilla ni usar esta CLI. Esa nueva base requiere sus propias pruebas y registro de verificación.

Para inspeccionar las herramientas sin instalar dependencias de aplicación:

```text
node --version
npm ci --ignore-scripts
npm test
npm run check
node tools/create-project.mjs --help
```

Para crear una copia de evaluación, proporcionar un destino absoluto nuevo cuyo padre exista y esté fuera de este repositorio. Ejemplo en Windows:

```text
node tools/create-project.mjs --template web --name mi-web --destination "D:\proyectos\mi-web"
```

Usar `--template web-vanilla` para HTML/CSS/JavaScript sin framework, `--template flutter` para escritorio/móvil, `--template kotlin-android` para Android nativo, `--template backend-php` para Laravel o `--template backend-node` para una API TypeScript sin framework de aplicación. El exportador copia las instrucciones y bloqueos del starter y la publicación documental aprobada; no instala herramientas, no configura cuentas y no confirma la adopción por el consumidor. Continuar dentro de la nueva carpeta con su README. Los identificadores de distribución nativos siguen siendo ejemplos hasta que el consumidor los configure.

## Núcleo documental aprobado

La [aprobación 1.0.0](releases/approval-1.0.0.es-419.md) vincula la publicación al [paquete conservado](releases/foundation-0.1.0-draft.4.zip) y su SHA-256. El nombre del ZIP mantiene su revisión editorial; el recibo externo establece la aprobación. No se modificó ese paquete para agregar las bases ejecutables.

Lectura del núcleo: [gobernanza](docs/foundation-governance.es-419.md), [reglas](docs/immutable-rules.es-419.md), [fundamentos](docs/programming-fundamentals.es-419.md), [datos y tiempo](docs/data-and-time.es-419.md), [fallos y recursos](docs/failures-and-resources.es-419.md), [aplicabilidad](docs/applicability.es-419.md), [trazabilidad](docs/traceability.es-419.md), [flujo](docs/development-workflow.es-419.md) y [definición de proyecto](templates/project-brief.es-419.md).

Sus encabezados de borrador son la instantánea previa a aprobación. Los controles históricos con inventario fijo se ejecutan sobre una recuperación de aquel ZIP. Para el árbol de trabajo ampliado se usa `npm run check`. Una corrección o nueva publicación requiere una identidad nueva; ningún starter se vuelve estable por heredar la aprobación documental.

## Idiomas, seguridad y alcance

Cada Markdown mantenido tiene archivos separados `.es-419.md` y `.en-US.md`, con significado equivalente. Los códigos, identificadores y originales externos que deben preservarse no se traducen cuando eso los alteraría. Los idiomas del producto son una decisión propia del consumidor; los ejemplos incluyen ambos.

No se incorporan secretos reales, se sobrescriben proyectos existentes ni se modifica una publicación aprobada. Las cachés, compilaciones, capturas y ensayos quedan separados del código fuente. La evidencia indica comando, entorno, resultado y límites; no se infiere soporte de macOS/iOS/Linux desde Windows, ni disponibilidad de producción desde una compilación local.
