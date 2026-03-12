<?php

declare(strict_types=1);

namespace App\Repositories\FakeApi;

use App\Contracts\FakeApi\FakeApiLogRepositoryInterface;
use App\Models\FakeApi\FakeApiLog;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

final class FakeApiLogRepository extends BaseRepository implements FakeApiLogRepositoryInterface
{
    public function __construct()
    {
        $this->model = new FakeApiLog();
    }

    public function getRecentByEndpoint(int $endpointId, ?string $since, int $limit = 50): Collection
    {
        $query = $this->model::where('fake_api_endpoint_id', $endpointId)
            ->orderByDesc('created_at')
            ->limit($limit);

        if ($since !== null) {
            $query->where('created_at', '>', $since);
        }

        /** @var Collection<int, FakeApiLog> */
        return $query->get();
    }

    public function countByEndpoint(int $endpointId): int
    {
        return $this->model::where('fake_api_endpoint_id', $endpointId)->count();
    }

    public function deleteByEndpoint(int $endpointId): int
    {
        return $this->model::where('fake_api_endpoint_id', $endpointId)->delete();
    }
}
