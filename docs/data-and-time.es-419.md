# Datos, números, texto y tiempo

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](data-and-time.en-US.md) · [Inicio](../README.es-419.md)

## Alcance

Este documento desarrolla FUND-002 de los [fundamentos](programming-fundamentals.es-419.md). Propone decisiones explícitas para evitar que una representación cambie silenciosamente el significado de los datos. No impone lenguaje, base de datos, formato de intercambio ni reglas comerciales. Las referencias respaldan aspectos delimitados; las políticas y ejemplos siguientes son diseños locales originales. La [trazabilidad](traceability.es-419.md) registra su estado y el [registro de comprobaciones](core-verification.es-419.md) separa resultados ejecutados de verificaciones pendientes.

Antes de implementar un dato, registrar significado, estados válidos, unidad, límites, representación, conversiones permitidas y respuesta a errores. Revisar esos requisitos en la entrada, durante las operaciones y al persistir o transmitir. Validar una vez no protege una representación que después puede modificarse sin control.

## Ausencia, vacío y cero

Un dato que no llegó no necesariamente equivale a uno desconocido, vacío o igual a cero. La interpretación pertenece al contrato, no a la conversión implícita del lenguaje.

Contrato local: `quantity` acepta enteros entre `0` y `10000`. Un atributo ausente produce `Missing`; `null`, `Unknown`; un entero válido, `Present(value)`; cualquier otro valor, `Invalid`. No se convierten texto ni booleanos en cantidades.

| Entrada | Resultado esperado |
| --- | --- |
| `{quantity: 3}` | `Present(3)` |
| `{quantity: 0}` | `Present(0)` |
| `{}` | `Missing` |
| `{quantity: null}` | `Unknown` |
| `{quantity: ""}` | `Invalid` |

La variante que usa «si el valor es falso, falta el dato» pierde el cero. En otros dominios, vacío o desconocido pueden estar prohibidos: declararlo, sin reutilizar esta política automáticamente.

Respaldo: [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html), diciembre de 2017, secciones 3, 4, 6 y 8.1. Distingue valores JSON, permite límites de precisión y establece UTF-8 para el intercambio fuera de ecosistemas cerrados. No define el significado comercial de `null`, ni obliga a usar JSON aquí.

## Unidades, rangos y desbordamiento

Propuesta local: transportar la unidad con el valor o garantizarla mediante un tipo o contrato inequívoco. No sumar magnitudes incompatibles. Si se permite convertir, declarar factor, precisión y momento de conversión.

Ejemplo: `addLength(a, b)` recibe longitudes enteras en `mm`, cada una entre `0` y `10000`, y exige un resultado en ese mismo rango. Otra unidad produce `InvalidUnit`; valores fuera del rango o una suma excesiva producen `OutOfRange`.

Casos: `250 + 750 → 1000`; `0 + 1000 → 1000`; `9000 + 1001 → OutOfRange`; una entrada con unidad `s → InvalidUnit`. Con operandos ya validados, comprobar `a > 10000 - b` antes de sumar evita exceder el máximo del modelo. Sumar primero y revisar después puede ser demasiado tarde en un tipo que se desborda.

El máximo `10000` es didáctico. Cada implementación necesita revisar también rangos intermedios, conversiones y comportamiento real del tipo; esta comprobación no ensaya todos los desbordamientos de una máquina.

## Representación numérica y redondeo

