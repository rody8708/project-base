package org.example.foundation.kotlin

import org.example.foundation.core.adapters.MemoryTaskRepository
import org.example.foundation.core.application.TaskRepository
import org.example.foundation.core.application.TaskService
import org.example.foundation.core.domain.Task
import org.example.foundation.core.domain.TaskError
import org.example.foundation.core.domain.TaskResult
import org.junit.Assert.*
import org.junit.Test

class TaskViewModelTest {
    private fun model(): TaskViewModel {
        var id = 0
        return TaskViewModel(TaskService(MemoryTaskRepository(), { "task-${++id}" }, { 0L }), AppLanguage.ENGLISH)
    }

    @Test fun invalidDraftRemainsAndCorrectionClearsError() {
        val model = model()
        model.changeDraft("x".repeat(81))
        assertFalse(model.add())
        assertEquals(TaskError.TITLE_TOO_LONG, model.state.error)
        assertEquals("x".repeat(81), model.state.draft)
        model.changeDraft("x".repeat(80))
        assertTrue(model.add())
        assertNull(model.state.error)
        assertEquals("", model.state.draft)
        assertEquals(1, model.state.tasks.size)
    }

    @Test fun languageChangesPreserveUserTextAndCompletion() {
        val model = model()
        model.changeDraft("User text")
        model.add()
        model.toggle("task-1")
        model.changeLanguage(AppLanguage.SPANISH)
        assertEquals("User text", model.state.tasks.single().title)
        assertTrue(model.state.tasks.single().completed)
        assertEquals(AppLanguage.SPANISH, model.state.language)
        model.toggle("task-1")
        assertFalse(model.state.tasks.single().completed)
    }

    @Test fun failedStorageDoesNotClearDraftOrInventSuccess() {
        val repository = object : TaskRepository {
            override fun list(): TaskResult<List<Task>> = TaskResult.Failure(TaskError.STORAGE_FAILURE)
            override fun add(task: Task): TaskResult<Task> = TaskResult.Failure(TaskError.STORAGE_FAILURE)
            override fun update(id: String, transform: (Task) -> Task): TaskResult<Task> = TaskResult.Failure(TaskError.STORAGE_FAILURE)
        }
        val model = TaskViewModel(TaskService(repository, { "1" }, { 0L }), AppLanguage.ENGLISH)
        assertEquals(TaskError.STORAGE_FAILURE, model.state.error)
        model.changeDraft("Keep draft")
        assertFalse(model.add())
        assertEquals("Keep draft", model.state.draft)
        assertTrue(model.state.tasks.isEmpty())
    }

    @Test fun everyKnownErrorHasAResourceMapping() {
        assertEquals(TaskError.entries.size, TaskError.entries.map(::errorResource).toSet().size)
    }

    @Test fun confirmedAddStaysVisibleWhenSubsequentReadsFail() {
        val repository = FailingSubsequentReadsRepository()
        val model = TaskViewModel(TaskService(repository, { "one" }, { 0L }), AppLanguage.ENGLISH)
        model.changeDraft("  Confirmed  ")

        assertTrue(model.add())
        assertEquals(Task("one", "Confirmed", false, 0L), model.state.tasks.single())
        assertEquals("", model.state.draft)
        assertNull(model.state.error)
        assertEquals(1, repository.reads)

        model.reload()
        assertEquals(TaskError.STORAGE_FAILURE, model.state.error)
        assertEquals("Confirmed", model.state.tasks.single().title)
        assertEquals(2, repository.reads)
    }

    @Test fun confirmedToggleStaysVisibleWhenSubsequentReadsFail() {
        val original = Task("one", "Confirmed", false, 0L)
        val repository = FailingSubsequentReadsRepository(listOf(original))
        val model = TaskViewModel(TaskService(repository, { "unused" }, { 0L }), AppLanguage.ENGLISH)

        model.toggle("one")
        assertEquals(original.copy(completed = true), model.state.tasks.single())
        assertNull(model.state.error)
        assertEquals(1, repository.reads)

        model.reload()
        assertEquals(TaskError.STORAGE_FAILURE, model.state.error)
        assertEquals(original.copy(completed = true), model.state.tasks.single())
        assertEquals(2, repository.reads)
    }

    private class FailingSubsequentReadsRepository(initial: List<Task> = emptyList()) : TaskRepository {
        private val backing = MemoryTaskRepository()
        var reads = 0
            private set

        init { initial.forEach { backing.add(it) } }

        override fun list(): TaskResult<List<Task>> {
            reads++
            return if (reads == 1) backing.list() else TaskResult.Failure(TaskError.STORAGE_FAILURE)
        }

        override fun add(task: Task): TaskResult<Task> = backing.add(task)
        override fun update(id: String, transform: (Task) -> Task): TaskResult<Task> = backing.update(id, transform)
    }
}
