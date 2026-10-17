// The clock the upcoming lists are cut against. Pages are prerendered, so the
// first reading is the build time; it travels in the payload so hydration draws
// the same list as the static HTML, then the browser's clock replaces it once
// the page is mounted and anything that has since started drops off.
export function useNow() {
  const now = useState('now', () => Date.now())
  onMounted(() => {
    now.value = Date.now()
  })
  return now
}
