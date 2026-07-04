import { describe, expect, it } from 'vitest'

import {
  ApiClientError,
  BadGatewayApiClientError,
  InternalServerErrorApiClientError,
  NotFoundApiClientError,
  UnauthorizedApiClientError,
  UnprocessableContentApiClientError,
  apiClientErrorFactory,
} from '@/lib/api-client-error'
import type { HTTPErrorResponse, HTTPValidationError, ValidationError } from '@/lib/openapi/Api'

/**
 * Faithful mock of the object `HttpClient.request` throws on non-2xx
 * responses (see Api.ts:341-368). It is a `Response` augmented with
 * `data` (null) and `error` (the parsed JSON body), exactly what the
 * `.catch(error => reject(apiClientErrorFactory(error)))` handlers in
 * `ApiClient` receive.
 *
 * The backend (responses.py) emits two body shapes:
 *   - HTTPErrorResponse      : { detail: string }
 *   - HTTPValidationError    : { detail: [{ type, loc, msg, input }] }
 */
function mockHttpResponse(status: number, body: HTTPErrorResponse | HTTPValidationError | unknown) {
  return {
    status,
    ok: false,
    data: null,
    error: body,
  }
}

describe('apiClientErrorFactory — status dispatch', () => {
  it('maps 401 → UnauthorizedApiClientError', () => {
    const e = apiClientErrorFactory(
      mockHttpResponse(401, { detail: 'token expired' } satisfies HTTPErrorResponse),
    )
    expect(e).toBeInstanceOf(UnauthorizedApiClientError)
    expect(e.message).toBe('token expired')
    expect(e.httpStatus).toBe(401)
  })

  it('maps 404 → NotFoundApiClientError', () => {
    const e = apiClientErrorFactory(
      mockHttpResponse(404, { detail: 'not here' } satisfies HTTPErrorResponse),
    )
    expect(e).toBeInstanceOf(NotFoundApiClientError)
    expect(e.message).toBe('not here')
    expect(e.httpStatus).toBe(404)
  })

  it('maps 422 → UnprocessableContentApiClientError', () => {
    const e = apiClientErrorFactory(
      mockHttpResponse(422, { detail: [] } satisfies HTTPValidationError),
    )
    expect(e).toBeInstanceOf(UnprocessableContentApiClientError)
    expect(e.httpStatus).toBe(422)
  })

  it('maps 500 → InternalServerErrorApiClientError', () => {
    const e = apiClientErrorFactory(
      mockHttpResponse(500, { detail: 'boom' } satisfies HTTPErrorResponse),
    )
    expect(e).toBeInstanceOf(InternalServerErrorApiClientError)
    expect(e.httpStatus).toBe(500)
  })

  it('maps 502 → BadGatewayApiClientError', () => {
    const e = apiClientErrorFactory(
      mockHttpResponse(502, { detail: 'upstream down' } satisfies HTTPErrorResponse),
    )
    expect(e).toBeInstanceOf(BadGatewayApiClientError)
    expect(e.httpStatus).toBe(502)
  })

  it('falls back to base ApiClientError for unmapped status codes', () => {
    const e = apiClientErrorFactory(
      mockHttpResponse(403, { detail: 'forbidden' } satisfies HTTPErrorResponse),
    )
    expect(Object.getPrototypeOf(e)).toBe(ApiClientError.prototype)
    expect(e.message).toBe('forbidden')
    expect(e.httpStatus).toBe(403)
  })

  it('preserves the original error on the `cause` property', () => {
    const src = mockHttpResponse(500, { detail: 'boom' } satisfies HTTPErrorResponse)
    const e = apiClientErrorFactory(src)
    expect(e.cause).toBe(src)
  })
})

