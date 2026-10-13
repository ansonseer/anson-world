"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

const BG = "#0a0d12";
const WARM = "#e0a866";
const COLD = "#6fa8d8";
const SEAM = "#e8f1ff";
const SIGNAL = "#57b8ad";

export interface LabProps {
  entering: boolean;
  onEntered: () => void;
  onRequestEnter: () => void;
  reducedMotion: boolean;
}

/* smooth 0..1 blend from a -1..1 oscillator */
function blend01(x: number) {
  const s = (x + 1) / 2;
  return s * s * (3 - 2 * s);
}

function easeInOut(x: number) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

/* The Subject's head: skin that cracks into machine, right half first.
   uProgress 0 → 1 moves the frontier across the face; cracks are Voronoi
   cell edges that glow in the signal colour. */
const CRACK_VERT = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const CRACK_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec3 uSkin;
  uniform vec3 uAlloy;
  uniform vec3 uGlow;
  varying vec3 vPos;
  varying vec3 vNormal;

  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453123);
  }
  vec2 voronoi(vec3 p) {
    vec3 n = floor(p);
    vec3 f = fract(p);
    float f1 = 8.0;
    float f2 = 8.0;
    for (int k = -1; k <= 1; k++)
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
      vec3 g = vec3(float(i), float(j), float(k));
      vec3 o = hash3(n + g);
      vec3 r = g + o - f;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
    }
    return vec2(sqrt(f1), sqrt(f2));
  }
  void main() {
    vec2 v = voronoi(vPos * 7.5);
    float edge = v.y - v.x;
    float crack = 1.0 - smoothstep(0.0, 0.055, edge);
    float jag = (hash3(floor(vPos * 11.0)).x - 0.5) * 0.16;
    // the frontier sweeps from the right edge of the face to the centre line — never past it:
    // at full progress exactly half the face is machine, the other half stays human
    float frontier = 0.27 - uProgress * 0.27;
    float x = vPos.x + jag;
    float mech = smoothstep(frontier - 0.04, frontier + 0.04, x);
    float leak = crack * smoothstep(frontier - 0.2, frontier + 0.02, x);

    vec3 L = normalize(vec3(0.55, 0.85, 0.9));
    float diff = 0.3 + 0.7 * max(dot(normalize(vNormal), L), 0.0);
    vec3 skin = uSkin * diff;
    float pulse = 0.7 + 0.3 * sin(uTime * 2.2);
    vec3 alloy = uAlloy * (0.25 + 0.75 * diff);
    vec3 mechCol = mix(alloy, uGlow * (0.8 + 0.6 * pulse), crack);

    vec3 col = mix(skin, mechCol, mech);
    col = mix(col, uGlow * pulse, leak * (1.0 - mech) * 0.85);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function useCrackMaterial() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uSkin: { value: new THREE.Color("#cbbfae") },
          uAlloy: { value: new THREE.Color("#8fa8bf") },
          uGlow: { value: new THREE.Color(SIGNAL) },
        },
        vertexShader: CRACK_VERT,
        fragmentShader: CRACK_FRAG,
      }),
    [],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return mat;
}

