// Original login.html logic, kept unchanged (only DOMContentLoaded -> __onReady, .html links -> routes).
export default function initLoginPage() {
const __ready = [];
const __onReady = (fn) => __ready.push(fn);

(function(){
  const ROLES = {
    admin:      {name:'Admin',      uid:'KAMRUP_ADMIN_GIS',       page:'/admin',         c:'#0284c7', c2:'#0ea5e9', desc:'<b>District Admin</b> · Flood monitoring map, river gauges &amp; GIS zone marking'},
    authority:  {name:'Authority',  uid:'KAMRUP_DC_AUTHORITY',    page:'/authority',     c:'#0f766e', c2:'#14b8a6', desc:'<b>Authority</b> · Resource allocation &amp; NDRF/SDRF coordination records'},
    godown:     {name:'Godown',     uid:'KAMRUP_GODOWN_MGR',      page:'/godown',        c:'#ea580c', c2:'#fb923c', desc:'<b>Godown Manager</b> · Inventory, stock &amp; relief dispatch control'},
    ground:     {name:'Ground',     uid:'FIELD_OFFICER_CHAYGAON', page:'/ground-officer', c:'#15803d', c2:'#22c55e', desc:'<b>Ground Officer</b> · Delivery &amp; return verification in the field'},
    monitoring: {name:'Monitoring', uid:'STATE_DEOC_AUDITOR',     page:'/monitoring',    c:'#6d28d9', c2:'#8b5cf6', desc:'<b>Monitoring Officer</b> · Common audit dashboard &amp; oversight'}
  };
  let role = 'admin', capAns = 0;
  const $ = id => document.getElementById(id);
  const root = document.documentElement;

  /* role select */
  function setRole(key, fill){
    role = key; const r = ROLES[key];
    document.querySelectorAll('.role').forEach(b => b.classList.toggle('active', b.dataset.role === key));
    root.style.setProperty('--accent', r.c); root.style.setProperty('--accent-2', r.c2);
    $('roleDesc').innerHTML = r.desc;
    $('uid').placeholder = 'e.g. ' + r.uid;
    if(fill) $('uid').value = r.uid;
  }
  document.querySelectorAll('.role').forEach(b => b.addEventListener('click', () => setRole(b.dataset.role, $('uid').value === '' || Object.values(ROLES).some(x => x.uid === $('uid').value))));
  setRole('admin', false);

  /* password eye + caps lock */
  $('eye').onclick = () => {
    const p = $('pwd'), show = p.type === 'password';
    p.type = show ? 'text' : 'password';
    $('eye').innerHTML = '<i class="fas fa-eye' + (show ? '-slash' : '') + '"></i>';
  };
  ['keydown','keyup'].forEach(ev => $('pwd').addEventListener(ev, e => {
    $('caps').classList.toggle('on', e.getModifierState && e.getModifierState('CapsLock'));
  }));

  /* captcha */
  function newCap(){
    const a = 2 + Math.floor(Math.random()*8), b = 2 + Math.floor(Math.random()*8);
    capAns = a + b; $('capQ').textContent = a + ' + ' + b + ' = ?'; $('capA').value = '';
  }
  $('capRefresh').onclick = newCap; newCap();

  /* messages */
  function msg(text, type){ const m = $('msg'); m.className = 'msg show ' + type; m.innerHTML = '<i class="fas fa-' + (type==='err'?'circle-exclamation':'circle-check') + '"></i> ' + text; }
  function shake(){ const w = document.querySelector('.card'); w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); }

  $('forgot').onclick = e => { e.preventDefault(); msg('Contact your District DEOC administrator to reset your PIN.', 'ok'); };

  /* enter portal */
  function enter(){
    const r = ROLES[role], btn = $('btn');
    btn.classList.add('loading');
    const steps = ['Verifying credentials…','Checking district clearance…','Access granted ✓'];
    let i = 0; btn.querySelector('span').textContent = steps[0]; btn.querySelector('i').className = 'fas fa-circle-notch fa-spin';
    const t = setInterval(() => {
      i++;
      if(i < steps.length){ btn.querySelector('span').textContent = steps[i]; }
      if(i === steps.length - 1){
        btn.classList.add('done'); btn.querySelector('i').className = 'fas fa-circle-check';
        clearInterval(t);
        try{ sessionStorage.setItem('neerakshak_role', role); sessionStorage.setItem('neerakshak_user', $('uid').value || r.uid); }catch(e){}
        setTimeout(() => {
          $('wipeTxt').textContent = 'Entering ' + r.name + ' Portal…';
          $('wipe').classList.add('go');
          setTimeout(() => { window.location.href = r.page; }, 1300);
        }, 450);
      }
    }, 650);
  }

  $('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const u = $('uid').value.trim(), p = $('pwd').value, a = $('capA').value.trim();
    if(!u){ msg('Please enter your Designated Officer ID.', 'err'); shake(); $('uid').focus(); return; }
    if(!p){ msg('Please enter your security PIN / password.', 'err'); shake(); $('pwd').focus(); return; }
    if(parseInt(a,10) !== capAns){ msg('Security question answer is incorrect. Try again.', 'err'); shake(); newCap(); $('capA').focus(); return; }
    msg('Credentials accepted. Securing your session…', 'ok');
    enter();
  });

  /* demo */
  function fillDemo(){ $('uid').value = ROLES[role].uid; $('pwd').value = 'demo@1234'; $('capA').value = capAns; }
  $('demoFill').onclick = () => { fillDemo(); msg('Demo credentials filled for ' + ROLES[role].name + '. Press Authenticate.', 'ok'); };
  $('demoGo').onclick = () => { fillDemo(); msg('Launching ' + ROLES[role].name + ' demo…', 'ok'); enter(); };

  /* IST clock */
  function tick(){
    const d = new Date();
    $('clkTime').textContent = d.toLocaleTimeString('en-IN', {timeZone:'Asia/Kolkata', hour12:true});
    $('clkDate').textContent = d.toLocaleDateString('en-IN', {timeZone:'Asia/Kolkata', day:'2-digit', month:'short', year:'numeric'}) + ' IST';
  }
  tick(); setInterval(tick, 1000);

  /* rain drops */
  const dr = $('drops');
  for(let i = 0; i < 38; i++){
    const s = document.createElement('span'); s.className = 'drop';
    s.style.left = (Math.random()*100) + 'vw';
    s.style.animationDuration = (1.2 + Math.random()*1.6) + 's';
    s.style.animationDelay = (-Math.random()*3) + 's';
    s.style.opacity = (0.25 + Math.random()*0.5);
    dr.appendChild(s);
  }

  /* 3D tilt on desktop */
  const tilt = $('tilt');
  if(window.matchMedia('(min-width:1101px) and (pointer:fine)').matches){
    window.addEventListener('mousemove', e => {
      const r = tilt.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / window.innerWidth, dy = (e.clientY - cy) / window.innerHeight;
      tilt.style.transform = 'perspective(1100px) rotateY(' + (dx*5).toFixed(2) + 'deg) rotateX(' + (-dy*5).toFixed(2) + 'deg)';
    });
  }
})();


// Inline handlers (onClick=...) and generated HTML call these on window, exactly like a classic script.
Object.assign(window, {  });
__ready.forEach((fn) => fn());
}
