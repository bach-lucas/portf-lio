'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DIVE } from './opening'

/** Escrito pela abertura no clique e lido a cada quadro: instante (performance.now, em s) do início do mergulho; -1 antes disso. */
export type Dive = { start: number }

const RADIUS = 1.35
const SHARDS = 26
const CAMERA_Z = 7

const vertexShader = `
  attribute vec4 aShard;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uPx;
  uniform float uImplode;
  uniform float uBlast;
  uniform vec2 uShift;
  varying float vAlpha;
  void main() {
    // cada fragmento se solta da casca de tempos em tempos e volta devagar
    float peel = pow(max(0.0, sin(uTime * 0.45 + aShard.w * 6.2831)), 6.0);
    vec3 p = position + aShard.xyz * peel * (0.5 + aSeed * 0.7);
    p += 0.015 * vec3(sin(uTime * 1.3 + aSeed * 50.0), cos(uTime * 1.1 + aSeed * 70.0), sin(uTime * 1.7 + aSeed * 30.0));
    p *= 1.0 - 0.9 * uImplode;
    p += normalize(position + 1e-4) * uBlast * (2.0 + 10.0 * aSeed);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // erro de cor: cada canal é desenhado deslocado na tela, e as bordas se separam em vermelho e azul
    gl_Position.xy += uShift * gl_Position.w;
    gl_PointSize = min(uSize * uPx * (0.6 + aSeed) * (6.0 / max(0.2, -mv.z)), 24.0);
    vAlpha = 0.45 + 0.55 * fract(aSeed * 13.7);
  }
`

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(uColor, vAlpha * smoothstep(0.5, 0.15, r));
  }
