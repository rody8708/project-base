# Fuentes y verificación de la base web

Revisión técnica: `1.1.0-draft.1`  
Estado: candidato técnico local.  
Idioma: español latinoamericano (`es-419`)  
[US English](verification.en-US.md) · [Inicio](../README.es-419.md)

## Selección de herramientas

Consulta: `2026-09-02`. Las versiones y restricciones se contrastaron mediante `npm view <paquete>@<versión> version engines peerDependencies license --json` y las fuentes primarias de abajo. Una compatibilidad declarada por el editor no reemplaza instalar y comprobar la combinación. No se seleccionaron versiones canary, beta o release candidate.

| Dependencias directas | Versión fijada | Licencia declarada |
| --- | --- | --- |
| `react`, `react-dom` | `19.2.8` | MIT |
| `typescript` | `5.9.3` | Apache-2.0 |
| `vite` | `8.2.2` | MIT |
| `@vitejs/plugin-react` | `6.1.1` | MIT |
| `vitest` | `4.1.11` | MIT |
| `@testing-library/react` | `16.3.3` | MIT |
| `@testing-library/dom` | `10.4.1` | MIT |
| `@testing-library/user-event` | `14.6.7` | MIT |
| `@testing-library/jest-dom` | `7.0.1` | MIT |
| `jsdom` | `30.0.1` | MIT |
| `@types/node` | `24.13.3` | MIT |
| `@types/react` | `19.2.18` | MIT |
| `@types/react-dom` | `19.2.5` | MIT |

Son 14 paquetes directos. Este inventario de metadatos no sustituye conservar los avisos de terceros ni revisar las dependencias transitivas al redistribuir. Sus licencias no alteran la MPL-2.0 asignada al código original.

TypeScript `7.0.2` ya figuraba como estable al consultar npm, pero esta primera plantilla fija `5.9.3` como decisión conservadora y comprueba esa versión concreta. Vite `8.2.2` y su plugin React `6.1.1` admiten Node `^20.19.0 || >=22.12.0`; Vitest `4.1.11` admite Vite 8 y Node 24; `jsdom` `30.0.1` admite Node `^24.15.0`. El Node de referencia satisface esos requisitos. Los peers de compilador React/Babel del plugin son opcionales y no se incorporan sin necesidad.

## Fuentes primarias y límites

- [Node.js 24.16.0 LTS](https://nodejs.org/en/blog/release/v24.16.0): publicación del `2026-05-21`; identifica la versión de referencia como LTS. No demuestra que cualquier parche posterior esté probado aquí.
- [React: aplicación desde cero](https://react.dev/learn/build-a-react-app-from-scratch): apartados de herramienta de compilación y patrones; respalda Vite como opción y advierte del trabajo adicional si se requiere un framework. No obliga a imponer router, backend o SSR a este ejemplo.
- [React: política de versiones](https://react.dev/community/versioning-policy): canal estable `latest`; la plantilla conserva versiones exactas, no un alias variable.
- [TypeScript: instalación](https://www.typescriptlang.org/download/) y [strict](https://www.typescriptlang.org/tsconfig/strict.html): instalación por proyecto y comprobaciones estrictas. La versión elegida sigue siendo una decisión local.
- [Vite: inicio](https://vite.dev/guide/) y [TypeScript](https://vite.dev/guide/features#typescript): requisitos y separación entre transpilación y comprobación de tipos. `build` no sustituye `typecheck`.
- [Vitest: inicio](https://vitest.dev/guide/) y [entornos](https://vitest.dev/guide/environment.html): ejecución no interactiva y distinción entre Node, DOM emulado y navegador real.
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/): instalación del peer DOM y comprobaciones orientadas a controles observables, no detalles privados del componente.
- [npm ci, CLI 11](https://docs.npmjs.com/cli/v11/commands/npm-ci/): instalación con bloqueo existente y rechazo de discrepancias; no promete seguridad ni binarios idénticos.
- [Variables de Vite](https://vite.dev/guide/env-and-mode): exposición de variables `VITE_` al cliente; no guardar secretos allí.

Las páginas de documentación pueden cambiar. Se conserva la fecha, el apartado consultado y la selección exacta en el manifiesto/bloqueo; no se afirma congelar sitios externos ni atribuir a esas fuentes la arquitectura completa.

## Registro de ejecución

Fecha: `2026-09-02`. Revisor: asistente de desarrollo; no aprobación del usuario ni auditoría independiente. Entorno observado: Windows `win32 x64`, Node.js `24.16.0`, npm `11.17.0`. Los resultados corresponden a esta plantilla, no a implementaciones futuras.

| Comando o comprobación | Resultado observado |
| --- | --- |
| `npm install` | Instalación inicial y creación de `package-lock.json` satisfactorias. |
| `npm ci` | Reinstalación desde el bloqueo satisfactoria; 115 paquetes instalados en este entorno. |
| `npm run typecheck` mediante `npm run check` | Satisfactorio, sin desactivar comprobación de bibliotecas. |
| `npm test` mediante `npm run check` | 41 pruebas satisfactorias en tres archivos: 24 de dominio, nueve de aplicación/adaptador y ocho de componente. |
| `npm run build` mediante `npm run check` | Compilación satisfactoria, salida local `dist/`; no despliegue. |
| `npm audit --json` | Cero vulnerabilidades reportadas en esa consulta, incluidas dependencias de desarrollo. |
| `npm ls --depth=0` y metadatos instalados | Los 14 paquetes directos coinciden exactamente con versiones y licencias de la tabla. |
| `npx --yes npm@11.17.0 --version` | Devuelve `11.17.0` sin reemplazar npm global; se comprobó el selector alternativo de versión. |

La comprobación completa se repitió después de `npm ci`. Los fallos simulados incluyen repositorio rechazado, identidad repetida y carga inicial rechazada; las comprobaciones de componentes cubren agregar, marcar, reabrir, límites, idioma y presentación de texto sin interpretar HTML. No se ejecutan código ni manejadores HTML suministrados por un título.

La validación interactiva en un navegador real y la copia/exportación independiente se registran separadamente por quien las ejecute. Este registro de tipos, pruebas y compilación no las da por realizadas ni afirma equivalencia entre sistemas operativos.

No hay pruebas de backend, cuentas, bases de datos, sincronización, plataformas nativas o despliegue: esos componentes no existen en esta plantilla. Las pruebas de componentes con `jsdom` no certifican accesibilidad integral ni compatibilidad con todos los navegadores.
