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
      notFoundTitle: 'Article with ID #{id}',
      notFoundHeading: 'Article not found',
      notFoundDescription: 'The requested Article does not exist',
    },
  },
  'sign-in-page': {
    title: 'Log In',
  },
  'health-page': {
    title: 'Health Check',
    heading: 'System Health',
    description: 'Backend connectivity and service status',
    loading: 'Checking…',
    up: 'Up',
    down: 'Down',
    loadFailureMessage: 'Failed to request health status',
  },
  'home-page': {
    title: 'Welcome!',
    authenticatedPrompt: "Let's create some {action}",
    signInPrompt: 'Please {action} before continuing',
    initializationFailed: 'Failed to initialize authentication module',
  },
  'not-found-page': {
    title: 'Oops! Page not found',
    heading: '404 - Page Not Found',
    description: 'The page you are looking for does not exist or has been moved',
    goBackHome: 'Go Back Home',
  },
}
