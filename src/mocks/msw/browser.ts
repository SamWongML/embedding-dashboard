import { setupWorker } from 'msw/browser'
import type { DevApiScenario } from '@/lib/runtime/dev-api-scenario'
import { handlers } from '@/mocks/msw/handlers'
import { getScenarioHandlers } from '@/mocks/msw/scenarios'

const worker = setupWorker(...handlers)

let hasStartedWorker = false

function applyScenarioHandlers(scenario: DevApiScenario) {
  worker.resetHandlers(...getScenarioHandlers(scenario), ...handlers)
}

export async function startMockWorker(scenario: DevApiScenario) {
  applyScenarioHandlers(scenario)

  if (hasStartedWorker) {
    return
  }

  await worker.start({
    onUnhandledRequest: 'warn',
  })

  hasStartedWorker = true
}

export async function stopMockWorker() {
  if (!hasStartedWorker) {
    return
  }

  worker.resetHandlers(...handlers)
  worker.stop()
  hasStartedWorker = false
}
