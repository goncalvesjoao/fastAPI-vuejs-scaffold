export const entities = {
  article: {
    name: {
      singular: '記事',
      plural: '記事',
    },
    fields: {
      title: 'タイトル',
      content: '内容',
      nature: '種類',
    },
    enums: {
      ArticleNatureEnum: {
        standard: '標準',
        journal: '日記',
        scientific: '科学',
      },
      ArticleStateEnum: {
        idle: '待機中',
        loading: '読み込み中…',
        updating: '更新中…',
        deleting: '削除中…',
      },
    },
  },
}
