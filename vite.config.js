import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    // Same backend the admin panel proxies to; production uses the vercel.json rewrite.
    proxy: {
      '/api': { target: process.env.VITE_API_PROXY ?? 'http://92.4.82.212:4008', changeOrigin: true },
    },
    // proxy: {
    //   '/api': { target: 'http://192.168.1.15:4008', changeOrigin: true },
    // },
  },
});
