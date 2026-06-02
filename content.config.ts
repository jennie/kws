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
        description: z.string(),
        ticketUrl: z.string().optional(),
        ticketProvider: z.string().optional(),
        series: z.string().optional(),
        conductor: z.string().optional(),
        artists: z.array(z.object({
          name: z.string(),
          role: z.string()
        })).optional()
      })
    }),
    pages: defineCollection({
      type: 'page',
      source: {
        include: '*.md',
        exclude: ['concerts/**']
      }
    })
  }
})
