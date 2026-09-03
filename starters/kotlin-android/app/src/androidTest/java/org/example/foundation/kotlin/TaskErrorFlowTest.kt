// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
package org.example.foundation.kotlin

import androidx.compose.ui.test.assertTextContains
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performScrollTo
import org.example.foundation.core.application.TaskRepository
import org.example.foundation.core.application.TaskService
import org.example.foundation.core.domain.Task
import org.example.foundation.core.domain.TaskError
import org.example.foundation.core.domain.TaskResult
import org.junit.Rule
import org.junit.Test

class TaskErrorFlowTest {
    @get:Rule val compose = createComposeRule()

    @Test fun storageErrorIsVisibleWithoutPrivateDetails() {
        val repository = object : TaskRepository {
            override fun list(): TaskResult<List<Task>> = TaskResult.Failure(TaskError.STORAGE_FAILURE)
            override fun add(task: Task): TaskResult<Task> = TaskResult.Failure(TaskError.STORAGE_FAILURE)
            override fun update(id: String, transform: (Task) -> Task): TaskResult<Task> = TaskResult.Failure(TaskError.STORAGE_FAILURE)
        }
        val model = TaskViewModel(TaskService(repository, { "1" }, { 0L }), AppLanguage.SPANISH)
        compose.setContent { TaskScreen(model) }
        compose.onNodeWithTag("task-error").performScrollTo().assertTextContains("No fue posible confirmar", substring = true)
    }
}
