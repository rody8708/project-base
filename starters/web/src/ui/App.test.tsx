// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryTaskRepository } from '../adapters/memory-task-repository';
import { createTaskService } from '../application/task-service';
import type { TaskService } from '../application/task-service';
import { failure } from '../domain/task';
import { App } from './App';

afterEach(cleanup);

function serviceForTest() {
  let sequence = 0;
  return createTaskService({ repository: createMemoryTaskRepository(), nextId: () => `task-${++sequence}`, now: () => 0 });
}

describe('task interface', () => {
  it('retains a confirmed write when the following refresh fails', async () => {
    const user = userEvent.setup();
    const service = serviceForTest();
    const list = vi.fn(service.list).mockResolvedValueOnce({ ok: true, value: [] }).mockResolvedValue(failure('STORAGE_UNAVAILABLE'));
    render(<App service={{ ...service, list }} remoteMode />);
    await screen.findByText('Tu lista comienza aquí');
    await user.type(screen.getByLabelText('Nueva tarea'), 'Confirmed');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));
    expect(await screen.findByRole('checkbox', { name: 'Confirmed' })).toBeVisible();
    expect(await screen.findByRole('alert')).toBeVisible();
    expect(screen.getByText(/Modo API/)).toBeVisible();
  });
  it('shows the empty state and memory-only limitation', async () => {
    render(<App service={serviceForTest()} />);
    expect(await screen.findByText('Tu lista comienza aquí')).toBeVisible();
    expect(screen.getByText(/Al recargar esta página/)).toBeVisible();
    expect(screen.getByLabelText('Nueva tarea')).toBeEnabled();
  });
  it('adds, completes, and reopens a task through labeled controls', async () => {
    const user = userEvent.setup();
    render(<App service={serviceForTest()} />);
    await screen.findByText('Tu lista comienza aquí');
    await user.type(screen.getByLabelText('Nueva tarea'), 'Revisar límites');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));
    const checkbox = await screen.findByRole('checkbox', { name: 'Revisar límites' });
    expect(screen.getByLabelText('Nueva tarea')).toHaveValue('');
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
    expect(screen.getByText('1 en total · 1 completadas')).toBeVisible();
    await user.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });
  it('shows invalid-input feedback, keeps the draft, and recovers on correction', async () => {
    const user = userEvent.setup();
    render(<App service={serviceForTest()} />);
    await screen.findByText('Tu lista comienza aquí');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Escribe una tarea válida');
    expect(screen.getByLabelText('Nueva tarea')).toHaveAttribute('aria-invalid', 'true');
    await user.type(screen.getByLabelText('Nueva tarea'), 'a'.repeat(81));
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('supera el límite');
    expect(screen.getByLabelText('Nueva tarea')).toHaveValue('a'.repeat(81));
    await user.clear(screen.getByLabelText('Nueva tarea'));
    await user.type(screen.getByLabelText('Nueva tarea'), 'a'.repeat(80));
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));
    expect(await screen.findByRole('checkbox')).toHaveAccessibleName('a'.repeat(80));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('changes language without discarding tasks and updates the page language', async () => {
    const user = userEvent.setup();
    const service = serviceForTest();
    await service.add('Keep this text');
    render(<App service={service} />);
    await screen.findByRole('checkbox');
    await user.selectOptions(screen.getByLabelText('Idioma'), 'en-US');
    expect(screen.getByLabelText('New task')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Keep this text' })).toBeVisible();
    expect(document.documentElement.lang).toBe('en-US');
    expect(screen.getByRole('button', { name: 'Add task' })).toBeVisible();
  });
  it('reports an initial storage failure and reloads explicitly', async () => {
    const user = userEvent.setup();
    const service = serviceForTest();
    const list = vi.fn(service.list).mockResolvedValueOnce(failure('STORAGE_UNAVAILABLE'));
    render(<App service={{ ...service, list }} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible confirmar');
    expect(list).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Volver a cargar' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(list).toHaveBeenCalledTimes(2);
  });
  it('shows an add failure without claiming success or clearing the input', async () => {
    const user = userEvent.setup();
    const service: TaskService = { ...serviceForTest(), add: async () => failure('STORAGE_UNAVAILABLE') };
    render(<App service={service} />);
    await screen.findByText('Tu lista comienza aquí');
    await user.type(screen.getByLabelText('Nueva tarea'), 'Preservar borrador');
    await user.click(screen.getByRole('button', { name: 'Agregar tarea' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('antes de repetirla');
    expect(screen.getByLabelText('Nueva tarea')).toHaveValue('Preservar borrador');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
  it('contains a rejected initial load and clears the error for a replacement service', async () => {
    const list = vi.fn(async () => { throw new Error('private adapter detail'); });
    const { rerender } = render(<App service={{ ...serviceForTest(), list }} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No fue posible confirmar');
    expect(screen.queryByText('Cargando tareas…')).not.toBeInTheDocument();
    expect(screen.queryByText('private adapter detail')).not.toBeInTheDocument();
    rerender(<App service={serviceForTest()} />);
    await screen.findByText('Tu lista comienza aquí');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('renders task text as text rather than HTML', async () => {
    const service = serviceForTest();
    await service.add('<img src=x onerror=alert(1)>');
    render(<App service={service} />);
    expect(await screen.findByRole('checkbox', { name: '<img src=x onerror=alert(1)>' })).toBeVisible();
    expect(document.querySelector('img')).toBeNull();
  });
});
