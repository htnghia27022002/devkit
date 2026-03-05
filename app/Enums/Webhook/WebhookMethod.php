<?php

declare(strict_types=1);

namespace App\Enums\Webhook;

enum WebhookMethod: string
{
    case GET = 'GET';
    case POST = 'POST';
    case PUT = 'PUT';
    case PATCH = 'PATCH';
    case DELETE = 'DELETE';
    case HEAD = 'HEAD';
    case OPTIONS = 'OPTIONS';

    /**
     * Get all values
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get badge color for display
     */
    public function color(): string
    {
        return match ($this) {
            self::GET => 'green',
            self::POST => 'blue',
            self::PUT => 'orange',
            self::PATCH => 'yellow',
            self::DELETE => 'red',
            self::HEAD => 'purple',
            self::OPTIONS => 'gray',
        };
    }
}
