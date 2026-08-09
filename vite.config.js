import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages project pages live under /<repo>/ — relative asset
  // paths keep them working there (and at a user-page root).
  base: './',
  // /mnt/d is a Windows mount in WSL where inotify events don't fire —
  // poll so file changes are picked up.
  server: {
    watch: {
      usePolling: true,
    },
  },
})
