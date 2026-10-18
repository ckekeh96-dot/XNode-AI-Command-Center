import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,unlinkSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dir=dirname(fileURLToPath(import.meta.url));
const STATE_FILE=join(__dir,'..','data','state.json');

test('state persists to disk after add_task',async()=>{
 if(existsSync(STATE_FILE))unlinkSync(STATE_FILE);
 const{runAgent}=await import('../server/agent.js');
 const{resetState}=await import('../server/persistence.js');
 resetState();
 await runAgent('add task Persist test');
 assert.ok(existsSync(STATE_FILE),'state.json should exist');
 const data=JSON.parse(readFileSync(STATE_FILE,'utf8'));
 assert.equal(data.tasks.length,1);
 assert.equal(data.tasks[0].title,'Persist test');
});

test('state survives module reload',async()=>{
 const{runAgent}=await import('../server/agent.js');
 await runAgent('add task Second persist test');
 const data=JSON.parse(readFileSync(STATE_FILE,'utf8'));
 assert.ok(data.tasks.length>=2);
});

test.after(()=>{if(existsSync(STATE_FILE))unlinkSync(STATE_FILE);});
