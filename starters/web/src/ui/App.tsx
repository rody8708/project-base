import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { TaskService } from '../application/task-service';
import type { Task, TaskError } from '../domain/task';
import { enUS } from './locales/en-US';
import { es419 } from './locales/es-419';
import type { Locale } from './locales/types';

export function App({ service, appName = 'Project Base', remoteMode = false }: Readonly<{
  service: TaskService;
  appName?: string;
  remoteMode?: boolean;
}>) {
  const [locale, setLocale] = useState<Locale>('es-419');
  const [tasks, setTasks] = useState<readonly Task[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<TaskError | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const actionInProgress = useRef(false);
  const messages = locale === 'es-419' ? es419 : enUS;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = messages.pageTitle;
  }, [locale, messages.pageTitle]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setTasks([]);
    setError(null);
    void Promise.resolve().then(() => service.list()).then((result) => {
      if (!active) return;
      if (result.ok) setTasks(result.value);
      else setError(result.error);
    }).catch(() => {
      if (active) setError({ code: 'STORAGE_UNAVAILABLE' });
    }).finally(() => {
      if (!active) return;
      setLoading(false);
    });
    return () => { active = false; };
  }, [service]);

  async function reload() {
    const result = await service.list();
    if (result.ok) setTasks(result.value);
    else setError(result.error);
  }

  async function perform(action: () => Promise<void>) {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch {
      setError({ code: 'STORAGE_UNAVAILABLE' });
    } finally {
      actionInProgress.current = false;
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void perform(async () => {
      const result = await service.add(title);
      if (!result.ok) { setError(result.error); return; }
      setTasks(current => [...current.filter(task => task.id !== result.value.id), result.value]);
      setTitle('');
      await reload();
    });
  }

  function toggle(id: string) {
    void perform(async () => {
      const result = await service.toggle(id);
      if (!result.ok) { setError(result.error); return; }
      setTasks(current => current.map(task => task.id === result.value.id ? result.value : task));
      await reload();
    });
  }

  const invalidTitle = error?.code === 'INVALID_TITLE' || error?.code === 'TITLE_TOO_LONG';
  const completed = tasks.filter((task) => task.completed).length;

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand"><span className="brand-mark" aria-hidden="true">▦</span>{appName}</span>
        <div className="language-control">
          <label htmlFor="language">{messages.language}</label>
          <select id="language" value={locale} onChange={(event) => {
            const value = event.target.value;
            if (value === 'es-419' || value === 'en-US') setLocale(value);
          }}>
            <option value="es-419">Español (Latinoamérica)</option>
            <option value="en-US">English (United States)</option>
          </select>
        </div>
      </header>

      <main>
        <section className="introduction" aria-labelledby="page-title">
          <p className="eyebrow">{messages.eyebrow}</p>
          <h1 id="page-title">{messages.title}</h1>
          <p className="lead">{messages.introduction}</p>
        </section>

        <section className="task-panel" aria-labelledby="task-heading" aria-busy={loading || busy}>
          <div className="panel-heading">
            <h2 id="task-heading">{messages.listLabel}</h2>
            <span className="summary" aria-live="polite">{messages.summary(tasks.length, completed)}</span>
          </div>
          <form onSubmit={submit} noValidate>
            <label htmlFor="task-title">{messages.inputLabel}</label>
            <div className="input-row">
              <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)}
                placeholder={messages.inputPlaceholder} disabled={loading || busy}
                aria-invalid={invalidTitle} aria-describedby={invalidTitle ? 'task-hint task-error' : 'task-hint'} />
              <button type="submit" disabled={loading || busy}>{busy ? messages.working : messages.add}</button>
            </div>
            <p className="hint" id="task-hint">{messages.inputHint}</p>
          </form>

          {error && <div className="error-box" id="task-error" role="alert">
            <p>{messages.errors[error.code]}</p>
            {!invalidTitle && <button className="secondary" disabled={busy} onClick={() => { void perform(reload); }}>{messages.retry}</button>}
          </div>}
          {loading ? <p className="empty-state" role="status">{messages.loading}</p> : tasks.length === 0 ? (
            <div className="empty-state" role="status">
              <span className="empty-symbol" aria-hidden="true">✓</span>
              <h3>{messages.emptyTitle}</h3>
              <p>{messages.emptyBody}</p>
            </div>
          ) : <ul className="task-list" aria-label={messages.listLabel}>
            {tasks.map((task) => <li key={task.id} className={task.completed ? 'is-complete' : ''}>
              <label><input type="checkbox" checked={task.completed} disabled={busy}
                onChange={() => toggle(task.id)} /><span className="task-title">{task.title}</span></label>
              <span className="task-state">{task.completed ? messages.completed : messages.pending}</span>
            </li>)}
          </ul>}
          <p className="memory-notice">{remoteMode ? messages.remoteNotice : messages.memoryNotice}</p>
        </section>

        <aside className="architecture-note">
          <h2>{messages.architecture}</h2>
          <p>{messages.architectureBody}</p>
        </aside>
      </main>
      <footer>{messages.candidate}</footer>
    </div>
  );
}