describe('apiClientErrorFactory — non-HTTP errors (network/cancellation)', () => {
  it('returns base ApiClientError when thrown value has no numeric .status', () => {
    const networkErr = new TypeError('Failed to fetch')
    const e = apiClientErrorFactory(networkErr)
    expect(Object.getPrototypeOf(e)).toBe(ApiClientError.prototype)
  })

  it('preserves the original Error message for network/unknown errors', () => {
    const networkErr = new TypeError('Failed to fetch')
    const e = apiClientErrorFactory(networkErr)
    expect(e.message).toBe('Failed to fetch')
  })

  it('returns base ApiClientError for non-object thrown values', () => {
    const e = apiClientErrorFactory('a string was thrown')
    expect(e).toBeInstanceOf(ApiClientError)
    expect(e.message).toBe(ApiClientError.defaultMessage)
  })

  it('returns base ApiClientError when thrown value is null/undefined', () => {
    expect(apiClientErrorFactory(null)).toBeInstanceOf(ApiClientError)
    expect(apiClientErrorFactory(undefined)).toBeInstanceOf(ApiClientError)
  })

  it('has undefined httpStatus for non-HTTP errors', () => {
    const e = apiClientErrorFactory(new TypeError('Failed to fetch'))
    expect(e.httpStatus).toBeUndefined()
  })
})

describe('ApiClientError constructor — message extraction', () => {
  it('uses string `detail` from HTTPErrorResponse as the message', () => {
    const e = new ApiClientError(
      mockHttpResponse(400, { detail: 'bad input' } satisfies HTTPErrorResponse),
    )
    expect(e.message).toBe('bad input')
  })

  it('falls back to defaultMessage when body has no `detail` field', () => {
    const e = new NotFoundApiClientError(mockHttpResponse(404, { unrelated: true }))
    expect(e.message).toBe(NotFoundApiClientError.defaultMessage)
  })

  it('uses subclass defaultMessage (not base) when no string detail is present', () => {
    const e = new UnauthorizedApiClientError(
      mockHttpResponse(401, { detail: [] } satisfies HTTPValidationError),
    )
    expect(e.message).toBe(UnauthorizedApiClientError.defaultMessage)
  })

  it('ignores non-string, non-array `detail` values', () => {
    const e = new ApiClientError(mockHttpResponse(500, { detail: { weird: true } }))
    expect(e.message).toBe(ApiClientError.defaultMessage)
  })
})

