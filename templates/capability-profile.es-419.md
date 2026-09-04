# Perfil de capacidades del proyecto consumidor

Revisión del perfil: `0.1.0-draft.1`  
Estado: plantilla de selección y aceptación; no implementa ni aprueba una capacidad.  
Idioma: español latinoamericano (`es-419`)  
[English (United States)](capability-profile.en-US.md) · [Inicio del proyecto consumidor](../README.es-419.md)

## Cómo usar este archivo

Para cada perfil selecciona exactamente un estado: `no aplica`, `planificado` o `habilitado`. Registra responsable y motivo. `Habilitado` solo es válido cuando las garantías indicadas tienen implementación y evidencia de pruebas en el proyecto consumidor. Elimina garantías que realmente no apliquen únicamente con una decisión documentada de amenaza/riesgo; no marques como terminada una función no construida.

## Perfil universal de entrega

- Estado: [planificado hasta verificar el proyecto].
- Responsable: [persona o rol].
- Evidencia: [pruebas, entorno, revisión, resultados observables y limpieza].
- Aceptación: límites validados; errores públicos seguros; diagnósticos privados; pruebas sintéticas aisladas; migraciones versionadas cuando existe esquema; TLS y gestión de secretos al desplegar; ejercicio de respaldo y restauración cuando los datos deben sobrevivir; identificadores de solicitud y monitoreo accionable; revisión de dependencias y licencias; documentación bilingüe sincronizada.

## Identidad humana

- Estado: [no aplica | planificado | habilitado].
- Responsable y motivo: [responsable; por qué se necesitan o no cuentas].
- Aceptación al habilitar: autenticación backend y autorización separada; registro o aprovisionamiento controlado; activación cuando corresponda; acceso sin contraseña o hashing de contraseña revisado; recuperación; decisión de MFA según riesgo; límites de intentos; vencimiento y revocación de sesión/token; almacenamiento seguro en cliente; limpieza al cerrar sesión; errores genéricos; eventos de auditoría; pruebas automatizadas de éxito, denegación, vencimiento, replay y recuperación.

Los tokens de máquina aprovisionados por sí solos no cumplen un perfil de login humano.

## SaaS multitenant y privacidad

- Estado: [no aplica | planificado | habilitado].
- Responsable y decisión de jurisdicción aplicable: [responsable; obligaciones revisadas].
- Aceptación al habilitar: contexto de tenant derivado o validado por el servidor en cada lectura/escritura; ningún tenant, rol, plan o permiso autoritativo en cliente; pruebas de denegación entre tenants; reglas de transferencia/eliminación de propiedad; retención documentada; exportación, corrección y borrado/anonimización adecuados al producto; inventario de módulos/fuentes de datos; operaciones sensibles auditables; documentos legales con responsable fuera de afirmaciones del código cuando corresponda.

No copies endpoints de privacidad ni periodos de gracia fijos de otro producto sin una decisión de producto y legal.

## Pagos, suscripciones y licencias

- Estado: [no aplica | planificado | habilitado].
- Responsable y decisión de proveedor: [responsable; proveedor y países/monedas admitidos].
- Aceptación al habilitar: proveedor detrás de un puerto de aplicación; secretos solo en configuración backend; autoridad del servidor para precios, planes, derechos y límites; operaciones idempotentes de creación/cambio; webhooks verificados y seguros ante replay; estados internos estables; política de conciliación y reintentos; responsabilidades de reembolsos/disputas/impuestos definidas; pruebas sintéticas o sandbox de éxito, duplicado, retraso, firma inválida y resultado incierto.

No se exige un proveedor de pagos ni framework específico. El adaptador conoce su protocolo externo.

## Cliente móvil seguro

- Estado: [no aplica | planificado | habilitado].
- Responsable y plataformas objetivo: [responsable; destinos Android/iOS/escritorio].
- Aceptación al habilitar: la API es el único límite backend; sin conexión directa a la base de producción; tokens en almacenamiento seguro de plataforma; navegación protegida revalida estado backend; cierre de sesión, cambio de usuario, cambio de tenant y revocación limpian o reasignan estado sensible; el backend conserva autoridad sobre permisos y derechos; estados denegado/offline/error localizados y probados; permisos de dispositivo mínimos y documentados.

## Caché offline y sincronización

- Estado: [no aplica | planificado | habilitado].
- Responsable y alcance offline: [responsable; operaciones permitidas sin conexión].
- Aceptación al habilitar: matriz de caché documenta datos, ámbito, vencimiento, invalidación y cifrado; estados pendiente/sincronizando/fallido/conflicto/sincronizado visibles; escrituras con identidades estables de cliente o claves de idempotencia; conflictos siguen una regla explícita de producto y no sobrescritura silenciosa; reintentos no duplican escrituras inciertas; sincronización probada ante reinicio, vencimiento, conflicto, falla parcial, cambio de identidad y cambio de tenant.

Una caché de solo lectura no necesita fingir que permite editar sin conexión.

## Publicación y distribución

- Estado: [planificado hasta verificar la distribución].
- Responsable y canales: [responsable; hosting web, tiendas, instaladores, paquetes o entrega interna].
- Aceptación: versión semántica e identidad de build coherentes; changelog técnico existente; publicaciones visibles con notas `en-US` y `es-419` cuando se atienden esas audiencias; claves de firma y credenciales de tiendas fuera de Git; reversión o recuperación definida; artefactos vinculados a la revisión probada; plataformas no admitidas permanecen explícitamente pendientes.

## Aprobación

- Perfiles seleccionados revisados por: [persona o rol].
- Revisión y fecha: [revisión inmutable; fecha].
- Bloqueos restantes: [elemento, responsable y evidencia requerida].
- Estado: [borrador | listo para implementar | verificado parcialmente | verificado para el alcance declarado].
