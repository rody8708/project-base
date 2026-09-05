# SPDX-FileCopyrightText: 2026 Zendrhax LLC
# SPDX-License-Identifier: MPL-2.0
# Local test runtime only. No Composer, framework or application data in the image.
FROM php:8.5-apache-bookworm@sha256:07d8e64f01b852604dbbaf16d5039004597a7321ca5504fcf2e6736770661693
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql pdo_mysql \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . /app
ENTRYPOINT ["php"]
