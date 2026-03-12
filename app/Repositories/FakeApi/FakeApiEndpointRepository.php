<?php

declare(strict_types=1);

namespace App\Repositories\FakeApi;

use App\Contracts\FakeApi\FakeApiEndpointRepositoryInterface;
use App\Enums\FakeApi\EndpointStatus;
use App\Models\FakeApi\FakeApiEndpoint;
use App\Repositories\BaseRepository;

final class FakeApiEndpointRepository extends BaseRepository implements FakeApiEndpointRepositoryInterface
{
    public function __construct()
    {
        $this->model = new FakeApiEndpoint();
    }

    public function findByUuid(string $uuid): ?FakeApiEndpoint
    {
        /** @var FakeApiEndpoint|null */
        return $this->model::where('uuid', $uuid)->first();
    }

    public function findByFingerprint(string $fingerprint): ?FakeApiEndpoint
    {
        /** @var FakeApiEndpoint|null */
        return $this->model::where('fingerprint', $fingerprint)->first();
    }

    public function findActiveByUuid(string $uuid): ?FakeApiEndpoint
    {
        /** @var FakeApiEndpoint|null */
        return $this->model::where('uuid', $uuid)
            ->where('status', EndpointStatus::ACTIVE)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();
    }
}
