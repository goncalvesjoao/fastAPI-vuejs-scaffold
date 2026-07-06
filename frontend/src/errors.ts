import { type HTTPErrorResponse, type HTTPValidationError } from '@/lib/openapi/Api'
import { translate } from '@/i18n'

export type FieldErrorType = {
  message: string
  type: string
  input: unknown
  context: unknown
}

export type FieldErrorsType = Record<string, FieldErrorType[]>

export class ApiError extends Error {
  static get defaultMessage(): string {
    return translate('errors.ApiError.defaultMessage')
  }

  httpStatus: number | undefined

  constructor(error: unknown) {
    super(error instanceof Error ? error.message : undefined, { cause: error })

    const klass = this.constructor as typeof ApiError
    this.name = klass.name

    if (_isHttpResponseError(error)) {
      this.httpStatus = error.status

      if (_isHTTPErrorResponse(error.error)) {
        this.message = error.error.detail
      }
    }

    this.message ||= klass.defaultMessage
  }
}

export class UnauthorizedApiError extends ApiError {
  static get defaultMessage(): string {
    return translate('errors.UnauthorizedApiError.defaultMessage')
  }
}

export class NotFoundApiError extends ApiError {
  static get defaultMessage(): string {
    return translate('errors.NotFoundApiError.defaultMessage')
  }
}

export class UnprocessableContentApiError extends ApiError {
  static get defaultMessage(): string {
    return translate('errors.UnprocessableContentApiError.defaultMessage')
  }

  fieldErrors: FieldErrorsType = {}

  constructor(error: unknown) {
    super(error)

    if (_isHttpResponseError(error) && _isHTTPValidationError(error.error)) {
      for (const validationError of error.error.detail) {
        const loc = validationError.loc

        if (!loc || !Array.isArray(loc) || loc.length === 0 || typeof loc[0] !== 'string') continue

        // Build a dotted path from all loc segments, including the root
        // ("body", "query", "path"). e.g. ["body","title"] → "body.title".
        const key = (loc as Array<string | number>).map((s) => `${s}`).join('.')

        this.fieldErrors[key] ||= []

        this.fieldErrors[key].push({
          message: validationError.msg,
          type: validationError.type,
          input: validationError.input,
          context: validationError.ctx,
        })
      }
    }
  }
}

export class InternalServerErrorApiError extends ApiError {
  static get defaultMessage(): string {
    return translate('errors.InternalServerErrorApiError.defaultMessage')
  }
}

export class BadGatewayApiError extends ApiError {
  static get defaultMessage(): string {
    return translate('errors.BadGatewayApiError.defaultMessage')
  }
}

export function apiClientErrorFactory(error: unknown): ApiError {
  if (_isHttpResponseError(error)) {
    switch (error.status) {
      case 401:
        return new UnauthorizedApiError(error)
      case 404:
        return new NotFoundApiError(error)
      case 422:
        return new UnprocessableContentApiError(error)
      case 500:
        return new InternalServerErrorApiError(error)
      case 502:
        return new BadGatewayApiError(error)
    }
  }

  return new ApiError(error)
}

function _isHTTPErrorResponse(body: unknown): body is HTTPErrorResponse {
  return (
    !!body &&
    typeof body === 'object' &&
    'detail' in body &&
    typeof (body as { detail: unknown }).detail === 'string'
  )
}

function _isHTTPValidationError(body: unknown): body is HTTPValidationError {
  return (
    !!body &&
    typeof body === 'object' &&
    'detail' in body &&
    Array.isArray((body as { detail: unknown }).detail)
  )
}

/** Shape thrown by `HttpClient.request` on non-2xx responses. */
function _isHttpResponseError(error: unknown): error is {
  status: number
  error: unknown
} {
  return (
    !!error &&
    typeof error === 'object' &&
    'status' in error &&
    'error' in error &&
    typeof (error as { status: unknown }).status === 'number'
  )
}
