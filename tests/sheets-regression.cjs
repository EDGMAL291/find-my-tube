const fs = require('fs');
const vm = require('vm');
const http = require('http');
const https = require('https');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('path').join(__dirname, '../server.js'),'utf8');
const start = source.indexOf('async function postJson(');
const end = source.indexOf('async function syncStockRecordToSheets',start);
const context = {http,https,URL,Buffer,STOCK_SHEETS_TIMEOUT_MS:1000};
vm.createContext(context);vm.runInContext(source.slice(start,end),context);
const received=[];
const server=http.createServer((req,res)=>{
 let body='';req.on('data',data=>body+=data);req.on('end',()=>{
  received.push({path:req.url,method:req.method,body});
  if(req.url.startsWith('/redirect/')){res.writeHead(Number(req.url.split('/')[2]),{Location:'/result'});res.end();}
  else {res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');}
 });
});
server.listen(0,'127.0.0.1',async()=>{
 try {
  for(const status of [301,302,303,307,308]) {
   const result=await context.postJson(`http://127.0.0.1:${server.address().port}/redirect/${status}`,{id:'TEST'});
   assert.equal(result.statusCode,200);
   const last=received.at(-1);assert.equal(last.method,status>=307?'POST':'GET');
   assert.equal(last.body,status>=307?'{"id":"TEST"}':'');
  }
  console.log('PASS: Sheets redirect methods and request bodies for 301, 302, 303, 307, 308');
 }catch(e){console.error(e);process.exitCode=1;}finally{server.close();}
});
