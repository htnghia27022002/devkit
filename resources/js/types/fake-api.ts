export interface FakeApiEndpoint {
    id: number;
    uuid: string;
    name: string | null;
    status: 'active' | 'disabled';
    status_code: number;
    content_type: string;
    response_body: string | null;
    delay_ms: number;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface FakeApiLog {
    id: number;
    uuid: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    path: string | null;
    query_string: string | null;
    headers: Record<string, string | string[]>;
    body: string | null;
    ip_address: string;
    user_agent: string | null;
    created_at: string;
}
