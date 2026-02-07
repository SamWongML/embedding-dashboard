import type { AccountSnapshot } from '@/lib/types/account'
import {
  cloneDemoValue,
  getDemoScenarioState,
} from '@/mocks/scenario'

export function getDemoAccountSnapshot(): AccountSnapshot {
  return cloneDemoValue(getDemoScenarioState().accountSnapshot)
}

export const mockAccountSnapshot: AccountSnapshot = getDemoAccountSnapshot()
