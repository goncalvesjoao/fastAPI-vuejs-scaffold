export const errors = {
  unknownCause: '原因不明です',
  supportNotified: 'サポートに通知しました。しばらくしてからもう一度お試しください',
  ApiError: {
    defaultMessage: 'リクエストの処理中に予期しないエラーが発生しました',
  },
  UnauthorizedApiError: {
    defaultMessage: 'ログインしていないか、セッションの有効期限が切れています',
  },
  NotFoundApiError: {
    defaultMessage: '指定されたリソースが見つかりません',
  },
  UnprocessableContentApiError: {
    defaultMessage: '入力されていない項目または無効な項目があります',
  },
  InternalServerErrorApiError: {
    defaultMessage: 'サーバーで予期しないエラーが発生しました',
  },
  BadGatewayApiError: {
    defaultMessage: '現在サーバーを利用できません',
  },
}
