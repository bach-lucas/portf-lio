/**
 * Formações da nuvem de partículas, uma por ato da narrativa. Todas têm o mesmo número de
 * pontos, para a cena interpolar ponto a ponto de um astro para o seguinte.
 */

export type RGB = [number, number, number]
type Vec3 = [number, number, number]

export type Formation = {
  pos: Float32Array
  col: Float32Array
  /** Velocidade angular de cada ponto em torno do eixo Y local (rad/s): discos e órbitas giram de verdade. */
  spin: Float32Array
  /** Inclinação em torno de X, aplicada depois do giro. */
  cosT: number
  sinT: number
}

const WHITE: RGB = [1, 0.97, 0.92]
const WARM: RGB = [1, 0.8, 0.5]
const LIME: RGB = [0.85, 0.95, 0.49]
const ORANGE: RGB = [1, 0.44, 0.31]
const VIOLET: RGB = [0.54, 0.45, 0.95]
const TEAL: RGB = [0.3, 0.78, 0.8]
const BLUE: RGB = [0.55, 0.7, 1]
const EMBER: RGB = [0.55, 0.14, 0.2]

/** Um planeta por projeto, na ordem de data/projects.ts. */
export const PLANET_COLORS: RGB[] = [
  LIME,
  BLUE,
  ORANGE,
  [0.95, 0.82, 0.55],
  VIOLET,
  TEAL,
  [1, 0.55, 0.75],
  [0.75, 0.6, 1],
]
const PLANET_SIZES = [0.3, 0.2, 0.26, 0.22, 0.32, 0.2, 0.18, 0.24]
const ORBITS = PLANET_COLORS.map((_, i) => 1.3 + i * 0.6)
/** Planeta com anéis. */
const RINGED = 4

export const CAMERAS: { pos: Vec3; target: Vec3 }[] = [
  { pos: [0, 0.4, 11], target: [0, 0, 0] },
  // o astro fica à direita do texto: a câmera olha para a esquerda dele
  { pos: [-2.6, 1.2, 8.4], target: [-2.6, 0, 0] },
  { pos: [0, 3.2, 10.5], target: [0, -1.2, 0] },
  { pos: [-4.2, 3.4, 13.5], target: [-4.2, 0, 0] },
  { pos: [-2.8, 0.25, 8.6], target: [-2.8, 0, 0] },
  { pos: [0, 0, 10.5], target: [0, 0, 0] },
]

/** Fração do ato em que o astro começa a virar o próximo (o trilho de projetos precisa de mais tempo parado). */
export const MORPH_START = [0.55, 0.8, 0.8, 0.75, 0.6, 1]

/** Ato do buraco negro: só nele a cena desenha a sombra (esfera preta de raio 1). */
export const BLACK_HOLE_INDEX = 4

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r())
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const dim = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k]
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
/** Órbita kepleriana: quanto mais perto do centro, mais rápido; limitada para o centro não virar borrão. */
const kepler = (r: number, k: number, max: number) => Math.min(max, k / Math.pow(r, 1.5))

function unitVector(r: () => number): Vec3 {
  const z = r() * 2 - 1
  const a = r() * Math.PI * 2
  const s = Math.sqrt(1 - z * z)
  return [s * Math.cos(a), z, s * Math.sin(a)]
}

function create(n: number, tilt: number): Formation {
  return { pos: new Float32Array(n * 3), col: new Float32Array(n * 3), spin: new Float32Array(n), cosT: Math.cos(tilt), sinT: Math.sin(tilt) }
}

function put(f: Formation, i: number, p: Vec3, c: RGB, spin = 0) {
  f.pos.set(p, i * 3)
  f.col.set(c, i * 3)
  f.spin[i] = spin
}

/** Um ponto no plano da tela (xy) já com a inclinação desfeita, para continuar de frente para a câmera depois dela. */
function facingCamera(f: Formation, x: number, y: number): Vec3 {
  return [x, y * f.cosT, -y * f.sinT]
}