function Figure({
  variant,
  position,
  label,
  hint,
  onSelect,
}: {
  variant: "human" | "ai";
  position: [number, number, number];
  label: string;
  hint?: boolean;
  onSelect: (point: THREE.Vector3) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Mesh>(null);
  const headMat = useRef<THREE.MeshStandardMaterial>(null);
  const bodyMat = useRef<THREE.MeshStandardMaterial>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const hintMat = useRef<THREE.MeshBasicMaterial>(null);
  const crackMat = useCrackMaterial();
  const [hover, setHover] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hover]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = group.current;
    const h = head.current;
    if (!g || !h) return;

    if (variant === "human") {
      // the Observer at the monitoring station: works at the console,
      // then straightens up and studies the subject across the room
      const think = blend01(Math.sin(t * 0.13));
      g.scale.y = 1 + Math.sin(t * 1.25) * 0.007 + Math.sin(t * 0.41) * 0.004;
      g.position.x = position[0] + Math.sin(t * 0.23) * 0.04;
      g.rotation.y = 1.0 + Math.sin(t * 0.09) * 0.08;
      h.rotation.x = THREE.MathUtils.lerp(0.4, -0.06, think);
      h.rotation.y = THREE.MathUtils.lerp(0.1, 0.6, think) + Math.sin(t * 0.21) * 0.06;
      h.rotation.z = Math.sin(t * 0.19) * 0.03;
    } else {
      // the subject: metronome patrol, scanning head, pulsing core
      const phase = (t * 0.32) % 2;
      const tri = phase < 1 ? phase : 2 - phase;
      const dir = phase < 1 ? 1 : -1;
      g.position.x = 1.2 + tri * 1.6;
      g.position.y = Math.abs(Math.sin(t * 3.2)) * 0.02;
      const targetRot = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      g.rotation.y += (targetRot - g.rotation.y) * 0.07;
      h.rotation.y = Math.sin(t * 0.9) * 0.55;
      // becoming machine: 12s of spreading cracks, 5s fully split, 3s snapped back
      const ct = t % 20;
      let p = ct < 12 ? easeInOut(ct / 12) : ct < 17 ? 1 : 1 - (ct - 17) / 3;
      if (hover) p = 1;
      crackMat.uniforms.uProgress.value += (p - crackMat.uniforms.uProgress.value) * 0.12;
      crackMat.uniforms.uTime.value = t;
      if (coreMat.current)
        coreMat.current.emissiveIntensity =
          0.2 + p * 1.3 + Math.sin(t * 2.0) * 0.3 * p;
    }

    // hover glow on the body (the Subject keeps a faint cold sheen so its form reads in the dark)
    if (bodyMat.current) {
      const target = hover ? 0.3 : variant === "ai" ? 0.04 : 0;
      bodyMat.current.emissiveIntensity +=
        (target - bodyMat.current.emissiveIntensity) * 0.15;
    }
    // pulsing floor hint under the enterable figure
    if (hintMat.current) {
      hintMat.current.opacity = hover ? 0.55 : 0.16 + blend01(Math.sin(t * 1.4)) * 0.18;
    }
  });

  const human = variant === "human";
  // the Observer wears the lab coat; the Subject wears the grey hoodie from the reference photo —
  // the machine shows only where the face cracks
  const bodyColor = human ? "#d8d2c6" : "#b3afa8";
  const rough = human ? 0.92 : 0.95;
  const metal = 0.02;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(e.point.clone());
  };
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(true);
  };
  const out = () => setHover(false);

  return (
    <group ref={group} position={position}>
      {/* body grounded: capsule bottom sits on the floor */}
      <mesh
        position={[0, 0.82, 0]}
        castShadow
        onClick={handleClick}
        onPointerOver={over}
        onPointerOut={out}
      >
        <capsuleGeometry args={[0.3, 1.02, 8, 20]} />
        <meshStandardMaterial
          ref={bodyMat}
          color={bodyColor}
          roughness={rough}
          metalness={metal}
          emissive={human ? WARM : COLD}
          emissiveIntensity={0}
        />
      </mesh>
      {/* the chest core from D-final: a soft blue heart of light in the alloy */}
      {!human && (
        <mesh position={[0, 1.18, 0.27]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            ref={coreMat}
            color="#8fd0ff"
            emissive="#4fa8ff"
            emissiveIntensity={1.3}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
      )}
      {human ? (
        <mesh
          ref={head}
          position={[0, 1.78, 0]}
          onClick={handleClick}
          onPointerOver={over}
          onPointerOut={out}
        >
          <sphereGeometry args={[0.21, 32, 32]} />
          <meshStandardMaterial ref={headMat} color="#cbbfae" roughness={0.75} metalness={0} />
        </mesh>
      ) : (
        <mesh
          ref={head}
          position={[0, 1.78, 0]}
          material={crackMat}
          onClick={handleClick}
          onPointerOver={over}
          onPointerOut={out}
        >
          <sphereGeometry args={[0.21, 48, 48]} />
        </mesh>
      )}

      {hint && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
          <ringGeometry args={[0.55, 0.6, 48]} />
          <meshBasicMaterial ref={hintMat} color={WARM} transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}

      {hover && (
        <Html position={[0, 2.3, 0]} center distanceFactor={7} style={{ pointerEvents: "none" }}>
          <div className="font-lab whitespace-nowrap rounded-sm border border-[var(--seam)]/40 bg-black/60 px-3 py-1.5 text-[11px] tracking-[0.25em] text-[var(--text)] backdrop-blur-sm">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

/* touch-ripple feedback at the click point */
function ShockRing({ pos, onDone }: { pos: [number, number, number]; onDone: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const t0 = useRef<number | null>(null);
  useFrame(({ clock, camera }) => {
    if (t0.current === null) t0.current = clock.elapsedTime;
    const k = (clock.elapsedTime - t0.current) / 0.7;
    if (k >= 1) {
      onDone();
      return;
    }
    if (ref.current) {
      ref.current.scale.setScalar(0.2 + k * 1.1);
      ref.current.lookAt(camera.position);
    }
    if (mat.current) mat.current.opacity = 0.85 * (1 - k);
  });
  return (
    <mesh ref={ref} position={pos}>
      <ringGeometry args={[0.42, 0.5, 48]} />
      <meshBasicMaterial ref={mat} color={SEAM} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* procedurally drawn monitor content: a teal humanoid scan + data rows,
   after the locked B-1 key art (assets/refs/B1-final.png) */
function useScanTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 320;
    const g = c.getContext("2d")!;
    g.fillStyle = "#081210";
    g.fillRect(0, 0, 512, 320);
    g.strokeStyle = "rgba(87,184,173,0.10)";
    g.lineWidth = 1;
    for (let x = 0; x <= 512; x += 32) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 320);
      g.stroke();
    }
    for (let y = 0; y <= 320; y += 32) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(512, y);
      g.stroke();
    }
    // scan panel frame
    g.strokeStyle = "rgba(87,184,173,0.35)";
    g.strokeRect(96, 24, 208, 272);
    // the humanoid
    g.save();
    g.translate(200, 168);
    g.strokeStyle = "#57b8ad";
    g.shadowColor = "#57b8ad";
    g.shadowBlur = 14;
    g.lineWidth = 2.5;
    g.beginPath();
    g.arc(0, -96, 15, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(0, -78);
    g.lineTo(0, -18);
    g.moveTo(-28, -66);
    g.lineTo(28, -66);
    g.moveTo(-28, -66);
    g.lineTo(-36, -6);
    g.moveTo(28, -66);
    g.lineTo(36, -6);
    g.moveTo(0, -18);
    g.lineTo(-19, 78);
    g.moveTo(0, -18);
    g.lineTo(19, 78);
    g.stroke();
    g.restore();
    // data rows on the right
    g.shadowBlur = 0;
    for (let i = 0; i < 10; i++) {
      g.fillStyle = i % 3 === 0 ? "rgba(143,168,191,0.55)" : "rgba(87,184,173,0.5)";
      g.fillRect(328, 40 + i * 25, 56 + ((i * 53) % 100), 6);
    }
    // header ticks
    g.fillStyle = "rgba(232,241,255,0.4)";
    for (let i = 0; i < 12; i++) g.fillRect(20 + i * 40, 10, 18, 4);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/* the monitoring station: its screen faces the subject on the right,
   casting signal-teal light onto the pacing figure */
function ObservationStation() {
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);
  const scanTex = useScanTexture();
  useFrame(({ clock }) => {
    if (screenMat.current) {
      const t = clock.elapsedTime;
      screenMat.current.emissiveIntensity =
        0.85 + Math.sin(t * 1.7) * 0.12 + Math.sin(t * 7.3) * 0.06;
    }
  });
  const glowTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(2.0, 1.2, 0);
    return o;
  }, []);
  const legPositions: [number, number, number][] = [
    [0.26, 0.48, 0.62],
    [-0.26, 0.48, 0.62],
    [0.26, 0.48, -0.62],
    [-0.26, 0.48, -0.62],
  ];
  return (
    <group position={[-1.0, 0, 0.35]} rotation={[0, -0.7, 0]}>
      {/* desk runs front-to-back; angled so the audience sees the scan too */}
      <mesh position={[0, 0.98, 0]} castShadow>
        <boxGeometry args={[0.7, 0.06, 1.5]} />
        <meshStandardMaterial color="#2a323d" roughness={0.5} metalness={0.6} />
      </mesh>
      {legPositions.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.06, 0.96, 0.06]} />
          <meshStandardMaterial color="#20262f" roughness={0.6} metalness={0.5} />
        </mesh>
      ))}
      {/* stand + panel, display side pointing right (+x) */}
      <mesh position={[0, 1.22, 0]}>
        <boxGeometry args={[0.06, 0.42, 0.06]} />
        <meshStandardMaterial color="#252c36" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.64, 0]} castShadow>
        <boxGeometry args={[0.07, 0.82, 1.24]} />
        <meshStandardMaterial color="#1a2028" roughness={0.45} metalness={0.65} />
      </mesh>
      <mesh position={[0.045, 1.64, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.14, 0.72]} />
        <meshStandardMaterial
          ref={screenMat}
          color="#0c1512"
          map={scanTex}
          emissive="#ffffff"
          emissiveMap={scanTex}
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* small readout on the observer's side */}
      <mesh position={[-0.041, 1.35, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 0.34]} />
        <meshStandardMaterial color="#0e1310" emissive={WARM} emissiveIntensity={0.22} />
      </mesh>
      <primitive object={glowTarget} />
      <spotLight
        position={[0.2, 1.64, 0]}
        target={glowTarget}
        color={SIGNAL}
        intensity={1.1}
        angle={0.62}
        penumbra={1}
        decay={0}
      />
    </group>
  );
}

