import type { Metadata } from 'next'
import './globals.css'
import '../components/cosmos/cosmos.css'
import { Cosmos } from '../components/cosmos/Cosmos'
import { introGate } from '../components/cosmos/opening'
import { getProjects } from '../data/projects'
import { contactHref, getSite, localeInfo, locales, sections, socialLinks, type Locale } from '../data/site'

/** Base comum das duas raízes, app/(pt) e app/(en)/en: cada idioma tem a sua para o <html lang> sair certo. */

const seoText = {
  pt: {
    keywords: ['desenvolvedor web', 'web design', 'desenvolvimento front-end', 'experiências digitais', 'portfólio'],
    knowsAbout: ['Desenvolvimento web', 'Web design', 'Experiência do usuário', 'Interfaces digitais'],
    websiteDescription: (name: string) => `Projetos digitais, experimentos e trajetória de ${name}.`,
    projectsName: 'Projetos selecionados',
  },
  en: {
    keywords: ['web developer', 'web design', 'front-end development', 'digital experiences', 'portfolio'],
    knowsAbout: ['Web development', 'Web design', 'User experience', 'Digital interfaces'],
    websiteDescription: (name: string) => `Digital projects, experiments and career journey of ${name}.`,
    projectsName: 'Selected projects',
  },
}

const languageAlternates = Object.fromEntries(locales.map((l) => [localeInfo[l].htmlLang, localeInfo[l].path]))

export function buildMetadata(locale: Locale): Metadata {
  const site = getSite(locale)
  const info = localeInfo[locale]
  const ogImage = { url: '/og.png', width: 1730, height: 909, alt: site.shareTitle }
  return {
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
    keywords: [site.name, ...seoText[locale].keywords],
    alternates: {
      canonical: info.path,
      languages: { ...languageAlternates, 'x-default': localeInfo.pt.path },
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
      locale: info.ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeInfo[l].ogLocale),
      url: info.path,
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
}

function structuredData(locale: Locale) {
  const site = getSite(locale)
  const seo = seoText[locale]
  const personId = `${site.url}/#person`
  return {
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
        knowsAbout: seo.knowsAbout,
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.title,
        description: seo.websiteDescription(site.name),
        inLanguage: localeInfo[locale].htmlLang,
        author: { '@id': personId },
      },
      {
        '@type': 'ItemList',
        '@id': `${site.url}/#${sections.projects.id}`,
        name: seo.projectsName,
        itemListElement: getProjects(locale).map((project, index) => ({
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
}

export function RootDocument({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    // o script da abertura (components/cosmos/opening.ts) marca o <html> antes de o React hidratar
    <html lang={localeInfo[locale].htmlLang} suppressHydrationWarning>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(locale)) }}
        />
      </body>
    </html>
  )
}

export function CosmosHome({ locale }: { locale: Locale }) {
  return <>
    <script dangerouslySetInnerHTML={{ __html: introGate }} />
    <Cosmos locale={locale} />
  </>
}
