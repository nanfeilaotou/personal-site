const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict');
const accepted='ff907cb5b541f7e7081f71a39a1c9e7c213a84f0',norm=s=>s.replaceAll('\r\n','\n');
const original=norm(cp.execFileSync('git',['show',accepted+':prototype/prototype-02.html']).toString()),home=norm(fs.readFileSync('index.html','utf8'));
const recovered=home.replace('<link rel="icon" href="data:,">\n','').replaceAll('href="prototype/','href="').replaceAll('src="data/','src="../data/').replaceAll('src="prototype/','src="').replace('<title>NANFEILAOTOU · AI 与全球数字服务</title>\n<link rel="canonical" href="https://personal-site-7xv.pages.dev/">','<title>NANFEILAOTOU · 原型 02</title>').replace('<p>NANFEILAOTOU</p>','<p>NANFEILAOTOU · PROTOTYPE 02</p>');
assert.equal(recovered,original,'root markup preserves approved page apart from asset paths/metadata/footer');
const changed=cp.execFileSync('git',['diff',accepted,'--name-only','--','prototype','data','assets']).toString().trim().split(/\r?\n/).filter(Boolean);assert.deepEqual(changed,['prototype/prototype-02.html']);
const alias=fs.readFileSync('prototype/prototype-02.html','utf8');assert.ok(alias.includes('location.replace(home.href)'));assert.ok(alias.includes('home.search=location.search;home.hash=location.hash'));
assert.ok(!home.includes('PROTOTYPE 02'));assert.ok(!home.includes('<base '),'base URI must not redirect hash history to the prototype directory');assert.ok(fs.existsSync('404.html'));assert.match(fs.readFileSync('_redirects','utf8'),/\/assets\/cards\/starryblu-card.png \/assets\/cards\/public\/starryblu-card-sanitized.png 302/);
console.log('PASS approved page promoted without animation/data/asset edits, one canonical markup, old links preserved, release metadata and raw-image redirect');
