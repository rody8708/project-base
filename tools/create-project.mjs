#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createProject, ExportError } from './lib/project-export.mjs';

const USAGE = 'node tools/create-project.mjs --template web|web-vanilla|flutter|kotlin-android|backend-php|backend-node|backend-python|backend-php-native --name lowercase-slug --destination ABSOLUTE_LOCAL_PATH';

export function parseArguments(args) {
  if (args.length === 1 && args[0] === '--help') return { help: true };
  const result = {};
  const options = new Map([['--template', 'template'], ['--name', 'name'], ['--destination', 'destination']]);
  for (let index = 0; index < args.length; index += 2) {
    const key = options.get(args[index]);
    if (!key || Object.hasOwn(result, key) || index + 1 >= args.length || args[index + 1].startsWith('--')) {
      throw new ExportError('INVALID_ARGUMENTS', USAGE);
    }
    result[key] = args[index + 1];
  }
  if (Object.keys(result).length !== options.size) throw new ExportError('INVALID_ARGUMENTS', USAGE);
  return result;
}

export async function main(args) {
  const options = parseArguments(args);
  if (options.help) return {
    usage: USAGE,
    doesNotInstallOrBuild: true,
    adoptionRequiresConsumerConfirmation: true,
    capabilityProfileIncluded: true,
  };
  return createProject(options);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    process.stdout.write(`${JSON.stringify(await main(process.argv.slice(2)), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({
      error: error.code ?? 'EXPORT_FAILED',
      message: error.message,
      ...(error.partialDestination ? { partialDestinationRetained: error.partialDestination, action: 'Inspect the partial directory; use a different new destination to retry.' } : {}),
    }, null, 2)}\n`);
    process.exitCode = 1;
  }
}
