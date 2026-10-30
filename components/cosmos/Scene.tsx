'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BLACK_HOLE_INDEX, CAMERAS, MORPH_START, createFormations, type Formation } from './formations'

/** Escrito pela página a cada rolagem e lido pela cena a cada quadro, sem re-render. */
export type Progress = { act: number }

const vertexShader = `
  attribute vec3 aColor;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSize;
  uniform float uPx;
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    vec3 p = position + 0.03 * vec3(sin(uTime * 0.5 + aSeed * 40.0), cos(uTime * 0.4 + aSeed * 30.0), sin(uTime * 0.45 + aSeed * 20.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.7 + 0.3 * sin(uTime * 1.7 + aSeed * 90.0);
    // um ponto que passa rente à câmera numa transição não pode virar um borrão na tela
    gl_PointSize = min(uSize * uPx * (0.5 + aSeed) * twinkle * (10.0 / -mv.z), 40.0);
    vColor = aColor;
    vGlow = twinkle;
  }
`

const fragmentShader = `
  varying vec3 vColor;
  varying float vGlow;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float g = smoothstep(0.5, 0.0, r);
    g *= g;
    gl_FragColor = vec4(vColor * (0.7 + 1.1 * g), g * vGlow);
  }
`

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function seeds(n: number) {
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = Math.sin(i * 12.9898) * 43758.5453
    out[i] = x - Math.floor(x)
  }
  return out
}

function pointsMaterial(size: number) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: size }, uPx: { value: 1 } },
  })
}

/** Posição do ponto k no instante `time`: gira em torno do Y local e depois inclina em X. */
function place(f: Formation, k: number, time: number, out: Float32Array, o: number) {
  const i = k * 3
  let x = f.pos[i]
  let y = f.pos[i + 1]
  let z = f.pos[i + 2]
  const w = f.spin[k]
  if (w !== 0) {
    const c = Math.cos(w * time)
    const s = Math.sin(w * time)
    const nx = x * c - z * s
    z = x * s + z * c
    x = nx
  }
  const ny = y * f.cosT - z * f.sinT
  z = y * f.sinT + z * f.cosT
  out[o] = x
  out[o + 1] = ny
  out[o + 2] = z
}

/** Céu de fundo: estrelas distantes que dão profundidade quando a câmera se move. */
function skyGeometry(n: number) {
  const pos = new Float32Array(n * 3)
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const a = Math.sin(i * 78.233) * 43758.5453
    const b = Math.sin(i * 39.425) * 24634.6345
    const z = (a - Math.floor(a)) * 2 - 1
    const t = (b - Math.floor(b)) * Math.PI * 2
    const s = Math.sqrt(1 - z * z)
    const r = 30 + (i % 7) * 4
    pos.set([s * Math.cos(t) * r, z * r, s * Math.sin(t) * r], i * 3)
    const k = 0.35 + (i % 5) * 0.12
    col.set(i % 4 === 0 ? [k, k * 0.9, k * 1.15] : [k, k, k], i * 3)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seeds(n), 1))
  return g
}

