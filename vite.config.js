import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Finance_tracker/',
  plugins: [react()],
})

