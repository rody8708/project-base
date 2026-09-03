#!/bin/sh
# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
set -eu
umask 077
mkdir -p /tmp/apache
php /app/docker/initialize.php
exec apache2-foreground
