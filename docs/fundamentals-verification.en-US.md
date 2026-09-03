# Fundamentals Model Verification

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](fundamentals-verification.es-419.md) · [Home](../README.en-US.md) · [Fundamentals](programming-fundamentals.en-US.md) · [Governance](foundation-governance.en-US.md)

## Scope and Criteria

This local exercise checks models of FUND-001, FUND-003, and FUND-006, not product components. It does not create files, access the network, or install dependencies. PowerShell was chosen because it is available in the review environment; it is not imposed on consumer projects.

| Model | Enumerated cases | Criterion |
| --- | --- | --- |
| FUND-001 | Zero, an exact multiple, a remainder, a negative count, zero capacity, and truncated division. | Five correct results and detection of the faulty variant. |
| FUND-003 | Empty sequence, later negative value, zero, initial negative value, missing data, and faulty progress. | Five correct results and detection of stalled progress with a step limit. |
| FUND-006 | Orders A→B and B→A, zero capacity, negative capacity, and two reads before the writes. | Each serial order has one acceptance and one rejection; detect two acceptances for one slot. |

Exercise acceptance requires 17 passing checks, including three that detect deliberate defects. A passing result means the defect was detected, not that its implementation is correct. The code uses only the enumerated small values. The missing-data and negative-capacity guards extend the executable model: they are not general type tests or complete equivalence with the pseudocode.

## Executable Model

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

## How to Repeat It

From this foundation's root, first review the block above and run the following in PowerShell. Only execute local content you have read and reviewed; this mechanism is not a safe loader for third-party documents. It extracts the single `powershell` block and runs it without generating a program file.

```text
$modelDocument = Get-Content -LiteralPath 'docs/fundamentals-verification.en-US.md' -Raw -Encoding UTF8
$modelMatch = [regex]::Match($modelDocument, '(?ms)^\x60{3}powershell\r?\n(.*?)^\x60{3}')
if (-not $modelMatch.Success) { throw 'Model block not found' }
& ([scriptblock]::Create($modelMatch.Groups[1].Value))
```

Expected result: `Result = PASS`, `Checks = 17`, and `DeliberateDefectsDetected = 3`, with the case names. A failure stops execution through an exception. Repeating with the English file must produce the same result; the model blocks are identical.

## Historical Execution Record 0.1.0-draft.2

- Date: `2026-09-02`; examined revision: `0.1.0-draft.2`.
- Responsible party: development assistant; this is not user approval or an independent review.
- Observed environment: PowerShell `7.6.4`, Windows NT `10.0.26200.0`.
- Executed method: extraction and execution of the block using the procedure above, from each language file; comparison of code and results.
- Observed result in both languages: `PASS`, 17 passing checks, and 3 deliberate defects detected. These are not 34 distinct cases: both files contain the same model.
- Model identity: SHA-256 `7e4b2febfdcd50057a85a2887cc746e997e4fe8708eddda97a21fc0a51d00277`, computed over the block's content without its Markdown fences, in UTF-8 with LF line endings and the final newline included. This hash identifies the example, not an approved release.
- Not executed: the other examples, product tests, real concurrency, interfaces, or platform compatibility. No failures remain among the 17 enumerated cases; the limitations below remain open.

## Limits of This Evidence

The four-step limit prevents the faulty exercise from hanging; it is not a time budget or suitable for arbitrary inputs. The serial orders and interleaving are deterministic simulations: they do not run real threads or test reentrancy, durability, retries, resources, or platforms. The numerical example also does not test precision for all integers or conversions of external inputs.

The historical record covers the initial scope of three fundamentals. Revision `0.1.0-draft.3` expands models and scenarios in [core verification](core-verification.en-US.md). These checks do not grant any fundamental the status `validated-in-scope` or `approved`, or turn the draft into a stable release. Full evaluation requires resolving the element's limitations and meeting the governance conditions.

## Rerun in 0.1.0-draft.3

- Date: `2026-09-02`; same procedure, PowerShell `7.6.4`, and Windows NT `10.0.26200.0`.
- Result: 17 passing checks in each language and three deliberate defects detected. Running two files does not duplicate cases.
- The block retains the previous record's hash; its code was not modified. Revision `.3` updates metadata and references to the expanded checks.
- These models retain their limitations; no products are tested and no release is approved.
