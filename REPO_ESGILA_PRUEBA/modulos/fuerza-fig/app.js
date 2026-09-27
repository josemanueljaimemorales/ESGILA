
let rows=[];
let currentDay='';

async function init(){
 const res=await fetch('AKC_FuerzaFIG.xlsx');
 const buf=await res.arrayBuffer();
 const wb=XLSX.read(buf);
 const ws=wb.Sheets[wb.SheetNames[0]];
 rows=XLSX.utils.sheet_to_json(ws);

 const days=[...new Set(rows.map(r=>r.Dia||r.DÍA||r.dia))];
 const container=document.getElementById('days');

 days.forEach(d=>{
   const count=rows.filter(r=>(r.Dia||r.DÍA||r.dia)==d).length;
   container.innerHTML += `<button class='dayBtn' onclick="showDay('${d}')">💪 ${d}<br><small>${count} ejercicios</small></button>`;
 });
}

function showDay(day){
 currentDay=day;
 document.getElementById('home').classList.add('hidden');
 const div=document.getElementById('exerciseView');
 div.classList.remove('hidden');

 const list=rows.filter(r=>(r.Dia||r.DÍA||r.dia)==day);

 let html=`<button class='back' onclick='goHome()'>🏠 Inicio</button><h2>${day}</h2>`;

 list.forEach(r=>{
   const e=r.Ejercicio||r.ejercicio;
   const s=r.Segmento||r.segmento;
   const l=r.Link||r.link;
   html+=`<div class='exercise'><h3>${e}</h3><div class='segment'>${s}</div><button onclick="showVideo('${l}','${e}','${s}')">▶ Ver ejercicio</button></div>`;
 });

 div.innerHTML=html;
}

function showVideo(url,name,seg){
 let id='';
 if(url.includes('/shorts/')) id=url.split('/shorts/')[1].split('?')[0];
 else if(url.includes('v=')) id=url.split('v=')[1].split('&')[0];

 document.getElementById('exerciseView').classList.add('hidden');
 const v=document.getElementById('videoView');
 v.classList.remove('hidden');

 v.innerHTML=`<div class='videoCard'>
 <button class='back' onclick='backExercises()'>⬅ Regresar</button>
 <h2>${name}</h2>
 <p>${seg}</p>
 <iframe src='https://www.youtube.com/embed/${id}' allowfullscreen></iframe>
 </div>`;
}

function backExercises(){
 document.getElementById('videoView').classList.add('hidden');
 document.getElementById('exerciseView').classList.remove('hidden');
}

function goHome(){
 document.getElementById('exerciseView').classList.add('hidden');
 document.getElementById('home').classList.remove('hidden');
}

init();
