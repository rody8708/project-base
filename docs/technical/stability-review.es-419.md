# Revisión técnica previa a estabilidad

[US English](stability-review.en-US.md) · [Estado estable](stability-status.es-419.md) · [Inicio](../../README.es-419.md)

Fecha: `2026-09-03`. Revisión: `1.1.0-draft.1`. Resultado: `TECHNICAL_SCOPE_PASS_WITH_DECLARED_EXCEPTIONS`. MPL-2.0 se adoptó después de esta revisión; el resultado no asigna una versión estable ni aprobación productiva.

## Hallazgos corregidos

La revisión agregó una arquitectura backend neutral y una API TypeScript/Node sin framework de aplicación. Las pruebas cruzadas detectaron y corrigieron formato de token incompatible, semántica incorrecta de `next_after`, ausencia de CORS, UTF-8 no estricto, sustitutos Unicode aislados, parámetros duplicados y prioridad de `Accept-Language`. El limitador local ahora persiste en SQLite. Node sigue como perfil candidato: no hereda la evidencia PostgreSQL/MySQL, recuperación, HTTPS o producción de PHP.

También se corrigieron afirmaciones actuales de cinco plantillas y de autenticación ausente. Las cifras antiguas permanecen solo donde identifican evidencia histórica y tienen una nota que las separa del catálogo actual.

## Ejecuciones actuales

| Área | Resultado |
| --- | --- |
| Repositorio | 47 pruebas de mantenimiento; 116 documentos, 58 pares bilingües y 892 enlaces antes de este registro; contrato OpenAPI idéntico en seis starters. |
| React | 44 pruebas, tipos y compilación Vite satisfactorios. |
| Web nativa | 85 pruebas y control de fuente satisfactorios. |
| PHP | Composer/requisitos satisfactorios; 81 pruebas, 339 aserciones y 66 archivos PHP válidos. |
| Node | Instalación limpia sin vulnerabilidades conocidas reportadas por npm; compilación y cinco grupos de pruebas satisfactorios. React y web nativa consumieron su API real con autenticación, CRUD, conflicto y CORS. |
| Flutter | Análisis sin hallazgos, 30 pruebas satisfactorias, una prueba HTTP opcional omitida por no activar su fixture, y compilación Windows debug satisfactoria. |
| Kotlin/Android | Gradle `check` y `assembleDebug` satisfactorios usando el JDK de Android Studio y SDK instalado; no se repitió un ensayo en dispositivo físico. |
| PHP integrado | API HTTP aislada con CRUD, permisos, aislamiento, revocación, CORS, conflictos y compuerta productiva satisfactoria. |

## Exportaciones reales

Se crearon seis destinos nuevos bajo `C:\Users\rodyc\AppData\Local\Temp\foundation-six-export-fad7ca1f3ad14e2caca7146b593d9945`. Cada exportación comprobó bytes al copiar y añadió un recibo. Inventarios SHA-256: `web edc03b8e…a52a`, `web-vanilla ab6502a2…d424`, `flutter da164aac…cf9d`, `kotlin-android 928ec0b5…8d31`, `backend-php 7a15c8b8…189d`, `backend-node 1ec8cb54…10ec`. Los hashes completos están en cada `foundation/adoption.json` de ese ensayo.

Desde las copias se repitieron instalación/verificación de React, web nativa, PHP y Node, además de análisis/pruebas/compilación Windows Flutter y `check`/APK debug Kotlin. Los destinos se conservaron para inspección; contienen dependencias y resultados generados, no secretos reales.

Después de adoptar MPL-2.0 se generó una segunda serie bajo `C:\Users\rodyc\AppData\Local\Temp\foundation-mpl-export-a24d88a7543449ecbbbe55e661bfb9bc`. Las seis exportaciones incluyen `LICENSE` con SHA-256 `3f3d9e0024b1921b067d6f7f88deb4a60cbe7a78e76c64e3f1d7fc3b779b9d04`. Nuevos inventarios completos: `web 3d81c60ba4c3f75a8c8a622337dfe53be2665832a21e62503be977c02b7c9514`, `web-vanilla 2acee181a22fc650f11b955ba3496d28493bf6af8320920159acbc4028e60be6`, `flutter 1caa2ee0d4189746a2684889638bbd4d71f977e1672ac2fac0affce81880aba5`, `kotlin-android a024a1afc0f066e0d1d993dc4e6c55c3df118923b5b87fc6a1261a66b8fa2f22`, `backend-php de020955aebe9f3981316b8633f23e8ece170d131028b90fa93b81be58c3c10f` y `backend-node e7053d38b41edd8f27277c068d7131a3dd8da8a3cade2413034344e7b59cdc50`. Estos identifican las exportaciones previas a la congelación; el [recibo 1.1.0](../../releases/approval-1.1.0.es-419.md) identifica el paquete estable completo.

## Excepciones y cierre

macOS/iOS no se ejecutaron por no disponer de una Mac. Esta excepción es no bloqueante para publicar los destinos comprobados, pero esos destinos deben seguir marcados `no verificado`. Linux de escritorio y dispositivos físicos tampoco se infieren de estas ejecuciones.

Servicios de cada producto —cloud, KMS, almacenamiento remoto, alertas, cuentas y objetivos RPO/RTO— son adopción del consumidor y no bloquean esta base. MPL-2.0 fue incorporada. El paquete exacto, su hash, la versión `1.1.0` y la aprobación explícita del propietario ya están registrados. GitHub y la protección de rama se configuran después sobre ese contenido congelado.
