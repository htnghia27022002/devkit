<?php

declare(strict_types=1);

namespace App\Contracts\Webhook;

use App\Models\Webhook\WebhookRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface WebhookRequestRepositoryInterface
{
    public function getPaginatedByEndpoint(int $endpointId, int $perPage = 20): LengthAwarePaginator;

    public function getRecentByEndpoint(int $endpointId, ?string $since = null, int $limit = 50): Collection;

    public function countByEndpoint(int $endpointId): int;

    public function deleteByEndpoint(int $endpointId): int;

    public function findByUuid(string $uuid): ?WebhookRequest;

    public function markAsSeen(int $id): bool;
}
