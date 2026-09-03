# Comprobación del núcleo documental

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](core-verification.en-US.md) · [Inicio](../README.es-419.md) · [Gobernanza](foundation-governance.es-419.md)

## Alcance y aceptación

Este registro conecta los [fundamentos](programming-fundamentals.es-419.md), [datos y tiempo](data-and-time.es-419.md) y [fallos y recursos](failures-and-resources.es-419.md) con comprobaciones acotadas. No agrega reglas ni aplicaciones. El bloque nuevo contiene 80 comprobaciones; las [17 comprobaciones anteriores](fundamentals-verification.es-419.md) se mantienen separadas. Ejecutar ambos archivos de idioma no duplica la cobertura: son los mismos casos.

Hay modelos ejecutables para ejemplos de FUND-001/002/003/004/005/006/008/009/010 y revisión de casos documentales para FUND-007/011/012. Esto proporciona ejemplos comprobados para las doce áreas, no validación íntegra de sus afirmaciones ni de productos futuros. Los escenarios documentales tampoco son pruebas de interfaces, permisos o instalaciones reales.

La aceptación del bloque exige 80 resultados satisfactorios y detención ante cualquier fallo. El rechazo esperado de una entrada inválida cuenta como satisfactorio únicamente cuando coincide con el contrato. No se infiere calidad de un porcentaje o cantidad de pruebas.

| Grupo | Comprobaciones |
| --- | --- |
| Cantidades, unidades y redondeo | 26 |
| Texto y codificación | 3 |
| Instantes, calendario, duración y transiciones sintéticas | 14 |
| Recursos, cancelación, reintentos y recuperación en memoria | 17 |
| Ejemplos adicionales de FUND-002/004/005/008/009/010 | 20 |
| Total de este bloque | 80 |

## Condiciones y límites de los modelos

El entorno comprobado se registra abajo. Se usa PowerShell con bibliotecas incorporadas de .NET; no se instalan dependencias ni se prescribe ese lenguaje a los consumidores. El bloque no escribe archivos ni usa red. Los números son enteros pequeños del dominio indicado; `quantity` usa valores `[int]` del ejemplo, sin implementar un analizador JSON completo. Redondeo y suma usan sus rangos declarados, no números arbitrarios.

Unicode, decodificación y calendario ejercitan funciones reales de la biblioteca en los casos enumerados. Los relojes y transiciones son sintéticos. El recurso es un contador de intentos de cierre; no un archivo o conexión. Idempotencia supone solicitudes seriales y ausencia de caídas, con registro en memoria; `Applied2` y `Replayed2` se representan como estado `Applied`/`Replayed` y resultado `2`. La recuperación crea una copia en memoria y contrasta estructura, invariante y contenido esperado; no restaura discos o bases de datos.

Los totales acumulados cuentan sumas de los algoritmos, no tiempo ni memoria de producción. La tupla del intervalo ilustra campos enteros de solo lectura en este entorno, no una garantía de inmutabilidad profunda para cualquier tipo. Los escritores de FUND-005 son dobles de prueba que devuelven resultados explícitos, no interfaces reales.

## Bloque ejecutable

