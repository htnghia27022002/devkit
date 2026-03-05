import { Head, Link, usePage } from '@inertiajs/react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinkIcon } from 'lucide-react';
import type { SharedData } from '@/types';
import { useWebhook } from '@/hooks/use-webhook';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import WebhookUrlBar from '@/components/Webhook/WebhookUrlBar';
import RequestInspector from '@/components/Webhook/RequestInspector';

export default function WebhookIndex() {
    const { auth } = usePage<SharedData>().props;
    const {
        endpoint,
        requests,
        totalRequests,
        loading,
        error,
        initEndpoint,
        fetchRequests,
        startPolling,
        clearRequests,
    } = useWebhook();

    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [readIds, setReadIds] = useState<Set<number>>(new Set());
    const [initializing, setInitializing] = useState(true);
    const initRef = useRef(false);

    // Initialize fingerprint & endpoint
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        (async () => {
            try {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                const ep = await initEndpoint(result.visitorId);

                if (ep) {
                    await fetchRequests(ep.uuid);
                    startPolling(ep.uuid);
                }
            } catch {
                // handled by hook
            } finally {
                setInitializing(false);
            }
        })();
    }, [initEndpoint, fetchRequests, startPolling]);

    // Auto-select first request
    useEffect(() => {
        if (requests.length > 0 && selectedRequestId === null) {
            setSelectedRequestId(requests[0].id);
        }
    }, [requests, selectedRequestId]);

    const webhookUrl = endpoint
        ? `${window.location.origin}/webhook/${endpoint.uuid}`
        : '';

    const handleSelect = useCallback((id: number) => {
        setSelectedRequestId(id);
        setReadIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    }, []);

    const handleClear = useCallback(async () => {
        if (!endpoint) return;
        await clearRequests(endpoint.uuid);
        setSelectedRequestId(null);
        setReadIds(new Set());
    }, [endpoint, clearRequests]);

    return (
        <>
            <Head title="Webhook Testing" />
            <div className="flex h-screen flex-col overflow-hidden bg-background">
                {/* Header */}
                <header className="shrink-0 border-b border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
                        <Button variant="ghost" asChild className="gap-2 px-2">
                            <Link href="/">
                                <LinkIcon className="size-5 text-primary" />
                                <span className="text-lg font-semibold">Webhook Tester</span>
                            </Link>
                        </Button>
                        <nav className="flex items-center gap-2">
                            {auth.user ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/login">Log in</Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/register">Sign up</Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex w-full flex-1 flex-col gap-2 overflow-hidden px-4 py-2 sm:px-6">
                    {/* Loading State */}
                    {(initializing || loading) && !endpoint && (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Spinner className="size-8" />
                                <p className="text-sm text-muted-foreground">Setting up your webhook...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Endpoint ready */}
                    {endpoint && (
                        <>
                            <WebhookUrlBar
                                url={webhookUrl}
                                status={endpoint.status}
                                expiresAt={endpoint.expires_at}
                                totalRequests={totalRequests}
                                onClear={handleClear}
                            />

                            <RequestInspector
                                requests={requests}
                                selectedId={selectedRequestId}
                                readIds={readIds}
                                onSelect={handleSelect}
                            />
                        </>
                    )}
                </main>

                {/* Footer */}
                <footer className="shrink-0">
                    <Separator />
                    <div className="flex items-center justify-between px-4 py-2 text-[11px] text-muted-foreground/50 sm:px-6">
                        <span>Endpoints expire after 7 days of inactivity</span>
                        <span>Auto-refresh every 2s</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
