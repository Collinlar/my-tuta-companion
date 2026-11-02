export type BlockVisual = "density_mass_volume" | "solar_system";

export default function KnowledgeBlockVisual({ visual }: { visual?: BlockVisual }) {
  if (!visual) return null;
  if (visual === "density_mass_volume") return <figure style={{ margin: "18px 0" }}>
    <svg viewBox="0 0 520 300" role="img" aria-label="Mass against volume: material A reaches 30 grams at 10 cubic centimetres; material B reaches 20 grams at the same volume. A is denser." style={{ width: "100%", maxWidth: 620 }}>
      <rect width="520" height="300" fill="#fffdf8" />
      {[0, 10, 20, 30].map((mass) => <g key={mass}><line x1="65" y1={235-mass*6} x2="440" y2={235-mass*6} stroke="#e5e1d7" /><text x="50" y={240-mass*6} textAnchor="end" fontSize="13">{mass}</text></g>)}
      <path d="M65 40V235H450" fill="none" stroke="#33413a" strokeWidth="2" />
      {[0, 5, 10].map((volume) => <text key={volume} x={65+volume*34} y="255" textAnchor="middle" fontSize="13">{volume}</text>)}
      <path d="M65 235L405 55" fill="none" stroke="#18784d" strokeWidth="3" /><text x="416" y="58" fontSize="16" fill="#18784d">A</text>
      <path d="M65 235L405 115" fill="none" stroke="#255a9e" strokeWidth="3" strokeDasharray="8 5" /><text x="416" y="118" fontSize="16" fill="#255a9e">B</text>
      <text x="250" y="286" textAnchor="middle" fontSize="14">Volume (cm³)</text>
      <text transform="translate(18 140) rotate(-90)" textAnchor="middle" fontSize="14">Mass (g)</text>
    </svg>
    <figcaption>A: 3 g/cm³. B: 2 g/cm³. With the same scales, the steeper mass-volume line represents the denser material.</figcaption>
  </figure>;
  const planets = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];
  return <figure style={{ margin: "18px 0" }}>
    <svg viewBox="0 0 620 230" role="img" aria-label="Order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. The inner four are rocky; Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants. Sizes and distances are not to scale." style={{ width: "100%" }}>
      <rect width="620" height="230" rx="12" fill="#14243b" />
      <circle cx="40" cy="100" r="25" fill="#ffd16b" /><text x="40" y="150" textAnchor="middle" fill="white" fontSize="13">Sun</text>
      {planets.map((name, i) => <g key={name}>
        <circle cx={105+i*66} cy="100" r={i<4?8:i<6?17:13} fill={["#b3aaa1", "#e3b67c", "#76b7f1", "#e29171", "#cdb38c", "#e6cf9b", "#9bddd9", "#638be8"][i]} />
        <text transform={`translate(${105+i*66} 150) rotate(-35)`} textAnchor="middle" fill="white" fontSize="12">{name}</text>
      </g>)}
      <text x="200" y="35" fill="#dfeaf5" textAnchor="middle" fontSize="13">Inner rocky planets</text>
      <text x="402" y="35" fill="#dfeaf5" textAnchor="middle" fontSize="13">Gas giants</text>
      <text x="535" y="35" fill="#dfeaf5" textAnchor="middle" fontSize="13">Ice giants</text>
      <text x="310" y="210" fill="#dfeaf5" textAnchor="middle" fontSize="13">Order only: sizes and distances are not to scale</text>
    </svg>
    <figcaption>Read outward from the Sun. This model shows order and categories; it does not show true sizes or distances.</figcaption>
  </figure>;
}
