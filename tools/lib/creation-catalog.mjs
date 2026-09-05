// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { SOLUTION_PRESETS } from './project-export.mjs';

const TYPES = [
  ['web', 'Web', 'Web'],
  ['mobile', 'Móvil', 'Mobile'],
  ['desktop', 'Escritorio', 'Desktop'],
  ['api', 'Solo API/backend', 'API/backend only'],
];
const PRESETS = [
  ['simple-website', 'web', ['HTML', 'CSS', 'JavaScript'], null, 'HTML + CSS + JavaScript — sin backend', 'HTML + CSS + JavaScript — no backend'],
  ['web-app', 'web', ['TypeScript'], 'React', 'React + TypeScript — con API separada', 'React + TypeScript — with a separate API'],
  ['mobile-app', 'mobile', ['Dart'], 'Flutter', 'Flutter + Dart — móvil; iOS pendiente de validación', 'Flutter + Dart — mobile; iOS validation pending'],
  ['android-app', 'mobile', ['Kotlin'], 'Jetpack Compose', 'Kotlin + Jetpack Compose — Android nativo', 'Kotlin + Jetpack Compose — native Android'],
  ['desktop-app', 'desktop', ['Dart'], 'Flutter', 'Flutter + Dart — escritorio; macOS pendiente de validación', 'Flutter + Dart — desktop; macOS validation pending'],
  ['api-only', 'api', [], null, 'API independiente — elige el backend a continuación', 'Standalone API — choose the backend next'],
];
const BACKENDS = [
  ['backend-node', 'TypeScript', null, 'TypeScript + Node.js — sin framework de aplicación', 'TypeScript + Node.js — no application framework'],
  ['backend-php', 'PHP', 'Laravel', 'PHP + Laravel', 'PHP + Laravel'],
  ['backend-python', 'Python', 'FastAPI', 'Python + FastAPI', 'Python + FastAPI'],
];

// Each caller receives an independent, serializable view; UI code cannot mutate
// the shared catalog or invent export combinations.
export function getCreationCatalog(language = 'es-419') {
  if (!['es-419', 'en-US'].includes(language)) throw new RangeError('Unsupported catalog language.');
  const spanish = language === 'es-419';
  return {
    language,
    types: TYPES.map(([id, es, en]) => ({ id, description: spanish ? es : en })),
    presets: PRESETS.map(([id, type, languages, framework, es, en]) => ({
      id, type, languages: [...languages], framework,
      description: spanish ? es : en,
      client: SOLUTION_PRESETS[id].client,
      requiresBackend: SOLUTION_PRESETS[id].backend,
    })),
    backends: BACKENDS.map(([id, languageName, framework, es, en]) => ({
      id, languages: [languageName], framework, description: spanish ? es : en,
    })),
  };
}
