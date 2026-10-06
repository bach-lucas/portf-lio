import { experiences } from '../data/experience'
import { sections, site } from '../data/site'

export function Story() {
  return <section className="story section-wrap" id={sections.story.id}><div className="story-title"><p className="eyebrow">{sections.story.number} / em movimento</p><h2>O caminho também<br /><em>faz parte da obra.</em></h2><div className="planet-system" aria-label="Planeta percorrendo uma órbita ao redor de um sol"><div className="orbit-path orbit-path-one" /><div className="orbit-path orbit-path-two" /><div className="sun"><span>{site.initials}</span></div><div className="planet-orbit"><div className="planet"><span /></div></div><div className="system-caption"><span>trajetória</span><b>sempre em movimento</b></div></div></div><div className="timeline">{experiences.map((experience) => <div className="timeline-item" key={`${experience.company}-${experience.period}`}><span className="year">{experience.period}</span><div><h3>{experience.role}, {experience.company}</h3><p>{experience.description}</p></div></div>)}</div></section>
}
