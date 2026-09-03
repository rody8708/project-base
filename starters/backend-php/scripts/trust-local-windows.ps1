param([Parameter(Mandatory=$true)][ValidatePattern('^foundation-php85-[0-9a-f]{16}$')][string]$Container)
$ErrorActionPreference = 'Stop'
# Explicit opt-in only. This modifies CurrentUser certificate stores, never LocalMachine.
$engine = & wsl.exe -d Ubuntu-24.04 -- docker context inspect --format '{{.Endpoints.docker.Host}}'
if ($LASTEXITCODE -ne 0 -or $engine.Trim() -ne 'unix:///var/run/docker.sock') { throw 'Local engine required.' }
$description = & wsl.exe -d Ubuntu-24.04 -- docker inspect $Container
if ($LASTEXITCODE -ne 0) { throw 'Container unavailable.' }
$item = ($description -join "`n" | ConvertFrom-Json)[0]
if ($item.Config.Labels.'org.foundation.isolated-php85' -ne 'true' -or $item.Name -ne "/$Container" -or !$item.State.Running) { throw 'Owned running lab required.' }
$subject = 'CN=Project Base Local Docker CA'
$authorities = @(Get-ChildItem Cert:\CurrentUser\My | Where-Object { $_.Subject -eq $subject -and $_.HasPrivateKey })
if ($authorities.Count -gt 1) { throw 'Multiple local authorities; select and review them manually.' }
if ($authorities.Count -eq 1) {
    $authority = $authorities[0]
    if ($authority.NotAfter -lt (Get-Date).AddDays(8)) { throw 'Local authority needs reviewed renewal.' }
} else {
    $authority = New-SelfSignedCertificate -Type Custom -Subject $subject -FriendlyName 'Project Base local Docker authority' `
        -CertStoreLocation Cert:\CurrentUser\My -KeyAlgorithm RSA -KeyLength 3072 -HashAlgorithm SHA256 `
        -KeyExportPolicy NonExportable -KeyUsage CertSign,CRLSign -NotAfter (Get-Date).AddDays(30) `
        -TextExtension @('2.5.29.19={critical}{text}ca=true&pathlength=0')
}
$leaf = New-SelfSignedCertificate -Type Custom -Subject 'CN=foundation.localhost' -FriendlyName 'Project Base Docker TLS server' `
    -Signer $authority -CertStoreLocation Cert:\CurrentUser\My -KeyAlgorithm RSA -KeyLength 2048 -HashAlgorithm SHA256 `
    -KeyExportPolicy Exportable -KeyUsage DigitalSignature,KeyEncipherment -NotAfter (Get-Date).AddDays(7) `
    -TextExtension @('2.5.29.19={critical}{text}ca=false', '2.5.29.37={text}1.3.6.1.5.5.7.3.1', `
        '2.5.29.17={text}DNS=foundation.localhost&DNS=localhost&IPAddress=127.0.0.1')
# Export only the leaf key; reimport in memory to avoid writing a PFX or password to disk.
$password = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$pfx = $leaf.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Pfx, $password)
$temporaryLeaf = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new($pfx, $password, `
    [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet -bor [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)
$rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($temporaryLeaf)
$payload = @{ cert = $leaf.ExportCertificatePem() + "`n" + $authority.ExportCertificatePem(); key = $rsa.ExportPkcs8PrivateKeyPem() } | ConvertTo-Json -Compress
$start = [System.Diagnostics.ProcessStartInfo]::new('wsl.exe')
$start.UseShellExecute = $false; $start.CreateNoWindow = $true
$start.RedirectStandardInput = $true; $start.RedirectStandardOutput = $true; $start.RedirectStandardError = $true
foreach ($argument in @('-d','Ubuntu-24.04','--','docker','exec','-i',$Container,'tee','/tmp/foundation-install-certificate.php')) { $start.ArgumentList.Add($argument) }
$stage = [System.Diagnostics.Process]::Start($start)
$stage.StandardInput.Write((Get-Content -Raw (Join-Path $PSScriptRoot '../docker/install-certificate.php')))
$stage.StandardInput.Close()
$null = $stage.StandardOutput.ReadToEnd()
$stage.WaitForExit()
if ($stage.ExitCode -ne 0) { throw 'Cannot stage the certificate installer.' }
$start.ArgumentList.Clear()
foreach ($argument in @('-d','Ubuntu-24.04','--','docker','exec','-i',$Container,'php','/tmp/foundation-install-certificate.php')) { $start.ArgumentList.Add($argument) }
$process = [System.Diagnostics.Process]::Start($start)
$process.StandardInput.Write($payload); $process.StandardInput.Close()
$process.WaitForExit()
if ($process.ExitCode -ne 0) {
    $diagnostic = $process.StandardError.ReadToEnd() + $process.StandardOutput.ReadToEnd()
    $category = if ($diagnostic -match 'Undefined constant') { 'argument quoting' } elseif ($diagnostic -match 'Parse error|syntax error') { 'PHP parsing' } else { 'key verification or write' }
    throw "Certificate delivery failed ($category); no private output was logged."
}
$rsa.Dispose(); $temporaryLeaf.Dispose(); $payload = $null; $password = $null; $pfx = $null
& wsl.exe -d Ubuntu-24.04 -- docker exec $Container apache2ctl -k graceful
if ($LASTEXITCODE -ne 0) { throw 'Apache TLS reload failed.' }
# Trust the public authority certificate only. Its private key remains nonexportable in CurrentUser\My.
$store = [System.Security.Cryptography.X509Certificates.X509Store]::new('Root','CurrentUser')
try {
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    $publicAuthority = [System.Security.Cryptography.X509Certificates.X509Certificate2]::CreateFromPem($authority.ExportCertificatePem())
    $store.Add($publicAuthority)
} finally { $store.Close() }
$mapping = & wsl.exe -d Ubuntu-24.04 -- docker port $Container 8443/tcp
if ($LASTEXITCODE -ne 0 -or $mapping -notmatch '^127\.0\.0\.1:(\d+)$') { throw 'Unexpected port binding.' }
$url = "https://127.0.0.1:$($Matches[1])/api/health"
$health = Invoke-RestMethod -Uri $url -TimeoutSec 10
if ($health.status -ne 'ok') { throw 'Trusted HTTPS verification failed.' }
[PSCustomObject]@{ Result='PASS'; Url=$url; Store='Cert:\CurrentUser\Root'; AuthorityThumbprint=$authority.Thumbprint;
    ServerThumbprint=$leaf.Thumbprint; AuthorityExpires=$authority.NotAfter; ServerExpires=$leaf.NotAfter; PrivateAuthorityKeyExported=$false }