/* the porthole specimen lamp from B-1: hanging cylinder lamp, warm light
   column through the fog, pedestal with a gridded globe underneath */
function SpecimenLamp() {
  return (
    <group position={[-3.6, 0, -1.6]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 3.7, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.3, 8]} />
        <meshStandardMaterial color="#1a2028" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.75, 0]}>
        <cylinderGeometry args={[0.55, 0.62, 0.7, 24]} />
        <meshStandardMaterial color="#2a323d" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 24]} />
        <meshBasicMaterial color="#f2e8d8" />
      </mesh>
      {/* fake volumetric light column */}
      <mesh position={[0, 1.55, 0]}>
        <coneGeometry args={[0.85, 1.7, 24, 1, true]} />
        <meshBasicMaterial
          color="#f2e0c0"
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 1.1, 24]} />
        <meshStandardMaterial color="#222933" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.32, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color="#8fa8bf"
          metalness={0.6}
          roughness={0.3}
          emissive={SIGNAL}
          emissiveIntensity={0.08}
        />
      </mesh>
      <pointLight position={[0, 2.2, 0]} color="#f2e0c0" intensity={1.3} distance={5} decay={0} />
    </group>
  );
}

function BackgroundBench() {
  return (
    <group position={[-5.8, 0, -2.8]} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[2.0, 0.07, 0.85]} />
        <meshStandardMaterial color="#232a34" roughness={0.6} metalness={0.5} />
      </mesh>
      {(
        [
          [-0.9, 0.45, 0.32],
          [0.9, 0.45, 0.32],
          [-0.9, 0.45, -0.32],
          [0.9, 0.45, -0.32],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.07, 0.9, 0.07]} />
          <meshStandardMaterial color="#1c222b" roughness={0.65} metalness={0.5} />
        </mesh>
      ))}
      <mesh position={[-0.55, 1.06, 0.1]}>
        <cylinderGeometry args={[0.09, 0.09, 0.22, 16]} />
        <meshStandardMaterial color="#333d49" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[-0.82, 1.04, -0.12]}>
        <boxGeometry args={[0.24, 0.16, 0.18]} />
        <meshStandardMaterial color="#3d4754" roughness={0.45} metalness={0.6} />
      </mesh>
    </group>
  );
}

