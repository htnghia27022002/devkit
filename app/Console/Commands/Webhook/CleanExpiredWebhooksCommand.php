<?php

declare(strict_types=1);

namespace App\Console\Commands\Webhook;

use App\Contracts\Webhook\WebhookServiceInterface;
use Illuminate\Console\Command;

final class CleanExpiredWebhooksCommand extends Command
{
    protected $signature = 'webhook:clean-expired';

    protected $description = 'Remove expired webhook endpoints and their request history';

    public function handle(WebhookServiceInterface $service): int
    {
        $count = $service->cleanExpiredEndpoints();

        $this->info("Cleaned {$count} expired webhook endpoint(s).");

        return self::SUCCESS;
    }
}
