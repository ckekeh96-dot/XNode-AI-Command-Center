const SSID='XNode-Mesh';
const HUB_IP='192.168.10.1';
const PROTOCOLS={camera:'wifi',lock:'wifi',climate:'wifi',light:'zigbee',sensor:'zigbee'};
let nextIp=11;

export function attachNetwork(devices){
 let changed=false;
 for(const d of devices){
  if(!d.network){
   changed=true;
   d.network={ip:`192.168.10.${nextIp++}`,rssi:-45-Math.floor(Math.random()*25),latencyMs:8+Math.floor(Math.random()*40),protocol:PROTOCOLS[d.type]||'wifi',connected:true,lastSeen:new Date().toISOString(),pairedAt:new Date().toISOString()};
  }
 }
 return changed;
}

export function jitter(devices){
 const now=new Date().toISOString();
 for(const d of devices){
  const n=d.network;
  if(n&&n.connected){
   n.rssi=Math.max(-82,Math.min(-38,n.rssi+(Math.floor(Math.random()*7)-3)));
   n.latencyMs=Math.max(4,Math.min(120,n.latencyMs+(Math.floor(Math.random()*9)-4)));
   n.lastSeen=now;
  }
 }
}

export function signalBars(rssi){return rssi>-50?4:rssi>-60?3:rssi>-70?2:1;}

export function pairDevice(d){
 d.network=d.network||{ip:`192.168.10.${nextIp++}`,protocol:PROTOCOLS[d.type]||'wifi'};
 d.network.connected=true;
 d.network.rssi=-42-Math.floor(Math.random()*12);
 d.network.latencyMs=10+Math.floor(Math.random()*25);
 d.network.lastSeen=new Date().toISOString();
 d.network.pairedAt=new Date().toISOString();
 return d.network;
}

export function dropDevice(d){
 if(!d.network)d.network={ip:`192.168.10.${nextIp++}`,protocol:PROTOCOLS[d.type]||'wifi'};
 d.network.connected=false;
 d.network.rssi=null;
 d.network.latencyMs=null;
 return d.network;
}

export function networkStatus(devices){
 const list=devices||[];
 const online=list.filter(d=>d.network&&d.network.connected);
 return {
  ssid:SSID,
  hubIp:HUB_IP,
  hubName:'XNode Command Center',
  mode:'SIMULATED local mesh — no real radios',
  devicesTotal:list.length,
  devicesOnline:online.length,
  devicesOffline:list.length-online.length,
  avgSignalDbm:online.length?Math.round(online.reduce((s,d)=>s+d.network.rssi,0)/online.length):null,
  avgLatencyMs:online.length?Math.round(online.reduce((s,d)=>s+d.network.latencyMs,0)/online.length):null
 };
}

export {SSID,HUB_IP};
