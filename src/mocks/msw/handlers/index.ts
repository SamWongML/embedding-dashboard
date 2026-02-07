import { embeddingHandlers } from '@/mocks/msw/handlers/embeddings'
import { graphHandlers } from '@/mocks/msw/handlers/graph'
import { metricsHandlers } from '@/mocks/msw/handlers/metrics'
import { recordsHandlers } from '@/mocks/msw/handlers/records'
import { searchHandlers } from '@/mocks/msw/handlers/search'
import { serverStatusHandlers } from '@/mocks/msw/handlers/server-status'
import { usersHandlers } from '@/mocks/msw/handlers/users'

export const handlers = [
  ...serverStatusHandlers,
  ...metricsHandlers,
  ...embeddingHandlers,
  ...searchHandlers,
  ...recordsHandlers,
  ...graphHandlers,
  ...usersHandlers,
]
