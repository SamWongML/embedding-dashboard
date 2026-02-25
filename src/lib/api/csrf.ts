export interface SameOriginValidationResult {
  isValid: boolean
  expectedOrigin: string
  providedOrigin: string | null
  reason: string | null
}

export class SameOriginRequestError extends Error {
  readonly status = 403
}

function getOrigin(value: string | null) {
  if (!value) {
    return null
  }

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function validateSameOriginRequest(request: Request): SameOriginValidationResult {
  const expectedOrigin = new URL(request.url).origin
  const originHeader = request.headers.get('origin')
  const refererHeader = request.headers.get('referer')
  const secFetchSite = request.headers.get('sec-fetch-site')

  const providedOrigin = getOrigin(originHeader) ?? getOrigin(refererHeader)

  if (!providedOrigin) {
    return {
      isValid: false,
      expectedOrigin,
      providedOrigin: null,
      reason: 'missing_origin',
    }
  }

  if (providedOrigin !== expectedOrigin) {
    return {
      isValid: false,
      expectedOrigin,
      providedOrigin,
      reason: 'origin_mismatch',
    }
  }

  if (secFetchSite && !['same-origin', 'same-site', 'none'].includes(secFetchSite)) {
    return {
      isValid: false,
      expectedOrigin,
      providedOrigin,
      reason: 'invalid_fetch_site',
    }
  }

  return {
    isValid: true,
    expectedOrigin,
    providedOrigin,
    reason: null,
  }
}

export function assertSameOriginRequest(request: Request) {
  const result = validateSameOriginRequest(request)

  if (!result.isValid) {
    throw new SameOriginRequestError('Forbidden: request origin validation failed.')
  }

  return result
}
