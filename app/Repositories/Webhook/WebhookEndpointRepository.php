<?php

declare(strict_types=1);

namespace App\Repositories\Webhook;

use App\Contracts\Webhook\WebhookEndpointRepositoryInterface;
use App\Enums\Webhook\EndpointStatus;
use App\Models\Webhook\WebhookEndpoint;
use App\Repositories\BaseRepository;

final class WebhookEndpointRepository extends BaseRepository implements WebhookEndpointRepositoryInterface
{
    public function __construct()
    {
        $this->model = new WebhookEndpoint();
    }

    public function findByUuid(string $uuid): ?WebhookEndpoint
    {
        /** @var WebhookEndpoint|null */
        return $this->model::where('uuid', $uuid)->first();
    }

    public function findByFingerprint(string $fingerprint): ?WebhookEndpoint
    {
        /** @var WebhookEndpoint|null */
        return $this->model::where('fingerprint', $fingerprint)->first();
    }

    public function findActiveByUuid(string $uuid): ?WebhookEndpoint
    {
        /** @var WebhookEndpoint|null */
        return $this->model::where('uuid', $uuid)
            ->where('status', EndpointStatus::ACTIVE)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();
    }
}
