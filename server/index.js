import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {callTool,tools,state} from './core.js';
import {networkStatus} from './network.js';
import {runAgent} from './agent.js';
import {resetState} from './persistence.js';
const PORT=Number(process.env.PORT||8787),HOST=process.env.HOST||'127.0.0.1';
const json=(res,code,data,extra={})=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra});res.end(JSON.stringify(data));};
const server=http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&url.pathname==='/'){const html=await readFile(new URL('../web/index.html',import.meta.url));res.writeHead(200,{'content-type':'text/html; charset=utf-8','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'"});return res.end(html);}
 if(req.method==='GET'&&url.pathname==='/style.css'){res.writeHead(200,{'content-type':'text/css; charset=utf-8'});return res.end(await readFile(new URL('../web/style.css',import.meta.url)));}
 if(req.method==='GET'&&url.pathname==='/assets/door-scene.svg'){res.writeHead(200,{'content-type':'image/svg+xml'});return res.end(await readFile(new URL('../web/assets/door-scene.svg',import.meta.url)));}
 if(req.method==='GET'&&url.pathname==='/assets/xnode-logo-transparent.png'){res.writeHead(200,{'content-type':'image/png'});return res.end(await readFile(new URL('../web/assets/xnode-logo-transparent.png',import.meta.url)));}
 if(req.method==='GET'&&url.pathname==='/app.js'){res.writeHead(200,{'content-type':'text/javascript; charset=utf-8'});return res.end(await readFile(new URL('../web/app.js',import.meta.url)));}
 if(req.method==='GET'&&url.pathname==='/assets/xnode-logo.webp'){res.writeHead(200,{'content-type':'image/webp','cache-control':'public, max-age=3600'});return res.end(await readFile(new URL('../web/assets/xnode-logo.webp',import.meta.url)));}
 if(req.method==='GET'&&url.pathname==='/api/dashboard'){const provider=process.env.AI_PROVIDER||'bedrock';const mode=provider==='gemini'?(process.env.GEMINI_API_KEY?'gemini-configured':'gemini-no-key'):provider==='bedrock'?(process.env.ENABLE_BEDROCK==='true'?'bedrock-configured':'offline-simulation'):'offline-simulation';return json(res,200,{tasks:state.tasks,events:state.events,approvals:state.approvals,audit:state.audit.slice(-20),devices:state.devices||[],network:networkStatus(state.devices||[]),mode,provider,persistent:true});}
 if(req.method==='GET'&&url.pathname==='/api/submission')return json(res,200,{project:'XNode AI Command Center',version:'1.7.0',primaryTrack:'Alexa+ simulated experience',mcpProtocol:'2025-11-25 (self-reported; independent conformance pending)',awsStatus:process.env.ENABLE_BEDROCK==='true'?'configured, model access verified':'not enabled',novaActStatus:'not deployed',ringStatus:'synthetic events only',demoSteps:['Prepare visitor follow-up','Review approval','Approve or reject','Inspect tasks and audit log','Show workflow studio'],openSourceLicense:'MIT',persistence:'JSON file (survives restart)'});
 if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{ok:true,mode:'local-simulation'});
 if(req.method==='POST'&&url.pathname==='/api/reset'){resetState();return json(res,200,{ok:true,message:'State reset to defaults'});}
if(req.method==='POST'&&url.pathname==='/api/import'){const origin=req.headers.origin;if(origin&&origin!==`http://${req.headers.host}`)return json(res,403,{error:'Cross-origin requests disabled'});let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>65536)return json(res,413,{error:'Request too large'});}let body;try{body=JSON.parse(raw)}catch{return json(res,400,{error:'Invalid JSON'})}if(!body.tasks||!Array.isArray(body.tasks))return json(res,400,{error:'Invalid state: tasks array required'});state.tasks=body.tasks.map(t=>({id:t.id||String(Math.random()),title:String(t.title||'').slice(0,160),done:Boolean(t.done)}));state.approvals=Array.isArray(body.approvals)?body.approvals.map(a=>({id:a.id||String(Math.random()),visitor:String(a.visitor||'Guest').slice(0,80),purpose:String(a.purpose||'').slice(0,120),status:['pending','approved','rejected'].includes(a.status)?a.status:'pending',createdAt:a.createdAt||new Date().toISOString(),source:a.source||'imported'})):[];state.events=Array.isArray(body.events)?body.events:state.events;const{saveState}=await import('./persistence.js');saveState();return json(res,200,{ok:true,tasks:state.tasks.length,approvals:state.approvals.length});}
 if(req.method==='GET'&&url.pathname==='/mcp')return json(res,405,{error:'SSE not supported by this stateless MCP server'},{'allow':'POST'});
 if(req.method==='OPTIONS')return json(res,405,{error:'Method not allowed'});
 if(req.method==='POST'&&['/api/command','/mcp'].includes(url.pathname)){
 const origin=req.headers.origin;if(origin&&origin!==`http://${req.headers.host}`)return json(res,403,{error:'Cross-origin requests disabled'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>65536)return json(res,413,{error:'Request too large'});}
 let body;try{body=JSON.parse(raw)}catch{return json(res,400,{error:'Invalid JSON'})}
 if(url.pathname==='/api/command')return json(res,200,await runAgent(body.text));
 if(url.pathname==='/mcp'&&req.headers.accept&&!req.headers.accept.includes('application/json')&&!req.headers.accept.includes('text/event-stream'))return json(res,406,{error:'Accept application/json and text/event-stream'});
 if(body.jsonrpc!=='2.0'||typeof body.method!=='string')return json(res,400,{jsonrpc:'2.0',id:body.id??null,error:{code:-32600,message:'Invalid Request'}});
 if(req.headers['mcp-protocol-version']&&!['2025-11-25','2025-03-26'].includes(req.headers['mcp-protocol-version']))return json(res,400,{jsonrpc:'2.0',id:body.id??null,error:{code:-32602,message:'Unsupported protocol version'}});
 const {id,method,params={}}=body;
 if(method==='initialize' && params.protocolVersion && params.protocolVersion!=='2025-11-25')return json(res,400,{jsonrpc:'2.0',id,error:{code:-32602,message:'Unsupported client protocol version'}});
 if(method==='initialize')return json(res,200,{jsonrpc:'2.0',id,result:{protocolVersion:'2025-11-25',capabilities:{tools:{},logging:{}},serverInfo:{name:'xnode-command-center',version:'1.7.0'}}},{'cache-control':'no-store','mcp-protocol-version':'2025-11-25'});
 if(method==='notifications/initialized'){res.writeHead(202);return res.end();}
 if(method==='ping')return json(res,200,{jsonrpc:'2.0',id,result:{}});
 if(method==='tools/list')return json(res,200,{jsonrpc:'2.0',id,result:{tools}});
 if(method==='tools/call'){try{if(typeof params.name!=='string'||!params.arguments||typeof params.arguments!=='object'||Array.isArray(params.arguments))throw Error('Invalid tool parameters');return json(res,200,{jsonrpc:'2.0',id,result:{content:[{type:'text',text:JSON.stringify(callTool(params.name,params.arguments||{}))}]}})}catch(e){return json(res,200,{jsonrpc:'2.0',id,result:{isError:true,content:[{type:'text',text:e.message}]}})}}
 return json(res,200,{jsonrpc:'2.0',id,error:{code:-32601,message:'Method not found'}});
 }
 return json(res,404,{error:'Not found'});
 }catch(e){return json(res,500,{error:'Internal error'});}
});server.listen(PORT,HOST,()=>console.log(`XNode demo http://${HOST}:${PORT}`));
