import { z } from 'zod'
import { requireStudioUser } from '../utils/studio-session'
import { commitFiles, fileExists, type CommitFile } from '../utils/github-commit'

/**
 * Publish one learning and community engagement event.
 *
 * Writes content/lce/<date>-<slug>.yml (plus the uploaded image, if any) as a
 * single commit on the branch this deploy tracks. Netlify rebuilds from that
 * commit; there is no review step, matching the SOW's "entries publish
 * directly".
 *
 * The shape below mirrors the `lceEvents` collection in content.config.ts. It
 * is deliberately a separate declaration: @nuxt/content ships its own nested
 * copy of zod, and importing the collection schema here would both cross zod
 * instances and pull @nuxt/content (and better-sqlite3) into the function
 * bundle. Keep the two in sync by hand.
 */

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value

const MAX_IMAGE_BYTES = 4 * 1024 * 1024

const IMAGE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
} as const

type ImageType = keyof typeof IMAGE_EXTENSIONS

const bodySchema = z.object({
  title: z.string().trim().min(1, 'Add a title.').max(200),
  // Split date and time so the form can use a native date picker, which is what
  // the SOW asks for and what Studio's plain text field doesn't give.
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.'),
  time: z.preprocess(emptyToUndefined, z.string().regex(/^\d{2}:\d{2}$/).optional()),
  location: z.string().trim().min(1, 'Add a location.').max(200),
  description: z.string().trim().min(1, 'Add a description.').max(2000),
  linkUrl: z.preprocess(emptyToUndefined, z.url('Enter a full web address, starting with https://').max(500).optional()),
  imageCredit: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  image: z.object({
    type: z.enum(['image/jpeg', 'image/png', 'image/webp'] satisfies ImageType[]),
    data: z.string().min(1)
  }).optional()
})

function slugify(title: string) {
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')
}

/**
 * Existing content files use unquoted scalars, so match that where the value
 * allows it and fall back to double quotes where it doesn't. Anything that
 * fails the plain test is still valid YAML, just noisier.
 */
function yamlScalar(value: string) {
  // Leading "/" is allowed so image paths serialize bare, the way the existing
  // concert files write them.
  const isPlain = /^[A-Za-z0-9/][^\n]*$/.test(value)
    && !/:\s|\s#/.test(value)
    && !/[:\s]$/.test(value)
  return isPlain ? value : JSON.stringify(value)
}

function yamlField(key: string, value: string) {
  if (value.includes('\n')) {
    const indented = value.split('\n').map(line => `  ${line}`).join('\n')
    return `${key}: |-\n${indented}\n`
  }
  return `${key}: ${yamlScalar(value)}\n`
}

export default defineEventHandler(async (event) => {
  const user = await requireStudioUser(event)

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Some fields need fixing.',
      data: { errors: z.flattenError(parsed.error).fieldErrors }
    })
  }
  const entry = parsed.data

  const { owner, repo, branch } = useRuntimeConfig(event).public.studio.repository
  const token = user.accessToken

  const slug = slugify(entry.title)
  if (!slug) {
    throw createError({ statusCode: 422, statusMessage: 'Give the event a title with some letters or numbers in it.' })
  }
  const contentPath = `content/lce/${entry.date}-${slug}.yml`

  if (await fileExists({ token, owner, repo, branch, path: contentPath })) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An event with this title already exists on this date. Change the title, or edit the existing event.'
    })
  }

  const files: CommitFile[] = []

  let imagePath: string | undefined
  if (entry.image) {
    const bytes = Buffer.from(entry.image.data, 'base64')
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      throw createError({ statusCode: 413, statusMessage: 'That image is too large. Try one under 4 MB.' })
    }
    imagePath = `/images/lce/${entry.date}-${slug}.${IMAGE_EXTENSIONS[entry.image.type]}`
    files.push({ path: `public${imagePath}`, content: bytes })
  }

  // Key order follows what Studio reserializes to, so opening an entry there
  // doesn't rewrite the file it didn't change.
  let yaml = ''
  yaml += yamlField('title', entry.title)
  yaml += yamlField('date', `${entry.date}T${entry.time ?? '00:00'}:00`)
  yaml += yamlField('description', entry.description)
  yaml += yamlField('location', entry.location)
  if (entry.linkUrl) yaml += yamlField('linkUrl', entry.linkUrl)
  if (imagePath) yaml += yamlField('image', imagePath)
  if (entry.imageCredit) yaml += yamlField('imageCredit', entry.imageCredit)

  files.push({ path: contentPath, content: Buffer.from(yaml, 'utf8') })

  const commit = await commitFiles({
    token,
    owner,
    repo,
    branch,
    message: `Add community event: ${entry.title}`,
    author: { name: user.name, email: user.email },
    files
  })

  return { path: contentPath, imagePath, commit }
})
