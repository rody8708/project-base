# Data, Numbers, Text, and Time

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](data-and-time.es-419.md) · [Home](../README.en-US.md)

## Scope

This document develops FUND-002 from the [fundamentals](programming-fundamentals.en-US.md). It proposes explicit decisions to prevent a representation from silently changing the meaning of data. It does not prescribe a language, database, interchange format, or business rules. References support limited aspects; the policies and examples below are original local designs. [Traceability](traceability.en-US.md) records their status, and the [verification record](core-verification.en-US.md) separates executed results from pending checks.

Before implementing a data item, record its meaning, valid states, unit, limits, representation, allowed conversions, and error response. Review those requirements at entry, during operations, and when persisting or transmitting. Validating once does not protect a representation that can subsequently be modified without control.

## Missing, Empty, and Zero

A value that was not supplied does not necessarily mean unknown, empty, or zero. Interpretation belongs to the contract, not the language's implicit conversion.

Local contract: `quantity` accepts integers between `0` and `10000`. A missing member produces `Missing`; `null`, `Unknown`; a valid integer, `Present(value)`; any other value, `Invalid`. Strings and booleans are not converted into quantities.

| Input | Expected result |
| --- | --- |
| `{quantity: 3}` | `Present(3)` |
| `{quantity: 0}` | `Present(0)` |
| `{}` | `Missing` |
| `{quantity: null}` | `Unknown` |
| `{quantity: ""}` | `Invalid` |

A variant using “if the value is false, the data is missing” loses zero. Other domains may prohibit empty or unknown values: declare that without automatically reusing this policy.

Support: [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html), December 2017, Sections 3, 4, 6, and 8.1. It distinguishes JSON values, permits precision limits, and establishes UTF-8 for interchange outside closed ecosystems. It does not define the business meaning of `null` or require JSON here.

## Units, Ranges, and Overflow

Local proposal: carry the unit with the value or guarantee it through an unambiguous type or contract. Do not add incompatible quantities. If conversion is allowed, declare its factor, precision, and timing.

Example: `addLength(a, b)` receives integer lengths in `mm`, each between `0` and `10000`, and requires a result within the same range. Another unit produces `InvalidUnit`; out-of-range values or an excessive sum produce `OutOfRange`.

Cases: `250 + 750 → 1000`; `0 + 1000 → 1000`; `9000 + 1001 → OutOfRange`; an input with unit `s → InvalidUnit`. With operands already validated, checking `a > 10000 - b` before adding avoids exceeding the model's maximum. Adding first and checking afterward may be too late in a type that overflows.

The maximum `10000` is instructional. Each implementation also needs to examine intermediate ranges, conversions, and the type's actual behavior; this check does not exercise every machine overflow.

## Numeric Representation and Rounding

