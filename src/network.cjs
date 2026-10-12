const https = require('node:https');
const { performance } = require('node:perf_hooks');
const { isIP } = require('node:net');
const HOST = 'speed.cloudflare.com';
const toMbps = (bytes, milliseconds) => bytes * 8 / milliseconds / 1000;
const median = a => { const b = [...a].sort((x,y)=>x-y); const n=b.length; return n%2 ? b[n>>1] : (b[n/2-1]+b[n/2])/2; };
const jitter = a => a.length < 2 ? 0 : a.slice(1).reduce((s,v,i)=>s+Math.abs(v-a[i]),0)/(a.length-1);
function request(path, {signal, bytes, onChunk, text=false} = {}) {
  return new Promise((resolve,reject) => {
    const start=performance.now(); let received=0, chunks=[];
    const req=https.request({hostname:HOST,path,method:bytes ? 'POST' : 'GET',signal,
      headers: {'Cache-Control':'no-cache','User-Agent':'SpeedTestV1/1.0', ...(bytes ? {'Content-Type':'application/octet-stream','Content-Length':bytes}: {})}}, res=> {
      if (res.statusCode !== 200) { res.resume(); reject(new Error('SERVICE')); return; }
      const firstByte=performance.now()-start;
      res.on('data',chunk=>{ received+=chunk.length; if(text && received<=16384) chunks.push(chunk); onChunk?.(chunk.length); });
      res.on('error',reject);
      res.on('aborted',()=>reject(new Error('INCOMPLETE')));
      res.on('end',()=>resolve({received, elapsed:performance.now()-start, firstByte, text:Buffer.concat(chunks).toString('utf8')}));
    });
    const timer=setTimeout(()=>req.destroy(new Error('TIMEOUT')),15000);
    req.on('error',reject); req.on('close',()=>clearTimeout(timer));
    if(bytes) {
      let remaining=bytes; const chunk=Buffer.alloc(65536,0x53);
      const write=()=>{ while(remaining>0) { const n=Math.min(remaining,chunk.length); remaining-=n; if(!req.write(chunk.subarray(0,n))) { req.once('drain',write); return; } } req.end(); };
      write();
    } else req.end();
  });
}
function safeError(error) {
  if(error?.name==='AbortError') return 'Test annulé.';
  if(error?.message==='TIMEOUT') return 'Le serveur ne répond pas. Vérifie ta connexion puis réessaie.';
  return 'Impossible de joindre le serveur de test. Vérifie ta connexion ou réessaie plus tard.';
}
async function runTest(signal, emit, transport=request) {
  const points=[];
  emit({phase:'ping',progress:0,value:0});
  // Warm-up TLS/DNS, not included in the reported HTTP latency.
  await transport('/__down?bytes=0',{signal});
  for(let i=0;i<8;i++) {
    const r=await transport('/__down?bytes=0&nonce='+Date.now(),{signal});
    points.push(r.firstByte); emit({phase:'ping',progress:(i+1)/8*20,value:median(points)});
  }
  async function bandwidth(phase,startProgress) {
    const start=performance.now(); let total=0, duration=0, size=1000000;
    // Adaptive, bounded transfers: up to 8 requests and 8 seconds plus the last request.
    for(let i=0;i<8;i++) {
      if(signal.aborted) throw new DOMException('Cancelled','AbortError');
      const opts={signal};
      if(phase==='upload') opts.bytes=size;
      else {
        let current=0; const transferStart=performance.now(); let lastUpdate=0;
        opts.onChunk=n=>{current+=n; const now=performance.now(); if(now-lastUpdate>=100){lastUpdate=now;emit({phase,progress:startProgress+Math.min(0.95,(now-start)/8000)*40,value:toMbps(total+current,Math.max(1,duration+now-transferStart))});}};
      }
      const r=await transport(phase==='download' ? `/__down?bytes=${size}&nonce=${Date.now()}` : '/__up',opts);
      if(phase==='download' && r.received!==size) throw new Error('INCOMPLETE');
      total+=phase==='download' ? r.received : size; duration+=r.elapsed;
      emit({phase,progress:startProgress+Math.min(1,(performance.now()-start)/8000)*40,value:toMbps(total,duration)});
      if(performance.now()-start>=8000) break;
      size=Math.min(16000000,Math.max(1000000,Math.round(toMbps(total,duration)*125000)));
    }
    return {mbps:toMbps(total,duration),bytes:total};
  }
  const down=await bandwidth('download',20); const up=await bandwidth('upload',60);
  return {download:down.mbps,upload:up.mbps,ping:median(points),jitter:jitter(points),dataMB:(down.bytes+up.bytes)/1000000,date:new Date().toISOString()};
}
async function publicIP(signal) {
  const r=await request('/cdn-cgi/trace',{signal,text:true});
  const ip=r.text.split('\n').find(l=>l.startsWith('ip='))?.slice(3).trim();
  if(!ip || !isIP(ip)) throw new Error('IP_UNAVAILABLE');
  return ip;
}
module.exports={runTest,publicIP,toMbps,median,jitter,safeError};
