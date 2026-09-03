# Candidate Preservation and Verification Tools

Draft revision: `0.1.0-draft.4`  
Status: proposal; not approved for stable adoption.  
Language: US English (`en-US`)  
[Latin American Spanish version](release-tools.es-419.md) · [Home](../README.en-US.md) · [Governance](foundation-governance.en-US.md)

## Scope and Trust Limits

This code maintains the foundation itself: it starts no consuming application and selects no technology for one. It implements a local candidate format, not an external standard. It collects only the two language README files and flat Markdown files in `docs/` and `templates/`; it excludes `releases/`, `.validation/`, and other files. It rejects subdirectories within those two folders and names outside its allowed character set.

The intended environment is PowerShell 7.6.4 and .NET 10 on Windows. No dependencies are installed. Checking that environment does not prove a clean installation or support for other systems. Work in a trusted directory without simultaneous adversarial modifications: path checks are not a complete defense against operating-system races. Do not execute blocks from external documents without review.

An explicitly supplied SHA-256 enables identity comparison; it does not authenticate its provider. Obtain the expected value and any approval through a separate trusted channel. The manifest excludes itself from its own list: it contains exactly the documents, while the external hash covers the entire ZIP, including that manifest. Manifest status describes the time of packaging. No function grants approval; the external receipt follows governance.

The read-only guard reduces accidental changes; it is not WORM storage, a signature, or protection against a person with permissions. Keeping copies and the trusted record remains a publication-process responsibility. Limits are 128 documents, 1 MiB per entry, 15 MiB of source documents, and 16 MiB of ZIP or expanded content.

## Operations and Checks

`New-FoundationCandidate` captures each file once and uses those same bytes for its hash and ZIP; it checks pairs and editorial revision. Stop corpus changes when preparing a candidate for approval: sequential capture is not a global snapshot. The output directory must exist. It creates the file without overwriting, verifies it, and then sets read-only. An error may leave a partial ZIP that must not be treated as a verified candidate. New file or folder names allow ASCII letters, digits, periods, hyphens, and underscores; they exclude reserved devices, alternate streams, and trailing periods.

`Test-FoundationCandidate` requires the expected hash, reads the hash and ZIP from the same open file without write sharing, and checks names, links, sizes, schema, exact membership, and every hash. It optionally recovers all members, including the manifest, into a new directory after validating everything. It never overwrites files. A write error may leave a partial recovery; it is reported and retained for inspection, not declared successful or deleted automatically.

`Test-FoundationReleaseTools` creates isolated trials under `.validation/fixture-UUID/`. It retains test ZIPs, recovery output, and a directory link pointing to an empty folder within that same fixture, never to the corpus. It deletes nothing and does not change source documents. Rejections are accepted only for the expected error code. An altered fixture's expected value is deliberately calculated to test internal validation; it is not approval of that file.

## Maintenance Block

