# Bases técnicas reutilizables

Revisión técnica: `1.1.0-draft.1`  
Estado: implementación en evaluación; no reemplaza la publicación documental aprobada.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](implementation.en-US.md) · [Inicio](../../README.es-419.md)

## Alcance autorizado

El usuario autorizó construir bases ejecutables y amplió el alcance con Kotlin, backend, bases de datos y una base HTML/CSS/JavaScript sin framework. Las aplicaciones finales se crearán fuera de este proyecto. Se mantienen siete plantillas independientes: [web con React](../../starters/web/README.es-419.md), [web nativa](../../starters/web-vanilla/README.es-419.md), [Flutter para escritorio y móvil](../../starters/flutter/README.es-419.md), [Android nativo Kotlin](../../starters/kotlin-android/README.es-419.md), [API PHP/Laravel](../../starters/backend-php/README.es-419.md), [API TypeScript/Node](../../starters/backend-node/README.es-419.md) y [API Python/FastAPI](../../starters/backend-python/README.es-419.md). No son productos finales ni una obligación de usar estas tecnologías en todos los proyectos. La [comparación de opciones](technology-choices.es-419.md) explica la selección.

La publicación documental `1.0.0`, su ZIP y sus recibos se conservan intactos en `releases`. Su identidad no cambia porque se agregue código. Los documentos históricos describen la instantánea previa a su aprobación; el [recibo](../../releases/approval-1.0.0.es-419.md) establece el estado de esa publicación. Los controles antiguos se repiten sobre su paquete recuperado, no imponiendo su inventario fijo de 32 archivos a esta ampliación.

## Decisiones de arquitectura

- Dominio: datos, invariantes y operaciones puras, sin importar componentes visuales.
- Aplicación: coordina casos de uso contra contratos de repositorio; permite sustituir dependencias para probar fallos.
- Adaptadores: repositorio en memoria e interfaz visual; los límites con almacenamiento o servicios futuros quedan explícitos.
- Composición: el punto de entrada conecta las piezas. El ejemplo de tareas es reemplazable; no es un requisito comercial para consumidores.

Estas responsabilidades no prescriben un framework. La implementación puede usar un framework existente o una arquitectura propia construida por el equipo desde cero, siempre que mantenga límites comprobables y evidencia proporcional al riesgo. Una arquitectura nueva comienza como candidata: no hereda madurez por describir patrones conocidos y se consolida únicamente después de implementar, probar y revisar sus decisiones. Construir la arquitectura propia tampoco exige reimplementar cada protocolo, driver o primitiva sensible; esas dependencias se eligen y aíslan de forma explícita.

La separación es local y proporcional. Los clientes pierden su memoria al terminar su instancia; en web también con una recarga completa de la página. Volver a consultar el repositorio de memoria no elimina sus datos. Los backends agregan persistencia, tokens y autorización; PHP tiene la matriz SQLite/PostgreSQL/MySQL amplia y Node conserva límites documentados. No se incorporaron pagos ni servicios externos.

Se adoptó el [límite API entre clientes y backend](api-boundary.es-419.md): cuando exista un backend remoto, la API será el único límite de comunicación y ninguna interfaz accederá directamente a su base de datos o implementación. Esta decisión desacopla tecnologías internas, no elimina el contrato compartido. La [integración HTTP](api-integration.es-419.md) ya implementa contrato común y adaptadores de cliente, con pruebas locales. La seguridad y operación de producción siguen pendientes del producto.

