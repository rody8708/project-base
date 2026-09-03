// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import 'package:flutter/material.dart';

import 'presentation/task_app.dart';
import 'infrastructure/http_task_repository.dart';

void main() {
  const url = String.fromEnvironment('API_BASE_URL');
  runApp(
    TaskApp(
      repository: url.isEmpty ? null : HttpTaskRepository(url),
      remoteMode: url.isNotEmpty,
    ),
  );
}
