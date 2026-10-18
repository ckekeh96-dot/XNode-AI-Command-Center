import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('judge showcase and submission manifest are wired',async()=>{const html=await readFile(new URL('../web/index.html',import.meta.url),'utf8');const js=await readFile(new URL('../web/app.js',import.meta.url),'utf8');const server=await readFile(new URL('../server/index.js',import.meta.url),'utf8');for(const id of ['judge-start','judge-approve','judge-verify','judge-copy','judge-status']){assert.match(html,new RegExp(`id="${id}"`));assert.ok(js.includes(`getElementById('${id}')`));}assert.ok(server.includes('/api/submission'));});
