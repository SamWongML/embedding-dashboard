import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

function readProjectFile(filePath: string) {
  return readFileSync(path.join(process.cwd(), filePath), "utf8")
}

describe("font wiring", () => {
  it("uses centralized Geist fonts in the root layout", () => {
    const source = readProjectFile("src/app/layout.tsx")

    expect(source).toContain("import { geistMono, geistSans } from '@/lib/design/fonts'")
    expect(source).toContain("className={`${geistSans.variable} ${geistMono.variable}`}")
    expect(source).not.toContain("Inter")
  })

  it("defines Geist sans and mono font exports with CSS variables", () => {
    const source = readProjectFile("src/lib/design/fonts.ts")

    expect(source).toContain("Geist")
    expect(source).toContain("Geist_Mono")
    expect(source).toContain('variable: "--font-geist-sans"')
    expect(source).toContain('variable: "--font-geist-mono"')
  })
})