```powershell
$ErrorActionPreference = 'Stop'
$CoreResults = [System.Collections.Generic.List[string]]::new()
function Test-CoreCase([string]$Name, [bool]$Condition) {
    if (-not $Condition) { throw "FAIL: $Name" }
    $CoreResults.Add($Name)
}
function Read-ModelQuantity([hashtable]$Record) {
    if (-not $Record.ContainsKey('quantity')) { return 'Missing' }
    if ($null -eq $Record.quantity) { return 'Unknown' }
    if ($Record.quantity -isnot [int] -or $Record.quantity -lt 0 -or $Record.quantity -gt 10000) { return 'Invalid' }
    return "Present($($Record.quantity))"
}
Test-CoreCase 'DATA missing' ((Read-ModelQuantity @{}) -eq 'Missing')
Test-CoreCase 'DATA null' ((Read-ModelQuantity @{quantity=$null}) -eq 'Unknown')
Test-CoreCase 'DATA empty' ((Read-ModelQuantity @{quantity=''}) -eq 'Invalid')
Test-CoreCase 'DATA zero' ((Read-ModelQuantity @{quantity=0}) -eq 'Present(0)')

Test-CoreCase 'DATA positive' ((Read-ModelQuantity @{quantity=3}) -eq 'Present(3)')
Test-CoreCase 'DATA upper-bound' ((Read-ModelQuantity @{quantity=10000}) -eq 'Present(10000)')
Test-CoreCase 'DATA above-bound' ((Read-ModelQuantity @{quantity=10001}) -eq 'Invalid')
Test-CoreCase 'DATA negative' ((Read-ModelQuantity @{quantity=-1}) -eq 'Invalid')
Test-CoreCase 'DATA boolean' ((Read-ModelQuantity @{quantity=$false}) -eq 'Invalid')
Test-CoreCase 'DATA numeric-text' ((Read-ModelQuantity @{quantity='3'}) -eq 'Invalid')

function Add-ModelLength([int]$A,[string]$UnitA,[int]$B,[string]$UnitB) {
    if ($UnitA -cne 'mm' -or $UnitB -cne 'mm') { return 'InvalidUnit' }
    if ($A -lt 0 -or $B -lt 0 -or $A -gt 10000 -or $B -gt 10000) { return 'OutOfRange' }
    if ($B -gt 10000 - $A) { return 'OutOfRange' }
    return $A + $B
}
Test-CoreCase 'DATA units' ((Add-ModelLength 250 'mm' 750 'mm') -eq 1000)
Test-CoreCase 'DATA zero-length' ((Add-ModelLength 0 'mm' 1000 'mm') -eq 1000)
Test-CoreCase 'DATA wrong-unit' ((Add-ModelLength 250 'mm' 750 's') -eq 'InvalidUnit')
Test-CoreCase 'DATA range' ((Add-ModelLength 9000 'mm' 1001 'mm') -eq 'OutOfRange')

Test-CoreCase 'DATA length-upper-bound' ((Add-ModelLength 10000 'mm' 0 'mm') -eq 10000)
Test-CoreCase 'DATA length-negative' ((Add-ModelLength -1 'mm' 1 'mm') -eq 'OutOfRange')
Test-CoreCase 'DATA length-invalid-operand' ((Add-ModelLength 10001 'mm' 0 'mm') -eq 'OutOfRange')

function Round-ModelTenths([int]$Hundredths) {
    if ($Hundredths -lt -1000000 -or $Hundredths -gt 1000000) { return 'OutOfRange' }
    $magnitude = [math]::Abs($Hundredths)
    $whole = [int][math]::Floor($magnitude / 10)
    $remainder = $magnitude % 10
    if ($remainder -gt 5 -or ($remainder -eq 5 -and $whole % 2 -ne 0)) { $whole++ }
    if ($Hundredths -lt 0) { return -$whole }
    return $whole
}
Test-CoreCase 'DATA round-below-half' ((Round-ModelTenths 124) -eq 12)
Test-CoreCase 'DATA round-even' ((Round-ModelTenths 125) -eq 12)
Test-CoreCase 'DATA round-odd' ((Round-ModelTenths 135) -eq 14)
Test-CoreCase 'DATA round-negative' ((Round-ModelTenths -125) -eq -12)

Test-CoreCase 'DATA round-zero' ((Round-ModelTenths 0) -eq 0)
Test-CoreCase 'DATA round-above-bound' ((Round-ModelTenths 1000001) -eq 'OutOfRange')
Test-CoreCase 'DATA round-below-bound' ((Round-ModelTenths -1000001) -eq 'OutOfRange')
Test-CoreCase 'DATA round-upper-bound' ((Round-ModelTenths 1000000) -eq 100000)
Test-CoreCase 'DATA round-lower-bound' ((Round-ModelTenths -1000000) -eq -100000)

$composed = [string][char]0x00E9
$decomposed = 'e' + [char]0x0301
Test-CoreCase 'TEXT normalization' ((-not [string]::Equals($composed,$decomposed,[StringComparison]::Ordinal)) -and [string]::Equals($composed.Normalize([Text.NormalizationForm]::FormC),$decomposed.Normalize([Text.NormalizationForm]::FormC),[StringComparison]::Ordinal))
Test-CoreCase 'TEXT empty' (''.Normalize([Text.NormalizationForm]::FormC) -ceq '')
$strictDecoder = [Text.UTF8Encoding]::new($false,$true)
$encodingResult = 'UnexpectedSuccess'
try { $null = $strictDecoder.GetString([byte[]](0xC3,0x28)) }
catch {
    if ($_.Exception -is [Text.DecoderFallbackException] -or $_.Exception.InnerException -is [Text.DecoderFallbackException]) { $encodingResult = 'InvalidEncoding' }
    else { throw }
}
Test-CoreCase 'TEXT invalid-utf8' ($encodingResult -eq 'InvalidEncoding')

$culture = [Globalization.CultureInfo]::InvariantCulture
$instantA = [DateTimeOffset]::Parse('2026-04-03T10:00:00-04:00',$culture)
$instantB = [DateTimeOffset]::Parse('2026-04-03T14:00:00Z',$culture)
Test-CoreCase 'TIME equal-instants' ($instantA.UtcDateTime -eq $instantB.UtcDateTime)
$parsedDate = [datetime]::MinValue
$invalidAccepted = [datetime]::TryParseExact('2026-02-29','yyyy-MM-dd',$culture,[Globalization.DateTimeStyles]::None,[ref]$parsedDate)
Test-CoreCase 'TIME invalid-date' (-not $invalidAccepted)
$validAccepted = [datetime]::TryParseExact('2024-02-29','yyyy-MM-dd',$culture,[Globalization.DateTimeStyles]::None,[ref]$parsedDate)
Test-CoreCase 'TIME valid-leap-date' ($validAccepted -and $parsedDate.Year -eq 2024 -and $parsedDate.Month -eq 2 -and $parsedDate.Day -eq 29)

function Get-ModelDuration([int]$StartTicks,[int]$EndTicks) {
    if ($StartTicks -lt 0 -or $EndTicks -lt $StartTicks) { return 'InvalidClock' }
    return $EndTicks - $StartTicks
}
$wallStart = 5000
$wallEnd = 4900
Test-CoreCase 'TIME duration' (($wallEnd -lt $wallStart) -and (Get-ModelDuration 1000 1250) -eq 250)
Test-CoreCase 'TIME zero-duration' ((Get-ModelDuration 1000 1000) -eq 0)
Test-CoreCase 'TIME reversed-ticks' ((Get-ModelDuration 1250 1000) -eq 'InvalidClock')
function Resolve-ModelLocalMinute([int]$LocalMinute,[string]$Transition) {
    if ($Transition -cne 'Gap' -and $Transition -cne 'Fold') { return 'InvalidTransition' }
    $candidates = @()
    for ($u=0; $u -lt 240; $u++) {
        $offset = if ($Transition -ceq 'Gap') { if ($u -lt 120) {0} else {60} } else { if ($u -lt 120) {60} else {0} }
        if ($u + $offset -eq $LocalMinute) { $candidates += $u }
    }
    if ($candidates.Count -eq 0) { return 'Nonexistent' }
    if ($candidates.Count -eq 1) { return "Unique($($candidates[0]))" }
    return "Ambiguous($($candidates -join ','))"
}
Test-CoreCase 'TIME gap-before' ((Resolve-ModelLocalMinute 119 'Gap') -eq 'Unique(119)')
Test-CoreCase 'TIME gap-start' ((Resolve-ModelLocalMinute 120 'Gap') -eq 'Nonexistent')
Test-CoreCase 'TIME gap-end' ((Resolve-ModelLocalMinute 179 'Gap') -eq 'Nonexistent')
Test-CoreCase 'TIME gap-after' ((Resolve-ModelLocalMinute 180 'Gap') -eq 'Unique(120)')
Test-CoreCase 'TIME fold-before' ((Resolve-ModelLocalMinute 119 'Fold') -eq 'Unique(59)')
Test-CoreCase 'TIME fold-start' ((Resolve-ModelLocalMinute 120 'Fold') -eq 'Ambiguous(60,120)')
Test-CoreCase 'TIME fold-end' ((Resolve-ModelLocalMinute 179 'Fold') -eq 'Ambiguous(119,179)')
Test-CoreCase 'TIME fold-after' ((Resolve-ModelLocalMinute 180 'Fold') -eq 'Unique(180)')

function Invoke-ModelResource([bool]$AcquireFails,[bool]$WorkFails,[bool]$CloseFails) {
    $record = @{Result='Pending';CloseAttempts=0;PrimaryError=$null;CleanupError=$null}
    try {
        if ($AcquireFails) { throw 'AcquireFailed' }
        try {
            if ($WorkFails) { throw 'WorkFailed' }
            $record.Result = 'Completed'
        } finally {
            $record.CloseAttempts++
            if ($CloseFails) { $record.CleanupError = 'CloseFailed' }
        }
    } catch {
        $record.PrimaryError = $_.Exception.Message
        $record.Result = 'Failed'
    }
    if ($null -ne $record.CleanupError) { $record.Result = 'Failed' }
    return $record
}
$clean = Invoke-ModelResource $false $false $false
Test-CoreCase 'RESOURCE success' ($clean.Result -eq 'Completed' -and $clean.CloseAttempts -eq 1)
$acquireFailure = Invoke-ModelResource $true $false $false
Test-CoreCase 'RESOURCE acquire-failure' ($acquireFailure.Result -eq 'Failed' -and $acquireFailure.CloseAttempts -eq 0 -and $acquireFailure.PrimaryError -eq 'AcquireFailed')
$workFailure = Invoke-ModelResource $false $true $false
Test-CoreCase 'RESOURCE work-failure' ($workFailure.Result -eq 'Failed' -and $workFailure.CloseAttempts -eq 1 -and $workFailure.PrimaryError -eq 'WorkFailed')
$bothFailures = Invoke-ModelResource $false $true $true
Test-CoreCase 'RESOURCE two-failures' ($bothFailures.Result -eq 'Failed' -and $bothFailures.CloseAttempts -eq 1 -and $bothFailures.PrimaryError -eq 'WorkFailed' -and $bothFailures.CleanupError -eq 'CloseFailed')
$closeFailure = Invoke-ModelResource $false $false $true
Test-CoreCase 'RESOURCE close-failure' ($closeFailure.Result -eq 'Failed' -and $closeFailure.CloseAttempts -eq 1 -and $closeFailure.CleanupError -eq 'CloseFailed')

function Invoke-ModelCancelableWork([int]$CancelAfter) {
    $completed = 0
    $cancelRequested = $CancelAfter -eq 0
    foreach ($unit in 1..3) {
        if ($cancelRequested) { return @{Result='Cancelled';Completed=$completed} }
        $completed++
        if ($completed -eq $CancelAfter) { $cancelRequested = $true }
    }
    return @{Result='Completed';Completed=$completed}
}
$cancelBefore = Invoke-ModelCancelableWork 0
Test-CoreCase 'CANCEL before' ($cancelBefore.Result -eq 'Cancelled' -and $cancelBefore.Completed -eq 0)
$cancelBetween = Invoke-ModelCancelableWork 1
Test-CoreCase 'CANCEL between' ($cancelBetween.Result -eq 'Cancelled' -and $cancelBetween.Completed -eq 1)
$noCancel = Invoke-ModelCancelableWork -1
Test-CoreCase 'CANCEL none' ($noCancel.Result -eq 'Completed' -and $noCancel.Completed -eq 3)

$remoteAppliedCount = 0
$remoteAppliedCount++
$responseLost = $true
$observedStatus = if ($responseLost) {'Unknown'} else {'Applied'}
Test-CoreCase 'RETRY lost-response' ($observedStatus -eq 'Unknown' -and $remoteAppliedCount -eq 1)
function Invoke-ModelRequest([hashtable]$State,[string]$Key,[int]$Payload) {
    if ($State.Records.ContainsKey($Key)) {
        $previous = $State.Records[$Key]
        if ($previous.Payload -ne $Payload) { return @{Status='Conflict';Result=$null} }
        return @{Status='Replayed';Result=$previous.Result}
    }
    $State.EffectCount++
    $State.EffectTotal += $Payload
    $State.Records[$Key] = @{Payload=$Payload;Result=$Payload}
    return @{Status='Applied';Result=$Payload}
}
$requestState = @{Records=@{};EffectCount=0;EffectTotal=0}
$first = Invoke-ModelRequest $requestState 'keyA' 2
Test-CoreCase 'RETRY first' ($first.Status -eq 'Applied' -and $first.Result -eq 2 -and $requestState.EffectCount -eq 1)
$repeat = Invoke-ModelRequest $requestState 'keyA' 2
Test-CoreCase 'RETRY repeat' ($repeat.Status -eq 'Replayed' -and $repeat.Result -eq 2 -and $requestState.EffectCount -eq 1 -and $requestState.EffectTotal -eq 2)
$conflict = Invoke-ModelRequest $requestState 'keyA' 3
Test-CoreCase 'RETRY conflict' ($conflict.Status -eq 'Conflict' -and $null -eq $conflict.Result -and $requestState.EffectCount -eq 1 -and $requestState.EffectTotal -eq 2)

function Restore-ModelSnapshot([hashtable]$Candidate) {
    foreach ($field in @('version','items','total')) { if (-not $Candidate.ContainsKey($field)) { return 'InvalidBackup' } }
    if ($Candidate.version -isnot [int] -or $Candidate.version -ne 1 -or $Candidate.items -isnot [array] -or $Candidate.total -isnot [int]) { return 'InvalidBackup' }
    if ($Candidate.items.Count -ne 2) { return 'InvalidBackup' }
    foreach ($item in $Candidate.items) { if ($item -isnot [int] -or $item -lt 0 -or $item -gt 10000) { return 'InvalidBackup' } }
    $sum = $Candidate.items[0] + $Candidate.items[1]
    if ($Candidate.total -ne $sum) { return 'InvalidBackup' }
    if ($Candidate.items[0] -ne 2 -or $Candidate.items[1] -ne 3 -or $Candidate.total -ne 5) { return 'UnexpectedContent' }
    return @{version=1;items=@($Candidate.items[0],$Candidate.items[1]);total=$sum}
}
$originalSnapshot = @{version=1;items=@(2,3);total=5}
$restored = Restore-ModelSnapshot $originalSnapshot
Test-CoreCase 'RECOVERY complete' ($restored -is [hashtable] -and $restored.version -eq 1 -and $restored.items[0] -eq 2 -and $restored.items[1] -eq 3 -and $restored.total -eq 5)
Test-CoreCase 'RECOVERY incomplete' ((Restore-ModelSnapshot @{version=1;items=@(2,3)}) -eq 'InvalidBackup')
Test-CoreCase 'RECOVERY inconsistent' ((Restore-ModelSnapshot @{version=1;items=@(2,3);total=9}) -eq 'InvalidBackup')
Test-CoreCase 'RECOVERY altered' ((Restore-ModelSnapshot @{version=1;items=@(1,4);total=5}) -eq 'UnexpectedContent')
$restored.items[0] = 99
Test-CoreCase 'RECOVERY isolated-copy' ($originalSnapshot.items[0] -eq 2 -and $originalSnapshot.total -eq 5)

function New-ModelInterval([int]$Start,[int]$End) {
    if ($Start -lt 0 -or $End -lt $Start) { return 'InvalidInterval' }
    return [System.Tuple[int,int]]::new($Start,$End)
}
$interval = New-ModelInterval 2 5
Test-CoreCase 'FUND-002 interval' ($interval.Item1 -eq 2 -and $interval.Item2 -eq 5)
$pointInterval = New-ModelInterval 3 3
Test-CoreCase 'FUND-002 point' ($pointInterval.Item1 -eq 3 -and $pointInterval.Item2 -eq 3)
Test-CoreCase 'FUND-002 reversed' ((New-ModelInterval 4 3) -eq 'InvalidInterval')
Test-CoreCase 'FUND-002 negative' ((New-ModelInterval -1 3) -eq 'InvalidInterval')
function Get-ModelTotalUnits($Rows) {
    $total = 0
    foreach ($row in $Rows) { $total += $row.units }
    return $total
}
$unitRows = @(@{units=3},@{units=2;label='B'})
Test-CoreCase 'FUND-004 empty' ((Get-ModelTotalUnits @()) -eq 0)
Test-CoreCase 'FUND-004 optional-label' ((Get-ModelTotalUnits $unitRows) -eq 5)
$unitRows[0].label = 'Changed'
$null = $unitRows[1].Remove('label')
Test-CoreCase 'FUND-004 changed-labels' ((Get-ModelTotalUnits $unitRows) -eq 5)
function Get-ModelRemaining([int]$Required,[int]$Completed) { return [math]::Max(0,$Required-$Completed) }
function Show-ModelRemaining([int]$Required,[int]$Completed,[scriptblock]$Writer) { return & $Writer (Get-ModelRemaining $Required $Completed) }
Test-CoreCase 'FUND-005 remaining' ((Get-ModelRemaining 10 3) -eq 7)
Test-CoreCase 'FUND-005 surplus' ((Get-ModelRemaining 3 10) -eq 0)
Test-CoreCase 'FUND-005 written' ((Show-ModelRemaining 10 3 {param($Value) if ($Value -ne 7) {throw 'Wrong value'}; 'Written'}) -eq 'Written')
Test-CoreCase 'FUND-005 output-error' ((Show-ModelRemaining 10 3 {param($Value) if ($Value -ne 7) {throw 'Wrong value'}; 'OutputError'}) -eq 'OutputError')
function Test-ModelQuota([bool]$Active,[int]$Count,[int]$Limit) { return $Active -and $Count -lt $Limit }
Test-CoreCase 'FUND-008 independent' ((Test-ModelQuota $true 2 3) -and (Test-ModelQuota $true 0 1))
Test-CoreCase 'FUND-008 changed-book-limit' ((-not (Test-ModelQuota $true 2 2)) -and (Test-ModelQuota $true 0 1))
Test-CoreCase 'FUND-008 inactive' ((-not (Test-ModelQuota $false 2 3)) -and (-not (Test-ModelQuota $false 0 1)))
function Test-ModelOpen([int]$Now,[int]$ClosesAt) { return $Now -lt $ClosesAt }
Test-CoreCase 'FUND-009 before' (Test-ModelOpen 8 10)
Test-CoreCase 'FUND-009 boundary' (-not (Test-ModelOpen 10 10))
Test-CoreCase 'FUND-009 after' (-not (Test-ModelOpen 11 10))
function Get-ModelPrefix($Values,[bool]$RepeatedScan) {
    $totals = [System.Collections.Generic.List[int]]::new()
    $additions = 0
    if ($RepeatedScan) {
        for ($i=0; $i -lt $Values.Count; $i++) {
            $sum = 0
            for ($j=0; $j -le $i; $j++) { $sum += $Values[$j]; $additions++ }
            $totals.Add($sum)
        }
    } else {
        $sum = 0
        foreach ($value in $Values) { $sum += $value; $additions++; $totals.Add($sum) }
    }
    return @{Values=@($totals.ToArray());Additions=$additions}
}
$prefixEmptyA = Get-ModelPrefix @() $true
$prefixEmptyB = Get-ModelPrefix @() $false
Test-CoreCase 'FUND-010 empty' ($prefixEmptyA.Values.Count -eq 0 -and $prefixEmptyB.Values.Count -eq 0 -and $prefixEmptyA.Additions -eq 0 -and $prefixEmptyB.Additions -eq 0)
$prefixA = Get-ModelPrefix @(3,-1,4) $true
$prefixB = Get-ModelPrefix @(3,-1,4) $false
Test-CoreCase 'FUND-010 totals-and-counts' (($prefixA.Values -join ',') -eq '3,2,6' -and ($prefixB.Values -join ',') -eq '3,2,6' -and $prefixA.Additions -eq 6 -and $prefixB.Additions -eq 3)
$prefixMixedA = Get-ModelPrefix @(-2,0,2) $true
$prefixMixedB = Get-ModelPrefix @(-2,0,2) $false
Test-CoreCase 'FUND-010 zero-negative' (($prefixMixedA.Values -join ',') -eq '-2,-2,0' -and ($prefixMixedB.Values -join ',') -eq '-2,-2,0')

if ($CoreResults.Count -ne 80) { throw 'Unexpected check count' }
[pscustomobject]@{Result='PASS';Checks=$CoreResults.Count;Cases=$CoreResults.ToArray()} | ConvertTo-Json -Depth 3
```

