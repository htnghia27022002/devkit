<?php

declare(strict_types=1);

namespace App\Contracts\Webhook;

use App\Models\Webhook\WebhookEndpoint;

interface WebhookEndpointRepositoryInterface
{
    public function findByUuid(string $uuid): ?WebhookEndpoint;

    public function findByFingerprint(string $fingerprint): ?WebhookEndpoint;

    public function findActiveByUuid(string $uuid): ?WebhookEndpoint;
}
