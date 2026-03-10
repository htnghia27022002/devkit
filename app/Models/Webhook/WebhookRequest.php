<?php

declare(strict_types=1);

namespace App\Models\Webhook;

use App\Enums\Webhook\WebhookMethod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class WebhookRequest extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'webhook_endpoint_id',
        'uuid',
        'method',
        'url',
        'query_string',
        'query_params',
        'headers',
        'content_type',
        'body',
        'parsed_body',
        'ip_address',
        'user_agent',
        'size',
        'seen_at',
    ];

    protected $casts = [
        'method' => WebhookMethod::class,
        'query_params' => 'array',
        'headers' => 'array',
        'parsed_body' => 'array',
        'size' => 'integer',
        'created_at' => 'datetime',
        'seen_at' => 'datetime',
    ];

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class, 'webhook_endpoint_id');
    }
}
