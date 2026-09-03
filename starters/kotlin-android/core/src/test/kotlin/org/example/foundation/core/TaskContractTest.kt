// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
package org.example.foundation.core

import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import org.example.foundation.core.adapters.MemoryTaskRepository
import org.example.foundation.core.application.TaskRepository
import org.example.foundation.core.application.TaskService
import org.example.foundation.core.domain.Task
import org.example.foundation.core.domain.TaskError
import org.example.foundation.core.domain.TaskResult
import org.example.foundation.core.domain.createTask
import org.example.foundation.core.domain.toggleTask
import org.example.foundation.core.domain.validateTitle
import org.junit.Assert.*
import org.junit.Test

class TaskContractTest {
    private fun <T> value(result: TaskResult<T>): T = (result as TaskResult.Success).value

    private fun service(repository: TaskRepository = MemoryTaskRepository()): TaskService {
        var id = 0
        return TaskService(repository, { "task-${++id}" }, { 1234L })
    }

    @Test fun titleTrimsWhitespaceAndPreservesText() {
        assertEquals(TaskResult.Success("Revisar base"), validateTitle("  Revisar base  "))
    }

    @Test fun titleRejectsEmptyWrongTypesAndControls() {
        for (input in listOf(null, false, 0, "", "   ", "a\nb", "a\u0000b", "a\u2028b", "a\u2029b", "\uD800", "\uDC00", "\uD800a")) {
            assertEquals(TaskResult.Failure(TaskError.INVALID_TITLE), validateTitle(input))
        }
    }

    @Test fun titleBoundaryCountsUnicodeCodePointsNotUtf16Units() {
        assertEquals(TaskResult.Success("😀".repeat(80)), validateTitle("😀".repeat(80)))
        assertEquals(TaskResult.Failure(TaskError.TITLE_TOO_LONG), validateTitle("😀".repeat(81)))
    }

    @Test fun identityBoundariesAreExplicit() {
        assertTrue(createTask("a", "One", 0) is TaskResult.Success)
        assertTrue(createTask("a".repeat(100), "One", 0) is TaskResult.Success)
        for (id in listOf("", "../other", "two ids", "a".repeat(101))) {
            assertEquals(TaskResult.Failure(TaskError.INVALID_ID), createTask(id, "One", 0))
        }
    }

    @Test fun timestampBoundsAreExplicit() {
        assertTrue(createTask("a", "One", 0) is TaskResult.Success)
        assertTrue(createTask("a", "One", 8_640_000_000_000_000) is TaskResult.Success)
        for (time in listOf(-1L, Long.MIN_VALUE, 8_640_000_000_000_001, Long.MAX_VALUE)) {
            assertEquals(TaskResult.Failure(TaskError.INVALID_TIME), createTask("a", "One", time))
        }
    }

    @Test fun togglingCreatesANewValueAndReopens() {
        val original = value(createTask("1", "One", 0))
        val completed = toggleTask(original)
        assertFalse(original.completed)
        assertTrue(completed.completed)
        assertEquals(original, toggleTask(completed))
    }

    @Test fun constructorsAndCopiesCannotBypassInvariants() {
        val original = Task("one", "Valid", false, 0L)
        val invalidConstructors: List<() -> Task> = listOf(
            { Task("", "Valid", false, 0L) },
            { Task("one", "", false, 0L) },
            { Task("one", " untrimmed ", false, 0L) },
            { Task("one", "Valid", false, -1L) },
            { original.copy(id = "bad id") },
            { original.copy(title = "a".repeat(81)) },
            { original.copy(title = "\uD800") },
            { original.copy(createdAtEpochMs = Long.MAX_VALUE) },
        )
        invalidConstructors.forEach { construct -> assertThrows(IllegalArgumentException::class.java) { construct() } }
        assertEquals(Task("one", "Valid", false, 0L), original)
    }

