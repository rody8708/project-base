#!/bin/sh
set -eu
umask 077
mkdir -p /tmp/apache
php /app/docker/initialize.php
exec apache2-foreground
