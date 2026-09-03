import { messages as spanish } from '../i18n/es-419.js';
import { messages as english } from '../i18n/en-US.js';

export function createDomView(document, remoteMode = false) {
  const get = (id) => {
    const element = document.getElementById(id);
    if (!element) throw new Error('Required page structure is missing.');
    return element;
  };
  const form = get('task-form');
  const controls = get('task-controls');
  const input = get('task-title');
  const language = get('language');
  const reload = get('reload-tasks');
  const taskList = get('task-list');
  const empty = get('empty-state');
  const summary = get('summary');
  const feedback = get('error-panel');
  const errorText = get('task-error');
  const live = get('live-status');
  const workspace = get('workspace');
  const textElements = [...document.querySelectorAll('[data-text]')];
  const rows = new Map();
  let lastLanguage;

  function failStartup() {
    controls.disabled = true;
    reload.disabled = true;
    language.disabled = true;
    for (const row of rows.values()) row.checkbox.disabled = true;
    errorText.textContent = (document.documentElement.lang === 'en-US' ? english : spanish).error_UNEXPECTED_FAILURE;
    feedback.hidden = false;
    live.textContent = '';
    workspace.setAttribute('aria-busy', 'false');
    console.error('The interface could not be rendered; controls have been disabled.');
  }

  async function run(operation) {
    try { await operation(); } catch { failStartup(); }
  }

  function updateRows(state, messages) {
    const ids = new Set(state.tasks.map((task) => task.id));
    for (const [id, row] of rows) {
      if (!ids.has(id)) { row.item.remove(); rows.delete(id); }
    }
    state.tasks.forEach((task, index) => {
      let row = rows.get(task.id);
      if (!row) {
        const item = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        const copy = document.createElement('span');
        const title = document.createElement('span');
        const status = document.createElement('span');
        item.className = 'task-row';
        label.className = 'task-label';
        checkbox.type = 'checkbox';
        checkbox.dataset.taskId = task.id;
        checkbox.id = `task-${task.id}`;
        copy.className = 'task-copy';
        title.className = 'task-title';
        status.className = 'task-state';
        copy.append(title, status);
        label.append(checkbox, copy);
        item.append(label);
        row = { item, checkbox, title, status };
        rows.set(task.id, row);
      }
      row.title.textContent = task.title;
      row.status.textContent = task.completed ? messages.completed : messages.pending;
      row.checkbox.checked = task.completed;
      row.checkbox.disabled = state.busy;
      row.checkbox.setAttribute('aria-label', `${task.completed ? messages.reopenAction : messages.completeAction}: ${task.title}`);
      row.item.classList.toggle('is-complete', task.completed);
      if (taskList.children[index] !== row.item) {
        taskList.insertBefore(row.item, taskList.children[index] ?? null);
      }
    });
  }

  return Object.freeze({
    render(state) {
      const messages = state.language === 'en-US' ? english : spanish;
      if (lastLanguage !== state.language) {
        for (const element of textElements) {
          const key = remoteMode && element.dataset.text === 'memoryBody' ? 'remoteNotice'
            : remoteMode && element.dataset.text === 'memoryTitle' ? 'remoteTitle' : element.dataset.text;
          element.textContent = messages[key];
        }
        document.documentElement.lang = state.language;
        document.title = messages.documentTitle;
        input.placeholder = messages.placeholder;
        taskList.setAttribute('aria-label', messages.tasksTitle);
        lastLanguage = state.language;
      }
      language.value = state.language;
      language.disabled = false;
      if (input.value !== state.draft) input.value = state.draft;
      controls.disabled = state.busy;
      reload.disabled = state.busy;
      workspace.setAttribute('aria-busy', String(state.busy));
      input.setAttribute('aria-invalid', String(state.error === 'INVALID_TITLE' || state.error === 'TITLE_TOO_LONG'));
      errorText.textContent = state.error ? messages[`error_${state.error}`] : '';
      feedback.hidden = state.error === null;
      live.textContent = state.activity ? messages[state.activity] : state.notice ? messages[state.notice] : '';
      summary.textContent = messages.summary.replace('{total}', String(state.tasks.length))
        .replace('{completed}', String(state.tasks.filter((task) => task.completed).length));
      empty.hidden = state.tasks.length !== 0 || (state.busy && state.activity === 'loading');
      updateRows(state, messages);
    },
    bind(controller) {
      input.addEventListener('input', () => { void run(() => controller.setDraft(input.value)); });
      language.addEventListener('change', () => { void run(() => controller.setLanguage(language.value)); });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        void run(async () => {
          const confirmed = await controller.add();
          const error = controller.getState().error;
          if (confirmed || error === 'INVALID_TITLE' || error === 'TITLE_TOO_LONG') input.focus();
          else feedback.focus();
        });
      });
      reload.addEventListener('click', () => {
        void run(async () => { if (!await controller.reload()) feedback.focus(); });
      });
      taskList.addEventListener('change', (event) => {
        const id = event.target?.dataset?.taskId;
        if (!id || !rows.has(id)) return;
        void run(async () => {
          if (await controller.toggle(id)) rows.get(id)?.checkbox.focus();
          else feedback.focus();
        });
      });
    },
    failStartup,
  });
}
