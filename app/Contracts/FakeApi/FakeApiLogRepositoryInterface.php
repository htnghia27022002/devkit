<?php

declare(strict_types=1);

namespace App\Contracts\FakeApi;

use App\Models\FakeApi\FakeApiLog;
use Illuminate\Database\Eloquent\Collection;

interface FakeApiLogRepositoryInterface
{
    public function getRecentByEndpoint(int $endpointId, ?string $since, int $limit): Collection;

    public function countByEndpoint(int $endpointId): int;

    public function deleteByEndpoint(int $endpointId): int;
}
