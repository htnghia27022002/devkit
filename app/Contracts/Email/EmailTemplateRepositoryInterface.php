<?php

declare(strict_types=1);

namespace App\Contracts\Email;

use App\Models\Email\EmailTemplate;
use Illuminate\Support\Collection;

interface EmailTemplateRepositoryInterface
{
    /**
     * Find template by slug
     */
    public function findBySlug(string $slug): ?EmailTemplate;

    /**
     * Get all active templates
     */
    public function getAllActive(): Collection;

    /**
     * Get default template
     */
    public function getDefault(): ?EmailTemplate;

    /**
     * Search templates
     */
    public function search(string $query): Collection;
}
