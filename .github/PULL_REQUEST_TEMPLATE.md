# Pull Request / Solicitud de cambios

## Purpose / Propósito

<!-- Explain the problem, outcome, and scope. / Explica el problema, resultado y alcance. -->

## Before and After / Antes y después

<!-- Describe observable behavior changes, or state why none apply. / Describe los cambios observables o indica por qué no aplican. -->

## Applicable Rules / Reglas aplicables

- [ ] All applicable MUST rules are satisfied. / Se cumplen todas las reglas MUST aplicables.
- [ ] Any deferred SHOULD or NICE rule is justified below. / Toda regla SHOULD o NICE aplazada se justifica abajo.
- [ ] Architecture boundaries and dependency direction were reviewed. / Se revisaron los límites arquitectónicos y la dirección de dependencias.
- [ ] Authentication, authorization, data isolation, and destructive effects were reviewed when applicable. / Se revisaron autenticación, autorización, aislamiento de datos y efectos destructivos cuando aplican.

Deferred rule and justification / Regla aplazada y justificación:

## Verification / Verificación

<!-- List exact commands, environments, results, and evidence. Never mark an unexecuted check as passed. / Enumera comandos exactos, entornos, resultados y evidencia. Nunca marques como aprobada una comprobación no ejecutada. -->

- [ ] New behavior and bug fixes have proportional automated tests. / El comportamiento nuevo y los defectos corregidos tienen pruebas automatizadas proporcionales.
- [ ] A reproducible bug fix includes a regression test. / Una corrección reproducible incluye una prueba de regresión.
- [ ] Affected real entry-point flows were exercised, or the limitation is recorded. / Se recorrieron los flujos reales afectados o se registró la limitación.
- [ ] Tests use synthetic isolated data and leave no operational residue. / Las pruebas usan datos sintéticos aislados y no dejan residuos operativos.
- [ ] Applicable CI checks pass before merge. / Los controles de CI aplicables aprueban antes de integrar.

## Security, Data, and Operations / Seguridad, datos y operación

- [ ] Staged paths and diff contain no secrets, personal/customer data, `.env`, databases, logs, backups, or private attachments. / Las rutas y diferencias preparadas no contienen secretos, datos personales/de clientes, `.env`, bases, logs, respaldos ni adjuntos privados.
- [ ] Schema changes include a migration and rollback strategy or explicit non-reversible note. / Los cambios de esquema incluyen migración y estrategia de reversión o una nota explícita de irreversibilidad.
- [ ] User-facing errors remain safe and internal diagnostics remain private. / Los errores para usuarios son seguros y los diagnósticos internos permanecen privados.

## Documentation and Languages / Documentación e idiomas

- [ ] Behavior, setup, architecture, tests, and operations documentation were updated when affected. / Se actualizó la documentación de comportamiento, preparación, arquitectura, pruebas y operación cuando fue afectada.
- [ ] Maintained Markdown has equivalent `es-419` and `en-US` files. / El Markdown mantenido tiene archivos equivalentes `es-419` y `en-US`.
- [ ] User-facing text remains translatable and UTF-8 without mojibake. / El texto para usuarios sigue siendo traducible y UTF-8 sin mojibake.

## Remaining Work and Risk / Trabajo y riesgo restantes

<!-- State pending, blocked, not applicable, and not executed items. / Declara elementos pendientes, bloqueados, no aplicables y no ejecutados. -->
