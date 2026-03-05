<?php

declare(strict_types=1);

namespace App\Models\Webhook;

use App\Enums\Webhook\EndpointStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class WebhookEndpoint extends Model
{
    protected $fillable = [
        'uuid',
        'fingerprint',
        'ip_address',
        'user_agent',
        'status',
        'default_status_code',
        'default_content_type',
        'default_response_body',
        'expires_at',
    ];

    protected $casts = [
        'status' => EndpointStatus::class,
        'default_status_code' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function requests(): HasMany
    {
        return $this->hasMany(WebhookRequest::class);
    }

    public function isActive(): bool
    {
        return $this->status === EndpointStatus::ACTIVE
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
