import type { Metadata } from 'next'
import './globals.css'
import { projects } from '../data/projects'
import { contactHref, sections, site, socialLinks } from '../data/site'

const personId = `${site.url}/#person`
const ogImage = { url: '/og.png', width: 1730, height: 909, alt: site.shareTitle }

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.title,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    site.name,
    'desenvolvedor web',
    'web design',
    'desenvolvimento front-end',
    'experiências digitais',
    'portfólio',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: site.title,
    title: site.shareTitle,
    description: site.shareDescription,
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.shareTitle,
    description: site.shareDescription,
    images: [ogImage.url],
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': personId,
      name: site.name,
      url: site.url,
      email: contactHref,
      jobTitle: site.role,
      sameAs: socialLinks.map((link) => link.url),
      knowsAbout: [
        'Desenvolvimento web',
        'Web design',
        'Experiência do usuário',
        'Interfaces digitais',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.title,
      description: `Projetos digitais, experimentos e trajetória de ${site.name}.`,
      inLanguage: 'pt-BR',
      author: { '@id': personId },
    },
    {
      '@type': 'ItemList',
      '@id': `${site.url}/#${sections.projects.id}`,
      name: 'Projetos selecionados',
      itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: project.title,
          ...(project.url && { url: project.url }),
          description: project.description,
          creator: { '@id': personId },
        },
      })),
    },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  )
}
