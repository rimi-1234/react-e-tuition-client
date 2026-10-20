import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: app deploys don't invalidate cached libraries.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // Recharts 3 touches React.Activity at module init. If it lives in a
          // separate chunk from react/react-dom, React is still undefined and
          // the app boots to a white screen: "Cannot set properties of undefined (setting 'Activity')".
          if (
            /node_modules[\\/](react|react-dom|react-router|scheduler|recharts|react-is)[\\/]/.test(id) ||
            /node_modules[\\/]d3-/.test(id)
          ) {
            return 'react';
          }
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('@tanstack') || id.includes('axios')) return 'data';
          if (id.includes('sweetalert2')) return 'swal';
          return undefined;
        },
      },
    },
  },
  server: { port: 5173 },
});
