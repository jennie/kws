// Rebuilds the site once a day. Every page is prerendered, so the homepage's
// upcoming list is frozen at build time; without a rebuild, crawlers and anyone
// without JavaScript keep seeing concerts that have already happened until the
// next Studio edit. The hook URL lives in the DAILY_REBUILD_HOOK_URL env var
// (Functions scope, production) because anyone holding it can trigger a build.
export default async () => {
  const hook = Netlify.env.get("DAILY_REBUILD_HOOK_URL");
  if (!hook) throw new Error("DAILY_REBUILD_HOOK_URL is not set");
  const res = await fetch(hook, { method: "POST" });
  if (!res.ok) throw new Error(`Build hook returned ${res.status}`);
};

// 08:30 UTC is 4:30 a.m. in Kitchener under EDT and 3:30 a.m. under EST:
// after every evening show, before anyone looks for that day's tickets.
export const config = {
  schedule: "30 8 * * *",
};
