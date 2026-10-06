import { site, socialLinks } from '../data/site'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return <footer className="footer section-wrap"><span>© {currentYear} {site.name}</span><span>feito com curiosidade <b>✳</b></span><div>{socialLinks.map((link) => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div></footer>
}
