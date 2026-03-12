import { useCallback, useEffect, useState } from 'react';
import { CheckIcon, SaveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import type { FakeApiEndpoint } from '@/types/fake-api';

const CONTENT_TYPES = [
    'application/json',
    'text/plain',
    'text/html',
    'application/xml',
    'text/xml',
];

const STATUS_CODES = [200, 201, 204, 301, 302, 400, 401, 403, 404, 422, 500, 502, 503];

export default function ResponseEditor({
    endpoint,
    onSave,
    saving,
}: {
    endpoint: FakeApiEndpoint;
    onSave: (data: Partial<FakeApiEndpoint>) => void;
    saving: boolean;
}) {
    const [statusCode, setStatusCode] = useState(endpoint.status_code);
    const [contentType, setContentType] = useState(endpoint.content_type);
    const [responseBody, setResponseBody] = useState(endpoint.response_body ?? '{}');
    const [delayMs, setDelayMs] = useState(endpoint.delay_ms);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    // Sync when endpoint changes from outside
    useEffect(() => {
        setStatusCode(endpoint.status_code);
        setContentType(endpoint.content_type);
        setResponseBody(endpoint.response_body ?? '{}');
        setDelayMs(endpoint.delay_ms);
    }, [endpoint.uuid]);

    const validateJson = useCallback((value: string) => {
        if (!contentType.includes('json')) {
            setJsonError(null);
            return;
        }
        try {
            JSON.parse(value);
            setJsonError(null);
        } catch {
            setJsonError('Invalid JSON');
        }
    }, [contentType]);

    const handleBodyChange = (value: string) => {
        setResponseBody(value);
        validateJson(value);
    };

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(responseBody);
            setResponseBody(JSON.stringify(parsed, null, 2));
            setJsonError(null);
        } catch {
            // ignore if not valid JSON
        }
    };

    const handleSave = async () => {
        await onSave({ status_code: statusCode, content_type: contentType, response_body: responseBody, delay_ms: delayMs });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <Card className="flex flex-1 flex-col overflow-hidden shadow-none">
            <CardHeader className="shrink-0 px-4 pt-3 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Response Template</CardTitle>
                    <Button
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={handleSave}
                        disabled={saving || !!jsonError}
                    >
                        {saving ? (
                            <Spinner className="h-3.5 w-3.5" />
                        ) : saved ? (
                            <CheckIcon className="h-3.5 w-3.5" />
                        ) : (
                            <SaveIcon className="h-3.5 w-3.5" />
                        )}
                        {saved ? 'Saved' : 'Save'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
                {/* Row: Status Code + Content-Type + Delay */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <select
                            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            value={statusCode}
                            onChange={(e) => setStatusCode(Number(e.target.value))}
                        >
                            {STATUS_CODES.map((code) => (
                                <option key={code} value={code}>{code}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs text-muted-foreground">Content-Type</Label>
                        <select
                            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            value={contentType}
                            onChange={(e) => setContentType(e.target.value)}
                        >
                            {CONTENT_TYPES.map((ct) => (
                                <option key={ct} value={ct}>{ct}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label className="text-xs text-muted-foreground">Delay (ms)</Label>
                        <Input
                            type="number"
                            min={0}
                            max={10000}
                            step={100}
                            value={delayMs}
                            onChange={(e) => setDelayMs(Number(e.target.value))}
                            className="h-8 text-sm"
                        />
                    </div>
                </div>

                {/* Body editor */}
                <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Response Body</Label>
                        {contentType.includes('json') && (
                            <button
                                onClick={handleFormat}
                                className="text-[11px] text-primary hover:underline"
                            >
                                Format JSON
                            </button>
                        )}
                    </div>
                    <div className="relative flex-1">
                        <textarea
                            className="h-full min-h-[280px] w-full resize-none rounded-md border border-input bg-muted/40 p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring"
                            value={responseBody}
                            onChange={(e) => handleBodyChange(e.target.value)}
                            spellCheck={false}
                            placeholder={'{\n  "success": true,\n  "data": []\n}'}
                        />
                        {jsonError && (
                            <p className="mt-1 text-[11px] text-destructive">{jsonError}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
