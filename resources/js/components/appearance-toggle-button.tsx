import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';

const CYCLE: Appearance[] = ['light', 'dark', 'system'];

const ICONS = {
    light: Sun,
    dark: Moon,
    system: Monitor,
} as const;

const LABELS = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
} as const;

export default function AppearanceToggleButton({ className = '' }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    const handleClick = () => {
        const idx = CYCLE.indexOf(appearance);
        updateAppearance(CYCLE[(idx + 1) % CYCLE.length]);
    };

    const Icon = ICONS[appearance];
    const label = LABELS[appearance];

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            title={`Theme: ${label}`}
            aria-label={`Switch theme (current: ${label})`}
            className={className}
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}
