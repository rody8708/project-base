# Plantilla de definición de proyecto

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](project-brief.en-US.md) · [Inicio](../README.es-419.md)

## Instrucciones de uso

Esta plantilla se propone para proyectos consumidores creados en una ubicación separada de esta base. No existe todavía una publicación estable aprobada: no adoptar este borrador como si lo fuera ni inventar su identidad. Su estructura y campos siguen pendientes de aprobación según la [gobernanza de la base](../docs/foundation-governance.es-419.md); el respaldo y los límites se registran en la [trazabilidad](../docs/traceability.es-419.md).

Cuando exista una publicación estable aprobada, copiar la plantilla de esa publicación y su contraparte al proyecto consumidor, conservando los sufijos de idioma. Ajustar los enlaces al destino y a los nombres elegidos, y copiar o referenciar explícitamente el conjunto normativo adoptado mediante una referencia inmutable y su verificación, no solo mediante un nombre de versión. Reemplazar los campos entre corchetes en ambos archivos; durante la planificación pueden quedar pendientes, pero no declararse aprobados o verificados sin evidencia. La plantilla incompleta no es una definición aprobada. Registrar las decisiones aún desconocidas con responsable y momento de resolución; los detalles deben estar resueltos antes de la etapa que dependa de ellos.

## BRIEF-001 — Identidad y propósito

- Nombre: [nombre del proyecto].
- Ubicación externa del proyecto consumidor: [directorio o repositorio separado de esta base].
- Responsable de decisiones: [persona o función].
- Problema y audiencia: [necesidad concreta y personas que usarán el resultado].
- Resultado esperado: [comportamiento observable].
- Publicación estable aprobada que se adoptará: [pendiente; indicar versión únicamente cuando exista y se haya aprobado].
- Identidad verificable de la publicación: [referencia inmutable al conjunto normativo y manifiesto de archivos o equivalente; pendiente].
- Verificación de integridad: [huella, algoritmo, origen confiable para la comparación, fecha y resultado de la comprobación; pendiente].
- Aprobación de la adopción: [responsable, fecha y publicación exacta; pendiente hasta completar la verificación].

## BRIEF-002 — Alcance y aceptación

- Incluye: [funciones y límites de la primera entrega].
- No incluye: [exclusiones explícitas].
- Criterios de aceptación: [condiciones verificables para cada resultado].
- Suposiciones: [suposición, impacto y cómo se confirmará].

## BRIEF-003 — Plataformas e idiomas

- Perfil: [web, escritorio, móvil o combinación justificada].
- Plataformas y versiones previstas: [sistemas, navegadores, dispositivos o arquitecturas].
- Plataformas verificadas: [ninguna hasta contar con evidencia; después indicar entorno y resultado].
- Idiomas de documentación: español latinoamericano (`es-419`) e inglés de Estados Unidos (`en-US`), en archivos separados.
- Idiomas de interfaz y formatos regionales: [definir según los usuarios; no aplica si no existe interfaz].

## BRIEF-004 — Diseño y herramientas

- Lenguajes y herramientas: [elecciones y versiones requeridas].
- Componentes y responsabilidades: [estructura mínima necesaria].
- Contratos: [entradas, salidas, errores e integraciones relevantes].
- Dependencias: [beneficio, procedencia, licencia, control de versiones y verificación de instalación; no asumir reproducibilidad binaria].
- Convenciones de código: [nombres, formato y verificaciones elegidas].
- Decisiones importantes: [decisión, alternativas, motivo y consecuencias].

## BRIEF-005 — Datos, seguridad y recuperación

- Datos utilizados y sensibilidad: [qué datos se necesitan y por qué].
- Almacenamiento, conservación y eliminación: [ubicación, duración y tratamiento].
- Límites de confianza y validación: [fuentes no confiables y controles].
- Operaciones protegidas y autorización: [permisos, dónde se comprueban y pruebas].
- Configuración y secretos: [mecanismo seguro y nombres de variables; nunca valores reales].
- Riesgos de pérdida y recuperación: [operaciones, autorización y estrategia verificada cuando corresponda].

## BRIEF-006 — Objetivos de calidad y verificación

- Pruebas: [comportamientos, límites y recorridos críticos que se verificarán].
- Accesibilidad: [objetivos y comprobaciones, o justificación de no aplicabilidad].
- Rendimiento: [objetivos medibles y condiciones de medición].
- Compatibilidad: [matriz y verificaciones previstas].
- Revisiones de seguridad y dependencias: [método y alcance].
- Evidencia de reglas: [identificador de regla de la publicación adoptada, evidencia obtenida o condición de no aplicabilidad justificada; separar lo previsto de lo ejecutado].
- Definición de terminado: [cómo se aplica la lista del flujo de desarrollo].

## BRIEF-007 — Preparación, entrega y operación

- Preparación desde un entorno limpio: [requisitos y pasos comprobados].
- Comandos reales: [instalar, ejecutar, analizar, probar y compilar según corresponda].
- Configuración de ejemplo: [ubicación y explicación de valores ficticios].
- Distribución: [canal, artefactos y plataformas verificadas].
- Diagnóstico y mantenimiento: [registros sin datos sensibles, actualizaciones y responsable].
- Transición o recuperación de una entrega: [procedimiento y verificación según el riesgo].

## BRIEF-008 — Pendientes y aprobación

- Decisiones pendientes: [pregunta, responsable y etapa antes de la que debe resolverse].
- Riesgos conocidos: [riesgo, impacto y medida prevista].
- Estado del proyecto consumidor: [borrador, listo para implementar, verificado o parcial; indicar evidencia; no equivale al estado de aprobación de la base].
- Aprobación: [persona responsable, fecha y alcance aprobado].
- Revisión bilingüe: [confirmación de equivalencia con el archivo en inglés].
