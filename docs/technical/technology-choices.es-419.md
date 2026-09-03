# Elegir plataforma, backend y base de datos

Revisión técnica: `1.1.0-draft.1`  
Consulta de fuentes: `2026-09-02`; fundamentos web: `2026-09-03`  
Idioma: español latinoamericano (`es-419`)  
[US English](technology-choices.en-US.md) · [Inicio](../../README.es-419.md)

## Decisión de esta base

No existe un lenguaje, framework o motor universalmente superior. Aquí se eligen combinaciones concretas por ajuste al problema, mantenimiento, herramientas disponibles y evidencia reproducible. La preferencia del consumidor y sus requisitos pueden cambiar la decisión.

Se mantienen seis puntos de partida independientes: [web React/TypeScript](../../starters/web/README.es-419.md), [web HTML/CSS/JavaScript sin framework](../../starters/web-vanilla/README.es-419.md), [Flutter](../../starters/flutter/README.es-419.md), [Android nativo Kotlin](../../starters/kotlin-android/README.es-419.md), [API PHP/Laravel](../../starters/backend-php/README.es-419.md) y [API TypeScript/Node sin framework de aplicación](../../starters/backend-node/README.es-419.md). Mantienen composición independiente y no constituyen un producto completo. El [límite API](api-boundary.es-419.md) y la [arquitectura backend neutral](backend-architecture.es-419.md) evitan atar el diseño a una implementación.

## Framework y arquitectura propia

Un framework no es un requisito para construir correctamente. Es un conjunto de herramientas, convenciones y decisiones ya implementadas que puede reducir trabajo, pero no reemplaza la arquitectura ni garantiza por sí solo la calidad del producto. La arquitectura define responsabilidades, dependencias, contratos, flujo de datos y límites; puede diseñarse e implementarse desde cero para las necesidades del proyecto.

Una base propia debe pasar por el mismo proceso que cualquier dependencia externa: requisitos explícitos, interfaces pequeñas, casos de fallo, pruebas, revisión, mediciones cuando correspondan y evolución controlada. Hasta reunir esa evidencia es una candidata, no una solución consolidada. “Desde cero” describe que el equipo controla su arquitectura; no obliga a reescribir componentes delicados o estandarizados cuando una biblioteca acotada y revisada satisface mejor el requisito.

Laravel es la referencia ejecutable de cobertura amplia, no la arquitectura obligatoria. La base TypeScript/Node demuestra una composición propia sin framework de aplicación y conserva explícitamente los controles que aún le faltan para equivalencia.

## Fundamentos web: HTML, CSS y JavaScript

Las tecnologías de la plataforma web se documentan antes que las herramientas elegidas. HTML y CSS no son frameworks ni cumplen la misma función que un lenguaje de programación general:

| Tecnología | Responsabilidad | Presencia en las bases web |
| --- | --- | --- |
| HTML | Lenguaje de marcado: estructura y significado del contenido, formularios y elementos de interacción. | Documento `index.html` en ambas; React genera parte del contenido desde TSX y `web-vanilla` utiliza HTML declarativo y APIs DOM directamente. |
| CSS | Lenguaje de estilos: presentación, distribución, foco visible y adaptación a distintas anchuras. | CSS propio en `web/src/ui/styles.css` y `web-vanilla/styles.css`, sin framework CSS. |
| JavaScript | Lenguaje de programación: lógica y comportamiento interactivo mediante las APIs del navegador. | `web` transforma TypeScript/TSX; `web-vanilla` ejecuta sus módulos JavaScript directamente, sin compilación. |

