# Operación segura de respaldos

[US English](backup-operations.en-US.md) · [Inicio](README.es-419.md) · [SQLite](recovery.es-419.md) · [PostgreSQL/MySQL](server-recovery.es-419.md)

Revisión técnica: `1.1.0-draft.1`. Perfil local verificable; no configura almacenamiento productivo ni aprueba producción.

## Separación obligatoria

El dump nativo o snapshot es la entrada. `BackupEnvelope` produce un archivo cifrado autenticado y un manifiesto sin datos privados. Eso todavía tiene estado `SEALED_NOT_REPLICATED`: no es durable hasta que otro adaptador confirme su copia a almacenamiento independiente del host y se verifique allí. La llave debe residir en un gestor de secretos o medio separado tanto del respaldo como del repositorio.

El formato divide la entrada en bloques de 1 MiB cifrados con AES-256-GCM, usa nonce aleatorio y contexto de posición para cada bloque, y autentica la secuencia completa y su final con HMAC-SHA-256. Las claves de cifrado y autenticación se derivan por HKDF-SHA-256 de una llave maestra binaria aleatoria de 32 bytes. Antes de abrir se comprueban tamaño, SHA-256, estructura y HMAC integral; cada bloque vuelve a autenticarse al descifrar.

## Comandos locales

Usar rutas absolutas privadas fuera del repositorio y de la raíz pública. Todos los destinos deben ser nuevos:

```text
php scripts/backup-envelope.php keygen NUEVO_ARCHIVO_LLAVE
php scripts/backup-envelope.php seal DUMP_ORIGEN NUEVO_RESPALDO.enc NUEVO_MANIFIESTO.json ARCHIVO_LLAVE
php scripts/backup-envelope.php verify RESPALDO.enc MANIFIESTO.json ARCHIVO_LLAVE
php scripts/backup-envelope.php open RESPALDO.enc MANIFIESTO.json NUEVO_DUMP_RESTAURADO ARCHIVO_LLAVE
```

`open` devuelve `OPENED_NOT_ACTIVATED`: después se aplica el procedimiento específico de SQLite, PostgreSQL o MySQL en un destino nuevo. Nunca activa datos. Una salida distinta de cero significa fallo; aislar salidas parciales y alertar. Los mensajes de error no imprimen rutas, llaves o contenido.

El comando `keygen` facilita la evaluación local, pero producción debe obtener la llave de un KMS/HSM o gestor de secretos y definir rotación, custodia, recuperación y acceso dual. No copiar la llave al almacenamiento del respaldo. Conservar una llave mientras exista cualquier respaldo que la necesite; eliminarla antes vuelve irrecuperables esos datos.

## Programación, alerta y retención

El proyecto consumidor debe envolver en una tarea de Windows, `systemd` timer, cron o servicio equivalente esta secuencia: crear dump nuevo, sellar, verificar localmente, copiar mediante su adaptador de almacenamiento, verificar la copia remota, registrar recibo sin secretos y retirar el dump plano. Solo entonces marcar `REPLICATED_AND_VERIFIED`. No incluir la llave o contraseña en la línea de comandos. Ejecutar con una cuenta dedicada y permisos mínimos.

El supervisor debe tratar cualquier código distinto de cero, ausencia de recibo dentro del intervalo o antigüedad superior al RPO acordado como alerta. La alerta debe identificar motor, entorno, instante y etapa, nunca filas, tokens, llaves o contraseñas. Probar también el canal de alerta; un trabajo que falla silenciosamente no está monitoreado.

La base no borra respaldos automáticamente. Cada proyecto debe declarar períodos por clasificación y obligaciones legales, retención mínima, copias inmutables si aplican y quién aprueba destrucción. Generar primero un plan con identificadores, fechas y hashes; una acción separada debe revalidar destino y política inmediatamente antes de borrar. Conservar al menos una copia restaurable independiente y ejecutar restauraciones periódicas. RPO/RTO solo se aceptan después de pruebas con volumen y red representativos.

## Alcance verificado y límites

Las pruebas cubren binarios mayores de un bloque, byte nulo, manipulación, truncamiento, llave incorrecta, manifiesto alterado y rechazo de destinos existentes. El procesamiento es incremental por bloques; no carga el respaldo completo en memoria. El manifiesto SHA-256 detecta corrupción accidental, mientras HMAC y GCM exigen la llave para autenticar.

No se ha integrado un proveedor remoto, KMS/HSM, bloqueo inmutable, programador o canal de alertas porque son decisiones y credenciales de cada proyecto. Tampoco se ha evaluado conformidad sectorial. Este contenedor es propio de la plantilla; otros lenguajes pueden implementar el mismo contrato o adoptar un formato estándar mantenido, pero deben demostrar interoperabilidad antes de depender de este formato.

Fundamento criptográfico: [NIST SP 800-38D, GCM](https://csrc.nist.gov/pubs/sp/800/38/d/final) y [RFC 5869, HKDF](https://www.rfc-editor.org/rfc/rfc5869).
