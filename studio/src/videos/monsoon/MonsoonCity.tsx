// Original Monsoon City story adaptation: detailed Three.js port, original animated cast and word-synced captions.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Outfit, Pen, bodyFront } from "../bridge/toon";
import { WORDS } from "./words";

export const MONSOON_FRAMES = 1930;
const ASSETS = ["market-stall-94937d", "flower-bicycle-284d0e", "cobblestone-street-tile-c1dca2", "lamp-post-c9e409", "street-oil-lamp-d246ea", "oak-tree-50ee7c", "shovel-997c4d", "drain-grate-tile-5568d9"];
type Kit = THREE.Group[];
const load = async (): Promise<Kit> => { const l = new GLTFLoader(); return Promise.all(ASSETS.map(async id => (await l.loadAsync(staticFile(`monsoon/models/${id}.glb`))).scene)); };

const outfits: Outfit[] = [
  { jacket: "#224b76", pants: "#b77932", boots: "#49382b", sash: "#d8b86a", skin: "#bd7954", hat: "cap", cap: "#e8bd53", build: "adult" }, // Ilan: indigo work jacket, ochre trousers, wrapped turban
  { jacket: "#711f47", pants: "#45273b", boots: "#594231", sash: "#e0bc59", buttons: "#f0d27b", moustache: "#33221f", skin: "#d89a70", hat: "tophat", build: "stout" },
  { jacket: "#176c68", pants: "#57463a", boots: "#47372e", belt: "#a77a3a", buttons: "#dbc178", moustache: "#89857c", skin: "#dfb18b", hat: "hair", hair: "#302820" },
  { jacket: "#c24d3d", pants: "#3d4a51", boots: "#463629", dress: "#c97948", skin: "#8e563d", hat: "bonnet", cap: "#e4ad51" },
  { jacket: "#557940", pants: "#8a6344", boots: "#51402f", sash: "#d7b758", skin: "#e4bc91", hat: "cap", cap: "#376b8a", build: "stout" },
];

const Actor: React.FC<{ id: number; frame: number; x: number; z: number; scale?: number }> = ({ id, frame, x, z, scale = 1 }) => {
  const canvas = useMemo(() => document.createElement("canvas"), []);
  const texture = useMemo(() => { canvas.width = 600; canvas.height = 1000; const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t; }, [canvas]);
  const sec = frame / 30, phase = ((sec * (id === 0 ? 1.8 : 1.1) + id * .22) % 1 + 1) % 1;
  const p = new Pen(canvas.getContext("2d")!);
  const face: "neutral" | "shock" | "laugh" | "stern" | "nervous" | "smile" = id === 1 ? (frame > 760 ? "shock" : frame > 710 ? "laugh" : "smile") : id === 0 ? (frame > 1000 && frame < 1340 ? "stern" : frame > 450 && frame < 700 ? "nervous" : "neutral") : id === 2 ? "neutral" : id === 3 ? "shock" : "smile";
  bodyFront(p, outfits[id], { mode: id === 0 && frame > 1100 && frame < 1340 ? "march" : "stand", phase, expr: face, seed: 731 + id * 117, facing: id % 2 ? -1 : 1, light: -2.1, lift: 62, tilt: id === 0 && frame > 1100 ? -6 : 1.2 * Math.sin(sec * 1.4 + id), headTilt: 2 * Math.sin(sec * 1.7 + id) });
  // Story-specific handcrafted costume details: rain cape seam + cleaner's brass badge, mayor's broad sash, engineer's tool satchel.
  if (id === 0) { p.poly([[182, 520], [416, 520], [458, 754], [142, 754]], "#315b79", 7); p.band([[178, 684], [426, 684]], "#9b6740", 18, 4); p.ell(372, 590, 22, 22, "#e5c15d", 5); p.ell(372, 590, 9, 9, "#315b79", 2); }
  if (id === 1) { p.band([[170, 540], [438, 540]], "#d5aa49", 25, 5); p.poly([[390, 548], [440, 550], [468, 720], [401, 701]], "#eee0bd", 5); }
  if (id === 2) { p.poly([[350, 566], [468, 576], [455, 741], [354, 718]], "#99623b", 7); p.band([[194, 666], [416, 666]], "#d2ad56", 10, 2); }
  texture.needsUpdate = true;
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .35, side: THREE.DoubleSide }), [texture]);
  const bob = id === 0 && frame > 540 && frame < 635 ? Math.abs(Math.sin(sec * 10)) * .12 : .018 * Math.sin(sec * 3 + id);
  return <group position={[x + .08 * Math.sin(sec * (1 + id * .2) + id), 0, z]} scale={scale}><mesh material={mat} position={[0, 1.48 + bob, 0]} scale={[.94, 1.62, 1]} rotation={[0, id % 2 ? -.08 : .08, .012 * Math.sin(sec * 2 + id)]}><planeGeometry args={[1, 1]} /></mesh></group>;
};

