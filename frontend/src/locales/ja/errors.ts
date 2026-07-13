export const errors = {
  unexpectedState: '予期しない状態',
  unexpectedError: '予期しないエラー',
  unknownError: '不明なエラー',
  unknownCause: '原因不明です',
  supportNotified: '問題を検知しました。しばらくしてからもう一度お試しください。',
  ApiError: {
    defaultMessage: 'リクエストの処理中に問題が発生しました。',
  },
  UnauthorizedApiError: {
    defaultMessage: '続行するには、もう一度サインインしてください。',
  },
  NotFoundApiError: {
    defaultMessage: 'リクエストされた項目が見つかりませんでした。',
  },
  UnprocessableContentApiError: {
    defaultMessage: '未入力、または見直しが必要な項目があります。',
  },
  InternalServerErrorApiError: {
    defaultMessage: 'サーバーで予期しないエラーが発生しました。',
  },
  BadGatewayApiError: {
    defaultMessage: '現在サーバーを利用できません。',
  },
}
