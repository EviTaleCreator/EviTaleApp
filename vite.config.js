import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export default defineConfig(({mode})=>({
 define:{__CONTENT_VERSION__:JSON.stringify(mode==='editor'?'server':createHash('sha256').update(readFileSync('public/stories.json')).digest('hex').slice(0,16))},
 base:mode==='editor'?'/':process.env.PAGES_BASE_PATH||'/EviTaleApp/',
 server: {proxy: {'/api': 'http://127.0.0.1:3001', '/uploads': 'http://127.0.0.1:3001'}},
 build: {rollupOptions: {input: mode==='editor'?{main:resolve('index.html'),admin:resolve('admin/index.html')}:{main:resolve('index.html')}}}
}));
