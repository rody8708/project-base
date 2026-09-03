package org.example.foundation.kotlin

import android.content.res.Configuration
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.sizeIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import org.example.foundation.core.domain.TaskError
import java.util.Locale

@StringRes
internal fun errorResource(error: TaskError): Int = when (error) {
    TaskError.INVALID_TITLE -> R.string.error_invalid_title
    TaskError.TITLE_TOO_LONG -> R.string.error_title_long
    TaskError.INVALID_ID -> R.string.error_invalid_id
    TaskError.INVALID_TIME -> R.string.error_invalid_time
    TaskError.NOT_FOUND -> R.string.error_not_found
    TaskError.DUPLICATE_ID -> R.string.error_duplicate
    TaskError.STORAGE_FAILURE -> R.string.error_storage
    TaskError.DEPENDENCY_FAILURE -> R.string.error_dependency
}

@Composable
fun TaskScreen(model: TaskViewModel) {
    val state = model.state
    val context = LocalContext.current
    val currentConfiguration = LocalConfiguration.current
    val resources = remember(context, currentConfiguration, state.language) {
        val configuration = Configuration(currentConfiguration)
        configuration.setLocale(Locale.forLanguageTag(state.language.tag))
        context.createConfigurationContext(configuration).resources
    }
    val keyboard = LocalSoftwareKeyboardController.current
    val invalidTitle = state.error == TaskError.INVALID_TITLE || state.error == TaskError.TITLE_TOO_LONG
    val colors = lightColorScheme(primary = Color(0xFF235F53), background = Color(0xFFF4F6F5))

    MaterialTheme(colorScheme = colors) {
        Scaffold { insets ->
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(insets).imePadding(),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                item {
                    Text(resources.getString(R.string.app_name), style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(28.dp))
                    Text(resources.getString(R.string.eyebrow), color = colors.primary, style = MaterialTheme.typography.labelSmall)
                    Text(resources.getString(R.string.page_title), style = MaterialTheme.typography.headlineLarge, modifier = Modifier.semantics { heading() })
                    Text(resources.getString(R.string.introduction), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 12.dp))
                }
                item {
                    Text(resources.getString(R.string.language), style = MaterialTheme.typography.labelLarge)
                    Column {
                        FilterChip(selected = state.language == AppLanguage.ENGLISH, onClick = { model.changeLanguage(AppLanguage.ENGLISH) }, label = { Text(resources.getString(R.string.language_english)) }, modifier = Modifier.testTag("language-en-US"))
                        FilterChip(selected = state.language == AppLanguage.SPANISH, onClick = { model.changeLanguage(AppLanguage.SPANISH) }, label = { Text(resources.getString(R.string.language_spanish)) }, modifier = Modifier.testTag("language-es-419"))
                    }
                }
                item {
                    OutlinedTextField(
                        value = state.draft,
                        onValueChange = model::changeDraft,
                        label = { Text(resources.getString(R.string.new_task)) },
                        supportingText = { Text(resources.getString(R.string.title_hint)) },
                        singleLine = true,
                        enabled = !state.busy,
                        isError = invalidTitle,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { if (model.add()) keyboard?.hide() }),
                        modifier = Modifier.fillMaxWidth().testTag("task-title"),
                    )
                    Button(enabled = !state.busy, onClick = { if (model.add()) keyboard?.hide() }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp).testTag("add-task")) {
                        Text(resources.getString(R.string.add_task))
                    }
                }
                state.error?.let { error ->
                    item {
                        Text(resources.getString(errorResource(error)), color = colors.error, modifier = Modifier.testTag("task-error").semantics { liveRegion = LiveRegionMode.Assertive })
                        if (!invalidTitle) TextButton(onClick = model::reload) { Text(resources.getString(R.string.reload)) }
                    }
                }
                item {
                    Text(resources.getString(R.string.summary, state.tasks.size, state.tasks.count { it.completed }), style = MaterialTheme.typography.titleMedium, modifier = Modifier.testTag("summary").semantics { liveRegion = LiveRegionMode.Polite })
                }
                if (state.tasks.isEmpty()) {
                    item {
                        Text(resources.getString(R.string.empty_title), style = MaterialTheme.typography.titleMedium, modifier = Modifier.testTag("empty-state"))
                        Text(resources.getString(R.string.empty_body), style = MaterialTheme.typography.bodyMedium)
                    }
                }
                items(state.tasks, key = { it.id }) { task ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth().sizeIn(minHeight = 56.dp)
                            .testTag("task-${task.id}")
                            .toggleable(value = task.completed, enabled = !state.busy, role = Role.Checkbox, onValueChange = { model.toggle(task.id) })
                            .semantics(mergeDescendants = true) {},
                    ) {
                        Checkbox(checked = task.completed, onCheckedChange = null)
                        Column(Modifier.padding(start = 12.dp)) {
                            Text(task.title, style = MaterialTheme.typography.bodyLarge, textDecoration = if (task.completed) TextDecoration.LineThrough else TextDecoration.None)
                            Text(resources.getString(if (task.completed) R.string.completed else R.string.pending), style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
                item {
                    Text(resources.getString(if (state.remote) R.string.remote_notice else R.string.memory_notice), style = MaterialTheme.typography.bodySmall)
                    Text(resources.getString(R.string.candidate), style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 16.dp))
                }
            }
        }
    }
}
