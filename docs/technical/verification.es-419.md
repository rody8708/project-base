# Verificación de las bases ejecutables

**Estado actualizado:** se implementó el perfil de tokens, permisos y propiedad; consulta [seguridad y preparación para producción](security-production.es-419.md). Las pruebas y limitaciones anteriores a esta revisión son históricas: la API ya no admite acceso anónimo. La aprobación de producción sigue pendiente.

Revisión técnica: `1.1.0-draft.1`  
Evidencia inicial: `2026-09-02`; ampliación web nativa y decisión de límite API: `2026-09-03`, zona America/New_York  
Estado: evidencia técnica local; no aprobación de producción ni nueva aprobación documental.  
[US English](verification.en-US.md) · [Inicio](../../README.es-419.md) · [Decisiones](technology-choices.es-419.md)

## Ampliación de integración HTTP

La [integración ejecutable](api-integration.es-419.md) agrega contrato compartido, adaptadores de los cuatro clientes y pruebas contra backend real. Las secciones siguientes conservan evidencia anterior a esa ampliación: sus conteos y hashes de copias son históricos, no inventarios de la fuente actual.

## Alcance de la evidencia

Las pruebas corresponden a estos ejemplos y herramientas, no a futuros productos. Se separan pruebas de dominio/componentes, ejecución real, compilación y funcionamiento de copias externas. Una prueba repetida no se cuenta como un caso distinto. La ampliación del 3 de septiembre agrega `web-vanilla` y repite los controles de mantenimiento; no presenta las pruebas anteriores de React, Flutter, Kotlin o PHP como nuevas ejecuciones.

| Base o control | Resultado registrado |
| --- | --- |
| Web | Instalación desde bloqueo, tipos estrictos, 41 pruebas, build y auditoría npm sin avisos reportados. |
| Web en navegador real | Flujo interactivo satisfactorio en Edge 151, sobre la compilación local y una copia externa. |
| Web sin framework | HTML/CSS/JavaScript sin build ni dependencias npm de terceros; 74 pruebas y flujo real en Edge 151 satisfactorios. |
| Flutter compartido | Preflight, formato de 16 archivos sin cambios, análisis y 27 pruebas satisfactorios. |
| Flutter Windows x64 | Compilación Release, un flujo de integración nativa y prueba de arranque/cierre del paquete portátil. |
| Flutter Android | APK debug normal y un flujo de integración en emulador API 35/x86_64, después de fijar AGP y lock de aplicación. |
| Kotlin Android | 21 pruebas JVM, tres flujos instrumentados en Android API 35, lint limpio y APK debug generado. |
| PHP con SQLite/PostgreSQL/MySQL | Matriz final: 51 pruebas y 186 aserciones por motor, sin fallas ni advertencias. HTTP real comprobado también desde una copia externa. |
| Herramientas de mantenimiento | 44 pruebas el 3 de septiembre: seis del verificador documental y 38 del exportador, sin fallas ni omisiones. El registro inicial tenía 37. |
| CI | YAML analizado y revisado; no ejecutado en GitHub. |

Los detalles, fuentes, versiones y límites están en los registros [web](../../starters/web/docs/verification.es-419.md), [web sin framework](../../starters/web-vanilla/docs/verification.es-419.md), [Flutter](../../starters/flutter/docs/verification.es-419.md), [Kotlin](../../starters/kotlin-android/docs/verification.es-419.md) y [PHP](../../starters/backend-php/verification.es-419.md).

## Navegador y copias independientes

Para la base React del registro inicial se utilizó Playwright CLI con una sesión propia de Edge headless. Se comprobó lista vacía, título inválido y de 81 puntos de código, agregar con botón y Enter, completar/reabrir, cambio de idioma conservando tareas, texto HTML mostrado literalmente y descarte de memoria al recargar la página. Las anchuras observadas de contenido coincidieron con el viewport de 320 y 390 píxeles; se inspeccionaron capturas de escritorio y móvil. Esto no certifica accesibilidad completa ni todos los navegadores.

