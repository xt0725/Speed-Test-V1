const test=require('node:test');const assert=require('node:assert/strict');
const {toMbps,median,jitter,runTest,safeError}=require('../src/network.cjs');
test('Unités et statistiques',()=>{assert.equal(toMbps(125000000,1000),1000);assert.equal(median([40,10,20,30]),25);assert.equal(jitter([10,20,15]),7.5);});
test('Un transfert interrompu ne peut pas devenir un débit valide',async()=>{
  const transport=async path=>({received:path.includes('bytes=0')?0:5,elapsed:10,firstByte:10});
  await assert.rejects(runTest(new AbortController().signal,()=>{},transport),/INCOMPLETE/);
});
test('Un test annulé ne retourne pas de résultat complet',async()=>{
  const c=new AbortController();c.abort();
  await assert.rejects(runTest(c.signal,()=>{},async()=>({received:0,elapsed:10,firstByte:10})),{name:'AbortError'});
});
test('Les erreurs réseau ne révèlent aucune adresse',()=>{assert.ok(!safeError(new Error('192.0.2.123')).includes('192.0.2.123'));});
test('Le cycle complet retourne des mesures finies sans adresse IP',async()=>{
  const phases=new Set();
  const result=await runTest(new AbortController().signal,d=>phases.add(d.phase),async(path,opts)=>({received:Number(new URL('https://test.invalid'+path).searchParams.get('bytes')||0),elapsed:1000,firstByte:25}));
  assert.deepEqual([...phases],['ping','download','upload']);
  assert.equal(result.ping,25);assert.equal(result.jitter,0);
  assert.ok(result.download>0&&Number.isFinite(result.upload));assert.ok(!('ip' in result));
});
