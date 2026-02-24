import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const scriptPath = path.join(process.cwd(), "scripts/check-typography.mjs")
const temporaryDirectories: string[] = []

function createTemporaryWorkspace() {
  const directory = mkdtempSync(path.join(tmpdir(), "check-typography-"))
  temporaryDirectories.push(directory)
  mkdirSync(path.join(directory, "src"), { recursive: true })
  return directory
}

function runCheck(cwd: string) {
  return execFileSync(process.execPath, [scriptPath], {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  })
}

describe("check-typography script", () => {
  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it("passes when source files use tokenized typography classes", () => {
    const cwd = createTemporaryWorkspace()
    writeFileSync(
      path.join(cwd, "src", "example.tsx"),
      'export function Example() { return <p className="typography-size-sm typography-weight-medium">Ready</p> }'
    )

    const output = runCheck(cwd)
    expect(output).toContain("Typography boundary check passed.")
  })

  it("fails when source files contain forbidden raw typography classes", () => {
    const cwd = createTemporaryWorkspace()
    writeFileSync(
      path.join(cwd, "src", "example.tsx"),
      'export function Example() { return <p className="text-sm font-medium">Blocked</p> }'
    )

    try {
      runCheck(cwd)
      throw new Error("Expected typography check to fail")
    } catch (error) {
      const commandError = error as { stderr?: string }
      const stderr = commandError.stderr ?? ""
      expect(stderr).toContain("Typography boundary violations found")
      expect(stderr).toContain("src/example.tsx")
      expect(stderr).toContain("(text-sm)")
      expect(stderr).toContain("(font-medium)")
    }
  })
})
