import type { Locale } from './site'

export type Experience = { period: string; role: string; company: string; description: string }

type ExperienceText = Omit<Experience, 'company'>

const experienceList: ({ company: string } & Record<Locale, ExperienceText>)[] = [
  {
    company: 'Connect Executive Hub',
    pt: { period: 'Ago/2026 – atual', role: 'Desenvolvedor Full Stack', description: 'Construção da plataforma completa de uma confraria de executivos: dezenas de páginas de eventos, painel administrativo com CRM, automações de e-mail e WhatsApp e trilha de auditoria, com React, TypeScript e Supabase.' },
    en: { period: 'Aug 2026 – present', role: 'Full Stack Developer', description: 'Building the complete platform of an executive community: dozens of event pages, an admin panel with CRM, email and WhatsApp automations and an audit trail, with React, TypeScript and Supabase.' },
  },
  {
    company: 'CONSILOS',
    pt: { period: 'Set/2025 – Jul/2026', role: 'Assistente de Processos', description: 'Mapeamento e automação de processos com BPMN na plataforma Zeev, aplicando Lean, PDCA e Lean Six Sigma na estruturação do Comitê de Inovação.' },
    en: { period: 'Sep 2025 – Jul 2026', role: 'Process Assistant', description: 'Process mapping and automation with BPMN on the Zeev platform, applying Lean, PDCA and Lean Six Sigma to set up the Innovation Committee.' },
  },
  {
    company: 'Algi Consultoria',
    pt: { period: 'Ago/2025 – Fev/2026', role: 'Desenvolvedor Web', description: 'Desenvolvimento e manutenção de aplicações e APIs com PHP, MySQL e JavaScript, com foco em desempenho e integração entre sistemas.' },
    en: { period: 'Aug 2025 – Feb 2026', role: 'Web Developer', description: 'Development and maintenance of applications and APIs with PHP, MySQL and JavaScript, focused on performance and system integration.' },
  },
  {
    company: 'Alfama Foods',
    pt: { period: 'Set/2024 – Fev/2025', role: 'Desenvolvedor de Software', description: 'Intranet corporativa em React.js e API integrada ao Microsoft Graph para automatizar a gestão de eventos internos.' },
    en: { period: 'Sep 2024 – Feb 2025', role: 'Software Developer', description: 'Corporate intranet in React.js and an API integrated with Microsoft Graph to automate internal event management.' },
  },
]

export const getExperiences = (locale: Locale): Experience[] => experienceList.map(({ company, [locale]: t }) => ({ company, ...t }))

export const experiences = getExperiences('pt')
