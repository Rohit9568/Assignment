import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{js,jsx,ts,tsx}',
      fastRefresh: true,
      jsxRuntime: 'automatic'
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'components': resolve(__dirname, 'src/components'),
      'hooks': resolve(__dirname, 'src/hooks'),
      'data': resolve(__dirname, 'src/data'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          bootstrap: ['react-bootstrap', 'bootstrap'],
          codemirror: ['@codemirror/lang-sql', '@uiw/react-codemirror'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    watch: {
      usePolling: true,
    },
  },
  publicDir: 'public',
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(jsx|js)$/,
    exclude: [],
    jsx: 'automatic',
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-bootstrap', 
      '@uiw/react-codemirror',
      '@codemirror/lang-sql',
      '@uiw/codemirror-theme-basic',
      'react-table',
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
