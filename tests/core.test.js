import test from 'node:test';import assert from 'node:assert/strict';import {callTool,handleCommand,tools} from '../server/core.js';
test('lists MCP tools',()=>assert.equal(tools.length,16));
test('adds and lists task',()=>{const a=callTool('add_task',{title:'Demo'});assert.equal(a.task.title,'Demo');assert.ok(callTool('list_tasks').tasks.some(x=>x.id===a.task.id));});
test('rejects empty task',()=>assert.throws(()=>callTool('add_task',{title:''})));
test('reports simulation provenance',()=>assert.match(JSON.stringify(handleCommand('security events')),/SIMULATED/));
test('unknown tool rejected',()=>assert.throws(()=>callTool('not_a_tool')));
test('network status reports simulated mesh',()=>{const r=callTool('network_status');assert.equal(r.network.ssid,'XNode-Mesh');assert.match(r.source,/SIMULATED/);assert.ok(Array.isArray(r.devices)&&r.devices.length>0);});
test('pair_device reconnects offline device',()=>{const d=callTool('list_devices').devices[0];if(d.network&&!d.network.connected)callTool('pair_device',{id:d.id});const r=callTool('simulate_dropout',{id:d.id});assert.equal(r.device.network.connected,false);const p=callTool('pair_device',{id:d.id});assert.equal(p.device.connected,true);assert.ok(p.device.rssi<=-38&&p.device.rssi>=-60);});
test('toggle blocked while device offline',()=>{const d=callTool('list_devices').devices[0];callTool('simulate_dropout',{id:d.id});assert.throws(()=>callTool('toggle_device',{id:d.id}),/offline/i);callTool('pair_device',{id:d.id});});
