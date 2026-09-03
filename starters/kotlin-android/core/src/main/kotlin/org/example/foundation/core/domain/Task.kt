// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
package org.example.foundation.core.domain

const val MAX_TITLE_CODE_POINTS = 80
private val TASK_ID = Regex("[A-Za-z0-9_-]{1,100}")
private val TASK_TIME_RANGE = 0L..8_640_000_000_000_000L

enum class TaskError {
    INVALID_TITLE, TITLE_TOO_LONG, INVALID_ID, INVALID_TIME,
    NOT_FOUND, DUPLICATE_ID, STORAGE_FAILURE, DEPENDENCY_FAILURE,
}

sealed interface TaskResult<out T> {
    data class Success<T>(val value: T) : TaskResult<T>
    data class Failure(val error: TaskError) : TaskResult<Nothing>
}

data class Task(
    val id: String,
    val title: String,
    val completed: Boolean,
    val createdAtEpochMs: Long?,
) {
    init {
        require(TASK_ID.matches(id)) { "Invalid task identifier" }
        require(createdAtEpochMs == null || createdAtEpochMs in TASK_TIME_RANGE) { "Invalid creation time" }
        require(validateTitle(title) == TaskResult.Success(title)) { "Invalid or untrimmed task title" }
    }
}

private fun String.hasUnpairedSurrogate(): Boolean {
    var index = 0
    while (index < length) {
        val character = this[index]
        if (character.isHighSurrogate()) {
            if (index + 1 >= length || !this[index + 1].isLowSurrogate()) return true
            index += 2
        } else {
            if (character.isLowSurrogate()) return true
            index++
        }
    }
    return false
}

fun validateTitle(input: Any?): TaskResult<String> {
    if (input !is String) return TaskResult.Failure(TaskError.INVALID_TITLE)
    val title = input.trim()
    if (title.isEmpty() || title.hasUnpairedSurrogate() || title.any { it.isISOControl() || it == '\u2028' || it == '\u2029' }) {
        return TaskResult.Failure(TaskError.INVALID_TITLE)
    }
    if (title.codePointCount(0, title.length) > MAX_TITLE_CODE_POINTS) {
        return TaskResult.Failure(TaskError.TITLE_TOO_LONG)
    }
    return TaskResult.Success(title)
}

fun createTask(id: String, title: Any?, createdAtEpochMs: Long): TaskResult<Task> {
    val normalized = validateTitle(title)
    if (normalized is TaskResult.Failure) return normalized
    if (!TASK_ID.matches(id)) return TaskResult.Failure(TaskError.INVALID_ID)
    if (createdAtEpochMs !in TASK_TIME_RANGE) return TaskResult.Failure(TaskError.INVALID_TIME)
    return TaskResult.Success(Task(id, (normalized as TaskResult.Success).value, false, createdAtEpochMs))
}

fun toggleTask(task: Task): Task = task.copy(completed = !task.completed)
