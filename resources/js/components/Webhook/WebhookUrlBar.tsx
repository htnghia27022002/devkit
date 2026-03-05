import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { CopyIcon, CheckIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function WebhookUrlBar({
    url,
    status,
    expiresAt,
    totalRequests,
    onClear,
}: {
    url: string;
    status: string;
    expiresAt: string | null;
    totalRequests: number;
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
                        Your URL
                    </span>
                </div>

                <code className="min-w-0 flex-1 truncate text-sm font-medium text-primary">
                    {url}
                </code>

                <Button
                    variant={copied ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={handleCopy}
                    className={cn(
                        'h-7 px-2.5 text-xs',
                        copied && 'text-emerald-600 dark:text-emerald-400',
                    )}
                >
                    {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                </Button>

                <Separator orientation="vertical" className="h-4" />

                <Badge variant="secondary" className="text-[11px] font-normal">
                    {totalRequests} request{totalRequests !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="gap-1.5 text-[11px] font-normal">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live
                </Badge>
                {expiryLabel && (
                    <span className="text-[11px] text-muted-foreground/50">
                        {expiryLabel}
                    </span>
                )}

                {totalRequests > 0 && (
                    <>
                        <Separator orientation="vertical" className="h-4" />
                        <Button variant="ghost" size="sm" onClick={onClear} className="h-7 px-2.5 text-xs text-muted-foreground hover:text-destructive">
                            <Trash2Icon className="size-3.5" />
                            Clear all
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
