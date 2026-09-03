// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
package org.example.foundation.core.application

import org.example.foundation.core.domain.Task
import org.example.foundation.core.domain.TaskError
import org.example.foundation.core.domain.TaskResult
import org.example.foundation.core.domain.createTask
import org.example.foundation.core.domain.toggleTask
import org.example.foundation.core.domain.validateTitle

interface TaskRepository {
    fun list(): TaskResult<List<Task>>
    fun add(task: Task): TaskResult<Task>
    /** Transform the last observed value; remote writes use its version. A failure may have an unknown commit outcome. */
    fun update(id: String, transform: (Task) -> Task): TaskResult<Task>
}

class TaskService(
    private val repository: TaskRepository,
    private val nextId: () -> String,
    private val now: () -> Long,
) {
    fun list(): TaskResult<List<Task>> = storage { repository.list() }

    fun add(title: Any?): TaskResult<Task> {
        val validated = validateTitle(title)
        if (validated is TaskResult.Failure) return validated
        val task = try {
            createTask(nextId(), (validated as TaskResult.Success).value, now())
        } catch (_: Exception) {
            return TaskResult.Failure(TaskError.DEPENDENCY_FAILURE)
        }
        return when (task) {
            is TaskResult.Failure -> task
            is TaskResult.Success -> storage { repository.add(task.value) }
        }
    }

    fun toggle(id: String): TaskResult<Task> = storage { repository.update(id, ::toggleTask) }

    private inline fun <T> storage(operation: () -> TaskResult<T>): TaskResult<T> = try {
        operation()
    } catch (_: Exception) {
        // No automatic retry: an external adapter could have applied an uncertain effect.
        TaskResult.Failure(TaskError.STORAGE_FAILURE)
    }
}
