# Base web reutilizable

**Actualización de seguridad:** HTTP ahora exige autenticación; una URL por sí sola no basta. Consulta [autenticación y producción](security-production.es-419.md) antes de seguir los ejemplos anteriores.

Revisión técnica: `1.1.0-draft.1`  
Estado: candidato técnico local; no es una nueva aprobación de la base documental.  
Idioma: español latinoamericano (`es-419`)  
[US English](README.en-US.md) · [Arquitectura](docs/architecture.es-419.md) · [Fuentes y verificación](docs/verification.es-419.md)

Esta carpeta es una plantilla ejecutable independiente: cópiala completa a la ubicación de tu nuevo proyecto. No necesita archivos, paquetes, rutas ni servicios del repositorio de origen. La lista de tareas es un ejemplo reemplazable, no una aplicación final ni una promesa de que cualquier producto futuro ya esté validado.

El código original se distribuye bajo [MPL-2.0](LICENSE). Las dependencias conservan sus propias licencias y avisos.

## Conexión API opcional

El contrato y los adaptadores HTTP ya están implementados. El modo memoria sigue siendo el predeterminado de los clientes; las descripciones de pérdida de datos se refieren a ese modo. Consultar la [guía de integración](api-integration.es-419.md) para configurar la conexión y revisar sus límites. No se incluye autenticación de producción.

## Requisitos y preparación

Entorno de referencia: Node.js `24.16.0` y npm `11.17.0`. El manifiesto admite Node `>=24.16.0 <25` y npm `>=11.17.0 <12`; ese rango declara requisitos, no prueba todas sus combinaciones. Necesitas acceso al registro público de npm durante la instalación y permiso de escritura en la copia. No hacen falta cuentas, credenciales, instalación global, backend ni servicios externos.

Node.js `24.16.0` se distribuyó con npm `11.13.0`: instalar ese Node no garantiza el npm requerido. Si tu npm no cumple el rango, puedes usar npm `11.17.0` sin reemplazar la instalación global. Desde tu copia, utiliza estos comandos en lugar de sus equivalentes `npm`:

```sh
npx --yes npm@11.17.0 --version
npx --yes npm@11.17.0 ci
npx --yes npm@11.17.0 run check
npx --yes npm@11.17.0 run dev
```

`npx` puede descargar esa versión específica al caché local y la ejecuta; no cambia el npm global. Comprueba que el primer comando devuelva `11.17.0`. El mismo prefijo sirve para `test`, `audit` o `run preview`.

Si tu Node y npm ya cumplen los requisitos, entra a tu copia independiente y ejecuta:

```sh
node --version
npm --version
npm ci
npm run check
npm run dev
```

Abre [la dirección local de desarrollo](http://127.0.0.1:5173). Detén el servidor con `Ctrl+C`. Si ese puerto está ocupado, el comando falla expresamente; no elige otro en silencio. `npm ci` instala desde `package-lock.json`, rechaza discrepancias con el manifiesto y sustituye un `node_modules` previo de esta carpeta. No ejecutes el comando desde otro proyecto por error.

El comando `check` comprueba tipos, ejecuta las pruebas una vez y genera `dist/`. Los comandos también pueden ejecutarse por separado:

```sh
npm run typecheck
npm test
npm run build
npm audit
npm run preview
```

La previsualización de `dist/` usa [el puerto local 4173](http://127.0.0.1:4173). No es un servidor de producción ni publica el proyecto. Para repetir pruebas mientras editas, usa `npm run test:watch` y detenlo con `Ctrl+C`. Un resultado de auditoría sin avisos no certifica seguridad; conserva la fecha y el alcance del resultado.

## Qué demuestra el ejemplo

- Agregar títulos válidos, marcar tareas y volverlas a dejar pendientes.
- Validar títulos vacíos, tipo de entrada, controles y límites en el dominio, no solamente en la interfaz.
- Mostrar carga, lista vacía, resultados y errores explícitos; conservar el texto si agregar falla.
- Cambiar textos de interfaz entre `es-419` y `en-US`, sin traducir ni perder las tareas del usuario.
- Probar reglas, casos de uso, adaptador en memoria y componentes con dependencias deterministas.

El límite del título es de 80 puntos de código Unicode después de quitar espacios exteriores; no mide grafemas visibles. Los datos viven solamente en memoria y desaparecen al recargar o cerrar la página. No hay autenticación, autorización remota, persistencia local, sincronización offline, router, telemetría ni eliminación de archivos. La validación del cliente no serviría como control de seguridad de un backend futuro.

## Configuración y cambios

La aplicación funciona sin `.env`. Opcionalmente copia `.env.example` a `.env` para definir `VITE_APP_NAME`, un nombre visible y público. Reinicia el servidor si cambias variables. Nunca pongas secretos en variables `VITE_`: sus valores pueden incorporarse al cliente.

`src/domain` contiene reglas puras; `src/application` define casos de uso y el contrato del repositorio; `src/adapters` implementa memoria y HTTP; `src/ui` contiene React, traducciones y estilos. `src/main.tsx` conecta esas piezas. Los detalles y límites de reutilización están en [arquitectura](docs/architecture.es-419.md).

Las versiones directas son exactas y la resolución transitiva queda en el archivo de bloqueo. Modificar dependencias exige revisar sus requisitos y licencias, actualizar el bloqueo intencionalmente y repetir `npm ci`, `check` y la auditoría en una copia limpia. No uses actualizaciones forzadas como sustituto de revisar una incompatibilidad. TypeScript `5.9.3` es una elección conservadora explícita, no una afirmación de que sea la versión más reciente.

Los Markdown de esta plantilla tienen contraparte por idioma. Mantén ambos al cambiar alcance, instrucciones o limitaciones. No hay integración continua instalada en esta carpeta; los controles se ejecutan localmente. Antes de entregar un producto real, define y verifica sus navegadores, accesibilidad, seguridad, rendimiento, datos e integraciones según su alcance. Copiar la plantilla no aprueba automáticamente ese producto.
