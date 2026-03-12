import { useCallback, useEffect, useRef, useState } from 'react';
import type { FakeApiEndpoint, FakeApiLog } from '@/types/fake-api';

const API_BASE = '/fake-api-tool';
const POLL_INTERVAL = 3000;

export function useFakeApi() {
    const [endpoint, setEndpoint] = useState<FakeApiEndpoint | null>(null);
    const [logs, setLogs] = useState<FakeApiLog[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

            if (!response.ok) throw new Error('Failed to initialize endpoint');

            const json = await response.json();
            setEndpoint(json.data);
            return json.data as FakeApiEndpoint;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLogs = useCallback(async (uuid: string, since?: string | null) => {
        try {
            const params = new URLSearchParams();
            if (since) params.set('since', since);

            const response = await fetch(
                `${API_BASE}/endpoints/${uuid}/logs?${params.toString()}`,
                { headers: { Accept: 'application/json' } },
            );

            if (!response.ok) return;

            const json = await response.json();
            const newLogs: FakeApiLog[] = json.data ?? [];

            if (since && newLogs.length > 0) {
                setLogs((prev) => {
                    const existingIds = new Set(prev.map((l) => l.id));
                    const filtered = newLogs.filter((l) => !existingIds.has(l.id));
                    return [...filtered, ...prev];
                });
            } else if (!since) {
                setLogs(newLogs);
            }

            setTotalLogs(json.total ?? newLogs.length);

            if (newLogs.length > 0) {
                lastPollTimeRef.current = newLogs[0].created_at;
            }
        } catch {
            // Silently fail polling
        }
    }, []);

    const startPolling = useCallback(
        (uuid: string) => {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = setInterval(() => {
                fetchLogs(uuid, lastPollTimeRef.current);
            }, POLL_INTERVAL);
        },
        [fetchLogs],
    );

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const updateEndpoint = useCallback(
        async (uuid: string, data: Partial<Pick<FakeApiEndpoint, 'name' | 'status_code' | 'content_type' | 'response_body' | 'delay_ms'>>) => {
            try {
                setSaving(true);
                const response = await fetch(`${API_BASE}/endpoints/${uuid}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) throw new Error('Failed to save endpoint');

                const json = await response.json();
                setEndpoint(json.data);
                return json.data as FakeApiEndpoint;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                return null;
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    const clearLogs = useCallback(async (uuid: string) => {
        try {
            await fetch(`${API_BASE}/endpoints/${uuid}/logs`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });
            setLogs([]);
            setTotalLogs(0);
            lastPollTimeRef.current = null;
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => () => stopPolling(), [stopPolling]);

    return {
        endpoint,
        logs,
        totalLogs,
        loading,
        saving,
        error,
        initEndpoint,
        fetchLogs,
        startPolling,
        stopPolling,
        updateEndpoint,
        clearLogs,
    };
}
