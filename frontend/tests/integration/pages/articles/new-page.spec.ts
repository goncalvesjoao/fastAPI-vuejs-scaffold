import {
  openApiMocks,
  resetOpenApiMocks,
  unprocessableContentResponseFactory,
} from '../../../support' // Keep this import at the top of the file to ensure that the mocks are hoisted before any other imports

import { nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/router/routes'
import { i18n, setLocale } from '@/i18n'
import NewPage from '@/pages/articles/new-page.vue'

const { createArticleApiArticlesPost } = openApiMocks

describe('pages/articles/new-page', () => {
  beforeEach(() => {
    resetOpenApiMocks()
    setLocale('en')
  })

  it('shows form errors after submitting invalid data', async () => {
    createArticleApiArticlesPost.mockRejectedValueOnce(
      unprocessableContentResponseFactory([
        {
          type: 'string_too_short',
          loc: ['body', 'title'],
          msg: '[backend] title is too short',
          input: '',
          ctx: { min_length: 3 },
        },
        {
          type: 'custom_backend_rule',
          loc: ['body', 'title'],
          msg: '[backend] title is invalid',
          input: '',
          ctx: {},
        },
        {
          type: 'missing',
          loc: ['body', 'nature'],
          msg: '[backend] nature is required',
          input: '',
          ctx: {},
        },
      ]),
    )

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/articles/new')
    await router.isReady()

    const wrapper = mount(NewPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    await wrapper.find('input[name="title"]').setValue('')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('This field is mandatory')
    expect(wrapper.text()).toContain(
      'Please enter at least 3 character(s), [backend] title is invalid',
    )
  })

  it('shows the unexpected error after submitting and receiving a 503 response', async () => {
    setLocale('ja')
    createArticleApiArticlesPost.mockRejectedValueOnce({ status: 503 })

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/articles/new')
    await router.isReady()

    const wrapper = mount(NewPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('記事の作成に失敗しました')
    expect(wrapper.text()).toContain('予期しないエラー')
  })
})
