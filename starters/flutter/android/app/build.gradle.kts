plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "org.example.foundation_starter"
    // API 36 is required by integration_test and supported by AGP 8.10.1.
    compileSdk = 36
    buildToolsVersion = "35.0.0"
    ndkVersion = "27.0.12077973"

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "org.example.foundation_starter"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = 24
        targetSdk = 36
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            // Configure production signing only in the consuming project.
            // A release must never silently use debug credentials.
            signingConfig = null
        }
    }
}

flutter {
    source = "../.."
}

// Lock only the consuming app, never project files inside the Flutter SDK.
dependencyLocking {
    lockAllConfigurations()
    lockMode = LockMode.STRICT
    // Flutter adds ABI-specific engine modules according to the selected device.
    // SDK preflight pins Flutter; transitive AndroidX/Kotlin versions stay locked.
    ignoredDependencies.add("io.flutter:*")
}
