<?php

declare(strict_types=1);

namespace App\Contracts\FakeApi;

use App\Models\FakeApi\FakeApiEndpoint;
use App\Models\FakeApi\FakeApiLog;
use Illuminate\Http\Request;

interface FakeApiServiceInterface
{
    public function getOrCreateEndpoint(string $fingerprint, ?string $ip, ?string $userAgent): FakeApiEndpoint;

    public function updateEndpoint(FakeApiEndpoint $endpoint, array $data): FakeApiEndpoint;

    public function logRequest(FakeApiEndpoint $endpoint, Request $request, ?string $path): FakeApiLog;

    public function clearLogs(FakeApiEndpoint $endpoint): int;

    public function cleanExpiredEndpoints(): int;
}
