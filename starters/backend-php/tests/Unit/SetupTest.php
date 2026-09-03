<?php
declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use Symfony\Component\Process\Process;

final class SetupTest extends TestCase
{
    private string $root;
    private string $parent;

    protected function setUp(): void
    {
        $this->parent = realpath(sys_get_temp_dir());
        $this->root = $this->parent.DIRECTORY_SEPARATOR.'foundation-setup-test-'.bin2hex(random_bytes(8));
        mkdir($this->root, 0700);
        mkdir($this->root.'/scripts', 0700);
        mkdir($this->root.'/database', 0700);
        copy(__DIR__.'/../../scripts/setup-local.php', $this->root.'/scripts/setup-local.php');
        file_put_contents($this->root.'/.env.example', "APP_KEY=\nAPP_DEBUG=false\n");
    }

    protected function tearDown(): void
    {
        self::assertSame($this->parent, realpath(dirname($this->root)));
        self::assertFalse(is_link($this->root));
        self::assertStringStartsWith('foundation-setup-test-', basename($this->root));
        foreach (['.env', '.env.example', 'database/database.sqlite', 'scripts/setup-local.php'] as $relative) {
            if (is_file($this->root.'/'.$relative)) unlink($this->root.'/'.$relative);
        }
        rmdir($this->root.'/scripts'); rmdir($this->root.'/database'); rmdir($this->root);
    }

    private function runSetup(): Process
    {
        $process = new Process([PHP_BINARY, $this->root.'/scripts/setup-local.php']);
        $process->run();
        return $process;
    }

    public function test_new_setup_creates_random_key_without_echoing_it_and_refuses_a_repeat(): void
    {
        $process = $this->runSetup();
        self::assertTrue($process->isSuccessful(), $process->getErrorOutput());
        $environment = file_get_contents($this->root.'/.env');
        self::assertMatchesRegularExpression('/APP_KEY=base64:[A-Za-z0-9+\/]{43}=/', $environment);
        self::assertStringNotContainsString('base64:', $process->getOutput());
        self::assertFileExists($this->root.'/database/database.sqlite');
        if (PHP_OS_FAMILY !== 'Windows') self::assertSame(0600, fileperms($this->root.'/.env') & 0777);
        self::assertFalse($this->runSetup()->isSuccessful());
        self::assertSame($environment, file_get_contents($this->root.'/.env'));
    }

    public function test_existing_environment_is_never_overwritten(): void
    {
        file_put_contents($this->root.'/.env', 'synthetic-existing-config');
        self::assertFalse($this->runSetup()->isSuccessful());
        self::assertSame('synthetic-existing-config', file_get_contents($this->root.'/.env'));
        self::assertFileDoesNotExist($this->root.'/database/database.sqlite');
    }

    public function test_existing_database_is_never_overwritten(): void
    {
        file_put_contents($this->root.'/database/database.sqlite', 'synthetic-existing-database');
        self::assertFalse($this->runSetup()->isSuccessful());
        self::assertSame('synthetic-existing-database', file_get_contents($this->root.'/database/database.sqlite'));
        self::assertFileDoesNotExist($this->root.'/.env');
    }
}