Se detectó una petición de favicon inexistente y se corrigió. La sesión nueva sobre la copia exportada registró cero errores/advertencias de consola y ocho solicitudes estáticas locales con estado 200, incluida la recarga. Capturas y snapshots locales están bajo `output/playwright/technical-web`; son evidencia auxiliar, no dependencias de la plantilla. Los servidores y sesiones de navegador usados para QA se cerraron.

Las copias se crearon con el exportador en destinos nuevos fuera de esta base, sin mover ni sobrescribir proyectos existentes:

| Copia | Comandos y resultado |
| --- | --- |
| Web | `npm ci` y `npm run check`: PASS. Copia final repetida con `npx --yes npm@11.17.0 ci` y `npx --yes npm@11.17.0 run check`: PASS, 41 pruebas y build. |
| Web sin framework, 3 de septiembre | `npm ci --ignore-scripts` y `npm run check`: PASS, 74 pruebas, 15 archivos JavaScript y 52 claves por idioma. Flujo real en Edge con el servidor de origen apagado: PASS; no hay build. |
| Flutter | `dart tool/check_toolchain.dart`, `flutter pub get --enforce-lockfile`, `flutter analyze`, `flutter test`, `flutter build windows --release`, `flutter build apk --debug`: PASS desde una copia externa. |
| Kotlin | Wrapper estricto con `:core:test :app:testDebugUnitTest :app:lintDebug :app:assembleDebug`: PASS, 21 pruebas y APK desde la copia final. |
| PHP | Instalación Composer desde lock sin plugins/scripts, validación estricta, requisitos, sintaxis de 37 archivos, 51 pruebas/186 aserciones y auditoría: PASS. Configuración local, dos migraciones y nueve escenarios HTTP reales: PASS. |

Una primera copia Flutter en la carpeta temporal de Windows compiló, pero MSBuild advirtió sobre builds incrementales bajo Temp. Se repitió en un destino nuevo externo que no está bajo Temp: Windows Release y Android debug compilaron sin esa advertencia. Los avisos de versiones más nuevas de paquetes Flutter no se ocultaron ni se resolvieron con un upgrade automático.

Kotlin se comprobó primero con una caché Gradle nueva. La revisión posterior corrigió una escritura confirmada que podía quedar oculta si fallaba la lectura siguiente; dos regresiones cubren agregar y alternar. Después se exportó de nuevo y se repitieron las 21 pruebas, lint y compilación desde la copia final, reutilizando solamente aquella caché de dependencias externa, sin importar fuente de la base maestra. Los tres flujos instrumentados se repitieron sobre la fuente corregida; el emulador propio se cerró.

La copia PHP creó su propia configuración y SQLite, sin copiar datos ni claves de la fuente. El ensayo HTTP cubrió salud, lista vacía, validación en español, creación, actualización, conflicto de versión, `405` con `Allow`, eliminación y `404` en español. Las filas sintéticas se retiraron y el servidor propio se detuvo. El helper local bajo `output/verification` es evidencia auxiliar, no dependencia de la plantilla. Se conservan las copias de evaluación y sus cachés locales para inspección.

Inventarios de fuentes incluidas en las copias finales conocidas:

| Plantilla | Archivos fuente | SHA-256 del inventario |
| --- | ---: | --- |
| Web | 27 | `d32808f89e0675a1da6254da407d69566444f6e7d8d9862aec2aaae52f9a25b9` |
| Web sin framework | 29 | `0e85f0d60bd267830e8566419b96e9f7d71af68c7a44fae06103bf158abb1469` |
| Flutter | 148 | `b3ff67ae2fffa3a601bdba49418348459ee1fc22c4652bb39ead6b8e445cf808` |
| Kotlin Android | 37 | `31e6bbafd775ae7e90e7816742c65053e425d1c3f0beb5ddc725b98d2ada95db` |
| PHP | 54 | `6c12e2c114861c61ce77d0a86ebc83662c87b1059f77dc695a5d7af33c51dc9f` |

