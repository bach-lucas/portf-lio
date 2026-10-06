const name = 'Lucas Bach'
const title = `Portfólio de ${name}`
const tagline = { lead: 'Ideias que', emphasis: 'ganham forma' }

export const site = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lucasbach.dev',
  name,
  initials: 'LB',
  title,
  role: 'Desenvolvedor e criador de experiências digitais',
  tagline,
  shareTitle: `${name} — ${tagline.lead} ${tagline.emphasis}`,
  description: `${title}, desenvolvedor que transforma ideias em sites vivos, úteis e memoráveis por meio de design e tecnologia.`,
  shareDescription: 'Projetos digitais que unem design, código e curiosidade para transformar ideias em experiências úteis e memoráveis.',
  email: 'lucas_unzer@hotmail.com',
}

export const contactHref = `mailto:${site.email}`

export const socialLinks = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/lucas-unzer/' },
  { label: 'GitHub', url: 'https://github.com/bach-lucas' },
]

export const sections = {
  home: { id: 'top', label: 'Início', number: '01' },
  projects: { id: 'projetos', label: 'Projetos', number: '02' },
  story: { id: 'trajetoria', label: 'Trajetória', number: '03' },
  about: { id: 'sobre', label: 'Sobre', number: '04' },
}

export const navigation = [sections.projects, sections.story, sections.about]
