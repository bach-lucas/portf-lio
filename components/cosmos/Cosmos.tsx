'use client'

import dynamic from 'next/dynamic'
import { Component, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { getExperiences } from '../../data/experience'
import { getProjects, projectCount } from '../../data/projects'
import { contactHref, getSite, localeInfo, locales, socialLinks, type Locale } from '../../data/site'
import { copy } from './copy'
import { PLANET_COLORS } from './formations'
import { Intro } from './Intro'
import type { Progress } from './Scene'

const Scene = dynamic(() => import('./Scene'), { ssr: false })
const IntroScene = dynamic(() => import('./IntroScene'), { ssr: false })

/** Ordem dos atos = ordem das formações em formations.ts. Altura em vh: quanto de rolagem cada astro segura. Nome e estágio vêm de copy.ts. */
const ACTS = [
  { id: 'inicio', height: 200 },
  { id: 'processo', height: 320 },
  { id: 'projetos', height: 520 },
  { id: 'trajetoria', height: 340 },
  { id: 'sobre', height: 280 },
  { id: 'contato', height: 150 },
]

const pad = (n: number) => String(n).padStart(2, '0')
const rgb = ([r, g, b]: number[]) => `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`

/** 'gpu', 'software' (WebGL sem placa de vídeo: roda, mas precisa de uma cena bem mais leve) ou null. */
function webglSupport() {
  try {
    const probe = (options?: WebGLContextAttributes) => {
      const gl = document.createElement('canvas').getContext('webgl2', options)
      // libera o contexto de teste na hora; o navegador limita quantos podem existir
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
      return !!gl
    }
    if (probe({ failIfMajorPerformanceCaveat: true })) return 'gpu'
    return probe() ? 'software' : null
  } catch {
    return null
  }
}

/** Se o WebGL falhar ao criar a cena, a página segue sem o 3D em vez de cair no erro. */
class WithoutSceneOnError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Entra quando a rolagem do ato passa de `from` e sai depois de `to` (frações 0..1). O cálculo fica no CSS, a partir de --p. */
function Line({ from, to = 2, as: Tag = 'div', className = '', style, children }: { from: number; to?: number; as?: 'div' | 'p' | 'h1' | 'h2' | 'li'; className?: string; style?: CSSProperties; children: ReactNode }) {
  return <Tag className={`cos-linha ${className}`} style={{ ...style, '--de': from, '--ate': to } as CSSProperties}>{children}</Tag>
}

function Kicker({ act, children }: { act: number; children: ReactNode }) {
  return <p className="cos-kicker"><span>{pad(act)}</span><i aria-hidden="true" />{children}</p>
}

function Act({ index, className = '', children }: { index: number; className?: string; children: ReactNode }) {
  const act = ACTS[index]
  return <section id={act.id} data-ato={index} className={`cos-ato ${className}`} style={{ height: `${act.height}vh` }}><div className="cos-palco">{children}</div></section>
}

export function Cosmos({ locale }: { locale: Locale }) {
  const t = copy[locale]
  const site = getSite(locale)
  const projects = getProjects(locale)
  const experiences = getExperiences(locale)
  const acts = ACTS.map((act, i) => ({ ...act, ...t.acts[i] }))
  const progress = useRef<Progress>({ act: 0 }).current
  const root = useRef<HTMLDivElement>(null)
  // undefined até as fontes carregarem e o WebGL ser testado; null = sem cena 3D
  const [scene, setScene] = useState<'gpu' | 'software' | null>()

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // as iniciais da última formação são desenhadas com a fonte do site: espera ela carregar
    document.fonts.ready.then(() => setScene(reduced ? null : webglSupport()))

    const el = root.current!
    const sections = Array.from(el.querySelectorAll<HTMLElement>('[data-ato]'))
    const navLinks = Array.from(el.querySelectorAll<HTMLAnchorElement>('[data-nav]'))
    const hudNumber = el.querySelector<HTMLElement>('[data-hud-n]')!
    const hudStage = el.querySelector<HTMLElement>('[data-hud-stage]')!
    const track = el.querySelector<HTMLElement>('.cos-trilho')
    const measureTrack = () => {
      if (!track?.parentElement) return
      const shift = Math.max(0, track.scrollWidth - track.parentElement.clientWidth)
      track.closest<HTMLElement>('[data-ato]')?.style.setProperty('--shift', `${shift}px`)
    }
    // linhas com link: fora da janela do ato ficam invisíveis, então saem da ordem do Tab.
    // Filtro em JS em vez de :has() no seletor, que derruba o script no Firefox < 121.
    const interactive = Array.from(el.querySelectorAll<HTMLElement>('.cos-linha')).filter((line) => line.querySelector('a, button')).map((line) => ({
      line,
      section: sections.indexOf(line.closest<HTMLElement>('[data-ato]')!),
      from: Number(line.style.getPropertyValue('--de')),
      to: Number(line.style.getPropertyValue('--ate')),
    }))
    // o trilho anda por transform; se o Tab focar um link fora da tela, o navegador rola o palco e desalinha o trilho
    const trackLinks = Array.from(track?.querySelectorAll<HTMLElement>('a') ?? [])

    let shown = -1
    let frame = 0
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      let act = 0
      const ps = sections.map((section, i) => {
        const r = section.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)))
        section.style.setProperty('--p', p.toFixed(4))
        if (r.top <= 1) act = i + p
        return p
      })
      progress.act = act
      const max = document.documentElement.scrollHeight - vh
      el.style.setProperty('--total', (max > 0 ? window.scrollY / max : 0).toFixed(4))
      const now = Math.min(ACTS.length - 1, Math.floor(act + 0.15))
      if (now !== shown) {
        shown = now
        el.dataset.astro = String(now)
        hudNumber.textContent = pad(now + 1)
        hudStage.textContent = t.acts[now].stage
        navLinks.forEach((link) => link.toggleAttribute('aria-current', link.dataset.nav === ACTS[now].id))
      }
      if (reduced) return
      for (const it of interactive) {
        const p = ps[it.section]
        it.line.inert = !(p > it.from && p < it.to)
      }
      const vw = window.innerWidth
      for (const link of trackLinks) {
        const r = link.getBoundingClientRect()
        link.inert = r.left < 0 || r.right > vw
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onResize = () => {
      measureTrack()
      update()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    // imagens e fontes que chegam depois mudam a largura do trilho
    const observer = new ResizeObserver(onResize)
    if (track) observer.observe(track)
    document.fonts.ready.then(onResize)
    onResize()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [progress, t])

  return (
    <div ref={root} className="cos-raiz">
      <Intro text={t.intro} siteName={site.name} ready={scene !== undefined} scene={(dive) => scene && <WithoutSceneOnError><IntroScene dive={dive} lite={scene === 'software'} /></WithoutSceneOnError>} />
      <div className="cos-barra" aria-hidden="true" />
      <div className="cos-fundo" aria-hidden="true">
        <div className="cos-estrelas" />
        {scene && <WithoutSceneOnError><Scene progress={progress} initials={site.initials} lite={scene === 'software'} /></WithoutSceneOnError>}
        <div className="cos-vinheta" />
      </div>

      <header className="cos-topo">
        <a className="cos-marca" href="#inicio"><span>+</span>{site.name.toUpperCase()}</a>
        <nav className="cos-nav" aria-label={t.nav}>
          {acts.slice(1, -1).map((act) => <a key={act.id} href={`#${act.id}`} data-nav={act.id}>{act.label}</a>)}
        </nav>
        <div className="cos-topo-acoes">
          <nav className="cos-idioma" aria-label={t.language}>
            {locales.map((l) => <a key={l} href={localeInfo[l].path} hrefLang={localeInfo[l].htmlLang} lang={localeInfo[l].htmlLang} title={localeInfo[l].name} aria-current={l === locale ? 'page' : undefined}>{localeInfo[l].label}</a>)}
          </nav>
          <a className="cos-contato" href={contactHref}>{t.contact} <span>↗</span></a>
        </div>
      </header>

      <p className="cos-hud" aria-hidden="true"><b data-hud-n>01</b> / {pad(ACTS.length)}<i /><span data-hud-stage>{acts[0].stage}</span></p>

      <main>
        <Act index={0} className="cos-centro">
          <Line from={-1} to={0.45} as="p" className="cos-eyebrow"><span className="cos-pulso" />{t.hero.eyebrow}</Line>
          <Line from={-1} to={0.55} as="h1" className="cos-titulo">{site.tagline.lead} <em>{site.tagline.emphasis}.</em></Line>
          <Line from={-1} to={0.5} as="p" className="cos-lead">{t.hero.leadBefore} <strong>{site.name}</strong>, {site.role.toLowerCase()}. {t.hero.leadAfter}</Line>
          <Line from={-1} to={0.2} className="cos-role"><span>{t.hero.scroll}</span><i aria-hidden="true" /></Line>
        </Act>

        <Act index={1}>
          <div className="cos-coluna">
            <Line from={0.02}><Kicker act={1}>{t.process.kicker}</Kicker></Line>
            <Line from={0.04} as="h2" className="cos-h2">{t.process.title} <em>{t.process.titleEm}</em></Line>
            <Line from={0.08} as="p" className="cos-lead">{t.process.lead}</Line>
            <ol className="cos-passos">
              {t.process.steps.map((step, i) => <Line key={step.title} as="li" from={0.18 + i * 0.16}><span>{pad(i + 1)}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></Line>)}
            </ol>
            <Line from={0.7} className="cos-numeros">
              {[projectCount, pad(experiences.length), '∞'].map((value, i) => <div key={i}><strong>{value}</strong><span>{t.process.numbers[i][0]}<br />{t.process.numbers[i][1]}</span></div>)}
            </Line>
          </div>
        </Act>

        <Act index={2} className="cos-ato-trilho">
          <div className="cos-trilho">
            <div className="cos-trilho-intro">
              <Kicker act={2}>{t.projects.kicker}</Kicker>
              <h2 className="cos-h2">{projectCount} {t.projects.titleAfterCount} <em>{t.projects.titleEm}</em></h2>
              <p className="cos-lead">{t.projects.lead}</p>
            </div>
            {projects.map((project, i) => (
              <article key={project.title} className="cos-planeta" style={{ '--cor': rgb(PLANET_COLORS[i % PLANET_COLORS.length]) } as CSSProperties}>
                <div className="cos-planeta-img">
                  {project.image ? <img src={project.image} alt={`${t.projects.imageAlt} ${project.title}`} loading="lazy" /> : <span className="cos-planeta-sem">{project.symbol}</span>}
                </div>
                <div className="cos-planeta-corpo">
                  <p className="cos-planeta-orbita"><i />{t.projects.orbit} {project.number} · {project.type}</p>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <small>{project.detail}</small>
                  {project.url && <a href={project.url} target="_blank" rel="noreferrer">{t.projects.visit} <span>↗</span></a>}
                </div>
              </article>
            ))}
          </div>
        </Act>

        <Act index={3}>
          <div className="cos-coluna">
            <Line from={0.02}><Kicker act={3}>{t.story.kicker}</Kicker></Line>
            <Line from={0.04} as="h2" className="cos-h2">{t.story.title} <em>{t.story.titleEm}</em></Line>
            <ol className="cos-tempo">
              {experiences.map((experience, i) => (
                <Line key={`${experience.company}-${experience.period}`} as="li" from={0.12 + i * 0.13}>
                  <span className="cos-tempo-data">{experience.period}</span>
                  <div><strong>{experience.role}, {experience.company}</strong><p>{experience.description}</p></div>
                </Line>
              ))}
            </ol>
          </div>
        </Act>

        <Act index={4}>
          <div className="cos-coluna">
            <Line from={0.02}><Kicker act={4}>{t.about.kicker}</Kicker></Line>
            <Line from={0.04} as="h2" className="cos-h2 cos-h2-largo">{t.about.title} <em>{t.about.titleEm}</em></Line>
            <Line from={0.16} as="p" className="cos-lead">{t.about.lead}</Line>
            <Line from={0.3} className="cos-explorando">
              <span>{t.about.exploring}</span>
              {t.about.topics.map((topic) => <strong key={topic}>{topic}</strong>)}
            </Line>
          </div>
        </Act>

        <Act index={5} className="cos-centro cos-fim">
          <Line from={0.01}><Kicker act={5}>{t.end.kicker}</Kicker></Line>
          <Line from={0.03} as="h2" className="cos-h2 cos-h2-largo">{t.end.title} <em>{t.end.titleEm}</em></Line>
          <Line from={0.05} as="p" className="cos-lead">{t.end.lead}</Line>
          <Line from={0.07} className="cos-acoes">
            <a className="cos-botao" href={contactHref}>{t.contact} <span>↗</span></a>
            {socialLinks.map((link) => <a key={link.label} className="cos-botao cos-botao-sec" href={link.url} target="_blank" rel="noreferrer">{link.label} <span>↗</span></a>)}
          </Line>
          <footer className="cos-rodape">
            <span>© {new Date().getFullYear()} {site.name}</span>
            <span>{t.end.madeWith} <b>✳</b></span>
          </footer>
        </Act>
      </main>
    </div>
  )
}
