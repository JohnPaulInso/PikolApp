/* (2026-07-13) Admin portal, court manager, settings modal & revenue ledger */
function adminGo(id){const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}
// (2026-07-13) Set court subtitle to Select open court below; was select an avail

// (2026-07-13) Initialize courtColors store; was undefined ReferenceError
let courtColors={};
let activeAdminSubPage='courts';
function setAdminSubPage(subId){
  activeAdminSubPage=subId;
  const tabs=['courts','overview','revenue','bookings','transactions','settings'];
  tabs.forEach(id=>{
    const btn=document.getElementById('adminTabBtn-'+id);
    const page=document.getElementById('admin-sub-'+id);
    if(btn)btn.classList.toggle('active',id===subId);
    if(page)page.classList.toggle('active',id===subId);
  });
  closeAllCourtMenus();
  if(subId==='courts')renderAdminCourts();
  else if(subId==='overview'){renderAdminLive();renderAdminAnalytics();}
  else if(subId==='revenue')renderAdminAnalytics();
  else if(subId==='bookings'){renderCourtDayBoardInit();renderAdminBookings();}
  else if(subId==='transactions')renderAdminTransactions();
  else if(subId==='settings'){
    if(typeof loadQrEditor==='function')loadQrEditor();
    if(typeof loadCourtColorEditor==='function')loadCourtColorEditor();
    if(typeof syncAnnouncement==='function')syncAnnouncement();
  }
  icons();
}
function getVenueCourtSettings(ownerId){
  const v=venueById(ownerId)||venueOwners[0];
  let stored={};
  try{stored=JSON.parse(localStorage.getItem('pikolCourtSettings_'+v.id)||'{}')}catch(e){stored={}}
  const defaults={};
  for(let c=1;c<=v.courts;c++){
    defaults[c]={
      courtNum:c,
      name:`Court ${c} · ${v.name.split(' ')[0]}`,
      status:'open',
      rate:c%2===0?700:650,
      peakRate:c%2===0?800:750,
      minHours:(courtMinimums[v.id]&&courtMinimums[v.id][c-1])||1,
      openTime:'6:00 AM',
      closeTime:'10:00 PM',
      surface:'Cushioned Acrylic',
      sideColor:(courtColors[v.id]&&courtColors[v.id].side)||'#15803d',
      nvzColor:(courtColors[v.id]&&courtColors[v.id].nvz)||'#22c55e',
      amenities:['Night LED Lighting','Covered / Roofed','Tournament Pro Net']
    };
  }
  return {...defaults,...stored};
}
function saveVenueCourtSettings(ownerId,courtNum,settings){
  const current=getVenueCourtSettings(ownerId);
  current[courtNum]={...current[courtNum],...settings};
  try{localStorage.setItem('pikolCourtSettings_'+ownerId,JSON.stringify(current))}catch(e){}
  if(courtMinimums[ownerId]){
    courtMinimums[ownerId][courtNum-1]=Number(settings.minHours)||1;
  }
  if(settings.sideColor||settings.nvzColor){
    if(!courtColors[ownerId])courtColors[ownerId]={};
    if(settings.sideColor)courtColors[ownerId].side=settings.sideColor;
    if(settings.nvzColor)courtColors[ownerId].nvz=settings.nvzColor;
    try{localStorage.setItem('pikolCourtColors_'+ownerId,JSON.stringify(courtColors[ownerId]))}catch(e){}
  }
}
function initAdminPortal(){
  if(!currentUser||currentUser.role!=='admin')return;
  const ownerId=currentUser.ownerId||'kapenarra';
  const v=venueById(ownerId);
  activeBookingOwner=v.id;
  const nameEl=document.getElementById('adminVenueName');
  const logoEl=document.getElementById('adminVenueLogo');
  const locEl=document.getElementById('adminVenueLocation');
  const countEl=document.getElementById('adminVenueCourtsCount');
  const emailEl=document.getElementById('adminVenueEmail');
  const pillEl=document.getElementById('adminCourtsPill');
  if(nameEl)nameEl.textContent=v.name;
  if(logoEl&&v.logo){logoEl.src=v.logo;logoEl.alt=v.name}
  if(locEl)locEl.textContent=v.location;
  if(countEl)countEl.textContent=`${v.courts} Courts Owned`;
  if(emailEl)emailEl.textContent=currentUser.email;
  if(pillEl)pillEl.textContent=v.courts;
  const bookOwner=document.getElementById('bookingOwnerFilter');
  if(bookOwner)bookOwner.value=v.id;
  const qrOwner=document.getElementById('qrOwnerSelect');
  if(qrOwner)qrOwner.value=v.id;
  const colorOwner=document.getElementById('courtColorOwnerSelect');
  if(colorOwner)colorOwner.value=v.id;
  const flyerOwner=document.getElementById('announcementVenue');
  if(flyerOwner)flyerOwner.value=v.id;
  const courtFilter=document.getElementById('bookingCourtFilter');
  if(courtFilter){
    courtFilter.innerHTML='<option value="all">All Courts</option>'+Array.from({length:v.courts},(_,i)=>`<option value="${i+1}">Court ${i+1}</option>`).join('');
  }
  const qrCourt=document.getElementById('qrCourtSelect');
  if(qrCourt){
    qrCourt.innerHTML=Array.from({length:v.courts},(_,i)=>`<option value="${i+1}">Court ${i+1}</option>`).join('');
  }
  const colorCourt=document.getElementById('courtColorCourtSelect');
  if(colorCourt){
    colorCourt.innerHTML=Array.from({length:v.courts},(_,i)=>`<option value="${i+1}">Court ${i+1}</option>`).join('');
  }
  setAdminSubPage(activeAdminSubPage);
  icons();
}
function renderAdminCourts(){
  const target=document.getElementById('adminCourtsGrid');
  if(!target)return;
  const ownerId=currentUser?.ownerId||activeBookingOwner||'kapenarra';
  const v=venueById(ownerId);
  const settings=getVenueCourtSettings(v.id);
  target.innerHTML=Array.from({length:v.courts},(_,i)=>{
    const courtNum=i+1;
    const c=settings[courtNum]||{courtNum,name:`Court ${courtNum}`,status:'open',rate:650,peakRate:750,minHours:1,openTime:'6:00 AM',closeTime:'10:00 PM',surface:'Cushioned Acrylic',sideColor:'#15803d',nvzColor:'#22c55e',amenities:['Night LED Lighting']};
    const statusClass=c.status==='open'?'open':(c.status==='maintenance'?'maintenance':'closed');
    const statusText=c.status==='open'?'Active / Open':(c.status==='maintenance'?'Maintenance':'Closed');
    const amenityChips=(c.amenities||[]).map(a=>`<span class="court-amenity-chip"><i data-lucide="check-circle-2"></i> ${a}</span>`).join('');
    return `<div class="court-manage-card" id="courtCard-${courtNum}">
      <div class="court-card-topbar">
        <div class="court-card-title-group">
          <span class="court-num-badge">COURT ${String(courtNum).padStart(2,'0')}</span>
          <div class="min-w-0">
            <div class="court-name-heading" title="${c.name}">${c.name}</div>
            <span class="court-status-pill ${statusClass}">${statusText}</span>
          </div>
        </div>
        <button class="court-3dot-btn" onclick="toggleCourtMenu(event,${courtNum})" aria-label="Court ${courtNum} menu">
          <i data-lucide="more-vertical"></i>
        </button>
        <div class="court-floating-menu" id="courtMenu-${courtNum}">
          <button class="court-menu-item" onclick="openCourtEditModal(${courtNum})">
            <i data-lucide="settings-2"></i> Edit all settings
          </button>
          <button class="court-menu-item" onclick="quickToggleCourtStatus(${courtNum})">
            <i data-lucide="${c.status==='open'?'wrench':'play-circle'}"></i> ${c.status==='open'?'Set maintenance':'Set active'}
          </button>
          <button class="court-menu-item" onclick="quickToggleCourtMinHours(${courtNum})">
            <i data-lucide="clock"></i> Min duration: ${c.minHours===1?'2 hrs':'1 hr'}
          </button>
          <div class="court-menu-divider"></div>
          <button class="court-menu-item" onclick="jumpToCourtQr(${courtNum})">
            <i data-lucide="qr-code"></i> Direct QR code
          </button>
          <button class="court-menu-item" onclick="jumpToCourtBookings(${courtNum})">
            <i data-lucide="calendar"></i> View court schedule
          </button>
        </div>
      </div>
      <div class="court-card-surface-strip">
        <div class="court-surface-side" style="background:${c.sideColor}"></div>
        <div class="court-surface-nvz" style="background:${c.nvzColor}"></div>
        <div class="court-surface-side" style="background:${c.sideColor}"></div>
        <div class="court-surface-label">${c.surface} · ${c.sideColor} / ${c.nvzColor}</div>
      </div>
      <div class="court-card-body">
        <div class="court-spec-row">
          <div class="court-spec-item">
            <small>STANDARD RATE</small>
            <b>₱${Number(c.rate).toLocaleString()} / hr</b>
          </div>
          <div class="court-spec-item">
            <small>PEAK RATE</small>
            <b>₱${Number(c.peakRate).toLocaleString()} / hr</b>
          </div>
          <div class="court-spec-item">
            <small>MIN DURATION</small>
            <b>${c.minHours} hour${c.minHours===1?'':'s'}</b>
          </div>
          <div class="court-spec-item">
            <small>HOURS</small>
            <b style="font-size:11.5px">${c.openTime} – ${c.closeTime}</b>
          </div>
        </div>
        <div class="court-amenities-wrap">
          ${amenityChips}
        </div>
        <div class="court-card-actions">
          <button class="court-btn-primary" onclick="openCourtEditModal(${courtNum})">
            <i data-lucide="edit-3"></i> Edit Settings
          </button>
          <button class="court-btn-secondary" onclick="quickToggleCourtStatus(${courtNum})">
            <i data-lucide="power"></i> ${c.status==='open'?'Maintenance':'Activate'}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
  icons();
}
function toggleCourtMenu(e,courtNum){
  if(e)e.stopPropagation();
  const menu=document.getElementById('courtMenu-'+courtNum);
  if(!menu)return;
  const wasOpen=menu.classList.contains('open');
  closeAllCourtMenus();
  if(!wasOpen)menu.classList.add('open');
}
function closeAllCourtMenus(){
  document.querySelectorAll('.court-floating-menu.open').forEach(el=>el.classList.remove('open'));
}
window.addEventListener('click',closeAllCourtMenus);
function openCourtEditModal(courtNum){
  closeAllCourtMenus();
  const ownerId=currentUser?.ownerId||activeBookingOwner||'kapenarra';
  const v=venueById(ownerId);
  const settings=getVenueCourtSettings(v.id);
  const c=settings[courtNum]||{courtNum,name:`Court ${courtNum}`,status:'open',rate:650,peakRate:750,minHours:1,openTime:'6:00 AM',closeTime:'10:00 PM',surface:'Cushioned Acrylic',sideColor:'#15803d',nvzColor:'#22c55e',amenities:[]};
  document.getElementById('editCourtNumber').value=courtNum;
  document.getElementById('editCourtModalTitle').textContent=`Edit Court ${courtNum} Settings`;
  document.getElementById('editCourtModalVenue').textContent=v.name;
  document.getElementById('editCourtNameInput').value=c.name;
  document.getElementById('editCourtStatusSelect').value=c.status;
  document.getElementById('editCourtMinHoursSelect').value=String(c.minHours||1);
  document.getElementById('editCourtRateInput').value=c.rate;
  document.getElementById('editCourtPeakRateInput').value=c.peakRate;
  document.getElementById('editCourtOpenTimeSelect').value=c.openTime||'6:00 AM';
  document.getElementById('editCourtCloseTimeSelect').value=c.closeTime||'10:00 PM';
  document.getElementById('editCourtSurfaceSelect').value=c.surface||'Cushioned Acrylic';
  document.getElementById('editCourtSideColorInput').value=c.sideColor||'#15803d';
  document.getElementById('editCourtSideHexInput').value=c.sideColor||'#15803d';
  document.getElementById('editCourtNvzColorInput').value=c.nvzColor||'#22c55e';
  document.getElementById('editCourtNvzHexInput').value=c.nvzColor||'#22c55e';
  const amenities=c.amenities||[];
  document.getElementById('editAmenityLighting').checked=amenities.some(a=>a.includes('Lighting'));
  document.getElementById('editAmenityCovered').checked=amenities.some(a=>a.includes('Covered')||a.includes('Roofed'));
  document.getElementById('editAmenityNet').checked=amenities.some(a=>a.includes('Net'));
  document.getElementById('editAmenityScoreboard').checked=amenities.some(a=>a.includes('Scoreboard'));
  showModal('courtEditModal');
}
function saveCourtSettingsModal(e){
  e.preventDefault();
  const courtNum=Number(document.getElementById('editCourtNumber').value)||1;
  const ownerId=currentUser?.ownerId||activeBookingOwner||'kapenarra';
  const amenities=[];
  if(document.getElementById('editAmenityLighting').checked)amenities.push('Night LED Lighting');
  if(document.getElementById('editAmenityCovered').checked)amenities.push('Covered / Roofed');
  if(document.getElementById('editAmenityNet').checked)amenities.push('Tournament Pro Net');
  if(document.getElementById('editAmenityScoreboard').checked)amenities.push('Electronic Scoreboard');
  const settings={
    courtNum,
    name:document.getElementById('editCourtNameInput').value.trim()||`Court ${courtNum}`,
    status:document.getElementById('editCourtStatusSelect').value,
    minHours:Number(document.getElementById('editCourtMinHoursSelect').value)||1,
    rate:Number(document.getElementById('editCourtRateInput').value)||650,
    peakRate:Number(document.getElementById('editCourtPeakRateInput').value)||750,
    openTime:document.getElementById('editCourtOpenTimeSelect').value,
    closeTime:document.getElementById('editCourtCloseTimeSelect').value,
    surface:document.getElementById('editCourtSurfaceSelect').value,
    sideColor:document.getElementById('editCourtSideColorInput').value,
    nvzColor:document.getElementById('editCourtNvzColorInput').value,
    amenities
  };
  saveVenueCourtSettings(ownerId,courtNum,settings);
  closeModal('courtEditModal');
  renderAdminCourts();
  renderSchedule();
  notify(`Court ${courtNum} settings saved successfully!`);
}
function quickToggleCourtStatus(courtNum){
  closeAllCourtMenus();
  const ownerId=currentUser?.ownerId||activeBookingOwner||'kapenarra';
  const current=getVenueCourtSettings(ownerId)[courtNum];
  const newStatus=current.status==='open'?'maintenance':'open';
  saveVenueCourtSettings(ownerId,courtNum,{status:newStatus});
  renderAdminCourts();
  notify(`Court ${courtNum} set to ${newStatus==='open'?'Active / Open':'Maintenance'}`);
}
function quickToggleCourtMinHours(courtNum){
  closeAllCourtMenus();
  const ownerId=currentUser?.ownerId||activeBookingOwner||'kapenarra';
  const current=getVenueCourtSettings(ownerId)[courtNum];
  const newMin=current.minHours===1?2:1;
  saveVenueCourtSettings(ownerId,courtNum,{minHours:newMin});
  renderAdminCourts();
  renderSchedule();
  notify(`Court ${courtNum} minimum duration set to ${newMin} hour${newMin===1?'':'s'}`);
}
function jumpToCourtQr(courtNum){
  closeAllCourtMenus();
  setAdminSubPage('settings');
  const sel=document.getElementById('qrCourtSelect');
  if(sel){sel.value=String(courtNum);if(typeof loadQrEditor==='function')loadQrEditor()}
}
function jumpToCourtBookings(courtNum){
  closeAllCourtMenus();
  setAdminSubPage('bookings');
  const sel=document.getElementById('bookingCourtFilter');
  if(sel){sel.value=String(courtNum);renderCourtDayBoard()}
}
function renderAdminAnalytics(){const fromValue=document.getElementById('revenueFrom').value,toValue=document.getElementById('revenueTo').value;if(!fromValue||!toValue)return;const from=new Date(fromValue+'T12:00:00'),to=new Date(toValue+'T12:00:00');if(to<from){notify('End date must be on or after the start date');return}const days=Math.max(1,Math.round((to-from)/86400000)+1);const points=[];let total=0,bookings=0;for(let i=0;i<days;i++){const d=new Date(from);d.setDate(from.getDate()+i);const seed=(d.getDate()*173+d.getMonth()*317+d.getFullYear())%1900;const value=3500+seed+(d.getDay()===0||d.getDay()===6?1300:0);total+=value;bookings+=Math.max(3,Math.round(value/720));points.push({d,value})}const sampled=points.filter((_,i)=>i%Math.max(1,Math.ceil(points.length/24))===0);if(sampled[sampled.length-1]!==points[points.length-1])sampled.push(points[points.length-1]);const min=Math.min(...sampled.map(p=>p.value)),max=Math.max(...sampled.map(p=>p.value)),coords=sampled.map((p,i)=>({x:18+(i*(564/Math.max(1,sampled.length-1))),y:190-((p.value-min)/(max-min||1))*150}));const line=coords.map((p,i)=>`${i?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');document.getElementById('revenueLineChart').innerHTML=`<defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#10b981" stop-opacity=".24"/><stop offset="1" stop-color="#10b981" stop-opacity="0"/></linearGradient></defs><path d="${line} L582,205 L18,205 Z" fill="url(#revenueFill)"/><path d="${line}" fill="none" stroke="#059669" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${coords.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4" fill="#fff" stroke="#059669" stroke-width="3"/>`).join('')}`;const paid=Math.round(total*.82),pending=total-paid;document.getElementById('revenueTotal').textContent=`₱${total.toLocaleString()}`;document.getElementById('adminTopRevenue').textContent=`₱${total.toLocaleString()}`;document.getElementById('adminTopRevenueSub').textContent=`${days} day${days===1?'':'s'} · selected period`;document.getElementById('revenueBookings').textContent=bookings;document.getElementById('adminTopBookings').textContent=bookings;document.getElementById('revenueAverage').textContent=`₱${Math.round(total/days).toLocaleString()}`;document.getElementById('revenuePeriod').textContent=`${from.toLocaleDateString('en',{month:'short',day:'numeric'})} – ${to.toLocaleDateString('en',{month:'short',day:'numeric'})}`;document.getElementById('paidAmount').textContent=`₱${paid.toLocaleString()}`;document.getElementById('pendingAmount').textContent=`₱${pending.toLocaleString()}`;document.getElementById('paidPercent').textContent='82%';document.getElementById('revenueDonut').style.setProperty('--paid-deg','82%');document.getElementById('revenueStartLabel').textContent=points[0].d.toLocaleDateString('en',{month:'short',day:'numeric'});document.getElementById('revenueMidLabel').textContent=points[Math.floor((days-1)/2)].d.toLocaleDateString('en',{month:'short',day:'numeric'});document.getElementById('revenueEndLabel').textContent=points[days-1].d.toLocaleDateString('en',{month:'short',day:'numeric'})}function reservationDate(offset){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+offset);return localIso(d)}// (2026-07-13) Scope live court rows to owner & court settings; was global
function renderAdminLive(){
  const ownerId=currentUser?.ownerId||activeBookingOwner||'kapenarra';
  const owner=venueById(ownerId);
  const target=document.getElementById('liveCourtRows');
  if(!target)return;
  const settings=getVenueCourtSettings(owner.id);
  target.innerHTML=Array.from({length:owner.courts},(_,i)=>{
    const court=i+1,r=demoReservations.find(x=>(x.owner===owner.id||(owner.id==='kapenarra'&&x.owner==='kitchen'))&&x.court===court&&x.dateOffset===0);
    const cSettings=settings[court]||{};
    const isMaint=cSettings.status==='maintenance';
    return `<div class="live-court-detail"><span class="admin-court">${String(court).padStart(2,'0')}</span><div class="live-court-copy"><b>${cSettings.name||`${owner.name} · Court ${court}`}</b><small>${isMaint?'Under Maintenance · Closed for play':(r?`${r.start}–${r.end} · ${r.id} · ${r.bookedBy}`:'No reservation now · Open for play')}</small><small>${isMaint?'Scheduled maintenance':(r?r.players:`Rate · ₱${cSettings.rate||650}/hr · ${cSettings.surface||'Acrylic'}`)}</small></div><div class="live-court-side"><span class="${isMaint?'admin-booked':(r?.status==='LIVE'?'admin-live':r?'admin-booked':'admin-free')}">${isMaint?'MAINTENANCE':(r?.status||'AVAILABLE')}</span><b>${isMaint?'—':(r?`₱${r.amount.toLocaleString()}`:`₱${cSettings.rate||650}`)}</b></div></div>`;
  }).join('');
}// (2026-07-13) Filter booking ledger exclusively to owner facility; was all
function renderAdminBookings(){
  const target=document.getElementById('adminBookingRows');
  if(!target)return;
  const ownerId=currentUser?.ownerId||activeBookingOwner||'kapenarra';
  const courtFilterVal=document.getElementById('bookingCourtFilter')?.value||'all';
  const venueReservations=demoReservations.filter(r=>(r.owner===ownerId||(ownerId==='kapenarra'&&r.owner==='kitchen'))&&(courtFilterVal==='all'||String(r.court)===String(courtFilterVal)));
  target.innerHTML=venueReservations.map(r=>{
    const owner=venueById(r.owner),date=reservationDate(r.dateOffset);
    return `<tr><td><b>${new Date(date+'T12:00:00').toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}</b><small>${r.id}</small></td><td><b>Court ${r.court}</b></td><td><b>${r.start}</b><small>– ${r.end}</small></td><td><b>${r.bookedBy}</b><small>${r.players}</small></td><td><span class="booking-status status-${r.status.toLowerCase()}">${r.status}</span></td><td class="text-right font-bold">₱${r.amount.toLocaleString()}</td><td><button class="booking-detail-button" onclick="showBookingDetail('${r.id}')">View</button></td></tr>`;
  }).join('');
  renderCourtDayBoardInit();
}// (2026-07-13) Filter transactions exclusively to owned facility; was global
function renderAdminTransactions(){
  const rows=document.getElementById('adminTransactionRows');
  if(!rows)return;
  const ownerId=currentUser?.ownerId||activeBookingOwner||'kapenarra';
  const venueReservations=demoReservations.filter(r=>r.owner===ownerId||(ownerId==='kapenarra'&&r.owner==='kitchen'));
  const total=venueReservations.reduce((n,r)=>n+Number(r.amount||0),0);
  const paid=venueReservations.filter(r=>['PAID','CONFIRMED'].includes(r.status)).length;
  const summary=document.getElementById('transactionSummary');
  if(summary)summary.innerHTML=`<div><small>VENUE BOOKINGS</small><b>${venueReservations.length}</b></div><div><small>PAID / CONFIRMED</small><b>${paid}</b></div><div><small>BOOKED VALUE</small><b>₱${total.toLocaleString()}</b></div>`;
  rows.innerHTML=venueReservations.map(r=>{
    const owner=venueById(r.owner),date=reservationDate(r.dateOffset),d=new Date(date+'T12:00:00').toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
    return `<tr><td><b>${d}</b><small>${r.id}</small></td><td><b>${owner.name}</b><small>${owner.location}</small></td><td><b>Court ${r.court}</b><small>${r.start} – ${r.end}</small></td><td><b>${r.bookedBy}</b><small>${r.players}</small></td><td><b>Booking payment</b><small>Demo transaction · ${r.status==='PAID'?'Paid':'On file'}</small></td><td><span class="booking-status status-${r.status.toLowerCase()}">${r.status}</span></td><td class="text-right font-bold">₱${Number(r.amount).toLocaleString()}</td><td><button class="booking-detail-button" onclick="showBookingDetail('${r.id}')">Details</button></td></tr>`;
  }).join('');
  icons();
}function toggleStatus(el){const t=el.lastElementChild,on=t.textContent==='OFF';t.textContent=on?'ON':'OFF';t.className=on?'text-emerald-700 font-bold':'text-slate-400 font-bold';notify(`${el.firstElementChild.textContent} ${on?'enabled':'disabled'}`)}
const people=[['Ana C.','Paid via GCash','AC',true],['Carlo R.','Unpaid','CR',false],['Mia S.','Paid via GCash','MS',true],['You','Unpaid','JM',false]];function renderMembers(){document.getElementById('members').innerHTML=people.map((p,i)=>`<div class="py-3 flex items-center justify-between gap-3"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 grid place-items-center text-xs font-bold">${p[2]}</div><div><div class="font-bold text-sm">${p[0]}</div><div class="text-xs ${p[3]?'text-emerald-700':'text-amber-700'}">${p[1]}</div></div></div><div class="flex items-center gap-3"><b class="text-sm">₱187.50</b>${p[3]?'<i data-lucide="circle-check" class="w-4 h-4 text-emerald-600"></i>':`<button class="text-xs font-bold text-emerald-700" onclick="markPaid(${i})">Request</button>`}</div></div>`).join('');icons()}function markPaid(i){people[i][1]='Request sent';people[i][3]=true;renderMembers();notify('Payment request sent · demo')};function addMember(){const n=promptSafeName();if(!n)return;people.push([n,'Unpaid',n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(),false]);renderMembers();notify('Player added')};function promptSafeName(){// Custom inline name entry, no native prompt.
const name=window.memberName;if(name){window.memberName='';return name}showNameModal();return ''}
function showNameModal(){const id='nameModal';if(document.getElementById(id))return;const d=document.createElement('div');d.id=id;d.className='modal-backdrop open';d.innerHTML='<div class="modal"><h2 class="font-extrabold text-xl">Add a player</h2><p class="text-sm text-slate-500 mt-1">Enter their name to add them to this split.</p><input id="newName" class="w-full mt-4 rounded-xl border border-slate-200 px-3 py-3" placeholder="Player name"><div class="flex gap-2 mt-4"><button class="flex-1 py-3 rounded-xl bg-slate-100 font-bold" onclick="document.getElementById(\'nameModal\').remove()">Cancel</button><button class="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold" onclick="saveName()">Add player</button></div></div>';document.body.appendChild(d);document.body.style.overflow='hidden';setTimeout(()=>document.getElementById('newName').focus(),50)}function saveName(){const n=document.getElementById('newName').value.trim();if(!n)return;document.getElementById('nameModal').remove();document.body.style.overflow='';people.push([n,'Unpaid',n.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(),false]);renderMembers();notify('Player added')}
// (2026-07-13) Rebrand leaderboard & split venue to Pikol; was Paddly
