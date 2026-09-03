import { describe, expect, it } from 'vitest';
import { createTask, toggleTask, validateTitle } from './task';

describe('title contract', () => {
  it('trims surrounding whitespace and preserves text', () => {
    expect(validateTitle('  Revisar base  ')).toEqual({ ok: true, value: 'Revisar base' });
  });
  it.each([undefined, null, false, 0, '', '   ', 'una\notra', 'a\u0000b'])('rejects invalid input %j', (input) => {
    expect(validateTitle(input)).toEqual({ ok: false, error: { code: 'INVALID_TITLE' } });
  });
  it('accepts exactly 80 Unicode code points, including supplementary characters', () => {
    expect(validateTitle('😀'.repeat(80))).toEqual({ ok: true, value: '😀'.repeat(80) });
  });
  it('rejects 81 Unicode code points', () => {
    expect(validateTitle('a'.repeat(81))).toEqual({ ok: false, error: { code: 'TITLE_TOO_LONG' } });
  });
});

describe('task creation and transition', () => {
  it('creates an immutable pending task using the injected identity and time', () => {
    const result = createTask({ id: 'task-1', title: 'Leer', createdAtEpochMs: 0 });
    expect(result).toEqual({ ok: true, value: { id: 'task-1', title: 'Leer', completed: false, createdAtEpochMs: 0 } });
    if (!result.ok) throw new Error('Expected valid task');
    expect(Object.isFrozen(result.value)).toBe(true);
    const updated = toggleTask(result.value);
    expect(updated.completed).toBe(true);
    expect(result.value.completed).toBe(false);
    expect(toggleTask(updated)).toEqual(result.value);
  });
  it.each(['', '../task', 'two ids', 'x'.repeat(101), undefined])('rejects invalid ID %j', (id) => {
    expect(createTask({ id, title: 'Leer', createdAtEpochMs: 0 })).toEqual({ ok: false, error: { code: 'INVALID_ID' } });
  });
  it.each([-1, 0.5, Number.NaN, Infinity, 8_640_000_000_000_001, '0'])('rejects invalid timestamp %j', (createdAtEpochMs) => {
    expect(createTask({ id: '1', title: 'Leer', createdAtEpochMs })).toEqual({ ok: false, error: { code: 'INVALID_TIMESTAMP' } });
  });
  it('accepts the upper timestamp boundary', () => {
    expect(createTask({ id: '1', title: 'Leer', createdAtEpochMs: 8_640_000_000_000_000 }).ok).toBe(true);
  });
});
