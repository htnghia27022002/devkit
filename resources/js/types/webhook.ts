export interface WebhookEndpoint {
    id: number;
    uuid: string;
    status: 'active' | 'expired' | 'disabled';
    default_status_code: number;
    default_content_type: string;
    default_response_body: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface WebhookRequest {
    id: number;
    uuid: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    url: string;
    query_string: string | null;
    query_params: Record<string, string> | null;
    headers: Record<string, string | string[]>;
    content_type: string | null;
    body: string | null;
    parsed_body: Record<string, unknown> | null;
    ip_address: string;
    user_agent: string | null;
    size: number;
    seen_at: string | null;
    created_at: string;
}
