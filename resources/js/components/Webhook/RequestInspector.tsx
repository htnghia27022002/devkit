import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRightIcon, ClockIcon, CopyIcon, MousePointerClickIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import type { WebhookRequest } from '@/types/webhook';

const METHOD_VARIANTS: Record<string, string> = {
    GET: 'bg-emerald-600 text-white border-transparent',
    POST: 'bg-blue-600 text-white border-transparent',
    PUT: 'bg-amber-600 text-white border-transparent',
    PATCH: 'bg-yellow-600 text-white border-transparent',
    DELETE: 'bg-red-600 text-white border-transparent',
    HEAD: 'bg-purple-600 text-white border-transparent',
    OPTIONS: 'bg-gray-600 text-white border-transparent',
};

function formatSize(bytes: number): string {
    if (bytes === 0) return '0 bytes';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'a few seconds ago';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
}

function useIsDark() {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return dark;
}

function MethodBadge({ method, size = 'sm' }: { method: string; size?: 'sm' | 'md' }) {
    return (
        <Badge
            className={cn(
                'rounded font-bold uppercase tracking-wider',
                METHOD_VARIANTS[method] ?? METHOD_VARIANTS.GET,
                size === 'sm' ? 'px-1.5 py-0.5 text-[10px] min-w-[38px]' : 'px-2.5 py-1 text-xs min-w-[52px]',
            )}
        >
            {method}
        </Badge>
    );
}

/* ── Truncated value cell: 1 line with "..." , full text on hover ── */
function TruncatedValue({ value }: { value: string }) {
    if (value.length <= 60) {
        return <span className="text-xs text-muted-foreground">{value}</span>;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="block max-w-full cursor-default truncate text-xs text-muted-foreground">
                    {value}
                </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-md break-all text-xs">
                {value}
            </TooltipContent>
        </Tooltip>
    );
}

/* ─── Left panel: request list item ─── */
function RequestItem({
    request,
    isSelected,
    onClick,
}: {
    request: WebhookRequest;
    isSelected: boolean;
    onClick: () => void;
}) {
    const [ago, setAgo] = useState(() => timeAgo(request.created_at));

    useEffect(() => {
        const timer = setInterval(() => setAgo(timeAgo(request.created_at)), 5000);
        return () => clearInterval(timer);
    }, [request.created_at]);

    const shortId = request.uuid.substring(0, 8);
    const isNew = request.seen_at === null;

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2 border-b px-3 py-2 text-left transition-colors',
                'border-border/40 hover:bg-accent/50',
                isSelected && 'bg-accent border-l-[3px] border-l-primary',
                !isSelected && 'border-l-[3px] border-l-transparent',
            )}
        >
            <div className="flex shrink-0">
                {isNew ? <span className="h-2 w-2 rounded-full bg-primary" /> : <span className="h-2 w-2" />}
            </div>
            <MethodBadge method={request.method} size="sm" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">#{shortId}</p>
                <p className="truncate text-[11px] text-muted-foreground">{request.ip_address}</p>
                <p className="text-[10px] text-muted-foreground/60">{ago}</p>
            </div>
        </button>
    );
}

/* ─── Collapsible section wrapper ─── */
function Section({
    title,
    count,
    defaultOpen = true,
    children,
}: {
    title: string;
    count?: number;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-1.5 text-left transition-colors hover:bg-accent/50">
                <ChevronRightIcon
                    className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform duration-200', open && 'rotate-90')}
                />
                <span className="text-sm font-semibold text-foreground">{title}</span>
                {count !== undefined && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] font-normal">
                        {count}
                    </Badge>
                )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-2">
                {children}
            </CollapsibleContent>
            <Separator />
        </Collapsible>
    );
}

/* ─── Right panel: detail view (webhook.site style layout) ─── */
function DetailPanel({ request }: { request: WebhookRequest }) {
    const headerEntries = useMemo(() => Object.entries(request.headers), [request.headers]);
    const queryEntries = useMemo(
        () => (request.query_params ? Object.entries(request.query_params) : []),
        [request.query_params],
    );
    const formEntries = useMemo(
        () =>
            request.parsed_body && request.content_type?.includes('form')
                ? Object.entries(request.parsed_body)
                : [],
        [request.parsed_body, request.content_type],
    );

    return (
        <div className="flex h-full flex-col overflow-y-auto">
            {/* ── Request Details & Headers (2-column) ── */}
            <Section title="Request Details & Headers">
                <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
                    {/* Left column: request details */}
                    <div>
                        <div className="flex items-center gap-2 py-1">
                            <MethodBadge method={request.method} size="md" />
                            <a
                                href={request.url}
                                target="_blank"
                                rel="noreferrer"
                                className="min-w-0 truncate text-xs text-primary hover:underline"
                            >
                                {request.url}
                            </a>
                        </div>
                        <KVRow label="Host" value={request.ip_address} />
                        <KVRow label="Date" value={`${formatDate(request.created_at)} (${timeAgo(request.created_at)})`} />
                        <KVRow label="Size" value={formatSize(request.size)} />
                        <KVRow label="ID" value={request.uuid} mono />
                        {request.content_type && <KVRow label="Content-Type" value={request.content_type} truncate />}
                    </div>

                    {/* Right column: headers */}
                    <div>
                        {headerEntries.length > 0 ? (
                            headerEntries.map(([key, value]) => (
                                <KVRow
                                    key={key}
                                    label={key}
                                    value={Array.isArray(value) ? value.join(', ') : String(value)}
                                    truncate
                                />
                            ))
                        ) : (
                            <p className="py-1 text-xs italic text-muted-foreground/60">No headers</p>
                        )}
                    </div>
                </div>
            </Section>

            {/* ── Query Strings & Form Values (side by side) ── */}
            <div className="grid grid-cols-2 border-b border-border">
                <div className="border-r border-border px-4 py-2">
                    <h4 className="mb-1 text-sm font-semibold text-foreground">Query strings</h4>
                    {queryEntries.length > 0 ? (
                        queryEntries.map(([key, value]) => (
                            <KVRow key={key} label={key} value={String(value)} highlight truncate />
                        ))
                    ) : (
                        <p className="py-1 text-xs italic text-muted-foreground/60">None</p>
                    )}
                </div>
                <div className="px-4 py-2">
                    <h4 className="mb-1 text-sm font-semibold text-foreground">Form values</h4>
                    {formEntries.length > 0 ? (
                        formEntries.map(([key, value]) => (
                            <KVRow key={key} label={key} value={String(value)} highlight truncate />
                        ))
                    ) : (
                        <p className="py-1 text-xs italic text-muted-foreground/60">None</p>
                    )}
                </div>
            </div>

            {/* ── Request Content / Body ── */}
            <Section title="Request Content">
                {request.body ? (
                    <RequestBody body={request.body} parsed={request.parsed_body} />
                ) : (
                    <p className="py-1 text-xs italic text-muted-foreground/60">No content</p>
                )}
            </Section>
        </div>
    );
}

