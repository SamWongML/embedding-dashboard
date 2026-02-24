import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const ROOT = process.cwd()
const SRC_DIR = path.join(ROOT, "src")
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"])

const forbiddenTypographyClassPattern =
  /\b(?:text-(?:xs|sm|base|lg|xl|2xl|\[[^\]]+\])|font-(?:normal|medium|semibold|bold|mono))\b/g

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
    if (text[cursor] === "\n") line += 1
  }
  return line
}

function rel(filePath) {
  return path.relative(ROOT, filePath)
}

const files = await walk(SRC_DIR)
const violations = []

for (const filePath of files) {
  const content = await readFile(filePath, "utf8")
  forbiddenTypographyClassPattern.lastIndex = 0

  let match
  while ((match = forbiddenTypographyClassPattern.exec(content)) !== null) {
    violations.push({
      file: rel(filePath),
      line: countLine(content, match.index),
      className: match[0],
      reason: "Raw typography utility class is forbidden. Use typography token utilities or component token variables.",
    })
  }
}

if (violations.length > 0) {
  console.error("Typography boundary violations found:\n")
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} ${violation.reason} (${violation.className})`
    )
  }
  process.exit(1)
}

console.log("Typography boundary check passed.")
