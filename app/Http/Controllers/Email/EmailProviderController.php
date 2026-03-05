<?php

declare(strict_types=1);

namespace App\Http\Controllers\Email;

use App\Contracts\Email\EmailProviderRepositoryInterface;
use App\Contracts\Email\EmailServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\Email\EmailProviderResource;
use App\Models\Email\EmailProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class EmailProviderController extends Controller
{
    public function __construct(
        private readonly EmailProviderRepositoryInterface $repository,
        private readonly EmailServiceInterface $service,
    ) {}

    /**
     * Display email providers page
     */
    public function index(): Response
    {
        $providers = $this->repository->getAll();

        return Inertia::render('Email/Providers/Index', [
            'providers' => EmailProviderResource::collection($providers)->resolve(),
        ]);
    }

    /**
     * Store a new email provider
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'driver' => 'required|string|in:smtp,sendgrid,aws_ses',
            'config' => 'required|array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'priority' => 'integer|min:0',
            'description' => 'nullable|string',
        ]);

        $provider = EmailProvider::create($validated);

        return EmailProviderResource::make($provider)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update email provider
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $provider = $this->repository->findById($id);

        if (!$provider) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'driver' => 'string|in:smtp,sendgrid,aws_ses',
            'config' => 'array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'priority' => 'integer|min:0',
            'description' => 'nullable|string',
        ]);

        $provider->update($validated);

        return EmailProviderResource::make($provider->fresh())
            ->response();
    }

    /**
     * Delete email provider
     */
    public function destroy(int $id): JsonResponse
    {
        $provider = $this->repository->findById($id);

        if (!$provider) {
            abort(404);
        }

        $provider->delete();

        return response()->json(['message' => 'Provider deleted successfully']);
    }

    /**
     * Set provider as default
     */
    public function setDefault(int $id): JsonResponse
    {
        $success = $this->repository->setAsDefault($id);

        if (!$success) {
            abort(404);
        }

        return response()->json(['message' => 'Default provider updated']);
    }

    /**
     * Test provider connection
     */
    public function test(int $id): JsonResponse
    {
        $result = $this->service->testProvider($id);

        return response()->json($result);
    }
}