    @Test fun useCasesStartEmptyAndUseInjectedDependencies() {
        val service = service()
        assertEquals(emptyList<Task>(), value(service.list()))
        assertEquals(Task("task-1", "One", false, 1234), value(service.add(" One ")))
        service.add("Two")
        assertEquals(listOf("One", "Two"), value(service.list()).map { it.title })
    }

    @Test fun invalidTitlesDoNotConsumeIdentityOrTime() {
        val repository = MemoryTaskRepository()
        val service = TaskService(repository, { error("must not run") }, { error("must not run") })
        assertEquals(TaskResult.Failure(TaskError.INVALID_TITLE), service.add(null))
        assertEquals(emptyList<Task>(), value(repository.list()))
    }

    @Test fun duplicateIdentityDoesNotOverwrite() {
        val service = TaskService(MemoryTaskRepository(), { "fixed" }, { 0L })
        service.add("Original")
        assertEquals(TaskResult.Failure(TaskError.DUPLICATE_ID), service.add("Replacement"))
        assertEquals(listOf("Original"), value(service.list()).map { it.title })
    }

    @Test fun missingTasksAndIdentityChangingTransformsFailUnchanged() {
        val repository = MemoryTaskRepository()
        val service = service(repository)
        service.add("One")
        assertEquals(TaskResult.Failure(TaskError.NOT_FOUND), service.toggle("missing"))
        assertEquals(TaskResult.Failure(TaskError.INVALID_ID), repository.update("task-1") { it.copy(id = "other") })
        assertEquals(listOf("task-1"), value(service.list()).map { it.id })
    }

    @Test fun snapshotsAndInstancesAreIndependent() {
        val first = service()
        val second = service()
        first.add("One")
        val snapshot = value(first.list())
        first.toggle("task-1")
        first.add("Two")
        assertEquals(1, snapshot.size)
        assertFalse(snapshot.single().completed)
        assertEquals(emptyList<Task>(), value(second.list()))
    }

    @Test fun dependencyFailuresAndInvalidValuesDoNotSave() {
        val repository = MemoryTaskRepository()
        assertEquals(TaskResult.Failure(TaskError.DEPENDENCY_FAILURE), TaskService(repository, { error("private detail") }, { 0L }).add("One"))
        assertEquals(TaskResult.Failure(TaskError.INVALID_ID), TaskService(repository, { "" }, { 0L }).add("One"))
        assertEquals(TaskResult.Failure(TaskError.INVALID_TIME), TaskService(repository, { "a" }, { -1L }).add("One"))
        assertEquals(emptyList<Task>(), value(repository.list()))
    }

    @Test fun storageErrorsAreTypedAndDoNotRetryOrLeakDetails() {
        var calls = 0
        val repository = object : TaskRepository {
            override fun list(): TaskResult<List<Task>> { calls++; error("private storage detail") }
            override fun add(task: Task): TaskResult<Task> { calls++; error("private storage detail") }
            override fun update(id: String, transform: (Task) -> Task): TaskResult<Task> { calls++; error("private storage detail") }
        }
        val service = service(repository)
        assertEquals(TaskResult.Failure(TaskError.STORAGE_FAILURE), service.list())
        assertEquals(TaskResult.Failure(TaskError.STORAGE_FAILURE), service.add("One"))
        assertEquals(TaskResult.Failure(TaskError.STORAGE_FAILURE), service.toggle("1"))
        assertEquals(3, calls)
    }

    @Test(timeout = 10_000) fun twoThreadsDoNotLoseAtomicToggleUpdates() {
        val service = service()
        service.add("One")
        val start = CountDownLatch(1)
        val executor = Executors.newFixedThreadPool(2)
        try {
            val futures = (1..2).map {
                executor.submit {
                    start.await()
                    repeat(100) { assertTrue(service.toggle("task-1") is TaskResult.Success) }
                }
            }
            start.countDown()
            futures.forEach { it.get(5, TimeUnit.SECONDS) }
            assertFalse(value(service.list()).single().completed)
        } finally {
            executor.shutdownNow()
            assertTrue(executor.awaitTermination(2, TimeUnit.SECONDS))
        }
    }
}
