# Estándares de ingeniería aplicables

Revisión de trabajo: `1.1.0-draft.2`  
Estado: política operativa adoptada para el árbol posterior a `v1.1.0`; no modifica la publicación congelada.  
Idioma: español latinoamericano (`es-419`)  
[US English](engineering-standards.en-US.md) · [Inicio](../README.es-419.md) · [Reglas del núcleo](immutable-rules.es-419.md)

## Propósito y precedencia

Estos estándares convierten principios generales en decisiones aplicables a los starters y a proyectos consumidores. Complementan las diez reglas del núcleo; no sustituyen sus contratos, evidencia ni límites. Si dos reglas parecen incompatibles, se conserva primero seguridad, integridad de datos, autorización y comportamiento público, y se documenta la decisión.

La fuerza de cada regla se expresa así:

- **MUST:** requisito no negociable para seguridad, corrección o integridad arquitectónica. Una violación bloquea la entrega.
- **SHOULD:** expectativa fuerte. Solo se aplaza con motivo, riesgo, responsable y seguimiento documentados en el pull request.
- **NICE:** mejora deseable. Si se evalúa y se omite, se registra brevemente el motivo; no bloquea por sí sola.

Una regla se aplica únicamente cuando existe el comportamiento correspondiente. No se inventan cuentas, tenants, pagos, almacenamiento local ni infraestructura para satisfacer una lista genérica.

## Arquitectura y dependencias

- **MUST:** separar dominio, aplicación, adaptadores de infraestructura, presentación/transporte y composición. Los nombres de carpetas pueden variar según el lenguaje; la dirección de dependencias no.
- **MUST:** dominio y aplicación no dependen de HTTP, UI, drivers SQL, conexiones, ORM ni implementaciones de proveedores.
- **MUST:** la aplicación consume persistencia y servicios externos mediante puertos o interfaces internas. Sus implementaciones viven en infraestructura.
- **MUST:** controladores y widgets traducen el límite externo; no contienen reglas de negocio ni acceso a datos.
- **MUST:** las entidades y DTO no contienen lógica de persistencia ActiveRecord.
- **MUST:** una aplicación con backend remoto usa la API como único enlace del cliente; ningún cliente accede directamente a la base de datos.
- **SHOULD:** extraer una orquestación a un caso de uso cuando combina permisos, transacciones, varios repositorios o efectos. Un método de controlador que supera aproximadamente 30 líneas de cuerpo exige revisión y justificación.
- **SHOULD:** usar inyección por constructor y mantener la composición como lugar único donde se eligen implementaciones. No usar localizadores globales de servicios desde dominio, aplicación o módulos.
- **SHOULD:** aplicar Strategy, Factory, Event Bus o Facade únicamente cuando existe variación o desacoplamiento real. Un patrón sin problema concreto no es conformidad.
- **MUST:** coordinar operaciones atómicas de varios repositorios en el límite de aplicación mediante una abstracción de transacción o unidad de trabajo; no filtrar una conexión al dominio.

El [límite de persistencia](technical/persistence-boundary.es-419.md), el [límite API](technical/api-boundary.es-419.md) y la [arquitectura backend](technical/backend-architecture.es-419.md) definen el comportamiento neutral entre lenguajes.

## Guardia arquitectónica

`npm run architecture:check` aplica un ratchet automático al código mantenido. Actualmente bloquea:

- PHP sin `declare(strict_types=1)` y dependencias de dominio hacia Laravel, PDO o capas externas.
- PDO, SQL o implementaciones de infraestructura dentro de aplicación y transporte HTTP PHP.
- HTTP o SQLite dentro de contratos/aplicación Node.
- dependencias de UI/adaptadores desde dominio o aplicación web.
- dependencias de presentación/infraestructura desde dominio y aplicación Flutter.
- Android, red o adaptadores desde el núcleo Kotlin, y transporte directo desde pantalla o ViewModel.

**MUST:** una violación nueva falla CI. Las excepciones no se silencian ampliando patrones o eliminando comprobaciones; se corrige el límite o se documenta y revisa una evolución explícita del estándar.

## Seguridad según el tipo de interfaz

- **MUST:** validar datos no confiables en el límite que protege la operación; la validación visual nunca sustituye al servidor.
- **MUST:** usar consultas parametrizadas o APIs equivalentes; no concatenar entrada en SQL.
- **MUST:** distinguir autenticación de autorización y comprobar propiedad, tenant y permisos en el backend cuando existan.
- **MUST:** mantener secretos, credenciales, datos personales, bases, logs, respaldos y `.env` reales fuera de Git.
- **MUST:** escapar contenido no confiable según el contexto de salida. React, Flutter, Compose o `textContent` pueden proporcionar el mecanismo; HTML construido como texto requiere escape explícito.
- **MUST:** proteger con CSRF las operaciones autenticadas mediante cookies que el navegador envía automáticamente. Una API bearer que no usa cookies no agrega CSRF ficticio; protege token, CORS, TLS, autorización y replays según su amenaza.
- **MUST:** almacenar contraseñas con un algoritmo moderno resistente y una configuración revisada cuando el producto use contraseñas. El starter actual no implementa cuentas humanas; un proyecto debe seleccionar y probar identidad, activación, recuperación y MFA según su riesgo.
- **SHOULD:** limitar intentos, permitir revocación, registrar eventos de seguridad y no mostrar diagnósticos internos.

