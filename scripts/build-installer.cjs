const fs=require('node:fs');const path=require('node:path');const os=require('node:os');const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'), appDir=path.join(root,'dist/win-unpacked');
const files=[],dirs=[];
function walk(dir,relative=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const name=path.join(relative,entry.name);if(entry.isDirectory()){walk(path.join(dir,entry.name),name);dirs.push(name);}else files.push(name);}}
walk(appDir);
const winPath=p=>p.split(path.sep).join('\\').replaceAll('$','$$');
fs.writeFileSync(path.join(root,'build/installed-files.nsh'),files.map(f=>`Delete "$INSTDIR\\${winPath(f)}"`).concat(dirs.map(d=>`RMDir "$INSTDIR\\${winPath(d)}"`)).join('\n')+'\n');
const cache=process.env.ELECTRON_BUILDER_CACHE||path.join(os.homedir(),'.cache/electron-builder');
function locate(dir){if(!fs.existsSync(dir))return;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory()){const match=locate(p);if(match)return match;}else if(entry.name==='makensis'&&path.basename(dir)==='linux')return p;}}
const makensis=process.env.MAKENSIS||locate(cache);
if(!makensis)throw new Error('NSIS manquant. Installer NSIS et définir MAKENSIS, ou compiler via GitHub Actions sous Windows.');
const nsisDir=path.dirname(path.dirname(makensis));
execFileSync(makensis,['-V2','standalone.nsi'],{cwd:path.join(root,'build'),env:{...process.env,NSISDIR:nsisDir},stdio:'inherit'});
console.log('Installateur généré : dist/Speed-Test-V1-Setup-1.0.0.exe');
