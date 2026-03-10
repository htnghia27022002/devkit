<?php

declare(strict_types=1);

namespace App\Services\Webhook;

use App\Contracts\Webhook\WebhookEndpointRepositoryInterface;
use App\Contracts\Webhook\WebhookRequestRepositoryInterface;
use App\Contracts\Webhook\WebhookServiceInterface;
use App\Enums\Webhook\EndpointStatus;
use App\Models\Webhook\WebhookEndpoint;
use App\Models\Webhook\WebhookRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class WebhookService implements WebhookServiceInterface
{
    private const MAX_BODY_SIZE = 1048576; // 1MB

    private const EXPIRY_DAYS = 7;

    public function __construct(
        private readonly WebhookEndpointRepositoryInterface $endpointRepository,
        private readonly WebhookRequestRepositoryInterface $requestRepository,
    ) {}

    public function getOrCreateEndpoint(string $fingerprint, ?string $ip, ?string $userAgent): WebhookEndpoint
    {
        $endpoint = $this->endpointRepository->findByFingerprint($fingerprint);

        if ($endpoint !== null) {
            // Refresh expiry on revisit
            $endpoint->update([
                'expires_at' => now()->addDays(self::EXPIRY_DAYS),
                'ip_address' => $ip,
            ]);

            return $endpoint->fresh();
        }

        return WebhookEndpoint::create([
            'uuid' => Str::uuid()->toString(),
            'fingerprint' => $fingerprint,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'status' => EndpointStatus::ACTIVE,
            'default_status_code' => 200,
            'default_content_type' => 'application/json',
            'default_response_body' => null,
            'expires_at' => now()->addDays(self::EXPIRY_DAYS),
        ]);
    }

    public function captureRequest(WebhookEndpoint $endpoint, Request $request): WebhookRequest
    {
        $rawBody = $request->getContent();
        $bodySize = strlen($rawBody);

        // Truncate body if too large
        if ($bodySize > self::MAX_BODY_SIZE) {
            $rawBody = substr($rawBody, 0, self::MAX_BODY_SIZE);
        }

        $parsedBody = $this->parseBody($rawBody, $request->header('Content-Type', ''));

        return WebhookRequest::create([
            'webhook_endpoint_id' => $endpoint->id,
            'uuid' => Str::uuid()->toString(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'query_string' => $request->getQueryString(),
            'query_params' => $request->query->count() > 0 ? $request->query->all() : null,
            'headers' => $this->sanitizeHeaders($request->headers->all()),
            'content_type' => $request->header('Content-Type'),
            'body' => $rawBody ?: null,
            'parsed_body' => $parsedBody,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'size' => $bodySize,
        ]);
    }

    public function updateEndpointSettings(WebhookEndpoint $endpoint, array $data): WebhookEndpoint
    {
        $endpoint->update([
            'default_status_code' => $data['default_status_code'] ?? $endpoint->default_status_code,
            'default_content_type' => $data['default_content_type'] ?? $endpoint->default_content_type,
            'default_response_body' => $data['default_response_body'] ?? $endpoint->default_response_body,
        ]);

        return $endpoint->fresh();
    }

    public function clearRequests(WebhookEndpoint $endpoint): int
    {
        return $this->requestRepository->deleteByEndpoint($endpoint->id);
    }

    public function markRequestAsSeen(WebhookRequest $request): WebhookRequest
    {
        if ($request->seen_at === null) {
            $this->requestRepository->markAsSeen($request->id);
        }

        return $request->fresh();
    }

    public function cleanExpiredEndpoints(): int
    {
        $expired = WebhookEndpoint::where('status', EndpointStatus::ACTIVE)
            ->where('expires_at', '<', now())
            ->get();

        $count = 0;
        foreach ($expired as $endpoint) {
            $this->requestRepository->deleteByEndpoint($endpoint->id);
            $endpoint->delete();
            $count++;
        }

        return $count;
    }

    /**
     * Parse body based on content type
     */
    private function parseBody(string $body, string $contentType): ?array
    {
        if (empty($body)) {
            return null;
        }

        // JSON
        if (str_contains($contentType, 'json')) {
            $decoded = json_decode($body, true);

            return is_array($decoded) ? $decoded : null;
        }

        // Form data
        if (str_contains($contentType, 'x-www-form-urlencoded')) {
            parse_str($body, $parsed);

            return ! empty($parsed) ? $parsed : null;
        }

        return null;
    }

    /**
     * Sanitize headers for storage (flatten single-value arrays)
     */
    private function sanitizeHeaders(array $headers): array
    {
        $sanitized = [];
        foreach ($headers as $key => $values) {
            $sanitized[$key] = count($values) === 1 ? $values[0] : $values;
        }

        return $sanitized;
    }
}
