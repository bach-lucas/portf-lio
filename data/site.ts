export const locales = ['pt', 'en'] as const
export type Locale = (typeof locales)[number]

/** Endereço de cada idioma; também alimenta o seletor de idioma, o hreflang e o sitemap. */
export const localeInfo: Record<Locale, { path: string; htmlLang: string; ogLocale: string; label: string; name: string }> = {
  pt: { path: '/', htmlLang: 'pt-BR', ogLocale: 'pt_BR', label: 'PT', name: 'Português' },
  en: { path: '/en', htmlLang: 'en', ogLocale: 'en_US', label: 'EN', name: 'English' },
}

const name = 'Lucas Bach'

const text = {
  pt: {
    title: `Portfólio de ${name}`,
    role: 'Desenvolvedor e criador de experiências digitais',
    tagline: { lead: 'Ideias que', emphasis: 'ganham forma' },
    description: `Portfólio de ${name}, desenvolvedor que transforma ideias em sites vivos, úteis e memoráveis por meio de design e tecnologia.`,
    shareDescription: 'Projetos digitais que unem design, código e curiosidade para transformar ideias em experiências úteis e memoráveis.',
  },
  en: {
    title: `${name} Portfolio`,
    role: 'Developer and creator of digital experiences',
    tagline: { lead: 'Ideas that', emphasis: 'take shape' },
    description: `Portfolio of ${name}, a developer who turns ideas into lively, useful and memorable websites through design and technology.`,
    shareDescription: 'Digital projects that blend design, code and curiosity to turn ideas into useful, memorable experiences.',
  },
}

export function getSite(locale: Locale) {
  const t = text[locale]
  return {
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lucasbach.dev',
    name,
    initials: 'LB',
    email: 'lucas_unzer@hotmail.com',
    ...t,
    shareTitle: `${name} — ${t.tagline.lead} ${t.tagline.emphasis}`,
  }
}

export const site = getSite('pt')

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
