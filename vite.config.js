import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules/react')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@mui')) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/yup')) {
            return 'vendor-forms';
          }
          if (id.includes('node_modules/axios') || id.includes('node_modules/dayjs') || id.includes('node_modules/xlsx')) {
            return 'vendor-utils';
          }
          // Feature chunks
          if (id.includes('/api/')) {
            return 'api';
          }
          if (id.includes('/components/form/')) {
            return 'components-form';
          }
        }
      }
    }
  }
})
