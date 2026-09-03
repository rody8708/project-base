# Verification and technical selection

Technical revision: `1.1.0-draft.1`. Status: candidate; local development evidence, not product approval.

[Español (Latinoamérica)](verification.es-419.md) · [Home](../README.en-US.md) · [Architecture](architecture.en-US.md)

## Reproducible checks

Run the README commands from the independent copy, using JDK 21 and the specified SDK packages. `:core:test` tests the domain, application, and memory adapter; `:app:testDebugUnitTest` tests the ViewModel; `:app:lintDebug` analyzes code and resources; `:app:assembleDebug` produces a real APK. They do not replace one another. Add `--rerun-tasks` to force tasks to run again; do not add trust-regeneration options to an ordinary check.

For UI, prepare a test device or AVD running API 26 or later, inspect `adb devices -l`, and explicitly select its serial. In PowerShell, for example, set `$env:ANDROID_SERIAL = 'SERIAL'` in a dedicated terminal and run:

```powershell
.\gradlew.bat --no-daemon :app:connectedDebugAndroidTest
```

In a POSIX shell: `ANDROID_SERIAL=SERIAL sh ./gradlew --no-daemon :app:connectedDebugAndroidTest`. Replace `SERIAL` with the verified value. Instrumentation temporarily installs debug/test applications and may remove them afterward. Do not use somebody else's devices, data you need to retain, or another project's session. Generated reports reside in `core/build/test-results/test`, `app/build/test-results/testDebugUnitTest`, `app/build/reports/lint-results-debug.html`, and `app/build/outputs/androidTest-results/connected/debug`; they are not portable template inputs.

## Executed evidence

Local execution: 2026-09-02, America/New_York; instrumented report UTC timestamp `2026-09-03T01:59:06`. Windows 11 x64 host, existing JetBrains JDK 21.0.5, Gradle 8.13, SDK 36, and Build Tools 35.0.0. The SDK was not upgraded and no global tools were installed. Using that available JDK does not claim its patch is the latest or replace security review before adoption.

| Check | Observed result |
| --- | --- |
| Domain, service, and adapter, JVM | 15 tests; 0 failures, errors, or skips |
| ViewModel, JVM | 6 tests; 0 failures, errors, or skips |
| Debug lint | `No issues found`; warnings as errors except the documented version-availability detector |
| Debug build | APK generated; compile/target 36, minimum 26, debug ID checked |
| Instrumented UI | 3 tests, 0 failures, errors, or skips; Android 15/API 35, x86_64 emulator |
| Original resources | 26 keys per language, no differing keys |
| APK launch | Successful installation and cold start; initial screenshot inspected |

Local tests include empty/wrong-type/control/invalid-UTF-16 titles, 80/81-code-point boundaries using emoji, ID and time boundaries, constructor/copy, order, snapshots, independent instances, duplicates, absent tasks, dependency failures, and no retries. Two threads apply 100 toggles each to check atomic updates in this memory instance.

Two ViewModel regressions simulate successful writes and failures in all subsequent reads: adding and toggling reflect the confirmed value without rereading; a failed manual reload retains that value. The total is 21 JVM tests. The previous dependence on a second read, which could hide a confirmed write, was corrected; lint, APK build, and the three instrumented tests were also repeated afterward.

The three Android flows cover empty state and validation, adding through the keyboard action, completing/reopening, changing language without modifying the task, 81 code points, literal HTML text, activity recreation retaining state, and a simulated repository's error message. Initial test import/assertion mistakes were corrected; final assertions were executed, not skipped. The final repetition combined tests, lint, build, and instrumentation without `--write-locks` or `--write-verification-metadata`.

Observed APK: 11428951 bytes, SHA-256 `c357d1ebc4e52f6999f0c7655cdfdb46c25eb01c576ff2bd650ef18c16e11f53`. This identifies that development file, not a promise of identical builds on another machine: debug signing, tools, and other inputs may change its bytes. Inspection found five AndroidX `LICENSE.txt` notices inside the APK. Configuration also preserves/merges common LICENSE/NOTICE and AL2.0/LGPL2.1 names when present; it does not claim every artifact includes each name or those five notices are a complete legal inventory.

## Wrapper, locks, and trust

