import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Outfit, Pen, bodyFront } from "../bridge/toon";

export const MOONMARKET_FRAMES = 300;
const IDS = ["market-stall-94937d", "flower-bicycle-284d0e", "hot-air-balloon-a2a511", "flower-seller-s-hand-d617f9", "cobblestone-street-tile-c1dca2", "lamp-post-c9e409", "street-oil-lamp-d246ea", "oak-tree-50ee7c"];
type World = THREE.Group[];
const loadModels = async (): Promise<World> => {
  const loader = new GLTFLoader();
  return Promise.all(IDS.map(async id => (await loader.loadAsync(staticFile(`moonmarket/models/${id}.glb`))).scene));
};

const outfits: Outfit[] = [
  { jacket: "#287f83", pants: "#344052", boots: "#f2bd43", hat: "cap", cap: "#f3c344", belt: "#df9d3b", build: "kid" },
  { jacket: "#d76d59", pants: "#365743", boots: "#503b32", hat: "hair", hair: "#4a2d26", sash: "#e5c16a", build: "adult" },
  { jacket: "#f0e5cf", pants: "#59405c", boots: "#48372d", hat: "tall", cap: "#d9a436", belt: "#d6a542", buttons: "#d7ac54", build: "stout" },
];

const Actor: React.FC<{ id: number; frame: number }> = ({ id, frame }) => {
  const canvas = useMemo(() => document.createElement("canvas"), []);
  const texture = useMemo(() => { canvas.width = 600; canvas.height = 1000; const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t; }, [canvas]);
  const sec = frame / 30, gait = id === 0 ? 1.7 : id === 1 ? 1.18 : 1.35;
  const phase = ((sec * gait + id * 0.23) % 1 + 1) % 1;
  const p = new Pen(canvas.getContext("2d")!);
  bodyFront(p, outfits[id], { mode: "march", phase, expr: frame > 240 ? "laugh" : id === 0 ? "shock" : "nervous", facing: id === 0 ? 1 : -1, seed: 904 + id * 81, light: -2.1, lift: id === 1 ? 79 : 58, tilt: id === 2 ? 4 * Math.sin(sec * 6) : 1.8 * Math.sin(sec * gait * 6.28), headTilt: id === 2 ? 7 * Math.sin(sec * 5.2) : 2 * Math.sin(sec * 6) });
  // Character-specific, text-free costume marks make each silhouette readable at a glance.
  if (id === 0) { p.poly([[190, 515], [410, 515], [500, 740], [120, 740]], "#36a3a5", 7); p.band([[180, 694], [432, 694]], "#efd35f", 13, 3); }
  if (id === 1) { p.band([[205, 550], [420, 550]], "#f0c873", 18, 4); p.poly([[355, 565], [450, 580], [420, 690], [340, 682]], "#49724f", 5); }
  if (id === 2) { p.poly([[235, 382], [365, 382], [354, 270], [246, 270]], "#e6b952", 7); p.ell(300, 266, 52, 10, "#f8e8bf", 5); }
  texture.needsUpdate = true;
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), [texture]);
  const x = id === 0 ? 1.0 + 0.55 * Math.sin(sec * 2.6) : id === 1 ? -0.9 - 0.3 * Math.sin(sec * 2.1) : 0.05 + 0.45 * Math.sin(sec * 3.2 + 2.1);
  return <group position={[x, 0, id === 2 ? 2.5 : 4.5 + id * 0.3]}><mesh material={mat} position={[0, 1.42 + (id === 2 ? 0.04 * Math.sin(sec * 6) : 0), 0]} scale={[0.9, 1.5, 1]} rotation={[0, id === 0 ? -0.08 : 0.08, 0]}><planeGeometry args={[1, 1]} /></mesh></group>;
};

const Scene: React.FC<{ models: World; frame: number }> = ({ models, frame }) => {
  const { camera } = useThree();
  const sec = frame / 30;
  const scene = useMemo(() => {
    const root = new THREE.Group();
    const add = (i: number, pos: [number, number, number], scale: number, yaw = 0) => { const o = models[i].clone(true); o.position.set(...pos); o.scale.setScalar(scale); o.rotation.y = yaw; root.add(o); };
    // Original night-market layout: Polyfork stall, flower bicycle, vendor's cart and tiled lane.
    add(0, [-3.4, 0, -3], 1.5); add(0, [3.7, 0, -7], 1.35, Math.PI);
    add(1, [-2.9, 0, 1.8], 1.4, -0.25); add(3, [2.2, 0, -1.8], 1.3);
    add(5, [-6, 0, -4], 1.1); add(6, [5.5, 0, -5], 1.25); add(7, [6, 0, -9], 2.3);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(45, 42), new THREE.MeshStandardMaterial({ color: "#5b536b", roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.04, -3); root.add(floor);
    for (let x = -8; x <= 8; x += 3) { const lantern = new THREE.PointLight("#ffb86a", 23, 11, 2); lantern.position.set(x, 4.2, -5 + 1.5 * (x % 2)); root.add(lantern); }
    return root;
  }, [models]);
  // Continuous, deterministic crane/orbit from a broad night-market reveal into the caught balloon and three faces.
  const u = Math.min(1, sec / 10), eased = u * u * (3 - 2 * u);
  const reveal = sec < 2 ? 0.5 * (1 - Math.cos(Math.PI * sec / 2)) : sec < 8 ? 1 : 0.5 * (1 + Math.cos(Math.PI * (sec - 8) / 2));
  camera.position.set(-8 + 13 * eased + 0.55 * Math.sin(sec * 0.55), 7.2 - 2.0 * eased + 0.2 * Math.sin(sec * 0.8), 20 - 8.5 * eased);
  camera.lookAt(0.2 + 1.2 * eased, 3.5 + 3.3 * reveal, -2.3 - 1.0 * eased);
  const balloon = models[2].clone(true);
  balloon.position.set(-1.5 + 0.6 * Math.sin(sec * 2.1), 6.3 + 2.1 * Math.sin(Math.min(1, sec / 8) * Math.PI / 2) - Math.max(0, (sec - 7.6) * 1.15), -2.4);
  balloon.scale.setScalar(1.5); balloon.rotation.z = 0.09 * Math.sin(sec * 3.1);
  return <>
    <color attach="background" args={["#252b56"]} /><fog attach="fog" args={["#555372", 19, 48]} />
    <ambientLight intensity={0.85} color="#a5a3db" /><directionalLight position={[-5, 9, 6]} intensity={2.1} color="#ffe3b0" />
    <primitive object={scene} /><primitive object={balloon} />
    <Actor id={0} frame={frame} /><Actor id={1} frame={frame} /><Actor id={2} frame={frame} />
  </>;
};

export const MoonMarket: React.FC = () => {
  const frame = useCurrentFrame(); const [models, setModels] = useState<World | null>(null);
  const [handle] = useState(() => delayRender("Load original Moon Market Polyfork set"));
  useEffect(() => { loadModels().then(m => { setModels(m); continueRender(handle); }).catch(e => cancelRender(e)); }, [handle]);
  if (!models) return <AbsoluteFill style={{ background: "#252b56" }} />;
  return <>
    <Audio src={staticFile("audio/moonmarket.wav")} />
    <AbsoluteFill><ThreeCanvas width={1080} height={1920} camera={{ fov: 41, near: 0.1, far: 100 }} gl={{ antialias: true, powerPreference: "high-performance" }}><Scene models={models} frame={frame} /></ThreeCanvas></AbsoluteFill>
  </>;
};
