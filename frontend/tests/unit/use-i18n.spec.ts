import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import { useI18n } from '@/composables'
import { i18n, setLocale } from '@/i18n'

function createTranslator(filePath?: string): ReturnType<typeof useI18n>['t'] {
  const wrapper = mount(
    defineComponent({
      setup() {
        return { t: useI18n(filePath).t }
      },
      render() {
        return h('div')
      },
    }),
    {
      global: {
        plugins: [i18n],
      },
    },
  )

  const translate = (wrapper.vm as { t: ReturnType<typeof useI18n>['t'] }).t

  wrapper.unmount()

  return translate
}

describe('useI18n', () => {
  beforeEach(() => {
    setLocale('en')
  })

  it('prefixes relative keys with the caller root path', () => {
    const t = createTranslator('/src/pages/articles/new-page.vue')

    expect(t('.submitLabel')).toBe('Create Article')
  })

  it('keeps absolute keys unchanged', () => {
    const t = createTranslator('/src/pages/articles/new-page.vue')

    expect(t('common.formWithErrorsDescription')).toBe('Please check the form for errors')
  })
})
