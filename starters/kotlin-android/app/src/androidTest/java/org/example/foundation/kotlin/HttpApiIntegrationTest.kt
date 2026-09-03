// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
package org.example.foundation.kotlin

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.example.foundation.core.domain.Task
import org.example.foundation.core.domain.TaskResult
import org.junit.Assert.*
import org.junit.Assume.assumeTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.Rule
import androidx.activity.compose.setContent
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.test.performClick
import org.example.foundation.core.application.TaskService
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class HttpApiIntegrationTest {
    private fun testToken(): String {
        val path = InstrumentationRegistry.getArguments().getString("apiTokenFile")
        require(!path.isNullOrEmpty()) { "Private disposable token file required." }
        return org.json.JSONObject(java.io.File(path).readText()).getString("token")
    }
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()

    @Test fun remoteViewModelKeepsNetworkOffTheUiThread() {
        val url = InstrumentationRegistry.getArguments().getString("apiBaseUrl")
        assumeTrue("Explicit isolated apiBaseUrl is required", !url.isNullOrEmpty())
        val token = testToken()
        lateinit var model: TaskViewModel
        compose.runOnUiThread {
            model = TaskViewModel(TaskService(HttpTaskRepository(url!!) { token }, { UUID.randomUUID().toString() }, System::currentTimeMillis), AppLanguage.ENGLISH, remote = true)
            compose.activity.setContent { TaskScreen(model) }
        }
        compose.waitUntil(15000) { !model.state.busy }
        compose.onNodeWithTag("task-title").performTextInput("Kotlin UI HTTP")
        compose.onNodeWithTag("add-task").performClick()
        compose.waitUntil(15000) { !model.state.busy && model.state.tasks.any { it.title == "Kotlin UI HTTP" } }
        assertNull(model.state.error)
        assertEquals("", model.state.draft)
        compose.runOnUiThread { model.reload() }
        compose.waitUntil(15000) { !model.state.busy }
        assertTrue(model.state.tasks.any { it.title == "Kotlin UI HTTP" })
        androidx.lifecycle.ViewModelStore().apply { put("remote-test", model); clear() }
    }
    @Test fun sharedApiPersistsAndRejectsStaleUpdates() {
        val url = InstrumentationRegistry.getArguments().getString("apiBaseUrl")
        assumeTrue("Explicit isolated apiBaseUrl is required", !url.isNullOrEmpty())
        val token = testToken()
        val first = HttpTaskRepository(url!!) { token }
        val second = HttpTaskRepository(url) { token }
        val created = (first.add(Task("local-id", "Kotlin HTTP 🙂", false, 1)) as TaskResult.Success).value
        assertNotEquals("local-id", created.id)
        assertNull(created.createdAtEpochMs)
        val listed = (second.list() as TaskResult.Success).value
        assertTrue(listed.any { it.id == created.id })
        val changed = first.update(created.id) { it.copy(completed = true) }
        assertTrue(changed is TaskResult.Success)
        val conflict = second.update(created.id) { it.copy(completed = false) }
        assertTrue(conflict is TaskResult.Failure)
        val reloaded = (second.list() as TaskResult.Success).value
        assertTrue(reloaded.first { it.id == created.id }.completed)
    }
}
