// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
import type { Messages } from './types';

export const es419: Messages = {
  pageTitle: 'Tareas · Project Base',
  eyebrow: 'BASE WEB REUTILIZABLE',
  title: 'Un punto de partida claro.',
  introduction: 'Una lista pequeña para demostrar una estructura que puedes adaptar a tu próximo proyecto.',
  language: 'Idioma',
  inputLabel: 'Nueva tarea',
  inputHint: 'Hasta 80 caracteres Unicode. Escribe una tarea en una sola línea.',
  inputPlaceholder: '¿Qué quieres hacer?',
  add: 'Agregar tarea',
  working: 'Procesando…',
  loading: 'Cargando tareas…',
  emptyTitle: 'Tu lista comienza aquí',
  emptyBody: 'Agrega tu primera tarea y márcala cuando esté terminada.',
  listLabel: 'Lista de tareas',
  pending: 'Pendiente',
  completed: 'Completada',
  retry: 'Volver a cargar',
  memoryNotice: 'Solo en memoria. Al recargar esta página, las tareas se eliminan.',
  remoteNotice: 'Modo API: los datos se guardan en el backend.',
  architecture: 'Una estructura, responsabilidades claras',
  architectureBody: 'Reglas de dominio puras · Casos de uso · Adaptadores de memoria e interfaz',
  candidate: 'Ejemplo reemplazable',
  summary: (total, completed) => `${total} en total · ${completed} completadas`,
  errors: {
    INVALID_TITLE: 'Escribe una tarea válida, sin saltos de línea ni caracteres de control.',
    TITLE_TOO_LONG: 'La tarea supera el límite de 80 caracteres Unicode.',
    INVALID_ID: 'No se pudo identificar la tarea. Revisa la configuración del ejemplo.',
    INVALID_TIMESTAMP: 'El reloj del ejemplo devolvió un valor inválido.',
    NOT_FOUND: 'La tarea ya no está disponible. Vuelve a cargar la lista.',
    DUPLICATE_ID: 'El identificador ya existe. No se agregó otra tarea.',
    STORAGE_UNAVAILABLE: 'No fue posible confirmar la operación. Vuelve a cargar antes de repetirla.',
    DEPENDENCY_FAILURE: 'No fue posible preparar la tarea. Revisa el generador de identificadores y el reloj.',
  },
};
