/* (2026-07-13) Referee scoreboard, match onboarding & audio/confetti */
// (2026-07-13) Map demo reservations to 6 Bogo venues; was kitchen/nhp
let a=0,b=0,servingTeam='A',serverNumber=1,gameNo=1,history=[],gameScores=[[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]],availableGames=3,gameTarget=11,stacked={A:false,B:false},timeoutLeft={A:2,B:2},warnings=0,matchSeconds=0,gameSeconds=0,lastCall='Match ready · Team 1 serving · first server.';const playersByTeam={A:['Player 1','Player 2'],B:['Player 3','Player 4']};let teamNames={A:'Team 1',B:'Team 2'};const courtColorPresets={emerald:{name:'Emerald Classic',side:'#166534',nvz:'#22c55e'},pacific:{name:'Pacific Blue',side:'#1e40af',nvz:'#38bdf8'},terracotta:{name:'Clay Terracotta',side:'#9a3412',nvz:'#fb923c'},slate:{name:'Charcoal Slate',side:'#334155',nvz:'#64748b'},plum:{name:'Royal Plum',side:'#6b21a8',nvz:'#c084fc'}};let currentCourtColorKey='emerald';let currentMatchCourt='Court 2',playForServePending=false;const gameConfigs=Array.from({length:7},()=>({teamNames:{A:'Team 1',B:'Team 2'},players:{A:['Player 1','Player 2'],B:['Player 3','Player 4']},colors:{A:'#059669',B:'#e11d48'},courtColor:'emerald',firstServe:'A',startMode:'serve',target:11,venue:'kapenarra',court:'Court 2',runtime:{servingTeam:'A',serverNumber:1,playForServePending:false}}));let scoreSoundEnabled=(()=>{try{return localStorage.getItem('pikol-score-sound')!=='off'}catch(e){return true}})(),scoreAudioContext=null;const matchLogs=[[],[],[],[],[],[],[]];const demoReservations=[{id:'K-1042',owner:'kapenarra',court:1,start:'1:00 PM',end:'3:00 PM',dateOffset:0,bookedBy:'Ana C.',players:'Ana C. · Carlo R. · Mia S. · Paolo D.',status:'LIVE',amount:1500,transactions:[{time:'Today · 12:42 PM',type:'Court booking payment',method:'GCash',ref:'GC-1042-01',amount:750,status:'PAID'},{time:'Today · 12:44 PM',type:'Guest add-on',method:'GCash',ref:'GC-1042-02',amount:750,status:'PAID'}]},{id:'K-1048',owner:'kapenarra',court:2,start:'2:00 PM',end:'4:00 PM',dateOffset:0,bookedBy:'Joey M.',players:'Joey M. · 3 guests',status:'CONFIRMED',amount:1300},{id:'A-0308',owner:'aminova',court:1,start:'6:00 PM',end:'8:00 PM',dateOffset:0,bookedBy:'Mia S.',players:'Mia S. · Sarah L. · Carlo M. · Jeric T.',status:'PAID',amount:1400},{id:'L-0402',owner:'laguerta',court:2,start:'5:00 PM',end:'7:00 PM',dateOffset:0,bookedBy:'Paolo D.',players:'Paolo D. · Ben T. · Bea S. · Dan P.',status:'PAID',amount:1200},{id:'S-0501',owner:'servicebox',court:1,start:'4:00 PM',end:'6:00 PM',dateOffset:0,bookedBy:'Mikaela S.',players:'Mikaela S. · Alex R. · Marco D. · Lara P.',status:'CONFIRMED',amount:1600},{id:'T-0602',owner:'tambayanan',court:1,start:'7:00 PM',end:'9:00 PM',dateOffset:0,bookedBy:'Gino R.',players:'Gino R. · Joey M. · Carlo R. · Ana C.',status:'PAID',amount:1000}];function teamName(team){return teamNames[team]||`Team ${team}`}function getGameConfig(n=gameNo){return gameConfigs[n-1]||(gameConfigs[n-1]={teamNames:{...teamNames},players:{A:[...playersByTeam.A],B:[...playersByTeam.B]},colors:{A:'#059669',B:'#e11d48'},courtColor:'emerald',firstServe:'A',startMode:'serve',target:gameTarget,venue:currentMatchVenue,court:currentMatchCourt,runtime:{servingTeam:'A',serverNumber:1,playForServePending:false}})}function scoreSnapshot(){return {a,b,servingTeam,serverNumber,gameNo,lastCall,playForServePending,logCount:matchLogs[gameNo-1].length}}function restoreScore(x){({a,b,servingTeam,serverNumber,gameNo,lastCall}=x);playForServePending=!!x.playForServePending;matchLogs[gameNo-1].length=x.logCount;gameScores[gameNo-1]=[a,b];getGameConfig().runtime={servingTeam,serverNumber,playForServePending};syncRef()}// (2026-07-13) SVG icon for audio toggle; was textContent breaking layout
function updateScoreSoundButton(){const b=document.getElementById('scoreSoundToggle');if(!b)return;b.innerHTML=scoreSoundEnabled?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';b.setAttribute('aria-pressed',String(scoreSoundEnabled));b.setAttribute('aria-label',`Turn scoring sound effects ${scoreSoundEnabled?'off':'on'}`);b.setAttribute('title',scoreSoundEnabled?'Sound on (tap to mute)':'Sound muted (tap to enable)')}function toggleScoreSound(){scoreSoundEnabled=!scoreSoundEnabled;try{localStorage.setItem('pikol-score-sound',scoreSoundEnabled?'on':'off')}catch(e){}updateScoreSoundButton();notify(`Scoring sounds ${scoreSoundEnabled?'on':'off'}`)}function playScoreSound(kind='point'){if(!scoreSoundEnabled)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!scoreAudioContext)scoreAudioContext=new AC();if(scoreAudioContext.state==='suspended')scoreAudioContext.resume();const ctx=scoreAudioContext,now=ctx.currentTime,notes=kind==='point'?[660,880]:kind==='playforserve'?[523,784]:[440,554];notes.forEach((hz,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),start=now+i*.075;osc.type='sine';osc.frequency.setValueAtTime(hz,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.055,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+.13);osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.15)})}catch(e){}}function currentServer(){return playersByTeam[servingTeam][serverNumber-1]}function currentReceiver(){return playersByTeam[servingTeam==='A'?'B':'A'][0]}// (2026-07-13) Guard missing DOM elements in syncRef; was direct null access
function syncRef(){const el=id=>document.getElementById(id)||{style:{setProperty(){}},classList:{toggle(){},add(){},remove(){}},dataset:{},setAttribute(){}};const cfg=getGameConfig(),ca=cfg.colors.A,cb=cfg.colors.B,na=teamName('A'),nb=teamName('B');document.documentElement.style.setProperty('--team-a-color',ca);document.documentElement.style.setProperty('--team-b-color',cb);applyCourtColors(currentMatchVenue,Number(String(currentMatchCourt).replace(/\D+/g,''))||1);el('scoreA').textContent=a;el('scoreB').textContent=b;el('scoreA').style.color=(!playForServePending&&servingTeam==='A')?'#b8efcf':'#e8f0eb';el('scoreB').style.color=(!playForServePending&&servingTeam==='B')?'#f2c4c8':'#e8f0eb';el('scoreA').classList.toggle('serving-score',servingTeam==='A'&&!playForServePending);el('scoreB').classList.toggle('serving-score',servingTeam==='B'&&!playForServePending);el('serverNumberScore').textContent=playForServePending?'—':serverNumber;el('serverNumberText').textContent=playForServePending?'—':serverNumber;el('serverName').textContent=playForServePending?'Awaiting rally':currentServer();el('receiverName').textContent=playForServePending?'Play for serve':currentReceiver();el('playerAna').textContent=playersByTeam.A[0];el('playerBea').textContent=playersByTeam.A[1];el('playerCarlo').textContent=playersByTeam.B[0];el('playerDan').textContent=playersByTeam.B[1];el('teamNameLabelA').textContent=na.toUpperCase();el('teamNameLabelB').textContent=nb.toUpperCase();el('rallyTeamNameA').textContent=na;el('rallyTeamNameB').textContent=nb;el('courtTeamNameA').textContent=na;el('courtTeamNameB').textContent=nb;el('serverTeam').textContent=playForServePending?'PLAY FOR SERVE · RALLY WINNER EARNS FIRST SERVE':`${teamName(servingTeam)} serving`;el('refLiveCourt').textContent=currentMatchCourt.toUpperCase();const matchNow=new Date();el('refCourtMeta').textContent=`${venueById(currentMatchVenue).name.toUpperCase()} · ${currentMatchCourt.toUpperCase()} · ${weekDays[matchNow.getDay()]} ${String(matchNow.getDate()).padStart(2,'0')} ${monthNames[matchNow.getMonth()]} · ${matchNow.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`;// (2026-07-13) Simplify ref button text; was wordy repetitive labels
el('rallyStateA').textContent=playForServePending?'PLAY FOR SERVE':servingTeam==='A'?'CAN SCORE +1':serverNumber===1?'2ND SERVER NEXT':'SIDE OUT NEXT';el('rallyStateB').textContent=playForServePending?'PLAY FOR SERVE':servingTeam==='B'?'CAN SCORE +1':serverNumber===1?'2ND SERVER NEXT':'SIDE OUT NEXT';// (2026-07-13) Concise serving badges to prevent card clipping; was verbose
el('teamRoleA').textContent=playForServePending?'PLAY':servingTeam==='A'?'SERVING':'RECEIVING';el('teamRoleB').textContent=playForServePending?'PLAY':servingTeam==='B'?'SERVING':'RECEIVING';el('serveOrderA').textContent=servingTeam==='A'&&!playForServePending?serverNumber:'—';el('serveOrderB').textContent=servingTeam==='B'&&!playForServePending?serverNumber:'—';/* (2026-07-13) Keep story subtitle white & fixed; was game score */el('shareAllGamesSubtitle').textContent=`Games 1–${availableGames} · one score per game`;el('refCall').textContent=lastCall;el('refRuleText').textContent=playForServePending?'Play for serve: the first rally winner earns the first serve; the rally does not score.':'Tap the rally winner. A serving-team win scores +1; the receiving team advances its server or takes the side out.';document.querySelector('.ref-bigscore').setAttribute('aria-label',`${na} score ${a}, ${nb} score ${b}, ${playForServePending?'play for serve':`server ${serverNumber}`}`);el('voiceLog').textContent=playForServePending?'Play for serve. First rally winner earns the serve.':`${a}–${b}–${serverNumber}. ${teamName(servingTeam)} serving. ${currentServer()} to serve.`;el('courtPosition').textContent=playForServePending?'Waiting for first serve':(servingTeam==='A'?a:b)%2===0?'Right court · #'+serverNumber:'Left court · #'+serverNumber;el('receiverPosition').textContent=playForServePending?'Waiting for first serve':(servingTeam==='A'?a:b)%2===0?'Right court':'Left court';el('teamActionA').textContent=playForServePending?'WIN · EARN FIRST SERVE':servingTeam==='A'?'SERVING · WIN = SCORE +1':serverNumber===1?'RECEIVING · NO POINT · 2ND SERVER':'RECEIVING · NO POINT · SIDE OUT';el('teamActionB').textContent=playForServePending?'WIN · EARN FIRST SERVE':servingTeam==='B'?'SERVING · WIN = SCORE +1':serverNumber===1?'RECEIVING · NO POINT · 2ND SERVER':'RECEIVING · NO POINT · SIDE OUT';el('rallyBtnA').style.setProperty('background',ca,'important');el('rallyBtnB').style.setProperty('background',cb,'important');/* dynamic shadow in css */el('rallyBtnA').style.color=contrastForColor(ca);el('rallyBtnB').style.color=contrastForColor(cb);el('rallyBtnA').classList.toggle('serving-side',servingTeam==='A'&&!playForServePending);el('rallyBtnB').classList.toggle('serving-side',servingTeam==='B'&&!playForServePending);el('rallyBtnA').classList.toggle('can-score',servingTeam==='A'&&!playForServePending);el('rallyBtnB').classList.toggle('can-score',servingTeam==='B'&&!playForServePending);el('rallyBtnA').classList.toggle('play-for-serve-choice',playForServePending);el('rallyBtnB').classList.toggle('play-for-serve-choice',playForServePending);['playerAna','playerBea'].forEach(id=>document.getElementById(id).style.backgroundColor=ca);['playerCarlo','playerDan'].forEach(id=>document.getElementById(id).style.backgroundColor=cb);el('playerAna').classList.toggle('is-serving',servingTeam==='A'&&serverNumber===1&&!playForServePending);el('playerBea').classList.toggle('is-serving',servingTeam==='A'&&serverNumber===2&&!playForServePending);el('playerCarlo').classList.toggle('is-serving',servingTeam==='B'&&serverNumber===1&&!playForServePending);el('playerDan').classList.toggle('is-serving',servingTeam==='B'&&serverNumber===2&&!playForServePending);el('gameTitle').textContent=`GAME ${gameNo}`;el('setupGameNo').textContent=gameNo;el('saveSetupGameNo').textContent=gameNo;for(let i=1;i<=3;i++){const g=el('gameBtn'+i);if(g)g.classList.toggle('game-current',i===gameNo)}el('stackA').textContent=stacked.A?'Stacked':'Stack';el('stackB').textContent=stacked.B?'Stacked':'Stack';el('stackA').classList.toggle('is-stacked',stacked.A);el('stackB').classList.toggle('is-stacked',stacked.B);el('warningCount').textContent=warnings;el('timeoutA').textContent=`${timeoutLeft.A} left · ${na}`;el('timeoutB').textContent=`${timeoutLeft.B} left · ${nb}`;el('undoDescription').textContent=history.length?'Last rally':'No rally yet';if(typeof updateUndoRedo==='function')updateUndoRedo();document.querySelectorAll('.team-setup-a').forEach(x=>x.style.borderLeft=`4px solid ${ca}`);document.querySelectorAll('.team-setup-b').forEach(x=>x.style.borderLeft=`4px solid ${cb}`);const swA=document.querySelector('.ref-person .blue-swatch'),swB=document.querySelector('.ref-person .red-swatch');if(swA)swA.style.backgroundColor=ca;if(swB)swB.style.backgroundColor=cb;updateScoreSoundButton();if(document.getElementById('matchStoryGraphic'))renderMatchStory();renderInlineMatchLog()}function contrastForColor(hex){const h=String(hex||'#000000').replace('#','');if(h.length!==6)return '#ffffff';const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return (r*299+g*587+b*114)/1000>150?'#10231a':'#ffffff'}function rallyWinnerCore(team){history.push(scoreSnapshot());const winner=teamName(team);let sound='serve';if(playForServePending){servingTeam=team;serverNumber=1;playForServePending=false;lastCall=`Play for serve · ${winner} won the serve. No point awarded.`;sound='playforserve'}else if(team===servingTeam){if(team==='A')a++;else b++;lastCall=`Rally to ${winner}. Point. Call ${a}-${b}-${serverNumber}.`;sound='point'}else if(serverNumber===1){serverNumber=2;lastCall=`Rally to ${winner}. No point. ${teamName(servingTeam)} second server.`}else{servingTeam=team;serverNumber=1;lastCall=`Rally to ${winner}. No point. Side out · ${winner} now serving.`}getGameConfig().runtime={servingTeam,serverNumber,playForServePending};gameScores[gameNo-1]=[a,b];matchLogs[gameNo-1].push({n:matchLogs[gameNo-1].length+1,team,winner,call:lastCall,score:`${a}–${b}–${playForServePending?'—':serverNumber}`,server:currentServer(),players:playersByTeam[team].join(' · '),court:currentMatchCourt});playScoreSound(sound);syncRef();notify(lastCall);const score=team==='A'?a:b;if(team===servingTeam&&!playForServePending&&score>=gameTarget&&score-(team==='A'?b:a)>=2){notify(`${winner} wins Game ${gameNo}`);triggerGameWonCelebration(team,winner,a,b);}}function refPoint(team){rallyWinner(team)}function addPoint(){rallyWinner(servingTeam)}let redoStack=[];function updateUndoRedo(){const u=document.getElementById('undoDescription'),r=document.getElementById('redoDescription'),b=document.getElementById('redoButton');if(u)u.textContent=history.length?'Last rally':'No action to undo';if(r)r.textContent=redoStack.length?'Restore next action':'No action to redo';if(b)b.disabled=!redoStack.length}function undoPoint(){if(!history.length){notify('Nothing to undo yet');return}redoStack.push(scoreSnapshot());restoreScore(history.pop());updateUndoRedo();notify('Last rally undone')}function redoPoint(){if(!redoStack.length){notify('Nothing to redo yet');return}history.push(scoreSnapshot());restoreScore(redoStack.pop());updateUndoRedo();notify('Action restored')}function rallyWinner(team){redoStack=[];rallyWinnerCore(team);updateUndoRedo()}function manualScoreStep(team,delta){history.push(scoreSnapshot());if(team==='A')a=Math.max(0,a+delta);else b=Math.max(0,b+delta);lastCall='Manual score adjustment.';gameScores[gameNo-1]=[a,b];syncRef()}// (2026-07-13) Set winning target in score editor; was missing target control
let editServingTeam='A',editServerNumber=1;function setEditTargetScore(pts){const el=document.getElementById('editTargetScore');if(el)el.value=pts}function openScoreEditor(){editServingTeam=servingTeam;editServerNumber=serverNumber;document.getElementById('editScoreA').value=a;document.getElementById('editScoreB').value=b;const targetEl=document.getElementById('editTargetScore');if(targetEl)targetEl.value=gameTarget||11;document.getElementById('manualServerTeam').textContent=teamName(editServingTeam);document.getElementById('manualServerNumber').textContent=editServerNumber;showModal('scoreEditModal')}function toggleManualServer(){editServingTeam=editServingTeam==='A'?'B':'A';document.getElementById('manualServerTeam').textContent=teamName(editServingTeam)}function toggleManualServerNumber(){editServerNumber=editServerNumber===1?2:1;document.getElementById('manualServerNumber').textContent=editServerNumber}function saveManualScore(){const na=Number(document.getElementById('editScoreA').value),nb=Number(document.getElementById('editScoreB').value);if(!Number.isInteger(na)||!Number.isInteger(nb)||na<0||nb<0||na>99||nb>99){notify('Enter scores from 0 to 99');return}const targetVal=Number(document.getElementById('editTargetScore')?.value);if(Number.isInteger(targetVal)&&targetVal>=1&&targetVal<=99){gameTarget=targetVal;getGameConfig().target=gameTarget;const gtInput=document.getElementById('gameTargetInput');if(gtInput)gtInput.value=gameTarget}history.push(scoreSnapshot());a=na;b=nb;servingTeam=editServingTeam;serverNumber=editServerNumber;lastCall='Score manually edited.';gameScores[gameNo-1]=[a,b];matchLogs[gameNo-1].push({n:matchLogs[gameNo-1].length+1,team:servingTeam,winner:'Referee correction',call:lastCall,score:`${a}–${b}–${serverNumber}`,server:currentServer(),players:[...playersByTeam.A,...playersByTeam.B].join(' · '),court:currentMatchCourt});syncRef();closeModal('scoreEditModal');notify('Score and serve saved');
  const maxScore = Math.max(a, b);
  const minScore = Math.min(a, b);
  if (maxScore >= gameTarget && (maxScore - minScore) >= 2) {
    const winTeam = a > b ? 'A' : 'B';
    triggerGameWonCelebration(winTeam, teamName(winTeam), a, b);
  }
}
// (2026-07-13) Fix saveManualScore closing & remove dupes; was syntax error
// (2026-07-13) Guard clock elements in timer; was throwing on null gameClock
function startMatchClock(){setInterval(()=>{matchSeconds++;gameSeconds++;const fmt=n=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');const mc=document.getElementById('matchClock');if(mc)mc.textContent=fmt(matchSeconds);const gc=document.getElementById('gameClock');if(gc)gc.textContent=fmt(gameSeconds)},1000)}
function setGame(n){if(n<1||n>availableGames)return;getGameConfig().runtime={servingTeam,serverNumber,playForServePending};gameScores[gameNo-1]=[a,b];gameNo=n;const cfg=getGameConfig(n);teamNames={...cfg.teamNames};playersByTeam.A=[...cfg.players.A];playersByTeam.B=[...cfg.players.B];currentMatchVenue=cfg.venue||'kitchen';currentMatchCourt=cfg.court||'Court 1';gameTarget=cfg.target||11;({servingTeam='A',serverNumber=1,playForServePending=false}=cfg.runtime||{});[a,b]=gameScores[n-1]||[0,0];history=[];gameSeconds=0;lastCall=playForServePending?`Game ${n} ready · Play for serve.`:`Game ${n} ready · ${teamName(servingTeam)} serves first.`;renderGameControls();syncRef();renderMatchStory();notify(`Game ${n} selected · ${teamName(servingTeam)}${playForServePending?' · Play for serve':''}`)}function clearStack(team){stacked[team]=false;syncRef();notify(`${teamName(team)} stack cleared`)}function toggleStack(team){stacked[team]=!stacked[team];syncRef();notify(`${teamName(team)} ${stacked[team]?'stack enabled':'stack cleared'}`)}function useTimeout(team){if(timeoutLeft[team]<=0){notify('No timeouts left for this team');return}timeoutLeft[team]--;syncRef();notify(`${teamName(team)} timeout · ${timeoutLeft[team]} left`)}function addWarning(){warnings++;syncRef();notify(`Conduct warning ${warnings} logged`)}function switchServer(){if(playForServePending){notify('Use a rally button to award the first serve');return}if(serverNumber===1){serverNumber=2;lastCall='Manual serve change · second server.'}else{servingTeam=servingTeam==='A'?'B':'A';serverNumber=1;lastCall='Manual side out · new serving team.'}getGameConfig().runtime={servingTeam,serverNumber,playForServePending};playScoreSound('serve');syncRef();notify(lastCall)}function openRefSettings(){const select=document.getElementById('matchVenueSelect');select.innerHTML=venueOwners.map(o=>`<option value="${o.id}">${o.name} · ${o.courts} courts</option>`).join('');select.value=currentMatchVenue;renderMatchCourtChoices();const cfg=getGameConfig();document.getElementById('teamNameA').value=cfg.teamNames.A;document.getElementById('teamNameB').value=cfg.teamNames.B;document.getElementById('teamColorA').value=cfg.colors.A;document.getElementById('teamColorB').value=cfg.colors.B;['rosterA1','rosterA2','rosterB1','rosterB2'].forEach((id,i)=>document.getElementById(id).value=i<2?cfg.players.A[i]:cfg.players.B[i-2]);document.getElementById('gameTargetInput').value=cfg.target||gameTarget;document.getElementById('serveStartMode').value=cfg.startMode||'serve';document.getElementById('firstServeTeam').value=cfg.firstServe||'A';toggleServeModeUI();renderGameControls();showModal('refSettingsModal')}function toggleServeModeUI(){const play=document.getElementById('serveStartMode').value==='play';document.getElementById('firstServeField').hidden=play;document.getElementById('playForServeHint').hidden=!play}function setMatchVenue(id){const owner=venueById(id);if(!owner)return;currentMatchVenue=id;const n=Number((currentMatchCourt.match(/(\d+)/)||[])[1])||1;currentMatchCourt=`Court ${Math.min(n,owner.courts)}`;const cfg=getGameConfig();cfg.venue=id;cfg.court=currentMatchCourt;const select=document.getElementById('matchVenueSelect');if(select)select.value=id;renderMatchCourtChoices();syncRef();renderMatchStory();notify(`Match location · ${owner.name}`)}function setMatchCourt(name){currentMatchCourt=name;const cfg=getGameConfig();cfg.venue=currentMatchVenue;cfg.court=name;syncRef();renderMatchStory();notify(`Match court set · ${venueById(currentMatchVenue).name} · ${name}`)}function saveMatchRoster(){const ids=['rosterA1','rosterA2','rosterB1','rosterB2'],names=ids.map(id=>document.getElementById(id).value.trim()),na=document.getElementById('teamNameA').value.trim(),nb=document.getElementById('teamNameB').value.trim(),ca=document.getElementById('teamColorA').value,cb=document.getElementById('teamColorB').value;if(names.some(x=>!x)||!na||!nb){notify('Add both team names and all four player names');return}teamNames={A:na,B:nb};playersByTeam.A=names.slice(0,2);playersByTeam.B=names.slice(2);gameTarget=Math.max(1,Math.min(99,Number(document.getElementById('gameTargetInput').value)||11));const cfg=getGameConfig();cfg.teamNames={...teamNames};cfg.players={A:[...playersByTeam.A],B:[...playersByTeam.B]};cfg.colors={A:ca,B:cb};cfg.target=gameTarget;cfg.venue=currentMatchVenue;cfg.court=currentMatchCourt;cfg.startMode=document.getElementById('serveStartMode').value;cfg.firstServe=document.getElementById('firstServeTeam').value;const fresh=a===0&&b===0&&!matchLogs[gameNo-1].length;if(fresh){servingTeam=cfg.startMode==='play'?'A':cfg.firstServe;serverNumber=1;playForServePending=cfg.startMode==='play';lastCall=playForServePending?'Play for serve · first rally winner earns the serve.':`${teamName(servingTeam)} will serve first.`}cfg.runtime={servingTeam,serverNumber,playForServePending};renderGameControls();syncRef();renderMatchStory();notify(`Game ${gameNo} setup saved · ${venueById(currentMatchVenue).name} · ${currentMatchCourt}`);closeModal('refSettingsModal')}function restartCurrentGame(){history=[];a=0;b=0;gameScores[gameNo-1]=[0,0];matchLogs[gameNo-1]=[];const cfg=getGameConfig();gameTarget=cfg.target||11;servingTeam=cfg.firstServe||'A';serverNumber=1;playForServePending=cfg.startMode==='play';if(playForServePending)servingTeam='A';cfg.runtime={servingTeam,serverNumber,playForServePending};gameSeconds=0;lastCall=playForServePending?'Game reset · Play for serve; first rally awards the serve.':`Game reset · ${teamName(servingTeam)} serves first.`;renderGameControls();syncRef();renderMatchStory();closeModal('refSettingsModal');notify(lastCall)}// (2026-07-13) Rich match history row rendering; was unstyled table cells
function renderInlineMatchLog(){const countEl=document.getElementById('inlineLogCount'),gameNoEl=document.getElementById('inlineLogGameNo'),tbody=document.getElementById('inlineMatchLogRows');if(gameNoEl)gameNoEl.textContent=gameNo;const list=matchLogs[gameNo-1]||[];if(countEl)countEl.textContent=`${list.length} ${list.length===1?'rally':'rallies'}`;if(!tbody)return;if(!list.length){tbody.innerHTML='<tr><td colspan="4" class="history-empty-state"><i data-lucide="activity"></i><p>No rallies logged yet in Game '+gameNo+'.<br><small>Tap rally buttons above to score and track match events.</small></p></td></tr>';icons();return}const cfg=getGameConfig();tbody.innerHTML=[...list].reverse().map(e=>{const isPoint=e.call&&e.call.includes('Point.');const isSideOut=e.call&&e.call.toLowerCase().includes('side out');const isSecond=e.call&&e.call.toLowerCase().includes('second server');const isServe=e.call&&e.call.toLowerCase().includes('won the serve');const isRef=e.winner&&e.winner.includes('Referee');let tagHtml='';if(isPoint)tagHtml='<span class="log-pill-badge log-pill-point"><i data-lucide="plus"></i> Point</span>';else if(isSideOut)tagHtml='<span class="log-pill-badge log-pill-sideout"><i data-lucide="arrow-right-left"></i> Side Out</span>';else if(isSecond)tagHtml='<span class="log-pill-badge log-pill-second"><i data-lucide="user-check"></i> 2nd Server</span>';else if(isServe)tagHtml='<span class="log-pill-badge log-pill-serve"><i data-lucide="flag"></i> Serve</span>';else if(isRef)tagHtml='<span class="log-pill-badge log-pill-ref"><i data-lucide="sliders-horizontal"></i> Edit</span>';const teamCol=e.team==='A'?(cfg.colors?.A||'#059669'):e.team==='B'?(cfg.colors?.B||'#e11d48'):'#10b981';const serverInitial=(e.server||'P').trim().charAt(0);return `<tr><td class="col-num"><span class="log-num-pill">#${String(e.n).padStart(2,'0')}</span></td><td class="col-score"><div class="log-score-pill ${isPoint?'is-point':''}"><span class="tabular-nums">${e.score}</span></div></td><td><div class="log-event-cell"><div class="log-event-header"><span class="log-team-dot" style="background:${teamCol}"></span><b class="log-winner-name">${e.winner}</b>${tagHtml}</div><span class="log-call-desc">${e.call}</span></div></td><td class="col-server"><div class="log-server-cell"><span class="log-server-avatar">${serverInitial}</span><span>${e.server||'—'}</span></div></td></tr>`;}).join('');icons()}function openMatchLog(){renderInlineMatchLog();const card=document.getElementById('matchHistoryCard');if(card){card.scrollIntoView({behavior:'smooth',block:'start'});card.classList.add('ring-2','ring-emerald-500');setTimeout(()=>card.classList.remove('ring-2','ring-emerald-500'),1500)}else{showModal('matchLogModal')}}let currentStoryMode='game';
function renderMatchStory(mode){if(mode)currentStoryMode=mode;const el=id=>document.getElementById(id);if(!el('matchStoryGraphic'))return;gameScores[gameNo-1]=[a,b];const d=new Date(),dateText=`${weekDays[d.getDay()]} · ${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')} · ${d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`,all=currentStoryMode==='all';el('matchStoryGraphic').dataset.mode=all?'all':'game';el('storyVenue').textContent=`${venueById(currentMatchVenue).name.toUpperCase()}${all?'':` · ${currentMatchCourt.toUpperCase()}`}`;el('storyDateLine').textContent=dateText;el('storyTeamA').textContent=teamName('A').toUpperCase();el('storyTeamB').textContent=teamName('B').toUpperCase();el('storyTeamA').style.color=getGameConfig().colors.A;el('storyTeamB').style.color=getGameConfig().colors.B;el('storyScoreA').style.color=getGameConfig().colors.A;el('storyScoreB').style.color=getGameConfig().colors.B;el('storyPlayersA').textContent=playersByTeam.A.join(' · ');el('storyPlayersB').textContent=playersByTeam.B.join(' · ');el('storyHeadline').textContent=all?'THE SERIES, SCORE BY SCORE':'THE GAME, IN ONE FRAME';el('storyGame').textContent=all?`GAMES 1–${availableGames}`:`GAME ${gameNo}`;el('storySinglePanel').hidden=all;el('storyGameSummary').hidden=!all;el('storyModeGame').classList.toggle('selected',!all);el('storyModeAll').classList.toggle('selected',all);if(all){const rows=gameScores.slice(0,availableGames).map((score,i)=>`<div class="story-game-row"><span>GAME ${i+1}</span><strong><b style="color:${gameConfigs[i]?.colors?.A||'#C9F45B'}">${score?.[0]??0}</b><i>–</i><b style="color:${gameConfigs[i]?.colors?.B||'#ffffff'}">${score?.[1]??0}</b></strong></div>`).join('');el('storyGameSummary').innerHTML=`<div class="story-summary-teams"><b style="color:${getGameConfig().colors.A}">${teamName('A').toUpperCase()}</b><span>VS</span><b style="color:${getGameConfig().colors.B}">${teamName('B').toUpperCase()}</b></div><div class="story-game-rows">${rows}</div><div class="story-summary-foot">${availableGames} GAME${availableGames===1?'':'S'} · SCORE ONLY</div>`;el('storyShareHint').textContent=`${availableGames} games · score for each game only · no rally log or repeated posts.`}else{el('storyScoreA').textContent=a;el('storyScoreB').textContent=b;const won=a>=gameTarget&&a-b>=2?'TEAM A WON':b>=gameTarget&&b-a>=2?'TEAM B WON':playForServePending?'PLAY FOR SERVE':`${teamName(servingTeam).toUpperCase()} SERVING · ${a}–${b}`;el('storyResult').textContent=won.replace('TEAM A',teamName('A').toUpperCase()).replace('TEAM B',teamName('B').toUpperCase());el('storyShareHint').textContent=`Game ${gameNo} · teams, score, and court details. No rally-by-rally spam.`}el('storyModeAll').textContent=`All games · ${availableGames}`}
function openMatchStory(){currentStoryMode='game';renderMatchStory('game');showModal('matchStoryModal')}
function openAllGamesStory(){currentStoryMode='all';renderMatchStory('all');showModal('matchStoryModal')}
// (2026-07-13) Rebrand match story & revenue CSV to Pikol; was Paddly
async function downloadMatchStory(){renderMatchStory();const all=currentStoryMode==='all';try{const c=await html2canvas(document.getElementById('matchStoryGraphic'),{scale:3,useCORS:true,backgroundColor:'#062d24'});const a=document.createElement('a');a.download=all?`pikol-games-1-${availableGames}-score-summary.png`:`pikol-game-${gameNo}-story.png`;a.href=c.toDataURL('image/png');a.click();notify(all?'All-games scorecard saved':'Game story image saved')}catch(e){notify('Could not export story image')}}
async function shareMatchStory(){renderMatchStory();const all=currentStoryMode==='all';try{const c=await html2canvas(document.getElementById('matchStoryGraphic'),{scale:3,useCORS:true,backgroundColor:'#062d24'});const blob=await new Promise(r=>c.toBlob(r,'image/png'));const name=all?`pikol-games-1-${availableGames}-scores.png`:`pikol-game-${gameNo}-story.png`,f=new File([blob],name,{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:all?`Pikol App · Games 1–${availableGames} scores`:`Pikol App · Game ${gameNo} story`});return}await downloadMatchStory();notify('Image saved · attach it to your Story')}catch(e){notify('Story share cancelled or unavailable')}}
// (2026-07-13) Court owner custom colors logic; was preset-only colors

// (2026-07-13) Guard announce elements against null; was direct property access
function renderAnnouncementEditor(){const owner=venueById(announcementOwner);ensureOwnerData(announcementOwner);renderOwnerOptions();const aName=document.getElementById('announceOwnerName');if(aName)aName.textContent=owner.name.toUpperCase();const aLoc=document.getElementById('announceOwnerLocation');if(aLoc)aLoc.textContent=owner.location.toUpperCase();const aSub=document.getElementById('announceSubtitle');if(aSub)aSub.textContent=`${owner.courts} COURTS · ${owner.location.toUpperCase()}`;const aFoot=document.getElementById('announceFooterVenue');if(aFoot)aFoot.textContent=`${owner.name.toUpperCase()} · ${owner.courts} COURTS`;document.getElementById('announceTable')?.classList.toggle('announce-dense',owner.courts>=5);const card=document.getElementById('announcement');if(card){if(owner.image)card.style.backgroundImage=`linear-gradient(180deg, rgba(7, 34, 27, 0.88) 0%, rgba(6, 26, 21, 0.94) 55%, rgba(4, 18, 14, 0.98) 100%), url('${owner.image}')`;card.style.backgroundSize='cover';card.style.backgroundPosition='center';}const logoEl=document.getElementById('announceOwnerLogo');if(logoEl&&owner.logo){logoEl.src=owner.logo;logoEl.alt=`${owner.name} logo`;}const aRows=document.getElementById('announceRows');if(aRows)aRows.innerHTML=Array.from({length:owner.courts},(_,i)=>`<div class="announce-row"><div class="announce-row-left"><span class="announce-index">${String(i+1).padStart(2,'0')}</span><b>Court ${i+1}</b></div><strong id="announceHours${i+1}">${ownerCourtHours[announcementOwner][i]}</strong></div>`).join('');const aHours=document.getElementById('announceHoursEditor');if(aHours)aHours.innerHTML=Array.from({length:owner.courts},(_,i)=>`<label class="announce-field">Court ${i+1} available hours<input value="${ownerCourtHours[announcementOwner][i]}" data-owner="${announcementOwner}" data-court="${i+1}" oninput="setAnnouncementHours(this)"></label>`).join('');const sel=document.getElementById('announcementVenue');if(sel)sel.value=announcementOwner}function setAnnouncementHours(input){ownerCourtHours[input.dataset.owner][Number(input.dataset.court)-1]=input.value;syncAnnouncement()}function syncAnnouncement(){const owner=venueById(announcementOwner);const aRows=document.getElementById('announceRows');if(aRows)aRows.innerHTML=Array.from({length:owner.courts},(_,i)=>`<div class="announce-row"><div class="announce-row-left"><span class="announce-index">${String(i+1).padStart(2,'0')}</span><b>Court ${i+1}</b></div><strong>${ownerCourtHours[announcementOwner][i]||'—'}</strong></div>`).join('')}
// (2026-07-13) Set --court-count CSS variable for grid; was inline grid only
function renderBookingHeader(){const owner=venueById(activeBookingOwner),head=document.getElementById('scheduleHeader');document.getElementById('bookingCourtCount').textContent=`${owner.courts} courts · ${owner.name}`;document.documentElement.style.setProperty('--court-count',owner.courts);head.style.gridTemplateColumns=`124px repeat(${owner.courts}, minmax(78px,1fr))`;head.innerHTML='<div class="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-2 py-2">Time</div>'+Array.from({length:owner.courts},(_,i)=>`<div class="text-center text-[10px] font-bold py-2">Court ${i+1}</div>`).join('')}function isSlotReserved(h,c){const clock=slotClockHour(h);return (clock===10&&c===2)||(clock===16&&c===1)||(clock===19&&c===3)}function rangeIso(d){return localIso(d)}function applyRevenueRange(days){const today=new Date();today.setHours(0,0,0,0);const from=new Date(today);from.setDate(from.getDate()-days+1);document.getElementById('revenueFrom').value=rangeIso(from);document.getElementById('revenueTo').value=rangeIso(today);renderAdminAnalytics()}
function exportRevenueCsv(){
  const from=document.getElementById('revenueFrom').value, to=document.getElementById('revenueTo').value;
  const rows = [['Date','Venue','Court','Amount','Status','Booked By'],['2026-10-24','Pikol Pickle Hub','01','₱300','Paid','Alex Reyes'],['2026-10-24','NHP Sports','02','₱280','Paid','Mika S.']];
  const csv = rows.map(r=>r.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `pikol-revenue-${from}-to-${to}.csv`;
  a.click();
  notify('Revenue report exported');
}
// (2026-07-13) Court settings, subpages & 3-dot menu handlers; was monolithic

let onboardServeSelected = 'A';
window._onboardingIsNew = false;
let confettiAnimId = null;

// (2026-07-13) Interactive sample court & 5 court presets; was basic modal
function renderCourtColorOptions() {
  const grid = document.getElementById('onboardCourtColorsGrid');
  if (!grid) return;
  grid.innerHTML = Object.entries(courtColorPresets).map(([key, item]) => `
    <button type="button" class="court-color-btn ${key === currentCourtColorKey ? 'active' : ''}" onclick="setOnboardCourtColor('${key}')" title="${item.name}">
      <span class="court-color-sample" style="background:${item.side}; border-color:${item.nvz}"></span>
      <span>${item.name.split(' ')[0]}</span>
    </button>
  `).join('');
}

function setOnboardCourtColor(key) {
  if (!courtColorPresets[key]) return;
  currentCourtColorKey = key;
  const item = courtColorPresets[key];
  const badge = document.getElementById('sampleCourtColorName');
  if (badge) badge.textContent = item.name;
  
  const sample = document.getElementById('onboardSampleCourt');
  if (sample) {
    sample.style.setProperty('--court-side-color', item.side);
    sample.style.setProperty('--court-nvz-color', item.nvz);
    sample.style.backgroundColor = item.side;
  }
  document.querySelectorAll('.court-color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('title') === item.name);
  });
}

function updateSampleCourtPreview() {
  const colA = document.getElementById('onboardColorA')?.value || '#059669';
  const colB = document.getElementById('onboardColorB')?.value || '#e11d48';
  const sample = document.getElementById('onboardSampleCourt');
  if (sample) {
    sample.style.setProperty('--team-a-color', colA);
    sample.style.setProperty('--team-b-color', colB);
  }
  const pA1 = document.getElementById('onboardPlayerA1')?.value.trim() || 'Player 1';
  const pA2 = document.getElementById('onboardPlayerA2')?.value.trim() || 'Player 2';
  const pB1 = document.getElementById('onboardPlayerB1')?.value.trim() || 'Player 3';
  const pB2 = document.getElementById('onboardPlayerB2')?.value.trim() || 'Player 4';

  const tA = document.getElementById('onboardTeamNameA')?.value.trim() || 'Team 1';
  const tB = document.getElementById('onboardTeamNameB')?.value.trim() || 'Team 2';
// (2026-07-13) Set titles for truncated team names; was textContent only
  const headA = document.getElementById('onboardHeadA');
  const headB = document.getElementById('onboardHeadB');
  if (headA) { headA.textContent = tA.toUpperCase(); headA.title = tA; }
  if (headB) { headB.textContent = tB.toUpperCase(); headB.title = tB; }

  const elA1 = document.getElementById('samplePlayerA1');
  const elA2 = document.getElementById('samplePlayerA2');
  const elB1 = document.getElementById('samplePlayerB1');
  const elB2 = document.getElementById('samplePlayerB2');
  if (elA1) elA1.textContent = pA1;
  if (elA2) elA2.textContent = pA2;
  if (elB1) elB1.textContent = pB1;
  if (elB2) elB2.textContent = pB2;

  const btnA = document.getElementById('serveChoiceA');
  const btnB = document.getElementById('serveChoiceB');
  if (btnA) { btnA.textContent = tA; btnA.title = tA; }
  if (btnB) { btnB.textContent = tB; btnB.title = tB; }
}

function updateOnboardColor(team, hex) {
  const input = document.getElementById(team === 'A' ? 'onboardColorA' : 'onboardColorB');
  if (input) input.value = hex;
  const card = document.getElementById(team === 'A' ? 'onboardCardA' : 'onboardCardB');
  if (card) card.style.borderColor = hex;
  updateSampleCourtPreview();
}

function setOnboardTarget(pts) {
  const input = document.getElementById('onboardTargetScore');
  if (input) input.value = pts;
  document.querySelectorAll('.onboard-preset-pill').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim().startsWith(pts + ' '));
  });
}