const Scene: React.FC<{ kit: Kit; frame: number }> = ({ kit, frame }) => {
  const { camera } = useThree(); const sec = frame / 30;
  const world = useMemo(() => {
    const root = new THREE.Group();
    const model = (i: number, x: number, y: number, z: number, s: number, yaw = 0) => { const o = kit[i].clone(true); o.position.set(x, y, z); o.scale.setScalar(s); o.rotation.y = yaw; root.add(o); };
    // Quayside bazaar: repeated architectural rhythm and layered Polyfork market assets.
    for (let i = -4; i <= 5; i++) { model(0, i * 5.3, 0, -8.8, 1.5 + (i % 2) * .1, i % 2 ? Math.PI : 0); model(3, i * 5.4 - 2.5, 0, -4.5, 1.15); model(4, i * 5.5 + 2.5, 0, -9, 1.15); }
    for (let i = -4; i <= 4; i++) { model(5, i * 8, 0, -18, 2.3); model(2, i * 7, -.12, 3, 2.2); }
    model(1, -6, 0, 1, 1.35); model(1, 8, 0, -3, 1.2, Math.PI / 2);
    model(6, 29, .15, 6, 1.5, Math.PI / 2); model(7, 3, -.02, 6.55, 1.6, Math.PI / 2);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 75, 1, 1), new THREE.MeshStandardMaterial({ color: "#796f60", roughness: .9 })); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.18, -4); root.add(ground);
    // Raised ghat terraces, masonry shop fronts, timber walkways and a deep brick overflow tunnel.
    for (let i = 0; i < 8; i++) { const step = new THREE.Mesh(new THREE.BoxGeometry(100, .34, 1.5), new THREE.MeshStandardMaterial({ color: i % 2 ? "#a99b83" : "#786b5c", roughness: .85 })); step.position.set(0, -.1 - i * .08, 4 + i * 1.4); root.add(step); }
    for (let i = -3; i <= 3; i++) { const x = i * 12; const building = new THREE.Mesh(new THREE.BoxGeometry(9, 7 + (i % 2) * .7, 2), new THREE.MeshStandardMaterial({ color: ["#c79c6d", "#b66e50", "#d2b98b"][Math.abs(i) % 3], roughness: .9 })); building.position.set(x, 3.5, -19); root.add(building); const roof = new THREE.Mesh(new THREE.ConeGeometry(6.3, 2.2, 4), new THREE.MeshStandardMaterial({ color: "#8c4938", roughness: .8 })); roof.position.set(x, 8, -19); roof.rotation.y = Math.PI / 4; root.add(roof); }
    const canal = new THREE.Mesh(new THREE.PlaneGeometry(95, 12), new THREE.MeshPhysicalMaterial({ color: "#355d70", roughness: .22, metalness: .08, transparent: true, opacity: .88 })); canal.rotation.x = -Math.PI / 2; canal.position.set(5, -.55, 13); root.add(canal);
    // Detailed sewer mouth with iron bars / stone cheeks; the camera dives through it on the mechanism beat.
    const stone = new THREE.MeshStandardMaterial({ color: "#8a7761", roughness: .92 }), iron = new THREE.MeshStandardMaterial({ color: "#343838", metalness: .72, roughness: .32 });
    for (const x of [-1.5, 1.5]) { const cheek = new THREE.Mesh(new THREE.BoxGeometry(.35, 2.5, .6), stone); cheek.position.set(3 + x, .55, 7); root.add(cheek); }
    for (let i = 0; i < 8; i++) { const bar = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 2.1, 8), iron); bar.position.set(1.75 + i * .35, .6, 6.72); root.add(bar); }
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.5, .18, 8, 24, Math.PI), stone); arch.position.set(3, 1.45, 6.8); root.add(arch);
    const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 18, 12, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: "#6a5140", side: THREE.DoubleSide, roughness: 1 })); tunnel.rotation.z = Math.PI / 2; tunnel.position.set(-6, -1.1, 6.9); root.add(tunnel);
    // Old overflow sluice and downhill open channel toward the river.
    const gate = new THREE.Group(); for (let i = 0; i < 6; i++) { const plank = new THREE.Mesh(new THREE.BoxGeometry(3.1, .16, .13), iron); plank.position.y = i * .43; gate.add(plank); } gate.position.set(28, -.05, 7); root.add(gate);
    const shovel = kit[6].clone(true); shovel.position.set(25.5, .15, 7); shovel.scale.setScalar(1.2); shovel.rotation.z = -.7; root.add(shovel);
    const trench = new THREE.Mesh(new THREE.BoxGeometry(56, .12, 2.5), new THREE.MeshStandardMaterial({ color: "#584a3c", roughness: .9 })); trench.position.set(57, -.35, 7); root.add(trench);
    for (const z of [5.65, 8.35]) { const bank = new THREE.Mesh(new THREE.BoxGeometry(57, .75, .25), stone); bank.position.set(57, .05, z); root.add(bank); }
    for (let i = 0; i < 7; i++) { const splash = new THREE.Mesh(new THREE.ConeGeometry(.26 + (i % 3) * .12, .8 + (i % 2) * .55, 6), new THREE.MeshBasicMaterial({ color: "#8bc7d4", transparent: true, opacity: .78 })); splash.position.set(92 + (i % 3) * .55, .45 + (i % 2) * .55, 7 + (i - 3) * .34); splash.rotation.z = Math.PI; root.add(splash); }
    return root;
  }, [kit]);
  // Named camera beats: aerial bazaar reveal → rain-street skim → sewer macro fly-through → palace confrontation → flood orbit → sluice-to-river chase → dawn tableau.
  let pos: THREE.Vector3, look: THREE.Vector3, fov = 42;
  const ease = (a: number, b: number) => { const u = Math.max(0, Math.min(1, (frame - a) / (b - a))); return u * u * (3 - 2 * u); };
  if (frame < 296) { const u = ease(0, 296); pos = new THREE.Vector3(-24 + u * 19, 24 - u * 16, 32 - u * 14); look = new THREE.Vector3(-2 + u * 7, 1 + u * .2, 1 + u * 9); fov = 48 - 10 * u; }
  else if (frame < 560) { const u = ease(296, 560); pos = new THREE.Vector3(8 - 20 * u, 2.8 - 3.0 * u, 9 - 1.4 * u); look = new THREE.Vector3(3 - 24 * u, 1.0 - 2.5 * u, 7); fov = 38 + 16 * u; }
  else if (frame < 900) { const u = ease(560, 900); pos = new THREE.Vector3(12 + 27 * u, 3.8 + 1.1 * u, 15 - 1.5 * u); look = new THREE.Vector3(13 + 28 * u, 1.3 + 1.4 * u, 10); fov = 40; }
  else if (frame < 1140) { const u = ease(900, 1140); pos = new THREE.Vector3(17 - 22 * u, 9 + 2 * u, 24 - 12 * u); look = new THREE.Vector3(0, 2.8 + 2 * u, 5 + 7 * u); fov = 50; }
  else if (frame < 1340) { const u = ease(1140, 1340); pos = new THREE.Vector3(34 + 57 * u, 3.2 + 2.5 * u, 13 - 7 * u); look = new THREE.Vector3(30 + 62 * u, .4, 7); fov = 38; }
  else if (frame < 1690) { const u = ease(1340, 1690); pos = new THREE.Vector3(82 - 48 * u, 7 - 3 * u, 24 - 12 * u); look = new THREE.Vector3(8 + 15 * u, .9 + .7 * u, 8 + 2 * u); fov = 43; }
  else { const u = ease(1690, 1930); pos = new THREE.Vector3(37 - 11 * u, 4.4 - 1.2 * u, 18 - 3 * u); look = new THREE.Vector3(29 - 4 * u, 1.5, 10); fov = 42; }
  camera.position.copy(pos).add(new THREE.Vector3(.1 * Math.sin(sec * .5), .07 * Math.sin(sec * .7), 0)); camera.lookAt(look); (camera as THREE.PerspectiveCamera).fov = fov; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  const rainOn = frame >= 164 && frame < 1340 ? 1 : 0;
  return <><color attach="background" args={[frame > 900 && frame < 1340 ? "#25334a" : frame > 1340 ? "#d59b77" : "#9cb9c3"]} /><fog attach="fog" args={[frame > 900 && frame < 1340 ? "#45556a" : "#b2c5c4", 32, 128]} />
    <ambientLight intensity={frame > 900 && frame < 1340 ? .42 : .8} color={frame > 900 && frame < 1340 ? "#9ab3e2" : "#f6dfc2"} /><directionalLight position={[-20, 32, 14]} intensity={frame > 900 && frame < 1340 ? 1.05 : 2.1} color={frame > 900 && frame < 1340 ? "#adc6ff" : "#ffdfa9"} castShadow />
    <primitive object={world} />
    {Array.from({ length: 90 }, (_, i) => { const x = ((i * 37) % 67) - 27, z = ((i * 19) % 43) - 16, y = 9 + ((i * 13) % 17); return <mesh key={i} position={[x + .2 * Math.sin(sec * 3 + i), y - (rainOn ? (sec * 15 + i * 1.7) % 13 : 100), z]}><cylinderGeometry args={[.012, .012, .48, 4]} /><meshBasicMaterial color="#c1d9e4" transparent opacity={rainOn ? .5 : 0} /></mesh>; })}
    <Actor id={0} frame={frame} x={-2.2 + (frame > 560 && frame < 635 ? (frame - 560) * .12 : 0)} z={8.8} scale={1.05} />
    <Actor id={1} frame={frame} x={17.2} z={-13.5} scale={1.16} /><Actor id={2} frame={frame} x={13.8} z={-11.8} scale={1.03} />
    <Actor id={3} frame={frame} x={-7} z={12} scale={.92} /><Actor id={4} frame={frame} x={7} z={12.5} scale={.93} />
  </>;
};

