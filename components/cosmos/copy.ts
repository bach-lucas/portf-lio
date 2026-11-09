import type { Locale } from '../../data/site'

/** Textos da home cósmica. Os ids dos atos (âncoras) ficam em Cosmos.tsx e são os mesmos nos dois idiomas. */
const pt = {
  acts: [
    { label: 'Início', stage: 'nebulosa' },
    { label: 'Processo', stage: 'proto-estrela' },
    { label: 'Projetos', stage: 'sistema planetário' },
    { label: 'Trajetória', stage: 'galáxia' },
    { label: 'Sobre', stage: 'buraco negro' },
    { label: 'Contato', stage: 'nova estrela' },
  ],
  nav: 'Navegação principal',
  language: 'Idioma',
  contact: 'Vamos conversar',
  hero: {
    eyebrow: 'disponível para novos projetos',
    leadBefore: 'Sou',
    leadAfter: 'Todo projeto começa como poeira solta. Role e veja como ela vira estrela.',
    scroll: 'Role para atravessar o universo',
  },
  process: {
    kicker: 'Formação estelar',
    title: 'Toda estrela começa',
    titleEm: 'como poeira.',
    lead: 'Meu processo segue a lógica do universo: juntar o que está solto até acender.',
    steps: [
      { title: 'Ouvir', text: 'A gravidade começa nas pessoas. Antes de qualquer tela, entendo o problema, quem vai usar e o que precisa mudar.' },
      { title: 'Testar cedo', text: 'O disco esquenta. Protótipos rápidos mostram o que funciona, e o que não funciona fica pelo caminho.' },
      { title: 'Acender', text: 'A fusão acontece: um site vivo, útil e publicado, que faz sentido para quem usa.' },
    ],
    numbers: [['projetos', 'publicados'], ['experiências', 'profissionais'], ['vontade de', 'aprender']],
  },
  projects: {
    kicker: 'Sistema planetário',
    titleAfterCount: 'mundos',
    titleEm: 'em órbita.',
    lead: 'Cada projeto é um planeta com clima próprio: plataformas, sites, sistemas e jogos. Continue rolando para percorrer as órbitas.',
    orbit: 'órbita',
    imageAlt: 'Tela do projeto',
    visit: 'Visitar projeto',
  },
  story: { kicker: 'Galáxia', title: 'O caminho também', titleEm: 'faz parte da obra.' },
  about: {
    kicker: 'Buraco negro',
    title: 'Menos “olha o que eu sei”.',
    titleEm: 'Mais “olha o que podemos fazer”.',
    lead: 'Gosto de trabalhar na interseção entre design e tecnologia. Meu processo começa ouvindo, passa por testar cedo e termina em algo que faz sentido para quem vai usar.',
    exploring: 'Atualmente explorando',
    topics: ['interfaces humanas', 'sites com personalidade', 'novas narrativas'],
  },
  end: {
    kicker: 'Nova estrela',
    title: 'Sua ideia pode ser',
    titleEm: 'a próxima a acender.',
    lead: 'Se você tem um projeto, um convite ou só uma curiosidade, me chama.',
    madeWith: 'feito com curiosidade',
  },
  intro: {
    label: 'Abertura do portfólio',
    soundOn: 'som ligado',
    soundOff: 'som desligado',
    skip: 'pular',
    before: 'antes do universo',
    enter: 'Entrar no universo',
    tipSound: 'melhor com fone de ouvido',
    tipMuted: 'sem som',
  },
}

export type Copy = typeof pt

// tipado pelo português: faltar ou sobrar uma chave no inglês quebra o build
const en: Copy = {
  acts: [
    { label: 'Home', stage: 'nebula' },
    { label: 'Process', stage: 'protostar' },
    { label: 'Projects', stage: 'planetary system' },
    { label: 'Journey', stage: 'galaxy' },
    { label: 'About', stage: 'black hole' },
    { label: 'Contact', stage: 'new star' },
  ],
  nav: 'Main navigation',
  language: 'Language',
  contact: 'Let’s talk',
  hero: {
    eyebrow: 'available for new projects',
    leadBefore: 'I’m',
    leadAfter: 'Every project starts as loose dust. Scroll and watch it become a star.',
    scroll: 'Scroll to travel through the universe',
  },
  process: {
    kicker: 'Star formation',
    title: 'Every star starts',
    titleEm: 'as dust.',
    lead: 'My process follows the logic of the universe: gathering what is loose until it ignites.',
    steps: [
      { title: 'Listen', text: 'Gravity starts with people. Before any screen, I understand the problem, who will use it and what needs to change.' },
      { title: 'Test early', text: 'The disk heats up. Quick prototypes show what works, and what doesn’t is left behind.' },
      { title: 'Ignite', text: 'Fusion happens: a lively, useful, published website that makes sense to the people who use it.' },
    ],
    numbers: [['published', 'projects'], ['professional', 'experiences'], ['eagerness', 'to learn']],
  },
  projects: {
    kicker: 'Planetary system',
    titleAfterCount: 'worlds',
    titleEm: 'in orbit.',
    lead: 'Each project is a planet with its own climate: platforms, websites, systems and games. Keep scrolling to travel through the orbits.',
    orbit: 'orbit',
    imageAlt: 'Screenshot of',
    visit: 'Visit project',
  },
  story: { kicker: 'Galaxy', title: 'The journey is also', titleEm: 'part of the work.' },
  about: {
    kicker: 'Black hole',
    title: 'Less “look what I know”.',
    titleEm: 'More “look what we can do”.',
    lead: 'I like working where design and technology meet. My process starts by listening, moves on to testing early and ends with something that makes sense to the people who will use it.',
    exploring: 'Currently exploring',
    topics: ['human interfaces', 'websites with personality', 'new narratives'],
  },
  end: {
    kicker: 'New star',
    title: 'Your idea could be',
    titleEm: 'the next one to ignite.',
    lead: 'If you have a project, an invitation or just a curiosity, reach out.',
    madeWith: 'made with curiosity',
  },
  intro: {
    label: 'Portfolio opening',
    soundOn: 'sound on',
    soundOff: 'sound off',
    skip: 'skip',
    before: 'before the universe',
    enter: 'Enter the universe',
    tipSound: 'best with headphones',
    tipMuted: 'no sound',
  },
}

export const copy: Record<Locale, Copy> = { pt, en }
