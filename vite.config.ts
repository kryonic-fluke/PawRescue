import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Extract variables
  const apiTarget = env.VITE_API_URL || 'http://localhost:3001';
  let clerkFrontendApi = env.VITE_CLERK_FRONTEND_API || 'desired-crow-80.clerk.accounts.dev';
  const clerkPublishableKey = env.VITE_CLERK_PUBLISHABLE_KEY;

  // --- FIX: Remove https:// from variable if it exists, so we don't double add it later ---
  if (clerkFrontendApi.startsWith('https://')) {
    clerkFrontendApi = clerkFrontendApi.replace('https://', '');
  }
  if (clerkFrontendApi.startsWith('http://')) {
    clerkFrontendApi = clerkFrontendApi.replace('http://', '');
  }

  // Now clerkFrontendApi is JUST the domain (e.g. "desired-crow-80...")

  console.log('Environment Variables:', {
    VITE_CLERK_PUBLISHABLE_KEY: clerkPublishableKey ? '✅ Set' : '❌ Missing',
    VITE_CLERK_FRONTEND_API: clerkFrontendApi,
    VITE_API_URL: apiTarget
  });

  return {
    plugins: [react()],
    base: '/',
    // Global constant replacements
    define: {
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(clerkPublishableKey),
      'import.meta.env.VITE_API_URL': JSON.stringify(apiTarget),
      'import.meta.env.VITE_CLERK_FRONTEND_API': JSON.stringify(clerkFrontendApi),
    },
    build: {
      outDir: 'dist/client', 
      sourcemap: true,
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            clerk: ['@clerk/clerk-react'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      open: true,
      proxy: {
        // --- 1. PROXY FOR BACKEND (Port 3001) ---
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/pets': { target: apiTarget, changeOrigin: true, secure: false },
        '/auth': { target: apiTarget, changeOrigin: true, secure: false },
        '/ngos': { target: apiTarget, changeOrigin: true, secure: false },
        '/animal-shelters': { target: apiTarget, changeOrigin: true, secure: false },
        '/rescue-reports': { target: apiTarget, changeOrigin: true, secure: false },

        // --- 2. PROXY FOR CLERK AUTH ---
        // Since we stripped the protocol at the top, we can safely add https:// here
        '/v1': {
          target: `https://${clerkFrontendApi}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/v1/, '/v1')
        },
        '/v1/verify': {
          target: `https://${clerkFrontendApi}`,
          changeOrigin: true,
          secure: false,
        },
        '/oauth': {
          target: `https://${clerkFrontendApi}`,
          changeOrigin: true,
          secure: false,
        },
        '/sso-callback': {
          target: `https://${clerkFrontendApi}`,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/sso-callback/, '')
        },
        '/.well-known': {
          target: `https://${clerkFrontendApi}`,
          changeOrigin: true,
          secure: false,
        }
      },
    },
  };
});