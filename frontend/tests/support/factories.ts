import { ArticleNatureEnum, type ArticlePublic } from '@/lib/openapi/Api'

export function articlePublicFactory(overrides?: Partial<ArticlePublic>): ArticlePublic {
  return {
    id: 1,
    title: 'Test Article',
    user_uid: 'current_user',
    content: 'This is a test article.',
    nature: ArticleNatureEnum.Standard,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

export function unprocessableContentResponseFactory(
  detail: Array<{
    type: string
    loc: Array<string | number>
    msg: string
    input: unknown
    ctx: Record<string, unknown>
  }>,
) {
  return { status: 422, error: { detail } }
}
