import { beforeEach, describe, expect, it } from 'vitest'

import { currentLocale, setLocale, translate } from '@/i18n'

describe('i18n', () => {
  beforeEach(() => {
    setLocale('en')
  })

  it('translates application messages into Japanese', () => {
    setLocale('ja-JP')

    expect(currentLocale()).toBe('ja')
    expect(translate('pages.articles.new-page.submitLabel')).toBe('作成')
    expect(translate('errors.unexpectedError')).toBe('予期しないエラー')
    expect(translate('errors.unknownError')).toBe('不明なエラー')
    expect(document.documentElement.lang).toBe('ja')
  })

  it('falls back to English for unsupported locales', () => {
    setLocale('pt-BR')

    expect(currentLocale()).toBe('en')
    expect(translate('pages.articles.new-page.submitLabel')).toBe('Create Article')
  })
})