Before executing scripts from a new copy, review their origin and calculate the JAR hash: `Get-FileHash gradle/wrapper/gradle-wrapper.jar -Algorithm SHA256` in PowerShell, `sha256sum gradle/wrapper/gradle-wrapper.jar` on Linux, or `shasum -a 256 gradle/wrapper/gradle-wrapper.jar` on macOS. Compare it with the recorded value and [Gradle's official reference](https://gradle.org/release-checksums/).

| Input | Expected SHA-256 |
| --- | --- |
| Wrapper JAR 8.13 | `81a82aaea5abcc8ff68b3dfcb58b3c3c429378efd98e7433460610fecd7ae45f` |
| `gradle-8.13-bin.zip` distribution | `20f1b1176237254a6fc204d8434196fa11a4cfb387567519c61556e8710aed78` |

The scripts, JAR, and [preserved license](../GRADLE-LICENSE.txt) came from official tag [Gradle v8.13.0](https://github.com/gradle/gradle/tree/v8.13.0); the JAR was compared with its published checksum. `distributionSha256Sum` checks the downloaded ZIP. Retain `core/gradle.lockfile`, `app/gradle.lockfile`, `gradle/verification-metadata.xml`, and the four wrapper files; do not copy caches, SDK, `local.properties`, outputs, or keys.

Locks fix versions for resolved configurations; SHA-256 metadata detects bytes differing from the record, including publication metadata. It was initially generated from official repositories over HTTPS: this is initial trust, not independent validation of every supplier. PGP signatures were not verified and no comprehensive vulnerability scanner was run. The [Gradle guide](https://docs.gradle.org/current/userguide/dependency_verification.html) explains the limitation of generating hashes from the same downloads.

In addition to executed Windows aapt2, official [Linux](https://dl.google.com/dl/android/maven2/com/android/tools/build/aapt2/8.13.2-14304508/aapt2-8.13.2-14304508-linux.jar) and [macOS](https://dl.google.com/dl/android/maven2/com/android/tools/build/aapt2/8.13.2-14304508/aapt2-8.13.2-14304508-osx.jar) artifacts `8.13.2-14304508` were downloaded and hashed, with metadata recorded for resolution on other hosts. Those binaries and remote CI were not executed. If another command/host requires new metadata, stop and review its origin; do not disable verification.

For an intentional update, first review compatibility and origin, change exact versions on a branch, regenerate only needed configurations using `--write-locks --write-verification-metadata sha256`, review diffs, and repeat ordinary commands without those options. Do not make regeneration an automatic repair. A future release build requires its own resolution, checks, signing, and evidence.

## Primary sources and limits

Consulted: 2026-09-02. Living pages can change; this selection preserves specific numbers, sections, and hashes without promising perpetual external availability. Documentation supports tools and mechanisms, not product certification or mandating this architecture for other languages.

- [Kotlin releases](https://kotlinlang.org/docs/releases.html): entry 2.3.10, 2026-02-05; [KGP compatibility](https://kotlinlang.org/docs/gradle-configure-project.html), row 2.3.10. Selection within Gradle/AGP ranges, not a universal version choice.
- [AGP 8.13](https://developer.android.com/build/releases/agp-8-13-0-release-notes?hl=en): compatibility table and 8.13.2 changes, including R8 Kotlin 2.3 support. [Gradle/Java matrix](https://docs.gradle.org/current/userguide/compatibility.html): Java 21; specific local execution with Gradle 8.13.
- [Compose BOM 2026.02.01 POM](https://dl.google.com/dl/android/maven2/androidx/compose/compose-bom/2026.02.01/compose-bom-2026.02.01.pom): mapped versions; [Compose plugin](https://developer.android.com/develop/ui/compose/setup-compose-dependencies-and-compiler): Kotlin 2.x setup. No external project was copied.
- [Activity](https://developer.android.com/jetpack/androidx/releases/activity), entry 1.11.0, 2025-09-10; [Lifecycle](https://developer.android.com/jetpack/androidx/releases/lifecycle), entry 2.9.4, 2025-09-17; [AndroidX Test](https://developer.android.com/jetpack/androidx/releases/test), runner 1.7.0 and ext JUnit 1.3.0. No previews are adopted.
- [Android resources](https://developer.android.com/guide/topics/resources/providing-resources): default resources and BCP 47 qualifiers; [bundle language changes](https://developer.android.com/guide/app-bundle/configure-base#handling_language_changes): retaining resources; [Auto Backup](https://developer.android.com/identity/data/autobackup): API 31+ XML and exclusions. Backup/restoration and publishing were not tested.
- [Compose testing](https://developer.android.com/develop/ui/compose/testing): concepts and setup; [Gradle locks](https://docs.gradle.org/current/userguide/dependency_locking.html): generation and configuration scope; [Gradle verification](https://docs.gradle.org/current/userguide/dependency_verification.html): hashes and initial trust. Results above are our own execution.

Official POMs of the selected direct AndroidX dependencies declare Apache-2.0; [Kotlin](https://kotlinlang.org/docs/faq.html#is-kotlin-free) declares Apache-2.0 and [JUnit 4](https://junit.org/junit4/license.html), EPL-1.0. Gradle preserves its license text with third-party notices. Those licenses are independent from the original code's MPL-2.0, and this inventory does not cover every transitive dependency or redistribution requirement.

Physical devices, API 26 or 36 runtimes, TalkBack, exhaustive performance/security tests, process recovery, release signing, and publishing were not exercised. Activity recreation testing does not demonstrate recovery after process death. Commands for other hosts are portable by design, not evidence of execution there.
