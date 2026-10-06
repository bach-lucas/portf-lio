export const projectTypes = ['Web design', 'Código'] as const

export type Project = { title: string; description: string; type: (typeof projectTypes)[number]; number: string; visual: string; word: string; symbol: string; detail: string; image?: string; url?: string }

const formatIndex = (value: number) => String(value).padStart(2, '0')

const projectList: Omit<Project, 'number'>[] = [
  { title: 'Connect Executive Hub', description: 'A plataforma de uma confraria de executivos, com membership, jornada, marketplace, área de membros e dezenas de páginas de eventos.', type: 'Código', visual: 'visual-shot', word: 'connect', symbol: '◎', detail: 'Plataforma completa, painel administrativo e automações', image: '/connect-hub-home.jpg', url: 'https://connectexecutivehub.com' },
  { title: 'CRM Connect', description: 'Um CRM sob medida para centralizar leads, eventos, funil de membros e tarefas da equipe, sem cadastros duplicados.', type: 'Código', visual: 'visual-shot', word: 'crm', symbol: '◇', detail: 'Sistema interno, regras de negócio e segurança de dados', image: '/connect-crm-login.jpg' },
  { title: 'Leading the Change 2027', description: 'O site do programa executivo do Connect com a NOVA SBE, com pré-matrícula, checkout e imersão internacional em Lisboa.', type: 'Web design', visual: 'visual-shot', word: 'change', symbol: '↗', detail: 'Landing page, formulários e pagamento', image: '/leading-change-home.jpg', url: 'https://leadingchange.connectexecutivehub.com' },
  { title: 'As Conexões Movem o Mundo', description: 'Um convite editorial para a coautoria de um livro bilíngue, com área do coautor, contratos digitais e painel de inscrições.', type: 'Web design', visual: 'visual-shot', word: 'livro', symbol: '❡', detail: 'Landing editorial, área logada e administração', image: '/livro-connect-home.jpg', url: 'https://connect-legay.lovable.app' },
  { title: 'Connect Partnerships 2027', description: 'Uma proposta digital de patrocínio que apresenta formatos de parceria, valores e a jornada das marcas no ecossistema Connect.', type: 'Web design', visual: 'visual-shot', word: 'partners', symbol: '+', detail: 'Narrativa visual, cena 3D e captação de leads', image: '/connect-partnerships-home.jpg', url: 'https://relacional.connectexecutivehub.com' },
  { title: 'Opus Nexus', description: 'Um jogo de cartas de supercarros com multiplayer online em tempo real, duelo contra bot e modo de treino em tela dividida.', type: 'Código', visual: 'visual-shot', word: 'nexus', symbol: '✦', detail: 'Game design, tempo real e animações', image: '/opus-nexus-bot.jpg', url: 'https://opus-nexus-mu.vercel.app' },
  { title: 'Site do Coral', description: 'Uma experiência digital criada para reunir música, pessoas e comunidade em um só lugar.', type: 'Web design', visual: 'visual-dark', word: 'coral', symbol: '◌', detail: 'Direção visual, interface e desenvolvimento', image: '/coral-dashboard.png' },
  { title: 'Site dos Clans', description: 'Uma interface criada para dar visibilidade aos clans e fortalecer a conexão entre seus integrantes.', type: 'Código', visual: 'visual-purple', word: 'clans', symbol: '→', detail: 'Experiência do usuário, interface e desenvolvimento', url: 'https://warchaos-clans-g9hz6lwm4-lucasbachs-projects.vercel.app' },
]

export const projects: Project[] = projectList.map((project, index) => ({ ...project, number: formatIndex(index + 1) }))
export const projectCount = formatIndex(projects.length)
