import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const BITRIX_PROXY_TARGET = 'https://crm.springfieldproperties.ae';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api/bitrix': {
        target: BITRIX_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bitrix/, ''),
      },
    },
  },
});