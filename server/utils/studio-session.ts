import type { H3Event } from 'h3'

/**
 * The payload nuxt-studio seals into its `studio-session` cookie at login.
 * See node_modules/nuxt-studio/.../server/utils/session.ts.
 *
 * `accessToken` is the *repository* token, not a credential belonging to the
 * signed-in person: for Google logins Studio reads STUDIO_GITHUB_TOKEN from the
 * environment and stores that. Identity comes from `name`/`email`, which is what
 * we attribute commits to.
 */
export interface StudioUser {
  providerId: string
  name: string
  email: string
  avatar?: string
  provider: string
  accessToken: string
}

/**
 * Read the existing Studio session. We deliberately reuse Studio's own cookie
 * and secret rather than introducing a second login: the LCE entry form is
 * gated on Studio access, granted by adding an address to
 * STUDIO_GOOGLE_MODERATORS.
 *
 * Cookie options must match the ones Studio seals with, or the cookie won't
 * unseal.
 */
async function readStudioSession(event: H3Event) {
  return useSession<{ user?: StudioUser }>(event, {
    name: 'studio-session',
    password: useRuntimeConfig(event).studio.auth.sessionSecret,
    cookie: {
      secure: getRequestProtocol(event) === 'https',
      path: '/'
    }
  })
}

export async function getStudioUser(event: H3Event): Promise<StudioUser | null> {
  const session = await readStudioSession(event)
  return session.data.user ?? null
}

export async function requireStudioUser(event: H3Event): Promise<StudioUser> {
  const user = await getStudioUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sign in with your KWS Google account to publish events.'
    })
  }
  return user
}