function setOnboardServeChoice(choice) {
  onboardServeSelected = choice;
  ['A', 'B', 'play'].forEach(k => {
    const btn = document.getElementById(k === 'A' ? 'serveChoiceA' : k === 'B' ? 'serveChoiceB' : 'serveChoicePlay');
    if (btn) btn.classList.toggle('active', k === choice);
  });
}

// (2026-07-13) Format toggle & quick player suggestions; was doubles only
let currentMatchFormat = 'doubles';
let activePlayerInputField = null;
function setActivePlayerInput(el) { activePlayerInputField = el; }
function quickFillPlayer(name) {
  if (activePlayerInputField && activePlayerInputField.offsetParent !== null) {
    activePlayerInputField.value = name;
  } else {
    const inputs = [document.getElementById('onboardPlayerA1'), document.getElementById('onboardPlayerA2'), document.getElementById('onboardPlayerB1'), document.getElementById('onboardPlayerB2')].filter(Boolean);
    const empty = inputs.find(inp => inp.offsetParent !== null && (!inp.value || ['Player 1', 'Player 2', 'Player 3', 'Player 4'].includes(inp.value.trim())));
    if (empty) empty.value = name;
    else if (inputs[0]) inputs[0].value = name;
  }
  updateSampleCourtPreview();
}
function setOnboardFormat(fmt) {
  currentMatchFormat = fmt;
  document.getElementById('formatDoublesBtn')?.classList.toggle('active', fmt === 'doubles');
  document.getElementById('formatSinglesBtn')?.classList.toggle('active', fmt === 'singles');
  const fA2 = document.getElementById('fieldPlayerA2'), fB2 = document.getElementById('fieldPlayerB2');
  if (fA2) fA2.style.display = fmt === 'singles' ? 'none' : 'block';
  if (fB2) fB2.style.display = fmt === 'singles' ? 'none' : 'block';
  const sA2 = document.getElementById('samplePlayerA2'), sB2 = document.getElementById('samplePlayerB2');
  if (sA2) sA2.style.display = fmt === 'singles' ? 'none' : 'grid';
  if (sB2) sB2.style.display = fmt === 'singles' ? 'none' : 'grid';
  updateSampleCourtPreview();
}

