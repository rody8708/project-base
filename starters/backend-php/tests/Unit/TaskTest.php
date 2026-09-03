<?php
declare(strict_types=1);

namespace Tests\Unit;

use App\Domain\Task;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class TaskTest extends TestCase
{
    private const ID = '11111111-1111-4111-8111-111111111111';

    public function test_normalization_unicode_and_boundaries(): void
    {
        self::assertSame('Café 🙂', (new Task(self::ID, "\u{00A0} Café 🙂 \u{00A0}"))->title);
        self::assertSame(str_repeat('á', 80), (new Task(self::ID, str_repeat('á', 80)))->title);
        self::assertFalse((new Task(self::ID, 'a'))->completed);
        self::assertSame(1, (new Task(self::ID, 'a'))->version);
    }

    public static function invalidTitles(): array
    {
        return [[''], ['   '], ["\u{00A0}"], [str_repeat('a', 81)], ["a\nb"], ["a\0b"], ["a\u{2028}b"], ["a\u{2029}b"], ["\xff"]];
    }

    #[DataProvider('invalidTitles')]
    public function test_invalid_titles_are_rejected(string $title): void
    {
        $this->expectException(InvalidArgumentException::class);
        new Task(self::ID, $title);
    }

    public function test_invalid_identifier_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new Task('../invalid', 'Title');
    }

    public function test_invalid_version_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);
        new Task(self::ID, 'Title', false, 0);
    }

    public function test_task_values_are_readonly(): void
    {
        $task = new Task(self::ID, 'Original');
        $this->expectException(\Error::class);
        $task->title = 'Changed';
    }
}
