import {handleCommand,callTool,tools} from './core.js';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const __dir=dirname(fileURLToPath(import.meta.url));
try{
 const envRaw=readFileSync(join(__dir,'..','.env'),'utf8');
 for(const line of envRaw.split('\n')){
  const trimmed=line.trim();
  if(!trimmed||trimmed.startsWith('#'))continue;
  const eq=trimmed.indexOf('=');
  if(eq<0)continue;
  const key=trimmed.slice(0,eq).trim();
  const val=trimmed.slice(eq+1).trim();
  if(key&&!(key in process.env))process.env[key]=val;
 }
}catch{}

const SYSTEM_PROMPT='You are XNode AI Command Center. Only claim simulated security events are simulated. Use tools for local actions. Never claim to control actual devices or execute payments.';

async function withRetry(fn,maxRetries=3){
 for(let attempt=0;attempt<=maxRetries;attempt++){
  try{return await fn();}
  catch(e){
   const msg=String(e.message||e);
   const isThrottle=msg.includes('ThrottlingException')||msg.includes('429')||msg.includes('Too many')||msg.includes('rate limit');
   if(!isThrottle||attempt===maxRetries) throw e;
   const delay=Math.pow(2,attempt)*1000+Math.random()*1000;
   await new Promise(r=>setTimeout(r,delay));
  }
 }
}

export async function runAgent(text){
 const prompt=String(text??'').trim();
 if(!prompt||prompt.length>2000) return {mode:'validation',message:'Command must be 1\u20132000 characters.'};

 const provider=process.env.AI_PROVIDER||'bedrock';

 if(provider==='gemini') return withRetry(()=>runGemini(prompt)).catch(e=>({mode:'gemini-error',message:'Gemini request failed after retries.',detail:String(e.message||e)}));
 if(provider==='bedrock') return withRetry(()=>runBedrock(prompt)).catch(e=>({mode:'aws-error',message:'Bedrock request failed after retries.',detail:String(e.name||e.message||e)}));
 return {mode:'offline-simulation',...handleCommand(prompt)};
}

function cleanSchemaForGemini(schema){
 const {additionalProperties,...rest}=schema;
 if(rest.properties){
  const cleanProps={};
  for(const[k,v]of Object.entries(rest.properties)) cleanProps[k]=v;
  return {...rest,properties:cleanProps};
 }
 return rest;
}

async function runGemini(prompt){
 const apiKey=process.env.GEMINI_API_KEY;
 if(!apiKey) return {mode:'offline-simulation',...handleCommand(prompt)};
 const modelId=process.env.GEMINI_MODEL||'gemini-2.0-flash';

 let genAI;
 try{const mod=await import('@google/generative-ai');genAI=mod.GoogleGenerativeAI;}
 catch{return {mode:'configuration-error',message:'Install @google/generative-ai to enable Gemini.'}}

 try{
  const gen=new genAI(apiKey);
  const model=gen.getGenerativeModel({
   model:modelId,
   systemInstruction:SYSTEM_PROMPT,
   tools:[{functionDeclarations:tools.map(t=>({name:t.name,description:t.description,parameters:cleanSchemaForGemini(t.inputSchema)}))}]
  });

  const messages=[{role:'user',parts:[{text:prompt}]}];

  for(let turn=0;turn<5;turn++){
   const result=await model.generateContent({contents:messages});
   const response=await result.response;
   const candidates=response.candidates||[];
   if(!candidates.length) return {mode:'gemini',message:'No response from model.',modelId};
   const parts=candidates[0].content?.parts||[];
   const textParts=parts.filter(p=>p.text).map(p=>p.text);
   const functionCalls=parts.filter(p=>p.functionCall).map(p=>p.functionCall);

   if(!functionCalls.length){
    return {mode:'gemini',message:textParts.join('\n')||'Completed.',modelId};
   }

   messages.push({role:'model',parts});
   const functionResponseParts=functionCalls.map(fc=>{
    try{
     const toolResult=callTool(fc.name,fc.args||{});
     return {functionResponse:{name:fc.name,response:{result:toolResult}}};
    }catch(e){
     return {functionResponse:{name:fc.name,response:{error:e.message}}};
    }
   });
   messages.push({role:'user',parts:functionResponseParts});
  }
  return {mode:'gemini',message:'Stopped after maximum tool-call turns.',modelId};
 }catch(e){
  return {mode:'gemini-error',message:'Gemini request failed.',detail:String(e.message||e)};
 }
}

