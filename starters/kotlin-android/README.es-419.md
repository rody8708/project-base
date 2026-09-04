# Base Kotlin para Android nativo

**Actualización de seguridad:** HTTP ahora exige autenticación; una URL por sí sola no basta. Consulta [autenticación y producción](security-production.es-419.md) antes de seguir los ejemplos anteriores.

Revisión técnica: `1.1.0-draft.2`. Estado: candidata, no aprobada para producción.

[English (US)](README.en-US.md) · [Arquitectura](docs/architecture.es-419.md) · [Cambios](CHANGELOG.es-419.md) · [Verificación y fuentes](docs/verification.es-419.md)

Este directorio es una base ejecutable y copiable, no el producto final. Incluye una lista reemplazable en memoria, dominio Kotlin/JVM sin Android, servicio de aplicación, adaptador de memoria, interfaz nativa Jetpack Compose y pruebas. No importa archivos del repositorio que lo contiene. No requiere Flutter, Node, servidor, cuenta ni servicio externo para ejecutarse; la primera compilación sí descarga herramientas y dependencias.

Su destino es Android. No genera aplicaciones para iOS, macOS, Windows o web. Reutilizar decisiones o contratos con otras bases no convierte este código de interfaz en multiplataforma.

## Conexión API opcional

El contrato y los adaptadores HTTP ya están implementados. El modo memoria sigue siendo el predeterminado de los clientes; las descripciones de pérdida de datos se refieren a ese modo. Consultar la [guía de integración](api-integration.es-419.md) para configurar la conexión y revisar sus límites. No se incluye autenticación de producción.

## Requisitos y selección técnica

| Componente | Selección fija |
| --- | --- |
| JDK para ejecutar Gradle y compilar | 21; bytecode objetivo 17 |
| Gradle Wrapper | 8.13, distribución `bin` con SHA-256 |
| Android Gradle Plugin | 8.13.2 |
| Kotlin y plugin de compilación Compose | 2.3.10 |
| Compose BOM | 2026.02.01: UI/pruebas 1.10.4, Material 3 1.4.0 |
| Activity Compose | 1.11.0 |
| Lifecycle ViewModel Compose | 2.9.4 |
| AndroidX Test | runner 1.7.0; ext JUnit 1.3.0 |
| JUnit local | 4.13.2 |
| Android SDK | compile/target 36; Build Tools 35.0.0; mínimo de ejecución API 26 |

Son versiones estables elegidas como conjunto compatible, no una afirmación de ser las más recientes. Los archivos Gradle y los locks definen la resolución exacta. La [matriz oficial de Kotlin](https://kotlinlang.org/docs/gradle-configure-project.html) y las [notas de AGP 8.13.2](https://developer.android.com/build/releases/agp-8-13-0-release-notes?hl=en) respaldan esa selección; la ejecución realizada y sus límites están en el registro de verificación.

Configura `JAVA_HOME` hacia un JDK 21 y `ANDROID_HOME` hacia tu SDK instalado. Este proyecto no descarga SDK automáticamente ni acepta licencias por ti. Si faltan paquetes, instálalos mediante Android Studio o `sdkmanager` después de revisar sus licencias: `platforms;android-36`, `build-tools;35.0.0` y `platform-tools`. No necesita NDK ni CMake. Para pruebas instrumentadas, prepara por separado un emulador o dispositivo Android API 26 o superior.

## Compilar y verificar

Desde la raíz de esta copia, verifica primero el [wrapper](docs/verification.es-419.md). En PowerShell:

```powershell
.\gradlew.bat --version
.\gradlew.bat --no-daemon :core:test :app:testDebugUnitTest :app:lintDebug :app:assembleDebug
```

En Linux/macOS, los comandos equivalentes usan el mismo wrapper:

```sh
sh ./gradlew --version
sh ./gradlew --no-daemon :core:test :app:testDebugUnitTest :app:lintDebug :app:assembleDebug
```

Estos comandos no regeneran locks ni aceptan checksums nuevos. La comprobación de metadatos es estricta por defecto. Una dependencia alterada o sin hash debe investigarse, no resolverse desactivando la verificación. `GradleDependency` es el único detector de lint desactivado: avisar que existe otra versión no invalida una selección fija; el resto de advertencias de lint y del compilador se trata como error. Antes de adoptar o actualizar, revisa versiones, avisos de seguridad, compatibilidad, licencias y repite pruebas.

El APK se genera en `app/build/outputs/apk/debug/app-debug.apk`. Es de depuración, con identidad `org.example.foundation.kotlin.debug` y firma de desarrollo. No es un artefacto de distribución. La variante release no tiene configuración de firma; nunca reutilices la clave debug como clave de publicación.

Para instalar únicamente en el dispositivo que elegiste, consulta primero `adb devices -l` y usa `adb -s SERIAL install -r app/build/outputs/apk/debug/app-debug.apk`, reemplazando `SERIAL`. Esa acción instala o actualiza la app debug en ese dispositivo. Las instrucciones de pruebas instrumentadas están en [verificación](docs/verification.es-419.md).

## Usar y adaptar

El ejemplo permite agregar títulos, completar y reabrir tareas, cambiar entre español de Latinoamérica e inglés de Estados Unidos y seguir la apariencia clara/oscura de Android. La validación distingue errores; el texto del usuario se muestra literalmente. Los datos y el idioma seleccionado sobreviven a una recreación de actividad mientras vive el ViewModel, pero no al cierre definitivo de la actividad ni a la muerte del proceso. No guardes datos que necesites recuperar en este adaptador.

Los textos ingleses completos están en `app/src/main/res/values/strings.xml` como respaldo; los españoles, en `app/src/main/res/values-b+es+419/strings.xml`. Son archivos separados, con las mismas claves. No traduzcas ni normalices silenciosamente los títulos escritos por el usuario.

Al iniciar un proyecto real, cambia nombre, namespace/applicationId, icono, requisitos y contratos del dominio en la copia. Conserva la separación de capas, la inyección de dependencias, los errores explícitos y las comprobaciones que sigan aplicando. Reemplaza la lista, sus límites y almacenamiento según el producto; no los conviertas en reglas universales. Consulta [qué se conserva y qué se adapta](docs/architecture.es-419.md).

El código original de esta base se distribuye bajo [MPL-2.0](LICENSE). El wrapper conserva su [licencia de Gradle](GRADLE-LICENSE.txt); los avisos `AL2.0` y `LGPL2.1` de dependencias se fusionan, no se excluyen rutinariamente. Eso no sustituye el inventario y revisión de obligaciones de terceros de un producto distribuido.

No se incluye servidor backend, autenticación, persistencia local, sincronización offline, notificaciones, pagos, analítica ni publicación. El acceso HTTP remoto sí está implementado. Añadirlos exige contratos, decisiones y evidencia propios. Los resultados de pruebas de esta base no aprueban automáticamente el proyecto que la copie.