// (2026-07-13) Gate X button on made game & activate ref page view; was modal
function openGameOnboarding(isNew = false) {
  window._onboardingIsNew = isNew;
  const targetGame = isNew ? Math.min(7, availableGames + 1) : gameNo;
  const numSpan = document.getElementById('onboardGameNumber');
  if (numSpan) numSpan.textContent = targetGame;
  const hasMadeGame = !!(window._matchStarted || (typeof a !== 'undefined' && (a > 0 || b > 0)) || (history && history.length > 0) || (matchLogs && matchLogs.some(l => l && l.length > 0)));
  const closeBtn = document.getElementById('onboardCloseBtn');
  if (closeBtn) closeBtn.style.display = hasMadeGame ? 'grid' : 'none';
  const titleEl = document.getElementById('onboardTitle');
  if (titleEl) titleEl.textContent = hasMadeGame ? `Game ${targetGame} Setup` : 'Who is playing?';
  const subEl = document.getElementById('onboardSub');
  if (subEl) subEl.textContent = hasMadeGame ? 'Customize court surface, team colors, and player roster.' : 'Choose match format, assign players, and set court surface.';
  const submitLabel = document.getElementById('onboardSubmitLabel');
  if (submitLabel) submitLabel.textContent = hasMadeGame ? (isNew ? `Create & Start Game ${targetGame}` : 'Save Setup & Resume') : 'Start Scoring Match';
  const viewScore = document.getElementById('view-score');
  if (viewScore) viewScore.classList.add('onboarding-active');

  const cfg = isNew ? getGameConfig(gameNo) : getGameConfig(targetGame);
  const targetInput = document.getElementById('onboardTargetScore');
  if (targetInput) targetInput.value = cfg.target || gameTarget || 11;
  setOnboardTarget(cfg.target || gameTarget || 11);

  const colA = cfg.colors?.A || '#059669';
  const colB = cfg.colors?.B || '#e11d48';
  const inputA = document.getElementById('onboardColorA');
  const inputB = document.getElementById('onboardColorB');
  if (inputA) inputA.value = colA;
  if (inputB) inputB.value = colB;
  updateOnboardColor('A', colA);
  updateOnboardColor('B', colB);

  const inTA = document.getElementById('onboardTeamNameA');
  const inTB = document.getElementById('onboardTeamNameB');
  const inPA1 = document.getElementById('onboardPlayerA1');
  const inPA2 = document.getElementById('onboardPlayerA2');
  const inPB1 = document.getElementById('onboardPlayerB1');
  const inPB2 = document.getElementById('onboardPlayerB2');

  if (inTA) inTA.value = cfg.teamNames?.A || 'Team 1';
  if (inTB) inTB.value = cfg.teamNames?.B || 'Team 2';
  if (inPA1) inPA1.value = cfg.players?.A?.[0] || 'Player 1';
  if (inPA2) inPA2.value = cfg.players?.A?.[1] || 'Player 2';
  if (inPB1) inPB1.value = cfg.players?.B?.[0] || 'Player 3';
  if (inPB2) inPB2.value = cfg.players?.B?.[1] || 'Player 4';

  renderCourtColorOptions();
  setOnboardCourtColor(cfg.courtColor || currentCourtColorKey || 'emerald');
  setOnboardFormat(currentMatchFormat || 'doubles');
  updateSampleCourtPreview();

  setOnboardServeChoice(cfg.startMode === 'play' ? 'play' : (cfg.firstServe || 'A'));
  showModal('gameOnboardingModal');
}

