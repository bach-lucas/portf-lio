import { contactHref, navigation, sections, site } from '../data/site'

export function Header() {
  return <header className="topbar"><a className="brand" href={`#${sections.home.id}`}><span className="brand-mark">+</span> {site.name.toUpperCase()}</a><nav className="nav" aria-label="Navegação principal">{navigation.map((section) => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav><a className="contact-link" href={contactHref}>Vamos conversar <span>↗</span></a></header>
}
