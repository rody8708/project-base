# Flutter foundation evidence and limitations

Technical revision: `1.1.0-draft.1`  
Status: local technical candidate; not a new approval of the documentation foundation.  
Language: US English (`en-US`)  
[Español latinoamericano](verification.es-419.md) · [Start](../README.en-US.md) · [Architecture](architecture.en-US.md)

## Observed environment

Local execution on 2026-09-02: Windows 11 `10.0.26200.9278`, Flutter `3.35.1` stable, revision `20f8274939`, Dart `3.9.0`; Visual Studio Community 2022 `17.14.36`, MSVC `14.44.35207`, Windows SDK `10.0.26100.0`, Windows CMake `3.31.6-msvc6`; JDK `21.0.5` from the existing Android Studio. No global SDK was installed or upgraded and no licenses were accepted. `flutter doctor -v` recognized Windows and Android; it reported a nonexistent global Chrome/Edge path, which was not changed and is not required by these two runners.

Android: compile/target API `36`, min API `24`, Build Tools `35.0.0`, NDK `27.0.12077973`, Gradle `8.12`, AGP `8.10.1`, and Kotlin `2.1.0`. Testing used a local disposable AVD `foundation_starter_api35`, Android API `35`, x86_64, `medium_phone` profile, 2 GB memory, emulator `36.1.9.0`, and WHPX. It started without a window, audio, or snapshot loading/saving, on port `5580`. The preexisting Pixel AVD was neither used nor modified. There was no Google account, physical device, or publication.

## Executed results

| Check | Observed result | What it does not demonstrate |
| --- | --- | --- |
| `dart tool/check_toolchain.dart` | PASS: Flutter 3.35.1 / Dart 3.9.0 | Compatibility with other versions |
| Preflight with a local fake 3.35.2 CLI | Wrong-version message and exit 1; real SDK unchanged | Installing or running another real SDK |
| `flutter pub get --enforce-lockfile` | PASS with the included lockfile | Hermetic resolution of every native dependency |
| `dart format --output=none --set-exit-if-changed lib test integration_test tool` | 16 files, 0 changes | Semantic correctness |
| `flutter analyze` | No issues found | Universal absence of bugs or vulnerabilities |
| `flutter test --reporter expanded` | 27 tests passed | Testing every system or screen size |
| Windows integration, `-d windows` | 1 flow passed, native debug executable; 3 s test time | Running the flow in release mode |
| Final `flutter build windows --release` | PASS, 21.8 s, x64 exe | Clean installation, signing, or certification |
| AGP 8.10.1 Android integration, `-d emulator-5580` | 1 flow passed; 61.4 s build, 5 s test, no incompatible-SDK warning; locked repeat below | Physical device, runtime API 24/36, or every ABI |
| `flutter build apk --debug` after integration | PASS, 14.0 s, normal `lib/main.dart` entrypoint | Signed release APK or store readiness |
| `apksigner verify --print-certs` and `aapt dump badging` | `Android Debug` signature, example package, min24, target36, `debuggable` | Production identity or credentials |
| Windows package smoke | Own process created native windows and closed through `WM_CLOSE`, exit 0 | Visual testing or clean-machine operation |

The 27 tests cover domain (6), repository (5), controller (8), preflight (3), and widgets (5). They include empty titles, trimming, the 120/121 Unicode-point boundary, combining marks, controls, immutable snapshots, distinct IDs, repeated completion, missing IDs, errors, failing diagnostics, reentry, and disposal during an operation. Widgets check empty state, the memory warning, validation, creation, completion, translation, hidden internal diagnostics, and scrolling at 320×640 with a 280 keyboard inset.

Integration opens the real Flutter UI inside each runner, rejects an empty title, adds a task, completes it, and switches to English. It is not automation of every system screen or an accessibility audit. The Windows smoke was limited to starting/stopping the packaged process on the development machine. An initial attempt to close the hidden window with `CloseMainWindow` did not obtain closure and terminated only its own process; a subsequent check enumerated HWNDs filtered by PID and obtained normal closure through `WM_CLOSE`.

Local logs are in `.validation/`: `unit-widget-tests.log`, `windows-integration.log`, `windows-release-final.log`, `android-integration-agp8101-final.log`, `android-debug-final.log`, and the locked repeats listed below. They are evidence from this run, not prerequisites for a copy. Preliminary runs with other Android settings do not replace these final results. The AVD was temporarily left available for coordinated testing of another native foundation, not as a template dependency.

Final strict locking is limited to `:app`, in `android/app/gradle.lockfile` (SHA-256 `8cbc0ebbcfbf73c41f7f385df56df04f0f461a8dfb00662df0a349d73676649a`). Generation used `:app:dependencies --write-locks`. An initial variant that also locked every `io.flutter` module correctly rejected the difference between an x64-device graph and the multi-ABI APK. The final adjustment explicitly excludes only `io.flutter:*`; it retains locking for transitive AndroidX/Kotlin/Guava dependencies and writes no locks inside the SDK. Engine versions remain linked to the pinned SDK, not this lock. Other projects'/plugins' classpaths, downloaded bytes, and native tools remain outside its scope: binary hermeticity is not claimed.

