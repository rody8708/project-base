# Comprobación de modelos de fundamentos

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](fundamentals-verification.en-US.md) · [Inicio](../README.es-419.md) · [Fundamentos](programming-fundamentals.es-419.md) · [Gobernanza](foundation-governance.es-419.md)

## Alcance y criterios

Este ejercicio local comprueba modelos de FUND-001, FUND-003 y FUND-006, no componentes de producto. No crea archivos, accede a la red ni instala dependencias. Se eligió PowerShell por estar disponible en el entorno de revisión; no se impone a los proyectos consumidores.

| Modelo | Casos enumerados | Criterio |
| --- | --- | --- |
| FUND-001 | Cero, múltiplo exacto, sobrante, cantidad negativa, capacidad cero y división truncada. | Cinco resultados correctos y detección de la variante defectuosa. |
| FUND-003 | Secuencia vacía, negativo posterior, cero, negativo inicial, dato ausente y progreso defectuoso. | Cinco resultados correctos y detección del estancamiento con límite de pasos. |
| FUND-006 | Órdenes A→B y B→A, capacidad cero, capacidad negativa y dos lecturas antes de las escrituras. | En cada orden serial hay una aceptación y un rechazo; detectar dos aceptaciones para un cupo. |

La aceptación del ejercicio exige 17 comprobaciones satisfactorias, incluidas tres que detectan defectos deliberados. Un resultado satisfactorio significa que el defecto fue detectado, no que su implementación es correcta. El código usa únicamente los valores pequeños enumerados. Las guardas de dato ausente y capacidad negativa amplían el modelo ejecutable: no son pruebas generales de tipos ni equivalencia completa con el pseudocódigo.

## Modelo ejecutable

```powershell
$ErrorActionPreference = 'Stop'
$ModelResults = [System.Collections.Generic.List[string]]::new()
function Assert-ModelCase([string]$Name, [bool]$Condition) {
    if (-not $Condition) { throw "FAIL: $Name" }
    $ModelResults.Add($Name)
}
function Get-ModelPackageCount([int]$N, [int]$Capacity) {
    if ($N -lt 0 -or $Capacity -le 0) { return 'InvalidInput' }
    $whole = [int][math]::Floor($N / $Capacity)
    if ($N % $Capacity -ne 0) { return $whole + 1 }
    return $whole
}
Assert-ModelCase 'FUND-001 zero' ((Get-ModelPackageCount 0 4) -eq 0)
Assert-ModelCase 'FUND-001 exact' ((Get-ModelPackageCount 8 4) -eq 2)
Assert-ModelCase 'FUND-001 remainder' ((Get-ModelPackageCount 9 4) -eq 3)
Assert-ModelCase 'FUND-001 invalid-count' ((Get-ModelPackageCount -1 4) -eq 'InvalidInput')
Assert-ModelCase 'FUND-001 invalid-capacity' ((Get-ModelPackageCount 3 0) -eq 'InvalidInput')
$truncated = [int][math]::Floor(9 / 4)
Assert-ModelCase 'FUND-001 defect-detected' ($truncated -eq 2 -and $truncated -ne 3)

function Get-ModelFirstNegative($Values, [bool]$BrokenProgress = $false) {
    if ($null -eq $Values) { return 'InvalidInput' }
    $i = 0
    $steps = 0
    while ($i -lt $Values.Count) {
        if ($steps -ge 4) { return 'StepLimit' }
        $steps++
        if ($Values[$i] -lt 0) { return "Present($i)" }
        if (-not $BrokenProgress -or $Values[$i] -gt 0) { $i++ }
    }
    return 'Absent'
}
Assert-ModelCase 'FUND-003 empty' ((Get-ModelFirstNegative -Values @()) -eq 'Absent')
Assert-ModelCase 'FUND-003 found' ((Get-ModelFirstNegative -Values @(3,0,-2)) -eq 'Present(2)')
Assert-ModelCase 'FUND-003 zero' ((Get-ModelFirstNegative -Values @(0)) -eq 'Absent')
Assert-ModelCase 'FUND-003 first' ((Get-ModelFirstNegative -Values @(-1)) -eq 'Present(0)')
Assert-ModelCase 'FUND-003 missing' ((Get-ModelFirstNegative -Values $null) -eq 'InvalidInput')
Assert-ModelCase 'FUND-003 defect-detected' ((Get-ModelFirstNegative -Values @(0) -BrokenProgress $true) -eq 'StepLimit')

function Invoke-ModelReservations([int]$Capacity, [string[]]$Order) {
    if ($Capacity -lt 0) { return 'InvalidInput' }
    $remaining = $Capacity
    $accepted = @()
    $rejected = @()
    foreach ($request in $Order) {
        if ($remaining -eq 0) { $rejected += $request }
        else { $remaining--; $accepted += $request }
    }
    return [pscustomobject]@{
        Remaining = $remaining
        Accepted = $accepted
        Rejected = $rejected
    }
}
$ab = Invoke-ModelReservations 1 @('A','B')
Assert-ModelCase 'FUND-006 serial-AB' ($ab.Remaining -eq 0 -and $ab.Accepted.Count -eq 1 -and $ab.Rejected.Count -eq 1 -and $ab.Accepted[0] -eq 'A' -and $ab.Rejected[0] -eq 'B')
$ba = Invoke-ModelReservations 1 @('B','A')
Assert-ModelCase 'FUND-006 serial-BA' ($ba.Remaining -eq 0 -and $ba.Accepted.Count -eq 1 -and $ba.Rejected.Count -eq 1 -and $ba.Accepted[0] -eq 'B' -and $ba.Rejected[0] -eq 'A')
$empty = Invoke-ModelReservations 0 @('A','B')
Assert-ModelCase 'FUND-006 empty' ($empty.Remaining -eq 0 -and $empty.Accepted.Count -eq 0 -and $empty.Rejected.Count -eq 2)
Assert-ModelCase 'FUND-006 invalid-capacity' ((Invoke-ModelReservations -1 @('A','B')) -eq 'InvalidInput')
$initial = 1
$remaining = $initial
$acceptedCount = 0
$readA = $remaining
$readB = $remaining
if ($readA -gt 0) { $remaining = $readA - 1; $acceptedCount++ }
if ($readB -gt 0) { $remaining = $readB - 1; $acceptedCount++ }
Assert-ModelCase 'FUND-006 defect-detected' ($acceptedCount -eq 2 -and $remaining -eq 0 -and ($acceptedCount + $remaining) -ne $initial)

if ($ModelResults.Count -ne 17) { throw 'Unexpected check count' }
[pscustomobject]@{
    Result = 'PASS'
    Checks = $ModelResults.Count
    DeliberateDefectsDetected = 3
    Cases = $ModelResults.ToArray()
} | ConvertTo-Json -Depth 3
```

