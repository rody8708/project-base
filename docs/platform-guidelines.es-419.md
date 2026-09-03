# Criterios por plataforma

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](platform-guidelines.en-US.md) · [Inicio](../README.es-419.md)

## Alcance

Estos perfiles ayudan a definir proyectos consumidores que se desarrollarán fuera de esta base. Son áreas de evaluación propuestas y no exhaustivas, no una promesa de compatibilidad, validación técnica ni una selección de tecnologías. Cada proyecto convierte los criterios relevantes en requisitos y pruebas, y justifica los que no correspondan. Las [reglas comunes](immutable-rules.es-419.md) todavía son propuestas: su fuerza obligatoria dependerá de su aprobación y adopción en una futura publicación estable.

El respaldo documental parcial y los pendientes se identifican en la [trazabilidad](traceability.es-419.md); la revisión y aprobación se rigen por la [gobernanza de la base](foundation-governance.es-419.md). Las instrucciones siguientes orientan la evaluación y no acreditan cumplimiento de requisitos actuales de ninguna plataforma.

## PLAT-001 — Web

- Definir si el producto incluye interfaz, servicios o ambos, y dónde se encuentra cada límite de confianza.
- Declarar navegadores, tamaños de pantalla y condiciones de conectividad compatibles cuando exista interfaz.
- Definir controles para sesiones, permisos y entradas externas cuando existan funciones protegidas o servicios.
- Evaluar accesibilidad, navegación, enlaces directos, carga, errores y recuperación de recorridos relevantes.
- Definir configuración por entorno, despliegue, observación de errores y recuperación de la versión desplegada.
- Evaluar riesgos propios de las funciones utilizadas, como contenido no confiable, solicitudes entre sitios o carga de archivos, antes de elegir controles concretos.

## PLAT-002 — Escritorio: Windows, macOS y Linux

- Seleccionar sistemas operativos, versiones y arquitecturas de procesador; no asumir compatibilidad solo porque una herramienta sea multiplataforma.
- Separar adaptadores del sistema operativo de las reglas que puedan compartirse.
- Evaluar rutas, permisos, almacenamiento, instalación, actualización y desinstalación, protegiendo los datos del usuario.
- Mantener la interfaz disponible durante operaciones largas y definir cancelación, cierre y recuperación.
- Verificar integración con teclado, ventanas, escalado de pantalla y tecnologías de asistencia pertinentes.
- Definir distribución y confianza del paquete según el canal elegido, y comprobar sus requisitos vigentes cuando se implemente.

### Consideraciones de macOS

macOS es un objetivo específico dentro de escritorio. Evaluar permisos del sistema, distribución, firma, aislamiento, arquitecturas compatibles e integración con menús y ventanas según el tipo de aplicación. Los requisitos concretos se consultan en la documentación oficial vigente al crear el proyecto consumidor; este documento no fija procedimientos ni versiones de herramientas.

## PLAT-003 — Móvil: Android e iOS

- Declarar sistemas, versiones y clases de dispositivo incluidas en el alcance.
- Diseñar para interrupciones, cambios de estado de la aplicación y conectividad variable.
- Definir permisos, almacenamiento seguro y tratamiento de datos locales según su sensibilidad.
- Evaluar navegación, interacción táctil, escalado de texto, lectores de pantalla y otros requisitos de accesibilidad.
- Controlar consumo de batería, memoria, red y trabajo en segundo plano según las funciones reales.
- Probar sincronización y operaciones repetidas cuando existan datos sin conexión o tareas diferidas.
- Definir distribución y actualización; consultar los requisitos oficiales vigentes del canal seleccionado al implementarlo.

## PLAT-004 — Código compartido entre plataformas

- Compartir reglas estables y contratos cuando haya un beneficio real; no forzar una misma interfaz o integración en todos los sistemas.
- Encapsular capacidades específicas mediante límites explícitos y verificables.
- Probar tanto la lógica compartida como cada adaptador relevante.
- Mantener una matriz que distinga plataformas previstas, verificadas y fuera de soporte, junto con la evidencia correspondiente.
- No convertir diferencias de plataforma en condiciones dispersas por toda la lógica central.

## Requisitos transversales que cada proyecto debe concretar

Seguridad y privacidad, accesibilidad cuando exista interfaz, objetivos de rendimiento, versiones compatibles, estrategia de distribución y recuperación, e idiomas del producto. Los objetivos deben poder verificarse y ajustarse a la audiencia y al riesgo del proyecto; esta base no impone métricas universales ni porcentajes arbitrarios.
