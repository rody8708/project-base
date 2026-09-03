import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTaskService } from './application/task-service';
import { createMemoryTaskRepository } from './adapters/memory-task-repository';
import { createHttpTaskRepository } from './adapters/http-task-repository';
import { App } from './ui/App';
import './ui/styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Application root element is missing.');

const service = createTaskService({
  repository: import.meta.env.VITE_API_BASE_URL
    ? createHttpTaskRepository(import.meta.env.VITE_API_BASE_URL) : createMemoryTaskRepository(),
  nextId: () => crypto.randomUUID(),
  now: () => Date.now(),
});

createRoot(container).render(
  <StrictMode>
    <App service={service} remoteMode={Boolean(import.meta.env.VITE_API_BASE_URL)} appName={import.meta.env.VITE_APP_NAME?.trim() || 'Project Base'} />
  </StrictMode>,
);
