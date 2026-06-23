const fs=require('fs');
async function main(){
  const t=await(await fetch('http://localhost:9222/json')).json();
  const ws=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.onopen=r);let id=0;const w={},ev={};
  ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&w[d.id]){w[d.id](d.result);delete w[d.id];}if(d.method&&ev[d.method]){const f=ev[d.method];delete ev[d.method];f(d.params);}};
  const send=(m,p={})=>new Promise(r=>{const i=++id;w[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p}));});
  const E=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true})).result.value;
  const waitLoad=()=>new Promise(r=>ev['Page.loadEventFired']=r);
  const shot=async f=>{const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(f,Buffer.from(r.data,'base64'));};
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1366,height:820,deviceScaleFactor:1,mobile:false});
  let lp=waitLoad();await send('Page.navigate',{url:'file:///d:/demo/LANZ/demo-2/index.html'});await lp;
  await new Promise(r=>setTimeout(r,3000));
  await E("document.documentElement.style.scrollBehavior='auto'");
  const supTop=await E("(()=>{let el=document.getElementById('support'),t=0;while(el){t+=el.offsetTop;el=el.offsetParent}return t})()");
  const d=await E("document.getElementById('support').offsetHeight-innerHeight");
  console.log('supTop',supTop,'scrubPx',d);
  const ps=[0.16,0.50,0.84];
  for(let i=0;i<ps.length;i++){
    await E("scrollTo(0,"+Math.round(supTop+ps[i]*d)+")");
    await new Promise(r=>setTimeout(r,500));
    const info=await E("(()=>{const on=[...document.querySelectorAll('.svc')].findIndex(e=>e.classList.contains('on'));const h2=document.querySelector('#support h2').getBoundingClientRect();const ft=document.querySelector('footer').getBoundingClientRect();return JSON.stringify({on,h2top:Math.round(h2.top),footerTop:Math.round(ft.top),vh:innerHeight})})()");
    console.log('p='+ps[i],info);
    await shot('sup-'+i+'.png');
  }
  ws.close();
}
main().catch(e=>{console.error(e);process.exit(1)});