Estos valores proceden de `foundation/adoption.json`. Identifican la fuente incluida y sus hashes, no una firma digital ni binarios reproducibles. La exportación incluye otros cinco archivos de procedencia. Su recibo conserva el estado de preparación inicial; las pruebas posteriores no cambian silenciosamente la adopción del consumidor.

## Ampliación web nativa del 3 de septiembre

La nueva plantilla `web-vanilla` usa HTML, CSS y módulos ES sin React, TypeScript, Vite, paquetes npm de terceros ni paso de compilación. Se ejecutaron `npm ci --ignore-scripts` y `npm run check` con Node `24.16.0` y npm `11.17.0` en Windows: PASS. El control revisó 15 archivos JavaScript y 52 claves por idioma; aprobó 74 casos: 18 de dominio/servicio/repositorio, 14 de controlador/idiomas, 32 de servidor/CLI y 10 del comprobador. No hubo casos fallidos, cancelados u omitidos.

Playwright CLI condujo sesiones propias de Edge headless 151. Se observaron lista vacía, validación vacía y de 81 puntos de código, aceptación de 80, agregar con botón/Enter, completar y reabrir con Espacio conservando el foco, texto HTML literal sin nodos inyectados, idioma es-419/en-US sin alterar tareas o borrador, recarga de lista que conserva datos y recarga completa que los descarta. Se inspeccionaron capturas de escritorio `1280 × 900` y móvil `390 × 844`; el contenido tampoco desbordó horizontalmente el viewport `320 × 800`. Una sesión con JavaScript deshabilitado conservó el contenido y mostró el aviso `noscript`, con controles inactivos. Esto no es una auditoría completa de accesibilidad ni una matriz de navegadores.

La sesión de fuente registró 22 solicitudes estáticas locales con estado `200` entre dos cargas y cero errores/advertencias de consola. El servidor se reinició tras las correcciones de código porque sirve una instantánea tomada al arrancar. Capturas y snapshots se conservan bajo `output/playwright/web-vanilla`, separados de la plantilla. Los fallos de dependencias, resultados malformados y callbacks de render tienen pruebas automatizadas; no se simularon todos esos fallos en el navegador.

La revisión final agregó regresiones para IDs con terminadores de línea y arreglos dispersos, que ahora se rechazan, y para errores de render antes/después de una escritura. Después se exportaron 29 archivos fuente y cinco de procedencia a una carpeta externa nueva, con nombre npm `foundation-vanilla-check`. Su lock SHA-256 es `a7a9f6b22d087e592734098bcd3195a9d7f68b1c9b86d331cadf9a6d7b176321`; solo cambia la identidad npm respecto del lock fuente. La copia pasó instalación y las 74 pruebas sin importar archivos de esta base.

Con el servidor de origen detenido se inició la copia en `127.0.0.1:5181` y una sesión nueva de Edge. Se repitieron validación vacía, agregar por botón/Enter, completar/reabrir con foco, idioma conservando dos tareas y borrador, texto literal, recarga de lista y descarte al recargar la página. Se inspeccionaron capturas de escritorio/móvil y ausencia de desborde a 320 y 390 píxeles. Las 22 solicitudes entre dos cargas fueron locales y respondieron `200`; la consola tuvo cero errores/advertencias. Se cerraron los dos servidores propios y las tres sesiones de navegador; las copias y capturas quedan para inspección. Tres fixtures sintéticos iniciales permanecieron en Temp al rechazarse su limpieza manual; no tienen procesos activos. Las ejecuciones corregidas limpian sus propios fixtures.

## Backend y datos

La matriz usó PHP `8.5.1`, SQLite `3.49.2`, PostgreSQL `18.6` y MySQL `8.4.11`. Los dos servidores fueron contenedores propios, con imágenes oficiales fijadas por digest, puertos loopback `15432` y `13306`, datos desechables y credenciales sintéticas. No se utilizó la instancia MySQL del usuario en `3306`.

