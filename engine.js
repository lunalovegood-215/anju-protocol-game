'use strict';
(function(root){
 const houses=[
  {name:'简陋平房',image:'shack-v1.jpg',income:20,cost:0},
  {name:'温暖小木屋',image:'cabin-v2.jpg',income:28,cost:20},
  {name:'两层小洋房',image:'villa-v1.jpg',income:36,cost:40},
  {name:'高楼安全屋',image:'tower-v2.jpg',income:48,cost:80,minNight:5}
 ];
 const maxNights=5;
 function create(){return {version:2,night:1,phase:'night',house:0,coins:0,food:2,reserve:3,integrity:100,door:false,window:false,supplies:false,action:false,dream:null,shield:0,survived:0,dropDay:0,filters:0,neighborMet:false,actionsLeft:2,prepared:{},fixtures:{},observed:[],damage:{door:0,window:0},stats:{held:0,missed:0,repairs:0,foodFound:0},history:[],emergencyDay:0,log:'门把手在转动。先把墙边的木板卡进门框，再检查窗户和旧桌。'};}
 function migrate(raw){
  const base=create(),s={...base,...raw,version:2,prepared:{...raw?.prepared},fixtures:{...raw?.fixtures},observed:[...(raw?.observed||[])],damage:{...base.damage,...raw?.damage},stats:{...base.stats,...raw?.stats},history:[...(raw?.history||[])]};
  if(raw&&raw.version!==2)s.actionsLeft=raw.action?1:2;
  return s;
 }
 function threat(s){
  if(s.night===1)return {key:'door',title:'门把手正在转动',clue:'门框上的钉孔已经裂开。抵住木门，再扣紧窗栓。'};
  if(s.house===3)return {key:'power',title:'今晚可能停电',clue:'门禁灯每隔几秒就暗一下。维护净化设备与备用回路，可以给钢门争取时间。'};
  if(s.house===1&&s.night%2===0)return {key:'window',title:'灯光引来了它们',clue:'玻璃外的人影追着灯光移动。拉上遮光帘、扣紧窗栓，今晚会更容易守住。'};
  if(s.house===2&&s.night%2===1)return {key:'door',title:'楼下有拖行声',clue:'门口的灰尘被拖出一道痕迹。入睡前加固楼下的门，不要只顾二楼。'};
  return {key:'window',title:'窗框留下了新抓痕',clue:'外侧窗框已经松动。封住光线并锁紧横挡，可以减轻今晚的撞击。'};
 }
 function protection(s,key){return Boolean(s.prepared[key]||(s.night===1&&(key==='door'?s.door:s.window)));}
 function forecast(s){return s.night===1?0:Math.max(0,12+s.night*4-s.house*5-s.shield*8-(protection(s,threat(s).key)?12:0)-(s.prepared.structure?6:0));}
 function canUpgrade(s){const next=houses[s.house+1];return s.phase==='day'&&Boolean(next)&&s.coins>=next.cost&&s.night>=(next.minNight||1);}
 function canRelocate(s){return s.phase==='end'&&s.house<3&&s.survived>=maxNights&&s.integrity>0;}
 function canPrepare(s,key){return s.phase==='day'&&s.actionsLeft>0&&!s.prepared[key];}
 function canSleep(s){return s.phase!=='end'&&s.food>=1&&(s.night===1?s.door&&s.window&&s.supplies:s.phase==='day'&&s.action);}
 function resetDay(s){s.action=false;s.actionsLeft=2;s.prepared={};s.observed=[];s.dream=null;s.shield=0;}
 function act(previous,type,options={}){
  const s=migrate(previous);let ok=true;
  const prep={braceDoor:'door',sealWindow:'window',prepare:'structure',sort:'food',installFilter:'power'};
  if(type==='observe'&&s.phase!=='end'&&!s.observed.includes(options.key)){s.observed.push(options.key);s.log=threat(s).clue;}
  else if(type==='door'&&s.night===1&&!s.door){s.door=true;s.fixtures.door=true;s.stats.repairs++;s.log='木板卡住了。门外撞了一下，你用手确认它没有松动。';}
  else if(type==='window'&&s.night===1&&!s.window){s.window=true;s.fixtures.window=true;s.stats.repairs++;s.log='横挡扣紧，窗帘遮住了灯光。玻璃外的手印还在。';}
  else if(type==='supplies'&&s.night===1&&!s.supplies){s.supplies=true;s.food++;s.stats.foodFound++;s.log='饼干放进背包。食物 +1，今晚可以安心一些。';}
  else if(type==='upgrade'&&canUpgrade(s)){s.coins-=houses[++s.house].cost;s.integrity=100;s.food++;s.damage={door:0,window:0};s.fixtures={};s.log='建造完成：'+houses[s.house].name+'。房屋修复，食物 +1。检查新房间，今晚的威胁也变了。';}
  else if(type==='relocate'&&canRelocate(s)){s.house=3;s.night=6;s.phase='day';s.integrity=100;s.food++;s.damage={door:0,window:0};s.fixtures={};resetDay(s);s.log='你接受了高楼安置。门禁灯却在忽明忽暗，先检查备用回路，再去走廊领取投放。';}
  else if(['lamp','shield'].includes(type)&&s.phase==='day'&&!s.dream){s.dream=type;if(type==='shield')s.shield++;s.log=type==='lamp'?'选择暖灯梦境：今晚额外收入 12 金币，不消耗准备机会。':'选择紧闭的门：今晚预计损耗减少 8，不消耗准备机会。';}
  else if(prep[type]&&canPrepare(s,prep[type])&&(type!=='sort'||s.reserve>0)&&(type!=='installFilter'||s.house===3&&s.filters>0)){
   const key=prep[type];s.prepared[key]=true;if(key==='door'||key==='window')s.fixtures[key]=true;s.actionsLeft--;s.action=true;
   if(type==='sort'){s.reserve--;s.food++;s.stats.foodFound++;s.log='取出一份储备粮。食物 +1，柜内还剩 '+s.reserve+' 份。';}
   else {s.stats.repairs++;s.integrity=Math.min(100,s.integrity+(type==='prepare'?20:10));if(key==='door'||key==='window')s.damage[key]=0;if(type==='installFilter')s.filters--;
    s.log=type==='braceDoor'?'门框支撑卡牢了。今晚撞门时，抵挡更轻松。':type==='sealWindow'?'窗帘拉紧，窗栓扣牢。漏光消失，今晚窗边的压力降低。':type==='installFilter'?'新滤芯归位，备用回路恢复供电。停电时门禁仍能坚持。':'松动的接缝补好了。完整度 +20，今晚基础损耗减少 6。';}
   s.log+=' 今天还可准备 '+s.actionsLeft+' 次。';
  }
  else if(type==='emergency'&&s.phase==='day'&&s.food===0&&s.emergencyDay!==s.night){s.food=1;s.emergencyDay=s.night;if(s.coins>=12){s.coins-=12;s.log='系统回收 12 金币，解锁一份应急口粮。';}else{s.integrity=Math.max(1,s.integrity-10);s.log='拆开墙内的应急箱找到口粮。房屋完整度 −10。';}}
  else if(type==='claimDrop'&&s.house===3&&s.phase==='day'&&s.dropDay!==s.night){s.dropDay=s.night;s.food++;s.filters++;s.stats.foodFound++;s.log='物资入包：食物 +1，滤芯 +1。回屋可维护备用设备，不需要拜访邻居。';}
  else if(type==='contactNeighbor'&&s.house===3&&s.phase==='day'&&!s.neighborMet){s.neighborMet=true;s.log='门铃里传来声音：“停电时别打开钢门。我们都从木屋熬过来的。”你们约定保留彼此的空间。';}
  else if(type==='sleep'&&canSleep(s)){
   const breaches=Math.min(2,Math.max(0,Math.floor(Number(options.breaches)||0))),impact=breaches*12;
   const loss=forecast(s)+impact,income=houses[s.house].income+(s.dream==='lamp'?12:0);
   s.food--;s.integrity=Math.max(0,s.integrity-loss);s.coins+=income;
   s.stats.held+=Math.max(0,(options.beats|| (s.night===1||s.house===3?2:1))-breaches);s.stats.missed+=breaches;
   for(const key of options.missed||[]){const part=key==='window'?'window':'door';s.damage[part]++;}
   if(breaches&&!options.missed)s.damage[threat(s).key==='window'?'window':'door']++;
   if(s.integrity>0)s.survived++;
   s.history.push({night:s.night,house:s.house,loss,breaches,prepared:Object.keys(s.prepared)});
   s.log='天亮了。金币 +'+income+'，食物 −1，房屋损耗 '+loss+'。'+(breaches?'有 '+breaches+' 次撞击未能挡住，留下了新的破损。':'你守住了每一轮撞击。');
   if(s.integrity===0){s.phase='end';s.log='门框脱落。你带着背包撤离了房屋，这次没能撑过黑夜。';}
   else if(s.night>=maxNights){s.phase='end';}
   else{s.night++;s.phase='day';resetDay(s);}
  }else ok=false;
  return {state:ok?s:previous,ok};
 }
 const api={houses,maxNights,create,migrate,threat,protection,forecast,canUpgrade,canRelocate,canPrepare,canSleep,act};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Shelter=api;
})(typeof window!=='undefined'?window:this);
