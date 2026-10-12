const {app,BrowserWindow,ipcMain,dialog}=require('electron');
const path=require('node:path');
const {runTest,publicIP,safeError}=require('./network.cjs');
let win, active, revealing=false;
function trusted(event) { return win && event.sender===win.webContents && event.senderFrame===win.webContents.mainFrame; }
app.whenReady().then(()=>{
  win=new BrowserWindow({width:1120,height:800,minWidth:850,minHeight:720,backgroundColor:'#0c1018',title:'Speed Test V1',icon:path.join(__dirname,'../assets/icon.png'),autoHideMenuBar:true,
    webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',e=>e.preventDefault());
  win.loadFile(path.join(__dirname,'index.html'));
  win.on('closed',()=>{active?.abort();win=null;});
});
ipcMain.handle('test:start',async event=>{
  if(!trusted(event)||active) return {error:'Un test est déjà en cours.'};
  const controller=new AbortController(); active=controller;
  try { return {result:await runTest(controller.signal,data=>{if(win&&!win.isDestroyed())win.webContents.send('test:progress',data);})}; }
  catch(e){return {error:safeError(e)};} finally {active=null;}
});
ipcMain.handle('test:cancel',event=>{if(trusted(event))active?.abort();});
ipcMain.handle('ip:reveal',async event=>{
  if(!trusted(event)||revealing) return null;
  revealing=true;
  try {
    const answer=await dialog.showMessageBox(win,{type:'question',title:'Afficher ton adresse IP ?',message:'Ton adresse IP publique deviendra visible à l’écran.',detail:'Elle peut être vue dans une capture ou un partage d’écran. Elle sera automatiquement remasquée après 30 secondes. Cloudflare sera contacté pour la récupérer.',buttons:['Annuler','Afficher mon IP'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1 || !win) return null;
    try {return {ip:await publicIP(AbortSignal.timeout(10000))};} catch {return {error:'Impossible de récupérer ton IP. Réessaie plus tard.'};}
  } finally {revealing=false;}
});
app.on('browser-window-blur',()=>win?.webContents.send('ip:hide'));
app.on('window-all-closed',()=>app.quit());
