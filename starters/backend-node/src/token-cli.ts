// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import { openStore } from './store.js';
import { issueToken } from './application.js';
import type { Permission } from './contracts.js';

try {
  if(process.argv.length!==5) throw new Error();
  const permissions=process.argv[3]!.split(',') as Permission[];
  if(permissions.length<1||permissions.some(value=>!['tasks:read','tasks:write'].includes(value))) throw new Error();
  const store=await openStore();
  try {
    const token=await issueToken(store,process.argv[2]!,permissions,Number(process.argv[4]));
    process.stdout.write(JSON.stringify({token,expiresWithinHours:Number(process.argv[4]),storeSecurely:true})+'\n');
  } finally { await store.close(); }
} catch { process.stderr.write('TOKEN_FAILED: use SUBJECT tasks:read,tasks:write HOURS_1_TO_24; token output is a secret.\n'); process.exitCode=1; }
