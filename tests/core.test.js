import test from 'node:test';import assert from 'node:assert/strict';import {callTool,handleCommand,tools} from '../server/core.js';
test('lists MCP tools',()=>assert.equal(tools.length,9));
test('adds and lists task',()=>{const a=callTool('add_task',{title:'Demo'});assert.equal(a.task.title,'Demo');assert.ok(callTool('list_tasks').tasks.some(x=>x.id===a.task.id));});
test('rejects empty task',()=>assert.throws(()=>callTool('add_task',{title:''})));
test('reports simulation provenance',()=>assert.match(JSON.stringify(handleCommand('security events')),/SIMULATED/));
test('unknown tool rejected',()=>assert.throws(()=>callTool('not_a_tool')));
