// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
package org.example.foundation.kotlin

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import android.os.Handler
import android.os.Looper
import java.util.concurrent.Executors
import org.example.foundation.core.application.TaskService
import org.example.foundation.core.domain.Task
import org.example.foundation.core.domain.TaskError
import org.example.foundation.core.domain.TaskResult

enum class AppLanguage(val tag: String) { ENGLISH("en-US"), SPANISH("es-419") }

data class TaskUiState(
    val tasks: List<Task> = emptyList(),
    val draft: String = "",
    val error: TaskError? = null,
    val language: AppLanguage = AppLanguage.ENGLISH,
    val busy: Boolean = false,
    val remote: Boolean = false,
)

class TaskViewModel(private val service: TaskService, language: AppLanguage, private val remote: Boolean = false) : ViewModel() {
    private val worker = if (remote) Executors.newSingleThreadExecutor() else null
    private val main = if (remote) Handler(Looper.getMainLooper()) else null
    private var cleared = false
    var state by mutableStateOf(TaskUiState(language = language, remote = remote))
        private set

    init { reload() }

    fun changeDraft(value: String) { state = state.copy(draft = value) }
    fun changeLanguage(value: AppLanguage) { state = state.copy(language = value) }

    fun reload() {
        if (remote) {
            schedule({ service.list() }) { result ->
                state = when (result) {
                    is TaskResult.Success -> state.copy(tasks = result.value, error = null)
                    is TaskResult.Failure -> state.copy(error = result.error)
                }
            }
            return
        }
        state = when (val result = service.list()) {
            is TaskResult.Success -> state.copy(tasks = result.value, error = null)
            is TaskResult.Failure -> state.copy(error = result.error)
        }
    }

    fun add(): Boolean {
        if (remote) {
            val title = state.draft
            schedule({ service.add(title) }) { result ->
                state = when (result) {
                    is TaskResult.Success -> state.copy(tasks = withConfirmedTask(result.value), draft = "", error = null)
                    is TaskResult.Failure -> state.copy(error = result.error)
                }
            }
            return false
        }
        return when (val result = service.add(state.draft)) {
        is TaskResult.Success -> {
            state = state.copy(tasks = withConfirmedTask(result.value), draft = "", error = null)
            true
        }
        is TaskResult.Failure -> {
            state = state.copy(error = result.error)
            false
        }
    }
    }

    fun toggle(id: String) {
        if (remote) {
            schedule({ service.toggle(id) }) { result ->
                state = when (result) {
                    is TaskResult.Success -> state.copy(tasks = withConfirmedTask(result.value), error = null)
                    is TaskResult.Failure -> state.copy(error = result.error)
                }
            }
            return
        }
        when (val result = service.toggle(id)) {
            is TaskResult.Success -> { state = state.copy(tasks = withConfirmedTask(result.value), error = null) }
            is TaskResult.Failure -> { state = state.copy(error = result.error) }
        }
    }

    private fun <T> schedule(operation: () -> TaskResult<T>, accept: (TaskResult<T>) -> Unit) {
        if (state.busy || cleared) return
        state = state.copy(busy = true, error = null)
        worker!!.execute {
            val result = try { operation() } catch (_: Exception) { TaskResult.Failure(TaskError.STORAGE_FAILURE) }
            main!!.post {
                if (!cleared) { accept(result); state = state.copy(busy = false) }
            }
        }
    }

    override fun onCleared() {
        cleared = true
        worker?.shutdownNow()
        super.onCleared()
    }

    private fun withConfirmedTask(task: Task): List<Task> =
        if (state.tasks.any { it.id == task.id }) {
            state.tasks.map { if (it.id == task.id) task else it }
        } else {
            state.tasks + task
        }
}
