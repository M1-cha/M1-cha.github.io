(() => {
 let scores=[],roundPromise=null,loaded=false;
 const online=location.protocol==='http:'||location.protocol==='https:';
 const status=document.createElement('p');status.style.cssText='font-size:11px;line-height:1.4;color:#c7dcff';document.querySelector('#leaderboard-panel').append(status);
 const message=text=>{status.textContent=text};
 async function api(url,body){const response=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});const data=await response.json();if(!response.ok)throw new Error(data.error||'Verbindung fehlgeschlagen');return data}
 const localList=list;
 list=function(){if(!online)return localList();return scores.length?scores.map(entry=>'<li><span>'+esc(entry.name)+'</span><b>'+entry.score+'</b></li>').join(''):'<li>'+(loaded?'Noch keine Online-Highscores.':'Highscores werden geladen …')+'</li>'};
 function render(){document.querySelectorAll('#live-scores,.leaderboard ol').forEach(node=>node.innerHTML=list())}
 async function refresh(){if(!online)return;try{scores=(await api('/api/leaderboard')).scores;loaded=true;render();message('Gemeinsame Online-Highscores')}catch{message('Online-Liste derzeit nicht erreichbar.')}}
 const previousBegin=begin;begin=function(...args){roundPromise=online?api('/api/rounds',{name:player}).catch(()=>{message('Offline-Runde: Punkte können nicht online gespeichert werden.');return null}):null;return previousBegin(...args)};
 const previousEnd=end;end=function(...args){const eligible=running&&playerHealth>0&&seconds<=0,points=score,pending=roundPromise;roundPromise=null;const result=previousEnd(...args);if(eligible&&pending){pending.then(async round=>{if(!round)return;try{scores=(await api('/api/scores',{roundId:round.roundId,score:points})).scores;loaded=true;render();message('Highscore gespeichert')}catch(error){message('Highscore nicht gespeichert: '+error.message)}})}return result};
 if(online){refresh();setInterval(()=>{if(!document.hidden)refresh()},15000)}else message('Für gemeinsame Highscores das Spiel über den Server öffnen.');
})();