/** Ato 0: nebulosa, poeira colorida antes de qualquer forma. */
function nebula(n: number) {
  const f = create(n, 0)
  const r = rng(11)
  const lobes: { c: Vec3; s: Vec3; col: RGB }[] = [
    { c: [-2.6, 0.8, -1], s: [2.2, 1.3, 1.6], col: VIOLET },
    { c: [2.4, -0.4, -0.5], s: [2, 1.5, 1.4], col: ORANGE },
    { c: [0.3, 1.6, -2.2], s: [1.8, 1, 1.4], col: TEAL },
    { c: [0.6, -1.6, 0.4], s: [1.6, 0.9, 1.2], col: LIME },
    { c: [-0.8, -0.2, 1.2], s: [1.2, 0.8, 1], col: BLUE },
  ]
  for (let i = 0; i < n; i++) {
    if (r() < 0.8) {
      const lobe = lobes[i % lobes.length]
      let x = lobe.c[0] + gauss(r) * lobe.s[0]
      let y = lobe.c[1] + gauss(r) * lobe.s[1]
      let z = lobe.c[2] + gauss(r) * lobe.s[2]
      // distorção senoidal: transforma as bolhas gaussianas em filamentos
      x += 0.7 * Math.sin(y * 1.1 + z * 0.6)
      y += 0.5 * Math.sin(z * 1.3 + x * 0.4)
      z += 0.6 * Math.sin(x * 0.9)
      const other = lobes[(i + 1) % lobes.length].col
      put(f, i, [x, y, z], dim(mix(lobe.col, other, r() * 0.45), 0.3 + r() * 0.4), 0.035)
    } else {
      const d = unitVector(r)
      const rr = 3 + r() * 7
      put(f, i, [d[0] * rr, d[1] * rr, d[2] * rr], dim(mix(WHITE, BLUE, r()), 0.45 + r() * 0.5), 0.035)
    }
  }
  return f
}

/** Ato 1: proto-estrela. A poeira cai num disco, o núcleo acende e os jatos saem pelos polos. */
function protostar(n: number) {
  const f = create(n, 0.38)
  const r = rng(23)
  for (let i = 0; i < n; i++) {
    const u = r()
    if (u < 0.1) {
      put(f, i, [gauss(r) * 0.16, gauss(r) * 0.16, gauss(r) * 0.16], mix(WHITE, WARM, r()))
    } else if (u < 0.72) {
      const rr = 0.32 + Math.pow(r(), 0.9) * 3.8
      const a = r() * Math.PI * 2 + 0.35 * Math.sin(rr * 3)
      const heat = 1 - (rr - 0.32) / 3.8
      const c = heat > 0.6 ? mix(ORANGE, WHITE, (heat - 0.6) / 0.4) : mix(VIOLET, ORANGE, heat / 0.6)
      put(f, i, [rr * Math.cos(a), gauss(r) * 0.03 * (1 + rr * 0.5), rr * Math.sin(a)], dim(c, 0.45 + heat * 0.6), kepler(rr, 1, 2.4))
    } else if (u < 0.86) {
      const side = r() < 0.5 ? -1 : 1
      const h = 0.25 + Math.pow(r(), 0.8) * 4.8
      const w = 0.04 + h * 0.07
      put(f, i, [gauss(r) * w, side * h, gauss(r) * w], dim(mix(TEAL, BLUE, h / 5), 0.9 - h / 7), 0.4)
    } else {
      const d = unitVector(r)
      const rr = 3.5 + r() * 4
      put(f, i, [d[0] * rr, d[1] * rr, d[2] * rr], dim(VIOLET, 0.25), 0.03)
    }
  }
  return f
}

