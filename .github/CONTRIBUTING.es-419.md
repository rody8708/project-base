# Guía de contribución

[US English](CONTRIBUTING.en-US.md) · [Inicio](../README.es-419.md) · [Política de seguridad](SECURITY.es-419.md)

Gracias por contribuir a la base mantenida por **Zendrhax LLC**. Este repositorio conserva fundamentos y starters reutilizables; no aloja los productos finales creados a partir de ellos.

## Antes de proponer un cambio

- Abre un Issue para cambios amplios de arquitectura, alcance o compatibilidad. Una corrección pequeña y claramente delimitada puede ir directamente a un pull request.
- No uses Issues públicos para vulnerabilidades. Sigue la [política de seguridad](SECURITY.es-419.md).
- Comprueba que tienes derecho a aportar el contenido. Al enviar una contribución, aceptas que se distribuya bajo [MPL-2.0](../LICENSE).

## Flujo de trabajo

1. Crea un fork o una rama y parte de la versión actual de `main`.
2. Mantén cada cambio enfocado y explica su propósito, alcance, pruebas y limitaciones.
3. Conserva un archivo `.es-419.md` y otro `.en-US.md` con significado equivalente para cada documento mantenido. Los selectores neutrales reconocidos son la excepción.
4. No incluyas secretos, datos personales, dependencias instaladas, cachés ni resultados de compilación.
5. Abre un pull request. `main` está protegida y no admite cambios directos.

## Reglas técnicas

Respeta el límite API entre clientes y backend, los puertos y adaptadores de persistencia y las reglas inmutables documentadas. Un cambio puede reemplazar herramientas o frameworks, pero debe conservar los contratos declarados o documentar explícitamente su migración. No afirmes compatibilidad con una plataforma, motor o entorno que no hayas ejecutado.

Ejecuta al menos los controles del repositorio:

```text
npm ci --ignore-scripts
npm run check
npm test
```

Ejecuta además las pruebas y compilaciones del starter modificado según su README. El pull request debe pasar los controles automáticos aplicables antes de integrarse. La aprobación de un cambio no convierte por sí sola una base en despliegue de producción validado.

## Contacto

Consultas generales de contribución: [contact@zendrhax.com](mailto:contact@zendrhax.com). No envíes credenciales, datos personales ni secretos reales.
