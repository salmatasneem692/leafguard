import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR, WebSocket server, and file watching are disabled in AI Studio to avoid port 24678 collisions and excessive CPU/memory usage.
      hmr: false as const,
      ws: false as const,
      watch: null,
    },
  };
});
