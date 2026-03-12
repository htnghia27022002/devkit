<?php

declare(strict_types=1);

namespace App\Http\Controllers\FakeApi;

use App\Contracts\FakeApi\FakeApiEndpointRepositoryInterface;
use App\Contracts\FakeApi\FakeApiLogRepositoryInterface;
use App\Contracts\FakeApi\FakeApiServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\FakeApi\FakeApiEndpointResource;
use App\Http\Resources\FakeApi\FakeApiLogResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class FakeApiController extends Controller
{
    public function __construct(
        private readonly FakeApiEndpointRepositoryInterface $endpointRepository,
        private readonly FakeApiLogRepositoryInterface $logRepository,
        private readonly FakeApiServiceInterface $service,
    ) {}

    /**
     * Show the Fake API tool page (public, no auth required)
     */
    public function index(): Response
    {
        return Inertia::render('FakeApi/Index');
    }

    /**
     * Create or retrieve an endpoint by browser fingerprint
     */
    public function createOrGet(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fingerprint' => 'required|string|min:8|max:64',
        ]);

        $endpoint = $this->service->getOrCreateEndpoint(
            $validated['fingerprint'],
            $request->ip(),
            $request->userAgent(),
        );

        return FakeApiEndpointResource::make($endpoint)
            ->response()
            ->setStatusCode($endpoint->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Update endpoint response configuration
     */
    public function update(Request $request, string $uuid): JsonResponse
    {
        $endpoint = $this->endpointRepository->findByUuid($uuid);

        if (! $endpoint) {
            return response()->json(['message' => 'Endpoint not found'], 404);
        }

        $validated = $request->validate([
            'name'          => 'nullable|string|max:255',
            'status_code'   => 'required|integer|min:100|max:599',
            'content_type'  => 'required|string|max:100',
            'response_body' => 'nullable|string|max:1048576',
            'delay_ms'      => 'required|integer|min:0|max:10000',
        ]);

        $updated = $this->service->updateEndpoint($endpoint, $validated);

        return FakeApiEndpointResource::make($updated)->response();
    }

    /**
     * Get recent incoming logs for an endpoint (polling)
     */
    public function logs(Request $request, string $uuid): JsonResponse
    {
        $endpoint = $this->endpointRepository->findByUuid($uuid);

        if (! $endpoint) {
            return response()->json(['message' => 'Endpoint not found'], 404);
        }

        $since = $request->query('since');
        $logs  = $this->logRepository->getRecentByEndpoint(
            $endpoint->id,
            is_string($since) ? $since : null,
            50,
        );

        return response()->json([
            'data'  => FakeApiLogResource::collection($logs),
            'total' => $this->logRepository->countByEndpoint($endpoint->id),
        ]);
    }

    /**
     * Clear all logs for an endpoint
     */
    public function clearLogs(string $uuid): JsonResponse
    {
        $endpoint = $this->endpointRepository->findByUuid($uuid);

        if (! $endpoint) {
            return response()->json(['message' => 'Endpoint not found'], 404);
        }

        $deleted = $this->service->clearLogs($endpoint);

        return response()->json(['deleted' => $deleted]);
    }
}