Some decimal values have no finite binary representation. The official [C# numeric type documentation](https://github.com/dotnet/docs/blob/4b9c7672e087d5f61ade3161ab57ff88e192edcc/docs/csharp/language-reference/builtin-types/floating-point-numeric-types.md), “Characteristics of the floating-point types,” revision `4b9c7672e087d5f61ade3161ab57ff88e192edcc` dated January 15, 2026, illustrates precision differences between types. This is evidence specific to that environment, not a selection of C# for the foundation.

Local proposal: choose scaled integers, decimals, rationals, or other representations according to required accuracy, range, and operations. Declare how approximations are compared and what happens to nonfinite values when they can exist. Writing a number in decimal does not guarantee that every receiver preserves its precision.

Example without monetary meaning: `roundTenths(hundredths)` accepts integers between `-1000000` and `1000000`. It returns integer tenths, rounding to the nearest value and, for exact ties, to the even integer.

```text
124 -> 12
125 -> 12
135 -> 14
-125 -> -12
0 -> 0
1000001 -> OutOfRange
```

Always rounding away from zero fails for `125`. Record whether items or their total are rounded: the two operations can differ. This policy belongs only to the example; it does not prescribe universal financial, tax, or scientific rules.

## Text, Encoding, and Normalization

Separate bytes from interpreted text; declare the encoding and treatment of invalid sequences. A storage limit in bytes is not automatically a limit on characters perceived by a person. Define what is counted before truncating.

[UAX #15](https://www.unicode.org/reports/tr15/tr15-57.html), Unicode 17.0.0, revision 57 dated July 30, 2025, Sections 1.1 and 1.2, distinguishes canonical and compatibility equivalence. Normalization can help comparisons, but some forms remove meaningful distinctions. It is not a general solution for searching, sorting, or security.

Local contract for a label: decode UTF-8 strictly and compare the NFC-normalized sequences ordinally. `U+00E9` and `U+0065 U+0301` produce the same normalized text; `"" → ""`; hexadecimal bytes `C3 28 → InvalidEncoding`. Silently replacing invalid bytes violates this contract. Comparing the unnormalized sequences ordinally fails the first case; a cultural comparison may treat them differently.

The policy does not automatically apply to secrets, signatures, external identifiers, or content whose identity depends on exact bytes. Follow the specific protocol there. Normalization does not replace validation or eliminate all visually confusable characters.

## Instants, Civil Dates, and Time Zones

Choose the concept first: an instant identifies a point in time; a civil date, a day in a calendar; a duration, an amount of time. A UTC offset indicates a difference; a time zone includes rules that may change. Do not turn a date without a time into “midnight UTC” without an explicit need.

Interchange support: [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html), July 2002, Sections 4.2, 5.6, and 5.7, defines timestamps with offsets and calendar restrictions; it does not resolve schedules or future local rules.

Local contract: compare instants by interpreting the offset, not stripping it. `2026-04-03T10:00:00-04:00` and `2026-04-03T14:00:00Z` represent the same instant. For Gregorian dates, `2026-04-03` and the boundary `2024-02-29` are valid; `2026-02-29 → InvalidDate`. Accepting any day up to 31 does not validate a calendar.

A consumer must specify precision, calendar, accepted format, and treatment of leap seconds. These cases do not implement a complete RFC 3339 parser or verify conformance.

## Nonexistent or Ambiguous Local Times

The official [Java SE 17, ZoneRules.getValidOffsets documentation](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/zone/ZoneRules.html), Java SE 17 edition, explains that a local time can have zero, one, or several valid offsets during transitions. It supports distinguishing these results; it does not require Java or certify time-zone data.

Original model, with no country or time-zone database: integer instants `u` between `0` and `239`; `local = u + offset`. In `Gap`, the offset is `0` before `u=120` and `60` from then onward. In `Fold`, it is `60` before `u=120` and `0` from then onward. Find all candidate instants in increasing order.

| Model | Local time | Expected candidates |
| --- | --- | --- |
| `Gap` | `119` | `[119]` |
| `Gap` | `120` | `[]` |
| `Gap` | `179` | `[]` |
| `Gap` | `180` | `[120]` |
| `Fold` | `119` | `[59]` |
| `Fold` | `120` | `[60,120]` |
| `Fold` | `179` | `[119,179]` |
| `Fold` | `180` | `[180]` |

Zero candidates produces `Nonexistent`; one, `Unique(u)`; more than one, `Ambiguous(candidates)`. Automatically choosing the first hides ambiguity. A product may adopt another explicit resolution while retaining intent and decision; it needs to verify it against identified libraries and time-zone data.

## A Clock for Measuring Duration

[W3C High Resolution Time Level 2](https://www.w3.org/TR/2019/REC-hr-time-2-20191121/), Recommendation dated November 21, 2019, Sections 1 and 6, distinguishes monotonic measurement from adjustable civil time. Its contract is for the web; it does not demonstrate native clock behavior.

Local model: nonnegative integer readings from the same clock and scale, with no restart or overflow. `elapsed(1000,1250) → 250` ticks; `elapsed(1000,1000) → 0`; `elapsed(1250,1000) → InvalidClock`. A civil clock changing from `5000` to `4900` does not participate in this calculation. Using it would produce `-100`, a detectable failure.

A consumer must define unit, resolution, scope of the origin, and the effects of suspension or restart. Injected ticks check the calculation, not clock accuracy, a real timeout, or distributed synchronization.

## Documentary Closure Criterion

For this scope, review contracts, boundary results, discriminating failures, and equivalence between languages. All sources above were consulted on `2026-09-02`; editions and revisions are identified without claiming they are the latest. Platform, domain, and conformance limits remain explicit. Completing examples does not approve rules or turn this draft into a stable release.
