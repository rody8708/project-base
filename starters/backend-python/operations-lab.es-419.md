# Laboratorio operativo Python

[US English](operations-lab.en-US.md) · [Inicio](README.es-419.md)

## Ejecutar el ensayo completo

Desde esta plantilla, con Python 3.13, uv y Docker:

```powershell
uv python install 3.13.15
uv sync --locked --all-extras
uv run ruff check .
uv run mypy
uv run pytest -W error --tb=short --live-https
uv run pytest -W error --tb=short --live-https --database-engine=postgresql --docker-wsl=Ubuntu-24.04
uv run pytest -W error --tb=short --live-https --database-engine=mysql --docker-wsl=Ubuntu-24.04
```

Omite `--docker-wsl` si Docker está disponible directamente. No proporciones una base existente: el laboratorio solo crea recursos propios con datos sintéticos. `--live-https` sustituye HTTP por HTTPS para los recorridos API; las pruebas específicas de TLS y recuperación siempre usan HTTPS. CI ejecuta los tres motores con este perfil.

## Qué verifica

- **TLS:** una CA efímera firma un certificado de servidor local. El cliente valida la cadena y el nombre sin desactivar verificaciones. Se exige TLS 1.2 o 1.3 y se comprueba rechazo de CA no confiable, nombre incorrecto y certificado vencido. No se modifica ningún almacén de confianza del sistema.
- **Concurrencia:** 24 creaciones simultáneas conservan identificadores únicos; de 12 actualizaciones sobre la misma versión, una gana y 11 reciben 409. Una ráfaga de 144 solicitudes en una ventana temporal fijada por la prueba admite 120 y rechaza 24 con 429. Doce conexiones SQL simultáneas comprueban un límite de cinco, tanto para contadores nuevos como existentes.
- **Recuperación:** SQLite usa su API nativa de respaldo; PostgreSQL usa `pg_dump`/`psql`; MySQL usa `mysqldump`/`mysql`. El destino es otra base vacía. Se comparan migraciones y tokens, se comprueba una tarea Unicode y su versión, y se verifica que datos posteriores al respaldo no aparezcan en el destino. Antes de habilitar la API restaurada se invalidan tokens recuperados y se emite uno sintético nuevo. HTTPS confirma lectura, actualización y rechazo del token anterior. La base fuente permanece intacta.

La corrección concurrente vive exclusivamente en infraestructura: inserción idempotente por dialecto y actualización condicional atómica dentro de la unidad de trabajo. No cambia el contrato API ni requiere migración de esquema. Un proyecto que adopte el adaptador debe conservar ambas operaciones en la misma transacción.

## Seguridad y limpieza

Certificados y claves son temporales; la clave CA permanece en memoria. Certificados de servidor, claves y bases SQLite se retiran al finalizar. Los contenedores tienen nombres aleatorios propios, puertos loopback y almacenamiento temporal en memoria, sin montajes del usuario. Los volcados PostgreSQL/MySQL se mantienen en memoria del proceso y nunca se imprimen. Imágenes descargadas y cachés de herramientas se conservan. Las pruebas no leen `.env` ni usan bases o credenciales reales. No son comandos de respaldo para ejecutar sobre producción.

## Evidencia y límites

### Corrección de bloqueos reproducidos

Verificación posterior: Ruff y mypy aprobados; 31 pruebas por motor con `--live-https --recovery-diagnostics --recovery-repeat=3`; 100 recuperaciones SQLite adicionales con `--recovery-repeat=100 --recovery-diagnostics --recovery-fragment-body`, sin aumentar el timeout. La opción de fragmentación envía el JSON del PUT en bytes individuales separados por un milisegundo para ensayar la recepción parcial. Pasaron 72 pruebas de raíz y los controles de documentación/arquitectura. El entorno nuevo es Python 3.13.15 y SQLite 3.53.1; el Python global 3.13.6 se conserva. Recursos de pruebas retirados; no se tocaron bases del usuario.

La investigación posterior reprodujo un `ReadTimeout` tras 30 recuperaciones correctas. La traza ubicó al servidor dentro de `do_commit`, con HTTPS establecido y el cuerpo recibido: la respuesta llegó después del presupuesto de cinco segundos. Ocurrió en la creación inicial, no en el PUT histórico; es evidencia de la misma clase de espera, no prueba retrospectiva de aquel episodio sin trazas.

Dos regresiones controladas fallaron antes del cambio: un lector SQLite retenido impidió confirmar la escritura dentro de dos segundos; una operación de aplicación detenida impidió completar otra conexión HTTPS al endpoint de salud. Ahora el adaptador SQLite configura `journal_mode=WAL` y `synchronous=FULL` en archivos locales, y el transporte ejecuta límites y operaciones de escritura síncronas mediante el pool de trabajadores. Las transacciones permanecen completas dentro del trabajador. Las dos regresiones pasan después del cambio; el timeout original no se amplió.

Se fija Python administrado por uv `3.13.15` (SQLite `3.53.1` verificado en Windows), sin reemplazar el Python global. El adaptador rechaza SQLite anterior a `3.51.3` para archivos, evitando activar WAL sobre una versión afectada por el fallo de reinicio WAL documentado por SQLite. CI instala el mismo runtime con uv; el diagnóstico de inicio busca ese runtime sin descargarlo.

