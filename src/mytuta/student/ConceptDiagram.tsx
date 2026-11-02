import { useState } from "react";
import type { BlockVisual } from "../data/visuals";

export default function ConceptDiagram({ visual, onInteract }: { visual: BlockVisual; onInteract?: () => void }) {
  const [switchClosed, setSwitchClosed] = useState(true);
  if (visual === "series_circuit") return <figure>
    <svg viewBox="0 0 620 220" role="img" aria-label={`A cell, switch and two lamps in one series loop. The switch is ${switchClosed ? "closed, so there is a complete path" : "open, so the lamps are off"}.`} style={{ width: "100%" }}>
      <rect width="620" height="220" fill="#fffdf8" />
      <path d="M60 90V45H150M220 45H280M340 45H430M490 45H560V175H60V130" fill="none" stroke="#34443d" strokeWidth="3" />
      <path d={switchClosed ? "M150 45H220" : "M150 45L210 15"} fill="none" stroke="#34443d" strokeWidth="3" />
      <line x1="35" y1="90" x2="85" y2="90" stroke="#34443d" strokeWidth="4" /><line x1="45" y1="130" x2="75" y2="130" stroke="#34443d" strokeWidth="3" />
      {[310,460].map((x) => <g key={x}><circle cx={x} cy="45" r="30" fill={switchClosed ? "#ffe79c" : "#e6e9e2"} stroke="#34443d" strokeWidth="3" /><path d={`M${x-17} 28L${x+17} 62M${x-17} 62L${x+17} 28`} stroke="#34443d" strokeWidth="2" /></g>)}
      <text x="100" y="115" fontSize="16">Cell</text><text x="160" y="95" fontSize="16">Switch</text><text x="292" y="105" fontSize="16">Lamp 1</text><text x="442" y="105" fontSize="16">Lamp 2</text>
    </svg>
    <button type="button" onClick={() => { setSwitchClosed((value) => !value); onInteract?.(); }}>{switchClosed ? "Open the switch" : "Close the switch"}</button>
    <figcaption>One series path: opening the switch stops steady current through both lamps. Use low-voltage classroom equipment for a physical investigation.</figcaption>
  </figure>;
  const description = {
    fraction_parts: "One whole divided into four equal parts, with three shaded. Three quarters of the same whole are selected.",
    ratio_groups: "Two green counters and three blue counters: green to blue is 2 to 3, and green is 2 out of 5 of the whole.",
    percentage_grid: "A ten by ten grid with twenty-five of one hundred squares shaded: 25 percent, or one quarter.",
    equation_balance: "The equation x plus 3 equals 8. Subtracting 3 from both sides keeps equality and leaves x equals 5.",
    graph_reading: "Illustrative rainfall data: day 1 is 10 millimetres, day 2 is 30, day 3 is 20, day 4 is 40. Axes show days and millimetres.",
    photosynthesis_process: "Photosynthesis uses light energy, carbon dioxide and water to produce glucose and oxygen; chlorophyll absorbs the light.",
    forces_diagram: "A box has a 12 newton force right and a 5 newton force left. The resultant is 7 newtons right.",
    density_mass_volume: "", solar_system: "",
  }[visual];
  return <figure style={{ margin: "18px 0" }}>
    <svg viewBox="0 0 620 300" role="img" aria-label={description} style={{ width: "100%", background: "#fffdf8" }}>
      {visual === "fraction_parts" && <>{[0,1,2,3].map((i) => <rect key={i} x={70+i*120} y="70" width="120" height="95" fill={i<3 ? "#26946e" : "white"} stroke="#34443d" strokeWidth="2" />)}<text x="310" y="220" textAnchor="middle" fontSize="24">3 equal parts selected out of 4: 3/4</text></>}
      {visual === "ratio_groups" && <>{[0,1,2,3,4].map((i) => <circle key={i} cx={110+i*100} cy="120" r="30" fill={i<2 ? "#26946e" : "#527fbf"} />)}<text x="310" y="210" textAnchor="middle" fontSize="24">Green : blue = 2 : 3</text><text x="310" y="250" textAnchor="middle" fontSize="20">Five counters in the whole group</text></>}
      {visual === "percentage_grid" && <>{Array.from({length:100},(_,i) => <rect key={i} x={45+(i%10)*20} y={30+Math.floor(i/10)*20} width="20" height="20" fill={i<25 ? "#26946e" : "white"} stroke="#34443d" />)}<text x="400" y="110" textAnchor="middle" fontSize="26">25 / 100 = 25%</text><text x="400" y="160" textAnchor="middle" fontSize="22">One quarter shaded</text></>}
      {visual === "equation_balance" && <><path d="M100 85H520M310 85V165M275 200L310 165L345 200Z" fill="none" stroke="#34443d" strokeWidth="3" /><rect x="110" y="30" width="160" height="55" fill="#e4f3eb" /><rect x="350" y="30" width="160" height="55" fill="#e4f3eb" /><text x="190" y="65" textAnchor="middle" fontSize="26">x + 3</text><text x="430" y="65" textAnchor="middle" fontSize="26">8</text><text x="190" y="135" textAnchor="middle" fontSize="20">Subtract 3</text><text x="430" y="135" textAnchor="middle" fontSize="20">Subtract 3</text><text x="310" y="260" textAnchor="middle" fontSize="28">x = 5</text></>}
      {visual === "graph_reading" && <><path d="M70 30V245H565" stroke="#34443d" strokeWidth="2" fill="none" />{[0,10,20,30,40].map((v) => <g key={v}><line x1="70" y1={245-v*5} x2="550" y2={245-v*5} stroke="#dce4da" /><text x="55" y={250-v*5} textAnchor="end" fontSize="14">{v}</text></g>)}<polyline points="130,195 250,95 370,145 490,45" fill="none" stroke="#18784d" strokeWidth="3" />{[10,30,20,40].map((v,i) => <g key={i}><circle cx={130+i*120} cy={245-v*5} r="5" fill="#18784d" /><text x={130+i*120} y="265" textAnchor="middle" fontSize="14">{i+1}</text></g>)}<text x="315" y="293" textAnchor="middle" fontSize="15">Day (illustrative data)</text><text transform="translate(20 145) rotate(-90)" textAnchor="middle" fontSize="15">Rainfall (mm)</text></>}
      {visual === "photosynthesis_process" && <><rect x="20" y="100" width="150" height="90" rx="10" fill="#e4f3eb" /><text x="95" y="135" textAnchor="middle" fontSize="17">Carbon dioxide</text><text x="95" y="165" textAnchor="middle" fontSize="17">+ water</text><path d="M175 145H225M390 145H440M310 65V95" stroke="#18784d" strokeWidth="3" /><text x="205" y="151" fontSize="24">›</text><text x="418" y="151" fontSize="24">›</text><rect x="230" y="100" width="155" height="90" rx="10" fill="#bfe6cf" /><text x="308" y="136" textAnchor="middle" fontSize="17">Photosynthesis</text><text x="308" y="159" textAnchor="middle" fontSize="12">Light absorbed by</text><text x="308" y="177" textAnchor="middle" fontSize="12">chlorophyll</text><rect x="445" y="100" width="155" height="90" rx="10" fill="#e4f3eb" /><text x="523" y="136" textAnchor="middle" fontSize="17">Glucose</text><text x="523" y="165" textAnchor="middle" fontSize="17">+ oxygen</text><text x="310" y="50" textAnchor="middle" fontSize="20">Light energy</text></>}
      {visual === "forces_diagram" && <><rect x="260" y="95" width="85" height="80" fill="#dbe9de" stroke="#34443d" /><path d="M345 135H585L567 123M585 135L567 147M260 135H160L178 123M160 135L178 147" fill="none" stroke="#18784d" strokeWidth="4" /><text x="460" y="105" textAnchor="middle" fontSize="22">12 N right</text><text x="210" y="105" textAnchor="middle" fontSize="20">5 N left</text><text x="310" y="245" textAnchor="middle" fontSize="24">Resultant: 7 N right</text></>}
    </svg>
    <figcaption>{description}</figcaption>
  </figure>;
}