function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[26, 64]} />
        <meshStandardMaterial color="#0b0e13" roughness={0.95} />
      </mesh>
      <gridHelper args={[44, 52, "#1d2732", "#121924"]} position={[0, 0.004, 0]} />
      <mesh position={[0, 3.5, -5.2]}>
        <planeGeometry args={[30, 8]} />
        <meshStandardMaterial color="#0c1016" roughness={1} />
      </mesh>
      <mesh position={[3.4, 2.2, -5.1]}>
        <planeGeometry args={[2.6, 1.5]} />
        <meshBasicMaterial color={SIGNAL} transparent opacity={0.07} />
      </mesh>
      <mesh position={[-3.4, 2.2, -5.1]}>
        <planeGeometry args={[2.6, 1.5]} />
        <meshBasicMaterial color={WARM} transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

/* the stage is cut in two: a line of light down the middle, warm floor on the
   Observer's side, cold floor on the Subject's */
function Divider() {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (mat.current) mat.current.opacity = 0.55 + Math.sin(t * 1.1) * 0.2;
    if (light.current) light.current.intensity = 0.8 + Math.sin(t * 1.1) * 0.2;
  });
  return (
    <group>
      <mesh position={[0, 1.7, -0.4]}>
        <boxGeometry args={[0.014, 3.4, 0.014]} />
        <meshBasicMaterial ref={mat} color={SEAM} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, 14]} />
        <meshBasicMaterial color={SEAM} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <pointLight ref={light} position={[0, 1.9, 0.3]} color={SEAM} intensity={0.9} distance={5} decay={0} />
      <mesh position={[-10, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 30]} />
        <meshBasicMaterial color={WARM} transparent opacity={0.035} depthWrite={false} />
      </mesh>
      <mesh position={[10, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 30]} />
        <meshBasicMaterial color={COLD} transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Dust() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = Math.random() * 4.2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    return arr;
  }, []);
  useFrame(({ clock }) => {
    if (points.current) points.current.rotation.y = clock.elapsedTime * 0.012;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#9fb4c8" transparent opacity={0.3} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Lights() {
  const humanTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-2.2, 1.1, 0.5);
    return o;
  }, []);
  const aiTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(2.0, 1.1, 0);
    return o;
  }, []);
  return (
    <group>
      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#2c3844", "#05070a", 0.5]} />
      {/* soft audience-side fill so silhouettes read */}
      <pointLight position={[0, 2.5, 6]} color="#8fa8bf" intensity={0.35} distance={12} decay={0} />
      <primitive object={humanTarget} />
      <primitive object={aiTarget} />
      {/* the subject is the hero: brighter key + cool rim */}
      <spotLight
        position={[5, 4.5, 3]}
        target={aiTarget}
        angle={0.55}
        penumbra={1}
        color={COLD}
        intensity={3.4}
        decay={0}
        castShadow
      />
      <pointLight position={[3.2, 2.6, -2.6]} color="#9fc0e8" intensity={0.7} distance={9} decay={0} />
      {/* the observer sits in a quieter warm pool */}
      <spotLight
        position={[-3.4, 4, 2.4]}
        target={humanTarget}
        angle={0.5}
        penumbra={1}
        color={WARM}
        intensity={2.3}
        decay={0}
        castShadow
      />
    </group>
  );
}

