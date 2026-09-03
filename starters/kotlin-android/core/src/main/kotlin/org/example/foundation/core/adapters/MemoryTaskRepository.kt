package org.example.foundation.core.adapters

import org.example.foundation.core.application.TaskRepository
import org.example.foundation.core.domain.Task
import org.example.foundation.core.domain.TaskError
import org.example.foundation.core.domain.TaskResult

class MemoryTaskRepository : TaskRepository {
    private val tasks = linkedMapOf<String, Task>()

    @Synchronized
    override fun list(): TaskResult<List<Task>> = TaskResult.Success(tasks.values.toList())

    @Synchronized
    override fun add(task: Task): TaskResult<Task> {
        if (tasks.containsKey(task.id)) return TaskResult.Failure(TaskError.DUPLICATE_ID)
        tasks[task.id] = task
        return TaskResult.Success(task)
    }

    @Synchronized
    override fun update(id: String, transform: (Task) -> Task): TaskResult<Task> {
        val current = tasks[id] ?: return TaskResult.Failure(TaskError.NOT_FOUND)
        val updated = transform(current)
        if (updated.id != id) return TaskResult.Failure(TaskError.INVALID_ID)
        tasks[id] = updated
        return TaskResult.Success(updated)
    }
}