/* ─── Key-value row (1 line, truncated, hover to expand) ─── */
function KVRow({
    label,
    value,
    mono,
    highlight,
    truncate: shouldTruncate,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
    highlight?: boolean;
    truncate?: boolean;
}) {
    const stringVal = typeof value === 'string' ? value : null;

    return (
        <div className="flex items-center gap-3 py-0.5">
            <span
                className={cn(
                    'w-40 shrink-0 text-xs',
                    highlight ? 'font-semibold text-primary' : 'text-foreground/70',
                )}
            >
                {label}
            </span>
            <div className={cn('min-w-0 flex-1 overflow-hidden', mono && 'font-mono')}>
                {stringVal && shouldTruncate ? (
                    <TruncatedValue value={stringVal} />
                ) : typeof value === 'string' ? (
                    <span className="text-xs text-muted-foreground">{value}</span>
                ) : (
                    <div className="text-xs text-foreground">{value}</div>
                )}
            </div>
        </div>
    );
}

/* ─── Body renderer with react-json-view-lite ─── */
function RequestBody({ body, parsed }: { body: string; parsed: Record<string, unknown> | null }) {
    const [showRaw, setShowRaw] = useState(false);
    const isDark = useIsDark();

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(body);
    }, [body]);

    const jsonStyles = useMemo(
        () => ({
            ...(isDark ? darkStyles : defaultStyles),
            container: 'json-view-container',
        }),
        [isDark],
    );

    return (
        <div>
            <div className="mb-2 flex items-center gap-1.5">
                {parsed && (
                    <Button
                        variant={showRaw ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => setShowRaw((v) => !v)}
                        className="h-6 px-2 text-[10px]"
                    >
                        {showRaw ? 'Formatted' : 'Raw'}
                    </Button>
                )}
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-6 px-2 text-[10px]"
                >
                    <CopyIcon className="size-3" />
                    Copy
                </Button>
            </div>

            {!showRaw && parsed ? (
                <div className="max-h-[60vh] overflow-auto rounded-md bg-muted/50 p-3 text-xs">
                    <JsonView data={parsed} style={jsonStyles} />
                </div>
            ) : (
                <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap break-all">
                    {body}
                </pre>
            )}
        </div>
    );
}

/* ─── Main export ─── */
export default function RequestInspector({
    requests,
    selectedId,
    onSelect,
}: {
    requests: WebhookRequest[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}) {
    const selectedRequest = requests.find((r) => r.id === selectedId);

    return (
        <Card className="flex min-h-0 flex-1 flex-row gap-0 overflow-hidden py-0 shadow-none">
            {/* ── Left: Request list ── */}
            <div className="flex w-56 shrink-0 flex-col lg:w-64 xl:w-72">
                <div className="flex items-center justify-between px-3 py-2">
                    <Badge variant="outline" className="text-[11px] font-normal">
                        INBOX ({requests.length})
                    </Badge>
                    <span className="text-[10px] text-muted-foreground/60">Newest First</span>
                </div>
                <Separator />
                <div className="flex-1 overflow-y-auto">
                    {requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                            <ClockIcon className="mb-3 size-8 text-muted-foreground/30" />
                            <p className="text-xs font-medium text-muted-foreground">Waiting for first request...</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <RequestItem
                                key={req.id}
                                request={req}
                                isSelected={selectedId === req.id}
                                onClick={() => onSelect(req.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            <Separator orientation="vertical" />

            {/* ── Right: Detail panel ── */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {selectedRequest ? (
                    <DetailPanel request={selectedRequest} />
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                        <MousePointerClickIcon className="size-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">Select a request to inspect</p>
                        <p className="text-xs text-muted-foreground/50">Click on any request from the list</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
