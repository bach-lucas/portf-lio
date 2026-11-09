import type { MetadataRoute } from 'next'
import { localeInfo, locales, site } from '../data/site'

const languages = Object.fromEntries(locales.map((l) => [localeInfo[l].htmlLang, new URL(localeInfo[l].path, site.url).href]))

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((l) => ({
    url: new URL(localeInfo[l].path, site.url).href,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
    alternates: { languages },
  }))
}
