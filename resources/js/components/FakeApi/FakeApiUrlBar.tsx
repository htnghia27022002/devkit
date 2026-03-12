import { useCallback, useState } from 'react';
import { CheckIcon, CopyIcon, Trash2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function FakeApiUrlBar({
    url,
    status,
    expiresAt,
    totalLogs,
    onClear,
}: {
    url: string;
    status: string;
    expiresAt: string | null;
    totalLogs: number;
    onClear: () => void;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [url]);

    const expiryLabel = expiresAt
        ? `Expires ${new Date(expiresAt).toLocaleDateString()}`
        : null;

    return (
        <Card className="gap-0 py-0 shadow-none">
            <CardContent className="flex flex-wrap items-center gap-2 px-4 py-2 sm:gap-3">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'h-2 w-2 shrink-0 rounded-full',
                            status === 'active'
                                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                                : 'bg-gray-400',
                        )}
                    />
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Endpoint URL
                    </span>
                </div>

                <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-0.5 text-xs text-foreground">
                    {url}
                </code>

                <div className="flex shrink-0 items-center gap-1.5">
                    {expiryLabel && (
                        <Badge variant="outline" className="hidden text-[11px] sm:inline-flex">
                            {expiryLabel}
                        </Badge>
                    )}

                    <Badge variant="secondary" className="text-[11px]">
                        {totalLogs} {totalLogs === 1 ? 'call' : 'calls'}
                    </Badge>

                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                        {copied ? <CheckIcon className="h-3.5 w-3.5 text-emerald-500" /> : <CopyIcon className="h-3.5 w-3.5" />}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={onClear}
                        title="Clear all logs"
                    >
                        <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
