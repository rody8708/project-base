# Comprobaciones de la documentación

Versión del borrador: `0.1.0-draft.4`  
Estado: propuesta; no aprobada para adopción estable.  
Idioma: español latinoamericano (`es-419`)  
[Versión en inglés de Estados Unidos](document-checks.en-US.md) · [Inicio](../README.es-419.md) · [Entrega](release-readiness.es-419.md)

## Alcance y preparación

Este control de mantenimiento comprueba la estructura de esta revisión: 32 Markdown, 16 pares, 39 identificadores, 39 filas revisadas documentalmente y 31 entradas de fuentes por idioma. Lee exclusivamente los Markdown de la raíz y de las carpetas planas `docs` y `templates`; los archivos generados en `releases` y `.validation` no forman parte del contenido fuente. Modificar el inventario exige actualizar y revisar este control.

Entorno comprobado: PowerShell 7.6.4, .NET 10.0.10 y Windows 10.0.26200. No se requieren módulos, servicios, secretos, perfiles de usuario ni conexión de red. Se necesita una instalación autorizada de PowerShell y permiso de lectura. No se afirma haber instalado PowerShell desde cero ni haber verificado otros entornos. Para repetir, abrir una sesión `pwsh -NoProfile`, situarse en la raíz de una copia recuperada y ejecutar el bloque de abajo. Un error produce una excepción; solo el objeto con `Result=PASS` indica éxito.

No es un analizador Markdown general, una auditoría de seguridad ni un verificador automático de significado. La comparación de enlaces/estructura/código no acredita traducción correcta o respaldo de las citas: esas revisiones se registran por separado en [aplicabilidad](applicability.es-419.md) y [trazabilidad](traceability.es-419.md). No se ejecuta código de documentos descargados sin revisar y verificar previamente su identidad.

## Control reproducible