Algunos valores decimales no tienen representación binaria finita. La documentación oficial de [tipos numéricos de C#](https://github.com/dotnet/docs/blob/4b9c7672e087d5f61ade3161ab57ff88e192edcc/docs/csharp/language-reference/builtin-types/floating-point-numeric-types.md), sección «Characteristics of the floating-point types», revisión `4b9c7672e087d5f61ade3161ab57ff88e192edcc` del 15 de enero de 2026, ilustra diferencias de precisión entre tipos. Es evidencia específica de ese entorno, no una selección de C# para la base.

Propuesta local: elegir entre enteros escalados, decimales, racionales u otras representaciones según exactitud, rango y operaciones necesarias. Declarar cómo se comparan aproximaciones y qué ocurre con valores no finitos cuando puedan existir. Escribir un número en decimal no garantiza que todos los receptores conserven su precisión.

Ejemplo sin significado monetario: `roundTenths(hundredths)` acepta enteros entre `-1000000` y `1000000`. Devuelve décimas enteras, redondeando al valor más cercano y, ante empate exacto, al entero par.

```text
124 -> 12
125 -> 12
135 -> 14
-125 -> -12
0 -> 0
1000001 -> OutOfRange
```

Redondear siempre alejándose de cero falla en `125`. Registrar si se redondean elementos o el total: ambas operaciones pueden diferir. Esta política pertenece únicamente al ejemplo; no prescribe reglas financieras, fiscales o científicas universales.

## Texto, codificación y normalización

Separar bytes de texto interpretado; declarar codificación y tratamiento de secuencias inválidas. Un límite de almacenamiento en bytes no es automáticamente un límite de caracteres percibidos por una persona. Definir qué se cuenta antes de truncar.

La [UAX #15](https://www.unicode.org/reports/tr15/tr15-57.html), Unicode 17.0.0, revisión 57 del 30 de julio de 2025, secciones 1.1 y 1.2, distingue equivalencia canónica y de compatibilidad. Normalizar puede facilitar comparaciones, pero algunas formas eliminan distinciones relevantes. No es una solución general para búsqueda, ordenamiento o seguridad.

Contrato local para una etiqueta: decodificar UTF-8 estrictamente y comparar ordinalmente las secuencias normalizadas a NFC. `U+00E9` y `U+0065 U+0301` producen el mismo texto normalizado; `"" → ""`; bytes hexadecimales `C3 28 → InvalidEncoding`. Sustituir silenciosamente bytes inválidos incumple este contrato. Comparar ordinalmente las secuencias sin normalizar falla en el primer caso; una comparación cultural puede tratarlas de otro modo.

La política no se aplica automáticamente a secretos, firmas, identificadores externos ni contenido cuya identidad dependa de bytes exactos. Allí se respeta el protocolo específico. La normalización no reemplaza validación ni elimina todos los caracteres visualmente confundibles.

## Instantes, fechas civiles y zonas

Elegir primero el concepto: un instante identifica un punto temporal; una fecha civil, un día de un calendario; una duración, una cantidad de tiempo. Un desplazamiento UTC indica una diferencia; una zona incluye reglas que pueden cambiar. No convertir una fecha sin hora en «medianoche UTC» sin una necesidad explícita.

Respaldo de intercambio: [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html), julio de 2002, secciones 4.2, 5.6 y 5.7, define marcas temporales con desplazamiento y restricciones de calendario; no resuelve agendas ni reglas locales futuras.

Contrato local: comparar instantes interpretando el desplazamiento, no quitándolo. `2026-04-03T10:00:00-04:00` y `2026-04-03T14:00:00Z` representan el mismo instante. Para fechas gregorianas, `2026-04-03` y la frontera `2024-02-29` son válidas; `2026-02-29 → InvalidDate`. Aceptar cualquier día hasta 31 no valida un calendario.

En un consumidor, especificar precisión, calendario, formato admitido y tratamiento de segundos intercalares. Estos casos no implementan un analizador completo de RFC 3339 ni verifican su conformidad.

## Horas inexistentes o ambiguas

La documentación oficial [Java SE 17, ZoneRules.getValidOffsets](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/zone/ZoneRules.html), edición Java SE 17, explica que una hora local puede tener cero, uno o varios desplazamientos válidos durante transiciones. Respalda distinguir estos resultados; no obliga a usar Java ni certifica datos de zonas.

Modelo original, sin país ni base de zonas horarias: instantes enteros `u` entre `0` y `239`; `local = u + offset`. En `Gap`, el desplazamiento es `0` antes de `u=120` y `60` desde allí. En `Fold`, es `60` antes de `u=120` y `0` desde allí. Buscar todos los instantes candidatos, en orden creciente.

| Modelo | Hora local | Candidatos esperados |
| --- | --- | --- |
| `Gap` | `119` | `[119]` |
| `Gap` | `120` | `[]` |
| `Gap` | `179` | `[]` |
| `Gap` | `180` | `[120]` |
| `Fold` | `119` | `[59]` |
| `Fold` | `120` | `[60,120]` |
| `Fold` | `179` | `[119,179]` |
| `Fold` | `180` | `[180]` |

Cero candidatos produce `Nonexistent`; uno, `Unique(u)`; más de uno, `Ambiguous(candidates)`. Elegir el primero automáticamente oculta la ambigüedad. Un producto puede adoptar otra resolución explícita, conservando intención y decisión; necesita comprobarla con sus bibliotecas y datos de zonas identificados.

## Reloj para medir duración

[W3C High Resolution Time Level 2](https://www.w3.org/TR/2019/REC-hr-time-2-20191121/), recomendación del 21 de noviembre de 2019, secciones 1 y 6, distingue medición monotónica de reloj civil ajustable. Su contrato es web; no demuestra el comportamiento de relojes nativos.

Modelo local: lecturas enteras no negativas del mismo reloj y escala, sin reinicio ni desbordamiento. `elapsed(1000,1250) → 250` ticks; `elapsed(1000,1000) → 0`; `elapsed(1250,1000) → InvalidClock`. Un reloj civil que cambia de `5000` a `4900` no participa en ese cálculo. Usarlo produciría `-100`, un fallo detectable.

Un consumidor debe definir unidad, resolución, alcance del origen y efecto de suspensión o reinicio. Los ticks inyectados comprueban el cálculo, no la exactitud del reloj, un tiempo de espera real ni sincronización distribuida.

## Criterio de cierre documental

Para este alcance, revisar contratos, resultados de frontera, fallos discriminantes y equivalencia entre idiomas. Todas las fuentes anteriores se consultaron el `2026-09-02`; ediciones y revisiones se identifican sin afirmar que sean las más recientes. Los límites de plataforma, dominio y conformidad permanecen explícitos. Completar ejemplos no aprueba reglas ni convierte este borrador en una publicación estable.
