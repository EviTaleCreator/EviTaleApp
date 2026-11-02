import { spawn } from 'node:child_process';
const processes = [spawn(process.execPath, ['server.mjs'], {stdio:'inherit',env:{...process.env,PORT:'3001'}}),spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','0.0.0.0',...process.argv.slice(2)],{stdio:'inherit'})];
function stop(code=0){for(const p of processes)p.kill();process.exit(code);}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
for(const p of processes)p.on('exit',code=>stop(code||0));
