'use client'

import { motion } from 'motion/react'
import { BlurText } from './BlurText'
import { sections, site } from '../data/site'

export function Hero() {
  return <section className="hero section-wrap"><div className="hero-copy"><motion.p className="eyebrow" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}><span className="pulse" /> disponível para novos projetos</motion.p><h1><BlurText>{site.tagline.lead}</BlurText><br /><em><BlurText>{`${site.tagline.emphasis}.`}</BlurText></em></h1><motion.p className="hero-lede" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>Sou <strong>{site.name}</strong>, {site.role.toLowerCase()} que transformam ideias em sites vivos, úteis e memoráveis.</motion.p><div className="hero-actions"><a className="button primary" href={`#${sections.projects.id}`}>Ver meus projetos <span>↓</span></a><a className="text-link" href={`#${sections.about.id}`}>Como eu trabalho <span>↗</span></a></div></div><div className="hero-art"><div className="orb orb-one" /><div className="orb orb-two" /><div className="orb orb-three" /><div className="hero-core">&lt;/&gt;</div><p className="art-label">DESIGN<br />CÓDIGO<br />+ CURIOSIDADE</p><div className="art-caption"><span>{sections.home.number}</span><span>do caos ao claro</span></div></div></section>
}
