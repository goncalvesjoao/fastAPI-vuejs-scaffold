import { vi } from 'vitest'
import {
  type CreateArticleInputDto,
  type HealthResult,
  type PaginatedRecordsArticlePublic,
  type ArticleNatureEnum,
  type ArticlePublic,
  type UpdateArticleInputDto,
} from '@/lib/openapi/Api'

const {
  healthApiHealthGet,
  getArticlesApiArticlesGet,
  getArticleApiArticlesIdGet,
  createArticleApiArticlesPost,
  updateArticleApiArticlesIdPatch,
  deleteArticleApiArticlesIdDelete,
} = vi.hoisted(() => ({
  healthApiHealthGet: vi.fn<() => Promise<{ data: HealthResult }>>(),
  getArticlesApiArticlesGet: vi.fn<
    (query?: { page?: number; page_size?: number; nature?: ArticleNatureEnum | null }) => Promise<{ data: PaginatedRecordsArticlePublic }>
  >(),
  getArticleApiArticlesIdGet: vi.fn<(id: number) => Promise<{ data: ArticlePublic }>>(),
  createArticleApiArticlesPost: vi.fn<(input: CreateArticleInputDto) => Promise<{ data: ArticlePublic }>>(),
  updateArticleApiArticlesIdPatch: vi.fn<
    (id: number, input: UpdateArticleInputDto) => Promise<unknown>
  >(),
  deleteArticleApiArticlesIdDelete: vi.fn<(id: number) => Promise<unknown>>(),
}))

export const openApiMocks = {
  healthApiHealthGet,
  getArticlesApiArticlesGet,
  getArticleApiArticlesIdGet,
  createArticleApiArticlesPost,
  updateArticleApiArticlesIdPatch,
  deleteArticleApiArticlesIdDelete,
}

vi.mock('@/lib/openapi/Api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/openapi/Api')>('@/lib/openapi/Api')

  return {
    ...actual,
    Api: class {
      api = {
        healthApiHealthGet,
        getArticlesApiArticlesGet,
        getArticleApiArticlesIdGet,
        createArticleApiArticlesPost,
        updateArticleApiArticlesIdPatch,
        deleteArticleApiArticlesIdDelete,
      }
    },
  }
})

export function resetOpenApiMocks(): void {
  openApiMocks.healthApiHealthGet.mockReset()
  openApiMocks.getArticlesApiArticlesGet.mockReset()
  openApiMocks.getArticleApiArticlesIdGet.mockReset()
  openApiMocks.createArticleApiArticlesPost.mockReset()
  openApiMocks.updateArticleApiArticlesIdPatch.mockReset()
  openApiMocks.deleteArticleApiArticlesIdDelete.mockReset()
}
