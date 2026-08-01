import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mode = process.env.NODE_ENV

// https://vite.dev/config/
// Set `base` to your repository name when deploying to GitHub Pages.
// Replace `EnglishBooks` below if your repository has a different name.
export default defineConfig({
  base: mode === 'development' ? '/' : './',
  plugins: [react()],
})