function CameraRig({ entering, onEntered, reducedMotion }: Omit<LabProps, "onRequestEnter">) {
  const { camera, pointer, size } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  const restZ = aspect < 0.8 ? 8.6 : aspect < 1 ? 8.2 : aspect < 1.2 ? 6.8 : 5.4;
  // bisected stage: camera dead centre, the seam is the axis
  const lookX = 0;
  const baseX = 0;
  const baseZ = useRef(reducedMotion ? restZ : restZ + 1.6);
  const done = useRef(false);
  // entering = flying into the Observer's head
  const enterTarget = useMemo(() => new THREE.Vector3(-2.2, 1.78, 0.52), []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (entering) {
      camera.position.lerp(enterTarget, 1 - Math.pow(0.0018, d));
      camera.lookAt(2.5, 1.5, 0);
      if (!done.current && camera.position.distanceTo(enterTarget) < 0.35) {
        done.current = true;
        onEntered();
      }
      return;
    }
    baseZ.current = THREE.MathUtils.damp(baseZ.current, restZ, 0.55, d);
    const px = reducedMotion ? 0 : pointer.x;
    const py = reducedMotion ? 0 : pointer.y;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, baseX + px * 0.55, 2.2, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.52 + py * 0.2, 2.2, d);
    camera.position.z = baseZ.current;
    camera.lookAt(lookX, 1.28, 0);
  });
  return null;
}

function SceneContent({ entering, onEntered, onRequestEnter, reducedMotion }: LabProps) {
  const [rings, setRings] = useState<{ id: number; pos: [number, number, number] }[]>([]);

  const select = (point: THREE.Vector3) => {
    setRings((r) => [...r, { id: Date.now() + Math.random(), pos: [point.x, point.y, point.z] }]);
    onRequestEnter();
  };

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 8.5, 22]} />
      <CameraRig entering={entering} onEntered={onEntered} reducedMotion={reducedMotion} />
      <Lights />
      <Room />
      <Divider />
      <BackgroundBench />
      <SpecimenLamp />
      <ObservationStation />
      <Figure
        variant="human"
        position={[-2.2, 0, 0.5]}
        label="ENTER THE OBSERVER"
        hint
        onSelect={select}
      />
      <Figure variant="ai" position={[2.0, 0, 0]} label="THE SUBJECT — ANSON, BECOMING MACHINE" onSelect={select} />
      {rings.map((r) => (
        <ShockRing
          key={r.id}
          pos={r.pos}
          onDone={() => setRings((rs) => rs.filter((x) => x.id !== r.id))}
        />
      ))}
      <Dust />
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.5}
        scale={16}
        blur={2.2}
        far={4}
        resolution={512}
        color="#000000"
      />
    </>
  );
}

export default function Lab(props: LabProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [-0.35, 1.52, 6.8], fov: 45 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