El perfil implementado y sus límites constan en [seguridad y producción](technical/security-production.es-419.md).

## Interfaces, idiomas y accesibilidad

- **MUST:** todo texto visible mantenido por el producto proviene de una fuente traducible. Mínimo de los starters: `es-419` y `en-US`.
- **MUST:** conservar UTF-8 válido, acentos reales y `ñ`; el mojibake bloquea la entrega.
- **MUST:** representar estados relevantes de carga, vacío, éxito, error, sin autorización y sin permiso. Offline/sincronización se vuelve obligatorio únicamente si el producto declara esa capacidad.
- **MUST:** ofrecer modo claro y oscuro y verificar contraste y legibilidad en ambos cuando el starter tenga interfaz visual.
- **MUST:** adaptar la interfaz a los tamaños y clases de dispositivo declarados, con foco, teclado, semántica y objetivos táctiles según la plataforma.
- **SHOULD:** usar tokens visuales compartidos y extraer patrones repetidos. Pantallas estiradas o texto crudo de error no cumplen una revisión visual de producto.

## Pruebas y evidencia

- **MUST:** comportamiento nuevo y defectos corregidos tienen pruebas automatizadas proporcionales; un defecto reproducible incluye regresión.
- **MUST:** lógica de aplicación se prueba sin red, UI ni bases reales mediante dobles apropiados. No es obligatorio crear un doble sin uso para cada interfaz.
- **MUST:** adaptadores de persistencia se prueban con infraestructura aislada y cada motor declarado compatible.
- **MUST:** pruebas y ensayos usan datos sintéticos, recursos identificados como propios y limpieza verificada.
- **MUST:** antes de integrar, ejecutar los comandos del starter afectado y recorrer su entrada real cuando cambie comportamiento observable. Una comprobación bloqueada permanece pendiente.
- **MUST:** CI fallida bloquea la integración. No se debilitan controles ni se amplían excepciones para ocultar una falla.
- **SHOULD:** controladores cubren autenticación, autorización, validación y respuestas cuando esas rutas existen.

El [flujo de desarrollo](development-workflow.es-419.md) define el registro mínimo y la definición de terminado.

## Datos, operación y entrega

- **MUST:** cambios de esquema usan migraciones versionadas con reversión o una nota explícita de irreversibilidad y recuperación.
- **MUST:** errores públicos son seguros y estables; diagnósticos internos nunca exponen secretos, SQL, tokens o trazas.
- **SHOULD:** logs operativos incluyen identificador de solicitud y, cuando sea seguro, identidad, tenant, ruta y categoría de falla.
- **SHOULD:** operaciones sensibles producen auditoría separada del log técnico.
- **MUST:** cada cambio parte de `main` actualizado, permanece enfocado, revisa rutas/diff preparados por datos privados y pasa PR/CI antes de integrarse.
- **MUST:** cambios de comportamiento, arquitectura, preparación, pruebas u operación actualizan documentación `es-419` y `en-US` en el mismo PR.
- **SHOULD:** cada aplicación distribuible mantiene versionado semántico, changelog técnico y notas comerciales localizadas. Un cambio solo de build no representa funciones visibles nuevas.

La plantilla automática de pull request hace visibles estas comprobaciones.

## Perfiles condicionales

Estas capacidades no son requisitos universales. Cuando un proyecto las declara, sus garantías se vuelven MUST y requieren contrato, implementación y pruebas propias:

- **Identidad humana:** registro o aprovisionamiento, activación, login, recuperación, MFA, sesiones, revocación y almacenamiento seguro.
- **SaaS multitenant y privacidad:** aislamiento backend, contexto de tenant validado, exportación/corrección/eliminación de datos, retención, anonimización y responsabilidades legales aplicables.
- **Pagos:** proveedor detrás de un puerto, idempotencia, webhooks verificados, reconciliación, secretos solo en backend y autoridad de planes/licencias en servidor.
- **Móvil seguro:** tokens en almacenamiento seguro, borrado o reasignación de caché al cambiar identidad/tenant y navegación protegida.
- **Offline y sincronización:** estado pendiente visible, ámbito de caché, cifrado para datos sensibles, invalidación y resolución explícita de conflictos.

Nombres de clases, namespaces, endpoints, proveedores y rutas pertenecen al proyecto consumidor. Esta base define garantías observables, no clona la implementación de otro sistema.
