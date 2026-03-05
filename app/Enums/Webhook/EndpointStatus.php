<?php

declare(strict_types=1);

namespace App\Enums\Webhook;

enum EndpointStatus: string
{
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case DISABLED = 'disabled';

    /**
     * Get all values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get label for display
     */
    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::EXPIRED => 'Expired',
            self::DISABLED => 'Disabled',
        };
    }
}
