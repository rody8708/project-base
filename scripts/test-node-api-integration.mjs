// Cross-starter check using only a uniquely owned temporary SQLite database and loopback port.
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';
import assert from 'node:assert/strict';
import { createTaskApi as reactApi } from '../starters/web/src/adapters/task-api.js';
import { createTaskApi as vanillaApi } from '../starters/web-vanilla/src/adapters/task-api.js';

const root=path.resolve(import.meta.dirname,'..'), backend=path.join(root,'starters/backend-node');
const temporary=await mkdtemp(path.join(tmpdir(),'foundation-node-api-')), database=path.join(temporary,'data.sqlite');
const environment={...process.env,APP_ENV:'testing',DB_DATABASE:database,API_ALLOWED_ORIGINS:'http://127.0.0.1:5173'};
let server;
const run=(args,capture=false)=>new Promise((resolve,reject)=>{let output='';const child=spawn(args[0],args.slice(1),{cwd:backend,env:environment,windowsHide:true,stdio:['ignore',capture?'pipe':'ignore','pipe']});child.stdout?.on('data',data=>output+=data);child.on('error',reject);child.on('exit',code=>code===0?resolve(output):reject(new Error('Owned Node command failed.')));});
try {
  await run([process.execPath,'node_modules/typescript/bin/tsc','-p','tsconfig.json']);
  const credential=JSON.parse(await run(['node','dist/src/token-cli.js','integration-owner','tasks:read,tasks:write','1'],true));
  const socket=net.createServer(); await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve)); const port=socket.address().port; await new Promise(resolve=>socket.close(resolve));
  environment.PORT=String(port); server=spawn('node',['dist/src/server.js'],{cwd:backend,env:environment,windowsHide:true,stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Node server timeout.')),10000);server.stdout.on('data',data=>{if(data.toString().includes('listening')){clearTimeout(timer);resolve();}});server.once('exit',()=>reject(new Error('Node server exited.')));});
  const url=`http://127.0.0.1:${port}/api/v1`, token=()=>credential.token;
  const first=reactApi(url,undefined,undefined,token), second=vanillaApi(url,undefined,undefined,token);
  const created=await first.create('Node integration 🙂'); const stale=(await second.list())[0];
  assert.equal(stale.id,created.id); const updated=await first.replace(created,true); assert.equal(updated.version,2);
  await assert.rejects(second.replace(stale,false),{code:'VERSION_CONFLICT'});
  const cors=await fetch(url+'/tasks',{headers:{Authorization:'Bearer '+credential.token,Origin:'http://127.0.0.1:5173'}}); assert.equal(cors.headers.get('access-control-allow-origin'),'http://127.0.0.1:5173');
  console.log('PASS: React and native-web adapters use the framework-free Node backend with auth, CRUD, conflict and CORS.');
} finally {
  if(server&&server.exitCode===null){const exited=new Promise(resolve=>server.once('exit',resolve));server.kill();await exited;}
  assert.equal(path.dirname(temporary),path.resolve(tmpdir())); assert.ok(path.basename(temporary).startsWith('foundation-node-api-')); await rm(temporary,{recursive:true});
}
