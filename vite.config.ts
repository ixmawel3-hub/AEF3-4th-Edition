import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import path from 'path'

// https://vite.dev/config/
// Keep existing base logic; configure assetFileNames to preserve original
// filenames for media/pdf assets (remove the generated hash suffix).
export default defineConfig({
  base: '/AEF3-4th-Edition/',
  plugins: [react()]
  // build: {
  //   rollupOptions: {
  //     output: {
  //       assetFileNames: (assetInfo) => {
  //         const name = assetInfo.name || ''
  //         const parsed = path.parse(name)
  //         const ext = parsed.ext.toLowerCase()
  //         const baseName = parsed.name
  //         // Keep original filenames for media and docs so runtime lookups match
  //         if (/\.(mp3|m4a|ogg|wav|pdf|svg|png|jpg|jpeg)$/i.test(ext)) {
  //           return `assets/${baseName}${ext}`
  //         }
  //         // Default for other assets keeps the hash (CSS/JS)
  //         return 'assets/[name]-[hash][extname]'
  //       }
  //     }
  //   }
  // }
})
