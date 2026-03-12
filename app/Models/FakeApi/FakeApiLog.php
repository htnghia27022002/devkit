<?php

declare(strict_types=1);

namespace App\Models\FakeApi;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class FakeApiLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'fake_api_endpoint_id',
        'uuid',
        'method',
        'path',
        'query_string',
        'headers',
        'body',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'headers'    => 'array',
        'created_at' => 'datetime',
    ];

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(FakeApiEndpoint::class, 'fake_api_endpoint_id');
    }
}
