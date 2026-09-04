#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import os from 'node:os';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { pathToFileURL } from 'node:url';
import { createSolution, ExportError, validateProjectName } from './lib/project-export.mjs';

const COPY = {
  'es-419': {
    title: '\nProject Base — crear una aplicación\nResponde unas preguntas sencillas. No necesitas elegir una arquitectura manualmente.\n',
    type: '¿Qué quieres crear?', types: ['Sitio web sencillo (sin backend)', 'Aplicación web completa', 'Aplicación móvil Flutter', 'Aplicación de escritorio Flutter', 'Aplicación Android nativa Kotlin', 'Solo una API/backend'],
    backend: 'Backend: presiona Enter para la opción recomendada; elige PHP solo si ya sabes que lo necesitas.', backends: ['Node.js sin framework de aplicación', 'PHP con Laravel'], recommended: 'recomendado', select: 'Selecciona', invalidChoice: 'Escribe el número de una opción.',
    name: '\nNombre corto (ejemplo: mi-inventario): ', invalidName: 'Usa hasta 59 letras minúsculas, números y guiones; debe comenzar con una letra.',
    parent: '\nCarpeta donde guardarlo', create: '\nSe creará:', confirm: '¿Continuar? [S/n]: ', ready: '\nListo. Abre:',
  },
  'en-US': {
    title: '\nProject Base — create an application\nAnswer a few simple questions. You do not need to choose an architecture manually.\n',
    type: 'What do you want to create?', types: ['Simple website (no backend)', 'Complete web application', 'Flutter mobile application', 'Flutter desktop application', 'Native Kotlin Android application', 'API/backend only'],
    backend: 'Backend: press Enter for the recommended option; select PHP only if you already know you need it.', backends: ['Node.js without an application framework', 'PHP with Laravel'], recommended: 'recommended', select: 'Select', invalidChoice: 'Enter an option number.',
    name: '\nShort name (example: my-inventory): ', invalidName: 'Use up to 59 lowercase letters, numbers, and hyphens; it must start with a letter.',
    parent: '\nFolder where it should be saved', create: '\nThis will be created:', confirm: 'Continue? [Y/n]: ', ready: '\nReady. Open:',
  },
};
const PRESETS = ['simple-website', 'web-app', 'mobile-app', 'desktop-app', 'android-app', 'api-only'];

async function choose(reader, writer, copy, question, options, defaultIndex = 0) {
  writer.write(`\n${question}\n`);
  options.forEach((option, index) => writer.write(`  ${index + 1}. ${option[1]}${index === defaultIndex ? ` (${copy.recommended})` : ''}\n`));
  while (true) {
    const answer = (await reader.question(`${copy.select} [${defaultIndex + 1}]: `)).trim();
    const index = answer === '' ? defaultIndex : Number(answer) - 1;
    if (Number.isInteger(index) && options[index]) return options[index][0];
    writer.write(`${copy.invalidChoice}\n`);
  }
}

async function askName(reader, writer, copy) {
  while (true) {
    const value = (await reader.question(copy.name)).trim().toLowerCase();
    try {
      validateProjectName(value);
      if (value.length > 59) throw new Error('Solution name leaves no room for component suffixes.');
      return value;
    } catch { writer.write(`${copy.invalidName}\n`); }
  }
}

export async function interactiveCreate(reader = createInterface({ input, output }), writer = output, settings = {}) {
  try {
    writer.write('\nIdioma / Language\n  1. Español (Latinoamérica)\n  2. English (United States)\n');
    const language = (await reader.question('Selecciona / Select [1]: ')).trim() === '2' ? 'en-US' : 'es-419';
    const copy = COPY[language];
    writer.write(copy.title);
    const preset = await choose(reader, writer, copy, copy.type, PRESETS.map((value, index) => [value, copy.types[index]]), 1);
    const needsBackend = preset !== 'simple-website';
    const backend = needsBackend ? await choose(reader, writer, copy, copy.backend, [
      ['backend-node', copy.backends[0]], ['backend-php', copy.backends[1]],
    ]) : 'backend-node';
    const name = await askName(reader, writer, copy);
    const defaultParent = settings.defaultParent ?? path.join(os.homedir(), 'Project Base Apps');
    const selectedParent = (await reader.question(`${copy.parent} [${defaultParent}]: `)).trim();
    const parent = selectedParent === '' ? defaultParent : path.resolve(selectedParent);
    const destination = path.join(parent, name);
    writer.write(`${copy.create} ${destination}\n`);
    const confirmed = (await reader.question(copy.confirm)).trim().toLowerCase();
    if (confirmed === 'n' || confirmed === 'no') return { result: 'CANCELLED' };
    if (selectedParent === '') await mkdir(parent, { recursive: true });
    const result = await createSolution({ preset, backend, language, name, destination });
    writer.write(`${copy.ready}\n${path.join(result.destination, language === 'es-419' ? result.startHere : 'START-HERE.en-US.md')}\n`);
    return result;
  } finally { reader.close(); }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try { await interactiveCreate(); } catch (error) {
    process.stderr.write(`\nApplication creation failed / No se pudo crear la aplicación: ${error instanceof ExportError ? error.message : 'unexpected error / error inesperado'}\n`);
    if (error.partialDestination) process.stderr.write(`Retained for inspection / Conservado para inspección: ${error.partialDestination}\n`);
    process.exitCode = 1;
  }
}
