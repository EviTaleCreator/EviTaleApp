import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig(({mode})=>({
 base:mode==='editor'?'/':process.env.PAGES_BASE_PATH||'/EviTaleApp/',
 server: {proxy: {'/api': 'http://127.0.0.1:3001', '/uploads': 'http://127.0.0.1:3001'}},
 build: {rollupOptions: {input: mode==='editor'?{main:resolve('index.html'),admin:resolve('admin/index.html')}:{main:resolve('index.html')}}}
}));
