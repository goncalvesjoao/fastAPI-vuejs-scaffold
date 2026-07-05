import { beforeEach, describe, expect, it } from 'vitest'

import { currentLocale, setLocale, translate } from '@/i18n'

describe('i18n', () => {
  beforeEach(() => {
    setLocale('en')
  })

  it('translates application messages into Japanese', () => {
    setLocale('ja-JP')

    expect(currentLocale()).toBe('ja')
    expect(translate('articles.create')).toBe('記事を作成')
    expect(document.documentElement.lang).toBe('ja')
  })

  it('falls back to English for unsupported locales', () => {
    setLocale('pt-BR')

    expect(currentLocale()).toBe('en')
    expect(translate('articles.create')).toBe('Create Article')
  })
})