Se comprobaron HTTP/validación, persistencia tras reconexión, Unicode y texto semejante a SQL, restricciones, commit/rollback, migración con datos existentes y rechazo de versiones desactualizadas. Esto no equivale a una prueba de carga concurrente, backups/restauración ni compatibilidad de cualquier consulta, collation, tipo o extensión futura. La configuración de pruebas rechaza destinos no identificados expresamente como aislados.

La matriz final identificada como `10eac014a09550ea` repitió la misma suite de 51 casos en los tres motores; parte de ellos son de dominio/helpers, no SQL. Se corrigieron el cierre de conexiones SQLite, la carga duplicada de una extensión PHP y el tratamiento de stderr. Si no puede comprobar propiedad o limpieza de un contenedor, el helper ahora informa fallo sin borrar un destino no verificado. Ocho casos unitarios cubren esas decisiones; no se provocó una caída real de Docker.

Los contenedores de esa ejecución se retiraron tras comprobar su identidad y los datos tmpfs se descartaron; no eran datos de usuario. Las imágenes descargadas permanecen en la caché local. Los resultados detallados y mecanismos para repetir la matriz están en el registro PHP.

## Decisión de límite API

Se documentó el [límite API entre clientes y backend](api-boundary.es-419.md) como dirección adoptada para proyectos con backend remoto. La revisión comprobó que distingue el contrato público de las implementaciones internas, prohíbe acceso directo de clientes a persistencia y enumera la puerta de implementación. Esta es evidencia documental, no evidencia de una conexión: en ese momento no había contrato OpenAPI compartido, adaptadores HTTP de cliente ni pruebas de extremo a extremo entre los starters.

## Persistencia independiente y nueva ejecución local

Se agregó la [decisión de persistencia independiente del lenguaje y framework](persistence-boundary.es-419.md). La inspección confirmó que `TaskService` consume `TaskRepository` y que el adaptador SQL concentra el acceso al motor; no se modificó código de los starters ni se construyó un backend propio adicional.

Se repitió `php -d extension=pdo_pgsql scripts/qa-databases.php --wsl-docker` del `2026-09-03T18:35:34Z` al `2026-09-03T18:36:19Z`: PASS. El reporte local `starters/backend-php/.validation/5ffcc7687240e5c5/report.json` registra PHP `8.5.1` en Windows y Docker `29.1.3` en WSL. SQLite `3.49.2`, PostgreSQL `18.6` y MySQL `8.4.11` aprobaron la misma suite de 51 pruebas y 186 aserciones por motor, sin advertencias. Incluye API mediante el cliente de pruebas de Laravel y persistencia real; no es una conexión desde los frontends ni un nuevo ensayo HTTP de red.

Se verificó la retirada de los dos contenedores propios y sus datos efímeros; no se tocaron bases del usuario. Los reportes y las imágenes en caché se conservaron. No se ensayó transferencia de datos entre motores, carga concurrente ni recuperación ante caída real; la nueva ejecución conserva esos límites.

## Backend Python/FastAPI candidato

El 4 de septiembre de 2026 se ejecutó la plantilla `1.2.0-draft.1` en Windows con Python `3.13.6` y uv `0.12.4`. `uv sync --locked --all-extras`, Ruff, mypy estricto y 15 pruebas pytest finalizaron correctamente. Las pruebas usan archivos SQLite temporales y cubren migración/reversión, autenticación, revocación, permisos, aislamiento por propietario, CRUD, conflicto de versión, paginación y errores HTTP seguros.

También se exportó una solución `api-only` nueva mediante el asistente. Sus comandos de raíz `doctor`, `setup` y `check` finalizaron correctamente, Uvicorn respondió `200` con `{"status":"ok","scope":"liveness"}` en loopback y el directorio temporal se eliminó al terminar. Esta evidencia no incluye PostgreSQL, MySQL, TLS, carga, respaldo/restauración ni despliegue real; esos puntos permanecen pendientes para el producto que adopte esta candidata.

