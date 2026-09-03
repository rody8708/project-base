# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
# Verified Linux/amd64 manifests; update deliberately and re-run verification.
FROM composer:2@sha256:0baf37e7f495f1c42cee6bdd9cf3e00e9435f193b512529e7c484d66c623773f AS composer
FROM php:8.5-apache-bookworm@sha256:07d8e64f01b852604dbbaf16d5039004597a7321ca5504fcf2e6736770661693 AS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev unzip \
    && docker-php-ext-install pdo_pgsql pdo_mysql \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer /usr/bin/composer /usr/local/bin/composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-plugins --prefer-dist --no-interaction --no-progress
COPY app ./app
RUN composer dump-autoload --no-dev --classmap-authoritative --no-scripts --no-plugins

FROM dependencies AS runtime
COPY . /app
RUN mkdir -p /app/bootstrap/cache /app/storage/framework/views /app/storage/framework/cache /app/storage/logs /state \
    && chown -R www-data:www-data /state /app/bootstrap/cache /app/storage \
    && a2enmod ssl rewrite headers \
    && a2dissite 000-default \
    && cp /app/docker/apache.conf /etc/apache2/sites-enabled/foundation.conf \
    && printf 'Listen 8443\n' > /etc/apache2/ports.conf \
    && cp /app/docker/php.ini /usr/local/etc/php/conf.d/foundation.ini \
    && chmod +x /app/docker/start.sh
ENV APP_ENV=production APP_DEBUG=false APP_URL=https://foundation.localhost:8443 \
    LOG_CHANNEL=stderr DB_CONNECTION=sqlite DB_DATABASE=/state/database.sqlite \
    APP_CONFIG_CACHE=/state/config.php APP_ROUTES_CACHE=/state/routes.php \
    APACHE_RUN_DIR=/tmp/apache APACHE_LOCK_DIR=/tmp/apache APACHE_PID_FILE=/tmp/apache/apache.pid
USER www-data
EXPOSE 8443
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --fail --silent --cacert /state/cert.pem https://127.0.0.1:8443/api/health >/dev/null || exit 1
ENTRYPOINT ["/app/docker/start.sh"]
