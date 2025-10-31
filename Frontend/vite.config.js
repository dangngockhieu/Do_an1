import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const cwd = process.cwd();

  const env = { ...loadEnv(mode, cwd, 'VITE_') };

  const serverConfig = {
    host: true, 
    port: Number(env.VITE_PORT) || 3000,
    strictPort: true, 
  };

  return {
    base: '/',
    plugins: [react()],
    server: serverConfig,
    preview: serverConfig,
  };
});