```powershell
function Get-FoundationDigest([byte[]]$Bytes) {
    return [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($Bytes)).ToLowerInvariant()
}
function Assert-FoundationPlainPath([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path)) { throw 'FND-PATH: empty path' }
    $full = [IO.Path]::GetFullPath($Path)
    $current = $full
    while ($current) {
        if (-not [IO.File]::Exists($current) -and -not [IO.Directory]::Exists($current)) { throw 'FND-PATH: missing path' }
        $attributes = [IO.File]::GetAttributes($current)
        if (($attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'FND-REPARSE: links are not allowed' }
        $parent = [IO.Directory]::GetParent($current)
        $current = if ($null -eq $parent) { $null } else { $parent.FullName }
    }
    return $full
}
function Test-FoundationMemberName([string]$Name) {
    return $Name.Length -le 160 -and $Name -cmatch '^(README\.(es-419|en-US)\.md|(docs|templates)/[a-z0-9]+(-[a-z0-9]+)*\.(es-419|en-US)\.md)$'
}
function Get-FoundationNewTarget([string]$Path) {
    $full = [IO.Path]::GetFullPath($Path)
    $leaf = [IO.Path]::GetFileName($full)
    if ($leaf -notmatch '^[A-Za-z0-9][A-Za-z0-9._-]*$' -or $leaf.EndsWith('.') -or $leaf -match '^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)') { throw 'FND-TARGET: unsupported output name' }
    $parent = Assert-FoundationPlainPath ([IO.Path]::GetDirectoryName($full))
    if (-not [IO.Directory]::Exists($parent)) { throw 'FND-TARGET: parent must be a directory' }
    return $full
}
function Assert-FoundationRevision([string]$Revision) {
    if ($Revision -cnotmatch '^0\.1\.0-draft\.[1-9][0-9]*$' -or $Revision.Length -gt 80) { throw 'FND-REVISION: invalid revision' }
}
function Assert-FoundationDocument([string]$Name,[byte[]]$Bytes,[string]$Revision) {
    $decoder = [Text.UTF8Encoding]::new($false,$true)
    try { $text = $decoder.GetString($Bytes) } catch { throw 'FND-DOCUMENT: invalid UTF-8' }
    $label = if ($Name.EndsWith('.es-419.md',[StringComparison]::Ordinal)) { 'Versión del borrador: ' } else { 'Draft revision: ' }
    $pattern = '(?m)^' + [regex]::Escape($label) + '\x60' + [regex]::Escape($Revision) + '\x60[ \t]*\r?$'
    if (-not [regex]::IsMatch($text,$pattern)) { throw 'FND-DOCUMENT: revision mismatch' }
}
function Assert-FoundationPairs([string[]]$Names) {
    $set = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach ($name in $Names) { if (-not $set.Add($name)) { throw 'FND-FILE-SET: duplicate name' } }
    foreach ($required in @('README.es-419.md','README.en-US.md')) {
        if (-not $set.Contains($required)) { throw 'FND-FILE-SET: missing README' }
    }
    foreach ($name in $Names) {
        $other = if ($name.EndsWith('.es-419.md',[StringComparison]::Ordinal)) {
            $name.Substring(0,$name.Length-10) + '.en-US.md'
        } else { $name.Substring(0,$name.Length-9) + '.es-419.md' }
        if (-not $set.Contains($other)) { throw 'FND-FILE-SET: missing language counterpart' }
    }
}
function Read-FoundationSourceFile([string]$Path) {
    $full = Assert-FoundationPlainPath $Path
    $stream = [IO.FileStream]::new($full,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::None)
    try {
        if ($stream.Length -gt 1048576) { throw 'FND-SOURCE-LIMIT: file too large' }
        $bytes = [byte[]]::new([int]$stream.Length)
        $stream.ReadExactly($bytes,0,$bytes.Length)
        return ,$bytes
    } finally { $stream.Dispose() }
}
function Write-FoundationRawZip([string]$Path,[object[]]$Entries) {
    $stream = [IO.FileStream]::new($Path,[IO.FileMode]::CreateNew,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
    try {
        $archive = [IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Create,$true)
        try {
            foreach ($item in $Entries) {
                $entry = $archive.CreateEntry($item.Name,[IO.Compression.CompressionLevel]::Optimal)
                $entry.ExternalAttributes = [int]$item.Attributes
                $entryStream = $entry.Open()
                try { $entryStream.Write([byte[]]$item.Bytes,0,$item.Bytes.Length) } finally { $entryStream.Dispose() }
            }
        } finally { $archive.Dispose() }
    } finally { $stream.Dispose() }
}
function New-FoundationCandidate {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$SourceRoot,[Parameter(Mandatory)][string]$OutputPath,
          [Parameter(Mandatory)][string]$Revision)
    Assert-FoundationRevision $Revision
    $root = Assert-FoundationPlainPath $SourceRoot
    if (-not [IO.Directory]::Exists($root)) { throw 'FND-PATH: source must be a directory' }
    $output = Get-FoundationNewTarget $OutputPath
    if ([IO.File]::Exists($output) -or [IO.Directory]::Exists($output)) { throw 'FND-OUTPUT-EXISTS: no overwrite' }
    if ([IO.Path]::GetExtension($output) -cne '.zip') { throw 'FND-PATH: output must end in .zip' }
    $names = [Collections.Generic.List[string]]::new()
    $names.Add('README.es-419.md'); $names.Add('README.en-US.md')
    foreach ($directory in @('docs','templates')) {
        $directoryPath = Assert-FoundationPlainPath ([IO.Path]::Combine($root,$directory))
        foreach ($child in [IO.Directory]::EnumerateFileSystemEntries($directoryPath)) {
            $null = Assert-FoundationPlainPath $child
            if ([IO.Directory]::Exists($child)) { throw 'FND-SOURCE-LAYOUT: nested directories are excluded' }
            if ([IO.Path]::GetExtension($child) -ieq '.md') {
                $relative = $directory + '/' + [IO.Path]::GetFileName($child)
                if (-not (Test-FoundationMemberName $relative)) { throw 'FND-PATH: unsupported document name' }
                $names.Add($relative)
            }
        }
    }
    if ($names.Count -gt 128) { throw 'FND-SOURCE-LIMIT: too many documents' }
    $sorted = $names.ToArray()
    [Array]::Sort($sorted,[StringComparer]::Ordinal)
    Assert-FoundationPairs $sorted
    $entries = [Collections.Generic.List[object]]::new()
    $records = [Collections.Generic.List[object]]::new()
    $total = [long]0
    foreach ($name in $sorted) {
        $bytes = Read-FoundationSourceFile ([IO.Path]::Combine($root,$name))
        Assert-FoundationDocument $name $bytes $Revision
        $total += $bytes.Length
        if ($total -gt 15728640) { throw 'FND-SOURCE-LIMIT: total content too large' }
        $entries.Add(@{Name=$name;Bytes=$bytes;Attributes=0})
        $records.Add([ordered]@{path=$name;length=$bytes.Length;sha256=(Get-FoundationDigest $bytes)})
    }
    $manifest = [ordered]@{formatVersion=1;documentRevision=$Revision;status='candidate-unapproved-at-packaging';files=$records.ToArray()}
    $manifestBytes = [Text.UTF8Encoding]::new($false).GetBytes(($manifest | ConvertTo-Json -Depth 6 -Compress))
    $entries.Add(@{Name='manifest.json';Bytes=$manifestBytes;Attributes=0})
    Write-FoundationRawZip $output $entries.ToArray()
    $stream = [IO.FileStream]::new($output,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::None)
    try { $digest = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($stream)).ToLowerInvariant() }
    finally { $stream.Dispose() }
    $null = Test-FoundationCandidate -ArchivePath $output -ExpectedSha256 $digest
    [IO.File]::SetAttributes($output,([IO.File]::GetAttributes($output) -bor [IO.FileAttributes]::ReadOnly))
    return [pscustomobject]@{Result='CandidateCreated';Path=$output;Sha256=$digest;Revision=$Revision;Documents=$records.Count;Approval='NotGranted'}
}
function Assert-FoundationJsonMembers($Element,[string[]]$Expected) {
    if ($Element.ValueKind -ne [Text.Json.JsonValueKind]::Object) { throw 'FND-MANIFEST-SCHEMA: object required' }
    $actual = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach ($property in $Element.EnumerateObject()) {
        if (-not $actual.Add($property.Name) -or $property.Name -cnotin $Expected) { throw 'FND-MANIFEST-SCHEMA: unexpected or duplicate property' }
    }
    if ($actual.Count -ne $Expected.Count) { throw 'FND-MANIFEST-SCHEMA: missing property' }
}
function Test-FoundationCandidate {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$ArchivePath,[Parameter(Mandatory)][string]$ExpectedSha256,
          [string]$RecoveryPath)
    if ($ExpectedSha256 -notmatch '^[0-9a-fA-F]{64}$') { throw 'FND-HASH-FORMAT: explicit SHA-256 required' }
    $path = Assert-FoundationPlainPath $ArchivePath
    $stream = [IO.FileStream]::new($path,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
    $payloads = [Collections.Generic.Dictionary[string,byte[]]]::new([StringComparer]::Ordinal)
    try {
        if ($stream.Length -gt 16777216) { throw 'FND-ZIP-LIMIT: archive too large' }
        $actualDigest = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($stream)).ToLowerInvariant()
        if ($actualDigest -cne $ExpectedSha256.ToLowerInvariant()) { throw 'FND-HASH-MISMATCH: archive differs from expected digest' }
        $stream.Position = 0
        $archive = [IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Read,$true)
        try {
            if ($archive.Entries.Count -gt 129) { throw 'FND-ZIP-LIMIT: too many entries' }
            $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
            $total = [long]0
            foreach ($entry in $archive.Entries) {
                $name = $entry.FullName
                if (-not $seen.Add($name)) { throw 'FND-ZIP-DUPLICATE: duplicate or case-colliding entry' }
                if ($name -cne 'manifest.json' -and -not (Test-FoundationMemberName $name)) { throw 'FND-PATH: unsafe archive member' }
                $unixType = ($entry.ExternalAttributes -shr 16) -band 61440
                if (($unixType -ne 0 -and $unixType -ne 32768) -or (($entry.ExternalAttributes -band 1040) -ne 0)) {
                    throw 'FND-ZIP-LINK: link, directory, or special entry rejected'
                }
                if ($entry.Length -lt 0 -or $entry.Length -gt 1048576) { throw 'FND-ZIP-LIMIT: entry too large' }
                $total += $entry.Length
                if ($total -gt 16777216) { throw 'FND-ZIP-LIMIT: expanded content too large' }
                $entryStream = $entry.Open()
                $memory = [IO.MemoryStream]::new()
                try {
                    $buffer = [byte[]]::new(8192)
                    while (($read = $entryStream.Read($buffer,0,$buffer.Length)) -gt 0) {
                        if ($memory.Length + $read -gt 1048576) { throw 'FND-ZIP-LIMIT: decompression limit exceeded' }
                        $memory.Write($buffer,0,$read)
                    }
                    if ($memory.Length -ne $entry.Length) { throw 'FND-FILE-LENGTH: entry length mismatch' }
                    $payloads.Add($name,$memory.ToArray())
                } finally { $memory.Dispose(); $entryStream.Dispose() }
            }
        } finally { $archive.Dispose() }
    } finally { $stream.Dispose() }
    if (-not $payloads.ContainsKey('manifest.json')) { throw 'FND-FILE-SET: missing manifest' }
    try { $manifestText = [Text.UTF8Encoding]::new($false,$true).GetString($payloads['manifest.json']) }
    catch { throw 'FND-MANIFEST-SCHEMA: manifest is not UTF-8' }
    try { $json = [Text.Json.JsonDocument]::Parse($manifestText) }
    catch { throw 'FND-MANIFEST-SCHEMA: malformed JSON' }
    try {
        $root = $json.RootElement
        Assert-FoundationJsonMembers $root @('formatVersion','documentRevision','status','files')
        $format = $root.GetProperty('formatVersion')
        $formatNumber = 0
        if ($format.ValueKind -ne [Text.Json.JsonValueKind]::Number -or -not $format.TryGetInt32([ref]$formatNumber) -or $formatNumber -ne 1) { throw 'FND-MANIFEST-SCHEMA: unsupported format' }
        $revisionElement = $root.GetProperty('documentRevision')
        $statusElement = $root.GetProperty('status')
        if ($revisionElement.ValueKind -ne [Text.Json.JsonValueKind]::String -or $statusElement.ValueKind -ne [Text.Json.JsonValueKind]::String) { throw 'FND-MANIFEST-SCHEMA: strings required' }
        $revision = $revisionElement.GetString()
        Assert-FoundationRevision $revision
        if ($statusElement.GetString() -cne 'candidate-unapproved-at-packaging') { throw 'FND-MANIFEST-SCHEMA: invalid packaging status' }
        $files = $root.GetProperty('files')
        if ($files.ValueKind -ne [Text.Json.JsonValueKind]::Array -or $files.GetArrayLength() -gt 128) { throw 'FND-MANIFEST-SCHEMA: invalid file array' }
        $manifestNames = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
        foreach ($file in $files.EnumerateArray()) {
            Assert-FoundationJsonMembers $file @('path','length','sha256')
            $nameElement = $file.GetProperty('path')
            $hashElement = $file.GetProperty('sha256')
            $lengthElement = $file.GetProperty('length')
            if ($nameElement.ValueKind -ne [Text.Json.JsonValueKind]::String -or $hashElement.ValueKind -ne [Text.Json.JsonValueKind]::String) { throw 'FND-MANIFEST-SCHEMA: file strings required' }
            $name = $nameElement.GetString()
            $hash = $hashElement.GetString()
            $length = [long]0
            if (-not (Test-FoundationMemberName $name) -or -not $manifestNames.Add($name)) { throw 'FND-MANIFEST-SCHEMA: invalid or duplicate file path' }
            if ($hash -cnotmatch '^[0-9a-f]{64}$' -or $lengthElement.ValueKind -ne [Text.Json.JsonValueKind]::Number -or -not $lengthElement.TryGetInt64([ref]$length) -or $length -lt 0 -or $length -gt 1048576) { throw 'FND-MANIFEST-SCHEMA: invalid hash or length' }
            if (-not $payloads.ContainsKey($name)) { throw 'FND-FILE-SET: missing listed file' }
            $bytes = $payloads[$name]
            if ($bytes.Length -ne $length) { throw 'FND-FILE-LENGTH: manifest length mismatch' }
            if ((Get-FoundationDigest $bytes) -cne $hash) { throw 'FND-FILE-HASH: document differs from manifest' }
            Assert-FoundationDocument $name $bytes $revision
        }
        if ($payloads.Count -ne $manifestNames.Count + 1) { throw 'FND-FILE-SET: unlisted entry' }
        Assert-FoundationPairs ([string[]]@($manifestNames))
        $documentCount = $manifestNames.Count
    } finally { $json.Dispose() }
    $recovered = $null
    if (-not [string]::IsNullOrWhiteSpace($RecoveryPath)) {
        $destination = Get-FoundationNewTarget $RecoveryPath
        if ([IO.Directory]::Exists($destination) -or [IO.File]::Exists($destination)) { throw 'FND-DESTINATION-EXISTS: recovery requires a new directory' }
        $null = New-Item -ItemType Directory -Path $destination -ErrorAction Stop
        try {
            foreach ($name in $payloads.Keys) {
                $target = [IO.Path]::Combine($destination,$name)
                $parent = [IO.Path]::GetDirectoryName($target)
                if (-not [IO.Directory]::Exists($parent)) { $null = [IO.Directory]::CreateDirectory($parent) }
                $null = Assert-FoundationPlainPath $parent
                $writer = [IO.FileStream]::new($target,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
                try { $writer.Write($payloads[$name],0,$payloads[$name].Length) } finally { $writer.Dispose() }
                if ((Get-FoundationDigest (Read-FoundationSourceFile $target)) -cne (Get-FoundationDigest $payloads[$name])) { throw 'FND-RECOVERY: written bytes differ' }
            }
        } catch { throw "FND-RECOVERY: incomplete destination retained for inspection; $($_.Exception.Message)" }
        $recovered = $destination
    }
    return [pscustomobject]@{Result='VerifiedCandidate';Path=$path;Sha256=$actualDigest;Revision=$revision;Documents=$documentCount;RecoveredTo=$recovered;Approval='NotEvaluated'}
}
function Test-FoundationReleaseTools {
    [CmdletBinding()]
    param([Parameter(Mandatory)][string]$SourceRoot,[Parameter(Mandatory)][string]$Revision)
    $root = Assert-FoundationPlainPath $SourceRoot
    $validation = [IO.Path]::Combine($root,'.validation')
    if (-not [IO.Directory]::Exists($validation)) { $null = [IO.Directory]::CreateDirectory($validation) }
    $null = Assert-FoundationPlainPath $validation
    $fixture = [IO.Path]::Combine($validation,'fixture-' + [guid]::NewGuid().ToString('N'))
    $null = New-Item -ItemType Directory -Path $fixture -ErrorAction Stop
    $checks = [Collections.Generic.List[string]]::new()
    function Confirm-ToolCase([string]$Name,[bool]$Condition) {
        if (-not $Condition) { throw "FND-TEST: $Name" }
        $checks.Add($Name)
    }
    function Confirm-ToolRejection([string]$Name,[string]$Code,[scriptblock]$Action) {
        $rejected = $false
        try { $null = & $Action } catch {
            if ($_.Exception.Message -notlike "*$Code*") { throw }
            $rejected = $true
        }
        Confirm-ToolCase $Name $rejected
    }
    $candidatePath = [IO.Path]::Combine($fixture,'candidate.zip')
    $candidate = New-FoundationCandidate -SourceRoot $root -OutputPath $candidatePath -Revision $Revision
    Confirm-ToolCase 'create candidate' ($candidate.Result -eq 'CandidateCreated' -and $candidate.Approval -eq 'NotGranted')
    $verified = Test-FoundationCandidate $candidatePath $candidate.Sha256
    Confirm-ToolCase 'verify exact archive' ($verified.Documents -eq $candidate.Documents -and $verified.Approval -eq 'NotEvaluated')
    Confirm-ToolCase 'accidental readonly guard' (([IO.File]::GetAttributes($candidatePath) -band [IO.FileAttributes]::ReadOnly) -ne 0)
    $recovery = [IO.Path]::Combine($fixture,'recovered')
    $result = Test-FoundationCandidate $candidatePath $candidate.Sha256 -RecoveryPath $recovery
    Confirm-ToolCase 'recover verified bytes' ($result.RecoveredTo -ceq $recovery)
    $baseline = [Collections.Generic.List[object]]::new()
    $archive = [IO.Compression.ZipFile]::OpenRead($candidatePath)
    try {
        foreach ($entry in $archive.Entries) {
            $memory = [IO.MemoryStream]::new()
            $reader = $entry.Open()
            try { $reader.CopyTo($memory); $baseline.Add(@{Name=$entry.FullName;Bytes=$memory.ToArray();Attributes=0}) }
            finally { $reader.Dispose(); $memory.Dispose() }
        }
    } finally { $archive.Dispose() }
    foreach ($item in $baseline) {
        if ((Get-FoundationDigest (Read-FoundationSourceFile ([IO.Path]::Combine($recovery,$item.Name)))) -cne (Get-FoundationDigest $item.Bytes)) { throw 'FND-TEST: recovered content mismatch' }
    }
    Confirm-ToolCase 'compare every recovered member' $true
    $wrong = if ($candidate.Sha256[0] -eq '0') { '1' + $candidate.Sha256.Substring(1) } else { '0' + $candidate.Sha256.Substring(1) }
    Confirm-ToolRejection 'wrong expected digest' 'FND-HASH-MISMATCH' { Test-FoundationCandidate $candidatePath $wrong }
    Confirm-ToolRejection 'existing output preserved' 'FND-OUTPUT-EXISTS' { New-FoundationCandidate $root $candidatePath $Revision }
    Confirm-ToolRejection 'alternate-stream output rejected' 'FND-TARGET' { New-FoundationCandidate $root ([IO.Path]::Combine($fixture,'candidate.zip:side.zip')) $Revision }
    Confirm-ToolRejection 'existing destination preserved' 'FND-DESTINATION-EXISTS' { Test-FoundationCandidate $candidatePath $candidate.Sha256 -RecoveryPath $recovery }
    $document = $baseline | Where-Object { $_.Name -cne 'manifest.json' } | Select-Object -First 1
    $altered = [byte[]]$document.Bytes.Clone()
    $altered[0] = $altered[0] -bxor 1
    $variants = @(
        @{Name='changed-document';Code='FND-FILE-HASH';Entries=@($baseline | ForEach-Object { if ($_.Name -ceq $document.Name) {@{Name=$_.Name;Bytes=$altered;Attributes=0}} else {$_} })},
        @{Name='extra';Code='FND-FILE-SET';Entries=$baseline.ToArray() + @(@{Name='docs/unlisted.es-419.md';Bytes=[byte[]](1);Attributes=0})},
        @{Name='missing';Code='FND-FILE-SET';Entries=@($baseline | Where-Object {$_.Name -cne $document.Name})},
        @{Name='duplicate';Code='FND-ZIP-DUPLICATE';Entries=$baseline.ToArray() + @($document)},
        @{Name='traversal';Code='FND-PATH';Entries=$baseline.ToArray() + @(@{Name='../outside.md';Bytes=[byte[]](1);Attributes=0})},
        @{Name='backslash';Code='FND-PATH';Entries=$baseline.ToArray() + @(@{Name='docs\outside.es-419.md';Bytes=[byte[]](1);Attributes=0})},
        @{Name='zip-link';Code='FND-ZIP-LINK';Entries=@($baseline | ForEach-Object { if ($_.Name -ceq $document.Name) {@{Name=$_.Name;Bytes=$_.Bytes;Attributes=-1610612736}} else {$_} })},
        @{Name='oversized-entry';Code='FND-ZIP-LIMIT';Entries=@($baseline | ForEach-Object { if ($_.Name -ceq $document.Name) {@{Name=$_.Name;Bytes=[byte[]]::new(1048577);Attributes=0}} else {$_} })}
    )
    foreach ($variant in $variants) {
        $variantPath = [IO.Path]::Combine($fixture,$variant.Name + '.zip')
        Write-FoundationRawZip $variantPath $variant.Entries
        $variantDigest = Get-FoundationDigest ([IO.File]::ReadAllBytes($variantPath))
        Confirm-ToolRejection $variant.Name $variant.Code { Test-FoundationCandidate $variantPath $variantDigest }
    }
    $changedPath = [IO.Path]::Combine($fixture,'changed-document.zip')
    Confirm-ToolRejection 'tampered archive against original digest' 'FND-HASH-MISMATCH' { Test-FoundationCandidate $changedPath $candidate.Sha256 }
    $linkTarget = [IO.Path]::Combine($fixture,'plain-link-target')
    $null = [IO.Directory]::CreateDirectory($linkTarget)
    $linkPath = [IO.Path]::Combine($fixture,'source-link')
    $null = New-Item -ItemType Junction -Path $linkPath -Target $linkTarget -ErrorAction Stop
    Confirm-ToolRejection 'source reparse point' 'FND-REPARSE' { New-FoundationCandidate $linkPath ([IO.Path]::Combine($fixture,'should-not-exist.zip')) $Revision }
    if ($checks.Count -ne 19) { throw 'FND-TEST: unexpected test count' }
    return [pscustomobject]@{Result='PASS';Checks=$checks.Count;Cases=$checks.ToArray();FixtureDirectory=$fixture;RetainedLink=$linkPath;LinkTarget=$linkTarget;Approval='NotGranted'}
}
```

## Intended Use

First read the complete block and load it from this reviewed file. It is the only `powershell` block; the following procedure writes no script to disk.

```text
$releaseDocument = Get-Content -LiteralPath 'docs/release-tools.en-US.md' -Raw -Encoding UTF8
$releaseBlocks = [regex]::Matches($releaseDocument, '(?ms)^\x60{3}powershell\r?\n(.*?)^\x60{3}')
if ($releaseBlocks.Count -ne 1) { throw 'Expected one maintenance block' }
. ([scriptblock]::Create($releaseBlocks[0].Groups[1].Value))
Test-FoundationReleaseTools -SourceRoot (Get-Location).Path -Revision '0.1.0-draft.4'
```

For a final candidate, use `New-FoundationCandidate` with explicit paths and a consistent revision, after documentary review. For verification or recovery, pass `-ExpectedSha256` obtained from the trusted source; do not automatically substitute a hash calculated from the received file. Consult the publication record for execution results and approval. This document does not declare a stable release.
