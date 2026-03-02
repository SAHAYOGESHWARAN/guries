const fetch = global.fetch || require('node-fetch');
(async()=>{
 try{
  let r = await fetch('http://localhost:3003/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.com',password:'admin123'})});
  let d=await r.json();
  console.log('login status',r.status,d);
  const token=d.token;
  console.log('making GET /keywords');
  let r2 = await fetch('http://localhost:3003/api/v1/keywords',{headers:{Authorization:'Bearer '+token}});
  console.log('keywords status',r2.status);
  console.log('keywords body',await r2.text());
 }catch(e){console.error('error',e)}
})();