const Captions: React.FC = () => {
  const f = useCurrentFrame(); const sec = f / 30;
  const word = WORDS.find(w => sec >= w.start && sec < w.end)?.text ?? "";
  const [ready, setReady] = useState(false); const [h] = useState(() => delayRender("load caption font"));
  useEffect(() => { const font = new FontFace("Lilita One", `url("${staticFile("fonts/LilitaOne-Regular.ttf")}")`); font.load().then(face => { (document.fonts as unknown as Set<FontFace>).add(face); setReady(true); continueRender(h); }).catch(cancelRender); }, [h]);
  if (!ready || !word) return null;
  const age = Math.min(1, Math.max(0, (sec - (WORDS.find(w => w.text === word && sec >= w.start && sec < w.end)?.start ?? sec)) * 30 / 5));
  const pop = .9 + .1 * age + .04 * Math.sin(Math.PI * age);
  return <div style={{ position: "absolute", top: "75.52%", left: 40, right: 40, textAlign: "center", transform: `translateY(-50%) scale(${pop})`, transformOrigin: "50% 50%", color: "#fbf7ef", fontFamily: "Lilita One", fontSize: 176, lineHeight: 1, letterSpacing: "-0.01em", whiteSpace: "nowrap", WebkitTextStroke: "13px #17161d", paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(23,22,29,0.28)" }}>{word}</div>;
};

export const MonsoonCity: React.FC = () => {
  const frame = useCurrentFrame(); const [kit, setKit] = useState<Kit | null>(null); const [h] = useState(() => delayRender("load Monsoon Polyfork set"));
  useEffect(() => { load().then(v => { setKit(v); continueRender(h); }).catch(cancelRender); }, [h]);
  if (!kit) return <AbsoluteFill style={{ background: "#9cb9c3" }} />;
  return <AbsoluteFill><ThreeCanvas width={1080} height={1920} camera={{ fov: 42, near: .1, far: 400 }} gl={{ antialias: true, powerPreference: "high-performance" }}><Scene kit={kit} frame={frame} /></ThreeCanvas><Captions /><Audio src={staticFile("audio/monsoon-voice.wav")} /></AbsoluteFill>;
};
