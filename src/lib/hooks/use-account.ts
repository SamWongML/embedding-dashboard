'use client'

import { useAccountContext } from '@/components/account/account-provider'

export function useAccount() {
  return useAccountContext()
}
