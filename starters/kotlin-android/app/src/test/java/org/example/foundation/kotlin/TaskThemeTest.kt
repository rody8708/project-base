// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
package org.example.foundation.kotlin

import androidx.compose.ui.graphics.luminance
import org.junit.Assert.assertTrue
import org.junit.Test

class TaskThemeTest {
    @Test
    fun lightAndDarkSchemesHaveDistinctAccessibleSurfaces() {
        val light = foundationColorScheme(false)
        val dark = foundationColorScheme(true)

        assertTrue(light.background.luminance() > dark.background.luminance())
        assertTrue(light.onBackground.luminance() < light.background.luminance())
        assertTrue(dark.onBackground.luminance() > dark.background.luminance())
    }
}
