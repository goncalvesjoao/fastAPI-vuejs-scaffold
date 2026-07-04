import { vi } from 'vitest'
import {
  type CreatePostInputDto,
  type HealthResult,
  type PaginatedRecordsPostPublic,
  type PostNatureEnum,
  type PostPublic,
  type UpdatePostInputDto,
} from '@/lib/openapi/Api'

const {
  healthApiHealthGet,
  getPostsApiPostsGet,
  getPostApiPostsIdGet,
  createPostApiPostsPost,
  updatePostApiPostsIdPatch,
  deletePostApiPostsIdDelete,
} = vi.hoisted(() => ({
  healthApiHealthGet: vi.fn<() => Promise<{ data: HealthResult }>>(),
  getPostsApiPostsGet: vi.fn<
    (query?: { page?: number; page_size?: number; nature?: PostNatureEnum | null }) => Promise<{ data: PaginatedRecordsPostPublic }>
  >(),
  getPostApiPostsIdGet: vi.fn<(id: number) => Promise<{ data: PostPublic }>>(),
  createPostApiPostsPost: vi.fn<(input: CreatePostInputDto) => Promise<{ data: PostPublic }>>(),
  updatePostApiPostsIdPatch: vi.fn<
    (id: number, input: UpdatePostInputDto) => Promise<unknown>
  >(),
  deletePostApiPostsIdDelete: vi.fn<(id: number) => Promise<unknown>>(),
}))

export const openApiMocks = {
  healthApiHealthGet,
  getPostsApiPostsGet,
  getPostApiPostsIdGet,
  createPostApiPostsPost,
  updatePostApiPostsIdPatch,
  deletePostApiPostsIdDelete,
}

vi.mock('@/lib/openapi/Api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/openapi/Api')>('@/lib/openapi/Api')

  return {
    ...actual,
    Api: class {
      api = {
        healthApiHealthGet,
        getPostsApiPostsGet,
        getPostApiPostsIdGet,
        createPostApiPostsPost,
        updatePostApiPostsIdPatch,
        deletePostApiPostsIdDelete,
      }
    },
  }
})

export function resetOpenApiMocks(): void {
  openApiMocks.healthApiHealthGet.mockReset()
  openApiMocks.getPostsApiPostsGet.mockReset()
  openApiMocks.getPostApiPostsIdGet.mockReset()
  openApiMocks.createPostApiPostsPost.mockReset()
  openApiMocks.updatePostApiPostsIdPatch.mockReset()
  openApiMocks.deletePostApiPostsIdDelete.mockReset()
}
