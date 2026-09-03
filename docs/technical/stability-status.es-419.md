# Estado de la publicación estable

[US English](stability-status.en-US.md) · [Inicio](../../README.es-419.md) · [Arquitectura backend](backend-architecture.es-419.md)

Revisión evaluada: `1.1.0-draft.1`. Publicación efectiva: [`1.1.0`](../../releases/approval-1.1.0.es-419.md). Una versión estable describe el alcance comprobado; no significa que cada combinación posible de sistema, proveedor o lenguaje haya sido ejecutada.

| Condición | Clasificación | Efecto sobre estabilidad |
| --- | --- | --- |
| macOS/iOS sin una Mac disponible | Pendiente conocido y explícito | No bloquea una publicación estable para los destinos comprobados. Esos dos destinos conservan estado `no verificado`; no se promete soporte ejecutado. |
| Revisión integral y pruebas | Completada con excepciones declaradas | [Revisión técnica](stability-review.es-419.md) satisfactoria; identidad exacta congelada, recuperada y aprobada. |
| Licencia del código original | MPL-2.0 adoptada | Ya no bloquea la publicación. El texto oficial, el alcance bilingüe y una copia en cada starter exportable están incorporados. |
| Repositorio GitHub y protección de ramas | Publicación posterior | No cambia la calidad del contenido; debe configurarse antes de colaboración pública. La rama protegida controla el repositorio oficial, no las copias de terceros. |
| Cloud, KMS, respaldo remoto, alertas y cuentas de cada producto | Responsabilidad del consumidor | No bloquea la base. La base define contratos y controles; cada producto selecciona y verifica proveedores y credenciales. |

## Niveles de backend

PHP/Laravel es la referencia ejecutable de cobertura amplia y no es obligatorio. TypeScript/Node es una segunda base ejecutable, exportable y sin framework de aplicación; actualmente es candidata porque no tiene toda la matriz de PHP. Python, .NET, Go y JVM son opciones documentadas, no implementaciones falsamente declaradas.

Una publicación estable puede contener perfiles opcionales marcados `candidate` siempre que el camino estable no dependa de ellos y sus límites sean visibles. No puede llamarlos equivalentes ni trasladar su evidencia. Para promover Node se deben cerrar sus pendientes o aprobar explícitamente un alcance menor.

## Decisión actual

La licencia está resuelta con MPL-2.0. macOS/iOS queda aceptado como pendiente no bloqueante por falta de hardware. La revisión, congelación, recuperación y aprobación explícita de la identidad `1.1.0` se completaron. El siguiente paso independiente es publicar esos bytes y sus recibos en GitHub y configurar la protección de la rama oficial.
