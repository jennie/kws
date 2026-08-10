import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    concerts: defineCollection({
      type: 'page',
      source: 'concerts/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(),
        venue: z.string(),
        images: z.array(z.object({
          src: z.string(),
          description: z.string().optional(),
          credit: z.string().optional()
        })).min(1),
        description: z.string(),
        ticketUrl: z.string().optional(),
        ticketProvider: z.string().optional(),
        series: z.string().optional(),
        conductor: z.string().optional(),
        artists: z.array(z.object({
          name: z.string(),
          role: z.string()
        })).optional(),
        performances: z.array(z.object({
          date: z.string(),
          venue: z.string(),
          ticketUrl: z.string().optional(),
          ticketProvider: z.string().optional()
        })).optional()
      })
    }),
    lceEvents: defineCollection({
      type: 'data',
      source: 'lce/*.yml',
      schema: z.object({
        title: z.string(),
        date: z.string(),
        location: z.string(),
        description: z.string(),
        linkUrl: z.string().optional(),
        image: z.string().optional(),
        imageCredit: z.string().optional()
      })
    }),
    musicians: defineCollection({
      type: 'data',
      source: 'musicians/*.yml',
      schema: z.object({
        name: z.string(),
        section: z.enum(['Strings', 'Woodwinds', 'Brass', 'Percussion', 'Harp & Keyboard']),
        instrument: z.string(),
        chair: z.string().optional(),
        photo: z.string().optional(),
        order: z.number().optional(),
        bio: z.string().optional()
      })
    }),
    jobs: defineCollection({
      type: 'page',
      source: 'about/jobs.md',
      schema: z.object({
        intro: z.string(),
        emptyTitle: z.string(),
        emptyMessage: z.string(),
        aboutOpen: z.string(),
        aboutEmpty: z.string()
      })
    }),
    pages: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        exclude: ['concerts/**', 'about/jobs.md']
      }
    })
  }
})
