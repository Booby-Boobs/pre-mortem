import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PreMortem',
      fileName: 'pre-mortem',
    },
    rollupOptions: {
      external: ['matter-js'],
      output: {
        globals: {
          'matter-js': 'Matter',
        },
      },
    },
  },
});
