<?php

declare(strict_types=1);

namespace App\Http\Controllers\Webhook;

use App\Contracts\Webhook\WebhookEndpointRepositoryInterface;
use App\Contracts\Webhook\WebhookRequestRepositoryInterface;
use App\Contracts\Webhook\WebhookServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\Webhook\WebhookEndpointResource;
use App\Http\Resources\Webhook\WebhookRequestResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class WebhookController extends Controller
{
    public function __construct(
        private readonly WebhookEndpointRepositoryInterface $endpointRepository,
        private readonly WebhookRequestRepositoryInterface $requestRepository,
        private readonly WebhookServiceInterface $service,
    ) {}

    /**
     * Show the webhook testing page (public, no auth required)
     */
    public function index(): Response
    {
        return Inertia::render('Webhook/Index');
    }

    /**
     * Create or get an endpoint by browser fingerprint
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

        return WebhookEndpointResource::make($endpoint)
            ->response()
            ->setStatusCode($endpoint->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Get requests for an endpoint (polling)
     */
    public function requests(Request $request, string $uuid): JsonResponse
    {
        $endpoint = $this->endpointRepository->findByUuid($uuid);

        if (! $endpoint) {
            return response()->json(['message' => 'Endpoint not found'], 404);
        }

        $since = $request->query('since');
        $requests = $this->requestRepository->getRecentByEndpoint(
            $endpoint->id,
            is_string($since) ? $since : null,
            50,
        );

        return response()->json([
            'data' => WebhookRequestResource::collection($requests),
            'total' => $this->requestRepository->countByEndpoint($endpoint->id),
        ]);
    }

    /**
     * Clear all requests for an endpoint
     */
    public function clearRequests(string $uuid): JsonResponse
    {
        $endpoint = $this->endpointRepository->findByUuid($uuid);

        if (! $endpoint) {
            return response()->json(['message' => 'Endpoint not found'], 404);
        }

        $deleted = $this->service->clearRequests($endpoint);

        return response()->json(['deleted' => $deleted]);
    }

    /**
     * Mark a webhook request as seen
     */
    public function markSeen(string $uuid, string $requestUuid): JsonResponse
    {
        $endpoint = $this->endpointRepository->findByUuid($uuid);

        if (! $endpoint) {
            return response()->json(['message' => 'Endpoint not found'], 404);
        }

        $webhookRequest = $this->requestRepository->findByUuid($requestUuid);

        if (! $webhookRequest || $webhookRequest->webhook_endpoint_id !== $endpoint->id) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $updated = $this->service->markRequestAsSeen($webhookRequest);

        return WebhookRequestResource::make($updated)->response();
    }

    /**
     * Update endpoint response settings
     */
    public function updateSettings(Request $request, string $uuid): JsonResponse
    {
        $endpoint = $this->endpointRepository->findByUuid($uuid);

        if (! $endpoint) {
            return response()->json(['message' => 'Endpoint not found'], 404);
        }

        $validated = $request->validate([
            'default_status_code' => 'sometimes|integer|min:100|max:599',
            'default_content_type' => 'sometimes|string|max:100',
            'default_response_body' => 'nullable|string|max:10000',
        ]);

        $updated = $this->service->updateEndpointSettings($endpoint, $validated);

        return WebhookEndpointResource::make($updated)->response();
    }
}