/** Ato 2: sistema planetário, um planeta por projeto. */
function planetarySystem(n: number) {
  const f = create(n, 0.5)
  const r = rng(37)
  const count = PLANET_COLORS.length
  for (let i = 0; i < n; i++) {
    const u = r()
    if (u < 0.1) {
      const d = unitVector(r)
      const corona = r() < 0.35
      const rr = corona ? 0.3 + Math.abs(gauss(r)) * 0.25 : 0.3 * Math.cbrt(r())
      put(f, i, [d[0] * rr, d[1] * rr, d[2] * rr], corona ? dim(WARM, 0.5) : mix(WHITE, WARM, r()))
    } else if (u < 0.4) {
      const j = i % count
      const a = r() * Math.PI * 2
      const rr = ORBITS[j] + gauss(r) * 0.01
      put(f, i, [rr * Math.cos(a), gauss(r) * 0.01, rr * Math.sin(a)], dim(PLANET_COLORS[j], 0.22), 0.02)
    } else if (u < 0.88) {
      const j = i % count
      const size = PLANET_SIZES[j]
      const orbit = ORBITS[j]
      const phi = j * 2.39996
      const cx = orbit * Math.cos(phi)
      const cz = orbit * Math.sin(phi)
      let local: Vec3
      let shade: number
      if (j === RINGED && r() < 0.4) {
        const rr = size * (1.5 + r() * 0.8)
        const a = r() * Math.PI * 2
        const y = rr * Math.sin(a) * 0.42
        local = [rr * Math.cos(a), y, rr * Math.sin(a) * 0.9]
        shade = 0.55
      } else {
        const d = unitVector(r)
        const rr = size * (0.85 + 0.15 * r())
        local = [d[0] * rr, d[1] * rr, d[2] * rr]
        // lado voltado para a estrela claro, o outro na sombra
        shade = 0.3 + 0.7 * Math.max(0, -(d[0] * cx + d[2] * cz) / orbit)
      }
      put(f, i, [cx + local[0], local[1], cz + local[2]], dim(PLANET_COLORS[j], shade * (0.7 + 0.4 * r())), kepler(orbit, 0.9, 1.2))
    } else {
      const rr = ORBITS[3] + 0.15 + r() * (ORBITS[4] - ORBITS[3] - 0.3)
      const a = r() * Math.PI * 2
      put(f, i, [rr * Math.cos(a), gauss(r) * 0.05, rr * Math.sin(a)], dim(WHITE, 0.25 + r() * 0.2), kepler(rr, 0.9, 1.2))
    }
  }
  return f
}

/** Ato 3: galáxia espiral de dois braços. */
function galaxy(n: number) {
  const f = create(n, 1.05)
  const r = rng(51)
  for (let i = 0; i < n; i++) {
    const u = r()
    // braços giram como um padrão rígido; com rotação diferencial eles se enrolariam em segundos
    if (u < 0.16) {
      put(f, i, [gauss(r) * 0.55, gauss(r) * 0.32, gauss(r) * 0.55], dim(mix(WHITE, WARM, r()), 0.55), 0.12)
    } else if (u < 0.76) {
      const arm = i % 2
      const rr = 0.5 + Math.pow(r(), 0.75) * 6.2
      const a = arm * Math.PI + rr * 0.9 + gauss(r) * 0.22
      const d = rr + gauss(r) * 0.18 * (1 + rr * 0.08)
      const nursery = r() < 0.07
      const c = nursery ? mix(ORANGE, [1, 0.5, 0.7], r()) : dim(mix(BLUE, WHITE, r() * 0.5), 1 - rr / 9)
      put(f, i, [d * Math.cos(a), gauss(r) * 0.06, d * Math.sin(a)], c, 0.12)
    } else {
      const rr = 0.3 - Math.log(1 - r() * 0.98) * 2
      const a = r() * Math.PI * 2
      put(f, i, [rr * Math.cos(a), gauss(r) * 0.12, rr * Math.sin(a)], dim(mix(VIOLET, BLUE, r()), 0.3), 0.12)
    }
  }
  return f
}

