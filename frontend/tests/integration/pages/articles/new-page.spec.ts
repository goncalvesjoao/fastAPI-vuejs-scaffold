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

function validationResponse(
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

describe('pages/articles/new-page', () => {
  beforeEach(() => {
    resetOpenApiMocks()
    setLocale('en')
  })

  it('shows form errors after submitting invalid data', async () => {
    createArticleApiArticlesPost.mockRejectedValueOnce(
      unprocessableContentResponseFactory({ title: ['Title is required'] }),
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

    expect(createArticleApiArticlesPost).toHaveBeenCalledWith(
      expect.objectContaining({ title: '' }),
    )
    expect(wrapper.text()).toContain('Title is required')
  })

  it('reactively translates visible backend errors when the locale changes', async () => {
    createArticleApiArticlesPost.mockRejectedValueOnce(
      validationResponse([
        {
          type: 'string_too_short',
          loc: ['body', 'title'],
          msg: 'Backend fallback',
          input: '',
          ctx: { min_length: 3 },
        },
      ]),
    )

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/articles/new')
    await router.isReady()

    const wrapper = mount(NewPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Please enter at least 3 character(s)')

    setLocale('ja')
    await nextTick()

    expect(wrapper.text()).toContain('3文字以上で入力してください')
    expect(wrapper.text()).not.toContain('Please enter at least 3 character(s)')
  })

  it('uses the backend message when the frontend has no translation', async () => {
    createArticleApiArticlesPost.mockRejectedValueOnce(
      validationResponse([
        {
          type: 'custom_backend_rule',
          loc: ['body', 'title'],
          msg: 'Message supplied by the backend',
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

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    setLocale('ja')
    await nextTick()

    expect(wrapper.text()).toContain('Message supplied by the backend')
  })

  it('groups multiple translated errors for the same field', async () => {
    createArticleApiArticlesPost.mockRejectedValueOnce(
      validationResponse([
        {
          type: 'missing',
          loc: ['body', 'title'],
          msg: 'Fallback one',
          input: '',
          ctx: {},
        },
        {
          type: 'string_too_short',
          loc: ['body', 'title'],
          msg: 'Fallback two',
          input: '',
          ctx: { min_length: 3 },
        },
      ]),
    )

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/articles/new')
    await router.isReady()

    const wrapper = mount(NewPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain(
      'This field is mandatory, Please enter at least 3 character(s)',
    )
  })
})
