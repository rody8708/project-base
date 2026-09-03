# Laboratorio Docker de PHP 8.5

[Respaldo y restauración SQLite verificados](recovery.es-419.md).

[US English](docker-local.en-US.md) · [Inicio](README.es-419.md) · [Seguridad](security-production.es-419.md)

## Propósito

Ejecutar esta base en Linux con PHP 8.5 y Apache/HTTPS, sin reemplazar PHP 8.2 de WSL ni PHP de Windows. Perfil local aislado, no despliegue de producción aprobado. La terminación TLS ocurre en Apache dentro del contenedor (mod_php), sin proxy externo ni PHP-FPM en este perfil.

Requiere Node 24, tar y Docker local Linux/amd64. En Windows usa la distribución WSL Ubuntu-24.04 existente; no necesita Compose ni Buildx. El código se envía por una lista explícita de archivos: no depende de que la unidad D esté montada en WSL. No instala paquetes ni certificados en el host. La primera compilación descarga imágenes oficiales, paquetes Debian y dependencias de Composer.

## Comandos

Desde el directorio de esta plantilla:

```text
node scripts/docker-local.mjs verify
node scripts/docker-local.mjs up
node scripts/docker-local.mjs down NOMBRE_DEL_CONTENEDOR
```

verify construye, arranca, prueba y elimina su contenedor, incluidos sus datos y secretos desechables. up realiza las mismas pruebas y conserva el laboratorio sano; imprime URL y nombre exactos. down comprueba nombre y etiqueta antes de eliminar ese contenedor. No usa eliminación global ni toca otros proyectos. Imágenes y caché de construcción se conservan para acelerar ejecuciones posteriores.

Cada ejecución crea un nombre único. El puerto se asigna automáticamente sobre 127.0.0.1, nunca sobre todas las interfaces; no ocupa los puertos 80/443 ni los de bases existentes. Docker puede reasignar el puerto al reiniciar: la prueba vuelve a consultarlo. No se modifica hosts ni DNS. La URL configurada de aplicación es una referencia interna del laboratorio, no un dominio público.

## Aislamiento y secretos

El código queda en la imagen; no hay montajes de directorios del usuario, socket Docker ni bases existentes. SQLite, clave de aplicación y certificado viven en /state dentro del contenedor. Sobreviven a docker restart, pero se pierden al eliminar o recrear el contenedor. Esto NO es persistencia ni respaldo de producción.

El proceso usa www-data, sin capacidades Linux, con no-new-privileges y límites de memoria, CPU y procesos. La imagen no contiene PHPUnit ni credenciales del host. Las migraciones automáticas al iniciar están limitadas a este SQLite desechable: no copiar esta política a datos productivos. Composer y herramientas de compilación permanecen en la imagen; reducir superficie y auditar paquetes del sistema queda pendiente.

El certificado autofirmado dura siete días, incluye nombres locales y 127.0.0.1. La prueba usa ese certificado como confianza explícita y exige validación TLS; también comprueba el rechazo sin esa confianza. No usa curl -k ni desactiva rejectUnauthorized. Un navegador advertirá que no confía en el certificado porque no se instaló una CA global. Para renovar, eliminar y recrear exclusivamente el laboratorio desechable.

Los tokens de pruebas no se imprimen; el token creado durante la verificación se revoca. Un laboratorio conservado exige emitir una credencial nueva mediante la CLI documentada en seguridad, dentro de ese contenedor. No copiar credenciales de proyectos reales. Los logs Apache omiten URL/query, cuerpos y Authorization.

## Confianza opcional en Windows

Solo con autorización del usuario, ejecutar desde PowerShell 7:

```powershell
./scripts/trust-local-windows.ps1 -Container NOMBRE_DEL_CONTENEDOR
```

El comando identifica el laboratorio por nombre y etiqueta. Crea o reutiliza una autoridad local en Cert:\CurrentUser\My con clave privada no exportable y vigencia de 30 días. Emite un certificado de servidor (no CA) válido siete días para foundation.localhost, localhost y 127.0.0.1. Solo la clave del servidor y los certificados públicos llegan al contenedor; no se guarda un PFX en disco.

Instala únicamente la parte pública de la autoridad en Cert:\CurrentUser\Root. Windows puede mostrar una confirmación que debe revisar el usuario. No modifica LocalMachine ni el almacén de WSL. La autoridad otorga confianza TLS a este usuario: conservar su clave protegida y retirarla cuando deje de necesitarse. Nunca confiar directamente en el certificado CA autofirmado original, cuya clave vive en el servidor.

Recarga Apache sin reiniciar el contenedor y comprueba HTTPS mediante Invoke-RestMethod, sin excepciones de validación. La salida PASS y las huellas confirman la instalación; un aviso pendiente no significa que haya terminado. Al recrear el contenedor debe emitirse otro certificado con este comando. WSL, contenedores y herramientas que usan su propio almacén requieren configurar explícitamente la CA pública; no heredan automáticamente la confianza de Windows.

Para retirar la confianza, localizar la huella exacta mostrada por el comando en el almacén del usuario y eliminar solo esa entrada de Root. La clave de autoridad y el certificado de servidor permanecen en My hasta su retiro explícito. No borrar otras autoridades. Reiniciar pestañas o el navegador si conserva un error TLS anterior.

## Qué verifica

Arranque saludable; HTTPS real desde el host; rechazo del certificado no confiable; acceso anónimo 401; creación, lectura, actualización y eliminación autenticadas; conservación tras reinicio; revocación; y check-production con LOCAL_CHECKS_PASS y productionApproved=false. Se añadió un ensayo de respaldo/restauración SQLite en un destino separado, con invalidación de tokens y lectura mediante el kernel HTTP. No simula aún correo, login humano, MFA, carga ni alertas.

Evaluación 2026-09-03: imagen ejecutada con PHP 8.5.10. WSL conservó PHP 8.2.33 y Windows PHP 8.5.1. Se comprobaron también sintaxis PHP/JavaScript, 46 pruebas de mantenimiento y 102 documentos en 51 pares de idioma (812 enlaces locales). Durante las pruebas se corrigieron la entrega de Authorization de Apache a PHP, la consulta del puerto tras reiniciar y Content-Length para cuerpos DELETE.

Las imágenes base PHP/Composer están fijadas por digest para amd64 y composer.lock fija dependencias PHP. Los paquetes apt no usan un snapshot histórico: la reconstrucción no es bit a bit reproducible. Revisar vulnerabilidades y actualizar referencias deliberadamente.

Fuentes: [imagen oficial PHP](https://hub.docker.com/_/php) y [publicación de puertos Docker](https://docs.docker.com/engine/network/port-publishing/).
