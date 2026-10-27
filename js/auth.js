/* (2026-07-13) Authentication, user state & demo account switching */
let loginRole='player',currentUser=null;try{currentUser=JSON.parse(sessionStorage.getItem('paddlyDemoUser')||'null')}catch(e){currentUser=null}if(currentUser&&!['player','admin'].includes(currentUser.role))currentUser=null;if(!currentUser){document.body.classList.add('auth-required');document.getElementById('loginScreen').setAttribute('aria-hidden','false')}else{document.body.classList.remove('auth-required');document.body.classList.toggle('role-admin',currentUser.role==='admin');document.getElementById('loginScreen').setAttribute('aria-hidden','true')}// (2026-07-13) Dedicated credentials for each venue owner; was generic admin
const venueAdminAccounts={
  kapenarra:{email:'kapenarra@demo.com',password:'admin123',name:'Kapenarra Courtside',initials:'KC',role:'admin',ownerId:'kapenarra'},
  aminova:{email:'aminova@demo.com',password:'admin123',name:'Aminova Pickle Club',initials:'AC',role:'admin',ownerId:'aminova'},
  laguerta:{email:'laguerta@demo.com',password:'admin123',name:'La Guerta Sports Hub',initials:'LG',role:'admin',ownerId:'laguerta'},
  lima:{email:'lima@demo.com',password:'admin123',name:'Lima Badminton & Pickle',initials:'LB',role:'admin',ownerId:'lima'},
  servicebox:{email:'servicebox@demo.com',password:'admin123',name:'Service Box Hub',initials:'SB',role:'admin',ownerId:'servicebox'},
  tambayanan:{email:'tambayanan@demo.com',password:'admin123',name:'Tambayanan Court',initials:'TB',role:'admin',ownerId:'tambayanan'}
};
const demoAccounts={
  player:{email:'alex@demo.com',password:'play123',name:'Alex Reyes',initials:'AR',role:'player'},
  admin:{email:'admin@demo.com',password:'admin123',name:'Kapenarra Courtside',initials:'KC',role:'admin',ownerId:'kapenarra'},
  ...venueAdminAccounts
};
// (2026-07-13) Render NAV-ICONS in bottom navbar; was lucide icons only
function drawTabs(){const items=tabsForUser(),navImgTabs=new Set(['book','feed','score','split','leader']);document.getElementById('desktopTabs').innerHTML=items.map(([id,label,icon])=>`<button class="navbtn desktop-tab" id="desktopTab-${id}" data-tab="${id}" onclick="setTab('${id}')"><i data-lucide="${icon}"></i><span>${label}</span></button>`).join('');document.getElementById('mobileTabs').innerHTML=items.map(([id,label,icon])=>{const hasImg=navImgTabs.has(id);const iconHtml=hasImg?`<img src="assets/nav/tab-${id}-inactive.png" class="mobile-tab-img tab-img-inactive" alt="${label}"><img src="assets/nav/tab-${id}-active.png" class="mobile-tab-img tab-img-active" alt="${label}">`:`<i data-lucide="${icon}"></i>`;return `<button class="mobile-tab" id="mobileTab-${id}" data-tab="${id}" onclick="setTab('${id}')" aria-label="${label}"><span class="mobile-tab-icon">${iconHtml}</span><span>${label}</span></button>`;}).join('');document.getElementById('desktopRailTabs').innerHTML=items.map(([id,label,icon])=>`<button class="rail-link" id="railTab-${id}" data-tab="${id}" onclick="setTab('${id}')"><span class="rail-link-icon"><i data-lucide="${icon}"></i></span><span>${label}</span>${id==='admin'?'<span class="rail-admin-tag">ADMIN</span>':''}</button>`).join('');icons()}function updateAccountUi(){if(!currentUser)return;const u=currentUser,role=u.role==='admin'?'ADMIN DEMO':'PLAYER DEMO';['userBadge','userPopoverAvatar'].forEach(id=>{const x=document.getElementById(id);if(x)x.textContent=u.initials});document.getElementById('userDisplayName').textContent=u.name;document.getElementById('userDisplayRole').textContent=role;document.getElementById('userDisplayEmail').textContent=u.email;document.getElementById('userBadge').setAttribute('aria-label',`${u.name}, ${role}. Open account menu`);document.body.classList.toggle('role-admin',u.role==='admin')}function setLoginRole(role){loginRole=role;const isAdmin=role==='admin';document.getElementById('loginPlayerTab').classList.toggle('selected',!isAdmin);document.getElementById('loginAdminTab').classList.toggle('selected',isAdmin);document.getElementById('loginPlayerTab').setAttribute('aria-selected',String(!isAdmin));document.getElementById('loginAdminTab').setAttribute('aria-selected',String(isAdmin));document.getElementById('loginButtonText').textContent=`Sign in as ${role}`;document.getElementById('loginHeading').textContent=isAdmin?'Admin sign in':'Welcome back';document.getElementById('loginEmail').value=demoAccounts[role].email;document.getElementById('loginPassword').value=demoAccounts[role].password;document.getElementById('loginMessage').textContent='';icons()}function handleLogin(e){e.preventDefault();loginWithRole(loginRole)}// (2026-07-13) Multi-venue credential matcher & isolation; was single role
function loginWithRole(roleOrKey){
  const emailInput=document.getElementById('loginEmail').value.trim().toLowerCase();
  const passwordInput=document.getElementById('loginPassword').value;
  let account=demoAccounts[roleOrKey];
  if(!account||account.email!==emailInput||account.password!==passwordInput){
    const match=Object.values(demoAccounts).find(a=>a.email===emailInput&&a.password===passwordInput);
    if(match)account=match;
    else{
      document.getElementById('loginMessage').textContent='Invalid demo credentials. Tap a venue card below or check the sample credentials.';
      return;
    }
  }
  currentUser={...account};
  try{sessionStorage.setItem('paddlyDemoUser',JSON.stringify(currentUser))}catch(e){}
  document.body.classList.remove('auth-required');
  document.body.classList.toggle('role-admin',currentUser.role==='admin');
  document.getElementById('loginScreen').setAttribute('aria-hidden','true');
  if(currentUser.role==='admin'&&currentUser.ownerId){
    activeBookingOwner=currentUser.ownerId;
  }
  updateAccountUi();
  drawTabs();
  if(currentUser.role==='admin'){
    initAdminPortal();
    setTab('admin',true);
  }else{
    const rawH=location.hash.replace('#','');
    const route=parseBookingRoute(location.hash);
    const landing=route?'court':(['book','feed','score','split','leader','market'].includes(rawH)?rawH:'book');
    if(route){restoreBookingDraft(route);applyBookingRoute(route.ownerId,route.court)}
    setTab(landing,true);
  }
  notify(`Welcome, ${currentUser.name}`);
}
function quickDemoLogin(key){
  const acc=demoAccounts[key]||demoAccounts.admin;
  document.getElementById('loginEmail').value=acc.email;
  document.getElementById('loginPassword').value=acc.password;
  setLoginRole(acc.role);
  loginWithRole(key);
}function openLoginScreen(role='player',message=''){currentUser=null;loginRole=role;try{sessionStorage.removeItem('paddlyDemoUser')}catch(e){}document.body.classList.add('auth-required');document.body.classList.remove('role-admin');document.getElementById('loginScreen').setAttribute('aria-hidden','false');document.getElementById('userPopover').classList.remove('open');setLoginRole(role);if(message)document.getElementById('loginMessage').textContent=message;window.scrollTo(0,0)}function signOutDemo(){document.querySelectorAll('.modal-backdrop.open').forEach(x=>x.classList.remove('open'));document.body.style.overflow='';openLoginScreen('player');document.getElementById('loginMessage').textContent='You have signed out of the sample account.';try{window.history.replaceState({},'',location.pathname)}catch(e){}}function toggleLoginPassword(){const input=document.getElementById('loginPassword'),icon=document.querySelector('.show-password i');input.type=input.type==='password'?'text':'password';if(icon)icon.setAttribute('data-lucide',input.type==='password'?'eye':'eye-off');icons()}function toggleUserMenu(){const p=document.getElementById('userPopover');const on=p.classList.toggle('open');document.getElementById('userBadge').setAttribute('aria-expanded',String(on))}
// (2026-07-13) Keep booking workspace in court view; was moved to book page
function unmountBookingWorkspace(){}
// (2026-07-13) Priority overlay when ref has no records; was configured check
// Popover dismissal
document.addEventListener('click',e=>{if(!e.target.closest('.user-menu-wrap'))document.getElementById('userPopover')?.classList.remove('open')});
