package org.example.foundation.kotlin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import org.example.foundation.core.adapters.MemoryTaskRepository
import org.example.foundation.core.application.TaskService
import java.util.Locale
import java.util.UUID

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val factory = viewModelFactory {
            initializer {
                TaskViewModel(
                    TaskService(if (BuildConfig.API_BASE_URL.isEmpty()) MemoryTaskRepository() else HttpTaskRepository(BuildConfig.API_BASE_URL), { UUID.randomUUID().toString() }, System::currentTimeMillis),
                    if (Locale.getDefault().language == "es") AppLanguage.SPANISH else AppLanguage.ENGLISH,
                    remote = BuildConfig.API_BASE_URL.isNotEmpty(),
                )
            }
        }
        val model = ViewModelProvider(this, factory)[TaskViewModel::class.java]
        setContent { TaskScreen(model) }
    }
}
