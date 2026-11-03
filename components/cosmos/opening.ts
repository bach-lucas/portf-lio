/** Abertura do site fora do React: linha do tempo do mergulho, script que decide se ela aparece e o som. */

export const INTRO_KEY = 'cosmos-intro'

/** Segundos desde o clique em "Entrar": a esfera implode até `blast`, explode, e a abertura termina de sumir em `end`. */
export const DIVE = { blast: 0.85, end: 2.5 }

/**
 * Roda inline antes da primeira pintura (app/page.tsx): sem ele a home pisca antes de a abertura cobrir a tela.
 * Fica de fora quem já viu nesta sessão, quem chega por um link com #ato e quem pede menos movimento.
 */
export const introGate = `try{if(!sessionStorage.getItem('${INTRO_KEY}')&&!location.hash&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.intro=''}catch(e){}`

function noiseBuffer(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

/** Resposta de uma sala enorme: ruído estéreo que decai. Vira o eco da explosão. */
function impulse(ctx: AudioContext, seconds: number) {
  const n = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(2, n, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3)
  }
  return buffer
}

/** Saturação: quanto maior `k`, mais o sinal é esmagado e mais áspero fica. */
function distortion(k: number) {
  const curve = new Float32Array(2048)
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1
    curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x))
  }
  return curve
}

/**
 * Som do mergulho, gerado na hora (sem arquivos). Precisa ser chamado dentro do clique: os navegadores
 * só liberam áudio depois de um gesto. Acompanha a cena: grave tenso e sucção enquanto a esfera implode,
 * estalos junto com o erro de cor, explosão distorcida no `blast` e um pad grave que some na nebulosa.
 */
export function playDive() {
  const ctx = new AudioContext()
  const t0 = ctx.currentTime + 0.03
  const tb = t0 + DIVE.blast

  // o volume vem depois do compressor: antes dele, baixar o volume só fazia o compressor apertar menos
  const out = ctx.createGain()
  const volume = ctx.createGain()
  volume.gain.value = 0.18
  out.connect(ctx.createDynamicsCompressor()).connect(volume).connect(ctx.destination)
  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 3.5)
  const wet = ctx.createGain()
  wet.gain.value = 0.45
  reverb.connect(wet).connect(out)

  const noise = noiseBuffer(ctx, 2)
  const noiseSource = (start: number, stop: number) => {
    const s = ctx.createBufferSource()
    s.buffer = noise
    s.loop = true
    s.start(start, Math.random() * 1.5)
    s.stop(stop)
    return s
  }
  const osc = (type: OscillatorType, freq: number, start: number, stop: number) => {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.setValueAtTime(freq, start)
    o.start(start)
    o.stop(stop)
    return o
  }
  const filter = (type: BiquadFilterType, freq: number, q = 1) => {
    const f = ctx.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    f.Q.value = q
    return f
  }
  const shaper = (k: number) => {
    const w = ctx.createWaveShaper()
    w.curve = distortion(k)
    w.oversample = '4x'
    return w
  }
  const gain = () => {
    const g = ctx.createGain()
    g.gain.value = 0
    return g
  }

  // grave contínuo que sobe de tom e fica tenso enquanto a esfera se fecha
  const drone = gain()
  drone.gain.setValueAtTime(0, t0)
  drone.gain.linearRampToValueAtTime(0.45, t0 + 0.25)
  drone.gain.setValueAtTime(0.45, tb - 0.03)
  drone.gain.linearRampToValueAtTime(0, tb)
  drone.connect(out)
  for (const f of [38, 38.7]) {
    const o = osc('sine', f, t0, tb + 0.05)
    o.frequency.exponentialRampToValueAtTime(f * 1.6, tb)
    o.connect(drone)
  }

  // sucção: ruído num filtro que sobe enquanto tudo é puxado para o centro
  const suckFilter = filter('bandpass', 160, 4)
  suckFilter.frequency.setValueAtTime(160, t0)
  suckFilter.frequency.exponentialRampToValueAtTime(4200, tb)
  const suck = gain()
  suck.gain.setValueAtTime(0.0001, t0)
  suck.gain.exponentialRampToValueAtTime(0.55, tb - 0.01)
  suck.gain.setValueAtTime(0, tb)
  noiseSource(t0, tb + 0.05).connect(suckFilter).connect(suck).connect(out)

  // tom serrilhado e saturado subindo junto
  const rise = osc('sawtooth', 55, t0, tb + 0.05)
  rise.frequency.exponentialRampToValueAtTime(240, tb)
  const riseGain = gain()
  riseGain.gain.setValueAtTime(0, t0)
  riseGain.gain.linearRampToValueAtTime(0.18, tb - 0.01)
  riseGain.gain.setValueAtTime(0, tb)
  rise.connect(shaper(60)).connect(filter('lowpass', 900)).connect(riseGain).connect(out)

  // estalos digitais, cada vez mais frequentes perto da explosão (como o erro de cor na tela)
  for (let i = 0; i < 9; i++) {
    const at = t0 + DIVE.blast * Math.sqrt(Math.random()) * 0.97
    const len = 0.02 + Math.random() * 0.05
    const g = gain()
    g.gain.setValueAtTime(0.35, at)
    g.gain.setValueAtTime(0, at + len)
    noiseSource(at, at + len + 0.01).connect(shaper(200)).connect(filter('highpass', 1800)).connect(g).connect(out)
  }

  // explosão: bumbo grave que despenca de altura, saturado
  const kick = osc('sine', 150, tb, tb + 2.6)
  kick.frequency.exponentialRampToValueAtTime(28, tb + 0.9)
  const kickGain = gain()
  kickGain.gain.setValueAtTime(1, tb)
  kickGain.gain.exponentialRampToValueAtTime(0.0001, tb + 2.5)
  kick.connect(shaper(6)).connect(kickGain).connect(out)
  kickGain.connect(reverb)

  // estrondo: ruído que escurece conforme a onda se afasta
  const boomFilter = filter('lowpass', 9000)
  boomFilter.frequency.setValueAtTime(9000, tb)
  boomFilter.frequency.exponentialRampToValueAtTime(140, tb + 2.2)
  const boom = gain()
  boom.gain.setValueAtTime(0.8, tb)
  boom.gain.exponentialRampToValueAtTime(0.0001, tb + 2.4)
  noiseSource(tb, tb + 2.5).connect(boomFilter).connect(boom).connect(out)
  boom.connect(reverb)

  // rasgo: ruído esmagado e curto no instante do clarão
  const crunch = gain()
  crunch.gain.setValueAtTime(0.45, tb)
  crunch.gain.exponentialRampToValueAtTime(0.0001, tb + 0.45)
  noiseSource(tb, tb + 0.5).connect(shaper(400)).connect(filter('bandpass', 1100, 0.8)).connect(crunch).connect(out)

  // nebulosa: pad grave que entra com a cena nova e se desfaz
  const pad = gain()
  pad.gain.setValueAtTime(0, tb + 0.4)
  pad.gain.linearRampToValueAtTime(0.16, tb + 1.6)
  pad.gain.linearRampToValueAtTime(0, tb + 6.5)
  pad.connect(out)
  pad.connect(reverb)
  for (const f of [55, 82.4, 110.3]) osc('sine', f, tb + 0.4, tb + 6.6).connect(pad)
  const air = gain()
  air.gain.value = 0.5
  noiseSource(tb + 0.4, tb + 6.6).connect(filter('lowpass', 420)).connect(air).connect(pad)

  window.setTimeout(() => ctx.close(), (DIVE.blast + 7.5) * 1000)
}
