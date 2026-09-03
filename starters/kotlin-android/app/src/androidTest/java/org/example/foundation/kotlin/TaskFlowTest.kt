package org.example.foundation.kotlin

import androidx.compose.ui.test.assertIsOff
import androidx.compose.ui.test.assertIsOn
import androidx.compose.ui.test.assertTextContains
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.isToggleable
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performImeAction
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performTextReplacement
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class TaskFlowTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()

    @Test fun emptyValidationAddToggleReopenAndLanguage() {
        compose.onNodeWithTag("language-es-419").performScrollTo().performClick()
        compose.onNodeWithTag("empty-state").performScrollTo().assertTextContains("Tu lista comienza aquí")
        compose.onNodeWithTag("add-task").performScrollTo().performClick()
        compose.onNodeWithTag("task-error").performScrollTo().assertTextContains("título no vacío", substring = true)
        compose.onNodeWithTag("task-title").performScrollTo().performTextReplacement("Revisar contrato")
        compose.onNodeWithTag("task-title").performImeAction()
        compose.onNodeWithTag("task-error").assertDoesNotExist()
        val task = compose.onNode(hasText("Revisar contrato") and isToggleable())
        task.performScrollTo().assertIsOff().performClick().assertIsOn().performClick().assertIsOff()
        compose.onNodeWithTag("language-en-US").performScrollTo().performClick()
        compose.onNodeWithTag("summary").performScrollTo().assertTextContains("Total: 1", substring = true)
        task.performScrollTo().assertIsOff()
    }

    @Test fun boundariesLiteralTextAndActivityRecreation() {
        compose.onNodeWithTag("task-title").performScrollTo().performTextReplacement("a".repeat(81))
        compose.onNodeWithTag("add-task").performScrollTo().performClick()
        compose.onNodeWithTag("task-error").performScrollTo().assertTextContains("80", substring = true)
        compose.onNodeWithTag("task-title").performScrollTo().performTextReplacement("<b>Literal text</b>")
        compose.onNodeWithTag("add-task").performScrollTo().performClick()
        compose.onNode(hasText("<b>Literal text</b>") and isToggleable()).performScrollTo().performClick()
        compose.activityRule.scenario.recreate()
        compose.onNode(hasText("<b>Literal text</b>") and isToggleable()).performScrollTo().assertIsOn()
    }
}
