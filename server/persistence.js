import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const __dir=dirname(fileURLToPath(import.meta.url));
const DATA_DIR=join(__dir,'..','data');
const STATE_FILE=join(DATA_DIR,'state.json');

const DEFAULT_STATE={
 tasks:[{id:'seed-1',title:'Review morning security brief',done:true},{id:'seed-2',title:'Check back yard camera feed',done:false}],
 events:[{id:'demo-1',type:'doorbell',message:'Simulated front-door visitor',at:new Date().toISOString(),dismissed:false,location:'front',source:'SIMULATED',severity:'info',icon:''}],
 audit:(()=>{const a=[];const now=Date.now();const tools=['list_tasks','security_events','simulate_event','business_summary','activity_log','dismiss_event','add_task','complete_task'];for(let d=0;d<7;d++){const count=Math.floor(Math.random()*5)+2;for(let i=0;i<count;i++){const h=Math.floor(Math.random()*18)+6;a.push({name:tools[Math.floor(Math.random()*tools.length)],at:new Date(now-(d*86400000+h*3600000+Math.random()*3600000)).toISOString()})}}return a;})(),
 approvals:[{id:'seed-a1',visitor:'Demo neighbor',purpose:'Package pickup inquiry',status:'approved',createdAt:new Date(Date.now()-86400000*2).toISOString(),source:'SIMULATED'}],
 devices:[
  {id:'cam-front',name:'Front Camera',type:'camera',status:'online',battery:100,location:'front'},
  {id:'cam-back',name:'Back Camera',type:'camera',status:'online',battery:87,location:'back'},
  {id:'lock-front',name:'Front Door Lock',type:'lock',status:'locked',location:'front'},
  {id:'lock-back',name:'Back Door Lock',type:'lock',status:'locked',location:'back'},
  {id:'thermostat',name:'Thermostat',type:'climate',status:'cooling',value:72,location:'indoor'},
  {id:'light-living',name:'Living Room Lights',type:'light',status:'on',value:80,location:'indoor'},
  {id:'light-porch',name:'Porch Light',type:'light',status:'on',location:'front'},
  {id:'sensor-front',name:'Front Motion Sensor',type:'sensor',status:'active',location:'front'},
  {id:'sensor-back',name:'Back Motion Sensor',type:'sensor',status:'active',location:'back'},
  {id:'sensor-left',name:'Left Side Motion Sensor',type:'sensor',status:'active',location:'left'},
  {id:'sensor-right',name:'Right Side Motion Sensor',type:'sensor',status:'active',location:'right'},
  {id:'doorbell-cam',name:'Video Doorbell',type:'camera',status:'online',battery:94,location:'front'}
 ],
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
