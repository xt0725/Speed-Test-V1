const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('speedtest',{
  start:()=>ipcRenderer.invoke('test:start'), cancel:()=>ipcRenderer.invoke('test:cancel'), reveal:()=>ipcRenderer.invoke('ip:reveal'),
  onProgress:callback=>ipcRenderer.on('test:progress',(_event,data)=>callback(data)),
  onHide:callback=>ipcRenderer.on('ip:hide',()=>callback())
});
