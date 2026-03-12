import { Head, Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import { dashboard, login, register } from '@/routes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppearanceToggleButton from '@/components/appearance-toggle-button';
import {
    ArrowRightIcon,
    BracesIcon,
    CodeIcon,
    GlobeIcon,
    BellIcon,
    CalendarIcon,
    ZapIcon,
    ShieldIcon,
    KeyIcon,
    ActivityIcon,
    ServerIcon,
    DatabaseIcon,
    TerminalIcon,
    LinkIcon,
    LockIcon,
    StarIcon,
    UsersIcon,
    ChevronRightIcon,
} from 'lucide-react';

// ── Tool Card Data ──────────────────────────────────────────────────
const TOOLS = [
    {
        icon: GlobeIcon,
        name: 'Webhook Tester',
        description: 'Inspect incoming HTTP requests in real time. No account needed — grab your unique URL and start receiving webhooks instantly.',
        href: '/webhooks',
        badge: 'Free',
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        available: true,
        requiresAuth: false,
    },
    {
        icon: ServerIcon,
        name: 'Fake API',
        description: 'Define a JSON response template and get an instant mock endpoint URL. Perfect for frontend development without a real backend.',
        href: '/fake-api-tool',
        badge: 'Free',
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        available: true,
        requiresAuth: false,
    },
    {
        icon: BracesIcon,
        name: 'JSON Tools',
        description: 'Format, minify, validate and decode JSON. Explore nested structures in an interactive tree view — no account needed.',
        href: '/tools/json',
        badge: 'Free',
        badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        available: true,
        requiresAuth: false,
    },
    {
        icon: CalendarIcon,
        name: 'Calendar & Reminders',
        description: 'Schedule events, set reminders for payment deadlines, and manage recurring tasks with a clean timeline view.',
        href: '/calendar',
        badge: 'Auth',
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        available: true,
        requiresAuth: true,
    },
    {
        icon: BellIcon,
        name: 'Notifications',
        description: 'Multi-channel notification system. Configure webhooks, email, or Slack channels with customizable templates.',
        href: '/notifications',
        badge: 'Auth',
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        available: true,
        requiresAuth: true,
    },
    {
        icon: DatabaseIcon,
        name: 'JSON Diff',
        description: 'Compare two JSON objects side-by-side. Spot additions, deletions, and changes with syntax highlighting.',
        href: '#',
        badge: 'Soon',
        badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        available: false,
        requiresAuth: false,
    },
    {
        icon: KeyIcon,
        name: 'JWT Inspector',
        description: 'Decode, verify and generate JSON Web Tokens. Inspect header, payload and signature without sending to any server.',
        href: '#',
        badge: 'Soon',
        badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        available: false,
        requiresAuth: false,
    },
    {
        icon: ActivityIcon,
        name: 'API Health Monitor',
        description: 'Monitor uptime of your APIs with configurable intervals. Get alerted when endpoints go down.',
        href: '#',
        badge: 'Soon',
        badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        available: false,
        requiresAuth: false,
    },
    {
        icon: ServerIcon,
        name: 'Cron Expression Builder',
        description: 'Build and validate cron expressions with a visual editor. Test schedules against any timezone.',
        href: '#',
        badge: 'Soon',
        badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        available: false,
        requiresAuth: false,
    },
];

// ── Features ─────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: ZapIcon,
        title: 'Fast by default',
        description: 'Built on FrankenPHP with Octane — requests are handled in microseconds. No cold starts, no delays.',
    },
    {
        icon: ShieldIcon,
        title: 'Privacy first',
        description: 'Public tools like Webhook Tester process data ephemerally. Authenticated tools store only what you need.',
    },
    {
        icon: TerminalIcon,
        title: 'Built for developers',
        description: 'Every tool is designed with developer workflow in mind. Copy-ready outputs, keyboard shortcuts, dark mode.',
    },
];

