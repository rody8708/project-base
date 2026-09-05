<?php
// SPDX-FileCopyrightText: 2026 Zendrhax LLC
// SPDX-License-Identifier: MPL-2.0
declare(strict_types=1);

// In a source checkout protect all of Project Base. In an exported component
// protect its frozen foundation, without depending on the former repository.
function protectedBoundary(): string
{
    $component = dirname(__DIR__);
    $candidate = dirname($component, 2);
    $source = basename(dirname($component)) === 'starters'
        && is_file($candidate.'/tools/lib/project-export.mjs');
    return strtolower(str_replace('\\', '/', $source ? $candidate : $component.'/foundation'));
}
