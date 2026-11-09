import type { Locale } from './site'

const projectTypeNames = {
  pt: { design: 'Web design', code: 'Código' },
  en: { design: 'Web design', code: 'Code' },
} satisfies Record<Locale, Record<string, string>>

type ProjectType = keyof typeof projectTypeNames.pt

export const projectTypes = Object.values(projectTypeNames.pt)

export type Project = { title: string; description: string; type: string; number: string; visual: string; word: string; symbol: string; detail: string; image?: string; url?: string }

type ProjectText = { title?: string; description: string; detail: string }

const formatIndex = (value: number) => String(value).padStart(2, '0')

// `title` no texto de um idioma substitui o nome comum só naquele idioma
const projectList: ({ title: string; type: ProjectType; visual: string; word: string; symbol: string; image?: string; url?: string } & Record<Locale, ProjectText>)[] = [
  {
    title: 'Connect Executive Hub', type: 'code', visual: 'visual-shot', word: 'connect', symbol: '◎', image: '/connect-hub-home.jpg', url: 'https://connectexecutivehub.com',
    pt: { description: 'A plataforma de uma confraria de executivos, com membership, jornada, marketplace, área de membros e dezenas de páginas de eventos.', detail: 'Plataforma completa, painel administrativo e automações' },
    en: { description: 'The platform of an executive community, with membership, member journey, marketplace, members area and dozens of event pages.', detail: 'Full platform, admin panel and automations' },
  },
  {
    title: 'CRM Connect', type: 'code', visual: 'visual-shot', word: 'crm', symbol: '◇', image: '/connect-crm-login.jpg',
    pt: { description: 'Um CRM sob medida para centralizar leads, eventos, funil de membros e tarefas da equipe, sem cadastros duplicados.', detail: 'Sistema interno, regras de negócio e segurança de dados' },
    en: { description: 'A custom CRM that brings together leads, events, the membership funnel and team tasks, with no duplicate records.', detail: 'Internal system, business rules and data security' },
  },
  {
    title: 'Leading the Change 2027', type: 'design', visual: 'visual-shot', word: 'change', symbol: '↗', image: '/leading-change-home.jpg', url: 'https://leadingchange.connectexecutivehub.com',
    pt: { description: 'O site do programa executivo do Connect com a NOVA SBE, com pré-matrícula, checkout e imersão internacional em Lisboa.', detail: 'Landing page, formulários e pagamento' },
    en: { description: 'The website for Connect’s executive program with NOVA SBE, with pre-enrollment, checkout and an international immersion in Lisbon.', detail: 'Landing page, forms and payments' },
  },
  {
    title: 'As Conexões Movem o Mundo', type: 'design', visual: 'visual-shot', word: 'livro', symbol: '❡', image: '/livro-connect-home.jpg', url: 'https://connect-legay.lovable.app',
    pt: { description: 'Um convite editorial para a coautoria de um livro bilíngue, com área do coautor, contratos digitais e painel de inscrições.', detail: 'Landing editorial, área logada e administração' },
    en: { description: 'An editorial invitation to co-author a bilingual book, with a co-author area, digital contracts and a sign-up dashboard.', detail: 'Editorial landing page, logged-in area and admin' },
  },
  {
    title: 'Connect Partnerships 2027', type: 'design', visual: 'visual-shot', word: 'partners', symbol: '+', image: '/connect-partnerships-home.jpg', url: 'https://relacional.connectexecutivehub.com',
    pt: { description: 'Uma proposta digital de patrocínio que apresenta formatos de parceria, valores e a jornada das marcas no ecossistema Connect.', detail: 'Narrativa visual, cena 3D e captação de leads' },
    en: { description: 'A digital sponsorship proposal presenting partnership formats, pricing and the brand journey within the Connect ecosystem.', detail: 'Visual storytelling, 3D scene and lead capture' },
  },
  {
    title: 'Opus Nexus', type: 'code', visual: 'visual-shot', word: 'nexus', symbol: '✦', image: '/opus-nexus-bot.jpg', url: 'https://opus-nexus-mu.vercel.app',
    pt: { description: 'Um jogo de cartas de supercarros com multiplayer online em tempo real, duelo contra bot e modo de treino em tela dividida.', detail: 'Game design, tempo real e animações' },
    en: { description: 'A supercar card game with real-time online multiplayer, bot duels and a split-screen practice mode.', detail: 'Game design, real time and animations' },
  },
  {
    title: 'Site do Coral', type: 'design', visual: 'visual-dark', word: 'coral', symbol: '◌', image: '/coral-dashboard.png',
    pt: { description: 'Uma experiência digital criada para reunir música, pessoas e comunidade em um só lugar.', detail: 'Direção visual, interface e desenvolvimento' },
    en: { title: 'Choir Website', description: 'A digital experience built to bring music, people and community together in one place.', detail: 'Visual direction, interface and development' },
  },
  {
    title: 'Site dos Clans', type: 'code', visual: 'visual-purple', word: 'clans', symbol: '→', url: 'https://warchaos-clans-g9hz6lwm4-lucasbachs-projects.vercel.app',
    pt: { description: 'Uma interface criada para dar visibilidade aos clans e fortalecer a conexão entre seus integrantes.', detail: 'Experiência do usuário, interface e desenvolvimento' },
    en: { title: 'Clans Website', description: 'An interface built to give clans visibility and strengthen the connection between their members.', detail: 'User experience, interface and development' },
  },
]

export const getProjects = (locale: Locale): Project[] =>
  projectList.map(({ pt, en, type, ...project }, index) => ({
    ...project,
    ...{ pt, en }[locale],
    type: projectTypeNames[locale][type],
    number: formatIndex(index + 1),
  }))

export const projects = getProjects('pt')
export const projectCount = formatIndex(projects.length)