// ── Main Component ────────────────────────────────────────────────────
export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="DevKit — Developer Tools" />

            <div className="min-h-screen bg-background text-foreground">

                {/* ── Navbar ─────────────────────────────────────────── */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <TerminalIcon className="h-4 w-4 text-white" strokeWidth={1.5} />
                            </div>
                            <span className="text-sm font-semibold tracking-tight">DevKit</span>
                            <Badge variant="secondary" className="ml-1 hidden px-1.5 py-0 text-[11px] sm:inline-flex">
                                Beta
                            </Badge>
                        </div>

                        {/* Nav links */}
                        <nav className="hidden items-center gap-1 md:flex">
                            <Button variant="ghost" size="sm" asChild className="text-sm text-muted-foreground hover:text-foreground">
                                <a href="#tools">Tools</a>
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="text-sm text-muted-foreground hover:text-foreground">
                                <a href="#features">Features</a>
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="text-sm text-muted-foreground hover:text-foreground">
                                <Link href="/webhooks">Webhook Tester</Link>
                            </Button>
                        </nav>

                        {/* Auth */}
                        <div className="flex items-center gap-2">
                            <AppearanceToggleButton className="text-muted-foreground hover:text-foreground" />
                            {auth.user ? (
                                <Button size="sm" asChild>
                                    <Link href={dashboard()}>
                                        Dashboard
                                        <ChevronRightIcon className="h-4 w-4" strokeWidth={1.5} />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                                        <Link href={login()}>Log in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button size="sm" asChild>
                                            <Link href={register()}>Get started</Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Hero ───────────────────────────────────────────── */}
                <section className="relative overflow-hidden px-6 py-24 text-center md:py-32">
                    {/* Background glow */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-[500px] w-[800px] rounded-full bg-primary/5 blur-[120px]" />
                    </div>

                    <div className="relative mx-auto max-w-3xl">
                        <Badge
                            variant="outline"
                            className="mb-6 inline-flex gap-1.5 border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary"
                        >
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                            </span>
                            Now live — Webhook Tester is open to everyone
                        </Badge>

                        <h1 className="mb-6 text-5xl font-semibold tracking-tight text-foreground md:text-[56px]">
                            Developer tools,{' '}
                            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                                built to ship
                            </span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground">
                            A growing collection of utilities for backend developers — webhook testing, encoding, scheduling, monitoring, and more. No fluff. Just tools that work.
                        </p>

                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            <Button size="lg" asChild className="gap-2 px-6">
                                <Link href="/webhooks">
                                    <ZapIcon className="h-4 w-4" strokeWidth={1.5} />
                                    Try Webhook Tester
                                </Link>
                            </Button>
                            {!auth.user && canRegister && (
                                <Button variant="outline" size="lg" asChild className="gap-2 px-6">
                                    <Link href={register()}>
                                        Create free account
                                        <ArrowRightIcon className="h-4 w-4" strokeWidth={1.5} />
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Social proof */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                            {[
                                { icon: StarIcon, label: 'Open source' },
                                { icon: ShieldIcon, label: 'Privacy first' },
                                { icon: ZapIcon, label: 'No rate limits' },
                                { icon: UsersIcon, label: 'Free to use' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <Separator className="border-border/60" />

                {/* ── Stats strip ────────────────────────────────────── */}
                <section className="bg-card/40 px-6 py-8">
                    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
                        {[
                            { value: '8+', label: 'Developer tools' },
                            { value: '100%', label: 'Free core tools' },
                            { value: '<5ms', label: 'Avg response time' },
                            { value: '7 days', label: 'Webhook retention' },
                        ].map(({ value, label }) => (
                            <div key={label} className="text-center">
                                <p className="text-[28px] font-semibold tracking-tight text-foreground">{value}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <Separator className="border-border/60" />

                {/* ── Tools Grid ─────────────────────────────────────── */}
                <section id="tools" className="px-6 py-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-3 text-[28px] font-semibold tracking-tight">All tools</h2>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Start with free tools — no account required. Create an account to unlock the full suite.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {TOOLS.map((tool) => {
                                const Icon = tool.icon;
                                const isClickable = tool.available;

                                const cardInner = (
                                    <Card
                                        className={cn(
                                            'group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-none transition-all duration-150',
                                            isClickable
                                                ? 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
                                                : 'opacity-60',
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn('text-[11px]', tool.badgeClass)}
                                            >
                                                {tool.badge}
                                            </Badge>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="mb-1.5 text-sm font-semibold tracking-tight text-foreground">
                                                {tool.name}
                                            </h3>
                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                {tool.description}
                                            </p>
                                        </div>

                                        {isClickable && (
                                            <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                                {tool.requiresAuth && !auth.user ? (
                                                    <>
                                                        <LockIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                                                        Sign in to use
                                                    </>
                                                ) : (
                                                    <>
                                                        Open tool
                                                        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.5} />
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {!isClickable && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                                                Coming soon
                                            </div>
                                        )}
                                    </Card>
                                );

                                if (isClickable) {
                                    if (tool.requiresAuth && !auth.user) {
                                        return (
                                            <Link key={tool.name} href={login()}>
                                                {cardInner}
                                            </Link>
                                        );
                                    }
                                    return (
                                        <Link key={tool.name} href={tool.href}>
                                            {cardInner}
                                        </Link>
                                    );
                                }
                                return <div key={tool.name}>{cardInner}</div>;
                            })}
                        </div>
                    </div>
                </section>

                <Separator className="border-border/60" />

                {/* ── Features ───────────────────────────────────────── */}
                <section id="features" className="px-6 py-20">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-3 text-[28px] font-semibold tracking-tight">Why DevKit?</h2>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                We built the tools we wished existed. No bloat, no paywalls on the essentials.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {FEATURES.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <Card
                                        key={feature.title}
                                        className="rounded-2xl border border-border bg-card p-6 shadow-none"
                                    >
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                            <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="mb-2 text-sm font-semibold tracking-tight">{feature.title}</h3>
                                        <p className="text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <Separator className="border-border/60" />

                {/* ── CTA Banner ─────────────────────────────────────── */}
                {!auth.user && (
                    <section className="px-6 py-20">
                        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 px-8 py-12 text-center">
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                            </div>
                            <div className="relative">
                                <h2 className="mb-3 text-xl font-semibold tracking-tight">
                                    Ready to go deeper?
                                </h2>
                                <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                                    Create a free account to unlock the full tool suite — Encoder/Decoder, Calendar, Notifications, and everything we ship next.
                                </p>
                                <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                                    {canRegister && (
                                        <Button size="lg" asChild className="gap-2 px-8">
                                            <Link href={register()}>
                                                Create free account
                                                <ArrowRightIcon className="h-4 w-4" strokeWidth={1.5} />
                                            </Link>
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="lg" asChild className="gap-2 text-muted-foreground">
                                        <Link href={login()}>
                                            Already have an account? Log in
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Footer ─────────────────────────────────────────── */}
                <footer className="border-t border-border/60 px-6 py-8">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                                <TerminalIcon className="h-3 w-3 text-white" strokeWidth={1.5} />
                            </div>
                            <span className="font-medium text-foreground">DevKit</span>
                            <span className="text-muted-foreground/50">·</span>
                            <span>Built for developers, by developers</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/webhooks" className="transition-colors hover:text-foreground">Webhook Tester</Link>
                            {auth.user ? (
                                <Link href={dashboard()} className="transition-colors hover:text-foreground">Dashboard</Link>
                            ) : (
                                <>
                                    <Link href={login()} className="transition-colors hover:text-foreground">Log in</Link>
                                    {canRegister && (
                                        <Link href={register()} className="transition-colors hover:text-foreground">Sign up</Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
