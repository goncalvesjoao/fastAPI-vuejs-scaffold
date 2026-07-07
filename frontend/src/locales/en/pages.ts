export const pages = {
  articles: {
    'new-page': {
      submitLabel: 'Create Article',
      submitSuccessTitle: 'Article created',
      submitFailureTitle: 'Failed to create a new Article',
    },
    'edit-page': {
      submitLabel: 'Update Article',
      submitSuccessTitle: 'Article updated',
      submitFailureTitle: 'Failed to update the Article',
      loadFailureMessage: 'Failed to get Article with ID #{id}',
      notFoundHeading: 'Article not found',
      notFoundDescription: 'The requested Article does not exist',
    },
  },
  'sign-in-page': {
    navbarTitle: 'Log In',
  },
  'health-page': {
    navbarTitle: 'Health Check',
    title: 'System Health',
    description: 'Backend connectivity and service status',
    loading: 'Checking…',
    up: 'Up',
    down: 'Down',
    loadFailureMessage: 'Failed to request health status',
  },
  'home-page': {
    navbarTitle: 'Welcome!',
    initializationFailed: 'Failed to initialize authentication module',
    eyebrow: 'YOUR PERSONAL REPOSITORY',
    title: 'Ready to take your knowledge base to the next level?',
    description: {
      authenticated: 'Create and manage your articles with ease.',
      unauthenticated: 'Sign in to be able to create and manage your articles.',
    },
    actions: {
      createNew: 'Create an Article',
    },
  },
  'not-found-page': {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist or has been moved',
  },
}
