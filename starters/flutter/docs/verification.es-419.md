# Evidencia y límites de la base Flutter

Revisión técnica: `1.1.0-draft.2`  
Estado: candidato técnico local; no es una nueva aprobación de la base documental.  
Idioma: español latinoamericano (`es-419`)  
[US English](verification.en-US.md) · [Inicio](../README.es-419.md) · [Arquitectura](architecture.es-419.md)

## Seguimiento enfocado — 2026-09-04

La revisión 2 pasó formato, análisis y 31 pruebas locales; una prueba contra backend real que requiere activación se omitió según su diseño. La prueba de widget agregada demuestra que `ThemeMode.system` selecciona el tema Material oscuro cuando la plataforma informa apariencia oscura. Los ejecutores visuales nativos no se repitieron para este cambio enfocado; la evidencia más amplia de la revisión 1 que aparece debajo sigue siendo histórica y no se reetiqueta.

## Entorno observado

Ejecución local del 2026-09-02: Windows 11 `10.0.26200.9278`, Flutter `3.35.1` stable, revisión `20f8274939`, Dart `3.9.0`; Visual Studio Community 2022 `17.14.36`, MSVC `14.44.35207`, Windows SDK `10.0.26100.0`, CMake Windows `3.31.6-msvc6`; JDK `21.0.5` del Android Studio existente. No se instaló ni actualizó el SDK global ni se aceptaron licencias. `flutter doctor -v` reconoció Windows y Android; reportó una ruta global de Chrome/Edge inexistente, que no se cambió y no es requisito de estos dos runners.

Android: compile/target API `36`, min API `24`, Build Tools `35.0.0`, NDK `27.0.12077973`, Gradle `8.12`, AGP `8.10.1` y Kotlin `2.1.0`. Se usó un AVD desechable local `foundation_starter_api35`, Android API `35`, x86_64, perfil `medium_phone`, memoria 2 GB, emulador `36.1.9.0`, WHPX. Se inició sin ventana, audio ni carga/guardado de snapshots, en puerto `5580`. No se usó ni modificó el AVD Pixel preexistente. No hubo cuenta Google, dispositivo físico ni publicación.

## Resultados ejecutados

| Comprobación | Resultado observado | Qué no demuestra |
| --- | --- | --- |
| `dart tool/check_toolchain.dart` | PASS: Flutter 3.35.1 / Dart 3.9.0 | Compatibilidad con otras versiones |
| Preflight con CLI ficticia local 3.35.2 | Mensaje de versión incorrecta y salida 1; SDK real intacto | Instalación o ejecución de otro SDK real |
| `flutter pub get --enforce-lockfile` | PASS con el lockfile incluido | Resolución hermética de toda dependencia nativa |
| `dart format --output=none --set-exit-if-changed lib test integration_test tool` | 16 archivos, 0 cambios | Corrección semántica |
| `flutter analyze` | Sin observaciones | Ausencia universal de errores o vulnerabilidades |
| `flutter test --reporter expanded` | 27 pruebas aprobadas | Pruebas en todos los sistemas o tamaños de pantalla |
| Integración Windows, `-d windows` | 1 flujo aprobado, ejecutable debug nativo; 3 s de prueba | Ejecución del flujo en modo release |
| `flutter build windows --release` final | PASS, 21.8 s, exe x64 | Instalación limpia, firma o certificación |
| Integración Android AGP 8.10.1, `-d emulator-5580` | 1 flujo aprobado; build 61.4 s, prueba 5 s, sin advertencia de SDK incompatible; repetición con lock indicada debajo | Dispositivo físico, API 24/36 en ejecución o todas las ABI |
| `flutter build apk --debug` posterior a integración | PASS, 14.0 s, entrypoint normal `lib/main.dart` | APK release firmado o aptitud para tiendas |
| `apksigner verify --print-certs` y `aapt dump badging` | Firma `Android Debug`, paquete de ejemplo, min24, target36, `debuggable` | Identidad o credenciales de producción |
| Smoke del paquete Windows | Proceso propio creó ventanas nativas y cerró con `WM_CLOSE`, salida 0 | Prueba visual ni funcionamiento en máquina limpia |

