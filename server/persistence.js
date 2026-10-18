import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const __dir=dirname(fileURLToPath(import.meta.url));
const DATA_DIR=join(__dir,'..','data');
const STATE_FILE=join(DATA_DIR,'state.json');

const DEFAULT_STATE={
 tasks:[],
 events:[{id:'demo-1',type:'doorbell',message:'Simulated front-door visitor',at:new Date().toISOString()}],
 audit:[],
 approvals:[],
 preferences:{privacyMode:true}
};

mkdirSync(DATA_DIR,{recursive:true});

let cachedState=null;

export function loadState(){
 if(cachedState) return cachedState;
 try{
  if(existsSync(STATE_FILE)){
   cachedState=JSON.parse(readFileSync(STATE_FILE,'utf8'));
  }else{
   cachedState=structuredClone(DEFAULT_STATE);
  }
 }catch{
  cachedState=structuredClone(DEFAULT_STATE);
 }
 return cachedState;
}

export function saveState(){
 if(!cachedState) return;
 try{
  writeFileSync(STATE_FILE,JSON.stringify(cachedState,null,2),'utf8');
 }catch(e){
  console.error('Failed to save state:',e.message);
 }
}

export function resetState(){
 if(!cachedState){
  cachedState=structuredClone(DEFAULT_STATE);
 }else{
  for(const key of Object.keys(cachedState))delete cachedState[key];
  Object.assign(cachedState,structuredClone(DEFAULT_STATE));
 }
 saveState();
 return cachedState;
}
