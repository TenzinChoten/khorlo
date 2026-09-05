import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // [Reason] Inject only the public key so Vercel can use RAZORPAY_KEY_ID without exposing the secret
    define: {
      'import.meta.env.RAZORPAY_KEY_ID': JSON.stringify(env.RAZORPAY_KEY_ID ?? ''),
    },
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
  }
})