WAL necesita almacenamiento local y archivos laterales `-wal`/`-shm`; no usar carpetas de red ni copiar solo el archivo principal de una base abierta. La API nativa de respaldo sigue siendo el procedimiento ensayado. El modo queda persistido en archivos existentes: detener clientes y respaldar antes de adoptar el cambio. Para revertirlo, cerrar conexiones, completar el checkpoint y cambiar deliberadamente a `journal_mode=DELETE`; no borrar archivos laterales manualmente. `FULL` conserva la sincronización en cada commit, no se adoptó `NORMAL` ni `OFF`. Véanse [WAL de SQLite](https://www.sqlite.org/wal.html) y [synchronous](https://www.sqlite.org/pragma.html#pragma_synchronous).

Estado de `PY-LAB-001`: mecanismos de bloqueo reproducidos corregidos; el episodio histórico concreto no puede atribuirse con certeza retrospectiva. No se garantiza que un disco detenido, un escritor externo retenido o un pool saturado responda siempre antes de cinco segundos. Se mantienen los diagnósticos para distinguir esos límites operativos de una regresión.

### Registro de la fase diagnóstica inicial

Los registros siguientes describen la investigación anterior a la corrección indicada arriba; su estado abierto y cantidades de pruebas son históricos, no el resultado actual.

```powershell
uv run pytest tests/integration/test_recovery.py --recovery-repeat=40 --recovery-diagnostics -s --tb=short
```

`--recovery-repeat` acepta de 1 a 100 y crea recursos aislados en cada iteración. Para comparar sin instrumentación, omite `--recovery-diagnostics`. El timeout HTTP permanece en cinco segundos. La instrumentación opcional registra duraciones SQL, etapas de conexión/envío/recepción del cliente y progreso HTTP del servidor; conserva como máximo 80 eventos. Ante un fallo de red captura nombres de funciones/archivos y líneas de las pilas antes de cerrar el servidor, nunca variables locales. No registra SQL, parámetros, encabezados, cuerpos ni texto de excepciones. `-s` muestra resúmenes también cuando las pruebas pasan; CI conserva el diagnóstico de fallos y repite tres recuperaciones por motor.

Investigación del 4 de septiembre de 2026 sobre `bf225bf`, rama `diagnose/python-recovery-timeout`, mismo entorno Windows/Python 3.13.6: **340 recorridos SQLite aprobados** en la campaña (40 aislados instrumentados; cuatro procesos simultáneos de 40 con bases independientes; 100 sin instrumentación; 40 dentro de la suite completa). Esta última ejecución aprobó 66 pruebas. No se reprodujo el timeout. Las primeras 200 mediciones situaron el recorrido completo aproximadamente entre 0,54 y 0,81 segundos y la mayor consulta observada en unos 28,5 ms; no son garantías de rendimiento. Se agregaron pruebas del límite de eventos, ausencia de datos sensibles y desactivación del diagnóstico.

**PY-LAB-001 permanece abierta: causa no determinada.** No hay evidencia para atribuir el episodio histórico a SQLite, TLS, el servidor o el host. No se modificó código de producción ni se inventó una corrección. Si vuelve a fallar, comparar la última etapa del cliente con `body.wait`, `sql.begin`/`sql.end` y las etapas de respuesta antes de seleccionar una corrección.

Resultado final local: **25 pruebas aprobadas por motor**, Ruff y mypy aprobados. Se comprobó la retirada de contenedores propios, archivos SQLite y material TLS temporal; permanecen las imágenes en caché. Los controles de raíz aprobaron 71 pruebas y la verificación documental/arquitectónica.

Incidencia abierta `PY-LAB-001`: una ejecución SQLite produjo un `ReadTimeout` de cinco segundos al actualizar por HTTPS después de restaurar. No se reprodujo en la siguiente suite completa ni en cuatro ensayos aislados con el mismo timeout; no se amplió el límite ni se omitió la comprobación. Causa no determinada: no declarar resuelta ni prometer latencia con esta evidencia. Si reaparece, conservar trazas sanitizadas del servidor y del cliente antes de intentar corregirla.

El 4 de septiembre de 2026, sobre `60176b3` en la rama `test/python-operational-lab`, Windows con Python 3.13.6, uv 0.12.4 y Docker en Ubuntu-24.04 WSL ejecutó el perfil con SQLite, PostgreSQL 18.6 y MySQL 8.4.11. La regresión inicial del contador permitió 12 operaciones con un máximo de cinco: fallo reproducido. La actualización atómica corrigió la causa. La primera CA de prueba carecía de extensiones requeridas por la validación estricta; se corrigió el certificado, sin relajar TLS.

Estos ensayos son acotados, no un benchmark, prueba de carga sostenida, recuperación ante desastre ni aprobación de producción. No establecen latencia objetivo, capacidad máxima, RPO/RTO ni rendimiento multiworker. Quedan a cargo del producto el dominio y certificados reales, proxy/TLS de despliegue, renovación, cifrado y almacenamiento externo de respaldos, retención, restauración a un instante, volumen real de datos, monitoreo y alertas. Cambiar de motor con datos existentes requiere una migración de datos propia; este ensayo restaura dentro del mismo motor.