```powershell
$ErrorActionPreference = 'Stop'
$rootPath = (Get-Location).Path
$utf8 = [System.Text.UTF8Encoding]::new($false, $true)
$docs = @{}
$files = @(
    Get-ChildItem -LiteralPath $rootPath -File -Filter '*.md' | ForEach-Object {$_.Name}
    foreach ($folder in @('docs','templates')) {
        Get-ChildItem -LiteralPath (Join-Path $rootPath $folder) -File -Filter '*.md' | ForEach-Object { "$folder/" + $_.Name }
    }
)
function Require([bool]$Ok,[string]$Reason) { if (-not $Ok) { throw $Reason } }
Require ($files.Count -eq 32) 'Expected 32 Markdown files'
foreach ($file in $files) {
    $path = [IO.Path]::GetFullPath((Join-Path $rootPath $file))
    $body = [IO.File]::ReadAllText($path,$utf8)
    $docs[$path] = $body
    Require ($file -match '\.(es-419|en-US)\.md$') "Invalid filename $file"
    $locale = $Matches[1]
    $head = (($body -split '\r?\n') | Select-Object -First 6) -join ' '
    Require ($head -match '\x600\.1\.0-draft\.4\x60' -and $head.Contains($locale)) "Invalid metadata $file"
    $status = if ($locale -eq 'es-419') {'Estado: propuesta; no aprobada para adopción estable.'} else {'Status: proposal; not approved for stable adoption.'}
    Require ($head.Contains($status)) "Invalid state $file"
    Require (([regex]::Matches($body,'(?m)^# ')).Count -eq 1) "Invalid H1 $file"
    $lines = $body -split '\r?\n'
    $inCode = $false
    for ($line=0; $line -lt $lines.Count; $line++) {
        if ($lines[$line] -match '^\x60{3}') { $inCode = -not $inCode; continue }
        if (-not $inCode -and $lines[$line] -match '^#{1,6} ') {
            Require ($line+1 -lt $lines.Count -and [string]::IsNullOrWhiteSpace($lines[$line+1])) "Missing blank after heading in $file"
        }
    }
    Require (-not $inCode) "Unclosed fence $file"
}
$localLinks=0
$externalLinks=0
foreach ($path in $docs.Keys) {
    foreach ($match in [regex]::Matches($docs[$path],'\[[^\]\r\n]+\]\(([^)\r\n]+)\)')) {
        $target=$match.Groups[1].Value
        if ($target -match '^https?://') { $externalLinks++; continue }
        $parts=$target -split '#',2
        $dest=if ($parts[0] -eq '') {$path} else {[IO.Path]::GetFullPath((Join-Path (Split-Path $path -Parent) $parts[0]))}
        Require ($docs.ContainsKey($dest)) "Missing local target $target in $path"
        if ($parts.Count -eq 2) {
            $anchors=@([regex]::Matches($docs[$dest],'(?m)^#{1,6} (.+?)\r?$') | ForEach-Object { ($_.Groups[1].Value.ToLowerInvariant() -replace '[^\p{L}\p{Nd}\- ]','') -replace ' ','-' })
            Require ($anchors -contains $parts[1]) "Missing anchor $target in $path"
        }
        $localLinks++
    }
}
$esFiles=@($docs.Keys | Where-Object {$_ -match '\.es-419\.md$'})
Require ($esFiles.Count -eq 16) 'Expected 16 language pairs'
foreach ($es in $esFiles) {
    $en=$es -replace '\.es-419\.md$','.en-US.md'
    Require ($docs.ContainsKey($en)) "Missing counterpart $es"
    foreach ($pattern in @('(?m)^#{1,6} ','(?m)^- ','(?m)^\d+\. ','(?m)^\|','(?m)^\x60{3}')) {
        Require (([regex]::Matches($docs[$es],$pattern)).Count -eq ([regex]::Matches($docs[$en],$pattern)).Count) "Structure mismatch $es"
    }
    $linkLists=@()
    foreach ($p in @($es,$en)) {
        $linkLists += [string]::Join('|',@([regex]::Matches($docs[$p],'\[[^\]\r\n]+\]\(([^)\r\n]+)\)') | ForEach-Object { $_.Groups[1].Value -replace '\.(es-419|en-US)\.md','.locale.md' }))
    }
    Require ([string]::Equals($linkLists[0],$linkLists[1],[StringComparison]::Ordinal)) "Link parity mismatch $es"
}
$allIds=@{}
$allStates=@{}
foreach ($locale in @('es-419','en-US')) {
    $ids=@()
    foreach ($stem in @('docs/immutable-rules','docs/programming-fundamentals','docs/development-workflow','docs/platform-guidelines','templates/project-brief')) {
        $key=[IO.Path]::GetFullPath((Join-Path $rootPath "$stem.$locale.md"))
        $ids+=@([regex]::Matches($docs[$key],'(?m)^## ((?:RULE|FUND|FLOW|PLAT|BRIEF)-\d{3}) ') | ForEach-Object {$_.Groups[1].Value})
    }
    Require ($ids.Count -eq 39 -and @($ids | Sort-Object -Unique).Count -eq 39) "Canonical IDs mismatch $locale"
    $allIds[$locale]=[string]::Join('|',$ids)
    $key=[IO.Path]::GetFullPath((Join-Path $rootPath "docs/traceability.$locale.md"))
    $trace=$docs[$key]
    $rows=[regex]::Matches($trace,'(?m)^\| ((?:RULE|FUND|FLOW|PLAT|BRIEF)-\d{3}) \| (.*?) \| (.*?) \| (.*?) \| \x60(proposed|document-reviewed)\x60 \|\r?$')
    Require ($rows.Count -eq 39) "Trace row mismatch $locale"
    $rowIds=@($rows | ForEach-Object {$_.Groups[1].Value})
    Require (([string]::Join('|',@($rowIds | Sort-Object))) -eq ([string]::Join('|',@($ids | Sort-Object)))) "Trace IDs mismatch $locale"
    Require (([regex]::Matches($trace,'(?m)^### SRC-')).Count -eq 31) "Source count mismatch $locale"
    Require (([regex]::Matches($trace,'(?m)^\| REQ-U-')).Count -eq 4) "User requirement count mismatch $locale"
    $states=@($rows | ForEach-Object {$_.Groups[5].Value})
    Require (@($states | Where-Object {$_ -eq 'document-reviewed'}).Count -eq 39) "Reviewed count mismatch $locale"
    Require (@($states | Where-Object {$_ -eq 'proposed'}).Count -eq 0) "Proposed count mismatch $locale"
    $allStates[$locale]=[string]::Join('|',@($rows | ForEach-Object {$_.Groups[1].Value+':'+$_.Groups[5].Value}))
}
Require ($allIds['es-419'] -eq $allIds['en-US']) 'ID order differs'
Require ($allStates['es-419'] -eq $allStates['en-US']) 'States differ'
foreach ($stem in @('docs/programming-fundamentals','docs/fundamentals-verification','docs/core-verification','docs/data-and-time','docs/failures-and-resources','docs/release-tools','docs/document-checks')) {
    $blocks=@()
    foreach ($locale in @('es-419','en-US')) {
        $key=[IO.Path]::GetFullPath((Join-Path $rootPath "$stem.$locale.md"))
        $blocks+=[string]::Join('|',@([regex]::Matches($docs[$key],'(?ms)^\x60{3}(?:text|powershell)\r?\n(.*?)^\x60{3}') | ForEach-Object { ($_.Groups[1].Value -replace '\r\n',[char]10) -replace '\.(es-419|en-US)\.md','.locale.md' }))
    }
    Require ([string]::Equals($blocks[0],$blocks[1],[StringComparison]::Ordinal)) "Code block parity mismatch $stem"
}
[pscustomobject]@{Result='PASS'; MarkdownFiles=$files.Count; LanguagePairs=$esFiles.Count; CanonicalIdsPerLanguage=39; TraceRowsPerLanguage=39; SourceEntriesPerLanguage=31; DocumentReviewedPerLanguage=39; ProposedPerLanguage=0; LocalLinksAndAnchors=$localLinks; ExternalLinkOccurrences=$externalLinks} | ConvertTo-Json
```

