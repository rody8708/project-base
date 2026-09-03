# Persistencia independiente del lenguaje y del framework

Revisión técnica: `1.1.0-draft.1`  
Estado: decisión adoptada; evidencia limitada a las implementaciones probadas.  
[US English](persistence-boundary.en-US.md) · [Inicio](../../README.es-419.md) · [Límite API](api-boundary.es-419.md) · [Verificación](verification.es-419.md)

## Principio independiente de herramientas

Los fundamentos y las responsabilidades se definen antes de elegir lenguaje, framework o motor. Una arquitectura propia desde cero es válida. PHP, Laravel, Kotlin y las demás tecnologías del catálogo son implementaciones de referencia, no requisitos del concepto. La implementación concreta sí debe considerar tipos, concurrencia, recursos y capacidades del lenguaje elegido.

Los casos de uso dependen de un contrato de persistencia definido por la aplicación. Un adaptador implementa ese contrato y traduce operaciones y datos al mecanismo de almacenamiento. El dominio y la aplicación no importan drivers, conexiones, SQL, modelos de ORM ni clases de frameworks. La composición selecciona e inyecta el adaptador; no se selecciona el motor dentro de cada caso de uso.

```text
cliente -> contrato API -> casos de uso y dominio
                              -> contrato de persistencia
                                  <- adaptador de persistencia -> motor
```

La flecha hacia el contrato indica dependencia: el adaptador implementa un contrato que pertenece a la aplicación, no al proveedor del motor. No hace falta otra API de red entre backend y base de datos: este límite suele ser una interfaz interna, implementada con el driver del motor.

## Qué debe permanecer estable

El contrato expresa operaciones del dominio, datos de entrada/salida y comportamientos: ausencia de resultados, orden, paginación, conflictos, atomicidad y fallos relevantes. No acepta SQL arbitrario ni devuelve consultas pendientes, conexiones o entidades del ORM. Un cambio de motor que preserve ese comportamiento no debe exigir cambios en los casos de uso, la API o los clientes.

Las transacciones de varios repositorios, si se necesitan, se coordinan mediante un contrato de unidad de trabajo o transacción de la aplicación; su implementación garantiza una misma conexión y límites de commit/rollback. No se agregan abstracciones vacías ni se promete atomicidad entre motores. Los errores del proveedor se traducen en el límite adecuado a errores estables, sin entregar detalles de SQL o credenciales al cliente. Los reintentos requieren operaciones seguras y una política explícita.

## Implementación actual y criterio de selección

La referencia PHP ya tiene `TaskRepository`, `TaskService`, `SqlTaskRepository` y composición en `AppServiceProvider`. El puerto y el servicio no dependen de Laravel. Solo el adaptador SQL usa su query builder, que delega en los drivers SQLite, PostgreSQL y MySQL. El uso de una interfaz del lenguaje no obliga a utilizar un contenedor de framework: una implementación propia puede componer objetos directamente.

Se conserva un adaptador SQL compartido mientras las operaciones requeridas mantengan el mismo comportamiento en los tres motores. No se crean tres copias idénticas solo por sus nombres. Si aparecen capacidades o semánticas específicas, se implementan adaptadores especializados detrás del mismo contrato, o se revisa explícitamente el contrato si la capacidad no puede conservarse. Un ORM por sí solo no demuestra portabilidad.

La matriz local ejecuta la misma suite de API y persistencia sobre los tres motores. Eso verifica el ejemplo cubierto, no todas las consultas futuras. No existe todavía una segunda implementación ejecutable de backend sin framework; no se presenta el principio como evidencia de una implementación inexistente.

## Cambiar de motor no es trasladar datos automáticamente

Antes de adoptar otro motor se debe:

1. Revisar tipos, precisión, Unicode, collation, orden, nulabilidad, unicidad y restricciones.
2. Verificar aislamiento, escrituras concurrentes, conflictos y transacciones con el motor real.
3. Preparar esquema e índices y ensayar transferencia de datos con respaldos y reconciliación.
4. Ejecutar las mismas pruebas de contrato y API, además de pruebas de carga representativas cuando correspondan.
5. Definir corte, reversión, credenciales, permisos y recuperación antes de cambiar la configuración de producción.

Cambiar `DB_CONNECTION` selecciona un perfil: no mueve datos, crea equivalencias semánticas ni garantiza migración sin interrupciones. No se permite cambiar silenciosamente de motor ante un fallo.

## Pruebas locales y fuentes

Las herramientas disponibles en Windows y WSL pueden usarse para pruebas locales. Cada ejecución debe verificar herramientas y destinos, utilizar datos sintéticos y recursos aislados, y limpiar únicamente lo que creó. La disponibilidad de servicios no autoriza a modificar bases existentes. Las comprobaciones por plataforma se registran por separado.

Las referencias ilustran mecanismos y límites, no imponen herramientas: [inyección mediante interfaces en Laravel](https://laravel.com/framework/docs/13.x/container#binding-interfaces-to-implementations), [query builder](https://laravel.com/framework/docs/13.x/queries), [aislamiento en PostgreSQL](https://www.postgresql.org/docs/current/transaction-iso.html), [transacciones de InnoDB](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-transaction-model.html) y [transacciones de SQLite](https://sqlite.org/lang_transaction.html). La selección del adaptador compartido es una decisión de este proyecto apoyada en su matriz de pruebas, no una superioridad universal.