## Escenarios de revisión documental

Método: lectura y contraste de las [reglas](immutable-rules.es-419.md), el [flujo](development-workflow.es-419.md), la [plantilla](../templates/project-brief.es-419.md) y los fundamentos frente a los casos siguientes. Son revisiones realizadas por el asistente, con apoyo de revisión cruzada; no sesiones con usuarios ni una auditoría independiente. La decisión observada describe lo que exige el texto, no una operación ejecutada.

| Escenario | Entrada y decisión esperada | Resultado de revisión y límite |
| --- | --- | --- |
| Alcance — RULE-001/009, FLOW-001/005, BRIEF-002/008 | Una corrección de texto agrega autenticación sin autorización. Separar la ampliación y registrar la decisión pendiente. | El texto prohíbe presentar suposiciones como requisitos y exige autorización; la plantilla permite registrar alcance y pendientes. No se agregó autenticación. |
| Verificación proporcional — RULE-006/010, FLOW-004/005 | Un cambio documental exige compilar una aplicación inexistente. Revisar idiomas, significado, enlaces y anclas; justificar que compilación no aplica. | Las condiciones de aplicación distinguen documentación de código. Omitir toda revisión sería incorrecto. No se compiló una aplicación. |
| Dependencias y compatibilidad — RULE-007/008, BRIEF-003/007 | Un archivo de bloqueo se presenta como instalación probada y se extrapola evidencia Windows a macOS. Rechazar ambas inferencias; declarar una ruptura de formato. | Las reglas separan control de versiones, instalación y soporte verificado; exigen identificar cambios incompatibles. No se probaron instalaciones, macOS ni migraciones. |
| Recuperación — RULE-004/006, FLOW-002/004, BRIEF-005 | Hay respaldo de datos que deben preservarse, sin ensayo de restauración. No declararlo recuperación verificada. | El texto exige una vía comprobada y reporte honesto; el ejemplo en memoria no sustituye la restauración real del consumidor. |
| Eliminación acotada — RULE-004, BRIEF-005 | Una política autoriza borrar caché identificada, excluyendo datos persistentes. No exigir restaurar esa caché ni ampliar la autorización. | Se distingue información descartable de datos a conservar, con objetivo y límites verificables. No se borraron datos. |
| Acceso y errores — FUND-007 | Una persona no autorizada conoce el identificador de un documento; otro caso pierde almacenamiento. Rechazar acceso y evitar rutas internas en la respuesta. | El contrato cubre ambas decisiones y advierte sobre revelar existencia sensible. No se implementaron controles de acceso ni almacenamiento. |
| Interfaz y contexto — FUND-011 | Un diseño omite foco visible, formato y explicación de fecha inválida. Identificar esas omisiones antes de considerarlo suficiente. | Los criterios contemplan teclado, foco, error textual y fecha inequívoca. No se probaron interfaz, asistencia ni conformidad de accesibilidad. |
| Dependencia candidata — FUND-012 | Una demostración funciona, pero quedan licencia y comprobaciones pendientes. Conservar `pending`, no aprobación automática. | El ejemplo distingue información completa, decisión responsable y aprobación. No se instaló un paquete ni se evaluó una licencia concreta. |

