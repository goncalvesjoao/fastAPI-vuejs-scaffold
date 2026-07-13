import { describe, expect, it } from 'vitest'

import { Article } from '@/entities'
import { articlePublicFactory } from '../support'

describe('Article', () => {
  it('translates state labels from the entity locale namespace', () => {
    const article = new Article(articlePublicFactory())

    article.isLoading = true

    expect(article.busyLabel).toBe('Loading')
    expect(article.stateLabel).toBe('Loading')
  })
})
