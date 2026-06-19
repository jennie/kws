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
        image: z.string(),
        imageCredit: z.string().optional(),
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
