export function articlePublicFactory(overrides?: Partial<ArticlePublic>): ArticlePublic {
  return {
    id: 1,
    title: 'Test Article',
    content: 'This is a test article.',
    nature: 'standard',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function unprocessableContentResponseFactory(input: Record<string, Array<string>>): { status: number; error: { detail: string } } {
  const validationErrors = Object.entries(input).map(([field, messages]) => {
    return messages.map((msg) => ({
      loc: ['body', field],
      msg,
      type: 'value_error',
      input: '',
      ctx: {},
    }))
  }).flat()

  return { status: 422, error: { detail: validationErrors } }
}
