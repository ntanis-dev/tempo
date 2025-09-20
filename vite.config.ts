import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    fastRefresh: true,
  })],
  optimizeDeps: {
    include: ['react', 'react-dom'], // Ensure React is pre-bundled
    exclude: ['lucide-react'],
  },
  server: {
    hmr: {
      overlay: false,
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      timeout: 60000,
    },
    headers: {
      // Prevent caching in development
      'Cache-Control': 'no-store',
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      // Ensure consistent React resolution
      'react': 'react',
      'react-dom': 'react-dom',
    },
  },
});
