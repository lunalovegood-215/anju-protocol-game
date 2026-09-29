'use strict';
(function(root){
 const houses=[
  {name:'简陋平房',image:'shack-v1.jpg',income:20,cost:0},
  {name:'温暖小木屋',image:'cabin-v2.jpg',income:28,cost:20},
  {name:'两层小洋房',image:'villa-v1.jpg',income:36,cost:40},
  {name:'高楼安全屋',image:'tower-v2.jpg',income:48,cost:80,minNight:5}
 ];
 const maxNights=5;
 function canRelocate(s){return s.phase==='end'&&s.house<3&&s.survived>=maxNights&&s.integrity>0;}
 function create(){return {night:1,phase:'night',house:0,coins:0,food:2,reserve:3,integrity:100,door:false,window:false,supplies:false,action:false,dream:null,shield:0,survived:0,dropDay:0,filters:0,neighborMet:false,log:'你醒在一张潮湿的床上。门外有什么在移动。检查门窗，找到食物，再设法入睡。'};}
 function forecast(s){return s.night===1?0:Math.max(0,s.night*8-s.house*13-s.shield*15);}
 function canUpgrade(s){const next=houses[s.house+1];return s.phase==='day'&&Boolean(next)&&s.coins>=next.cost&&s.night>=(next.minNight||1);}
 function act(previous,type,options={}){const s={...previous};let ok=true;
 if(type==='door'&&s.night===1&&!s.door){s.door=true;s.log='木板卡进门框。门外传来一下撞击，木板没有松动。';}
 else if(type==='window'&&s.night===1&&!s.window){s.window=true;s.log='你扣上窗栓。玻璃外的手印没有消失，但窗户暂时撑得住。';}
 else if(type==='supplies'&&s.night===1&&!s.supplies){s.supplies=true;s.food++;s.log='旧桌抽屉里有一包压扁的饼干。食物 +1。';}
 else if(type==='upgrade'&&canUpgrade(s)){s.coins-=houses[++s.house].cost;s.integrity=100;s.food++;s.log=s.house===3?'厚重的钢门合上，走廊的噪声被隔在外面。你搬进高楼安全屋，找到一份备用口粮。':'建造完成。'+houses[s.house].name+'已解锁。你在新柜子里找到一份食物；房屋完整度恢复，每晚收入提高。';}
 else if(type==='relocate'&&canRelocate(s)){s.house=3;s.night=maxNights+1;s.phase='day';s.integrity=100;s.food++;s.action=false;s.dream=null;s.shield=0;s.log='第五夜后，安居系统向幸存者开放高楼安置。你领取迁入资格，不必补交金币。厚重钢门合上，你在新柜子里找到一份备用口粮。';}
 else if(['lamp','shield'].includes(type)&&s.phase==='day'&&!s.dream){s.dream=type;if(type==='shield')s.shield++;s.log=type==='lamp'?'梦里有一盏没有熄灭的灯。今晚金币收入 +12。':'梦里，你关上了一道厚重的门。今晚防护 +15。';}
 else if(type==='sort'&&s.phase==='day'&&!s.action&&s.dream&&s.reserve>0){s.action=true;s.reserve--;s.food++;s.log='你从室内储备箱整理出一份食物。屋内剩余储备 '+s.reserve+' 份。';}
 else if(type==='prepare'&&s.phase==='day'&&!s.action&&s.dream){s.action=true;s.shield++;s.integrity=Math.min(100,s.integrity+20);s.log='你加固了屋内结构。完整度恢复 20，今晚防护 +15。今天没有外出。';}
 else if(type==='claimDrop'&&s.house===3&&s.phase==='day'&&s.dropDay!==s.night){s.dropDay=s.night;s.food++;s.filters++;s.log='走廊投放柜弹开：食物 +1，滤芯 +1。你把物资装进背包，回屋后可以安装滤芯。';}
 else if(type==='installFilter'&&s.house===3&&s.phase==='day'&&s.dream&&!s.action&&s.filters>0){s.action=true;s.filters--;s.shield+=2;s.integrity=Math.min(100,s.integrity+10);s.log='新滤芯滑入净化机，指示灯从红色变成青色。今晚防护 +30，房屋完整度 +10。';}
 else if(type==='contactNeighbor'&&s.house===3&&s.phase==='day'&&!s.neighborMet){s.neighborMet=true;s.log='门铃里传来邻居的声音：“我也是从一间木屋慢慢升上来的。走廊的投放柜每天会亮一次。”你们约定保持各自的空间。';}
 else if(type==='sleep'&&s.phase!=='end'&&s.food>=1&&((s.night===1&&s.door&&s.window&&s.supplies)||(s.phase==='day'&&s.action&&s.dream&&(s.house!==3||s.dropDay===s.night)))){
  const breaches=Math.min(2,Math.max(0,Math.floor(Number(options.breaches)||0))),impact=s.night===1?0:breaches*12;
  const loss=forecast(s)+impact,income=houses[s.house].income+(s.dream==='lamp'?12:0);s.food--;s.integrity=Math.max(0,s.integrity-loss);s.coins+=income;if(s.integrity>0)s.survived++;s.log='夜晚结束：金币 +'+income+'，食物 −1，房屋损耗 '+loss+'。'+(impact?'丧尸撞击额外造成 '+impact+' 点损耗。':'你挡住了这一轮撞击。');
  if(s.integrity===0){s.phase='end';s.log='门框终于松脱。你带着背包撤离了房屋。这一次，庇护所没能撑过黑夜。';}
  else if(s.night>=maxNights&&s.house===3){s.phase='end';s.log='清晨，高楼的钢门仍然牢固。你望着窗外的城市，终于相信这里能成为家。';}
  else if(s.night===maxNights){s.phase='end';s.log='第六个清晨，安居系统发来高楼迁入资格。你可以进入大楼继续探索，也可以暂时留在现在的家。';}
  else{s.night++;s.phase='day';s.action=false;s.dream=null;s.shield=0;}
 }else ok=false;
 return {state:ok?s:previous,ok};}
 const api={houses,maxNights,create,forecast,canUpgrade,canRelocate,act};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Shelter=api;
})(typeof window!=='undefined'?window:this);
