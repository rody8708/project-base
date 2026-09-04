# Arquitectura y selección de backend

Versión técnica: `1.1.0-draft.1`. Estado: propuesta técnica no aprobada.

[English (United States)](architecture.en-US.md) · [Inicio del starter](README.es-419.md) · [Verificación](verification.es-419.md)

## Responsabilidades

```text
HTTP (JSON, idioma, validación, códigos de estado)
  -> TaskService (casos de uso y conflictos de versión)
    -> TaskRepository (contrato)
      -> SqlTaskRepository (Laravel query builder + PDO)
        -> SQLite | PostgreSQL | MySQL
Task (valor inmutable y reglas del ejemplo) no depende de Laravel.
```

El servicio recibe su repositorio y generador de IDs; no crea conexiones o configura HTTP. El adaptador SQL convierte filas a valores del dominio y traduce fallos `QueryException` a `PersistenceUnavailable`. El límite HTTP solo conoce esa categoría estable y responde 503 sin importar clases del proveedor ni exponer detalles SQL. Las actualizaciones usan una condición por `id` y `version`: una escritura con versión antigua no pisa el resultado anterior. Este mecanismo protege el recurso individual del ejemplo; no implementa transacciones distribuidas, idempotencia general o resolución automática de conflictos.

Las migraciones separan la creación inicial de `tasks` de la incorporación de `completed`/`version`. Se comprueba la actualización de una fila existente y un rollback de esquema solamente en bases de prueba desechables. Los límites de título y de versión se aplican en el dominio; no se presume que SQLite imponga longitudes `VARCHAR` como otros motores. Ninguna migración debe ejecutarse sobre datos de un consumidor sin revisar respaldos, permisos y transición.

## Por qué esta primera implementación es Laravel

La elección local considera el PHP/Composer disponible y la necesidad de una API de negocio con convenciones, validación, migraciones y pruebas. Laravel declara soporte propio para los tres motores, aunque cada combinación necesita verificación. La candidata utiliza su query builder; no agrega otro ORM o framework de persistencia. [Bases de datos de Laravel](https://laravel.com/framework/docs/13.x/database#introduction).

No hay una mejor opción universal. Estas son alternativas de la base, no stacks adicionales instalados ni capacidades verificadas por esta entrega:

| Alternativa | Condición que puede justificar elegirla | Coste o límite |
| --- | --- | --- |
| TypeScript + Fastify | Unificar lenguaje con el frontend; API modular pequeña. | Elegir/mantener persistencia, migraciones y autenticación. Fastify es agnóstico de base de datos. |
| TypeScript + Nest | Equipo que prefiere módulos e inyección de dependencias prescriptivos. | Más abstracciones; puede usar Fastify debajo. |
| Python + Django | Modelos de negocio y administración integrada. | Definir la capa API y mantener el entorno Python/servidor. |
| Python + FastAPI | API tipada y trabajo en ecosistema Python. | Elegir persistencia y migraciones; dimensionar workers. |
| Kotlin/JVM + Ktor o Spring Boot | Requisito JVM/Kotlin o experiencia de equipo en ese ecosistema. | JDK y Gradle/Maven; presupuestar recursos y revisar acceso bloqueante a SQL. |

Estas comparaciones son criterios de diseño, no rankings de velocidad/precio. Fuentes oficiales: [Fastify](https://fastify.dev/docs/latest/Guides/Database/), [Nest](https://docs.nestjs.com/), [Django](https://docs.djangoproject.com/en/6.0/intro/overview/), [FastAPI](https://fastapi.tiangolo.com/tutorial/sql-databases/), [Ktor/Exposed](https://ktor.io/docs/server-integrate-database.html), [Spring Boot](https://docs.spring.io/spring-boot/system-requirements.html). Un backend Kotlin/JVM no sustituye una base Android Kotlin ni determina la tecnología de la interfaz.

Laravel 13 declara PHP 8.3–8.5 y seguridad hasta el 17 de marzo de 2028; esta candidata restringe su perfil a PHP 8.5.x y registra solo la ejecución concreta observada. Un rango soportado por el proveedor no equivale a pruebas locales de todo ese rango. [Política de versiones](https://laravel.com/framework/docs/13.x/releases#support-policy).

## Elección del motor

- SQLite reduce los componentes operativos del inicio y sirve para almacenamiento embebido/local o servicios adecuados a su carga. Solo admite un escritor simultáneo por archivo; no se presenta como sustituto universal de un servidor SQL. [Usos apropiados](https://sqlite.org/whentouse.html).
- PostgreSQL es una opción predeterminada razonable para evaluar un servicio multiusuario nuevo; su MVCC es parte de su modelo de concurrencia. Requiere operar conexiones, permisos, respaldos y mantenimiento. [MVCC](https://www.postgresql.org/docs/current/mvcc-intro.html).
- MySQL/InnoDB es una alternativa razonable cuando existen requisitos, experiencia o infraestructura MySQL. Sus transacciones y claves foráneas no eliminan diferencias de SQL, tipos y collation. [InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-introduction.html).

Seleccionar un motor por consumidor, no ejecutar los tres en producción por defecto. El ejemplo evita características exclusivas como búsqueda textual, tipos JSON complejos, cálculos decimales y SQL específico. Si un consumidor las necesita, debe ampliar la matriz de pruebas; un contrato común no obliga a renunciar a capacidades útiles del motor elegido.

## Límites antes de adoptar

Definir autenticación/autorización y datos sensibles, contratos públicos/versionado, TLS extremo a extremo, permisos mínimos, políticas de registros, respaldos y restauración, observabilidad, carga esperada y actualizaciones de seguridad. Una respuesta HTTP correcta o una auditoría sin avisos no resuelve esas decisiones. El ejemplo no conecta automáticamente las otras plantillas ni contiene configuración de producción elegida por el consumidor.
