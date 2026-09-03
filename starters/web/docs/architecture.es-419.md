# Arquitectura de la plantilla web

Revisión técnica: `1.1.0-draft.1`  
Estado: candidato técnico local.  
Idioma: español latinoamericano (`es-419`)  
[US English](architecture.en-US.md) · [Inicio](../README.es-419.md)

## Dirección de dependencias

```text
main.tsx (composición)
  ├─ ui → application → domain
  └─ adapters → contrato de application + domain
```

Esta separación es una decisión local pequeña, no una arquitectura universal. No se agregan contenedores de inyección, clases base, buses, repositorios genéricos ni capas sin trabajo propio.

| Pieza | Responsabilidad | Qué no conoce |
| --- | --- | --- |
| `domain/task.ts` | Valida valores, crea tareas y cambia su estado sin modificar la anterior. | React, DOM, red, reloj real y almacenamiento. |
| `application/task-service.ts` | Coordina agregar, listar y marcar; recibe repositorio, ID y reloj. | El almacenamiento concreto y los controles de interfaz. |
| `adapters/memory-task-repository.ts` | Conserva tareas en un `Map` privado y devuelve copias inmutables. | React y traducciones. |
| `ui/App.tsx` y `ui/locales` | Presentan estado y errores tipados; traducen etiquetas, no datos del usuario. | La estructura interna del `Map`. |
| `main.tsx` | Construye dependencias e inicia React. | No inventa otras reglas de dominio. |

## Contratos del ejemplo

Un título debe ser texto no vacío después de quitar espacios exteriores, sin controles C0/C1 internos y con hasta 80 puntos de código Unicode. No se aplica normalización cultural, corrección ni traducción automática. Los identificadores usan de 1 a 100 caracteres ASCII alfanuméricos, guion o guion bajo. El tiempo de creación es un entero seguro de milisegundos desde la época Unix entre `0` y `8640000000000000`; es un dato del ejemplo, no un cronómetro.

Los errores se devuelven como `Result<T>` con `ok: false` y un código conocido. El servicio comprueba el título antes de consumir un ID o consultar el reloj. Las excepciones inesperadas del repositorio se convierten en `STORAGE_UNAVAILABLE`, sin detalles privados ni reintentos automáticos. Un resultado incierto no significa necesariamente que un adaptador remoto no haya aplicado una operación.

El contrato de `update` aplica una transformación pura a la tarea vigente de forma atómica, o falla sin cambiarla. El adaptador en memoria no hace `await` entre lectura y reemplazo. Esto evita perder dos cambios concurrentes dentro de esa instancia y ese proceso; no demuestra transacciones distribuidas ni seguridad entre procesos. La identidad no puede cambiar y agregar una identidad repetida no sobrescribe datos. Un adaptador futuro debe conservar ese contrato con sus propios controles y pruebas.

React conserva un borrador y una lista de resultados; bloquea acciones simultáneas de interfaz mientras termina una operación. Si agregar falla, no borra el borrador ni inventa éxito. Si falla refrescar después de escribir, informa que no pudo confirmar el resultado y permite volver a listar antes de repetir. La lista puede crecer sin persistencia ni límite de cantidad: no se presenta como almacenamiento de producción.

## Qué se comparte y qué se adapta

Se pueden reutilizar las reglas puras y los casos de uso cuando el nuevo producto mantenga sus contratos. El repositorio, los textos, los estilos y la interfaz son adaptadores reemplazables. Copiar el dominio a un producto móvil o de escritorio no valida sus permisos, almacenamiento, accesibilidad o ciclo de vida.

En un producto con backend, validación y autorización deben existir también en el entorno confiable que protege los datos. Esta plantilla no incluye ese entorno. Tampoco decide autenticación, persistencia, router, SSR, despliegue o proveedores: incorporarlos requiere un alcance explícito y pruebas correspondientes.

## Verificación y mantenimiento

Las pruebas de dominio cubren normalidad, vacío, tipos incorrectos, controles, límites de Unicode, ID y tiempo. Las de aplicación comprueban dependencia inyectada, errores, duplicados, aislamiento entre instancias y cambios concurrentes en memoria. Los componentes se comprueban mediante etiquetas y roles en `jsdom`; no se inspeccionan estados privados de React.

La compilación no sustituye la comprobación de tipos, y `jsdom` no sustituye un navegador real ni una revisión de accesibilidad. El [registro](verification.es-419.md) separa los resultados obtenidos de esos límites. Al reemplazar el ejemplo, conserva pruebas que detecten sus contratos nuevos, no solamente archivos de prueba que sigan pasando sin representar el producto.