/** Ato 4: buraco negro com disco de acreção, anel de fótons e a imagem curvada do disco atrás dele. */
function blackHole(n: number) {
  const f = create(n, 0.12)
  const r = rng(67)
  for (let i = 0; i < n; i++) {
    const u = r()
    if (u < 0.07) {
      const a = r() * Math.PI * 2
      const rr = 1.06 + Math.abs(gauss(r)) * 0.03
      put(f, i, facingCamera(f, rr * Math.cos(a), rr * Math.sin(a)), mix(WHITE, WARM, r()))
    } else if (u < 0.32) {
      // a luz do disco que passa atrás é desviada por cima e por baixo da sombra
      const a = r() * Math.PI * 2
      const band = Math.abs(Math.sin(a))
      const rr = 1.12 + Math.pow(r(), 1.8) * (0.35 + band * 1.3)
      const c = dim(mix(ORANGE, WARM, clamp01(1 - (rr - 1.1) / 1.6)), 0.85 - (rr - 1.1) * 0.25)
      put(f, i, facingCamera(f, rr * Math.cos(a), rr * Math.sin(a)), c)
    } else if (u < 0.87) {
      const rr = 1.35 + Math.pow(r(), 1.7) * 5.2
      const a = r() * Math.PI * 2
      const heat = 1 - (rr - 1.35) / 5.2
      const c = heat > 0.7 ? mix(WARM, WHITE, (heat - 0.7) / 0.3) : mix(EMBER, ORANGE, heat / 0.7)
      put(f, i, [rr * Math.cos(a), gauss(r) * 0.02 * (1 + rr * 0.2), rr * Math.sin(a)], dim(c, 0.35 + heat * 0.8), kepler(rr, 2.2, 1.6))
    } else {
      // uma estrela sendo despedaçada, em espiral para dentro
      const s = r()
      const rr = 7.5 - s * 5.8 + gauss(r) * 0.08 * (2 - s)
      const a = s * 9
      put(f, i, [rr * Math.cos(a), gauss(r) * 0.05, rr * Math.sin(a)], dim(mix(BLUE, WHITE, s), 0.6), kepler(rr, 2.2, 1.6))
    }
  }
  return f
}

/** Pontos (x, y em 0..1) dentro das letras, amostrados de um canvas 2D. */
function letterSamples(text: string) {
  const w = 512
  const h = 256
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  ctx.fillStyle = '#fff'
  ctx.font = '700 210px "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2 + 8)
  const data = ctx.getImageData(0, 0, w, h).data
  const out: number[] = []
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 128) out.push(x / w, y / h)
  return out
}

/** Ato 5: nova estrela. O que sobrou da supernova envolve as iniciais. */
function newStar(n: number, initials: string) {
  const f = create(n, 0)
  const r = rng(83)
  const letters = letterSamples(initials)
  const nLetters = letters.length / 2
  for (let i = 0; i < n; i++) {
    const u = r()
    if (u < 0.45 && nLetters > 0) {
      const k = Math.floor(r() * nLetters) * 2
      const sx = letters[k] + (r() - 0.5) * 0.004
      const sy = letters[k + 1] + (r() - 0.5) * 0.004
      put(f, i, [(sx - 0.5) * 7.4, (0.5 - sy) * 3.7 + 1.7, gauss(r) * 0.06], dim(mix(LIME, ORANGE, sx), 0.7 + r() * 0.5))
    } else if (u < 0.85) {
      const d = unitVector(r)
      const theta = Math.atan2(d[2], d[0])
      const phi = Math.acos(d[1])
      const rr = 5.4 * (1 + 0.07 * Math.sin(5 * theta) * Math.sin(4 * phi)) + gauss(r) * 0.18
      put(f, i, [d[0] * rr, d[1] * rr, d[2] * rr], dim(mix(ORANGE, TEAL, r()), 0.4), 0.05)
    } else {
      const d = unitVector(r)
      const rr = 1.8 + r() * 8
      put(f, i, [d[0] * rr, d[1] * rr, d[2] * rr], dim(WHITE, 0.4 + r() * 0.5), 0.02)
    }
  }
  return f
}

export function createFormations(n: number, initials: string) {
  return [nebula(n), protostar(n), planetarySystem(n), galaxy(n), blackHole(n), newStar(n, initials)]
}
