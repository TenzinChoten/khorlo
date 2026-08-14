import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // [Reason] Isolate heavy/stable vendors so the entry chunk stays small and caches independently
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
            },
            {
              name: 'location-data',
              test: /node_modules[\\/]country-state-city[\\/]lib[\\/](country|state)/,
            },
            {
              name: 'location-cities',
              test: /node_modules[\\/]country-state-city[\\/]lib[\\/](city|assets[\\/]city)/,
            },
            {
              name: 'image-cropper',
              test: /node_modules[\\/]react-easy-crop[\\/]/,
            },
            {
              // [Reason] lucide-react ships one file per icon; group used icons to avoid dozens of tiny requests
              name: 'icons',
              test: /node_modules[\\/]lucide-react[\\/]/,
            },
          ],
        },
      },
    },
  },
})
