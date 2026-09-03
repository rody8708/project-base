import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "org.example.foundation.kotlin"
    compileSdk = 36
    buildToolsVersion = "35.0.0"

    defaultConfig {
        applicationId = "org.example.foundation.kotlin"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.1.0-draft.1"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        val apiUrl = providers.environmentVariable("API_BASE_URL").orElse("").get()
        require(!apiUrl.contains('"') && !apiUrl.contains('\\') && apiUrl.none { it.isISOControl() })
        buildConfigField("String", "API_BASE_URL", "\"$apiUrl\"")
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = true
            signingConfig = null
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    lint {
        abortOnError = true
        warningsAsErrors = true
        // Exact versions are reviewed together; availability and a newer runner SDK are not correctness failures.
        disable += setOf("GradleDependency", "OldTargetApi")
    }
    bundle.language.enableSplit = false
    packaging {
        val notices = setOf(
            "/META-INF/LICENSE", "/META-INF/LICENSE.txt", "/META-INF/NOTICE", "/META-INF/NOTICE.txt",
            "/LICENSE", "/LICENSE.txt", "/NOTICE", "/NOTICE.txt", "/META-INF/AL2.0", "/META-INF/LGPL2.1",
        )
        resources.excludes.removeAll(notices)
        resources.merges += notices
    }
}

kotlin {
    jvmToolchain(21)
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
        allWarningsAsErrors.set(true)
    }
}

dependencies {
    implementation(project(":core"))
    implementation(platform("androidx.compose:compose-bom:2026.02.01"))
    implementation("androidx.activity:activity-compose:1.11.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.4")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation(platform("androidx.compose:compose-bom:2026.02.01"))
    androidTestImplementation("androidx.test.ext:junit:1.3.0")
    androidTestImplementation("androidx.test:runner:1.7.0")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
