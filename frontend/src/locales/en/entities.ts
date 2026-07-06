export const entities = {
  article: {
    name: {
      singular: 'Article',
      plural: 'Articles',
    },
    fields: {
      title: 'Title',
      content: 'Content',
      nature: 'Nature',
    },
    enums: {
      ArticleNatureEnum: {
        standard: 'Standard',
        journal: 'Journal',
        scientific: 'Scientific',
      },
      ArticleStateEnum: {
        idle: 'Idle',
        loading: 'Loading',
        updating: 'Updating',
        deleting: 'Deleting',
      },
    },
  },
}
