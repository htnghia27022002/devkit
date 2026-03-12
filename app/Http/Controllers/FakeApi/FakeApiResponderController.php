<?php

declare(strict_types=1);

namespace App\Http\Controllers\FakeApi;

use App\Contracts\FakeApi\FakeApiEndpointRepositoryInterface;
use App\Contracts\FakeApi\FakeApiServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class FakeApiResponderController extends Controller
{
    public function __construct(
        private readonly FakeApiEndpointRepositoryInterface $endpointRepository,
        private readonly FakeApiServiceInterface $service,
    ) {}

    /**
     * Respond to any incoming request with the user-defined JSON response.
     * Also logs the request for inspection.
     */
    public function respond(Request $request, string $uuid, ?string $path = null): Response
    {
        $endpoint = $this->endpointRepository->findActiveByUuid($uuid);

        if (! $endpoint) {
            return response('Endpoint not found or expired', 404)
                ->header('Content-Type', 'application/json')
                ->setContent(json_encode(['error' => 'Endpoint not found or expired']));
        }

        // Log the incoming request asynchronously (fire and forget)
        $this->service->logRequest($endpoint, $request, $path);

        // Simulate delay if configured
        if ($endpoint->delay_ms > 0) {
            usleep($endpoint->delay_ms * 1000);
        }

        $body = $endpoint->response_body ?? '{}';

        return response($body, $endpoint->status_code)
            ->header('Content-Type', $endpoint->content_type)
            ->header('X-Powered-By', 'DevKit Fake API')
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }
}
