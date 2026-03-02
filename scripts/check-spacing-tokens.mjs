import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const APP_DIR = path.join(ROOT, 'src', 'app')
const DASHBOARD_LAYOUT_DIR = path.join(ROOT, 'src', 'components', 'dashboard', 'layout')
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx'])

const hardcodedPaddingClassPattern = /\b(?:p|px|py|pt|pb)-(?:\d+(?:\.5)?|px|\[[^\]]+\])\b/g

const MICRO_ALLOWLIST = new Set([
  'p-0',
  'px-0',
  'py-0',
  'pt-0',
  'pb-0',
  'p-px',
  'px-px',
  'py-px',
  'pt-px',
  'pb-px',
  'p-1',
  'px-1',
  'py-1',
  'pt-1',
  'pb-1',
  'p-1.5',
  'px-1.5',
  'py-1.5',
  'pt-1.5',
  'pb-1.5',
  'p-2',
  'px-2',
  'py-2',
  'pt-2',
  'pb-2',
])

function normalize(filePath) {
  return filePath.split(path.sep).join('/')
}

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

function shouldCheckFile(filePath) {
  const normalizedPath = normalize(filePath)
  const normalizedDashboardLayout = normalize(DASHBOARD_LAYOUT_DIR)
  const normalizedAppDir = normalize(APP_DIR)

  if (normalizedPath.startsWith(normalizedDashboardLayout)) {
    return true
  }

  if (!normalizedPath.startsWith(normalizedAppDir)) {
    return false
  }

  if (normalizedPath.endsWith('/layout.tsx')) {
    return true
  }

  return normalizedPath === normalize(path.join(APP_DIR, 'login', 'page.tsx'))
}

const appFiles = await walk(APP_DIR)
const dashboardLayoutFiles = await walk(DASHBOARD_LAYOUT_DIR)
const files = [...new Set([...appFiles, ...dashboardLayoutFiles])]
const violations = []

for (const filePath of files) {
  if (!shouldCheckFile(filePath)) continue

  const content = await readFile(filePath, 'utf8')
  hardcodedPaddingClassPattern.lastIndex = 0

  let match
  while ((match = hardcodedPaddingClassPattern.exec(content)) !== null) {
    const className = match[0]
    if (MICRO_ALLOWLIST.has(className)) continue

    violations.push({
      file: rel(filePath),
      line: countLine(content, match.index),
      className,
      reason:
        'Hardcoded page/layout padding utility is forbidden in shell entrypoints. Use semantic spacing tokens.',
    })
  }
}

if (violations.length > 0) {
  console.error('Spacing token boundary violations found:\n')
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} ${violation.reason} (${violation.className})`
    )
  }
  process.exit(1)
}

console.log('Spacing token boundary check passed.')
