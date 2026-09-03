# Verificación y selección técnica

Revisión técnica: `1.1.0-draft.1`. Estado: candidata; evidencia de desarrollo local, no aprobación de producto.

[English (US)](verification.en-US.md) · [Inicio](../README.es-419.md) · [Arquitectura](architecture.es-419.md)

## Controles reproducibles

Ejecuta los comandos del README desde la copia independiente, con JDK 21 y los paquetes SDK indicados. `:core:test` prueba dominio, aplicación y memoria; `:app:testDebugUnitTest` prueba el ViewModel; `:app:lintDebug` analiza código y recursos; `:app:assembleDebug` produce un APK real. No son sustitutos entre sí. Para forzar otra ejecución de las tareas, agrega `--rerun-tasks`; no agregues opciones para regenerar confianza a una comprobación normal.

Para UI, prepara un dispositivo o AVD de pruebas API 26 o superior, consulta `adb devices -l` y selecciona explícitamente su serial. En PowerShell, por ejemplo, asigna `$env:ANDROID_SERIAL = 'SERIAL'` en una terminal dedicada y ejecuta:

```powershell
.\gradlew.bat --no-daemon :app:connectedDebugAndroidTest
```

En un shell POSIX: `ANDROID_SERIAL=SERIAL sh ./gradlew --no-daemon :app:connectedDebugAndroidTest`. Sustituye `SERIAL` por el valor comprobado. La instrumentación instala temporalmente las aplicaciones debug/de prueba y puede retirarlas al terminar. No uses dispositivos ajenos, datos que necesites conservar ni una sesión de otro proyecto. Los reportes generados quedan en `core/build/test-results/test`, `app/build/test-results/testDebugUnitTest`, `app/build/reports/lint-results-debug.html` y `app/build/outputs/androidTest-results/connected/debug`; no son entradas de la plantilla portátil.

## Evidencia ejecutada

Ejecución local: 2026-09-02, America/New_York; reporte instrumentado con marca UTC `2026-09-03T01:59:06`. Host Windows 11 x64, JDK JetBrains 21.0.5, Gradle 8.13, SDK 36 y Build Tools 35.0.0 ya instalados. No se actualizó el SDK ni se instalaron herramientas globales. El uso de ese JDK disponible no declara que su parche sea el más reciente ni sustituye una revisión de seguridad antes de adopción.

| Control | Resultado observado |
| --- | --- |
| Dominio, servicio y adaptador, JVM | 15 pruebas; 0 fallos, errores u omitidas |
| ViewModel, JVM | 6 pruebas; 0 fallos, errores u omitidas |
| Lint debug | `No issues found`; advertencias como errores, salvo el detector de novedades documentado |
| Compilación debug | APK generado; compile/target 36, mínimo 26, ID debug comprobado |
| UI instrumentada | 3 pruebas, 0 fallos, errores u omitidas; Android 15/API 35, emulador x86_64 |
| Recursos propios | 26 claves por idioma, sin claves distintas |
| Arranque del APK | Instalación y arranque en frío correctos; captura inicial inspeccionada |

Las pruebas locales incluyen títulos vacíos/tipos erróneos/controles/UTF-16 inválido, extremos de 80/81 puntos de código con emoji, ID y tiempo en frontera, constructor/copy, orden, snapshots, instancias independientes, duplicados, faltantes, fallos de dependencias y ausencia de reintentos. Dos hilos aplican 100 alternancias cada uno para comprobar la actualización atómica de esta instancia de memoria.

Dos regresiones del ViewModel simulan escrituras exitosas y fallos en todas las lecturas posteriores: agregar y alternar reflejan el valor confirmado sin releer; una recarga manual fallida conserva ese valor. El total es de 21 pruebas JVM. Se corrigió la dependencia previa de una segunda lectura que podía ocultar una escritura confirmada; luego se repitieron también lint, APK y las tres pruebas instrumentadas.

Los tres flujos Android cubren vacío y validación, agregar mediante acción del teclado, completar/reabrir, cambio de idioma sin modificar la tarea, 81 puntos de código, HTML mostrado literalmente, recreación de actividad que conserva estado y mensaje de error de un repositorio simulado. Los errores iniciales de importación/asserts del propio test se corrigieron; las aserciones finales se ejecutaron, no se omitieron. La repetición final combinó pruebas, lint, build e instrumentación sin `--write-locks` ni `--write-verification-metadata`.

APK observado: 11428951 bytes, SHA-256 `c357d1ebc4e52f6999f0c7655cdfdb46c25eb01c576ff2bd650ef18c16e11f53`. Es la identidad de ese archivo de desarrollo, no una promesa de builds idénticos en otra máquina: la firma debug, herramientas y otros insumos pueden cambiar los bytes. La inspección encontró cinco avisos `LICENSE.txt` de AndroidX dentro del APK. La configuración preserva/fusiona también los nombres comunes LICENSE/NOTICE y AL2.0/LGPL2.1 si aparecen; no afirma que todo artefacto incluya cada nombre ni que esos cinco avisos sean un inventario legal completo.

## Wrapper, locks y confianza

