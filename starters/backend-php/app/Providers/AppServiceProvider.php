<?php
declare(strict_types=1);

namespace App\Providers;

use App\Application\TaskRepository;
use App\Application\TaskService;
use App\Infrastructure\SqlTaskRepository;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use RuntimeException;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->scoped(\App\Application\IdentityContext::class);
        $this->app->bind(\App\Application\TokenAuthenticator::class, \App\Infrastructure\SqlTokenAuthenticator::class);
        $this->app->bind(TaskRepository::class, SqlTaskRepository::class);
        $this->app->bind(TaskService::class, fn ($app) => new TaskService(
            $app->make(TaskRepository::class), fn () => (string) Str::uuid(),
        ));
    }

    public function boot(): void
    {
        if ($this->app->environment('production') && \App\Application\ProductionPolicy::failures(\App\Infrastructure\ProductionSettings::current())) {
            throw new RuntimeException('Production configuration rejected. Run the production checks in an evaluation copy.');
        }
        $driver = config('database.default');
        if (!in_array($driver, ['sqlite', 'mysql', 'pgsql'], true)) throw new RuntimeException('Unsupported database profile.');
        if ($driver !== 'sqlite') {
            foreach (['host', 'port', 'database', 'username', 'password'] as $field) {
                if ((string) config("database.connections.$driver.$field") === '') {
                    throw new RuntimeException('Server database configuration must be explicit and complete.');
                }
            }
        }
        if ($driver === 'mysql' && !in_array(config('database.connections.mysql.host'), ['127.0.0.1', 'localhost', '::1'], true)) {
            throw new RuntimeException('This draft MySQL profile is loopback-only. Review TLS and authentication before adding remote support.');
        }
    }
}
