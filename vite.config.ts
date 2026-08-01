import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Set `base` to your repository name when deploying to GitHub Pages.
// Replace `EnglishBooks` below if your repository has a different name.
export default defineConfig({
  // Base set for GitHub Pages. Repository: ixmawel3-hub/AEF4E3
    // Use repo base for GitHub Pages builds (GH_PAGES or running on GitHub Actions),
    // otherwise use '/' for the dev server so localhost works.
    base: (process.env.GH_PAGES) ? '/AEF4E3/' : '/',
  plugins: [react()],
})
