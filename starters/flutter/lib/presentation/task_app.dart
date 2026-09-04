// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../application/task_controller.dart';
import '../application/task_repository.dart';
import '../infrastructure/memory_task_repository.dart';
import '../l10n/strings.dart';

class TaskApp extends StatefulWidget {
  const TaskApp({super.key, this.repository, this.remoteMode = false});

  final bool remoteMode;

  final TaskRepository? repository;

  @override
  State<TaskApp> createState() => _TaskAppState();
}

class _TaskAppState extends State<TaskApp> {
  late final TaskController _controller;
  final TextEditingController _title = TextEditingController();
  Locale _locale = const Locale('es', '419');

  @override
  void initState() {
    super.initState();
    _controller = TaskController(widget.repository ?? MemoryTaskRepository());
    unawaited(_controller.load());
  }

  @override
  void dispose() {
    _title.dispose();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _add() async {
    final added = await _controller.add(_title.text);
    if (added && mounted) _title.clear();
  }

  @override
  Widget build(BuildContext context) {
    final strings = AppStrings.forLanguage(_locale.languageCode);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: strings.appTitle,
      locale: _locale,
      supportedLocales: const [Locale('es', '419'), Locale('en', 'US')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.indigo,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.indigo,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      themeMode: ThemeMode.system,
      home: Scaffold(
        appBar: AppBar(title: Text(strings.appTitle)),
        body: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 840),
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, _) => CustomScrollView(
                  slivers: [
                    SliverPadding(
                      padding: const EdgeInsets.all(16),
                      sliver: SliverToBoxAdapter(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            DropdownButtonFormField<String>(
                              key: const Key('locale-picker'),
                              initialValue: _locale.languageCode,
                              isExpanded: true,
                              decoration: InputDecoration(
                                labelText: strings.language,
                                border: const OutlineInputBorder(),
                              ),
                              items: const [
                                DropdownMenuItem(
                                  value: 'es',
                                  child: Text('Español (Latinoamérica)'),
                                ),
                                DropdownMenuItem(
                                  value: 'en',
                                  child: Text('English (United States)'),
                                ),
                              ],
                              onChanged: (value) {
                                if (value == null) return;
                                setState(() {
                                  _locale = value == 'en'
                                      ? const Locale('en', 'US')
                                      : const Locale('es', '419');
                                });
                              },
                            ),
                            const SizedBox(height: 16),
                            Text(
                              strings.example,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              widget.remoteMode
                                  ? strings.remoteNotice
                                  : strings.memoryNotice,
                            ),
                            const SizedBox(height: 16),
                            TextField(
                              key: const Key('task-title'),
                              controller: _title,
                              enabled: !_controller.busy,
                              decoration: InputDecoration(
                                labelText: strings.taskTitle,
                                border: const OutlineInputBorder(),
                              ),
                              onSubmitted: (_) => _add(),
                            ),
                            const SizedBox(height: 8),
                            Wrap(
                              spacing: 8,
                              children: [
                                FilledButton.icon(
                                  key: const Key('add-task'),
                                  onPressed: _controller.busy ? null : _add,
                                  icon: const Icon(Icons.add),
                                  label: Text(strings.add),
                                ),
                                IconButton(
                                  key: const Key('reload-tasks'),
                                  onPressed: _controller.busy
                                      ? null
                                      : _controller.load,
                                  tooltip: strings.reload,
                                  icon: const Icon(Icons.refresh),
                                ),
                              ],
                            ),
                            if (_controller.busy)
                              const LinearProgressIndicator(),
                            if (_controller.error case final issue?)
                              MaterialBanner(
                                key: const Key('task-error'),
                                content: Semantics(
                                  liveRegion: true,
                                  child: Text(strings.error(issue)),
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: _controller.clearError,
                                    child: Text(strings.dismiss),
                                  ),
                                ],
                              ),
                          ],
                        ),
                      ),
                    ),
                    if (_controller.items.isEmpty && !_controller.busy)
                      SliverPadding(
                        padding: const EdgeInsets.all(24),
                        sliver: SliverToBoxAdapter(
                          child: Text(
                            strings.empty,
                            key: const Key('empty-state'),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    SliverList.builder(
                      itemCount: _controller.items.length,
                      itemBuilder: (context, index) {
                        final item = _controller.items[index];
                        return CheckboxListTile(
                          key: Key(item.id),
                          title: Text(item.title.value),
                          value: item.completed,
                          onChanged: _controller.busy
                              ? null
                              : (value) => _controller.setCompleted(
                                  item.id,
                                  value ?? false,
                                ),
                        );
                      },
                    ),
                    const SliverToBoxAdapter(child: SizedBox(height: 24)),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
