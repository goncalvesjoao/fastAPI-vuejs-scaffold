export const pages = {
  articles: {
    'new-page': {
      submitLabel: '作成',
      submitSuccessTitle: '記事を作成しました',
      submitFailureTitle: '記事の作成に失敗しました',
    },
    'edit-page': {
      submitLabel: '更新',
      submitSuccessTitle: '記事を更新しました',
      submitFailureTitle: '記事の更新に失敗しました',
      loadFailureMessage: '記事 ID #{id} の取得に失敗しました',
      notFoundTitle: '記事 ID #{id}',
      notFoundHeading: '記事が見つかりません',
      notFoundDescription: '指定された記事は存在しません',
    },
  },
  'sign-in-page': {
    title: 'ログイン',
  },
  'health-page': {
    title: 'ヘルスチェック',
    heading: 'システム状態',
    description: 'バックエンド接続とサービスの状態です',
    loading: '確認中…',
    up: '正常',
    down: '停止',
    loadFailureMessage: 'システム状態の取得に失敗しました',
  },
  'home-page': {
    title: 'ようこそ！',
    authenticatedPrompt: '{action}を作成しましょう',
    signInPrompt: '続行するには{action}してください',
    initializationFailed: '認証モジュールの初期化に失敗しました',
  },
  'not-found-page': {
    title: 'ページが見つかりません',
    heading: '404 - ページが見つかりません',
    description: 'お探しのページは存在しないか、移動した可能性があります',
    goBackHome: 'ホームに戻る',
  },
}
