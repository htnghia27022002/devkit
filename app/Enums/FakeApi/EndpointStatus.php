<?php

declare(strict_types=1);

namespace App\Enums\FakeApi;

enum EndpointStatus: string
{
    case ACTIVE = 'active';
    case DISABLED = 'disabled';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
