import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    BracesIcon,
    CheckCircleIcon,
    CopyIcon,
    DownloadIcon,
    FileUpIcon,
    LinkIcon,
    Minimize2Icon,
    SparklesIcon,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleUpload = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileRead = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setInput(content);
            reset();
        };
        reader.readAsText(file);
    }, [reset]);

    const handleDownload = useCallback(() => {
        if (!output) return;
        
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `formatted-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [output]);

    const hasOutput = output || parsedJson !== null;

    return (
        <>
            <Head title="JSON Tools" />

            <div className="flex min-h-screen flex-col bg-background">
                {/* ── Header ── */}
                <header className="shrink-0 border-b border-border/40 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                        <Button variant="ghost" asChild className="gap-2 px-2">
                            <Link href="/">
                                <BracesIcon className="size-6 text-primary" />
                                <span className="text-xl font-semibold">JSON Formatter</span>
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
                    <div className="mx-auto flex max-w-[1800px] gap-1 overflow-x-auto px-4 py-2 sm:px-6">
                        {TOOLS.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleToolChange(tool.id)}
                                className={cn(
                                    'shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                                    activeTool === tool.id
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                )}
                            >
                                {tool.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Main Content ── */}
                <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    {/* Description */}
                    <p className="mb-6 text-center text-sm text-muted-foreground">
                        {currentTool.description}
                    </p>

                    <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
                        {/* ── Input Panel ── */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 px-4 py-2.5">
                                <span className="font-mono text-sm font-semibold">Input</span>
                                {input && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <Textarea
                                placeholder={'{\n  "name": "JSON Formatter",\n  "version": "1.0.0",\n  "description": "Format, validate, and beautify JSON"\n}'}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setError('');
                                    setIsValid(null);
                                }}
                                className="min-h-[500px] rounded-t-none border-t-0 font-mono text-sm"
                                spellCheck={false}
                            />
                        </div>

                        {/* ── Center Action Panel ── */}
                        <div className="flex flex-col items-center justify-center gap-3 lg:px-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileRead}
                                className="hidden"
                            />

                            <Button
                                onClick={handleUpload}
                                variant="outline"
                                className="w-full gap-2 lg:w-auto"
                            >
                                <FileUpIcon className="size-4" />
                                Upload Data
                            </Button>

                            <Button
                                onClick={handleProcess}
                                disabled={!input.trim()}
                                className="w-full gap-2 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 lg:w-auto"
                            >
                                <SparklesIcon className="size-4" />
                                {currentTool.action}
                            </Button>

                            {activeTool === 'format' && (
                                <div className="flex w-full flex-col gap-2 rounded-lg border bg-card p-3 lg:w-auto">
                                    <label className="text-xs font-medium text-muted-foreground">
                                        Indentation
                                    </label>
                                    <Select
                                        value={indentSize.toString()}
                                        onValueChange={(val) => setIndentSize(Number(val))}
                                    >
                                        <SelectTrigger className="w-full lg:w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2 Spaces</SelectItem>
                                            <SelectItem value="4">4 Spaces</SelectItem>
                                            <SelectItem value="8">1 Tab</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {activeTool !== 'format' && (
                                <Button
                                    onClick={() => handleToolChange('minify')}
                                    variant="outline"
                                    className="w-full gap-2 lg:w-auto"
                                >
                                    <Minimize2Icon className="size-4" />
                                    Minify
                                </Button>
                            )}

                            {output && (
                                <>
                                    <Separator className="my-2" />
                                    
                                    <Button
                                        onClick={copyOutput}
                                        variant="outline"
                                        className="w-full gap-2 lg:w-auto"
                                    >
                                        <CopyIcon className="size-4" />
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>

                                    <Button
                                        onClick={handleDownload}
                                        variant="outline"
                                        className="w-full gap-2 lg:w-auto"
                                    >
                                        <DownloadIcon className="size-4" />
                                        Download
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* ── Output Panel ── */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 px-4 py-2.5">
                                <span className="font-mono text-sm font-semibold">
                                    {activeTool === 'decode' ? 'Tree View' : activeTool === 'validate' ? 'Validation' : 'Output'}
                                </span>

                                {hasOutput && activeTool !== 'validate' && output && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {output.length.toLocaleString()} chars
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="min-h-[500px] overflow-auto rounded-b-lg rounded-t-none border border-t-0 bg-muted/30 p-4">
                                {/* Validation result */}
                                {activeTool === 'validate' && isValid !== null && (
                                    <div
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg border p-4',
                                            isValid
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'border-destructive/30 bg-destructive/10 text-destructive',
                                        )}
                                    >
                                        {isValid ? (
                                            <>
                                                <CheckCircleIcon className="size-5 shrink-0" />
                                                <div>
                                                    <p className="font-semibold">Valid JSON</p>
                                                    <p className="text-xs opacity-90">
                                                        Your JSON is properly formatted and valid
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <XCircleIcon className="size-5 shrink-0" />
                                                <div>
                                                    <p className="font-semibold">Invalid JSON</p>
                                                    <p className="text-xs opacity-90">See error below</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <Alert variant="destructive" className="mb-4">
                                        <AlertDescription className="font-mono text-xs">
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* JSON view / raw output */}
                                {parsedJson !== null && activeTool !== 'encode' ? (
                                    <div className="rounded-lg bg-background/50 p-3">
                                        {typeof parsedJson === 'object' && parsedJson !== null ? (
                                            <JsonView data={parsedJson as object} style={jsonStyles} />
                                        ) : (
                                            <pre className="font-mono text-sm text-foreground">
                                                {JSON.stringify(parsedJson, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                ) : output ? (
                                    <pre className="overflow-auto whitespace-pre-wrap break-all rounded-lg bg-background/50 p-3 font-mono text-sm leading-relaxed text-foreground">
                                        {output}
                                    </pre>
                                ) : (
                                    <div className="flex h-full min-h-[400px] items-center justify-center">
                                        <p className="text-sm text-muted-foreground">
                                            Output will appear here...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* ── Footer ── */}
                <footer className="shrink-0">
                    <Separator />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-muted-foreground/60 sm:px-6">
                        <LinkIcon className="size-3" />
                        <span>All processing happens locally — your data never leaves your browser</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
