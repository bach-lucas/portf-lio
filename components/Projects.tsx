'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { SpotlightCard } from './SpotlightCard'
import { type Project, projectCount, projects, projectTypes } from '../data/projects'
import { sections } from '../data/site'

const allCategory = 'Todos'
const categories = [allCategory, ...projectTypes]

function ProjectCard({ project }: { project: Project }) {
  return <SpotlightCard className="project-card"><div className={`project-visual ${project.visual}`}>{project.image ? <img className="project-gif" src={project.image} alt={`Prévia do projeto ${project.title}`} /> : <><span className="visual-number">{project.number} / {projectCount}</span><span className="visual-symbol">{project.symbol}</span><span className="visual-word">{project.word}</span></>}</div><div className="project-meta"><div><h3>{project.title}</h3><p>{project.description}</p><small>{project.detail}</small>{project.url && <a className="project-open" href={project.url} target="_blank" rel="noreferrer">Visitar projeto ↗</a>}</div><span className="tag">{project.type}</span></div></SpotlightCard>
}

export function Projects() {
  const [filter, setFilter] = useState<string>(allCategory)
  const visibleProjects = projects.filter((project) => filter === allCategory || project.type === filter)

  return <section className="projects section-wrap" id={sections.projects.id}><div className="section-heading"><div><p className="eyebrow">{sections.projects.number} / projetos selecionados</p><h2>Feito com intenção,<br /><em>não por acaso.</em></h2></div><p className="section-note">Projetos que mostram minha forma de pensar, construir e transformar uma ideia em experiência.</p></div><div className="filters" role="group" aria-label="Filtrar projetos">{categories.map((category) => <button key={category} className={`filter ${filter === category ? 'active' : ''}`} onClick={() => setFilter(category)}>{category}</button>)}</div><div className="project-grid"><AnimatePresence mode="popLayout">{visibleProjects.map((project) => <motion.article layout initial={{ opacity: 0, scale: .94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .94 }} transition={{ duration: .4 }} key={project.title}><ProjectCard project={project} /></motion.article>)}</AnimatePresence></div></section>
}
