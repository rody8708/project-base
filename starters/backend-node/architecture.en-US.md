# Neutral Backend Architecture

[Español (Latinoamérica)](architecture.es-419.md) · [Home](README.en-US.md) · [Contract](contracts/task-api-v1.openapi.json)

This starter separates domain rules, use cases, `TaskRepository`/`TokenRepository` ports, the SQLite adapter, and HTTP transport. Dependencies point toward internal contracts; changing a framework or engine must not change the domain or public contract.

A custom implementation is valid when it preserves authentication, permissions, ownership inside queries, strict validation, concurrency, transactions, and stable errors. Changing databases requires another adapter and real tests. Sharing OpenAPI alone does not prove equivalence: the same positive and negative HTTP suite is required.

Node's standard server is an adapter, not the architecture. Fastify, Nest, or another framework may replace it at composition time without being imported into the domain. Pending limitations are listed in the [README](README.en-US.md).
