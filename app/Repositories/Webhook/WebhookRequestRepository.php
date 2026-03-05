<?php

declare(strict_types=1);

namespace App\Repositories\Webhook;

use App\Contracts\Webhook\WebhookRequestRepositoryInterface;
use App\Models\Webhook\WebhookRequest;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

final class WebhookRequestRepository extends BaseRepository implements WebhookRequestRepositoryInterface
{
    public function __construct()
    {
        $this->model = new WebhookRequest();
    }

    public function getPaginatedByEndpoint(int $endpointId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->model::where('webhook_endpoint_id', $endpointId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getRecentByEndpoint(int $endpointId, ?string $since = null, int $limit = 50): Collection
    {
        $query = $this->model::where('webhook_endpoint_id', $endpointId)
            ->orderByDesc('created_at')
            ->limit($limit);

        if ($since !== null) {
            $query->where('created_at', '>', $since);
        }

        return $query->get();
    }

    public function countByEndpoint(int $endpointId): int
    {
        return $this->model::where('webhook_endpoint_id', $endpointId)->count();
    }

    public function deleteByEndpoint(int $endpointId): int
    {
        return $this->model::where('webhook_endpoint_id', $endpointId)->delete();
    }
}
