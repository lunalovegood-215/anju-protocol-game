'use strict';
// User-supplied local recordings. Music is optional; active room ambience is not.
window.createShelterAudio = function ({onError=()=>{},onChange=()=>{},musicFile='cabin-music.m4a',musicDefault=false}={}) {
  const tracks={};
  for(const [name,file] of Object.entries({zombie:'zombies.m4a',fire:'campfire.m4a',music:musicFile})){
    const el=document.createElement('audio');el.id='audio-'+name;el.src='assets/audio/'+file;el.loop=true;el.preload='auto';el.setAttribute('aria-hidden','true');document.body.append(el);tracks[name]=el;
  }
  tracks.zombie.volume=.24;tracks.fire.volume=.55;tracks.music.volume=.175;
  let active=false,music=musicDefault,fire=true,threat=false,audioContext=null;
  function impact(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||= new Audio();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;oscillator.type='triangle';oscillator.frequency.setValueAtTime(100,now);oscillator.frequency.exponentialRampToValueAtTime(42,now+.24);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(.22,now+.018);gain.gain.exponentialRampToValueAtTime(.001,now+.3);oscillator.connect(gain).connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+.31);}catch{}}
  const shouldPlay=name=>active&&!document.hidden&&(name==='zombie'||(name==='fire'&&fire)||(name==='music'&&music));
  async function sync(){
    const results=await Promise.allSettled(Object.entries(tracks).map(async([name,el])=>{
      if(shouldPlay(name)){await el.play();if(!shouldPlay(name))el.pause();}else el.pause();
    }));
    const failure=results.find(r=>r.status==='rejected'&&r.reason?.name!=='AbortError');
    if(failure&&active&&!document.hidden)onError();
    onChange({active,music,fire});
  }
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pagehide',()=>Object.values(tracks).forEach(el=>el.pause()));
  return {
    start(){active=true;return sync();},
    stop(){active=false;return sync();},
    setMusic(value){music=Boolean(value);return sync();},
    setMusicSource(file){if(tracks.music.src.endsWith('/'+file))return sync();tracks.music.pause();tracks.music.src='assets/audio/'+file;tracks.music.load();return sync();},
    setMusicVolume(value){tracks.music.volume=Math.max(0,Math.min(1,value))*.5;},
    setFire(value){fire=Boolean(value);return sync();},
    setThreat(value){threat=Boolean(value);tracks.zombie.volume=threat ? .58 : .24;},
    impact,
    retry:sync,
    get music(){return music;}
  };
};
