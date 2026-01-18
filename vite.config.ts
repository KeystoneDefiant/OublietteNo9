import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/OublietteNo9/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      port: parseInt(process.env.VITE_HMR_PORT || '5173'),
      protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
    },
    watch: {
      usePolling: true,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
});
