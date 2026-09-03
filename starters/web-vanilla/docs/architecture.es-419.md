# Arquitectura de la base web sin framework

Versión técnica: `1.1.0-draft.1`. Estado: propuesta técnica no aprobada.

[English (United States)](architecture.en-US.md) · [Inicio](../README.es-419.md) · [Verificación](verification.es-419.md)

## Límites y responsabilidades

```text
main.js: composición explícita
  DOM view <-> task-controller -> task-service -> repository
                                 |                |
                                 v                v
                             domain/task <--- memory Map
```

| Módulo | Responsabilidad y límite |
| --- | --- |
| `src/domain/task.js` | Valida título, ID, tiempo y estado; crea valores y listas congelados. Sin DOM, reloj global, red o almacenamiento. |
| `src/application/task-service.js` | Casos de uso `list`, `add`, `toggle`; recibe repositorio, `nextId` y `now`. Devuelve resultados explícitos. |
| `src/adapters/memory-task-repository.js` | Implementa `list`, `add`, `update`; oculta el `Map`, impide IDs duplicados y devuelve instantáneas válidas. |
| `src/ui/task-controller.js` | Estado de tareas, borrador, idioma, errores, avisos y operación en curso; callback de render explícito. |
| `src/ui/dom-view.js` | Traduce estado a nodos y eventos de la interfaz concreta; no implementa un motor general de componentes. |
| `src/main.js` | Conecta adaptadores, servicio, controlador y vista; no replica reglas del dominio. |
| `src/i18n/` | Un objeto de mensajes por idioma; claves de máquina estables e interpolaciones equivalentes. |
| `scripts/` | Herramientas locales de comprobación y servidor; no forman parte del dominio ni de un backend. |

Los contratos de los puertos se expresan mediante funciones y validación en ejecución; no hay interfaces TypeScript ni un contenedor de inyección de dependencias. Los imports son módulos ES. Node admite esa organización de módulos; el perfil concreto de esta candidata se declara en su manifiesto. [Node.js 24.16.0: módulos ECMAScript](https://nodejs.org/download/release/v24.16.0/docs/api/esm.html).

## Datos y errores

Una tarea contiene exclusivamente `id`, `title`, `completed` y `createdAtMs`. Los límites exactos están en el [contrato del README](../README.es-419.md). La congelación basta para estos valores planos de campos primitivos; no se ofrece un sistema general de inmutabilidad profunda.

El servicio diferencia éxito (`ok: true`, `value`) de fallo (`ok: false`, `error`). Los códigos de contrato y almacenamiento se mantienen separados de sus traducciones. Excepciones desconocidas del repositorio se convierten en `STORAGE_FAILURE`; fallos inesperados de las dependencias se convierten en códigos genéricos. No se presentan mensajes arbitrarios de excepciones como texto de interfaz.

El controlador solo incorpora resultados confirmados y valida también el valor recibido del servicio. Un fallo conserva las tareas previamente confirmadas; el borrador se limpia únicamente al agregar con éxito. No se reintenta automáticamente una escritura: un futuro adaptador remoto podría haber confirmado el cambio antes de perder la respuesta. Ese adaptador necesitaría su propio contrato de idempotencia y resolución de conflictos.

Un fallo del callback de render es un defecto fatal de esta interfaz montada, no un fallo de almacenamiento que deba reintentarse. El controlador libera `busy`, conserva los cambios ya confirmados y propaga la excepción; la vista maneja ese fallo deshabilitando controles y mostrando un mensaje genérico. No se promete continuar normalmente después de un render roto ni deshacer una operación ya confirmada.

`update` en el repositorio de memoria realiza transformación y confirmación sincrónicas en el mismo contexto JavaScript. Esto no demuestra atomicidad de una base remota, coordinación entre pestañas, varios procesos o concurrencia distribuida. No se traslada esa suposición a un backend por copiar esta clase.

## Interfaz, idioma y contenido

La vista trabaja con el DOM de esta pantalla. Los títulos del usuario se asignan como texto literal; no se evalúan expresiones ni se interpreta markup ingresado. Esa elección protege este punto concreto de renderizado, no constituye una garantía universal contra XSS en futuras extensiones.

El controlador separa el idioma de los datos: cambiar es-419/en-US no altera los títulos, IDs ni estados. La paridad automática compara claves y nombres de interpolación, no calidad de traducción, diseño, accesibilidad o corrección cultural de cada frase.

El HTML incluye contenido inicial y aviso sin JavaScript; la interacción posterior requiere módulos JavaScript. CSS y la vista son propios de este ejemplo: no se presentan como un sistema de diseño completo, biblioteca de componentes o soporte certificado de dispositivos.

## Herramientas y crecimiento

El servidor entrega una instantánea pública acotada y no abre archivos a partir de rutas recibidas por HTTP. El comprobador de HTML utiliza reglas estrechas para el shell acordado; no sustituye un parser estándar. El comando de comprobación importa módulos de idioma y ejecuta pruebas locales, por lo que solo debe usarse con código revisado. Los límites de carpeta confiable y servidor de desarrollo están en el [README](../README.es-419.md).

Antes de añadir una función, ubicar su responsabilidad y definir entradas, resultados y fallos. Para persistencia o API, crear un adaptador con pruebas de contrato y decidir autenticación, permisos, esquemas, migraciones, reintentos y conflictos. Para nuevas pantallas, evaluar el costo de seguir con esta vista simple o adoptar una herramienta; esta entrega no afirma que un framework sea obligatorio ni que nunca haga falta.

No se modifican aquí automáticamente las otras bases web, Flutter, Kotlin o PHP ni se conectan entre sí. El consumidor elige su combinación y verifica su entorno. La ausencia de dependencias npm reduce las dependencias que mantener en este ejemplo, pero no elimina mantenimiento del código, Node, npm o navegadores.
