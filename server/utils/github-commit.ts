/**
 * Minimal GitHub Git Data API client, enough to write several files in a single
 * commit.
 *
 * The simpler Contents API only writes one file per call, which would mean two
 * commits (and two Netlify builds) for an event that has an image, with the
 * entry briefly live pointing at an image that doesn't exist yet. The Git Data
 * API costs a few more requests and gets one atomic commit instead.
 */

const API = 'https://api.github.com'

export interface CommitFile {
  /** Repo-relative path, no leading slash. */
  path: string
  /** Raw bytes. Text files should be UTF-8 encoded by the caller. */
  content: Buffer
}

export interface CommitOptions {
  token: string
  owner: string
  repo: string
  branch: string
  message: string
  author: { name: string, email: string }
  files: CommitFile[]
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'kwsymphony-site'
  }
}

/** True if `path` already exists on `branch`. */
export async function fileExists(
  options: Pick<CommitOptions, 'token' | 'owner' | 'repo' | 'branch'> & { path: string }
): Promise<boolean> {
  const { token, owner, repo, branch, path } = options
  const response = await $fetch.raw(
    `${API}/repos/${owner}/${repo}/contents/${encodeURI(path)}`,
    {
      query: { ref: branch },
      headers: headers(token),
      ignoreResponseError: true
    }
  )
  if (response.status === 200) return true
  if (response.status === 404) return false
  // Anything else (401, a rate-limit 403, a 5xx) is not evidence of absence,
  // and treating it as such would let the commit below overwrite a real entry.
  throw createError({
    statusCode: 502,
    statusMessage: `Could not reach GitHub to check for an existing entry (${response.status}).`
  })
}

/** Commit every file in one commit and fast-forward the branch to it. */
export async function commitFiles(options: CommitOptions): Promise<string> {
  const { token, owner, repo, branch, message, author, files } = options
  const base = `${API}/repos/${owner}/${repo}/git`
  const request = { headers: headers(token) }

  const ref = await $fetch<{ object: { sha: string } }>(
    `${base}/ref/heads/${branch}`,
    request
  )
  const parentSha = ref.object.sha

  const parent = await $fetch<{ tree: { sha: string } }>(
    `${base}/commits/${parentSha}`,
    request
  )

  const blobs = await Promise.all(
    files.map(file =>
      $fetch<{ sha: string }>(`${base}/blobs`, {
        ...request,
        method: 'POST',
        body: { content: file.content.toString('base64'), encoding: 'base64' }
      })
    )
  )

  const tree = await $fetch<{ sha: string }>(`${base}/trees`, {
    ...request,
    method: 'POST',
    body: {
      base_tree: parent.tree.sha,
      tree: files.map((file, index) => ({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobs[index]!.sha
      }))
    }
  })

  const commit = await $fetch<{ sha: string }>(`${base}/commits`, {
    ...request,
    method: 'POST',
    body: {
      message,
      tree: tree.sha,
      parents: [parentSha],
      author: { ...author, date: new Date().toISOString() }
    }
  })

  // Not forced: if someone (Studio, a push) moved the branch since we read the
  // parent, this fails rather than discarding their commit.
  await $fetch(`${base}/refs/heads/${branch}`, {
    ...request,
    method: 'PATCH',
    body: { sha: commit.sha }
  })

  return commit.sha
}
