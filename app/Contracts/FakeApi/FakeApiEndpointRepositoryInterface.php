<?php

declare(strict_types=1);

namespace App\Contracts\FakeApi;

use App\Models\FakeApi\FakeApiEndpoint;

interface FakeApiEndpointRepositoryInterface
{
    public function findByUuid(string $uuid): ?FakeApiEndpoint;

    public function findByFingerprint(string $fingerprint): ?FakeApiEndpoint;

    public function findActiveByUuid(string $uuid): ?FakeApiEndpoint;
}
