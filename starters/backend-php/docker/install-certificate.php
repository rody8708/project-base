<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

// Receives only the leaf private key and public certificate chain over stdin.
umask(0077);
$payload = json_decode(stream_get_contents(STDIN), true, 4, JSON_THROW_ON_ERROR);
if (!openssl_x509_check_private_key($payload['cert'], $payload['key'])) exit(1);
if (file_put_contents('/state/key.next', $payload['key']) === false
    || file_put_contents('/state/cert.next', $payload['cert']) === false) exit(1);
if (!rename('/state/key.next', '/state/key.pem') || !rename('/state/cert.next', '/state/cert.pem')) exit(1);
if (__FILE__ === '/tmp/foundation-install-certificate.php') unlink(__FILE__);