La primera ejecución de CI detectó una opción `cache: false` no admitida por `setup-python`; se eliminó en vez de omitir el fallo. La misma ejecución advirtió que el pin histórico Composer `2.9.5` era vulnerable a divulgación de tokens en registros de GitHub Actions; el perfil CI se elevó a la versión corregida `2.9.8`. Esta actualización no reescribe la evidencia histórica generada anteriormente con `2.9.5`.

## Ampliación de la matriz Python — 4 de septiembre de 2026

Cambio sobre `0192d46` (PR #25), rama `test/python-database-matrix`. Windows, Python `3.13.6`, uv `0.12.4`, Docker en WSL `Ubuntu-24.04`; PostgreSQL `18.6-bookworm` y MySQL `8.4.11`. Desde `starters/backend-python` se ejecutó `uv run pytest -W error --tb=short --live-http` y se repitió agregando `--database-engine=postgresql --docker-wsl=Ubuntu-24.04` y `--database-engine=mysql --docker-wsl=Ubuntu-24.04`: **18 pruebas aprobadas por motor**. Ruff y mypy estricto también aprobaron.

La primera prueba MySQL falló por falta de soporte RSA del driver; se agregó el extra bloqueado `pymysql[rsa]`. Después, la regresión `test_owner_isolation[USER-1]` demostró acceso indebido al listado de `user-1` por la comparación de texto sin distinguir mayúsculas de MySQL. La comparación binaria dentro del adaptador corrigió la causa sin cambiar el contrato ni el esquema. La misma regresión ahora verifica listado vacío, GET/PUT/DELETE ajenos con 404 y conservación del registro original. Se verificaron además permisos de solo lectura (403), tokens expirados (401), CRUD, conflictos, revocación y migración/reversión/reaplicación. La cobertura explícita de permisos y expiración se agrega en esta ampliación; no estaba demostrada por las 15 pruebas del registro anterior.

Los recorridos HTTP usan Uvicorn en puertos efímeros y verifican respuestas y estado persistido con datos sintéticos. No leen `.env` ni aceptan bases existentes. Se confirmó que no quedaron contenedores con la etiqueta `project-base=python-test`; se retiraron sus datos efímeros y se conservaron imágenes en caché. La CI incorpora la misma matriz de tres motores. TLS, carga concurrente, respaldo/restauración y aprobación de producción **siguen pendientes para Python**; la evidencia PHP no sustituye esos ensayos.

## Integridad documental y límites

### Ampliación Node para 1.2.0

El laboratorio Node ejecuta HTTPS con confianza y nombre verificados, rechazo de certificados vencidos/no confiables, matriz negativa API, escritura concurrente y límites compartidos entre dos servidores. En Windows con Node 24.16.0, SQLite 3.53.0 y Docker/WSL, SQLite, PostgreSQL 18.6 y MySQL 8.4.11 aprobaron respaldo/restauración nativos y uso HTTPS del destino; se verificaron esquema, Unicode, versiones y revocación de todos los tokens restaurados. El [laboratorio Node](../../starters/backend-node/operations-lab.es-419.md) conserva comandos, aislamiento y límites.

Pasaron nueve pruebas rápidas Node, 73 pruebas de mantenimiento, controles documentales/arquitectónicos e integración cruzada con React y web nativa. Una solución api-only exportada fuera del repositorio aprobó doctor/setup/check y el arranque del servidor. Sus archivos temporales son sintéticos; no se utilizaron configuraciones ni bases del usuario. Los contenedores del laboratorio se retiraron; las imágenes y dependencias descargadas permanecen en caché. La publicación propuesta 1.2.0 requiere aún conservación, recuperación y aprobación exacta; la evidencia no aprueba producción ni plataformas Apple.

### Ensayos operativos Python posteriores a PR #27

Actualización posterior a `bf225bf`: el laboratorio reprodujo un timeout dentro de `commit` y dos bloqueos controlados. Se aplicaron WAL con `FULL`, un mínimo SQLite corregido y ejecución de persistencia fuera del bucle HTTP. Python administrado 3.13.15/SQLite 3.53.1, 31 pruebas por motor y 100 recuperaciones fragmentadas aprobaron. La evidencia y distinción entre los bloqueos corregidos y el episodio histórico sin traza constan en la sección «Corrección de bloqueos reproducidos» del laboratorio; los párrafos siguientes conservan el estado histórico anterior.

El [laboratorio operativo Python](../../starters/backend-python/operations-lab.es-419.md) registra comandos, entorno, limpieza y límites de HTTPS, concurrencia y respaldo/restauración nativos. Sobre `60176b3`, la rama `test/python-operational-lab` aprobó 25 pruebas por motor (SQLite/PostgreSQL/MySQL), Ruff y mypy. La regresión del contador reprodujo 12 admisiones con máximo cinco; la actualización condicional atómica la corrigió. La incidencia intermitente `PY-LAB-001` permanece abierta y documentada, sin alterar el timeout. No se declara aprobación de producción ni se cambia la evidencia histórica anterior.

Antes de integrar esta ampliación, la alerta `GHSA-6w46-j5rx-g56g` de GitHub identificó manejo vulnerable de temporales en pytest. Se actualizó el pin y lockfile de `8.4.1` a la versión corregida `9.0.3` y se repitieron las 18 pruebas en cada motor, Ruff y mypy. No se intentó explotar la vulnerabilidad ni se afirma haberla reproducido localmente; la actualización responde al aviso del proveedor. La revisión final de este cambio y sus resultados CI quedan asociados al PR #27.

El ZIP histórico aprobado conserva SHA-256 `9ecfbba67604bf27dcfd4812a592f7b5066aba7b1ac58bcb58dbe6c20685fd1a`. También se verificaron sus dos recibos y su JSON histórico contra los cuatro pins del exportador. Ninguno de esos artefactos fue reescrito.

Para el árbol anterior a la integración HTTP se ejecutaron `npm ci --ignore-scripts`, `npm test` y `npm run check`: PASS; 44 pruebas y 76 documentos en 38 pares, con 656 enlaces locales comprobados. Antes de agregar la decisión de límite API, el árbol tenía 72 documentos/36 pares y 628 enlaces; el registro inicial anterior a la ampliación web nativa tenía 37 pruebas, 66 documentos/33 pares y 582 enlaces. El último control revisa pares Markdown, enlaces locales, títulos y hash del ZIP; no interpreta toda la semántica de Markdown ni certifica equivalencia de traducciones. La revisión de contenido entre idiomas complementa ese control. El 3 de septiembre se compararon los hashes de fuente/copia de los cinco inventarios y los cuatro artefactos aprobados en cada copia: PASS; las cuatro plantillas anteriores no cambiaron.

macOS, iOS y Linux tienen runners Flutter generados, pero siguen sin compilación/ejecución nativa verificada. En WSL se confirmó que faltan Flutter, clang, CMake, Ninja y GTK de desarrollo; no se instaló una toolchain global para aparentar esa cobertura. iOS/macOS requieren un entorno Apple adecuado. Tampoco se afirman pruebas en dispositivos físicos, firma de producción, publicación, seguridad exhaustiva ni operación de producción de clientes conectados a la API.

Este párrafo registra la inspección anterior a publicar el repositorio: la CI era exclusivamente manual, no existía remoto y todavía no se habían disparado trabajos. Desde la publicación, el YAML ejecuta automáticamente en pull requests web/mantenimiento, Flutter portátil, Kotlin Android, PHP/SQLite y Python con SQLite/PostgreSQL/MySQL; la matriz Flutter ampliada sigue siendo manual. Los resultados actuales pertenecen a cada ejecución de GitHub y no reescriben la evidencia histórica de esta sección.
