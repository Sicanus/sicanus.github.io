import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // /mnt/d is a Windows mount in WSL where inotify events don't fire —
  // poll so file changes are picked up.
  server: {
    watch: {
      usePolling: true,
    },
  },
})