async function runBedrock(prompt){
 if(!process.env.ENABLE_BEDROCK||process.env.ENABLE_BEDROCK!=='true') return {mode:'offline-simulation',...handleCommand(prompt)};
 const modelId=process.env.BEDROCK_MODEL_ID;
 const region=process.env.AWS_REGION||'us-east-1';
 if(!modelId) return {mode:'configuration-error',message:'BEDROCK_MODEL_ID is required when AI_PROVIDER=bedrock.'};

 const apiKey=process.env.BEDROCK_API_KEY;
 if(apiKey) return runWithApiKey(prompt,modelId,region,apiKey);

 let sdk;
 try{sdk=await import('@aws-sdk/client-bedrock-runtime')}catch{return {mode:'configuration-error',message:'Install dependencies with npm install to enable Bedrock.'}};
 const client=new sdk.BedrockRuntimeClient({region});
 const toolConfig={tools:tools.map(t=>({toolSpec:{name:t.name,description:t.description,inputSchema:{json:t.inputSchema}}}))};
 const messages=[{role:'user',content:[{text:prompt}]}];
 try{
  for(let turn=0;turn<4;turn++){
   const result=await client.send(new sdk.ConverseCommand({modelId,system:[{text:SYSTEM_PROMPT}],messages,toolConfig,inferenceConfig:{maxTokens:512,temperature:0.2}}));
   const content=result.output?.message?.content||[];
   messages.push({role:'assistant',content});
   const uses=content.filter(c=>c.toolUse).map(c=>c.toolUse);
   if(!uses.length) return {mode:'aws-bedrock',message:content.filter(c=>c.text).map(c=>c.text).join('\n')||'Completed.',modelId};
   const responses=uses.map(use=>{
    try{return {toolResult:{toolUseId:use.toolUseId,content:[{json:callTool(use.name,use.input||{})}]}}}
    catch(e){return {toolResult:{toolUseId:use.toolUseId,status:'error',content:[{text:e.message}]}}}
   });
   messages.push({role:'user',content:responses});
  }
  return {mode:'aws-bedrock',message:'Stopped after maximum tool-call turns.'};
 }catch(e){return {mode:'aws-error',message:'Bedrock request failed. Check region, model access, permissions and credentials.',detail:String(e.name||'Error')};}
 finally{client.destroy()}
}

async function runWithApiKey(prompt,modelId,region,apiKey){
 const colonIdx=apiKey.lastIndexOf(':');
 if(colonIdx<0) return {mode:'configuration-error',message:'Invalid Bedrock API Key format.'};
 const accessKeyId=apiKey.slice(0,colonIdx);
 const secretAccessKey=apiKey.slice(colonIdx+1);

 let sigv4,sha256;
 try{
  sigv4=(await import('@aws-sdk/signature-v4')).SignatureV4;
  sha256=(await import('@aws-crypto/sha256-js')).Sha256;
 }catch{
  return {mode:'configuration-error',message:'Install @aws-sdk/signature-v4 and @aws-crypto/sha256-js for Bedrock API Key support.'};
 }

 const signer=new sigv4({credentials:{accessKeyId,secretAccessKey},region,service:'bedrock',sha256});
 const endpoint=`https://bedrock-runtime.${region}.amazonaws.com`;
 const toolConfig={tools:tools.map(t=>({toolSpec:{name:t.name,description:t.description,inputSchema:{json:t.inputSchema}}}))};
 const messages=[{role:'user',content:[{text:prompt}]}];

 try{
  for(let turn=0;turn<4;turn++){
   const body={modelId,system:[{text:SYSTEM_PROMPT}],messages,toolConfig,inferenceConfig:{maxTokens:512,temperature:0.2}};
   const url=`${endpoint}/model/${modelId}/converse`;
   const urlObj=new URL(url);
   const httpRequest={method:'POST',protocol:urlObj.protocol,hostname:urlObj.hostname,path:urlObj.pathname+urlObj.search,headers:{'Content-Type':'application/json','host':urlObj.hostname},body:JSON.stringify(body)};
   const signedRequest=await signer.sign(httpRequest);
   const fetchHeaders=new Headers();
   for(const[key,value]of Object.entries(signedRequest.headers)) fetchHeaders.set(key,value);
   const res=await fetch(url,{method:'POST',headers:fetchHeaders,body:signedRequest.body});
   if(!res.ok){const errText=await res.text().catch(()=>'');return {mode:'aws-error',message:`Bedrock API returned ${res.status}: ${errText}`};}
   const data=await res.json();
   const content=data.output?.message?.content||[];
   messages.push({role:'assistant',content});
   const uses=content.filter(c=>c.toolUse).map(c=>c.toolUse);
   if(!uses.length) return {mode:'aws-bedrock',message:content.filter(c=>c.text).map(c=>c.text).join('\n')||'Completed.',modelId,auth:'api-key'};
   const responses=uses.map(use=>{
    try{return {toolResult:{toolUseId:use.toolUseId,content:[{json:callTool(use.name,use.input||{})}]}}}
    catch(e){return {toolResult:{toolUseId:use.toolUseId,status:'error',content:[{text:e.message}]}}}
   });
   messages.push({role:'user',content:responses});
  }
  return {mode:'aws-bedrock',message:'Stopped after maximum tool-call turns.',modelId,auth:'api-key'};
 }catch(e){return {mode:'aws-error',message:'Bedrock API request failed.',detail:String(e.message||e)};}
}
