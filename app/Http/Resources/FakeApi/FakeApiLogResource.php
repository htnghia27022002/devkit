<?php

declare(strict_types=1);

namespace App\Http\Resources\FakeApi;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FakeApiLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'uuid'         => $this->uuid,
            'method'       => $this->method,
            'path'         => $this->path,
            'query_string' => $this->query_string,
            'headers'      => $this->headers,
            'body'         => $this->body,
            'ip_address'   => $this->ip_address,
            'user_agent'   => $this->user_agent,
            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}
