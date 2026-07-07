export const components = {
  'delete-dialog': {
    title: '{resource}を削除しますか？',
    description: '「{name}」を完全に削除します。この操作は取り消せません',
    unnamedDescription: 'この{resource}を完全に削除します。この操作は取り消せません',
  },
  articles: {
    'article-delete-dialog': {
      title: '{resource}を削除しますか？',
      description: '「{name}」を完全に削除します。この操作は取り消せません',
      unnamedDescription: 'この{resource}を完全に削除します。この操作は取り消せません',
      submitLabel: '削除',
      submitSuccessTitle: '記事を削除しました',
      submitFailureTitle: '記事の削除に失敗しました',
      submitWarningMessage: '警告：記事が見つかりません',
      submitWarningDescription: 'すでに削除されている可能性があります',
    },
    'article-rename-modal': {
      title: '記事名を変更',
      description: 'サイドバーで見つけやすい短いタイトルを入力してください',
      submitLabel: '変更',
      submitSuccessTitle: '記事名を変更しました',
      submitFailureTitle: '記事名の変更に失敗しました',
    },
  },
  layout: {
    'left-navbar': {
      articleActions: '記事の操作',
      loadAllFailureMessage: '記事の取得に失敗しました',
      dateGroups: {
        today: '今日',
        yesterday: '昨日',
        lastWeek: '過去1週間',
        lastMonth: '過去1か月',
      },
    },
  },
  'dashboard-panel': {
    selectLanguage: '言語を選択',
  },
}
