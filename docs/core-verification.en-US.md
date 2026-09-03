# Documentary Core Verification

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](core-verification.es-419.md) · [Home](../README.en-US.md) · [Governance](foundation-governance.en-US.md)

## Scope and Acceptance

This record connects the [fundamentals](programming-fundamentals.en-US.md), [data and time](data-and-time.en-US.md), and [failures and resources](failures-and-resources.en-US.md) with bounded checks. It adds no rules or applications. The new block contains 80 checks; the [previous 17 checks](fundamentals-verification.en-US.md) remain separate. Running both language files does not double coverage: they contain the same cases.

Executable models cover examples from FUND-001/002/003/004/005/006/008/009/010, with documentary case review for FUND-007/011/012. This provides checked examples for all twelve areas, not full validation of their claims or future products. Documentary scenarios are not tests of real interfaces, permissions, or installations either.

Block acceptance requires 80 passing results and termination on any failure. Expected rejection of invalid input counts as passing only when it matches the contract. Quality is not inferred from a test percentage or count.

| Group | Checks |
| --- | --- |
| Quantities, units, and rounding | 26 |
| Text and encoding | 3 |
| Instants, calendar, duration, and synthetic transitions | 14 |
| Resources, cancellation, retries, and in-memory recovery | 17 |
| Additional examples from FUND-002/004/005/008/009/010 | 20 |
| Total for this block | 80 |

## Model Conditions and Limitations

The checked environment is recorded below. PowerShell uses built-in .NET libraries; no dependencies are installed, and that language is not prescribed to consumers. The block does not write files or use the network. Numbers are small integers within the stated domain; `quantity` uses the example's `[int]` values, without implementing a complete JSON parser. Rounding and addition use their declared ranges, not arbitrary numbers.

Unicode, decoding, and calendar checks exercise real library functions for the enumerated cases. Clocks and transitions are synthetic. The resource is a counter of close attempts, not a file or connection. Idempotency assumes serial requests and no crashes, with an in-memory record; `Applied2` and `Replayed2` are represented by status `Applied`/`Replayed` and result `2`. Recovery creates an in-memory copy and compares its structure, invariant, and expected content; it does not restore disks or databases.

Prefix totals count algorithm additions, not production time or memory. The interval tuple illustrates read-only integer fields in this environment, not a guarantee of deep immutability for every type. The FUND-005 writers are test doubles returning explicit results, not real interfaces.

## Executable Block

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

## Documentary Review Scenarios

Method: reading and comparing the [rules](immutable-rules.en-US.md), [workflow](development-workflow.en-US.md), [template](../templates/project-brief.en-US.md), and fundamentals against the following cases. These reviews were performed by the assistant with cross-review support; they are not user sessions or an independent audit. The observed decision describes what the text requires, not an executed operation.

| Scenario | Input and expected decision | Review result and limitation |
| --- | --- | --- |
| Scope — RULE-001/009, FLOW-001/005, BRIEF-002/008 | A text correction adds authentication without authorization. Separate the expansion and record the pending decision. | The text prohibits presenting assumptions as requirements and requires authorization; the template can record scope and pending items. No authentication was added. |
| Proportionate verification — RULE-006/010, FLOW-004/005 | A document change requires building a nonexistent application. Review languages, meaning, links, and anchors; justify why a build does not apply. | Applicability conditions distinguish documentation from code. Skipping all review would be incorrect. No application was built. |
| Dependencies and compatibility — RULE-007/008, BRIEF-003/007 | A lockfile is presented as a tested installation, and Windows evidence is generalized to macOS. Reject both inferences; declare a format break. | The rules separate version control, installation, and verified support; they require identifying incompatible changes. No installations, macOS behavior, or migrations were tested. |
| Recovery — RULE-004/006, FLOW-002/004, BRIEF-005 | A backup exists for data that must be preserved, without a restoration trial. Do not declare recovery verified. | The text requires a checked recovery path and honest reporting; the in-memory example does not replace the consumer's real restoration. |
| Bounded deletion — RULE-004, BRIEF-005 | A policy authorizes deleting identified cache data, excluding persistent data. Do not require restoring that cache or expand authorization. | Disposable information is distinguished from data to preserve, with verifiable targets and limits. No data was deleted. |
| Access and errors — FUND-007 | An unauthorized person knows a document identifier; another case loses storage access. Reject access and avoid internal paths in the response. | The contract covers both decisions and warns about revealing sensitive existence. No access controls or storage were implemented. |
| Interface and context — FUND-011 | A design omits visible focus, format, and an invalid-date explanation. Identify those omissions before considering it sufficient. | The criteria address keyboard use, focus, textual errors, and unambiguous dates. No interface, assistance, or accessibility conformance was tested. |
| Candidate dependency — FUND-012 | A demonstration works, but license review and checks remain pending. Retain `pending`, not automatic approval. | The example distinguishes complete information, a responsible decision, and approval. No package was installed or specific license assessed. |

These eight cases do not cover every combination of rules or complete their approval. They help detect incorrect interpretations and check coherence within the documentary scope.

## How to Repeat the Checks

Observed prerequisite: PowerShell `7.6.4` in the recorded environment. From the foundation's root, first read the code and run the following procedure. This mechanism executes reviewed local content; it is not a safe loader for external documents. It extracts this file's single `powershell` block without creating a program on disk.

```text
$coreDocument = Get-Content -LiteralPath 'docs/core-verification.en-US.md' -Raw -Encoding UTF8
$coreBlocks = [regex]::Matches($coreDocument, '(?ms)^\x60{3}powershell\r?\n(.*?)^\x60{3}')
if ($coreBlocks.Count -ne 1) { throw 'Expected exactly one model block' }
& ([scriptblock]::Create($coreBlocks[0].Groups[1].Value))
```

Expected result: `Result = PASS`, `Checks = 80`, and the case names. The English version must produce the same result. Also run the previous 17-check procedure to detect regressions in those models. Repeat the eight documentary scenarios by reading the obligations and their conditions, not by executing this block.

## Execution Record and Limitations

- Date: `2026-09-02`; examined revision: `0.1.0-draft.3`.
- Responsible party: development assistant with assisted cross-review of contracts and translation; no user approval or independent audit.
- Observed environment: PowerShell `7.6.4`, Windows NT `10.0.26200.0`.
- Method: extraction and execution of the block from both language files using the documented procedure; comparison of code, results, and hashes.
- Result: `PASS`, 80 checks in each language. This is one set of 80 cases, not 160. The 17 initial checks were also repeated successfully in both languages: 97 model checks in total.
- New block identity: SHA-256 `5a5666893d63ff5ffc205fdbf1c177cb6dc7a219326fdf52076a7868e21e0be9`, block content without fences, UTF-8 with LF endings including the final newline. It matches between languages; it does not identify a complete approved release.
- Documentary review: eight scenarios examined; no material contradictions were detected in those cases. This result is text review, not execution of product controls.
- Preparation correction: a cultural text comparison was replaced with ordinal comparison before and after NFC; the explanation and both models were aligned. A cultural comparison could treat different sequences as equivalent and invalidate the pre-normalization identity check.
- Not executed: real operating-system resource, network, physical backup/restoration, thread or process concurrency, interface, performance, or consumer-platform tests. Models are not recorded as those tests.

This evidence does not establish numeric limits across all languages, full format conformance, real clocks or time zones, interprocess coordination, operating-system resource cleanup, physical restoration, production performance, or working interfaces. Library results are limited to the stated environment. Assisted review does not replace responsibility for human review and approval. The foundation is not declared stable, and none of its elements is approved.
