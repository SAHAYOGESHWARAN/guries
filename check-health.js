const fetch = global.fetch;
(async()=>{
  try{
    const r = await fetch('http://localhost:3003/api/v1/health');
    console.log('status', r.status);
    console.log('body', await r.text());
  } catch(e) {console.error('err',e.message);}
})();