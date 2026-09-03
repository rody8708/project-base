import { parseServeArguments, startDevelopmentServer, DevelopmentServerError } from './server.mjs';

try {
  const options = parseServeArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write('Usage: node scripts/serve.mjs [--port 1..65535]\nLocal development only: 127.0.0.1, default port 5180. Restart after source changes.\n');
  } else {
    const application = await startDevelopmentServer({ port: options.port });
    process.stdout.write(`${JSON.stringify({ status: 'ready', mode: 'development-only', url: application.url, snapshot: true })}\n`);
    let closing = false;
    const close = async () => {
      if (closing) return;
      closing = true;
      try {
        await application.close();
        process.stdout.write(`${JSON.stringify({ status: 'closed' })}\n`);
      } catch {
        process.stderr.write(`${JSON.stringify({ status: 'error', code: 'CLOSE_FAILED', message: 'Could not complete server shutdown.' })}\n`);
        process.exitCode = 1;
      } finally {
        process.removeListener('SIGINT', close);
        process.removeListener('SIGTERM', close);
      }
    };
    process.on('SIGINT', close);
    process.on('SIGTERM', close);
  }
} catch (error) {
  const known = error instanceof DevelopmentServerError;
  process.stderr.write(`${JSON.stringify({ status: 'error', code: known ? error.code : 'START_FAILED', message: known ? error.message : 'Could not start the development server.' })}\n`);
  process.exitCode = 1;
}
