import { projectCount } from '../data/projects'

export function Proof() {
  return <section className="proof section-wrap"><p>o que já saiu do papel</p><div className="proof-grid"><div><strong>{projectCount}</strong><span>projetos<br />publicados</span></div><div><strong>01</strong><span>portfólio<br />em construção</span></div><div><strong>∞</strong><span>vontade de<br />aprender</span></div></div></section>
}
