/* GÖKDELEN — shared board and atomic, revision-checked turns. */
(()=>{
let activeRef=null,generation=0,clock=null,startTimer=null,autoExit=null,sceneRound=0,introRound=0,lastRevision=-1,startBusy=false,enterBusy=false,submitBusy=false,latest=null,lastCountdown=-1;
const engine=()=>window.gokdelenEngine;
const side=()=>mpRole==='guest'?1:0;
function stop(){
  generation++;clearInterval(clock);clock=null;clearTimeout(startTimer);startTimer=null;clearTimeout(autoExit);autoExit=null;
  if(activeRef)engine()?.stop();activeRef=null;latest=null;sceneRound=0;introRound=0;lastRevision=-1;enterBusy=false;startBusy=false;submitBusy=false;
}
async function createRecord(mode,hostId,guestId=null){
  await ensureWordDataLoaded();const match=engine().makeMatch();
  const created=await createCleanRoomRecord({schema:22,mode,hostId,guestId,board:match.grid,inviteGuest:guestId?'accepted':'pending'});
  try{await created.ref.child('gokdelen').set(match);}catch(err){await created.ref.remove().catch(()=>{});throw err;}
  return created;
}
async function createPrivate(){
  if(privateRoomCreateBusy)return false;privateRoomCreateBusy=true;
  try{
    if(!await waitFirebaseConnected(8000))throw Error('connection');
    const created=await createRecord('invite-only-gokdelen-v1',getClientToken());
    mpRoomCode=created.code;mpRole='host';mpRoomRef=created.ref;mpRoomMode='invite-only-gokdelen-v1';mpRandomMatchSession=false;
    mpRoomData=null;mpEntered=false;mpStarted=false;mpSessionJoinedAt=serverNow();mpExitHandling=false;mpLastExitSignalId='';
    delete document.body.dataset.randomMatchActive;document.body.dataset.privateFriendActive='1';document.body.dataset.gokdelenMenu='1';
    setRoomUrl(mpRoomCode);await markPresence();setMpPanelRoom(mpRoomCode);document.getElementById('btn-close-room')?.classList.remove('hidden');
    setMpState(MP_STATES.WAITING);attachRoomListener();return true;
  }catch(err){console.error('Gökdelen room creation failed',err);showToast('GÖKDELEN odası açılamadı. Tekrar deneyin.','rose');return false;}
  finally{privateRoomCreateBusy=false;}
}
async function openPrivate(){
  if(randomSearchActive)await cleanupRandomQueue(true);await discardCurrentPrivateRoom();setDifficultyOpen(false);
  document.body.dataset.gokdelenMenu='1';document.getElementById('friend-invite-panel')?.classList.remove('hidden');
  document.getElementById('mp-create-view')?.classList.add('hidden');document.getElementById('mp-room-view')?.classList.remove('hidden');
  document.getElementById('btn-close-room')?.classList.remove('hidden');setPrivateInviteControlsReady(false);
  if(await createPrivate())setPrivateInviteControlsReady(true);
}
async function enter(record=null){
  const ref=mpRoomRef,token=generation;if(!ref||!isGokdelenRoom()||enterBusy)return;
  enterBusy=true;
  try{
    await ensureWordDataLoaded();const data=record||(await ref.once('value')).val();
    if(ref!==mpRoomRef||token!==generation||!data?.gokdelen)return;
    const round=Number(data.gameState?.round||1);
    activeGameMode='multi';
    if(!mpEntered||sceneRound!==round){
      sceneRound=round;introRound=0;lastRevision=Number(data.gokdelen.revision||0);mpEntered=true;mpStarted=false;
      engine().enter(data.gokdelen);
      document.getElementById('friend-invite-panel')?.classList.add('hidden');
      await ref.child('ready/'+mpRole).set(true);
    }
  }catch(err){console.error('Gökdelen enter failed',err);showToast('GÖKDELEN yüklenemedi. Tekrar deneyin.','rose');}
  finally{if(token===generation)enterBusy=false;}
}
async function start(){
  if(mpRole!=='host'||!mpRoomRef||startBusy)return;startBusy=true;const ref=mpRoomRef;
  try{
    await ref.once('value');
    await ref.transaction(data=>{
      if(!data?.gokdelen||data.gameState?.status!=='waiting'||!data.guestId||!data.ready?.host||!data.ready?.guest)return;
      if(!/^random-match-/.test(data.mode)&&data.invite?.guest!=='accepted')return;
      const at=serverNow()+3200;data.gameState.status='countdown';data.gameState.startAt=at;
      data.gokdelen.turnDeadline=at+9100+30000;return data;
    },undefined,false);
  }catch(err){console.error('Gökdelen start failed',err);}
  finally{startBusy=false;}
}
function beginRound(record){
  if(!activeRef||!record?.gokdelen)return;
  const round=Number(record.gameState?.round||1);if(introRound===round)return;introRound=round;mpStarted=true;
  document.getElementById('modal-countdown')?.classList.add('hidden');document.getElementById('modal-mp-waiting')?.classList.add('hidden');
  const fresh=Number(record.gokdelen.revision||0)===0&&serverNow()<Number(record.gameState.startAt)+10000;
  engine().apply(record.gokdelen,round,fresh);lastRevision=Number(record.gokdelen.revision||0);
  startTurnClock();
}
function startTurnClock(){
  clearInterval(clock);
  const token=generation;
  const tick=()=>{
    if(token!==generation||!latest?.gokdelen||!activeRef)return;
    const gs=latest.gameState||{},match=latest.gokdelen;
    engine().tick(Number(match.turnDeadline||0),gs.status==='playing');
    if(gs.status==='playing'&&!match.gameOver&&serverNow()>=Number(match.turnDeadline||Infinity))submit('timeout');
  };
  tick();clock=setInterval(tick,250);
}
async function watch(snapshot){
  const token=generation,ref=activeRef,data=snapshot.val();if(!ref||ref!==mpRoomRef)return;
  if(!data){returnToHomeFromMultiplayer();return;}
  if(!data.gokdelen)return;latest=data;
  const gs=data.gameState||{},round=Number(gs.round||1);
  mpRoomData={...gs,guestId:data.guestId||null,guestOnline:isOnline(data.presence?.guest),hostOnline:isOnline(data.presence?.host),inviteGuest:data.invite?.guest,inviteExpiresAt:Number(data.invite?.expiresAt||0)};
  setMpState(gs.status||MP_STATES.WAITING);
  const exitSignal=data.roomExit;
  if(exitSignal?.id&&exitSignal.id!==mpLastExitSignalId){mpLastExitSignalId=exitSignal.id;handleSynchronizedRoomExit(exitSignal.reason||'game-cancelled',exitSignal.by||'');return;}
  handleOpponentPresenceState(isOnline(data.presence?.[mpRole==='host'?'guest':'host']));
  if(gs.status==='waiting'){
    const random=/^random-match-/.test(data.mode);
    const accepted=random||data.invite?.guest==='accepted';
    if(random||(accepted&&data.guestId&&isOnline(data.presence?.guest))){
      stopInviteWaitCountdown();await enter(data);if(token!==generation||ref!==activeRef)return;await start();
    }else if(mpEntered)document.getElementById('modal-mp-waiting')?.classList.remove('hidden');
    return;
  }
  if(['countdown','playing','finished'].includes(gs.status)){
    await enter(data);if(token!==generation||ref!==activeRef)return;
    document.getElementById('modal-mp-waiting')?.classList.add('hidden');
    if(gs.status==='countdown'){
      const number=document.getElementById('countdown-number'),status=document.getElementById('countdown-status');
      const modal=document.getElementById('modal-countdown');modal?.classList.remove('single-countdown-active','hidden');
      document.getElementById('single-countdown-message')?.classList.add('hidden');document.getElementById('single-countdown-understood')?.classList.add('hidden');
      modal?.querySelector('.mp-demo')?.classList.add('hidden');if(status){status.textContent='GÖKDELEN • SENKRON HAZIR';status.classList.remove('hidden');}
      const paintCountdown=()=>{if(token!==generation)return;const n=Math.max(1,Math.ceil((gs.startAt-serverNow())/1000));if(number){number.textContent=String(n);number.style.opacity='1';}if(n!==lastCountdown){lastCountdown=n;playCountdownBeep(n);}};
      clearInterval(clock);paintCountdown();clock=setInterval(paintCountdown,250);
      clearTimeout(startTimer);startTimer=setTimeout(async()=>{
        if(token!==generation||ref!==activeRef)return;
        beginRound(latest);
        try{await ref.child('gameState').transaction(cur=>{if(cur?.status==='countdown'&&Number(cur.round)===round&&serverNow()>=Number(cur.startAt)){return{...cur,status:'playing'};}},undefined,false);}catch(err){console.error('Gökdelen countdown failed',err);}
      },Math.max(0,gs.startAt-serverNow()));
      return;
    }
    if(introRound!==round)beginRound(data);
    if(Number(data.gokdelen.revision||0)!==lastRevision){
      engine().apply(data.gokdelen,round);lastRevision=Number(data.gokdelen.revision||0);
    }
    if(gs.status==='finished'){
      clearInterval(clock);clock=null;
      document.getElementById('btn-ksm-again')?.classList.toggle('hidden',/^random-match-/.test(data.mode));
      if(/^random-match-/.test(data.mode)&&!autoExit)autoExit=setTimeout(()=>leave(),5000);
    }else startTurnClock();
  }
}
function attach(){
  stop();detachMultiplayerListeners();activeRef=mpRoomRef;
  const ref=activeRef,token=generation;if(!ref)return;
  const handler=snap=>{if(token===generation&&ref===activeRef)watch(snap).catch(err=>console.error('Gökdelen sync failed',err));};
  ref.on('value',handler);mpControlListeners.push({ref,event:'value',handler});
}
async function submit(action,placed=null){
  if(submitBusy||!activeRef||!latest||latest.gameState?.status!=='playing')return false;
  if(action==='move'){const valid=engine().preview();if(valid.error){showToast(valid.error,'rose');return false;}}
  const ref=activeRef,token=generation,revision=Number(latest.gokdelen.revision||0),round=Number(latest.gameState.round||1),player=side();
  submitBusy=true;engine().busy(true);
  try{
    const tx=await ref.transaction(data=>{
      if(!data?.gokdelen||data.gameState?.status!=='playing'||Number(data.gameState.round||1)!==round)return;
      const next=engine().reduce(data.gokdelen,player,action,placed,serverNow(),revision);if(!next)return;
      data.gokdelen=next;data.scores={host:next.scores[0],guest:next.scores[1]};
      if(next.gameOver)data.gameState.status='finished';return data;
    },undefined,false);
    if(!tx.committed&&action!=='timeout')showToast('Hamle güncellendi. Sıranı ve yerleşimi tekrar kontrol et.','amber');
    return tx.committed;
  }catch(err){console.error('Gökdelen move failed',err);showToast('Hamle gönderilemedi. Bağlantını kontrol edip tekrar dene.','rose');return false;}
  finally{if(token===generation&&ref===activeRef){submitBusy=false;engine().busy(false);}}
}
async function restart(){
  if(!activeRef||submitBusy||isRandomHumanRoom())return;const ref=activeRef,token=generation;submitBusy=true;engine().busy(true);
  try{
    const fresh=engine().makeMatch(),at=serverNow()+3200;fresh.turnDeadline=at+9100+30000;
    const expectedRound=Number(latest?.gameState?.round||1);
    await ref.transaction(data=>{
      if(!data||Number(data.gameState?.round)!==expectedRound||!['playing','finished'].includes(data.gameState?.status))return;
      data.gokdelen=fresh;data.scores={host:0,guest:0};data.gameState={status:'countdown',board:fresh.grid,startAt:at,round:expectedRound+1};return data;
    },undefined,false);
  }catch(err){console.error('Gökdelen rematch failed',err);showToast('Yeni oyun açılamadı. Tekrar dene.','rose');}
  finally{if(token===generation){submitBusy=false;engine().busy(false);}}
}
async function leave(){
  const ref=mpRoomRef;stop();
  try{if(ref)await closeAndLockPrivateRoom(ref,mpRoomCode,'gokdelen-exit');}catch(err){console.error('Gökdelen exit failed',err);}
  returnToHomeFromMultiplayer();
}
window.gokdelenNetwork={attach,enter,start,stop,startTurnClock,submit,restart,leave,createPrivate,openPrivate,createRandom:async(host,guest)=>(await createRecord('random-match-gokdelen-v1',host,guest)).code};
})();
