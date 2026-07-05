import { Api, type HealthResult } from '@/lib/openapi/Api'
import {
  Article,
  ArticleNatureEnum,
  type CreateArticleInputDtoType,
  type UpdateArticleInputDtoType,
} from '@/entities'
import { getAuthToken } from '@/composables/use-auth'
import { currentLocale } from '@/i18n'
import {
  apiClientErrorFactory,
  UnprocessableContentApiClientError,
  type FieldErrorsType,
} from './api-client-error'

export type PaginatedRecordsType<T> = {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  records: T[]
}

export type PersistanceResultType<T> =
  | { ok: true; data: T }
  | { ok: false; fieldErrors: FieldErrorsType }

export class ApiClient {
  private openapi: Api<null>

  constructor() {
    this.openapi = new Api({
      baseApiParams: { secure: true },
      securityWorker: async () => {
        return {
          headers: {
            Authorization: `Bearer ${await getAuthToken()}`,
            'Accept-Language': currentLocale(),
          },
        }
      },
    })
  }

  async health(): Promise<HealthResult> {
    return new Promise((resolve, reject) => {
      this.openapi.api
        .healthApiHealthGet()
        .then((response) => resolve(response.data))
        .catch((error) => reject(apiClientErrorFactory(error)))
    })
  }

  async getArticles(query?: {
    page?: number
    pageSize?: number
    nature?: ArticleNatureEnum | null
  }): Promise<PaginatedRecordsType<Article>> {
    return new Promise((resolve, reject) => {
      this.openapi.api
        .getArticlesApiArticlesGet({
          page: query?.page,
          page_size: query?.pageSize,
          nature: query?.nature,
        })
        .then((response) => {
          const data = response.data

          resolve({
            page: data.page,
            pageSize: data.page_size,
            totalCount: data.total_count,
            totalPages: data.total_pages,
            records: data.records.map((record) => new Article(record)),
          })
        })
        .catch((error) => reject(apiClientErrorFactory(error)))
    })
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return new Promise((resolve, reject) => {
      this.openapi.api
        .getArticleApiArticlesIdGet(id)
        .then((response) => resolve(new Article(response.data)))
        .catch((error: unknown) => {
          const apiError = apiClientErrorFactory(error)

          if (apiError.httpStatus === 404) resolve(undefined)
          else reject(apiError)
        })
    })
  }

  async createArticle(input: CreateArticleInputDtoType): Promise<PersistanceResultType<Article>> {
    return new Promise((resolve, reject) => {
      this.openapi.api
        .createArticleApiArticlesPost(input)
        .then((response) => resolve({ ok: true, data: new Article(response.data) }))
        .catch((error: unknown) => {
          const apiError = apiClientErrorFactory(error)

          if (apiError instanceof UnprocessableContentApiClientError) {
            return resolve({ ok: false, fieldErrors: apiError.fieldErrors })
          }

          reject(apiError)
        })
    })
  }

  async updateArticle(
    id: number,
    input: UpdateArticleInputDtoType,
  ): Promise<PersistanceResultType<Article>> {
    return new Promise((resolve, reject) => {
      this.openapi.api
        .updateArticleApiArticlesIdPatch(id, input)
        .then((response) => resolve({ ok: true, data: new Article(response.data) }))
        .catch((error: unknown) => {
          const apiError = apiClientErrorFactory(error)

          if (apiError instanceof UnprocessableContentApiClientError) {
            return resolve({ ok: false, fieldErrors: apiError.fieldErrors })
          }

          reject(apiError)
        })
    })
  }

  async deleteArticle(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.openapi.api
        .deleteArticleApiArticlesIdDelete(id)
        .then(() => resolve(true))
        .catch((error: unknown) => {
          const apiError = apiClientErrorFactory(error)

          if (apiError.httpStatus === 404) resolve(false)
          else reject(apiError)
        })
    })
  }
}

export const apiClient = new ApiClient()