function confirmGameOnboarding() {
  const pts = Math.max(1, Math.min(99, parseInt(document.getElementById('onboardTargetScore').value) || 11));
  const colA = document.getElementById('onboardColorA').value || '#059669';
  const colB = document.getElementById('onboardColorB').value || '#e11d48';
  const tNameA = document.getElementById('onboardTeamNameA').value.trim() || 'Team 1';
  const tNameB = document.getElementById('onboardTeamNameB').value.trim() || 'Team 2';
  const pA1 = document.getElementById('onboardPlayerA1').value.trim() || 'Player 1';
  const pA2 = document.getElementById('onboardPlayerA2').value.trim() || (currentMatchFormat === 'singles' ? '' : 'Player 2');
  const pB1 = document.getElementById('onboardPlayerB1').value.trim() || 'Player 3';
  const pB2 = document.getElementById('onboardPlayerB2').value.trim() || (currentMatchFormat === 'singles' ? '' : 'Player 4');
  const sChoice = onboardServeSelected || 'A';

  if (window._onboardingIsNew) {
    if (availableGames >= 7) {
      notify('Maximum 7 games reached per match');
      return;
    }
    availableGames++;
    gameNo = availableGames;
  }

  const courtPreset = courtColorPresets[currentCourtColorKey] || courtColorPresets.emerald;
  document.documentElement.style.setProperty('--court-side-color', courtPreset.side);
  document.documentElement.style.setProperty('--court-nvz-color', courtPreset.nvz);

  const cfg = getGameConfig(gameNo);
  cfg.target = pts;
  gameTarget = pts;
  cfg.colors = { A: colA, B: colB };
  cfg.courtColor = currentCourtColorKey;
  cfg.teamNames = { A: tNameA, B: tNameB };
  cfg.players = { A: currentMatchFormat === 'singles' ? [pA1] : [pA1, pA2], B: currentMatchFormat === 'singles' ? [pB1] : [pB1, pB2] };
  cfg.startMode = sChoice === 'play' ? 'play' : 'serve';
  cfg.firstServe = sChoice === 'play' ? 'A' : sChoice;

  teamNames = { ...cfg.teamNames };
  playersByTeam.A = [...cfg.players.A];
  playersByTeam.B = [...cfg.players.B];

  a = 0;
  b = 0;
  gameScores[gameNo - 1] = [0, 0];
  history = [];
  matchLogs[gameNo - 1] = [];
  gameSeconds = 0;

  servingTeam = sChoice === 'play' ? 'A' : sChoice;
  serverNumber = 1;
  playForServePending = sChoice === 'play';
  cfg.runtime = { servingTeam, serverNumber, playForServePending };
  lastCall = playForServePending ? `Game ${gameNo} ready · Play for serve.` : `Game ${gameNo} ready · ${teamName(servingTeam)} serves first.`;

  window._matchStarted = true;
  window._matchConfigured = true;
  const viewScore = document.getElementById('view-score');
  if (viewScore) viewScore.classList.remove('onboarding-active');
  closeModal('gameOnboardingModal');
  renderGameControls();
  syncRef();
  renderMatchStory();
  notify(`Game ${gameNo} ready: ${tNameA} vs ${tNameB} (${pts} pts)`);
}