describe('ApiClientError constructor — fieldErrors from HTTPValidationError', () => {
  it('parses a single validation error with a 2-segment loc', () => {
    // FastAPI emits loc: ["body", "title"] for a missing body field.
    // The full path including root is used as the key.
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'missing',
            loc: ['body', 'title'],
            msg: 'Field required',
            input: {},
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({
      'body.title': [
        {
          message: 'Field required',
          type: 'missing',
          input: {},
          context: { min_length: 1 },
        },
      ],
    })
  })

  it('builds a dotted path from nested loc segments', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'value_error',
            loc: ['body', 'nested', 'email'],
            msg: 'invalid email',
            input: 'foo',
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({
      'body.nested.email': [
        {
          message: 'invalid email',
          type: 'value_error',
          input: 'foo',
          context: { min_length: 1 },
        },
      ],
    })
  })

  it('preserves array indices in the dotted path', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'value_error',
            loc: ['body', 'tags', 0, 'name'],
            msg: 'bad tag',
            input: '',
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({
      'body.tags.0.name': [
        {
          message: 'bad tag',
          type: 'value_error',
          input: '',
          context: { min_length: 1 },
        },
      ],
    })
  })

  it('distinguishes same leaf field under different parents', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'value_error',
            loc: ['body', 'user', 'email'],
            msg: 'invalid',
            input: 'a',
            ctx: { min_length: 1 },
          },
          {
            type: 'value_error',
            loc: ['body', 'company', 'email'],
            msg: 'invalid',
            input: 'b',
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toHaveProperty('body.user.email')
    expect(e.fieldErrors).toHaveProperty('body.company.email')
    expect(e.fieldErrors['body.user.email']).not.toBe(e.fieldErrors['body.company.email'])
  })

  it('distinguishes same field across different array indices', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'value_error',
            loc: ['body', 'tags', 0, 'name'],
            msg: 'bad tag 0',
            input: '',
            ctx: { min_length: 1 },
          },
          {
            type: 'value_error',
            loc: ['body', 'tags', 1, 'name'],
            msg: 'bad tag 1',
            input: '',
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({
      'body.tags.0.name': [
        {
          message: 'bad tag 0',
          type: 'value_error',
          input: '',
          context: { min_length: 1 },
        },
      ],
      'body.tags.1.name': [
        {
          message: 'bad tag 1',
          type: 'value_error',
          input: '',
          context: { min_length: 1 },
        },
      ],
    })
  })

  it('accumulates multiple errors on the same field into an array', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'missing',
            loc: ['body', 'title'],
            msg: 'Field required',
            input: {},
            ctx: { min_length: 1 },
          },
          {
            type: 'string_too_long',
            loc: ['body', 'title'],
            msg: 'too long',
            input: 'x'.repeat(999),
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({
      'body.title': [
        {
          message: 'Field required',
          type: 'missing',
          input: {},
          context: { min_length: 1 },
        },
        {
          message: 'too long',
          type: 'string_too_long',
          input: 'x'.repeat(999),
          context: { min_length: 1 },
        },
      ],
    })
  })

  it('aggregates multiple fields with multiple errors each', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'missing',
            loc: ['body', 'title'],
            msg: 'Field required',
            input: {},
            ctx: { min_length: 1 },
          },
          {
            type: 'string_too_short',
            loc: ['body', 'title'],
            msg: 'too short',
            input: 'x',
            ctx: { min_length: 1 },
          },
          {
            type: 'string_too_long',
            loc: ['body', 'content'],
            msg: 'too long',
            input: 'x'.repeat(999),
            ctx: { min_length: 1 },
          },
          {
            type: 'value_error',
            loc: ['body', 'tags', 0, 'name'],
            msg: 'bad tag',
            input: '',
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({
      'body.title': [
        {
          message: 'Field required',
          type: 'missing',
          input: {},
          context: { min_length: 1 },
        },
        {
          message: 'too short',
          type: 'string_too_short',
          input: 'x',
          context: { min_length: 1 },
        },
      ],
      'body.content': [
        {
          message: 'too long',
          type: 'string_too_long',
          input: 'x'.repeat(999),
          context: { min_length: 1 },
        },
      ],
      'body.tags.0.name': [
        {
          message: 'bad tag',
          type: 'value_error',
          input: '',
          context: { min_length: 1 },
        },
      ],
    })
  })

  it('uses root segment as key when loc has only one segment', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'value_error',
            loc: ['body'],
            msg: 'body is not valid',
            input: {},
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({
      body: [
        {
          message: 'body is not valid',
          type: 'value_error',
          input: {},
          context: { min_length: 1 },
        },
      ],
    })
  })

  it('skips entries whose loc is empty or missing', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          { type: 'missing', loc: [], msg: 'no loc', input: {}, ctx: { min_length: 1 } },
          {
            type: 'missing',
            msg: 'no loc at all',
            input: {},
            ctx: { min_length: 1 },
          } as ValidationError,
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({})
  })

  it('skips entries whose first loc segment is not a string', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, {
        detail: [
          {
            type: 'value_error',
            loc: [0, 'field'],
            msg: 'should skip',
            input: 0,
            ctx: { min_length: 1 },
          },
        ],
      } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({})
  })

  it('leaves fieldErrors empty when detail is an empty array', () => {
    const e = new UnprocessableContentApiClientError(
      mockHttpResponse(422, { detail: [] } satisfies HTTPValidationError),
    )
    expect(e.fieldErrors).toEqual({})
    expect(e.message).toBe(UnprocessableContentApiClientError.defaultMessage)
  })
})

describe('ApiClientError — Error basics', () => {
  it('sets name to the subclass name', () => {
    expect(new UnauthorizedApiClientError(mockHttpResponse(401, {})).name).toBe(
      'UnauthorizedApiClientError',
    )
    expect(new NotFoundApiClientError(mockHttpResponse(404, {})).name).toBe(
      'NotFoundApiClientError',
    )
    expect(new UnprocessableContentApiClientError(mockHttpResponse(422, {})).name).toBe(
      'UnprocessableContentApiClientError',
    )
    expect(new InternalServerErrorApiClientError(mockHttpResponse(500, {})).name).toBe(
      'InternalServerErrorApiClientError',
    )
    expect(new BadGatewayApiClientError(mockHttpResponse(502, {})).name).toBe(
      'BadGatewayApiClientError',
    )
    expect(new ApiClientError(mockHttpResponse(400, {})).name).toBe('ApiClientError')
  })

  it('is a real Error with a stack trace', () => {
    const e = new ApiClientError(new Error('orig'))
    expect(e).toBeInstanceOf(Error)
    expect(typeof e.stack).toBe('string')
  })
})
