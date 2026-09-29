'use strict';
// Clickable first-person inspection points, projected onto each fixed room image.
window.createRoomInspector=function({stage,layer,hotspots,onInspect}){
 const maps={
  shackNight:[{id:'door',label:'检视木门',at:[.17,.39]},{id:'window',label:'检视窗户',at:[.54,.31]},{id:'supplies',label:'搜查旧桌',at:[.89,.52]},{id:'bed',label:'检视床铺',at:[.77,.61]}],
  shackDay:[{id:'door',label:'检视木门',at:[.17,.39]},{id:'window',label:'检视窗户',at:[.54,.31]},{id:'terminal',label:'开启安居终端',at:[.89,.52]},{id:'workbench',label:'检视加固工具',at:[.14,.68]},{id:'storage',label:'查看储备箱',at:[.08,.75]},{id:'bed',label:'检视床铺',at:[.77,.61]}],
  cabin:[{id:'door',label:'检视木门',at:[.18,.39]},{id:'window',label:'检视窗户',at:[.55,.30]},{id:'terminal',label:'开启安居终端',at:[.90,.43]},{id:'fire',label:'检视壁炉',at:[.30,.50]},{id:'storage',label:'查看物资架',at:[.48,.55]},{id:'bed',label:'检视床铺',at:[.77,.57]}],
  villaDown:[{id:'door',label:'检视木门',at:[.31,.39]},{id:'window',label:'检视窗户',at:[.61,.34]},{id:'terminal',label:'开启安居终端',at:[.61,.67]},{id:'fire',label:'检视壁炉',at:[.36,.58]},{id:'storage',label:'查看物资架',at:[.50,.54]},{id:'stairs',label:'上楼',at:[.11,.25]},{id:'sofa',label:'检视沙发',at:[.83,.56]}],
  villaUp:[{id:'stairsDown',label:'下楼',at:[.18,.55]},{id:'bed',label:'检视卧室床铺',at:[.53,.48]},{id:'window',label:'检视二楼窗户',at:[.83,.34]},{id:'storage',label:'查看床尾储物箱',at:[.68,.61]},{id:'radio',label:'检视收音机',at:[.89,.63]}],
  towerRoom:[{id:'towerDoor',label:'检视钢制防护门',at:[.10,.48]},{id:'terminal',label:'开启安全屋系统',at:[.28,.27]},{id:'window',label:'检视高层防护窗',at:[.56,.30]},{id:'storage',label:'查看室内物资柜',at:[.76,.34]},{id:'airFilter',label:'检视空气净化机',at:[.76,.54]},{id:'bed',label:'检视折叠床',at:[.43,.49]}],
  towerCorridor:[{id:'returnDoor',label:'返回自己的安全屋',at:[.13,.48]},{id:'dropLocker',label:'检视物资投放柜',at:[.43,.36]},{id:'neighborDoor',label:'检视邻居门铃',at:[.94,.48]},{id:'elevator',label:'检视电梯',at:[.64,.39]}]
 };
 let points=[];const imageBox=()=>{const r=stage.getBoundingClientRect(),ratio=1672/941,w=Math.min(r.width,r.height*ratio),h=w/ratio;return {x:(r.width-w)/2,y:(r.height-h)/2,w,h};};
 function place(){const b=imageBox();for(const item of points){const el=hotspots.querySelector('[data-spot="'+item.id+'"]');if(el){el.style.left=(b.x+b.w*item.at[0])+'px';el.style.top=(b.y+b.h*item.at[1])+'px';}}}
 function setView(house,floor,night,area='room'){const key=house===0?(night===1?'shackNight':'shackDay'):house===1?'cabin':house===2?(floor===2?'villaUp':'villaDown'):area==='corridor'?'towerCorridor':'towerRoom';points=maps[key];hotspots.replaceChildren();for(const item of points){const b=document.createElement('button');b.type='button';b.className='hotspot';b.dataset.spot=item.id;b.setAttribute('aria-label',item.label);b.innerHTML='<span class="hotspot-ring" aria-hidden="true"></span><span class="hotspot-label"></span>';b.querySelector('.hotspot-label').textContent=item.label.replace(/^(检视|查看|搜查|开启)/,'');b.addEventListener('click',()=>onInspect(item));hotspots.append(b);}place();}
 new ResizeObserver(place).observe(stage);
 return {setView,show(){layer.hidden=false;place();},hide(){layer.hidden=true;},refresh:place,getPoint(id){return points.find(p=>p.id===id)}};
};
