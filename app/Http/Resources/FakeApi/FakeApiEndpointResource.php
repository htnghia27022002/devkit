<?php

declare(strict_types=1);

namespace App\Http\Resources\FakeApi;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FakeApiEndpointResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'uuid'          => $this->uuid,
            'name'          => $this->name,
            'status'        => $this->status,
            'status_code'   => $this->status_code,
            'content_type'  => $this->content_type,
            'response_body' => $this->response_body,
            'delay_ms'      => $this->delay_ms,
            'expires_at'    => $this->expires_at?->toISOString(),
            'created_at'    => $this->created_at?->toISOString(),
            'updated_at'    => $this->updated_at?->toISOString(),
        ];
    }
}
