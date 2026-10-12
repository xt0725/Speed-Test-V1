const fs=require('node:fs');
const path=require('node:path');
module.exports=async context=>{
  if(context.electronPlatformName!=='win32'||process.platform==='win32')return;
  const PE=await import('pe-library');const R=await import('resedit');
  const target=path.join(context.appOutDir,'Speed Test V1.exe');
  const exe=PE.NtExecutable.from(fs.readFileSync(target),{ignoreCert:true});
  const resources=PE.NtExecutableResource.from(exe);
  const icon=R.Data.IconFile.from(fs.readFileSync(path.join(context.packager.projectDir,'build/icon.ico')));
  const groups=R.Resource.IconGroupEntry.fromEntries(resources.entries);
  for(const group of groups)R.Resource.IconGroupEntry.replaceIconsForResource(resources.entries,group.id,group.lang,icon.icons.map(x=>x.data));
  for(const v of R.Resource.VersionInfo.fromEntries(resources.entries)){
    v.setFileVersion(1,0,0,0,1033);v.setProductVersion(1,0,0,0,1033);
    v.setStringValues({lang:1033,codepage:1200},{FileDescription:'Speed Test V1',ProductName:'Speed Test V1',CompanyName:'XT.07',OriginalFilename:'Speed Test V1.exe',LegalCopyright:'Copyright 2026 XT.07'});
    v.outputToResourceEntries(resources.entries);
  }
  resources.outputResource(exe);fs.writeFileSync(target,Buffer.from(exe.generate()));
};