function Universe({ progress, total, initials }: { progress: Progress; total: number; initials: string }) {
  const { camera, size } = useThree()
  // o canvas fica atrás do texto e não recebe eventos; o mouse é lido da janela
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const move = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const formations = useMemo(() => createFormations(total, initials), [total, initials])
  const current = useRef(0)
  const lastFrame = useRef({ i: -1, t: -1 })
  const other = useMemo(() => new Float32Array(3), [])

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(total * 3)
    for (let k = 0; k < total; k++) place(formations[0], k, 0, pos, k * 3)
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(formations[0].col.slice(), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds(total), 1))
    return g
  }, [formations, total])
  const material = useMemo(() => pointsMaterial(7), [])
  const sky = useMemo(() => skyGeometry(1800), [])
  // o tamanho cai com a distância e o céu está a ~40 unidades: precisa de base maior
  const skyMaterial = useMemo(() => pointsMaterial(8), [])
  const skyRef = useRef<THREE.Points>(null)
  const shadow = useRef<THREE.Mesh>(null)
  const camPos = useMemo(() => new THREE.Vector3(), [])
  const camTarget = useMemo(() => new THREE.Vector3(), [])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
    sky.dispose()
    skyMaterial.dispose()
  }, [geometry, material, sky, skyMaterial])

  useFrame((state, dt) => {
    const last = formations.length - 1
    const goal = Math.min(last, Math.max(0, progress.act))
    current.current += (goal - current.current) * Math.min(1, dt * 3)
    const cur = current.current
    const i = Math.min(last, Math.floor(cur))
    const f = cur - i
    const j = Math.min(last, i + 1)
    // cada ato segura o seu astro e só passa para o próximo no fim da rolagem dele
    const t = i === last ? 0 : smooth(MORPH_START[i], 1, f)
    const time = state.clock.elapsedTime

    const A = formations[i]
    const B = formations[j]
    const pos = geometry.attributes.position.array as Float32Array
    const col = geometry.attributes.aColor.array as Float32Array
    const seed = geometry.attributes.aSeed.array as Float32Array
    const colorChanged = i !== lastFrame.current.i || Math.abs(t - lastFrame.current.t) > 1e-4
    lastFrame.current = { i, t }
    for (let k = 0; k < total; k++) {
      const o = k * 3
      place(A, k, time, pos, o)
      // cada ponto parte num instante diferente: a forma se desfaz em ondas, não de uma vez
      const tk = Math.min(1, Math.max(0, t * 1.6 - seed[k] * 0.6))
      if (tk === 0) {
        if (colorChanged) col.set(A.col.subarray(o, o + 3), o)
        continue
      }
      const e = tk * tk * (3 - 2 * tk)
      place(B, k, time, other, 0)
      pos[o] += (other[0] - pos[o]) * e
      pos[o + 1] += (other[1] - pos[o + 1]) * e
      pos[o + 2] += (other[2] - pos[o + 2]) * e
      if (colorChanged) {
        col[o] = A.col[o] + (B.col[o] - A.col[o]) * e
        col[o + 1] = A.col[o + 1] + (B.col[o + 1] - A.col[o + 1]) * e
        col[o + 2] = A.col[o + 2] + (B.col[o + 2] - A.col[o + 2]) * e
      }
    }
    geometry.attributes.position.needsUpdate = true
    if (colorChanged) geometry.attributes.aColor.needsUpdate = true

    const px = Math.min(state.gl.getPixelRatio(), 1.5)
    material.uniforms.uTime.value = time
    material.uniforms.uPx.value = px
    skyMaterial.uniforms.uTime.value = time
    skyMaterial.uniforms.uPx.value = px
    if (skyRef.current) skyRef.current.rotation.y = time * 0.004

    const hole = i === BLACK_HOLE_INDEX ? 1 - t : j === BLACK_HOLE_INDEX ? t : 0
    if (shadow.current) {
      shadow.current.visible = hole > 0.01
      shadow.current.scale.setScalar(Math.max(0.01, hole))
    }

    // no celular o texto ocupa a tela toda: o astro fica centralizado e mais longe
    const narrow = size.width < 860
    const ca = CAMERAS[i]
    const cb = CAMERAS[j]
    camPos.set(...ca.pos).lerp(tmp.set(...cb.pos), t)
    camTarget.set(...ca.target).lerp(tmp.set(...cb.target), t)
    if (narrow) {
      camPos.x = 0
      camPos.z *= 1.45
      camTarget.x = 0
    }
    camPos.x += mouse.current.x * 0.5
    camPos.y += mouse.current.y * 0.3
    camera.position.lerp(camPos, Math.min(1, dt * 2.5))
    camera.lookAt(camTarget)
  })

  return (
    <>
      <points ref={skyRef} geometry={sky} material={skyMaterial} frustumCulled={false} />
      <points geometry={geometry} material={material} frustumCulled={false} />
      <mesh ref={shadow} visible={false}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </>
  )
}

/** `lite`: WebGL por software (sem placa de vídeo), onde cada pixel pesa na CPU. */
export default function Scene({ progress, initials, lite }: { progress: Progress; initials: string; lite: boolean }) {
  const total = lite ? 2500 : window.innerWidth < 768 ? 4500 : 10000
  return (
    <Canvas
      dpr={lite ? 0.5 : [1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 200, position: CAMERAS[0].pos }}
    >
      <Universe progress={progress} total={total} initials={initials} />
    </Canvas>
  )
}
