import { useState } from "react";
export default function GeometryDiagram({ kind, onInteract }: { kind: "area_perimeter" | "angle_turn"; onInteract?: () => void }) {
  const [width, setWidth] = useState(6);
  const [height, setHeight] = useState(4);
  const [angle, setAngle] = useState(60);
  if (kind === "area_perimeter") return <figure>
    <svg viewBox="0 0 440 300" role="img" aria-label={`Rectangle ${width} units by ${height} units. Area ${width * height} square units; perimeter ${2 * (width + height)} units.`} style={{ width: "100%", maxWidth: 560 }}>
      <rect width="440" height="300" fill="#fffdf8" />
      {Array.from({ length: width * height }, (_, i) => <rect key={i} x={40 + (i % width) * 25} y={30 + Math.floor(i / width) * 25} width="25" height="25" fill="#d8ede2" stroke="#9bb5a5" />)}
      <rect x="40" y="30" width={width * 25} height={height * 25} fill="none" stroke="#18784d" strokeWidth="4" />
      <text x="40" y="270" fontSize="16">Count unit squares for area.</text>
      <text x="40" y="292" fontSize="16">Trace the boundary for perimeter.</text>
    </svg>
    <label>Rectangle length: {width} units<input aria-label="Rectangle length" type="range" min="1" max="10" value={width} onChange={(e) => { setWidth(Number(e.target.value)); onInteract?.(); }} /></label>
    <label>Rectangle width: {height} units<input aria-label="Rectangle width" type="range" min="1" max="8" value={height} onChange={(e) => { setHeight(Number(e.target.value)); onInteract?.(); }} /></label>
    <p role="status">Area: {width * height} square units. Perimeter: {2 * (width + height)} units.</p>
    <figcaption>Each grid square has side length one unit. The boundary is measured in units; the covered region is measured in square units.</figcaption>
  </figure>;
  const rad = angle * Math.PI / 180;
  const end = { x: 200 + 120 * Math.cos(rad), y: 170 - 120 * Math.sin(rad) };
  const arc = { x: 200 + 45 * Math.cos(rad), y: 170 - 45 * Math.sin(rad) };
  const category = angle === 0 ? "zero" : angle < 90 ? "acute" : angle === 90 ? "right" : angle < 180 ? "obtuse" : angle === 180 ? "straight" : angle < 360 ? "reflex" : "full turn";
  return <figure>
    <svg viewBox="0 0 440 340" role="img" aria-label={`An anticlockwise turn of ${angle} degrees, measured from the horizontal ray: ${category} angle.`} style={{ width: "100%", maxWidth: 560 }}>
      <rect width="440" height="340" fill="#fffdf8" />
      <path d={`M335 170H200L${end.x} ${end.y}`} fill="none" stroke="#18784d" strokeWidth="4" />
      {angle === 360 ? <circle cx="200" cy="170" r="45" fill="none" stroke="#b87522" strokeWidth="3" /> : angle > 0 ? <path d={`M245 170A45 45 0 ${angle > 180 ? 1 : 0} 0 ${arc.x} ${arc.y}`} fill="none" stroke="#b87522" strokeWidth="3" /> : null}
      <circle cx="200" cy="170" r="4" /><text x="20" y="310" fontSize="16">The marked turn determines the angle.</text>
      <text x="20" y="332" fontSize="16">Reflex angles exceed 180 degrees.</text>
    </svg>
    <label>Turn angle: {angle}°<input aria-label="Turn angle" type="range" min="0" max="360" step="5" value={angle} onChange={(e) => { setAngle(Number(e.target.value)); onInteract?.(); }} /></label>
    <p role="status">{angle}° · {category}</p>
    <figcaption>The turn is measured anticlockwise from the fixed horizontal ray. Extending a ray does not change the angle.</figcaption>
  </figure>;
}
