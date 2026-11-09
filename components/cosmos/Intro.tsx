'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { Copy } from './copy'
import { DIVE, INTRO_KEY, playDive } from './opening'
import type { Dive } from './IntroScene'

/** Mesmo com tudo em cache, o contador precisa de tempo para ser lido (s). */
const MIN_LOAD = 1.6

/**
 * Abertura "antes do universo": esfera que implode e explode no clique, abrindo na nebulosa do primeiro ato.
 * `ready`: fontes carregadas e WebGL já testado. `scene`: desenha a esfera, ou nada se não houver WebGL.
 */
export function Intro({ text, siteName, ready, scene }: { text: Copy['intro']; siteName: string; ready: boolean; scene: (dive: Dive) => ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLElement>(null)
  const enterButton = useRef<HTMLButtonElement>(null)
  const loadStart = useRef(0)
  const dive = useRef<Dive>({ start: -1 }).current
  const [on, setOn] = useState(true)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'dive'>('loading')
  const [sound, setSound] = useState(true)

  const finish = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // armazenamento bloqueado pelo navegador: a abertura só volta a aparecer no próximo carregamento
    }
    delete document.documentElement.dataset.intro
    // a barra de rolagem volta e a página fica mais estreita sem disparar resize: o trilho precisa se medir de novo
    window.dispatchEvent(new Event('resize'))
    setOn(false)
  }

  // quem decide é o script inline de app/page.tsx, antes da pintura; sem o atributo a abertura nem aparece
  useEffect(() => {
    if ('intro' in document.documentElement.dataset) window.scrollTo(0, 0)
    else setOn(false)
  }, [])

  // o resto da página fica fora do Tab enquanto a abertura cobre a tela
  useEffect(() => {
    if (!on) return
    const others = Array.from(root.current!.parentElement!.children).filter((el): el is HTMLElement => el !== root.current && el instanceof HTMLElement)
    others.forEach((el) => (el.inert = true))
    return () => others.forEach((el) => (el.inert = false))
  }, [on])

  // contador de 000 a 100: segura em 90 até a cena principal estar pronta
  useEffect(() => {
    if (!on || phase !== 'loading') return
    loadStart.current ||= performance.now()
    let frame = 0
    const tick = () => {
      // ao sair, o React tira o contador do DOM antes de cancelar este quadro
      if (!counter.current) return
      const p = Math.min(ready ? 100 : 90, ((performance.now() - loadStart.current) / 1000 / MIN_LOAD) * 100)
      counter.current.textContent = String(Math.floor(p)).padStart(3, '0')
      if (p >= 100) setPhase('ready')
      else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [on, phase, ready])

  useEffect(() => {
    if (phase === 'ready') enterButton.current?.focus()
  }, [phase])

  const enter = () => {
    dive.start = performance.now() / 1000
    try {
      if (sound) playDive()
    } catch {
      // navegador sem Web Audio ou que recusou o áudio: o mergulho segue em silêncio
    }
    setPhase('dive')
    window.setTimeout(finish, DIVE.end * 1000)
  }

  if (!on) return null
  return (
    <div
      ref={root}
      className={`cos-intro${phase === 'ready' ? ' is-pronta' : ''}${phase === 'dive' ? ' is-mergulho' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={text.label}
      style={{ '--blast': `${DIVE.blast}s` } as CSSProperties}
    >
      <div className="cos-intro-cena">{scene(dive)}</div>
      <div className="cos-intro-clarao" aria-hidden="true" />
      <div className="cos-intro-ui" inert={phase === 'dive'}>
        <p className="cos-intro-marca"><span>+</span>{siteName.toUpperCase()}</p>
        <div className="cos-intro-cantos">
          <button type="button" aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? text.soundOn : text.soundOff}</button>
          <button type="button" onClick={finish}>{text.skip} <span>↗</span></button>
        </div>
        <div className="cos-intro-centro">
          <p className="cos-intro-n">{text.before} <i /> <b ref={counter}>000</b></p>
          <button ref={enterButton} type="button" className="cos-intro-entrar" disabled={phase !== 'ready'} onClick={enter}>{text.enter}</button>
          <p className="cos-intro-dica">{sound ? text.tipSound : text.tipMuted}</p>
        </div>
      </div>
    </div>
  )
}
