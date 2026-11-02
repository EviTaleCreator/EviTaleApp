import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
 server: {proxy: {'/api': 'http://127.0.0.1:3001', '/uploads': 'http://127.0.0.1:3001'}},
 build: {rollupOptions: {input: {main: resolve('index.html'), admin: resolve('admin/index.html')}}}
});