Estos ocho casos no cubren todas las combinaciones de las reglas ni completan su aprobación. Sirven para detectar interpretaciones incorrectas y comprobar coherencia del alcance documental.

## Cómo repetir las comprobaciones

Requisito observado: PowerShell `7.6.4` en el entorno registrado. Desde la raíz de la base, leer primero el código y ejecutar el procedimiento siguiente. Este mecanismo ejecuta contenido local revisado; no es un cargador seguro para documentos externos. Extrae el único bloque `powershell` de este archivo sin crear un programa en disco.

```text
$coreDocument = Get-Content -LiteralPath 'docs/core-verification.es-419.md' -Raw -Encoding UTF8
$coreBlocks = [regex]::Matches($coreDocument, '(?ms)^\x60{3}powershell\r?\n(.*?)^\x60{3}')
if ($coreBlocks.Count -ne 1) { throw 'Expected exactly one model block' }
& ([scriptblock]::Create($coreBlocks[0].Groups[1].Value))
```

Resultado esperado: `Result = PASS`, `Checks = 80` y los nombres de los casos. La versión inglesa debe producir el mismo resultado. Ejecutar también el procedimiento de las 17 comprobaciones anteriores para detectar regresiones de sus modelos. Los ocho escenarios documentales se repiten leyendo las obligaciones y sus condiciones, no ejecutando este bloque.

