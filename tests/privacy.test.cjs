const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
async function setup(response){
  let ipCalls=0,dialogOptions; const handlers={},webContents={mainFrame:{},setWindowOpenHandler(){},on(){},send(){}};
  class BrowserWindow{constructor(){this.webContents=webContents;}loadFile(){}on(){}isDestroyed(){return false;}}
  const electron={app:{whenReady:()=>Promise.resolve(),on(){},quit(){}},BrowserWindow,ipcMain:{handle:(name,fn)=>handlers[name]=fn},dialog:{showMessageBox:async(_window,options)=>{dialogOptions=options;return {response};}}};
  const network={publicIP:async()=>{ipCalls++;return '192.0.2.123';},runTest(){},safeError(){}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/main.cjs'),'utf8'),{require:name=>name==='electron'?electron:name==='./network.cjs'?network:require(name),__dirname:path.join(__dirname,'../src'),AbortController,AbortSignal});
  await Promise.resolve();
  return {handlers,event:{sender:webContents,senderFrame:webContents.mainFrame},calls:()=>ipCalls,options:()=>dialogOptions};
}
test('Annuler la confirmation ne récupère pas l’adresse IP',async()=>{
  const s=await setup(0);assert.equal(s.calls(),0);
  assert.equal(await s.handlers['ip:reveal'](s.event),null);assert.equal(s.calls(),0);
  assert.equal(s.options().defaultId,0);assert.equal(s.options().cancelId,0);
});
test('L’IP ne peut être obtenue qu’après confirmation explicite',async()=>{
  const s=await setup(1);assert.equal(s.calls(),0);
  assert.equal((await s.handlers['ip:reveal'](s.event)).ip,'192.0.2.123');assert.equal(s.calls(),1);
});
test('Une autre fenêtre ne peut pas demander une IP',async()=>{
  const s=await setup(1);assert.equal(await s.handlers['ip:reveal']({sender:{},senderFrame:{}}),null);assert.equal(s.calls(),0);
});