## Pruebas negativas del control

Después del bloque anterior, ejecutar este segundo bloque desde la misma raíz. Inyecta cinco defectos únicamente en los datos leídos en memoria; no modifica archivos. Exige rechazar un enlace local roto, una revisión incorrecta, una fila de trazabilidad sin revisión, un cambio de mayúsculas en un literal y un inventario de pares incompleto, con el motivo esperado. Los últimos dos casos son regresiones: bloques y enlaces se comparan de forma ordinal y se exigen 16 pares, no solo 32 archivos. Estas pruebas no convierten el control en un analizador general.

```powershell
$ErrorActionPreference = 'Stop'
$checkDocument = Get-Content -LiteralPath 'docs/document-checks.es-419.md' -Raw -Encoding UTF8
$checkBlocks = [regex]::Matches($checkDocument, '(?ms)^\x60{3}powershell\r?\n(.*?)^\x60{3}')
if ($checkBlocks.Count -ne 2) { throw 'Expected check and mutation-test blocks' }
$baseCheck = $checkBlocks[0].Groups[1].Value
$readStatement = '$body = [IO.File]::ReadAllText($path,$utf8)'
$mutations = @(
    @{Name='broken-local-link';Expected='Missing local target';Code='if ($file -eq "README.es-419.md") { $body = $body.Replace("(README.en-US.md)","(missing.en-US.md)") }'},
    @{Name='wrong-revision';Expected='Invalid metadata';Code='if ($file -eq "README.es-419.md") { $body = $body.Replace("0.1.0-draft.4","0.1.0-draft.999") }'},
    @{Name='unreviewed-row';Expected='Reviewed count mismatch';Code='if ($file -eq "docs/traceability.es-419.md") { $body = [regex]::Replace($body,"(?m)^\| RULE-001 .+$", {param($match) $match.Value.Replace("document-reviewed","proposed")}) }'},
    @{Name='case-sensitive-code';Expected='Code block parity mismatch';Code='if ($file -eq "docs/core-verification.es-419.md") { $body = $body.Replace("Written","written") }'},
    @{Name='missing-language-pair';Expected='Expected 16 language pairs';Anchor='$esFiles=@($docs.Keys | Where-Object {$_ -match ''\.es-419\.md$''})';Code='$esFiles = @($esFiles | Select-Object -First 15)'}
)
$results = @()
foreach ($mutation in $mutations) {
    $injectionPoint = if ($mutation.ContainsKey('Anchor')) { $mutation.Anchor } else { $readStatement }
    if (-not $baseCheck.Contains($injectionPoint)) { throw 'Missing mutation injection point' }
    $mutatedCheck = $baseCheck.Replace($injectionPoint,$injectionPoint + [Environment]::NewLine + $mutation.Code)
    $rejected = $false
    try { $null = & ([scriptblock]::Create($mutatedCheck)) } catch {
        if (-not $_.Exception.Message.Contains($mutation.Expected)) { throw }
        $rejected = $true
    }
    if (-not $rejected) { throw ('Undetected mutation: ' + $mutation.Name) }
    $results += $mutation.Name
}
[pscustomobject]@{Result='PASS';MutationChecks=$results.Count;Cases=$results;SourceFilesChanged=$false} | ConvertTo-Json
```

## Evidencia y límites

La evidencia final de ejecución está en el [registro de entrega](release-readiness.es-419.md). Las comprobaciones de los 17 modelos iniciales y 80 del núcleo se ejecutan por separado desde sus documentos; comprobar que los bloques coinciden no equivale a ejecutarlos. Los recuentos duplicados por idioma no se suman como casos independientes. El control no consulta enlaces externos ni impone una herramienta a los proyectos consumidores.
