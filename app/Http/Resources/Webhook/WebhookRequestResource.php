<?php

declare(strict_types=1);

namespace App\Http\Resources\Webhook;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebhookRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'method' => $this->method,
            'url' => $this->url,
            'query_string' => $this->query_string,
            'query_params' => $this->query_params,
            'headers' => $this->headers,
            'content_type' => $this->content_type,
            'body' => $this->body,
            'parsed_body' => $this->parsed_body,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'size' => $this->size,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
