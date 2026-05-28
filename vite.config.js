import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ohif/ui-next': '/src/mocks/ohif-ui-next.jsx',
      '@ohif/ui': '/src/mocks/ohif-ui.jsx',
      '@ohif/core': '/src/mocks/ohif-core.jsx',
      '@state': '/src/mocks/state.jsx',
    }
  }
})