Las 27 pruebas se reparten en dominio (6), repositorio (5), controlador (8), preflight (3) y widgets (5). Incluyen títulos vacíos, recorte, límite de 120/121 puntos Unicode, marcas combinantes, controles, snapshots inmutables, IDs distintos, completado repetido, ID inexistente, errores, diagnóstico que falla, reentrada y descarte durante operación. Los widgets comprueban vacío, advertencia de memoria, validación, creación, completado, traducción, ocultación del diagnóstico interno y desplazamiento a 320×640 con inset de teclado de 280.

La integración abre la UI Flutter real dentro de cada runner, rechaza un título vacío, agrega una tarea, la completa y cambia a inglés. No es una automatización de todas las pantallas del sistema ni una auditoría de accesibilidad. El smoke Windows se limitó a arranque/cierre del proceso empaquetado en el equipo de desarrollo. Un primer intento de cerrar la ventana oculta con `CloseMainWindow` no obtuvo cierre y terminó únicamente su proceso propio; la comprobación posterior enumeró HWNDs filtrados por PID y obtuvo cierre normal con `WM_CLOSE`.

Los logs locales están en `.validation/`: `unit-widget-tests.log`, `windows-integration.log`, `windows-release-final.log`, `android-integration-agp8101-final.log`, `android-debug-final.log` y las repeticiones con lock indicadas debajo. Son evidencia de esta ejecución, no prerrequisitos de una copia. Corridas preliminares con otros ajustes Android no sustituyen estos resultados finales. El AVD se dejó disponible temporalmente para la prueba coordinada de otra base nativa, no como dependencia de la plantilla.

El bloqueo estricto final está limitado a `:app`, en `android/app/gradle.lockfile` (SHA-256 `8cbc0ebbcfbf73c41f7f385df56df04f0f461a8dfb00662df0a349d73676649a`). La generación se ejecutó con `:app:dependencies --write-locks`. Una primera variante que bloqueaba también todos los módulos `io.flutter` rechazó correctamente la diferencia entre el grafo de un dispositivo x64 y el APK multi-ABI. El ajuste final excluye explícitamente solo `io.flutter:*`; conserva el bloqueo de sus dependencias transitivas AndroidX/Kotlin/Guava y no escribe locks dentro del SDK. Las versiones del motor siguen vinculadas al SDK fijado, no a este lock. Quedan fuera los classpaths de otros proyectos/plugins, los bytes descargados y las herramientas nativas: no se afirma hermeticidad binaria.

Con ese lock final, la integración Android se repitió: **1 flujo aprobado**, build **9.8 s**, prueba **5 s**, log `android-integration-locked-final.log`. Luego el APK normal se recompiló: **PASS**, **8.1 s**, log `android-debug-locked-final.log`. El hash del lock no cambió durante ninguna de esas ejecuciones y el APK resultante coincide byte por byte con el artefacto de la tabla siguiente. Los reportes de dependencias incluyen configuraciones auxiliares no usadas; el resultado aprobado se sustenta en las compilaciones e integración, no en que todo renglón de un reporte Gradle esté resuelto.

## Artefactos locales

| Archivo bajo `artifacts/` | Bytes | SHA-256 |
| --- | ---: | --- |
| `foundation-starter-windows-x64-1.1.0-draft.1.zip` | 11804717 | `b18e6ba4d376534fec712bb88b2700f38a934328ed57ae745561acdb38520662` |
| `foundation-starter-android-debug-1.1.0-draft.1.apk` | 168585723 | `1fce772058c03f5a8715aa041f89f38c773ea9aa8fe34c13c7ac2edc848cb0aa` |

El ZIP incluye el árbol Release completo, `msvcp140.dll`, `vcruntime140.dll` y `vcruntime140_1.dll`, tomados del redistribuible x64 `14.44.35112` instalado con Visual Studio. No contiene un instalador ni firma propia. El APK es de debug, no una entrega de producción. Los hashes identifican estos bytes; por sí solos no autentican al publicador, no certifican seguridad y no prometen que otra compilación sea idéntica. Conserva las licencias/avisos de dependencias y revisa los términos de redistribución al preparar un producto.