With that final lock, Android integration was repeated: **1 flow passed**, **9.8 s** build, **5 s** test, log `android-integration-locked-final.log`. The normal APK was then rebuilt: **PASS**, **8.1 s**, log `android-debug-locked-final.log`. The lock's hash did not change during either execution and the resulting APK is byte-identical to the artifact in the following table. Dependency reports include unused auxiliary configurations; the passing result rests on builds and integration, not on every row of a Gradle report being resolved.

## Local artifacts

| File under `artifacts/` | Bytes | SHA-256 |
| --- | ---: | --- |
| `foundation-starter-windows-x64-1.1.0-draft.1.zip` | 11804717 | `b18e6ba4d376534fec712bb88b2700f38a934328ed57ae745561acdb38520662` |
| `foundation-starter-android-debug-1.1.0-draft.1.apk` | 168585723 | `1fce772058c03f5a8715aa041f89f38c773ea9aa8fe34c13c7ac2edc848cb0aa` |

The ZIP includes the complete Release tree, `msvcp140.dll`, `vcruntime140.dll`, and `vcruntime140_1.dll`, taken from the x64 `14.44.35112` redistributable installed with Visual Studio. It contains neither an installer nor its own signature. The APK is debug, not a production delivery. Hashes identify these bytes; alone, they do not authenticate a publisher, certify security, or promise that another build will be identical. Retain dependency licenses/notices and review redistribution terms when preparing a product.

## Grounded decisions and primary sources

Sources consulted on 2026-09-02; they were used for specific references, not template certification. Current Flutter pages may describe later SDKs. The observed version and sources from tag `3.35.1` are this starter's historical reference.

| Source and section | Use and limitation |
| --- | --- |
| [Flutter: Windows setup](https://docs.flutter.dev/platform-integration/windows/setup), tools and diagnostics | Host requirements; does not install Visual Studio |
| [Flutter: Android setup](https://docs.flutter.dev/platform-integration/android/setup), tools and emulator | Validation of the existing environment; installation/license steps were not followed |
| [Flutter: integration](https://docs.flutter.dev/testing/integration-tests), desktop and Android tests | The `integration_test` mechanism executed here |
| [Flutter 3.35.1: Gradle defaults](https://raw.githubusercontent.com/flutter/flutter/3.35.1/packages/flutter_tools/lib/src/android/gradle_utils.dart), version constants | Basis for comparing the scaffold; current defaults are not attributed to the historical SDK |
| [Flutter 3.35.1: Android integration_test](https://raw.githubusercontent.com/flutter/flutter/3.35.1/packages/integration_test/android/build.gradle.kts), `android` and dependencies | Uses Flutter's compile SDK and native AndroidX ranges; ranges resolved in `:app` are pinned with Gradle, not pubspec.lock |
| [Gradle: version locking](https://docs.gradle.org/current/userguide/dependency_locking.html), configurations, generation, and strict mode | Mechanism applied and executed with Gradle 8.12; does not fix SDK bytes or every plugin |
| [AGP 8.9](https://developer.android.com/build/releases/agp-8-9-0-release-notes), compatibility | Lists API35 as maximum; retaining this default for compile36 was rejected |
| [AGP 8.10](https://developer.android.com/build/releases/agp-8-10-0-release-notes), compatibility and 8.10.1 | Supports API36 with BuildTools35 and Gradle>=8.11.1; project-only change |
| [Android: Gradle downloads](https://developer.android.com/studio/intro/update#download-with-gradle), automatic downloads | Supports `android.builder.sdkDownload=false` |
| [Dart: Flutter constraints](https://dart.dev/tools/pub/pubspec#flutter-sdk-constraints) | Only the Flutter lower bound is enforced; motivates preflight |
| [Flutter: Windows ZIP](https://docs.flutter.dev/platform-integration/windows/building#building-your-own-zip-file-for-windows) | EXE, data, and DLLs; does not certify a distribution |
| [Android: emulator command line](https://developer.android.com/studio/run/emulator-commandline), startup options | Disposable startup without window/audio/snapshots |
| [Flutter: iOS setup](https://docs.flutter.dev/platform-integration/ios/setup) | Defines the Apple environment requirement, unavailable in this verification |

The global Flutter SDK was not modified to remove warnings. The project combination was corrected to AGP 8.10.1/API36, then native evidence was repeated. SDK 3.35.1, its dependencies, and its tools require a future update policy; version pinning helps control changes, not prove absence of vulnerabilities. An exhaustive supply-chain scan was not performed.

The macOS, iOS, and Linux runners remain **generated, not natively verified**. A consuming repository's CI configuration does not constitute a successful execution until real results exist. Durable persistence, distributed concurrency, remote cancellation, failure recovery, backups, migrations, authentication, and security of a future product are also not demonstrated.
