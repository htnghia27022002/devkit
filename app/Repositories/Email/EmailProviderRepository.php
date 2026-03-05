<?php

declare(strict_types=1);

namespace App\Repositories\Email;

use App\Contracts\Email\EmailProviderRepositoryInterface;
use App\Models\Email\EmailProvider;
use App\Repositories\BaseRepository;
use Illuminate\Support\Collection;

final class EmailProviderRepository extends BaseRepository implements EmailProviderRepositoryInterface
{
    public function __construct()
    {
        $this->model = new EmailProvider();
    }

    /**
     * Get all active providers ordered by priority
     */
    public function getActivePrioritized(): Collection
    {
        return EmailProvider::active()
            ->byPriority()
            ->get();
    }

    /**
     * Get default provider
     */
    public function getDefault(): ?EmailProvider
    {
        return EmailProvider::active()
            ->default()
            ->first();
    }

    /**
     * Get provider by driver
     */
    public function getByDriver(string $driver): Collection
    {
        return EmailProvider::active()
            ->where('driver', $driver)
            ->get();
    }

    /**
     * Set provider as default (and unset others)
     */
    public function setAsDefault(int $providerId): bool
    {
        // Unset all defaults
        EmailProvider::where('is_default', true)->update(['is_default' => false]);

        // Set new default
        $provider = $this->findById($providerId);
        if ($provider) {
            $provider->update(['is_default' => true]);
            return true;
        }

        return false;
    }

    /**
     * Get providers that haven't been used recently
     */
    public function getUnused(int $days = 30): Collection
    {
        return EmailProvider::where(function ($query) use ($days) {
            $query->whereNull('last_used_at')
                ->orWhere('last_used_at', '<', now()->subDays($days));
        })->get();
    }
}
