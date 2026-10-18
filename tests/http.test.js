import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const port=18900+Math.floor(Math.random()*500);
let child;
test.before(async()=>{
 child=spawn(process.execPath,['server/index.js'],{cwd:new URL('..',import.meta.url),env:{...process.env,PORT:String(port),HOST:'127.0.0.1',ENABLE_BEDROCK:'false',AI_PROVIDER:''},stdio:'ignore'});
 for(let i=0;i<60;i++){try{const r=await fetch(`http://127.0.0.1:${port}/health`);if(r.ok)return;}catch{}await sleep(50)}throw Error('server did not start');
});
test.after(()=>child?.kill());
const rpc=async(body,headers={})=>fetch(`http://127.0.0.1:${port}/mcp`,{method:'POST',headers:{'content-type':'application/json','accept':'application/json, text/event-stream',...headers},body:JSON.stringify(body)});
test('initialize negotiates 2025-11-25',async()=>{const r=await rpc({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'test',version:'1'}}});assert.equal(r.status,200);const d=await r.json();assert.equal(d.result.protocolVersion,'2025-11-25');assert.equal(d.result.serverInfo.name,'xnode-command-center')});
test('tools/list and tools/call roundtrip',async()=>{const a=await (await rpc({jsonrpc:'2.0',id:2,method:'tools/list'})).json();assert.equal(a.result.tools.length,13);const b=await (await rpc({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'add_task',arguments:{title:'HTTP test'}}})).json();assert.match(b.result.content[0].text,/HTTP test/)});
test('notifications return 202 without body',async()=>{const r=await rpc({jsonrpc:'2.0',method:'notifications/initialized'});assert.equal(r.status,202);assert.equal(await r.text(),'')});
test('invalid input rejected',async()=>{const r=await rpc({jsonrpc:'2.0',id:4,method:'tools/call',params:{name:'missing'}});assert.equal((await r.json()).result.isError,true);const bad=await rpc({jsonrpc:'2.0',id:5,method:'ping'},{'mcp-protocol-version':'1900-01-01'});assert.equal(bad.status,400)});
test('command API stays offline by default',async()=>{const r=await fetch(`http://127.0.0.1:${port}/api/command`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:'business summary'})});assert.equal((await r.json()).mode,'offline-simulation')});
