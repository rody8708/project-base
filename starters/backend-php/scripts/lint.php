<?php
declare(strict_types=1);

$base = dirname(__DIR__);
$files = [$base.'/artisan'];
foreach (['app', 'bootstrap', 'config', 'database', 'docker', 'lang', 'public', 'routes', 'scripts', 'tests'] as $directory) {
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base.'/'.$directory, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if (!$file->isLink() && $file->isFile() && $file->getExtension() === 'php'
            && !str_contains(str_replace('\\', '/', $file->getPathname()), '/bootstrap/cache/')) $files[] = $file->getPathname();
    }
}
sort($files, SORT_STRING);
foreach ($files as $file) {
    $process = proc_open([PHP_BINARY, '-l', $file], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    if (!is_resource($process)) exit(1);
    $output = stream_get_contents($pipes[1]).stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($process) !== 0) { fwrite(STDERR, $output); exit(1); }
}
fwrite(STDOUT, 'PASS PHP syntax: '.count($files)." files\n");
