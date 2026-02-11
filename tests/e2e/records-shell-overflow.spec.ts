import { expect, test } from "@playwright/test"

test.describe("Records shell overflow behavior", () => {
  test.use({ viewport: { width: 980, height: 900 } })

  test("keeps horizontal overflow local to the records table", async ({ page }) => {
    await page.goto("/records")
    await expect(
      page.getByRole("heading", { name: "Embedding Records" })
    ).toBeVisible()

    const documentMetrics = await page.evaluate(() => {
      const doc = document.documentElement
      return {
        clientWidth: doc.clientWidth,
        scrollWidth: doc.scrollWidth,
      }
    })

    expect(documentMetrics.scrollWidth).toBe(documentMetrics.clientWidth)

    const documentScrollX = await page.evaluate(() => {
      window.scrollTo({ left: 999, top: 0 })
      return window.scrollX
    })

    expect(documentScrollX).toBe(0)

    const topLeftHit = await page.evaluate(() => {
      const hit = document.elementFromPoint(20, 20)
      const insideSidebar = Boolean(
        hit?.closest(
          '[data-slot="sidebar-container"], [data-slot="sidebar-inner"], [data-slot="sidebar"]'
        )
      )

      return {
        tag: hit?.tagName ?? null,
        insideSidebar,
      }
    })

    expect(topLeftHit.tag).not.toBe("HEADER")
    expect(topLeftHit.insideSidebar).toBe(true)

    const tableScrollMetrics = await page.evaluate(() => {
      const tableContainer = document.querySelector(
        '[data-slot="table-container"]'
      ) as HTMLDivElement | null

      if (!tableContainer) {
        return null
      }

      const table = tableContainer.querySelector(
        '[data-slot="table"]'
      ) as HTMLTableElement | null
      const scrollAreaViewport = tableContainer.closest(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement | null

      const getScrollableElement = () => {
        const candidates = [tableContainer, scrollAreaViewport].filter(
          (candidate): candidate is HTMLElement => Boolean(candidate)
        )

        return (
          candidates.find(
            (candidate) => candidate.scrollWidth > candidate.clientWidth
          ) ?? null
        )
      }

      // If current data fits exactly, widen the table to verify overflow stays local.
      if (table && !getScrollableElement()) {
        table.style.minWidth = `${tableContainer.clientWidth + 200}px`
      }

      const horizontalScroller = getScrollableElement()

      if (!horizontalScroller) {
        return {
          clientWidth: tableContainer.clientWidth,
          scrollWidth: tableContainer.scrollWidth,
          scrollLeftBefore: tableContainer.scrollLeft,
          scrollLeftAfter: tableContainer.scrollLeft,
          canScroll: false,
          scrollerSlot: null,
        }
      }

      const scrollWidth = horizontalScroller.scrollWidth
      const clientWidth = horizontalScroller.clientWidth
      const scrollLeftBefore = horizontalScroller.scrollLeft
      horizontalScroller.scrollLeft = Math.floor(scrollWidth / 2)
      const scrollLeftAfter = horizontalScroller.scrollLeft

      return {
        clientWidth,
        scrollWidth,
        scrollLeftBefore,
        scrollLeftAfter,
        canScroll: true,
        scrollerSlot: horizontalScroller.getAttribute("data-slot"),
      }
    })

    expect(tableScrollMetrics).not.toBeNull()
    if (!tableScrollMetrics) {
      return
    }

    expect(tableScrollMetrics.canScroll).toBe(true)
    expect(tableScrollMetrics.scrollWidth).toBeGreaterThan(tableScrollMetrics.clientWidth)
    expect(tableScrollMetrics.scrollLeftAfter).toBeGreaterThan(
      tableScrollMetrics.scrollLeftBefore
    )
  })
})
