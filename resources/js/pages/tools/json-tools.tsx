import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    BracesIcon,
    CheckCircleIcon,
    CopyIcon,
    LinkIcon,
    XCircleIcon,
} from 'lucide-react';
import { JsonView, darkStyles, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import type { SharedData } from '@/types';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

type ToolId = 'format' | 'minify' | 'validate' | 'decode' | 'encode';

interface Tool {
    id: ToolId;
    label: string;
    description: string;
    action: string;
}

const TOOLS: Tool[] = [
    {
        id: 'format',
        label: 'Format',
        description: 'Prettify JSON with proper indentation for easy reading.',
        action: 'Format JSON',
    },
    {
        id: 'minify',
        label: 'Minify',
        description: 'Compress JSON to a single compact line, removing whitespace.',
        action: 'Minify JSON',
    },
    {
        id: 'validate',
        label: 'Validate',
        description: 'Check whether your JSON is syntactically valid and inspect any errors.',
        action: 'Validate JSON',
    },
    {
        id: 'decode',
        label: 'Decode',
        description: 'Parse a JSON string and explore its structure in an interactive tree view.',
        action: 'Decode JSON',
    },
    {
        id: 'encode',
        label: 'Encode',
        description: 'Stringify a JSON value into an escaped string literal, ready for embedding.',
        action: 'Encode to String',
    },
];

function useIsDark() {
    const [dark, setDark] = useState(
        () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    return dark;
}

export default function JsonTools() {
    const { auth } = usePage<SharedData>().props;

    const [activeTool, setActiveTool] = useState<ToolId>('format');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [parsedJson, setParsedJson] = useState<unknown>(null);
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [copied, setCopied] = useState(false);
    const [indentSize, setIndentSize] = useState(2);

    const isDark = useIsDark();

    const jsonStyles = useMemo(
        () => ({
            ...(isDark ? darkStyles : defaultStyles),
            container: 'json-view-container',
        }),
        [isDark],
    );

    const currentTool = TOOLS.find((t) => t.id === activeTool)!;

    const reset = useCallback(() => {
        setOutput('');
        setParsedJson(null);
        setError('');
        setIsValid(null);
    }, []);

    const handleToolChange = useCallback(
        (tool: ToolId) => {
            setActiveTool(tool);
            reset();
        },
        [reset],
    );

    const handleProcess = useCallback(() => {
        reset();

        if (!input.trim()) {
            setError('Please enter JSON input.');
            return;
        }

        try {
            const parsed = JSON.parse(input);

            switch (activeTool) {
                case 'format':
                    setOutput(JSON.stringify(parsed, null, indentSize));
                    setParsedJson(parsed);
                    break;

                case 'minify':
                    setOutput(JSON.stringify(parsed));
                    setParsedJson(parsed);
                    break;

                case 'validate':
                    setIsValid(true);
                    setParsedJson(parsed);
                    break;

                case 'decode':
                    setParsedJson(parsed);
                    setOutput(JSON.stringify(parsed, null, 2));
                    break;

                case 'encode':
                    setOutput(JSON.stringify(JSON.stringify(parsed)));
                    break;
            }
        } catch (e) {
            if (activeTool === 'validate') {
                setIsValid(false);
            }
            setError(e instanceof Error ? e.message : 'Invalid JSON');
        }
    }, [input, activeTool, indentSize, reset]);

    const copyOutput = useCallback(() => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [output]);

    const clearAll = useCallback(() => {
        setInput('');
        reset();
    }, [reset]);

    const hasOutput = output || parsedJson !== null;

    return (
        <>
            <Head title="JSON Tools" />

            <div className="flex min-h-screen flex-col bg-background">
                {/* ── Header ── */}
                <header className="shrink-0 border-b border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-4 py-2.5 sm:px-6">
                        <Button variant="ghost" asChild className="gap-2 px-2">
                            <Link href="/">
                                <BracesIcon className="size-5 text-primary" />
                                <span className="text-lg font-semibold">JSON Tools</span>
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

                {/* ── Tool Tab Bar ── */}
                <div className="shrink-0 border-b border-border/40 bg-card/30">
                    <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
                        {TOOLS.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleToolChange(tool.id)}
                                className={cn(
                                    'shrink-0 rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                                    activeTool === tool.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                )}
                            >
                                {tool.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Main Content ── */}
                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
                    {/* Description */}
                    <p className="mb-5 text-sm text-muted-foreground">{currentTool.description}</p>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* ── Input Panel ── */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Input JSON</span>

                                <div className="flex items-center gap-2">
                                    {activeTool === 'format' && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground">Indent:</span>
                                            {[2, 4].map((n) => (
                                                <button
                                                    key={n}
                                                    onClick={() => setIndentSize(n)}
                                                    className={cn(
                                                        'rounded px-2 py-0.5 text-xs transition-colors',
                                                        indentSize === n
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-muted text-muted-foreground hover:bg-accent',
                                                    )}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {input && (
                                        <button
                                            onClick={clearAll}
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <Textarea
                                placeholder={'{\n  "key": "value"\n}'}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setError('');
                                    setIsValid(null);
                                }}
                                className="min-h-72 font-mono text-sm"
                                spellCheck={false}
                            />

                            <Button onClick={handleProcess} disabled={!input.trim()}>
                                {currentTool.action}
                            </Button>
                        </div>

                        {/* ── Output Panel ── */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {activeTool === 'decode' ? 'Tree View' : activeTool === 'validate' ? 'Validation' : 'Output'}
                                </span>

                                {hasOutput && activeTool !== 'validate' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyOutput}
                                        className="h-7 gap-1.5 text-xs"
                                    >
                                        <CopyIcon className="size-3" />
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                )}
                            </div>

                            {/* Validation result */}
                            {activeTool === 'validate' && isValid !== null && (
                                <div
                                    className={cn(
                                        'flex items-center gap-2 rounded-md border p-3',
                                        isValid
                                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : 'border-destructive/30 bg-destructive/10 text-destructive',
                                    )}
                                >
                                    {isValid ? (
                                        <>
                                            <CheckCircleIcon className="size-4 shrink-0" />
                                            <span className="text-sm font-medium">Valid JSON</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="size-4 shrink-0" />
                                            <span className="text-sm font-medium">Invalid JSON</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* JSON view / raw output */}
                            {parsedJson !== null && activeTool !== 'encode' ? (
                                <div className="min-h-72 overflow-auto rounded-md border border-border bg-muted/50 p-3">
                                    {typeof parsedJson === 'object' && parsedJson !== null ? (
                                        <JsonView data={parsedJson as object} style={jsonStyles} />
                                    ) : (
                                        <pre className="font-mono text-sm text-foreground">
                                            {JSON.stringify(parsedJson, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ) : output ? (
                                <pre className="min-h-72 overflow-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap break-all">
                                    {output}
                                </pre>
                            ) : (
                                <div className="min-h-72 flex items-center justify-center rounded-md border border-border bg-muted/50">
                                    <p className="text-sm text-muted-foreground">Result will appear here…</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* ── Footer ── */}
                <footer className="shrink-0">
                    <Separator />
                    <div className="flex items-center justify-center gap-1 px-4 py-2 text-[11px] text-muted-foreground/50 sm:px-6">
                        <LinkIcon className="size-2.5" />
                        <span>All processing happens locally — your data never leaves your browser</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