La guía oficial de [arquitectura Flutter](https://docs.flutter.dev/app-architecture/guide) describe separación de responsabilidades; esta distribución concreta es una elección del proyecto, no una certificación ni la única arquitectura correcta.

## Tecnologías y versiones

Las dos bases web utilizan HTML para estructura y semántica, CSS para presentación y adaptabilidad, y JavaScript para comportamiento. En `starters/web`, la interfaz produce elementos HTML desde `src/ui/App.tsx` y usa CSS propio en `src/ui/styles.css`. El comportamiento se escribe en TypeScript/TSX y se transforma a JavaScript, con React, Vite y Node `24.16.0` como herramientas seleccionadas. Las versiones directas están fijadas y existe `package-lock.json`; el README identifica versiones y procedimientos realmente comprobados. El compilador TypeScript se elige conservadoramente y no se presenta como el más reciente.

`starters/web-vanilla` es la alternativa implementada sin framework: `index.html`, `styles.css` y módulos JavaScript en `src/`. No tiene dependencias npm de terceros ni paso de compilación. Node `24.16.0` es el entorno de referencia para pruebas y servidor de desarrollo; el navegador usa los archivos directamente mediante HTTP. Su servidor local no es un backend de negocio ni una configuración de producción. El HTML conserva información visible sin JavaScript, pero la lista interactiva necesita habilitarlo. Los contratos y pruebas son propios; la evidencia de React no se transfiere automáticamente a esta variante.

Escritorio/móvil utiliza el SDK existente Flutter `3.35.1`, revisión `20f8274939`, y Dart `3.9.0`, con `pubspec.lock`. No se actualizó el SDK global ni se modificaron licencias o cuentas. Esa fijación identifica el entorno probado; no afirma ser la versión más reciente ni promete mantenimiento indefinido. Una actualización futura debe revisar dependencias, requisitos de plataforma y volver a comprobar los destinos afectados.

La elección de Flutter permite mantener reglas e interfaz comunes con proyectos anfitriones separados. La documentación oficial describe [compilación de escritorio](https://docs.flutter.dev/platform-integration/desktop); no convierte un resultado Windows en evidencia de macOS o Linux. Para [compilar iOS se requiere macOS y Xcode](https://docs.flutter.dev/deployment/ios). Las páginas consultadas en 2026-09-02 describen versiones más recientes del SDK; los comandos de esta entrega se juzgan por sus ejecuciones registradas, sin atribuirles compatibilidad universal.

## Preparación y adopción externas

Kotlin y Laravel mantienen versiones y bloqueos propios, sin obligarlos a coincidir con dependencias de Flutter o web. Las herramientas y matrices exactas constan en cada README. PHP usa SQLite para iniciar sin un servidor de base de datos separado; PostgreSQL y MySQL tienen perfiles y pruebas separados. La evidencia de un motor no se transfiere a otro por usar el mismo framework.

El [exportador](../../tools/README.es-419.md) crea un destino nuevo fuera del repositorio y copia código fuente, archivos de bloqueo e instrucciones. Excluye cachés, dependencias instaladas y archivos conocidos de secretos o configuración local por nombre. No es un detector de secretos incrustados en cualquier archivo: el código fuente requiere revisión. Incluye la publicación documental aprobada y un registro de procedencia; no aprueba automáticamente la adopción por el consumidor.

Cada exportación funciona sin importar archivos de esta base. Se repiten instalación, pruebas y, cuando corresponde, compilación desde la copia para detectar dependencias ocultas; `web-vanilla` no tiene paso de compilación. Los identificadores de aplicación, nombre de editor, firma y canales de distribución son ejemplos o decisiones pendientes del consumidor; no se publican paquetes con identidad ajena ni se presentan firmas de depuración como distribución de producción.

## Controles de mantenimiento

Desde la raíz, con Node disponible:

```text
npm ci --ignore-scripts
npm test
npm run check
```

`npm run check` comprueba pares Markdown en ambas direcciones, enlaces locales y la huella del ZIP aprobado; no sustituye revisión semántica ni pruebas de aplicaciones. `npm test` comprueba los controles y el exportador con casos positivos y negativos. El detalle y los resultados de cada plataforma están en [verificación técnica](verification.es-419.md).

La [configuración de CI](../../.github/workflows/technical-bases.yml) se ejecuta automáticamente en pull requests hacia `main`. Comprueba web/mantenimiento, Flutter portátil, Kotlin Android y PHP con SQLite; la matriz Flutter ampliada por sistema se reserva para ejecución manual. MySQL/PostgreSQL y la instrumentación nativa mantienen procedimientos separados y no se atribuyen a esos trabajos. El repositorio público y la publicación técnica `v1.1.0` ya existen. Las acciones se fijan por revisión completa según las [recomendaciones de seguridad de GitHub](https://docs.github.com/en/actions/reference/security/secure-use), con permisos de lectura y sin conservar credenciales de checkout.

Se contrastaron `actions/checkout` v7.0.1, `actions/setup-node` v7.0.0, `actions/setup-java` v6.0.0, `subosito/flutter-action` v2.23.0 y [setup-php](https://github.com/shivammathur/setup-php) 2.37.2 en sus repositorios originales. CI fija npm 11.17.0 expresamente: Node 24.16.0 no trae esa versión de npm por defecto. Los paquetes Android se preparan solo en el runner efímero; no se cambiaron SDKs globales de esta máquina. Java 21 en CI es una línea declarada cuya revisión resuelta se registra con el entorno; las bibliotecas del sistema del runner no son una imagen binariamente congelada. Tener el YAML no equivale a que esas compilaciones hayan pasado.