Estas funciones se apoyan en el [estándar HTML de WHATWG](https://html.spec.whatwg.org/multipage/introduction.html), la [descripción de CSS del W3C](https://www.w3.org/Style/CSS/Overview.en.html) y el [estándar ECMAScript de Ecma International](https://ecma-international.org/publications-and-standards/standards/ecma-262/). Son referencias, no una afirmación de implementar o verificar todos sus requisitos.

En `web`, TypeScript aporta comprobación estática, React organiza la interfaz y Vite prepara el desarrollo y la compilación. Ninguno reemplaza la semántica HTML ni el comportamiento de CSS. En `web-vanilla`, la composición, estado y actualización del DOM están implementados directamente y se prueban por separado; no se afirma equivalencia con todas las capacidades de React. Una página estática no necesita incorporar JavaScript solo para cumplir este catálogo.

La alternativa `web-vanilla` no depende de React, TypeScript, Vite ni paquetes npm de terceros. Node se usa únicamente para sus herramientas de verificación y servidor local. Elegir entre las dos bases depende del dominio, la complejidad de interfaz y el mantenimiento que asumirá el equipo; ninguna es obligatoria ni universalmente superior. Las pruebas de lógica/componentes y la inspección en navegador registrada no certifican conformidad completa HTML/CSS, accesibilidad integral ni compatibilidad con todos los navegadores. Esos controles se definen y verifican según el producto.

## Flutter y Kotlin no cubren exactamente lo mismo

Flutter permite compartir interfaz y lógica entre plataformas. También puede llamar código Kotlin u otro código nativo mediante [canales de plataforma](https://docs.flutter.dev/platform-integration/platform-channels); por eso no se concluye que una API nativa esté necesariamente fuera de su alcance. Esa integración agrega una frontera que debe mantenerse y probarse.

La base Kotlin usa [Jetpack Compose para Android](https://developer.android.com/compose). Conviene cuando el producto prioriza Android y acceso directo a sus APIs, bibliotecas, ciclo de vida e integración nativa. Es una elección arquitectónica de este proyecto, no un benchmark que demuestre mayor rendimiento para toda aplicación. Esta plantilla no implementa Kotlin Multiplatform, un servidor Kotlin, macOS ni iOS.

## Selección del backend

| Opción | Cuándo conviene | Decisión aquí |
| --- | --- | --- |
| PHP + Laravel | API de negocio con validación, migraciones y convenciones integradas; equipo que mantenga PHP y Composer. | Primera base ejecutable de backend. |
| Arquitectura propia sin framework de aplicación | Requisitos particulares, control directo de dependencias o una base mínima que el equipo pueda mantener y probar. | Starter TypeScript/Node ejecutable; candidato con cobertura pendiente. |
| TypeScript + Fastify | Un lenguaje común con el cliente web y una API modular pequeña. | Alternativa compatible con la arquitectura neutral; no adoptada por el starter actual. |
| TypeScript + Nest | Equipos que quieren módulos e inyección de dependencias más prescriptivos. | Alternativa evaluada; no ejecutada. |
| Python + Django / FastAPI | Administración/modelos de negocio integrados, o API dentro de un ecosistema Python. | Alternativas evaluadas; no ejecutadas. |
| Kotlin/JVM + Ktor / Spring Boot | Equipo o producto que requiera JVM/Kotlin e integraciones de ese ecosistema. | Alternativas evaluadas; distintas del starter Android. |

Laravel se selecciona por sus convenciones integradas y porque PHP `8.5.1`, Composer y drivers locales permiten comprobarlo en este entorno. Su documentación describe [soporte y versiones](https://laravel.com/framework/docs/13.x/releases#support-policy) y [conexiones de base de datos](https://laravel.com/framework/docs/13.x/database#introduction). Eso no certifica nuestra implementación: las ejecuciones concretas se registran por separado.

Fastify permite [inyección HTTP para pruebas](https://fastify.dev/docs/latest/Guides/Testing/), pero su [integración de persistencia](https://fastify.dev/docs/latest/Guides/Database/) sigue siendo una decisión del proyecto. Nest proporciona [estructura modular](https://docs.nestjs.com/). Django ofrece [modelos y administración integrados](https://docs.djangoproject.com/en/6.0/intro/overview/); FastAPI describe [tipado y OpenAPI](https://fastapi.tiangolo.com/features/). Ktor documenta [persistencia con Exposed](https://ktor.io/docs/server-integrate-database.html), y Spring publica [sus requisitos propios](https://docs.spring.io/spring-boot/system-requirements.html). Estas fuentes sustentan diferencias funcionales, no comparaciones de costo o velocidad medidas aquí.

## Selección de base de datos

| Motor | Uso recomendado en esta base | Límite que no debe ocultarse |
| --- | --- | --- |
| PostgreSQL | Primera opción a evaluar para un servicio multiusuario nuevo cuando pueda operarse correctamente. | Requiere servidor, driver, administración, respaldos y pruebas propias. |
| MySQL / InnoDB | Alternativa cuando ya hay experiencia, operación o requisitos MySQL. | No es intercambiable con PostgreSQL sin verificar consultas, tipos y semántica. |
| SQLite | Inicio local sin servidor, almacenamiento embebido y productos cuyo patrón de escritura encaje. | Un escritor simultáneo por archivo; no representa las condiciones de un servidor multiusuario. |

La recomendación de PostgreSQL es una decisión de ingeniería, apoyada en su [modelo de concurrencia MVCC](https://www.postgresql.org/docs/current/mvcc-intro.html), no una afirmación de superioridad universal. MySQL [InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html) también ofrece transacciones y bloqueo por fila. SQLite documenta [usos apropiados y límites de concurrencia](https://sqlite.org/whentouse.html); no es exclusivamente una herramienta de pruebas.

SQLite es el arranque local de la API para evitar exigir un servicio adicional. Los perfiles PostgreSQL/MySQL deben probarse contra sus motores reales. Elegir el mismo ORM no elimina diferencias de collation, unicidad, Unicode, fechas, decimales, bloqueos o migraciones. Solo se afirma lo cubierto por el ejemplo y por el [registro de verificación](verification.es-419.md).

## Antes de adoptar una combinación

Definir datos y concurrencia esperada, objetivos de respuesta, mantenimiento, licencias, despliegue, versiones soportadas y habilidades del equipo. Medir con una carga representativa antes de justificar decisiones de rendimiento. Agregar autenticación, autorización, cifrado, respaldos y recuperación según el producto; no inferirlos de un ejemplo CRUD.

Mantener versiones y bloqueos, repetir instalación y pruebas desde una copia independiente y revisar ambos idiomas al cambiar una decisión. La aprobación documental histórica no aprueba automáticamente estos starters ni un futuro producto.