## Registro de ejecución y límites

- Fecha: `2026-09-02`; revisión examinada: `0.1.0-draft.3`.
- Responsable: asistente de desarrollo, con revisión cruzada asistida de contratos y traducción; sin aprobación del usuario ni auditoría independiente.
- Entorno observado: PowerShell `7.6.4`, Windows NT `10.0.26200.0`.
- Método: extracción y ejecución del bloque desde ambos archivos de idioma mediante el procedimiento documentado; comparación del código, resultados y huellas.
- Resultado: `PASS`, 80 comprobaciones en cada idioma. Es un conjunto de 80 casos, no 160. Se repitieron además las 17 comprobaciones iniciales, también satisfactorias en ambos idiomas: 97 comprobaciones de modelos en total.
- Identidad del bloque nuevo: SHA-256 `5a5666893d63ff5ffc205fdbf1c177cb6dc7a219326fdf52076a7868e21e0be9`, contenido del bloque sin cercas, UTF-8 y finales LF, incluido el salto final. Coincide entre idiomas; no identifica una publicación aprobada completa.
- Revisión documental: ocho escenarios examinados; no se detectaron contradicciones materiales en esos casos. Su resultado es revisión de texto, no ejecución de controles de producto.
- Corrección durante la preparación: se sustituyó una comparación cultural de texto por comparación ordinal antes y después de NFC; se alinearon la explicación y ambos modelos. Una comparación cultural podía considerar equivalentes secuencias distintas y falsear la comprobación de identidad previa.
- No ejecutado: pruebas reales de recursos del sistema, redes, respaldo/restauración física, concurrencia entre hilos o procesos, interfaces, rendimiento o plataformas de consumidores. Los modelos no se registran como tales pruebas.

Esta evidencia no demuestra límites numéricos de todos los lenguajes, conformidad completa de formatos, relojes o zonas reales, coordinación entre procesos, cierre de recursos del sistema operativo, restauración física, rendimiento de producción o funcionamiento de interfaces. Los resultados de biblioteca se limitan al entorno indicado. La revisión asistida no sustituye la responsabilidad de revisión y aprobación humana. No se declara estable la base ni aprobado ninguno de sus elementos.
