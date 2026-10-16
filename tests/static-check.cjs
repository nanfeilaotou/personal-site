const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');
const baseline=read('prototype/prototype-01.html'),motion=read('prototype/motion.js');
for(const name of ['VS','FS']){
  const re=new RegExp('const '+name+'=`([\\s\\S]*?)`;');assert.equal(motion.match(re)[1],baseline.match(re)[1],name+' must be unchanged');
}
for(const [name,end] of [['buildPoints','function drawGL'],['drawGL','/* ============ 2D'],['sceneGlobal','/* ============ 03']]){
  const grab=s=>s.slice(s.indexOf('function '+name+'('),s.indexOf(end,s.indexOf('function '+name+'('))).trim();
  assert.equal(grab(motion),grab(baseline),name+' must be unchanged');
}
const sandbox={window:{}};vm.createContext(sandbox);
for(const name of ['models','agents'])vm.runInContext(read('data/'+name+'.js'),sandbox);
const {NF_MODELS:models,NF_AGENTS:agents,NF_LOCAL:local}=sandbox.window;
assert.equal(models.length,8);assert.equal(agents.length,10);assert.equal(local.length,3);
assert.equal(new Set([...models,...agents,...local].map(x=>x.id)).size,21);
for(const d of [...models,...agents,...local]){
  assert.equal(d.verifiedAt,'2026-10-16');assert.ok(d.officialSource.startsWith('https://'));assert.ok(d.description);
  if(d.logo)assert.ok(fs.existsSync(path.join(root,'assets/brands',d.logo)));
}
for(const d of models){assert.ok(d.featuredModels.length);assert.ok(d.modelScope.includes('API'));}
for(const file of fs.readdirSync(path.join(root,'assets/brands')).filter(x=>x.endsWith('.svg'))){
  const svg=read('assets/brands/'+file);assert.ok(!/<(script|foreignObject|image|use)|\bon\w+\s*=|(?:href|src)\s*=|url\(|<!ENTITY/i.test(svg),file+' must be passive');
}
for(const f of ['data/models.js','data/agents.js','prototype/timeline.js','prototype/showcase.js','prototype/motion.js'])new vm.Script(read(f),{filename:f});
assert.ok(!/grain|keyframes gr/.test(read('prototype/prototype-02.html')));
assert.ok(!/TOKEN|EMBEDDING|ATTENTION|SAMPLING|MODEL CONTEXT PROTOCOL|HARNESS/.test(motion));
assert.equal(read('index.html'),baseline,'local original index must stay untouched');
console.log('PASS: unchanged shaders / sampling / WebGL draw / Global; 8 models + 10 agents + 3 local; SVG and JS checks; local index retained.');
