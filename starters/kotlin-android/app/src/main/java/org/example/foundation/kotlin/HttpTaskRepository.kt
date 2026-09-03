package org.example.foundation.kotlin

import org.example.foundation.core.application.TaskRepository
import org.example.foundation.core.domain.Task
import org.example.foundation.core.domain.TaskError
import org.example.foundation.core.domain.TaskResult
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URI

/** Android transport adapter. The core has no JSON, HTTP, SQL or framework dependency. */
class HttpTaskRepository(baseUrl: String, private val tokenProvider: () -> String? = { null }) : TaskRepository {
    private val base = URI(baseUrl)
    private var snapshots = mutableMapOf<String, Pair<Task, Int>>()
    private var bound = false
    private var sessionToken: String? = null
    init {
        require(base.scheme == "https" || (base.scheme == "http" && base.host in listOf("127.0.0.1", "localhost", "[::1]", "10.0.2.2")))
        require(base.userInfo == null && base.query == null && base.fragment == null && base.path.matches(Regex(".*/api/v1/?")))
    }

    private fun request(path: String, method: String = "GET", body: JSONObject? = null): JSONObject {
        val connection = URI(base.toString().trimEnd('/') + path).toURL().openConnection() as HttpURLConnection
        try {
            connection.requestMethod = method
            connection.instanceFollowRedirects = false
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            connection.useCaches = false
            connection.setRequestProperty("Accept", "application/json")
            val currentToken = tokenProvider()
            if (bound && currentToken != sessionToken) {
                snapshots.clear()
                error("Session changed; recreate the repository and clear UI state.")
            }
            bound = true
            sessionToken = currentToken
            currentToken?.let { token ->
                require(token.length == 64 && token.matches(Regex("[0-9a-f]{64}")))
                connection.setRequestProperty("Authorization", "Bearer $token")
            }
            if (body != null) {
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")
                val bytes = body.toString().toByteArray(Charsets.UTF_8)
                connection.setFixedLengthStreamingMode(bytes.size)
                connection.outputStream.use { it.write(bytes) }
            }
            check(connection.responseCode == if (method == "POST") 201 else 200)
            check(connection.contentType?.startsWith("application/json") == true)
            val bytes = connection.inputStream.use { input ->
                val output = java.io.ByteArrayOutputStream()
                val buffer = ByteArray(8192)
                while (true) {
                    val count = input.read(buffer)
                    if (count == -1) break
                    check(output.size() + count <= 1048576)
                    output.write(buffer, 0, count)
                }
                output.toByteArray()
            }
            val text = Charsets.UTF_8.newDecoder().decode(java.nio.ByteBuffer.wrap(bytes)).toString()
            return JSONObject(text)
        } finally { connection.disconnect() }
    }

    private fun decode(row: JSONObject): Pair<Task, Int> {
        val id = row.get("id")
        val title = row.get("title")
        val completed = row.get("completed")
        val version = row.get("version")
        require(id is String && id.matches(Regex("[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}")))
        require(title is String && completed is Boolean && version is Int && version in 1..2147483646)
        return Task(id, title, completed, null) to version
    }

    private inline fun <T> run(operation: () -> T): TaskResult<T> = try {
        TaskResult.Success(operation())
    } catch (_: Exception) {
        // No automatic retry, including conflicts and uncertain committed writes.
        TaskResult.Failure(TaskError.STORAGE_FAILURE)
    }

    override fun list(): TaskResult<List<Task>> = run {
        val rows = linkedMapOf<String, Pair<Task, Int>>()
        var after: String? = null
        var finished = false
        for (page in 0 until 100) {
            val response = request("/tasks?limit=100" + (after?.let { "&after=$it" } ?: ""))
            val data = response.getJSONArray("data")
            require(data.length() <= 100)
            if (data.length() == 0) {
                require(response.has("next_after") && response.isNull("next_after"))
                finished = true
                break
            }
            for (index in 0 until data.length()) {
                val row = decode(data.getJSONObject(index))
                require(!rows.containsKey(row.first.id) && (after == null || row.first.id > after))
                rows[row.first.id] = row
                after = row.first.id
            }
            require(response.get("next_after") == after)
        }
        check(finished)
        snapshots = rows
        rows.values.map { it.first }
    }

    override fun add(task: Task): TaskResult<Task> = run {
        val row = decode(request("/tasks", "POST", JSONObject().put("title", task.title)).getJSONObject("data"))
        snapshots[row.first.id] = row
        row.first
    }

    override fun update(id: String, transform: (Task) -> Task): TaskResult<Task> = run {
        val current = checkNotNull(snapshots[id])
        val next = transform(current.first)
        require(next.id == id && next.title == current.first.title && current.second < 2147483646)
        val row = decode(request("/tasks/$id", "PUT", JSONObject()
            .put("title", next.title).put("completed", next.completed).put("version", current.second)).getJSONObject("data"))
        check(row.first.id == id && row.first.title == next.title && row.first.completed == next.completed && row.second == current.second + 1)
        snapshots[id] = row
        row.first
    }
}
