# Laboratorio operativo Python

[US English](operations-lab.en-US.md) · [Inicio](README.es-419.md)

## Ejecutar el ensayo completo

Desde esta plantilla, con Python 3.13, uv y Docker:

```powershell
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

Resultado final local: **25 pruebas aprobadas por motor**, Ruff y mypy aprobados. Se comprobó la retirada de contenedores propios, archivos SQLite y material TLS temporal; permanecen las imágenes en caché. Los controles de raíz aprobaron 71 pruebas y la verificación documental/arquitectónica.

Incidencia abierta `PY-LAB-001`: una ejecución SQLite produjo un `ReadTimeout` de cinco segundos al actualizar por HTTPS después de restaurar. No se reprodujo en la siguiente suite completa ni en cuatro ensayos aislados con el mismo timeout; no se amplió el límite ni se omitió la comprobación. Causa no determinada: no declarar resuelta ni prometer latencia con esta evidencia. Si reaparece, conservar trazas sanitizadas del servidor y del cliente antes de intentar corregirla.

El 4 de septiembre de 2026, sobre `60176b3` en la rama `test/python-operational-lab`, Windows con Python 3.13.6, uv 0.12.4 y Docker en Ubuntu-24.04 WSL ejecutó el perfil con SQLite, PostgreSQL 18.6 y MySQL 8.4.11. La regresión inicial del contador permitió 12 operaciones con un máximo de cinco: fallo reproducido. La actualización atómica corrigió la causa. La primera CA de prueba carecía de extensiones requeridas por la validación estricta; se corrigió el certificado, sin relajar TLS.

Estos ensayos son acotados, no un benchmark, prueba de carga sostenida, recuperación ante desastre ni aprobación de producción. No establecen latencia objetivo, capacidad máxima, RPO/RTO ni rendimiento multiworker. Quedan a cargo del producto el dominio y certificados reales, proxy/TLS de despliegue, renovación, cifrado y almacenamiento externo de respaldos, retención, restauración a un instante, volumen real de datos, monitoreo y alertas. Cambiar de motor con datos existentes requiere una migración de datos propia; este ensayo restaura dentro del mismo motor.
