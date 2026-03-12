<?php

declare(strict_types=1);

namespace App\Models\FakeApi;

use App\Enums\FakeApi\EndpointStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class FakeApiEndpoint extends Model
{
    protected $fillable = [
        'uuid',
        'fingerprint',
        'name',
        'status',
        'status_code',
        'content_type',
        'response_body',
        'delay_ms',
        'ip_address',
        'user_agent',
        'expires_at',
    ];

    protected $casts = [
        'status'      => EndpointStatus::class,
        'status_code' => 'integer',
        'delay_ms'    => 'integer',
        'expires_at'  => 'datetime',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(FakeApiLog::class);
    }

    public function isActive(): bool
    {
        return $this->status === EndpointStatus::ACTIVE
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
