# Verificación observada de la base API PHP

Versión técnica: `1.1.0-draft.1`. Estado: propuesta técnica no aprobada; este registro es evidencia de ejecución, no aprobación de producto.

[English (United States)](verification.en-US.md) · [Inicio de la base](README.es-419.md) · [Arquitectura](architecture.es-419.md)

## Ejecución registrada

La matriz final se ejecutó del `2026-09-03T01:59:05Z` al `2026-09-03T01:59:50Z` (2 de septiembre en la zona local America/New_York). Cliente PHP `8.5.1` NTS x64 en Windows, Composer `2.9.5`, Laravel `13.30.1`, PHPUnit `12.5.34`, Mockery `1.6.15`. PostgreSQL/MySQL se ejecutaron como servidores Linux en contenedores del Docker `29.1.3` local de WSL `Ubuntu-24.04`.

| Comprobación | Resultado observado |
| --- | --- |
| `composer validate --strict --no-check-all` | Manifiesto y lock válidos; sin salida de error. |
| `composer check-platform-reqs` | Requisitos de los paquetes instalados satisfechos. |
| `composer check` | Sintaxis de 37 archivos PHP; 51 pruebas, 186 aserciones con SQLite. |
| `composer audit --format=json` | `advisories: []`, `abandoned: []` en el momento de la consulta. |
| Matriz SQLite `3.49.2` | 51 pruebas, 186 aserciones; sin advertencias. |
| Matriz PostgreSQL `18.6` | La misma suite: 51 pruebas, 186 aserciones; sin advertencias. |
| Matriz MySQL `8.4.11` | La misma suite: 51 pruebas, 186 aserciones; sin advertencias. |
| HTTP real, servidor local y SQLite | 9 escenarios completados; proceso detenido y filas sintéticas retiradas. |

Las tres ejecuciones repiten una suite, no representan 153 casos distintos. Algunas pruebas son de dominio o de los helpers y no usan SQL. Las pruebas de persistencia y API sí se ejecutan con el motor indicado, no con un sustituto en memoria.

Los escenarios HTTP reales fueron vida del proceso (`200`), creación (`201`), consulta (`200`), actualización (`200`, versión `2`), eliminación con versión antigua (`409`), eliminación vigente (`204`), consulta ausente en español (`404`), JSON mal formado (`400`) y método no permitido (`405`, `Allow: GET, HEAD`). Usaron únicamente `127.0.0.1:18080`; no prueban HTTPS ni un servidor de producción. La automatización repetible de contratos HTTP reside en [ApiTest.php](tests/Feature/ApiTest.php); los nueve escenarios adicionales se ejecutaron con un cliente local sobre TCP.

## Identidad y aislamiento

Identificador del recibo local final: `10eac014a09550ea`. El helper conserva el reporte y la salida de cada motor bajo `.validation/`, excluido de exportación. Este resumen portable conserva la identidad del lock, del recibo y de las imágenes sin incluir secretos ni rutas personales.

```text
composer.lock SHA-256
2815933939c353ee7c6c5154f89eece6101bd1aa6a329c4eb4a778b565d92656
report.json SHA-256
91da1ca70efab4ff8a4143ca6cc5921c18a7a003bc3a07e6fbae39fc54bb2284
postgres:18.6-bookworm@sha256:1c59e2c3c818eaa0f0628f695b36e7c9e362d6b219b36a54a32df645cbd7e1af
mysql:8.4.11@sha256:b3b90af2a6552ae30c266fdb7d5dd55f3afb72404bb78d37fe8a23eb857fd3fb
```

Los tags proceden del catálogo de imágenes oficiales de [PostgreSQL](https://github.com/docker-library/official-images/blob/master/library/postgres) y [MySQL](https://github.com/docker-library/official-images/blob/master/library/mysql); los digests anteriores fijan las imágenes realmente usadas. No se utilizó `latest`.

Los puertos `15432` y `13306` se comprobaron libres en Windows/WSL antes de crear instancias nuevas. Bases y contraseñas fueron sintéticas; datos de servidores en tmpfs, sin montar carpetas del host. El reporte confirmó retiro de `foundation-php-pgsql-10eac014a09550ea` y `foundation-php-mysql-10eac014a09550ea`; la consulta posterior por su etiqueta no devolvió contenedores. No se consultó ni modificó la instancia del usuario en `3306`. Las imágenes descargadas quedan en la caché de Docker.

La matriz habilitó `pdo_pgsql` solo por proceso. PostgreSQL usó `sslmode=disable` únicamente para esta QA desechable en loopback. El valor predeterminado de la candidata sigue siendo `verify-full`; esa configuración no constituye una prueba real de certificados/TLS remotos.

## Qué comprueba la suite

- Límites de título Unicode, inmutabilidad del valor, UUID canónico y versiones; rechazo de tipos, campos extra, cuerpos grandes, JSON inválido, controles y separadores de línea/párrafo.
- CRUD, cursor y límites de paginación, idiomas y códigos estables, cabecera `Allow`, errores sin SQL ni detalles privados en la respuesta.
- Reconexión con persistencia, parámetros SQL, clave primaria única, `NOT NULL`, rollback de transacción, transición de las dos migraciones y valores predeterminados de una fila previa.
- Actualización/eliminación condicionadas por versión e intercalación secuencial de escrituras obsoletas. No es una prueba de carga ni de concurrencia distribuida real.
- Configuración de servidor explícita y rechazo del perfil MySQL remoto aún no habilitado, sin conectarse a ese host.
- Configuración local exclusiva, conservación de archivos preexistentes y ausencia de clave en stdout. En Windows no se verifican los permisos POSIX de creación.
- Guards puros del ejecutor: una inspección fallida, etiqueta ajena o nombre ajeno impide borrar; stderr de PHP o código de salida distinto de cero impide declarar éxito. La selección de extensión evita cargarla dos veces. Esos casos no simulan una caída real del daemon.

## Correcciones y límites

Las ejecuciones previas detectaron la normalización no deseada de `es-419`, la diferencia entre objeto JSON y array, y una conexión SQLite abierta durante limpieza de un test que cambiaba el motor predeterminado. Se corrigieron y se repitió la suite. La revisión también reforzó UUID canónico entre motores, preservación de `Allow`, permisos locales y fallo cerrado del helper. Las ejecuciones previas con advertencias no se usaron como resultado final limpio.

Este registro no verifica todas las combinaciones de PHP, sistemas operativos o versiones SQL; PostgreSQL/MySQL nativos en Windows; TLS remoto; autenticación/autorización; restauración de respaldos; observabilidad; volumen de datos, rendimiento o accesibilidad de un cliente; despliegue o seguridad integral. Los errores `503` incluyen una inyección controlada de excepción SQL; no se afirma recuperación real ante caída del servidor. No hay una cobertura porcentual medida ni una garantía de portabilidad de cualquier consulta futura.

Repetir los comandos del [README](README.es-419.md) en la copia consumidora después de revisar su entorno. Los resultados actuales justifican evaluar esta candidata bajo el contrato y versiones descritos; no seleccionan motor, licencia o configuración de producción por el consumidor.
