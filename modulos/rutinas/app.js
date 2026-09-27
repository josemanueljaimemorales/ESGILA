let data = [];
let NP = {};
let OBL = [];
let clubAthletes = new Set();
let routineMeta = {};
let athleteSheetMap = {};

const screen = document.getElementById("screen");

async function loadExcel(){
const res = await fetch("Excel_Solo_Valores.xlsx?"+Date.now());
if(!res.ok) throw new Error("No se encontró Excel_Solo_Valores.xlsx");
const buffer = await res.arrayBuffer();
const wb = XLSX.read(buffer);
clubAthletes = await loadClubAthletes();
data = XLSX.utils.sheet_to_json(wb.Sheets["BASEAPPRUTINAS"] || { });
OBL = [];
data = data.filter(r=>clubAthletes.has(String(r["ATLETA"]||"").trim().toUpperCase()));

// La hoja NP que venía en el Excel es histórica de AKC. Para ESGILA,
// la nota de partida y los grupos se toman de la hoja individual de cada atleta.
NP = {};
routineMeta = {};
const athleteSheets = wb.SheetNames.filter(s=>!["BASEAPPRUTINAS","Concentrado","NP","Dificultad","GRUPOS"].includes(s));
for(const sheetName of athleteSheets){
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws,{header:1,defval:""});
  const athlete = String((rows[0]||[])[0]||"").trim().toUpperCase();
  if(!athlete || !clubAthletes.has(athlete)) continue;
  athleteSheetMap[athlete] = sheetName;
  parseRoutineMeta(rows, athlete);
}

showHome();
}

async function loadClubAthletes(){
  const names=new Set();
  const sources=["../gav-training/trabajo_gav.xlsx","../normativos/NORMATIVOS_ESGILA.xlsx"];
  for(const url of sources){
    try{
      const r=await fetch(url+"?"+Date.now());
      if(!r.ok) continue;
      const b=await r.arrayBuffer();
      const w=XLSX.read(b,{type:"array"});
      if(url.includes("trabajo_gav")){
        const rows=XLSX.utils.sheet_to_json(w.Sheets[w.SheetNames[0]],{header:1,defval:""});
        const h=(rows[0]||[]).map(v=>String(v).trim().toUpperCase());
        const i=h.indexOf("NOMBRE");
        if(i>=0) rows.slice(1).forEach(row=>{const n=String(row[i]||"").trim().toUpperCase();if(n)names.add(n);});
      }else{
        const rows=XLSX.utils.sheet_to_json(w.Sheets["NORMATIVOS"],{header:1,defval:""});
        (rows[0]||[]).slice(2).forEach(v=>{const n=String(v||"").trim().toUpperCase();if(n)names.add(n);});
      }
    }catch(e){console.warn("No se pudo leer padrón ESGILA",url,e)}
  }
  return names;
}

function norm(v){ return String(v||"").trim().toUpperCase(); }

function parseRoutineMeta(rows, athlete){
  let current = "";
  for(let i=0;i<rows.length;i++){
    const row = rows[i] || [];
    const first = norm(row[0]);
    const apparatus = normalizeApparatusName(first);
    if(apparatus){
      current = apparatus;
      if(!routineMeta[athlete]) routineMeta[athlete] = {};
      if(!routineMeta[athlete][current]) routineMeta[athlete][current] = {np:"", grupos:""};
      continue;
    }
    if(!current) continue;

    // Encabezado de Nota D / NP (o Nota D / Saltos en salto).
    let notaIdx=-1, npIdx=-1, gruposIdx=-1;
    row.forEach((v,idx)=>{
      const x=norm(v);
      if(x==="NOTA D") notaIdx=idx;
      if(x==="NP") npIdx=idx;
      if(x==="GRUPOS") gruposIdx=idx;
    });
    if(notaIdx>=0 && i+1<rows.length){
      const next=rows[i+1]||[];
      if(npIdx>=0) routineMeta[athlete][current].np = cleanNumber(next[npIdx]);
      else {
        // En salto, la columna SALTOS contiene la nota de partida.
        const saltosIdx=row.findIndex(v=>norm(v)==="SALTOS");
        if(saltosIdx>=0) routineMeta[athlete][current].np = cleanNumber(next[saltosIdx]);
      }
    }
    if(gruposIdx>=0 && i+1<rows.length){
      routineMeta[athlete][current].grupos = cleanNumber((rows[i+1]||[])[gruposIdx]);
    }
  }
}

