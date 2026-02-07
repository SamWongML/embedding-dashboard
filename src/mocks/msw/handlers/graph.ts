import { http, HttpResponse } from 'msw'
import type { CreateEdgeRequest } from '@/lib/schemas/graph'
import {
  createDemoEdge,
  deleteDemoEdge,
  getDemoGraphData,
  getDemoNodeDetail,
} from '@/mocks'
import { API_URL } from '@/mocks/msw/handlers/constants'

export const graphHandlers = [
  http.get(`${API_URL}/graph`, () => {
    return HttpResponse.json(getDemoGraphData())
  }),
  http.get(`${API_URL}/graph/nodes/:nodeId`, ({ params }) => {
    const nodeId = String(params.nodeId ?? '')
    const detail = getDemoNodeDetail(nodeId)
    if (!detail) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(detail)
  }),
  http.post(`${API_URL}/graph/edges`, async ({ request }) => {
    const body = (await request.json()) as CreateEdgeRequest
    return HttpResponse.json(createDemoEdge(body))
  }),
  http.delete(`${API_URL}/graph/edges/:edgeId`, ({ params }) => {
    const edgeId = String(params.edgeId ?? '')
    deleteDemoEdge(edgeId)
    return HttpResponse.json({ ok: true })
  }),
]
