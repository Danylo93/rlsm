import type { MetadataRoute } from 'next'
import { site } from '@/data/site'

export default function sitemap(): MetadataRoute.Sitemap {
    const url = site.url.replace(/\/$/, '')
    return [
        {
            url,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
    ]
}