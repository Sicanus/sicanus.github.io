import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: the deploy workflow injects VITE_BASE_PATH (e.g.
  // "/repo-name/" or "/" for user pages). Locally the relative base
  // keeps `vite preview` working anywhere.
  base: process.env.VITE_BASE_PATH || './',
  // /mnt/d is a Windows mount in WSL where inotify events don't fire —
  // poll so file changes are picked up.
  server: {
    watch: {
      usePolling: true,
    },
  },
})
