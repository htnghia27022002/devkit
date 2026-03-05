import { useCallback, useEffect, useRef, useState } from 'react';
import type { WebhookEndpoint, WebhookRequest } from '@/types/webhook';

const API_BASE = '/webhooks';
const POLL_INTERVAL = 2000;

export function useWebhook() {
    const [endpoint, setEndpoint] = useState<WebhookEndpoint | null>(null);
    const [requests, setRequests] = useState<WebhookRequest[]>([]);
    const [totalRequests, setTotalRequests] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPollTimeRef = useRef<string | null>(null);

    const getCsrfToken = (): string => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta?.getAttribute('content') ?? '';
    };

    const initEndpoint = useCallback(async (fingerprint: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE}/endpoints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ fingerprint }),
            });

            if (!response.ok) {
                throw new Error('Failed to initialize endpoint');
            }

            const json = await response.json();
            setEndpoint(json.data);

            return json.data as WebhookEndpoint;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRequests = useCallback(
        async (uuid: string, since?: string | null) => {
            try {
                const params = new URLSearchParams();
                if (since) params.set('since', since);

                const response = await fetch(
                    `${API_BASE}/endpoints/${uuid}/requests?${params.toString()}`,
                    {
                        headers: { Accept: 'application/json' },
                    },
                );

                if (!response.ok) return;

                const json = await response.json();
                const newRequests: WebhookRequest[] = json.data ?? [];

                if (since && newRequests.length > 0) {
                    // Prepend new requests (polling mode)
                    setRequests((prev) => {
                        const existingIds = new Set(prev.map((r) => r.id));
                        const filtered = newRequests.filter(
                            (r) => !existingIds.has(r.id),
                        );
                        return [...filtered, ...prev];
                    });
                } else if (!since) {
                    // Full load
                    setRequests(newRequests);
                }

                setTotalRequests(json.total ?? newRequests.length);

                // Track last poll time
                if (newRequests.length > 0) {
                    lastPollTimeRef.current = newRequests[0].created_at;
                }
            } catch {
                // Silently fail polling
            }
        },
        [],
    );

    const startPolling = useCallback(
        (uuid: string) => {
            if (pollingRef.current) clearInterval(pollingRef.current);

            pollingRef.current = setInterval(() => {
                fetchRequests(uuid, lastPollTimeRef.current);
            }, POLL_INTERVAL);
        },
        [fetchRequests],
    );

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const clearRequests = useCallback(
        async (uuid: string) => {
            try {
                await fetch(`${API_BASE}/endpoints/${uuid}/requests`, {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                });
                setRequests([]);
                setTotalRequests(0);
                lastPollTimeRef.current = null;
            } catch {
                // ignore
            }
        },
        [],
    );

    const updateSettings = useCallback(
        async (uuid: string, data: Partial<Pick<WebhookEndpoint, 'default_status_code' | 'default_content_type' | 'default_response_body'>>) => {
            try {
                const response = await fetch(`${API_BASE}/endpoints/${uuid}/settings`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) throw new Error('Failed to update settings');

                const json = await response.json();
                setEndpoint(json.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
        },
        [],
    );

    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    return {
        endpoint,
        requests,
        totalRequests,
        loading,
        error,
        initEndpoint,
        fetchRequests,
        startPolling,
        stopPolling,
        clearRequests,
        updateSettings,
    };
}
