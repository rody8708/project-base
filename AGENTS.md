# Project Base Agent Instructions / Instrucciones para agentes

## English

- Determine whether the user is maintaining Project Base or creating a consumer application. Final products are created outside this repository.
- Read [the complete agent guide](docs/agent-guide.en-US.md), then the documents relevant to the selected platform.
- Prefer the guided `npm run create-app` flow or the local MCP tool `project_base_create_solution`. Do not manually copy starter directories.
- Preserve the API boundary: clients communicate with backends through versioned contracts and never access databases directly.
- Keep persistence behind repository ports and engine-specific adapters. Do not couple application logic to SQLite, PostgreSQL, or MySQL.
- Never invent credentials, production approval, platform verification, business requirements, or completed evidence.
- Never commit `.env` files, credentials, customer data, databases, logs, backups, or generated dependencies.
- Maintain Latin American Spanish and US English documentation counterparts. Source code and identifiers remain in English.
- Do not modify frozen release artifacts. Start maintenance changes from current `origin/main`, test them, and record behavior changes in documentation.

## Español

- Determina si la persona mantiene Project Base o crea una aplicación consumidora. Los productos finales se crean fuera de este repositorio.
- Lee [la guía completa para agentes](docs/agent-guide.es-419.md) y después los documentos de la plataforma seleccionada.
- Prefiere el asistente `npm run create-app` o la herramienta MCP local `project_base_create_solution`. No copies manualmente las carpetas de los starters.
- Conserva el límite API: los clientes se comunican con el backend mediante contratos versionados y nunca acceden directamente a bases de datos.
- Mantén la persistencia detrás de puertos de repositorio y adaptadores por motor. No acoples la lógica de aplicación a SQLite, PostgreSQL o MySQL.
- Nunca inventes credenciales, aprobación de producción, verificación de plataforma, requisitos del negocio ni evidencia completada.
- Nunca confirmes archivos `.env`, credenciales, datos de clientes, bases de datos, registros, respaldos o dependencias generadas.
- Mantén contrapartes documentales en español latinoamericano e inglés estadounidense. El código fuente y sus identificadores permanecen en inglés.
- No modifiques los artefactos congelados de publicaciones. Inicia mantenimiento desde `origin/main`, ejecuta las pruebas y documenta los cambios de comportamiento.
