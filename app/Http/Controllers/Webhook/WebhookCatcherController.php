<?php

declare(strict_types=1);

namespace App\Http\Controllers\Webhook;

use App\Contracts\Webhook\WebhookEndpointRepositoryInterface;
use App\Contracts\Webhook\WebhookServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class WebhookCatcherController extends Controller
{
    public function __construct(
        private readonly WebhookEndpointRepositoryInterface $endpointRepository,
        private readonly WebhookServiceInterface $service,
    ) {}

    /**
     * Catch any incoming webhook request (accepts all HTTP methods)
     */
    public function catch(Request $request, string $uuid): Response
    {
        $endpoint = $this->endpointRepository->findActiveByUuid($uuid);

        if (! $endpoint) {
            return response('Endpoint not found or expired', 404);
        }

        $this->service->captureRequest($endpoint, $request);

        return response(
            $endpoint->default_response_body ?? '',
            $endpoint->default_status_code,
            ['Content-Type' => $endpoint->default_content_type],
        );
    }
}
