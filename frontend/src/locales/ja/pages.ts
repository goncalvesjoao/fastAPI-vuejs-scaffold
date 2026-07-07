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
      notFoundHeading: '記事が見つかりません',
      notFoundDescription: '指定された記事は存在しません',
    },
  },
  'sign-in-page': {
    navbarTitle: 'ログイン',
  },
  'health-page': {
    navbarTitle: 'ヘルスチェック',
    title: 'システム状態',
    description: 'バックエンド接続とサービスの状態です',
    loading: '確認中…',
    up: '正常',
    down: '停止',
    loadFailureMessage: 'システム状態の取得に失敗しました',
  },
  'home-page': {
    navbarTitle: 'ようこそ！',
    initializationFailed: '認証モジュールの初期化に失敗しました',
    eyebrow: 'あなただけの個人リポジトリ',
    title: 'ナレッジベースを次のレベルに引き上げましょう',
    description: {
      authenticated: '記事の作成や管理を簡単に行えます。',
      unauthenticated: '記事を作成・管理するにはサインインしてください。',
    },
    actions: {
      createNew: '記事を作成する',
    },
  },
  'not-found-page': {
    title: 'ページが見つかりません',
    description: 'お探しのページは存在しないか、移動した可能性があります',
  },
}
