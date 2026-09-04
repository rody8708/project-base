# Reusable desktop and mobile foundation

**Security update:** HTTP now requires authentication; a URL alone is insufficient. Read [authentication and production](security-production.en-US.md) before following earlier examples.

Technical revision: `1.1.0-draft.2`  
Status: local technical candidate; not a new approval of the documentation foundation.  
Language: US English (`en-US`)  
[Español latinoamericano](README.es-419.md) · [Architecture](docs/architecture.en-US.md) · [Changes](CHANGELOG.en-US.md) · [Sources and verification](docs/verification.en-US.md)

This folder is an independent Flutter template for creating another project outside the original repository. The task list is a replaceable example showing empty state, validation, creation, completion, errors, language switching, and automatic light/dark appearance. It is not a finished application. It requires no original-repository files, accounts, backend, or credentials.

Original code is distributed under [MPL-2.0](LICENSE). Flutter, SDKs, and dependencies retain their own terms and notices.

## Optional API Connection

The contract and HTTP adapters are implemented. Memory remains the default client mode; descriptions of data loss refer to that mode. See the [integration guide](api-integration.en-US.md) for connection setup and limitations. Production authentication is not included.

## Prepare a copy

Copy this folder's sources, including runners, `pubspec.lock`, and hidden configuration files. Exclude `build`, `.dart_tool`, `.validation`, `artifacts`, `.fvm`, `.idea`, ephemeral runner files, `android/local.properties`, and any keys or credentials. These are outputs/caches/local paths, not part of the transferable foundation. Do not copy over an existing project without reviewing its changes. The SDK, Visual Studio, Android SDK, and Xcode are external tools that must be available on the consuming machine; they are not included or installed automatically.

The reference is pinned to Flutter **3.35.1** and Dart **3.9.0**, not the latest release. `.fvmrc` can select that version if you already use FVM, but FVM is optional. `pubspec.yaml` constrains Dart; for Flutter, pub checks only the constraint's lower bound. Therefore the preflight checks the effective Flutter version on `PATH` and the Dart versions. It does not download or change SDKs. If it fails, deliberately select the correct tool before continuing. The lockfile fixes package resolution; it does not make the entire native build hermetic. [Pub SDK constraints](https://dart.dev/tools/pub/pubspec#flutter-sdk-constraints).

From the root of your copy:

```sh
flutter --version
dart tool/check_toolchain.dart
flutter pub get --enforce-lockfile
dart format --output=none --set-exit-if-changed lib test integration_test tool
flutter analyze
flutter test
```

Stop the sequence if any command fails. Network access is required for uncached dependencies, along with write permission in the copy and normal caches. Do not run `upgrade` to conceal incompatibility: review and revalidate version changes. The package-install command above was tested with this SDK version.

Also include `android/app/gradle.lockfile`: it strictly locks resolved versions in `:app` configurations, including transitive AndroidX ranges. It explicitly excludes `io.flutter:*` because the engine-module set varies by ABI; its version depends on the SDK selected and checked by preflight. It does not lock every plugin classpath or SDK file, and does not guarantee hashes of all native binaries. Do not regenerate the lock during normal setup. For a deliberate, reviewed update, run `gradlew.bat :app:dependencies --write-locks` on Windows or `./gradlew :app:dependencies --write-locks` on macOS/Linux from `android`, review the diff, and repeat builds and integration. [Gradle version locking](https://docs.gradle.org/current/userguide/dependency_locking.html).

## Run and build

On Windows, with Visual Studio and desktop C++ tools available:

```sh
flutter run -d windows
flutter test integration_test/app_test.dart -d windows
flutter build windows --release
```

Output is in `build/windows/x64/runner/Release`. Do not distribute only the `.exe`: retain `data`, engine DLLs, and the required C++ dependencies. The local portable package described in [verification](docs/verification.en-US.md) includes app-local C++ runtimes. It is not an installer, is unsigned, and was not tested on a clean machine. [Windows distribution](https://docs.flutter.dev/platform-integration/windows/building#building-your-own-zip-file-for-windows).

For Android, use an explicit test device obtained with `flutter devices`; replace `DEVICE_ID` with its identifier, not someone else's device:

```sh
flutter devices
flutter run -d DEVICE_ID
flutter test integration_test/app_test.dart -d DEVICE_ID
flutter build apk --debug
```

The last command builds the normal APK from `lib/main.dart` at `build/app/outputs/flutter-apk/app-debug.apk`. Run it after integration testing if you need that artifact: the test uses a different entrypoint and can overwrite the APK in the same directory. The debug APK uses a development signature, not production signing. `release` has no signing configuration; the consumer must establish real identity and signing without committing secrets. No AAB, signed release APK, store publication, or Google Play policy guarantee is delivered.

The project pins AGP `8.10.1`, Gradle `8.12`, Kotlin `2.1.0`, compile/target SDK `36`, min SDK `24`, Build Tools `35.0.0`, and NDK `27.0.12077973`. SDK 36 satisfies Flutter 3.35.1's `integration_test` and is within AGP 8.10's matrix; the scaffold's AGP 8.9.1 is not retained because its matrix lists API 35 as the maximum. `android.builder.sdkDownload=false` prevents the build from installing missing components. They must be prepared deliberately; the local environment also has CMake `3.22.1`. [AGP compatibility](https://developer.android.com/build/releases/agp-8-10-0-release-notes) · [Automatic SDK downloads](https://developer.android.com/studio/intro/update#download-with-gradle).

The `macos`, `ios`, and `linux` runners are generated but were not built or run here. iOS/macOS need an Apple machine with suitable tools; Linux needs its native toolchain. Their presence must not be interpreted as tested compatibility. UI messages are in separate `es-419` and `en-US` files; some native metadata remains placeholder text.

## Make it your project

Read the [architecture](docs/architecture.en-US.md), replace the example, and define the new product's persistence, trust boundaries, and tests. Change `org.example.foundation_starter`, the name, icons, and metadata in every runner before distribution. `publish_to: none` prevents accidental pub.dev publication; it does not protect every distribution channel.

Task data exists only in memory and is lost on close. There is no authentication, API, synchronization, secure storage, migration, or durable recovery. Those capabilities are not validated by these tests and must be designed before handling real data that must be retained. Concrete evidence and limitations are maintained in [verification](docs/verification.en-US.md).