## Cómo repetirlo

Desde la raíz de esta base, revisar primero el bloque anterior y ejecutar lo siguiente en PowerShell. Solo se debe ejecutar contenido local que se haya leído y revisado; este mecanismo no es un cargador seguro de documentos de terceros. Extrae el único bloque `powershell` y lo ejecuta sin generar un archivo de programa.

```text
$modelDocument = Get-Content -LiteralPath 'docs/fundamentals-verification.es-419.md' -Raw -Encoding UTF8
$modelMatch = [regex]::Match($modelDocument, '(?ms)^\x60{3}powershell\r?\n(.*?)^\x60{3}')
if (-not $modelMatch.Success) { throw 'Model block not found' }
& ([scriptblock]::Create($modelMatch.Groups[1].Value))
```

Resultado esperado: `Result = PASS`, `Checks = 17` y `DeliberateDefectsDetected = 3`, con los nombres de los casos. Un fallo detiene la ejecución mediante una excepción. Repetir con el archivo inglés debe producir el mismo resultado; los bloques de modelo son idénticos.

## Registro histórico de ejecución 0.1.0-draft.2

- Fecha: `2026-09-02`; revisión examinada: `0.1.0-draft.2`.
- Responsable: asistente de desarrollo; no es aprobación del usuario ni revisión independiente.
- Entorno observado: PowerShell `7.6.4`, Windows NT `10.0.26200.0`.
- Método ejecutado: extracción y ejecución del bloque mediante el procedimiento anterior, desde cada archivo de idioma; comparación del código y resultados.
- Resultado observado en ambos idiomas: `PASS`, 17 comprobaciones satisfactorias y 3 defectos deliberados detectados. No son 34 casos distintos: ambos archivos contienen el mismo modelo.
- Identidad del modelo: SHA-256 `7e4b2febfdcd50057a85a2887cc746e997e4fe8708eddda97a21fc0a51d00277`, calculado sobre el contenido del bloque, sin sus cercas Markdown, en UTF-8 con finales de línea LF y el salto final incluido. Esta huella identifica el ejemplo, no una publicación aprobada.
- No ejecutado: los demás ejemplos, pruebas de producto, concurrencia real, interfaces o compatibilidad de plataformas. No hay fallos pendientes entre los 17 casos enumerados; los límites siguientes permanecen abiertos.

## Límites de esta evidencia

El límite de cuatro pasos evita colgar el ejercicio defectuoso; no es un presupuesto temporal ni sirve para entradas arbitrarias. Los órdenes seriales y el entrelazado son simulaciones deterministas: no ejecutan hilos reales ni prueban reentrada, durabilidad, reintentos, recursos o plataformas. El ejemplo numérico tampoco prueba precisión para todos los enteros o conversiones de entradas externas.

El registro histórico corresponde al alcance inicial de tres fundamentos. La revisión `0.1.0-draft.3` amplía modelos y escenarios en la [comprobación del núcleo](core-verification.es-419.md). Estas comprobaciones no otorgan a ningún fundamento el estado `validated-in-scope` o `approved`, ni convierten el borrador en una publicación estable. La evaluación completa requiere resolver los límites del elemento y cumplir las condiciones de gobernanza.

## Reejecución en 0.1.0-draft.3

- Fecha: `2026-09-02`; mismo procedimiento, PowerShell `7.6.4` y Windows NT `10.0.26200.0`.
- Resultado: 17 comprobaciones satisfactorias en cada idioma y tres defectos deliberados detectados. No se duplican casos al ejecutarlos en dos archivos.
- El bloque conserva la huella del registro anterior; no se modificó su código. La revisión `.3` actualiza metadatos y referencias a las comprobaciones ampliadas.
- Se mantienen los límites de estos modelos; no se prueban productos ni se aprueba una publicación.