## Decisiones fundamentadas y fuentes primarias

Fuentes consultadas el 2026-09-02; se usaron como referencias concretas, no como certificación de la plantilla. Las páginas actuales de Flutter pueden describir SDKs posteriores. La versión observada y las fuentes del tag `3.35.1` son la referencia histórica de este starter.

| Fuente y sección | Uso y límite |
| --- | --- |
| [Flutter: configuración Windows](https://docs.flutter.dev/platform-integration/windows/setup), herramientas y diagnóstico | Requisitos del host; no instala Visual Studio |
| [Flutter: configuración Android](https://docs.flutter.dev/platform-integration/android/setup), herramientas y emulador | Validación del entorno existente; no se siguieron pasos de instalación/licencias |
| [Flutter: integración](https://docs.flutter.dev/testing/integration-tests), pruebas desktop y Android | Mecanismo `integration_test` ejecutado aquí |
| [Flutter 3.35.1: defaults Gradle](https://raw.githubusercontent.com/flutter/flutter/3.35.1/packages/flutter_tools/lib/src/android/gradle_utils.dart), constantes de versiones | Origina la comparación con el scaffold; no se atribuyen defaults actuales al SDK histórico |
| [Flutter 3.35.1: integration_test Android](https://raw.githubusercontent.com/flutter/flutter/3.35.1/packages/integration_test/android/build.gradle.kts), `android` y dependencias | Usa compile SDK de Flutter y rangos nativos AndroidX; los rangos resueltos en `:app` se fijan con Gradle, no con pubspec.lock |
| [Gradle: bloqueo de versiones](https://docs.gradle.org/current/userguide/dependency_locking.html), configuraciones, generación y modo estricto | Mecanismo aplicado y ejecutado con Gradle 8.12; no fija bytes del SDK ni de todo plugin |
| [AGP 8.9](https://developer.android.com/build/releases/agp-8-9-0-release-notes), compatibilidad | Declara máximo API35; se descartó conservar este default para compilar36 |
| [AGP 8.10](https://developer.android.com/build/releases/agp-8-10-0-release-notes), compatibilidad y 8.10.1 | Soporta API36 con BuildTools35 y Gradle>=8.11.1; cambio limitado al proyecto |
| [Android: descarga con Gradle](https://developer.android.com/studio/intro/update#download-with-gradle), descarga automática | Sustenta `android.builder.sdkDownload=false` |
| [Dart: restricciones Flutter](https://dart.dev/tools/pub/pubspec#flutter-sdk-constraints) | Solo se impone el límite inferior Flutter; justifica el preflight |
| [Flutter: ZIP Windows](https://docs.flutter.dev/platform-integration/windows/building#building-your-own-zip-file-for-windows) | EXE, data y DLLs; no certifica una distribución |
| [Android: línea de comandos del emulador](https://developer.android.com/studio/run/emulator-commandline), opciones de arranque | Arranque desechable sin ventana/audio/snapshots |
| [Flutter: configuración iOS](https://docs.flutter.dev/platform-integration/ios/setup) | Delimita necesidad de entorno Apple, no disponible en esta verificación |

No se modificó Flutter global para eliminar advertencias. Se corrigió la combinación del proyecto a AGP 8.10.1/API36 y se repitió la evidencia nativa. El SDK 3.35.1, sus dependencias y sus herramientas requieren una política futura de actualizaciones; fijar versiones ayuda a controlar cambios, no demuestra ausencia de vulnerabilidades. No se ejecutó un escaneo exhaustivo de cadena de suministro.

Los runners macOS, iOS y Linux permanecen **generados, no verificados nativamente**. La configuración de CI de un repositorio consumidor no constituye una ejecución aprobada hasta que existan resultados reales. Tampoco están demostradas persistencia durable, concurrencia distribuida, cancelación remota, recuperación de fallos, backups, migraciones, autenticación o seguridad de un producto futuro.
