import { computed, reactive } from 'vue'
import { defineStore } from 'pinia'

import { apiClient } from '@/lib'
import {
  Article,
  type CreateArticleInputDtoType,
  type PersistanceResultType,
  type UpdateArticleInputDtoType,
} from '@/entities'

const MAX_PAGES = 100

export const useArticlesStore = defineStore('articles', () => {
  const _recordsById = reactive<Record<number, Article>>({})
  let _loadAllPromise: Promise<void> | null = null
  let _loadVersion = 0

  const records = computed(() =>
    Object.values(_recordsById).sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    ),
  )

  function getById(id: number): Article | undefined {
    return _recordsById[id]
  }

  function upsert(record: Article): Article {
    const existing = getById(record.id)

    if (existing) {
      Object.assign(existing, record)
      return existing
    }

    return (_recordsById[record.id] = record)
  }

  function upsertMany(records: Article[]): Article[] {
    return records.map(upsert)
  }

  function loadAll(): Promise<void> {
    if (_loadAllPromise) return _loadAllPromise

    const version = _loadVersion
    const request = _loadAllPages(version).finally(() => {
      if (_loadAllPromise === request) {
        _loadAllPromise = null
      }
    })

    return (_loadAllPromise = request)
  }

  async function create(input: CreateArticleInputDtoType): Promise<PersistanceResultType<Article>> {
    const result = await apiClient.createArticle(input)

    if (result.ok) upsert(result.data)

    return result
  }

  async function loadById(id: number): Promise<Article | undefined> {
    const record = getById(id)

    if (record) record.isLoading = true

    try {
      const record = await apiClient.getArticle(id)

      return record ? upsert(record) : undefined
    } finally {
      const record = getById(id)

      if (record) record.isLoading = false
    }
  }

  async function updateById(
    id: number,
    input: UpdateArticleInputDtoType,
  ): Promise<PersistanceResultType<Article>> {
    const record = getById(id)

    if (record) record.isUpdating = true

    try {
      const result = await apiClient.updateArticle(id, input)

      if (result.ok) upsert(result.data)

      return result
    } finally {
      const record = getById(id)

      if (record) record.isUpdating = false
    }
  }

  async function deleteById(id: number): Promise<boolean> {
    const record = getById(id)

    if (record) record.isDeleting = true

    try {
      const result = await apiClient.deleteArticle(id)

      if (record) record.isDeleting = false
      delete _recordsById[id]

      return result
    } catch (error) {
      if (record) record.isDeleting = false

      throw error
    }
  }

  function clear(): void {
    _loadVersion += 1
    _loadAllPromise = null

    for (const id of Object.keys(_recordsById)) {
      const numericId = Number(id)

      delete _recordsById[numericId]
    }
  }

  async function _loadAllPages(version: number): Promise<void> {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const pagination = await apiClient.getArticles({ page })
      if (version !== _loadVersion) return

      upsertMany(pagination.records)

      if (pagination.records.length === 0 || pagination.page >= pagination.totalPages) {
        break
      }
    }
  }

  return {
    clear,
    create,
    deleteById,
    getById,
    loadAll,
    loadById,
    records,
    updateById,
    upsert,
  }
})
