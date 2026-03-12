<?php

declare(strict_types=1);

namespace App\Services\FakeApi;

use App\Contracts\FakeApi\FakeApiEndpointRepositoryInterface;
use App\Contracts\FakeApi\FakeApiLogRepositoryInterface;
use App\Contracts\FakeApi\FakeApiServiceInterface;
use App\Enums\FakeApi\EndpointStatus;
use App\Models\FakeApi\FakeApiEndpoint;
use App\Models\FakeApi\FakeApiLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class FakeApiService implements FakeApiServiceInterface
{
    private const EXPIRY_DAYS = 7;
    private const MAX_BODY_SIZE = 1048576; // 1MB

    public function __construct(
        private readonly FakeApiEndpointRepositoryInterface $endpointRepository,
        private readonly FakeApiLogRepositoryInterface $logRepository,
    ) {}

    public function getOrCreateEndpoint(string $fingerprint, ?string $ip, ?string $userAgent): FakeApiEndpoint
    {
        $endpoint = $this->endpointRepository->findByFingerprint($fingerprint);

        if ($endpoint !== null) {
            $endpoint->update([
                'expires_at' => now()->addDays(self::EXPIRY_DAYS),
                'ip_address' => $ip,
            ]);

            return $endpoint->fresh();
        }

        return FakeApiEndpoint::create([
            'uuid'          => Str::uuid()->toString(),
            'fingerprint'   => $fingerprint,
            'ip_address'    => $ip,
            'user_agent'    => $userAgent,
            'status'        => EndpointStatus::ACTIVE,
            'status_code'   => 200,
            'content_type'  => 'application/json',
            'response_body' => "{\n  \"success\": true,\n  \"data\": [],\n  \"message\": \"OK\"\n}",
            'delay_ms'      => 0,
            'expires_at'    => now()->addDays(self::EXPIRY_DAYS),
        ]);
    }

    public function updateEndpoint(FakeApiEndpoint $endpoint, array $data): FakeApiEndpoint
    {
        $endpoint->update([
            'name'          => $data['name'] ?? $endpoint->name,
            'status_code'   => $data['status_code'] ?? $endpoint->status_code,
            'content_type'  => $data['content_type'] ?? $endpoint->content_type,
            'response_body' => array_key_exists('response_body', $data) ? $data['response_body'] : $endpoint->response_body,
            'delay_ms'      => $data['delay_ms'] ?? $endpoint->delay_ms,
        ]);

        return $endpoint->fresh();
    }

    public function logRequest(FakeApiEndpoint $endpoint, Request $request, ?string $path): FakeApiLog
    {
        $rawBody = $request->getContent();

        if (strlen($rawBody) > self::MAX_BODY_SIZE) {
            $rawBody = substr($rawBody, 0, self::MAX_BODY_SIZE);
        }

        return FakeApiLog::create([
            'fake_api_endpoint_id' => $endpoint->id,
            'uuid'                 => Str::uuid()->toString(),
            'method'               => $request->method(),
            'path'                 => $path ? '/' . ltrim($path, '/') : '/',
            'query_string'         => $request->getQueryString(),
            'headers'              => $this->sanitizeHeaders($request->headers->all()),
            'body'                 => $rawBody ?: null,
            'ip_address'           => $request->ip(),
            'user_agent'           => $request->userAgent(),
        ]);
    }

    public function clearLogs(FakeApiEndpoint $endpoint): int
    {
        return $this->logRepository->deleteByEndpoint($endpoint->id);
    }

    public function cleanExpiredEndpoints(): int
    {
        return FakeApiEndpoint::where('expires_at', '<', now())->delete();
    }

    private function sanitizeHeaders(array $headers): array
    {
        $sensitive = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

        foreach ($headers as $key => $value) {
            if (in_array(strtolower($key), $sensitive, true)) {
                $headers[$key] = ['[redacted]'];
            }
        }

        return $headers;
    }
}
