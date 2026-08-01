import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: (process.env.GH_PAGES) ? '/AEF3-4th-Edition/' : '/',
  plugins: [react()],
})