Antes de ejecutar scripts de una copia nueva, revisa su origen y calcula el hash del JAR: `Get-FileHash gradle/wrapper/gradle-wrapper.jar -Algorithm SHA256` en PowerShell, `sha256sum gradle/wrapper/gradle-wrapper.jar` en Linux o `shasum -a 256 gradle/wrapper/gradle-wrapper.jar` en macOS. Compáralo con el valor registrado y la [referencia oficial de Gradle](https://gradle.org/release-checksums/).

| Insumo | SHA-256 esperado |
| --- | --- |
| Wrapper JAR 8.13 | `81a82aaea5abcc8ff68b3dfcb58b3c3c429378efd98e7433460610fecd7ae45f` |
| Distribución `gradle-8.13-bin.zip` | `20f1b1176237254a6fc204d8434196fa11a4cfb387567519c61556e8710aed78` |

Los scripts, JAR y [licencia conservada](../GRADLE-LICENSE.txt) proceden del tag oficial [Gradle v8.13.0](https://github.com/gradle/gradle/tree/v8.13.0); el JAR se comparó con su checksum publicado. `distributionSha256Sum` comprueba el ZIP al descargarlo. Conserva `core/gradle.lockfile`, `app/gradle.lockfile`, `gradle/verification-metadata.xml` y los cuatro archivos del wrapper; no copies caches, SDK, `local.properties`, resultados ni claves.

Los locks fijan versiones para configuraciones resueltas; los metadatos SHA-256 detectan bytes diferentes de los registrados, incluidos metadatos de publicación. Se generaron inicialmente desde repositorios oficiales por HTTPS: es confianza inicial, no validación independiente de cada proveedor. No se verificaron firmas PGP ni se ejecutó un escáner completo de vulnerabilidades. La [guía de Gradle](https://docs.gradle.org/current/userguide/dependency_verification.html) advierte del límite de generar hashes desde las mismas descargas.

Además del aapt2 Windows ejecutado, se descargaron y calcularon hashes de los artefactos oficiales [Linux](https://dl.google.com/dl/android/maven2/com/android/tools/build/aapt2/8.13.2-14304508/aapt2-8.13.2-14304508-linux.jar) y [macOS](https://dl.google.com/dl/android/maven2/com/android/tools/build/aapt2/8.13.2-14304508/aapt2-8.13.2-14304508-osx.jar) `8.13.2-14304508`, registrados en metadatos para su resolución en otros hosts. No se ejecutaron esos binarios ni una CI remota. Si otro comando/host requiere nuevos metadatos, detente y revisa su procedencia; no desactives la comprobación.

Para una actualización intencional, revisa primero la compatibilidad y procedencia, cambia versiones exactas en una rama, regenera únicamente las configuraciones necesarias con `--write-locks --write-verification-metadata sha256`, revisa los diffs y repite los comandos ordinarios sin esas opciones. No conviertas esa regeneración en una reparación automática. Un build release futuro requiere su propia resolución, controles, firma y evidencia.

## Fuentes primarias y límites

Consulta: 2026-09-02. Las páginas vivas pueden cambiar; esta selección conserva números, apartados y hashes concretos, no promete disponibilidad externa eterna. La documentación fundamenta herramientas y mecanismos, no certifica el producto ni impone esta arquitectura a otros lenguajes.

- [Kotlin releases](https://kotlinlang.org/docs/releases.html): entrada 2.3.10, 2026-02-05; [compatibilidad KGP](https://kotlinlang.org/docs/gradle-configure-project.html), fila 2.3.10. Selección dentro de rangos Gradle/AGP, no elección de una versión universal.
- [AGP 8.13](https://developer.android.com/build/releases/agp-8-13-0-release-notes?hl=en): tabla de compatibilidad y cambios 8.13.2, incluido soporte Kotlin 2.3 de R8. [Matriz Gradle/Java](https://docs.gradle.org/current/userguide/compatibility.html): Java 21; ejecución local específica con Gradle 8.13.
- [POM Compose BOM 2026.02.01](https://dl.google.com/dl/android/maven2/androidx/compose/compose-bom/2026.02.01/compose-bom-2026.02.01.pom): versiones mapeadas; [plugin Compose](https://developer.android.com/develop/ui/compose/setup-compose-dependencies-and-compiler): configuración con Kotlin 2.x. No se copió un proyecto externo.
- [Activity](https://developer.android.com/jetpack/androidx/releases/activity), entrada 1.11.0, 2025-09-10; [Lifecycle](https://developer.android.com/jetpack/androidx/releases/lifecycle), entrada 2.9.4, 2025-09-17; [AndroidX Test](https://developer.android.com/jetpack/androidx/releases/test), runner 1.7.0 y ext JUnit 1.3.0. No se adoptan previews.
- [Recursos Android](https://developer.android.com/guide/topics/resources/providing-resources): recursos predeterminados y calificadores BCP 47; [cambio de idioma en bundles](https://developer.android.com/guide/app-bundle/configure-base#handling_language_changes): conservar recursos; [Auto Backup](https://developer.android.com/identity/data/autobackup): XML de API 31+ y exclusiones. No se probó respaldo/restauración ni publicación.
- [Pruebas Compose](https://developer.android.com/develop/ui/compose/testing): conceptos y configuración; [locks Gradle](https://docs.gradle.org/current/userguide/dependency_locking.html): generación y alcance de configuraciones; [verificación Gradle](https://docs.gradle.org/current/userguide/dependency_verification.html): hashes y confianza inicial. Los resultados anteriores son ejecución propia.

Los POM oficiales de las dependencias directas AndroidX seleccionadas declaran Apache-2.0; [Kotlin](https://kotlinlang.org/docs/faq.html#is-kotlin-free) declara Apache-2.0 y [JUnit 4](https://junit.org/junit4/license.html), EPL-1.0. Gradle conserva su texto de licencia con avisos de terceros. Esas licencias son independientes de la MPL-2.0 del código original y este inventario no cubre todas las dependencias transitivas o requisitos de redistribución.

No se ejecutaron dispositivos físicos, API 26 o 36 como runtime, TalkBack, pruebas exhaustivas de rendimiento/seguridad, recuperación de proceso, firma release ni publicación. La prueba de recreación de actividad no demuestra recuperación después de muerte del proceso. Los comandos para otros hosts son portátiles por diseño, pero no evidencia de haberlos ejecutado allí.
