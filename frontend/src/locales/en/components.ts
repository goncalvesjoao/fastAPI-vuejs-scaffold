export const components = {
  'delete-dialog': {
    title: 'Delete {resource}?',
    description: 'This will permanently delete "{name}". This action cannot be undone',
    unnamedDescription:
      'This will permanently delete this {resource}. This action cannot be undone',
  },
  articles: {
    'article-delete-dialog': {
      title: 'Delete {resource}?',
      description: 'This will permanently delete “{name}”. This action cannot be undone',
      unnamedDescription:
        'This will permanently delete this {resource}. This action cannot be undone',
      submitLabel: 'Delete',
      submitSuccessTitle: 'Article deleted',
      submitFailureTitle: 'Failed to delete the Article',
      submitWarningMessage: 'Warning: Article not found',
      submitWarningDescription: 'It was probably already deleted',
    },
    'article-rename-modal': {
      title: 'Rename article',
      description: 'Use a short title that makes this article easy to find in the sidebar',
      submitLabel: 'Rename',
      submitSuccessTitle: 'Article renamed',
      submitFailureTitle: 'Failed to rename the Article',
    },
  },
  'language-select': {
    select: 'Select language',
  },
  'left-navbar': {
    newArticle: 'New Article',
    articleActions: 'Article actions',
    loadAllFailureMessage: 'Failed to fetch Articles',
    dateGroups: {
      today: 'Today',
      yesterday: 'Yesterday',
      lastWeek: 'Last Week',
      lastMonth: 'Last Month',
    },
  },
  'unexpected-error': {
    unknownCause: 'Unknown cause',
    supportNotified: 'Support has been notified. Please try again later',
  },
}
