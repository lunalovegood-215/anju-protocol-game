'use strict';
/* Pointer capture keeps a hold attached to one finger; cancellation never completes it. */
window.bindShelterHold=function(button,{duration=1500,onProgress=()=>{},onComplete,assisted=()=>false}){
 let held=false,done=false,elapsed=0,last=0,raf=0,pointer=null;
 function stop(){held=false;button.classList.remove('holding');}
 function tick(now){if(done)return;const dt=last?Math.min(50,now-last):0;last=now;
  if(!document.hidden){elapsed=Math.max(0,Math.min(duration,elapsed+(held?dt:-dt*.6)));onProgress(elapsed/duration);}
  if(elapsed>=duration){done=true;stop();onComplete();return;}raf=requestAnimationFrame(tick);
 }
 function down(e){if(done||button.disabled||e.button>0)return;e.preventDefault();held=true;button.classList.add('holding');pointer=e.pointerId;button.setPointerCapture?.(pointer);}
 function up(e){if(pointer!==null&&e.pointerId!==pointer)return;stop();pointer=null;}
 function keydown(e){if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();if(assisted()){if(!done){done=true;onComplete();}}else{held=true;button.classList.add('holding');}}}
 function keyup(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();stop();}}
 function click(){if(assisted()&&!done){done=true;onComplete();}}
 function visibility(){if(document.hidden)stop();}
 button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('lostpointercapture',stop);button.addEventListener('keydown',keydown);button.addEventListener('keyup',keyup);button.addEventListener('click',click);button.addEventListener('blur',stop);window.addEventListener('blur',stop);document.addEventListener('visibilitychange',visibility);raf=requestAnimationFrame(tick);
 return ()=>{done=true;cancelAnimationFrame(raf);button.classList.remove('holding');button.removeEventListener('pointerdown',down);button.removeEventListener('pointerup',up);button.removeEventListener('pointercancel',up);button.removeEventListener('lostpointercapture',stop);button.removeEventListener('keydown',keydown);button.removeEventListener('keyup',keyup);button.removeEventListener('click',click);button.removeEventListener('blur',stop);window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',visibility);};
};
window.createShelterHands=function({frame,kind,assisted,onComplete,impact}){
 const box=document.createElement('section');box.className='hands hands-'+kind;box.setAttribute('aria-label','物品操作');
 const name=kind==='steel'?'金属锁栓':kind==='locker'?'投放柜门':kind==='door'?'木板':kind==='window'?'遮光帘':kind==='power'?'滤芯':'抽屉';
 const instructions=kind==='steel'?'向右推入金属锁栓，锁住门框':kind==='locker'?'向右打开投放柜门，取出物资包':kind==='door'?'向右拖动木板，对准门框卡槽':kind==='window'?'向右拉上遮光帘，遮住屋内的光':kind==='power'?'向右推入滤芯，接通备用回路':'向右拉开抽屉，找到里面的口粮';
 const text=document.createElement('p');text.className='hands-instruction';text.textContent=instructions;
 const object=document.createElement('div');object.className='hands-object';object.setAttribute('aria-hidden','true');object.innerHTML='<i></i><span>'+name+'</span>';
 const label=document.createElement('label');label.textContent='拖动'+name+' · 也可用方向键';const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.value='0';slider.setAttribute('aria-label',instructions);label.append(slider);
 const button=document.createElement('button');button.type='button';button.className='hands-finish';button.hidden=true;
 const status=document.createElement('span');status.className='hands-status';status.setAttribute('aria-live','off');
 box.append(text,object,label,button,status);frame.append(box);frame.classList.add('hands-active');
 let cleanup=()=>{},disposed=false,opened=false,dragStart=null;
 object.style.touchAction='none';object.style.cursor='grab';object.addEventListener('pointerdown',e=>{if(opened)return;dragStart={x:e.clientX,value:Number(slider.value)};object.setPointerCapture(e.pointerId);e.preventDefault();});object.addEventListener('pointermove',e=>{if(!dragStart||opened)return;slider.value=String(Math.max(0,Math.min(100,dragStart.value+(e.clientX-dragStart.x)/2.4)));slider.dispatchEvent(new Event('input'));});object.addEventListener('pointerup',()=>{dragStart=null;});object.addEventListener('pointercancel',()=>{dragStart=null;});
 function finish(){if(disposed)return;dispose();impact();onComplete();}
 function open(){if(opened)return;opened=true;impact();box.classList.add('aligned');text.textContent=['drawer','locker'].includes(kind)?'物资找到了。点击拾取，放进背包。':assisted()?'已对准，点击固定到位。':'已对准。按住下方按钮，直到固定完成。';slider.disabled=true;button.hidden=false;
  if(['drawer','locker'].includes(kind)){button.textContent=kind==='locker'?'拾取物资 · 食物 +1 / 滤芯 +1':'拾取口粮 · 食物 +1';button.addEventListener('click',finish,{once:true});}
  else{button.textContent=assisted()?'固定到位':kind==='steel'?'按住 · 锁紧钢门':kind==='door'?'按住 · 抵紧木板':kind==='window'?'按住 · 扣紧窗栓':'按住 · 锁定滤芯';cleanup=bindShelterHold(button,{duration:1200,assisted,onComplete:finish,onProgress:p=>{button.style.setProperty('--hold',p*100+'%');status.textContent=p>0?'固定中 '+Math.round(p*100)+'%':'';}});}
  button.focus({preventScroll:true});
 }
 slider.addEventListener('input',()=>{box.style.setProperty('--travel',slider.value+'%');object.style.transform='translateX('+(-50+Number(slider.value)/2)+'%)';if(Number(slider.value)>=96)open();});
 if(assisted()){const assist=document.createElement('button');assist.className='hands-assist';assist.textContent='对准'+name;assist.addEventListener('click',()=>{slider.value='100';object.style.transform='translateX(0)';open();assist.remove();});box.append(assist);}
 slider.focus({preventScroll:true});
 function dispose(){if(disposed)return;disposed=true;cleanup();box.remove();frame.classList.remove('hands-active');}
 return dispose;
};
