import { Head, Link, usePage } from '@inertiajs/react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GlobeIcon } from 'lucide-react';
import type { SharedData } from '@/types';
import { useFakeApi } from '@/hooks/use-fake-api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import AppearanceToggleButton from '@/components/appearance-toggle-button';
import FakeApiUrlBar from '@/components/FakeApi/FakeApiUrlBar';
import ResponseEditor from '@/components/FakeApi/ResponseEditor';
import LogInspector from '@/components/FakeApi/LogInspector';
import type { FakeApiEndpoint } from '@/types/fake-api';

export default function FakeApiIndex() {
    const { auth } = usePage<SharedData>().props;
    const {
        endpoint,
        logs,
        totalLogs,
        loading,
        saving,
        error,
        initEndpoint,
        fetchLogs,
        startPolling,
        clearLogs,
        updateEndpoint,
    } = useFakeApi();

    const [initializing, setInitializing] = useState(true);
    const initRef = useRef(false);

    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        (async () => {
            try {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                // Prefix fingerprint so it doesn't collide with webhook endpoints
                const fingerprint = `fakeapi_${result.visitorId}`;
                const ep = await initEndpoint(fingerprint);

                if (ep) {
                    await fetchLogs(ep.uuid);
                    startPolling(ep.uuid);
                }
            } catch {
                // handled by hook
            } finally {
                setInitializing(false);
            }
        })();
    }, [initEndpoint, fetchLogs, startPolling]);

    const endpointUrl = endpoint
        ? `${window.location.origin}/fake-api/${endpoint.uuid}`
        : '';

    const handleSave = useCallback(
        async (data: Partial<FakeApiEndpoint>) => {
            if (!endpoint) return;
            await updateEndpoint(endpoint.uuid, data);
        },
        [endpoint, updateEndpoint],
    );

    const handleClear = useCallback(async () => {
        if (!endpoint) return;
        await clearLogs(endpoint.uuid);
    }, [endpoint, clearLogs]);

    return (
        <>
            <Head title="Fake API — DevKit" />
            <div className="flex h-screen flex-col overflow-hidden bg-background">

                {/* Header */}
                <header className="shrink-0 border-b border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
                        <Button variant="ghost" asChild className="gap-2 px-2">
                            <Link href="/">
                                <GlobeIcon className="size-5 text-primary" />
                                <span className="text-lg font-semibold">Fake API</span>
                            </Link>
                        </Button>
                        <nav className="flex items-center gap-2">
                            <AppearanceToggleButton className="text-muted-foreground hover:text-foreground" />
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

                {/* Main */}
                <main className="flex w-full flex-1 flex-col gap-2 overflow-hidden px-4 py-2 sm:px-6">
                    {(initializing || loading) && !endpoint && (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Spinner className="size-8" />
                                <p className="text-sm text-muted-foreground">Setting up your fake API endpoint...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {endpoint && (
                        <>
                            <FakeApiUrlBar
                                url={endpointUrl}
                                status={endpoint.status as string}
                                expiresAt={endpoint.expires_at}
                                totalLogs={totalLogs}
                                onClear={handleClear}
                            />

                            <div className="flex min-h-0 flex-1 gap-2">
                                <div className="flex w-1/2 flex-col overflow-hidden">
                                    <ResponseEditor
                                        endpoint={endpoint}
                                        onSave={handleSave}
                                        saving={saving}
                                    />
                                </div>
                                <div className="flex w-1/2 flex-col overflow-hidden">
                                    <LogInspector logs={logs} />
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}
