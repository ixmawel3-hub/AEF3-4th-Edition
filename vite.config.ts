import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Set `base` to your repository name when deploying to GitHub Pages.
// Replace `EnglishBooks` below if your repository has a different name.
export default defineConfig({
  base: ('/AEF3-4th-Edition/'),
  plugins: [react()],
})
