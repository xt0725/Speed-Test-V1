const $=id=>document.getElementById(id);
const api=window.speedtest;
const names={ping:'Mesure de la latence…',download:'Test du téléchargement…',upload:'Test du débit montant…'};
let ipVisible=false,hideTimer;
const format=n=>Number.isFinite(n)?n.toLocaleString('fr-FR',{maximumFractionDigits:1}):'—';
function hideIP(){clearTimeout(hideTimer);ipVisible=false;$('ip').textContent='•••.•••.•••.•••';$('reveal').textContent='Afficher mon IP';}
api?.onHide(hideIP);
window.addEventListener('blur',hideIP);
document.addEventListener('visibilitychange',()=>{if(document.hidden)hideIP();});
api?.onProgress(data=>{
  $('phase').textContent=data.phase==='ping'?'PING HTTP':data.phase==='download'?'TÉLÉCHARGEMENT':'ENVOI';
  $('live').textContent=format(data.value);$('unit').textContent=data.phase==='ping'?'ms':'Mbps';
  $('sub').textContent='Mesure en cours';$('status').textContent=names[data.phase];
  $('progress').value=data.progress;$('gauge').style.setProperty('--angle',data.progress*2.9+'deg');
  $(data.phase).textContent=format(data.value);
});
$('start').addEventListener('click',async()=>{
  if(!api){$('status').textContent='Ouvre l’application Windows pour effectuer un vrai test.';return;}
  hideIP();$('start').disabled=true;$('cancel').hidden=false;$('progress').value=0;
  for(const id of ['download','upload','ping'])$(id).textContent='—';
  $('jitter').textContent='Latence vers Cloudflare';$('result-info').textContent='Test en cours. Les résultats précédents sont effacés.';
  try{
    const response=await api.start();
    if(response.error){$('status').textContent=response.error;for(const id of ['download','upload','ping'])$(id).textContent='—';$('live').textContent='—';$('phase').textContent='TEST INTERROMPU';$('sub').textContent='Relance le test';$('result-info').textContent='Aucun résultat complet.';return;}
    const r=response.result;
    for(const key of ['download','upload','ping'])$(key).textContent=format(r[key]);
    $('jitter').textContent='Gigue HTTP : '+format(r.jitter)+' ms';$('status').textContent='Test terminé.';
    $('phase').textContent='TÉLÉCHARGEMENT';$('live').textContent=format(r.download);$('unit').textContent='Mbps';$('sub').textContent='Test terminé';$('progress').value=100;$('gauge').style.setProperty('--angle','290deg');
    $('result-info').textContent='Dernier test : '+new Date(r.date).toLocaleTimeString('fr-FR')+' · '+format(r.dataMB)+' Mo transférés. IP non enregistrée.';
  }catch{$('status').textContent='Le test a rencontré une erreur. Réessaie.';}finally{$('start').disabled=false;$('cancel').hidden=true;}
});
$('cancel').addEventListener('click',()=>api?.cancel());
$('reveal').addEventListener('click',async()=>{
  if(ipVisible){hideIP();return;}if(!api)return;
  $('reveal').disabled=true;
  try{const result=await api.reveal();if(result?.ip){ipVisible=true;$('ip').textContent=result.ip;$('reveal').textContent='Masquer mon IP';hideTimer=setTimeout(hideIP,30000);}else if(result?.error){$('status').textContent=result.error;}}
  finally{$('reveal').disabled=false;}
});
