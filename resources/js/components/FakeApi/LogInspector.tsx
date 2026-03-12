import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FakeApiLog } from '@/types/fake-api';

const METHOD_COLORS: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    POST: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    PUT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    PATCH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400',
    HEAD: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    OPTIONS: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(dateStr).toLocaleTimeString();
}

function LogEntry({ log }: { log: FakeApiLog }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border-b border-border/50 last:border-0">
            <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50"
                onClick={() => setExpanded((v) => !v)}
            >
                {expanded
                    ? <ChevronDownIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    : <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                }
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold', METHOD_COLORS[log.method] ?? '')}>
                    {log.method}
                </span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
                    {log.path ?? '/'}
                    {log.query_string ? <span className="text-muted-foreground">?{log.query_string}</span> : null}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(log.created_at)}</span>
            </button>

            {expanded && (
                <div className="space-y-2 bg-muted/30 px-3 pb-3 pt-1 text-xs">
                    <div>
                        <p className="mb-1 font-semibold text-muted-foreground">IP</p>
                        <code className="text-foreground">{log.ip_address}</code>
                    </div>

                    <div>
                        <p className="mb-1 font-semibold text-muted-foreground">Headers</p>
                        <pre className="max-h-32 overflow-auto rounded bg-background/60 p-2 font-mono text-[11px] leading-relaxed">
                            {JSON.stringify(log.headers, null, 2)}
                        </pre>
                    </div>

                    {log.body && (
                        <div>
                            <p className="mb-1 font-semibold text-muted-foreground">Body</p>
                            <pre className="max-h-40 overflow-auto rounded bg-background/60 p-2 font-mono text-[11px] leading-relaxed">
                                {(() => {
                                    try { return JSON.stringify(JSON.parse(log.body), null, 2); }
                                    catch { return log.body; }
                                })()}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function LogInspector({ logs }: { logs: FakeApiLog[] }) {
    return (
        <Card className="flex flex-1 flex-col overflow-hidden shadow-none">
            <CardHeader className="shrink-0 px-4 pt-3 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Incoming Calls</CardTitle>
                    {logs.length > 0 && (
                        <Badge variant="secondary" className="text-[11px]">{logs.length}</Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground">
                        <p className="font-medium">No calls yet</p>
                        <p className="mt-1 text-xs">Use the endpoint URL in your frontend code to see requests here.</p>
                    </div>
                ) : (
                    <div>
                        {logs.map((log) => (
                            <LogEntry key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
