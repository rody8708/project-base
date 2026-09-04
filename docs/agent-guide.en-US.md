# Using Project Base Through Agents and MCP

Working revision: `1.2.0-rc.1`  
Language: US English (`en-US`)  
[Español (Latinoamérica)](agent-guide.es-419.md) · [Home](../README.en-US.md)

## Two Communication Paths

Project Base is not a permanent service or an artificial-intelligence model. An agent can use it directly through files and a terminal or through the local MCP server. Both paths call the same generation engine; MCP does not maintain another copy of the templates or make architecture decisions by itself.

```text
person or agent ──> CLI or MCP ──> Project Base engine ──> new consumer project
```

An agent without MCP reads `AGENTS.md`, runs `npm run create-app`, inspects the generated `project-base.json`, and uses `doctor`, `setup`, `check`, and `start` at the solution root. An MCP-compatible host can discover structured resources and tools.

## Local MCP Server

Install the exact locked dependencies from the Project Base root:

```powershell
npm ci --ignore-scripts
```

Then configure the MCP host to start:

```text
command: node
arguments: D:\absolute\path\to\project-base\tools\mcp-server.mjs
working directory: D:\absolute\path\to\project-base
transport: stdio
```

Each host stores this configuration differently; no configuration file is universal across all clients. Always use your own absolute paths. The process opens no port and accepts no network connections. `stdout` is reserved for the MCP protocol, and transport errors go to `stderr` without internal details.

The implementation pins `@modelcontextprotocol/server` `2.0.0` and uses `serveStdio`, following the [official stdio transport guide](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/stdio.md) and the [official server package](https://github.com/modelcontextprotocol/typescript-sdk/tree/main/packages/server). The lockfile preserves the exact resolution used by this checkout.

## Available Resources

The server exposes Spanish and English versions of:

- the getting-started procedure;
- immutable rules;
- engineering standards;
- the API boundary between clients and backends.

Resources are read from the current checkout. They do not replace selection of a verifiable revision or turn changes on `main` into a stable release.

## Available Tools

| Tool | Effect |
| --- | --- |
| `project_base_list_templates` | Returns supported presets and backends; read-only. |
| `project_base_doctor` | Inspects the tools required by a selection; read-only. |
| `project_base_create_solution` | Creates a new solution at an absolute path; changes only a nonexistent destination. |

Creation rejects existing destinations, paths inside the repository, unsafe names, and unknown templates. It does not install dependencies, execute generated-project code, use credentials, or publish. `setup`, `check`, and `start` remain explicit terminal actions in the consumer project: silently executing scripts from a subsequently modified project through an MCP call would unnecessarily expand code-execution risk.

## Recommended Agent Sequence

1. Ask or infer only from evidence which product, users, and platforms are in scope.
2. Read the rules and API boundary through MCP resources or their equivalent files.
3. Call `project_base_list_templates`; do not invent an absent option.
4. Run `project_base_doctor` for the intended selection and present any missing requirement.
5. Confirm the name and destination before calling `project_base_create_solution`.
6. Change working context to the generated project and read its `START-HERE` and `project-base.json`.
7. Run `npm run setup`, `npm run check`, and `npm start` only with normal authorization to work in that project.
8. Build product-specific capabilities without modifying Project Base or claiming production readiness without the product's own evidence.

## Trust Boundary

MCP annotations state which tools are read-only and which one creates files, but a host or model must not treat annotations as a security mechanism. The person retains control of filesystem permissions and action approval. This server provides no remote HTTP transport, MCP authentication, GitHub access, system-tool installation, secret handling, or arbitrary command execution.