function triggerGameWonCelebration(team, winner, scoreA, scoreB) {
  const overlay = document.getElementById('gameWinnerOverlay');
  if (!overlay) return;
  document.getElementById('winnerTeamTitle').textContent = `${winner} Wins Game ${gameNo}!`;
  document.getElementById('winnerFinalScoreA').textContent = scoreA;
  document.getElementById('winnerFinalScoreB').textContent = scoreB;
  document.getElementById('winnerPlayersList').textContent = playersByTeam[team].join(' & ') + ' · ' + teamName(team);
  document.getElementById('winnerRuleCaption').textContent = `Regulation victory: ${Math.max(scoreA, scoreB)} points reached with a 2-point lead.`;

  overlay.style.display = 'flex';
  startConfetti();
  playVictoryFanfare();
}

function closeWinnerOverlay() {
  const overlay = document.getElementById('gameWinnerOverlay');
  if (overlay) overlay.style.display = 'none';
  stopConfetti();
}

function openNewGameFromWin() {
  closeWinnerOverlay();
  openGameOnboarding(true);
}

function shareWinnerStory() {
  closeWinnerOverlay();
  openMatchStory('game');
}

function playVictoryFanfare() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const st = now + idx * 0.11;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.0001, st);
      gain.gain.exponentialRampToValueAtTime(0.2, st + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(st);
      osc.stop(st + 0.6);
    });
  } catch (e) {}
}

function startConfetti() {
  const canvas = document.getElementById('winnerConfettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#bef264', '#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#ffffff', '#eab308'];
  const pieces = Array.from({ length: 90 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height * 0.4 - 50,
    size: Math.random() * 9 + 5,
    speedX: (Math.random() - 0.5) * 5,
    speedY: Math.random() * 3 + 2.5,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: Math.random() > 0.4 ? 'rect' : 'circle'
  }));

  const startTime = Date.now();
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });

    if (Date.now() - startTime < 6000) {
      confettiAnimId = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  confettiAnimId = requestAnimationFrame(loop);
}

function stopConfetti() {
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  const canvas = document.getElementById('winnerConfettiCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
