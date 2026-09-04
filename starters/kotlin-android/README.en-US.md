# Native Android Kotlin starter

**Security update:** HTTP now requires authentication; a URL alone is insufficient. Read [authentication and production](security-production.en-US.md) before following earlier examples.

Technical revision: `1.1.0-draft.2`. Status: candidate, not approved for production.

[Español (Latinoamérica)](README.es-419.md) · [Architecture](docs/architecture.en-US.md) · [Changes](CHANGELOG.en-US.md) · [Verification and sources](docs/verification.en-US.md)

This directory is a runnable, copyable foundation, not a finished product. It includes a replaceable in-memory task list, an Android-free Kotlin/JVM domain, an application service, a memory adapter, native Jetpack Compose UI, and tests. It imports no files from its containing repository. Running it requires no Flutter, Node, server, account, or external service; the first build does download tools and dependencies.

Its target is Android. It does not generate iOS, macOS, Windows, or web applications. Reusing decisions or contracts with other starters does not make this UI code cross-platform.

## Optional API Connection

The contract and HTTP adapters are implemented. Memory remains the default client mode; descriptions of data loss refer to that mode. See the [integration guide](api-integration.en-US.md) for connection setup and limitations. Production authentication is not included.

## Requirements and technical selection

| Component | Fixed selection |
| --- | --- |
| JDK to run Gradle and compile | 21; target bytecode 17 |
| Gradle Wrapper | 8.13, `bin` distribution with SHA-256 |
| Android Gradle Plugin | 8.13.2 |
| Kotlin and Compose compiler plugin | 2.3.10 |
| Compose BOM | 2026.02.01: UI/tests 1.10.4, Material 3 1.4.0 |
| Activity Compose | 1.11.0 |
| Lifecycle ViewModel Compose | 2.9.4 |
| AndroidX Test | runner 1.7.0; ext JUnit 1.3.0 |
| Local JUnit | 4.13.2 |
| Android SDK | compile/target 36; Build Tools 35.0.0; minimum runtime API 26 |

These are stable versions selected as a compatible set, not a claim to be the latest. The Gradle files and locks define exact resolution. The [official Kotlin matrix](https://kotlinlang.org/docs/gradle-configure-project.html) and [AGP 8.13.2 notes](https://developer.android.com/build/releases/agp-8-13-0-release-notes?hl=en) support that selection; the verification record describes the execution performed and its limits.

Set `JAVA_HOME` to a JDK 21 and `ANDROID_HOME` to your installed SDK. This project neither downloads SDK packages automatically nor accepts licenses for you. If packages are missing, install them through Android Studio or `sdkmanager` after reviewing their licenses: `platforms;android-36`, `build-tools;35.0.0`, and `platform-tools`. NDK and CMake are unnecessary. For instrumented tests, prepare an Android emulator or device running API 26 or later separately.

## Build and verify

From this copy's root, verify the [wrapper](docs/verification.en-US.md) first. In PowerShell:

```powershell
.\gradlew.bat --version
.\gradlew.bat --no-daemon :core:test :app:testDebugUnitTest :app:lintDebug :app:assembleDebug
```

On Linux/macOS, equivalent commands use the same wrapper:

```sh
sh ./gradlew --version
sh ./gradlew --no-daemon :core:test :app:testDebugUnitTest :app:lintDebug :app:assembleDebug
```

These commands do not regenerate locks or accept new checksums. Metadata verification is strict by default. Investigate an altered dependency or missing hash instead of disabling verification. `GradleDependency` is the only disabled lint detector: reporting that another version exists does not invalidate a fixed selection; remaining lint and compiler warnings are errors. Before adoption or updates, review versions, security advisories, compatibility, licenses, and repeat tests.

The APK is generated at `app/build/outputs/apk/debug/app-debug.apk`. It is a debug build with identity `org.example.foundation.kotlin.debug` and development signing. It is not a distribution artifact. The release variant has no signing configuration; never reuse the debug key as a publishing key.

To install only on your chosen device, first inspect `adb devices -l`, then use `adb -s SERIAL install -r app/build/outputs/apk/debug/app-debug.apk`, replacing `SERIAL`. This installs or updates the debug app on that device. Instrumented testing instructions are in [verification](docs/verification.en-US.md).

## Use and adapt

The example adds titles, completes and reopens tasks, switches between Latin American Spanish and US English, and follows Android's light/dark appearance. Validation distinguishes errors; user text is displayed literally. Data and the selected language survive activity recreation while the ViewModel lives, but not permanently closing the activity or process death. Do not put data you need to recover in this adapter.

Complete English text lives in `app/src/main/res/values/strings.xml` as fallback; Spanish text is in `app/src/main/res/values-b+es+419/strings.xml`. They are separate files with matching keys. Do not silently translate or normalize user-entered titles.

When starting a real project, change the name, namespace/applicationId, icon, requirements, and domain contracts in the copy. Retain layer separation, dependency injection, explicit errors, and checks that remain applicable. Replace the list, its limits, and storage to match the product; do not turn them into universal rules. See [what to retain and adapt](docs/architecture.en-US.md).

This starter's original code is distributed under [MPL-2.0](LICENSE). The wrapper preserves its [Gradle license](GRADLE-LICENSE.txt); dependency `AL2.0` and `LGPL2.1` notices are merged instead of routinely excluded. This does not replace a distributed product's third-party inventory and obligations review.

A backend server, authentication, local persistence, offline synchronization, notifications, payments, analytics, and publishing are not included. Remote HTTP access is implemented. Adding them requires their own contracts, decisions, and evidence. This starter's test results do not automatically approve a project copied from it.
