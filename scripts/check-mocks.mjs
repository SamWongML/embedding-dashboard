import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, 'src')
const ALLOWED_DIR = path.join(SRC_DIR, 'mocks')

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx'])

const inlineMockPatterns = [
  /const\s+mock[A-Za-z0-9_]*\s*=\s*(\[|\{)/g,
  /const\s+mock[A-Za-z0-9_]*\s*:[^=]+=\s*(\[|\{)/g,
]

const fallbackPattern =
  /catch\s*(\([^)]*\))?\s*\{[\s\S]{0,600}?return[\s\S]{0,240}?(mock[A-Za-z0-9_]*|getMock[A-Za-z0-9_]*)/g

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(absolutePath)))
      continue
    }

    if (!entry.isFile()) continue
    const extension = path.extname(entry.name)
    if (SOURCE_EXTENSIONS.has(extension)) {
      files.push(absolutePath)
    }
  }

  return files
}

function countLine(text, index) {
  let line = 1
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (text[cursor] === '\n') line += 1
  }
  return line
}

function rel(filePath) {
  return path.relative(ROOT, filePath)
}

const files = await walk(SRC_DIR)
const violations = []

for (const filePath of files) {
  if (filePath.startsWith(ALLOWED_DIR)) continue

  const content = await readFile(filePath, 'utf8')

  for (const pattern of inlineMockPatterns) {
    pattern.lastIndex = 0
    let match
    while ((match = pattern.exec(content)) !== null) {
      violations.push({
        file: rel(filePath),
        line: countLine(content, match.index),
        reason: 'Inline mock literal outside src/mocks',
      })
    }
  }

  fallbackPattern.lastIndex = 0
  let fallbackMatch
  while ((fallbackMatch = fallbackPattern.exec(content)) !== null) {
    violations.push({
      file: rel(filePath),
      line: countLine(content, fallbackMatch.index),
      reason: 'Catch-based mock fallback outside src/mocks',
    })
  }
}

if (violations.length > 0) {
  console.error('Mock boundary violations found:\n')
  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line} ${violation.reason}`)
  }
  process.exit(1)
}

console.log('Mock boundary check passed.')
