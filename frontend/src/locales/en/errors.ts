export const errors = {
  ApiError: {
    defaultMessage: 'An unexpected error occurred while processing the request',
  },
  UnauthorizedApiError: {
    defaultMessage: 'User not logged in or session expired',
  },
  NotFoundApiError: {
    defaultMessage: 'The requested resource could not be found',
  },
  UnprocessableContentApiError: {
    defaultMessage: 'Invalid or missing fields',
  },
  InternalServerErrorApiError: {
    defaultMessage: 'An unexpected error occurred on the server',
  },
  BadGatewayApiError: {
    defaultMessage: 'Server is currently unavailable',
  },
}
