# Base reutilizable de escritorio y móvil

**Actualización de seguridad:** HTTP ahora exige autenticación; una URL por sí sola no basta. Consulta [autenticación y producción](security-production.es-419.md) antes de seguir los ejemplos anteriores.

Revisión técnica: `1.1.0-draft.2`  
Estado: candidato técnico local; no es una nueva aprobación de la base documental.  
Idioma: español latinoamericano (`es-419`)  
[US English](README.en-US.md) · [Arquitectura](docs/architecture.es-419.md) · [Cambios](CHANGELOG.es-419.md) · [Fuentes y verificación](docs/verification.es-419.md)

Esta carpeta es una plantilla Flutter independiente para crear otro proyecto fuera del repositorio original. La lista de tareas es un ejemplo reemplazable: muestra estado vacío, validación, creación, completado, errores, cambio de idioma y apariencia clara/oscura automática. No es una aplicación final. No necesita archivos del repositorio de origen, cuentas, backend ni credenciales.

El código original se distribuye bajo [MPL-2.0](LICENSE). Flutter, los SDK y las dependencias conservan sus propios términos y avisos.

## Conexión API opcional

El contrato y los adaptadores HTTP ya están implementados. El modo memoria sigue siendo el predeterminado de los clientes; las descripciones de pérdida de datos se refieren a ese modo. Consultar la [guía de integración](api-integration.es-419.md) para configurar la conexión y revisar sus límites. No se incluye autenticación de producción.

## Preparar una copia

Copia las fuentes de esta carpeta, incluidos los runners, `pubspec.lock` y los archivos ocultos de configuración. Excluye `build`, `.dart_tool`, `.validation`, `artifacts`, `.fvm`, `.idea`, archivos efímeros de runners, `android/local.properties` y cualquier clave o credencial. Son salidas/cachés/rutas locales, no parte de la base transferible. No copies ni sobrescribas un proyecto existente sin revisar sus cambios. El SDK, Visual Studio, Android SDK y Xcode son herramientas externas que deben estar disponibles en el equipo consumidor; no se incluyen ni se instalan automáticamente.

La referencia está fijada a Flutter **3.35.1** y Dart **3.9.0**, no a la versión más reciente. `.fvmrc` permite seleccionar esa versión si ya usas FVM, pero FVM no es obligatorio. `pubspec.yaml` restringe Dart; para Flutter, pub solo comprueba el límite inferior de su constraint. Por eso el preflight verifica las versiones efectivas de Flutter en `PATH` y Dart. No descarga ni cambia SDKs. Si falla, selecciona conscientemente la herramienta correcta antes de continuar. El lockfile fija la resolución de paquetes; no vuelve hermética toda la compilación nativa. [Restricciones del SDK en pub](https://dart.dev/tools/pub/pubspec#flutter-sdk-constraints).

Desde la raíz de tu copia:

```sh
flutter --version
dart tool/check_toolchain.dart
flutter pub get --enforce-lockfile
dart format --output=none --set-exit-if-changed lib test integration_test tool
flutter analyze
flutter test
```

Detén la secuencia si un comando falla. Se requiere red para dependencias que no estén en caché y permiso de escritura en la copia y en las cachés normales. No ejecutes `upgrade` para ocultar una incompatibilidad: revisa y revalida los cambios de versión. El comando de instalación de paquetes anterior fue probado con esta versión del SDK.

Incluye también `android/app/gradle.lockfile`: bloquea estrictamente las versiones resueltas de las configuraciones de `:app`, incluidos los rangos AndroidX transitivos. Excluye expresamente `io.flutter:*` porque el conjunto de módulos del motor cambia entre ABI; su versión depende del SDK fijado y comprobado por el preflight. No bloquea todos los classpaths de plugins ni archivos del SDK, y no garantiza hashes de todos los binarios nativos. No regeneres el lock como parte de una instalación normal. Para una actualización deliberada y revisada, desde `android` ejecuta `gradlew.bat :app:dependencies --write-locks` en Windows o `./gradlew :app:dependencies --write-locks` en macOS/Linux, revisa el diff y repite compilación e integración. [Bloqueo de versiones en Gradle](https://docs.gradle.org/current/userguide/dependency_locking.html).

## Ejecutar y compilar

En Windows, con Visual Studio y las herramientas de C++ de escritorio disponibles:

```sh
flutter run -d windows
flutter test integration_test/app_test.dart -d windows
flutter build windows --release
```

La salida se encuentra en `build/windows/x64/runner/Release`. No distribuyas solo el `.exe`: conserva `data`, las DLL del motor y las dependencias C++ correspondientes. El paquete portátil local descrito en [verificación](docs/verification.es-419.md) incluye runtimes C++ app-local. No es un instalador, no está firmado y no se probó en una máquina limpia. [Distribución Windows](https://docs.flutter.dev/platform-integration/windows/building#building-your-own-zip-file-for-windows).

Para Android, usa un dispositivo de pruebas explícito obtenido con `flutter devices`; reemplaza `DEVICE_ID` por su identificador, no por un dispositivo ajeno:

```sh
flutter devices
flutter run -d DEVICE_ID
flutter test integration_test/app_test.dart -d DEVICE_ID
flutter build apk --debug
```

El último comando genera el APK normal desde `lib/main.dart` en `build/app/outputs/flutter-apk/app-debug.apk`. Ejecútalo después de una integración si necesitas ese artefacto: la prueba usa otro entrypoint y puede sobrescribir el APK del mismo directorio. El APK de debug usa firma de desarrollo, no firma de producción. `release` no tiene configuración de firma; el consumidor debe establecer identidad y firma reales sin versionar secretos. No se entrega AAB, APK release firmado, publicación en tienda ni garantía de políticas de Google Play.

El proyecto fija AGP `8.10.1`, Gradle `8.12`, Kotlin `2.1.0`, compile/target SDK `36`, min SDK `24`, Build Tools `35.0.0` y NDK `27.0.12077973`. El SDK 36 satisface `integration_test` de Flutter 3.35.1 y está dentro de la matriz de AGP 8.10; no se conserva AGP 8.9.1 del scaffold porque su matriz declara máximo API 35. `android.builder.sdkDownload=false` impide que el build instale componentes faltantes. Deben estar preparados deliberadamente; el entorno local también dispone de CMake `3.22.1`. [Compatibilidad AGP](https://developer.android.com/build/releases/agp-8-10-0-release-notes) · [Descargas automáticas de SDK](https://developer.android.com/studio/intro/update#download-with-gradle).

Los runners `macos`, `ios` y `linux` están generados, pero no se compilaron ni ejecutaron aquí. iOS/macOS necesitan una máquina Apple con herramientas apropiadas; Linux necesita su toolchain nativa. No interpretes su presencia como compatibilidad comprobada. La UI contiene mensajes `es-419` y `en-US` en archivos separados; algunos metadatos nativos siguen siendo placeholders.

## Convertirla en tu proyecto

Lee la [arquitectura](docs/architecture.es-419.md), reemplaza el ejemplo y define persistencia, límites de confianza y pruebas del nuevo producto. Cambia `org.example.foundation_starter`, el nombre, los íconos y metadatos de cada runner antes de distribuir. `publish_to: none` evita una publicación accidental en pub.dev; no protege todos los canales de distribución.

Los datos de tareas solo viven en memoria y se pierden al cerrar. No hay autenticación, API, sincronización, almacenamiento seguro, migraciones ni recuperación durable. Esas capacidades no están validadas por estas pruebas y deben diseñarse antes de manejar datos reales que deban conservarse. La evidencia concreta y sus límites se mantienen en el archivo de [verificación](docs/verification.es-419.md).
