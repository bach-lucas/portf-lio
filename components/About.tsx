import { contactHref, sections } from '../data/site'

export function About() {
  return <section className="about section-wrap" id={sections.about.id}><div className="about-card"><p className="eyebrow">{sections.about.number} / sobre</p><h2>Menos “olha o que eu sei”.<br /><em>Mais “olha o que podemos fazer”.</em></h2><p>Gosto de trabalhar na interseção entre design e tecnologia. Meu processo começa ouvindo, passa por testar cedo e termina em algo que faz sentido para quem vai usar.</p><a className="button dark" href={contactHref}>Trocar uma ideia <span>↗</span></a></div><div className="about-aside"><div className="mini-mark">✳</div><p>Atualmente explorando:</p><strong>interfaces humanas<br />sites com personalidade<br />novas narrativas</strong></div></section>
}
