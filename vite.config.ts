import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        basicSsl(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    server: {
        https: true,
        port: 5175,
        host: '0.0.0.0',
        strictPort: true,
        origin: 'https://devkit.local:5175',
        hmr: {
            host: 'devkit.local',
            port: 5175,
            protocol: 'wss',
        },
        allowedHosts: ['devkit.local', 'localhost'],
    },
    esbuild: {
        jsx: 'automatic',
    },
});
