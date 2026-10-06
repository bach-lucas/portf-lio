'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { projects } from '../data/projects'
import { sections, site } from '../data/site'

// The mini browser grid has three columns, so only the first row of projects fits.
const introProjects = projects.slice(0, 3)

export function IntroSequence() {
  const [visible, setVisible] = useState(true)
  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setVisible(false); const timer = window.setTimeout(() => setVisible(false), 3600); return () => window.clearTimeout(timer) }, [])
  return <AnimatePresence>{visible ? <motion.div className="intro-sequence" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .65 } }} role="status" aria-live="polite"><button className="intro-skip" onClick={() => setVisible(false)}>pular introdução <span>↗</span></button><div className="intro-content"><motion.p className="intro-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{site.name.toUpperCase()} / PORTFÓLIO</motion.p><motion.div className="browser-window" initial={{ scale: .82, opacity: 0, y: 28 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: .7 }}><div className="browser-top"><div className="browser-dots"><i /><i /><i /></div><div className="browser-url">{new URL(site.url).host} / {sections.projects.id}</div><span className="browser-lock">⌁</span></div><div className="browser-body"><div className="browser-side"><b>{site.initials}</b><span /><span /><span /></div><div className="browser-main"><div className="browser-title"><span>projetos que<br /><em>{site.tagline.emphasis}.</em></span><small>{projects.length} projetos publicados</small></div><div className="browser-projects">{introProjects.map((project, index) => <motion.div key={project.title} className={`browser-project ${project.word}`} style={project.image ? { background: `linear-gradient(rgba(23,20,28,.25),rgba(23,20,28,.85)),url(${project.image}) center top/cover` } : undefined} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .75 + index * .15 }}><span>{project.number}</span><b>{project.word}</b></motion.div>)}</div></div></div><motion.div className="intro-cursor" initial={{ left: '18%', top: '70%' }} animate={{ left: ['18%', '58%', '80%', '64%'], top: ['70%', '52%', '66%', '52%'] }} transition={{ delay: .8, duration: 1.9 }}>↖</motion.div></motion.div><motion.p className="intro-status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>carregando histórias<span>...</span></motion.p></div></motion.div> : null}</AnimatePresence>
}
