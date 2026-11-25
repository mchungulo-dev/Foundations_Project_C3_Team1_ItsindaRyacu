import { en } from "../src/i18n/locales/en.ts"
import { rw } from "../src/i18n/locales/rw.ts"

const names = (text) =>
  [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",")

const problems = []
for (const key of Object.keys(en)) {
  if (!(key in rw)) {
    problems.push(`missing in rw.ts: ${key}`)
  } else if (names(en[key]) !== names(rw[key])) {
    problems.push(`placeholders differ: ${key}`)
  }
}
for (const key of Object.keys(rw)) {
  if (!(key in en)) {
    problems.push(`only in rw.ts: ${key}`)
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"))
  process.exit(1)
}
console.log(`i18n: ${Object.keys(en).length} messages, both languages match`)
