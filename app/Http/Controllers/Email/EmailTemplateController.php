<?php

declare(strict_types=1);

namespace App\Http\Controllers\Email;

use App\Contracts\Email\EmailTemplateRepositoryInterface;
use App\Http\Controllers\Controller;
use App\Http\Resources\Email\EmailTemplateResource;
use App\Models\Email\EmailTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class EmailTemplateController extends Controller
{
    public function __construct(
        private readonly EmailTemplateRepositoryInterface $repository,
    ) {}

    /**
     * Display email templates page
     */
    public function index(): Response
    {
        $templates = $this->repository->getAll();

        return Inertia::render('Email/Templates/Index', [
            'templates' => EmailTemplateResource::collection($templates)->resolve(),
        ]);
    }

    /**
     * Show create template page
     */
    public function create(): Response
    {
        return Inertia::render('Email/Templates/Create');
    }

    /**
     * Store a new email template
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:email_templates,slug',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'text_body' => 'nullable|string',
            'variables' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $template = EmailTemplate::create($validated);

        return EmailTemplateResource::make($template)
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show edit template page
     */
    public function edit(int $id): Response
    {
        $template = $this->repository->findById($id);

        if (!$template) {
            abort(404);
        }

        return Inertia::render('Email/Templates/Edit', [
            'template' => EmailTemplateResource::make($template),
        ]);
    }

    /**
     * Update email template
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $template = $this->repository->findById($id);

        if (!$template) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'slug' => 'string|max:255|unique:email_templates,slug,' . $id,
            'subject' => 'string|max:255',
            'body' => 'string',
            'text_body' => 'nullable|string',
            'variables' => 'nullable|array',
            'metadata' => 'nullable|array',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $template->update($validated);

        return EmailTemplateResource::make($template->fresh())
            ->response();
    }

    /**
     * Delete email template
     */
    public function destroy(int $id): JsonResponse
    {
        $template = $this->repository->findById($id);

        if (!$template) {
            abort(404);
        }

        $template->delete();

        return response()->json(['message' => 'Template deleted successfully']);
    }

    /**
     * Preview template with sample data
     */
    public function preview(Request $request, int $id): JsonResponse
    {
        $template = $this->repository->findById($id);

        if (!$template) {
            abort(404);
        }

        $sampleData = $request->input('data', []);
        $rendered = $template->render($sampleData);

        return response()->json($rendered);
    }
}
