<?php

declare(strict_types=1);

namespace App\Contracts\Email;

use App\Models\Email\EmailProvider;
use Illuminate\Support\Collection;

interface EmailProviderRepositoryInterface
{
    /**
     * Get all active providers ordered by priority
     */
    public function getActivePrioritized(): Collection;

    /**
     * Get default provider
     */
    public function getDefault(): ?EmailProvider;

    /**
     * Get provider by driver
     */
    public function getByDriver(string $driver): Collection;

    /**
     * Set provider as default
     */
    public function setAsDefault(int $providerId): bool;

    /**
     * Get providers that haven't been used recently
     */
    public function getUnused(int $days = 30): Collection;
}