function cleanNumber(v){
  if(v===null || v===undefined || v==="") return "";
  const n=parseFloat(String(v).replace(",","."));
  return Number.isFinite(n) ? n.toFixed(1) : String(v).trim();
}

function normalizeApparatusName(v){
  const x=norm(v);
  if(x==="PISO") return "PISO";
  if(x==="ARZONES" || x==="ARZON") return "ARZON";
  if(x==="ANILLOS" || x==="ANILLO") return "ANILLO";
  if(x==="SALTO DE CABALLO" || x==="SALTO") return "SALTO DE CABALLO";
  if(x==="PARALELAS" || x==="PARALELA") return "PARALELA";
  if(x==="FIJA" || x==="BARRA FIJA") return "FIJA";
  return "";
}

function showHome(){
screen.innerHTML = `
<div class="homeTitle">
  <div class="eyebrow"><span data-cliente-name>ESGILA</span></div>
  <h1>RUTINAS</h1>
  <p>Gimnasia Artística Varonil</p>
</div>

<div class="homeMenu">
  <div class="button homeCard routines" onclick="showAthletes()">
    <span class="cardIcon">R</span>
    <span class="cardText">
      <strong>Rutinas</strong>
      <small>Rutinas por atleta y aparato</small>
    </span>
    <span class="cardArrow">›</span>
  </div>

</div>
${data.length===0 ? `<div class="dataNotice">El archivo de rutinas actual no contiene atletas ESGILA. Sustituye <b>Excel_Solo_Valores.xlsx</b> por el Excel de rutinas de ESGILA para mostrar sus rutinas.</div>` : ``}
`;
}

function showAthletes(){
const athletes = [...new Set(data.map(d=>d["ATLETA"]))];
screen.innerHTML = `<div class="back" onclick="showHome()">⬅️</div>`;
athletes.forEach(a=>{
screen.innerHTML += `<div class="button" onclick="showAparatos('${a}')">${a}</div>`;
});
}

function showAparatos(name){
const aparatos = [...new Set(data.filter(d=>d["ATLETA"]===name).map(d=>d["APARATO"]))];
screen.innerHTML = `<div class="back" onclick="showAthletes()">⬅️</div>`;
aparatos.forEach(ap=>{
screen.innerHTML += `<div class="button" onclick="showRutina('${name}','${ap}')">${ap}</div>`;
});
}

function mapAparato(ap){
  return normalizeApparatusName(ap) || norm(ap);
}

function getMeta(name, aparato){
  const athlete=norm(name);
  const key=mapAparato(aparato);
  return (routineMeta[athlete] && routineMeta[athlete][key]) || {np:"", grupos:""};
}

function showRutina(name, aparato){
const rutina = data.filter(d=>d["ATLETA"]===name && d["APARATO"]===aparato);
const meta = getMeta(name, aparato);
const np = meta.np;

// 🔹 SUMA VD
let sumaVD = 0;
rutina.forEach(r=>{
let val = parseFloat(r["Valor decimal"]);
if(!isNaN(val)) sumaVD += val;
});

// 🔹 BASE
let dificultad = sumaVD;
let grupos = meta.grupos;

// La dificultad sigue calculándose a partir de los valores del Excel.
// Los grupos se muestran exactamente como están registrados en la hoja del atleta.
dificultad = dificultad ? dificultad.toFixed(1) : "";

let html = `<div class="back" onclick="showAparatos('${name}')">⬅️</div>`;
html += `<h2>${name} - ${aparato}</h2>`;
html += `<div class="np">Nota de partida: ${np||"-"}</div>`;
html += `<div class="np">Dificultad: ${dificultad||"-"}</div>`;
html += `<div class="np">Grupos: ${grupos||"-"}</div>`;

html += `<table class="table">
<tr><th>Elemento</th><th>ID</th><th>Grupo</th><th>Valor</th><th>VD</th></tr>`;

rutina.forEach(r=>{
html+=`<tr>
<td>${r["ELEMENTO"]||""}</td>
<td>${r["NÚM DE ID"]||""}</td>
<td>${r["GRUPO"]||""}</td>
<td>${r["VALOR"]||""}</td>
<td>${r["Valor decimal"]||""}</td>
</tr>`;
});

html += "</table>";
screen.innerHTML = html;
}

loadExcel();
