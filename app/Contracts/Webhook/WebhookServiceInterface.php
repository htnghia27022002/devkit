<?php

declare(strict_types=1);

namespace App\Contracts\Webhook;

use App\Models\Webhook\WebhookEndpoint;
use App\Models\Webhook\WebhookRequest;
use Illuminate\Http\Request;

interface WebhookServiceInterface
{
    public function getOrCreateEndpoint(string $fingerprint, ?string $ip, ?string $userAgent): WebhookEndpoint;

    public function captureRequest(WebhookEndpoint $endpoint, Request $request): WebhookRequest;

    public function updateEndpointSettings(WebhookEndpoint $endpoint, array $data): WebhookEndpoint;

    public function clearRequests(WebhookEndpoint $endpoint): int;

    public function cleanExpiredEndpoints(): int;

    public function markRequestAsSeen(WebhookRequest $request): WebhookRequest;
}