`

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Esfera granulada: a maior parte dos pontos na casca, dividida em fragmentos; o resto preenche o miolo. */
function sphereGeometry(n: number) {
  let s = 11
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647
  const unit = (): [number, number, number] => {
    const z = r() * 2 - 1
    const t = r() * Math.PI * 2
    const q = Math.sqrt(1 - z * z)
    return [q * Math.cos(t), z, q * Math.sin(t)]
  }
  const centers = Array.from({ length: SHARDS }, unit)
  const pos = new Float32Array(n * 3)
  const shard = new Float32Array(n * 4)
  const seed = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const u = unit()
    const radius = i % 4 === 0 ? RADIUS * Math.cbrt(r()) : RADIUS * (1 + (r() - 0.5) * 0.04)
    pos.set([u[0] * radius, u[1] * radius, u[2] * radius], i * 3)
    let best = 0
    let dot = -2
    centers.forEach((c, k) => {
      const d = c[0] * u[0] + c[1] * u[1] + c[2] * u[2]
      if (d > dot) {
        dot = d
        best = k
      }
    })
    shard.set([...centers[best], best / SHARDS], i * 4)
    seed[i] = r()
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aShard', new THREE.BufferAttribute(shard, 4))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  return g
}

function ringGeometry(rx: number, rz: number) {
  const points = Array.from({ length: 160 }, (_, i) => {
    const a = (i / 160) * Math.PI * 2
    return new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz)
  })
  return new THREE.BufferGeometry().setFromPoints(points)
}

const RINGS: { rx: number; rz: number; tilt: [number, number, number]; speed: number }[] = [
  { rx: 2.15, rz: 1.85, tilt: [1.15, 0, 0.35], speed: 0.22 },
  { rx: 2.4, rz: 2.05, tilt: [0.45, 0, -0.95], speed: -0.15 },
  { rx: 1.95, rz: 1.7, tilt: [1.7, 0, 1.25], speed: 0.3 },
]

function Singularity({ dive, total }: { dive: Dive; total: number }) {
  const geometry = useMemo(() => sphereGeometry(total), [total])
  const shared = useMemo(
    () => ({ uTime: { value: 0 }, uSize: { value: 3.6 }, uPx: { value: 1 }, uImplode: { value: 0 }, uBlast: { value: 0 } }),
    [],
  )
  // três passadas, uma por canal, somadas na tela: alinhadas dão branco, deslocadas dão a franja colorida
  const channels = useMemo(
    () =>
      [new THREE.Color(1, 0, 0), new THREE.Color(0, 1, 0), new THREE.Color(0, 0, 1)].map(
        (color) =>
          new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: { ...shared, uColor: { value: color }, uShift: { value: new THREE.Vector2() } },
          }),
      ),
    [shared],
  )
  const rings = useMemo(() => RINGS.map((ring) => ringGeometry(ring.rx, ring.rz)), [])
  const ringMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#fff', transparent: true, opacity: 0.22 }), [])
  const group = useRef<THREE.Group>(null)
  const ringRefs = useRef<(THREE.LineLoop | null)[]>([])
  const glitch = useRef(0)
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useEffect(() => () => {
    geometry.dispose()
    channels.forEach((m) => m.dispose())
    rings.forEach((g) => g.dispose())
    ringMaterial.dispose()
  }, [geometry, channels, rings, ringMaterial])

  useFrame((state, dt) => {
    const d = dive.start < 0 ? -1 : performance.now() / 1000 - dive.start
    const implode = d < 0 ? 0 : smooth(0, DIVE.blast, d)
    const after = d < DIVE.blast ? 0 : d - DIVE.blast

    shared.uTime.value = state.clock.elapsedTime
    shared.uPx.value = Math.min(state.gl.getPixelRatio(), 1.5)
    shared.uImplode.value = implode * implode
    shared.uBlast.value = after > 0 ? 1 - Math.exp(-after * 2.2) : 0

    // picos de erro de cor ao acaso, cada vez mais frequentes enquanto a esfera implode
    glitch.current *= Math.exp(-dt * 9)
    if (Math.random() < dt * (0.6 + implode * 14)) glitch.current = 0.6 + Math.random()
    const shift = 0.0025 + glitch.current * 0.012 + implode * 0.006 + (after > 0 ? 0.03 * Math.exp(-after * 3) : 0)
    const jitter = glitch.current * 0.004 * (Math.random() - 0.5)
    channels[0].uniforms.uShift.value.set(shift, jitter)
    channels[2].uniforms.uShift.value.set(-shift, -jitter)

    if (group.current) {
      group.current.rotation.y += dt * (0.12 + implode * 2.5)
      group.current.rotation.x += (mouse.current.y * 0.25 - group.current.rotation.x) * Math.min(1, dt * 2)
    }
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return
      ring.rotation.y += dt * RINGS[i].speed * (1 + implode * 6)
      ring.scale.setScalar(1 - implode * 0.85)
    })
    ringMaterial.opacity = 0.22 * (1 - implode)

    // depois da explosão a câmera atravessa a onda: os pontos passam por ela (o "zoom infinito")
    const z = CAMERA_Z - implode * 0.8 - (after > 0 ? smooth(0, 1.1, after) * 5.4 : 0)
    state.camera.position.set(mouse.current.x * 0.35, 0, z)
    state.camera.lookAt(0, 0, -10)
  })

  return (
    <group ref={group} position={[0, 0.35, 0]}>
      {channels.map((material, i) => <points key={i} geometry={geometry} material={material} frustumCulled={false} />)}
      {RINGS.map((ring, i) => (
        <group key={i} rotation={ring.tilt}>
          <lineLoop ref={(el) => { ringRefs.current[i] = el }} geometry={rings[i]} material={ringMaterial} />
        </group>
      ))}
    </group>
  )
}

/** `lite`: WebGL por software, onde cada ponto pesa na CPU. */
export default function IntroScene({ dive, lite }: { dive: Dive; lite: boolean }) {
  const total = lite ? 2500 : window.innerWidth < 768 ? 5000 : 9000
  return (
    <Canvas
      dpr={lite ? 0.5 : [1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 45, near: 0.05, far: 100, position: [0, 0, CAMERA_Z] }}
    >
      <color attach="background" args={['#000']} />
      <Singularity dive={dive} total={total} />
    </Canvas>
  )
}
