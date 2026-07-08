import {
  openApiMocks,
  resetOpenApiMocks,
  articlePublicFactory,
  unprocessableContentResponseFactory,
} from '../../../support' // Keep this import at the top of the file to ensure that the mocks are hoisted before any other imports

import { nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/router/routes'
import { i18n, setLocale } from '@/i18n'
import EditPage from '@/pages/articles/edit-page.vue'

const { getArticleApiArticlesIdGet, updateArticleApiArticlesIdPatch } = openApiMocks

describe('pages/articles/edit-page', () => {
  beforeEach(() => {
    resetOpenApiMocks()
    setLocale('en')
  })

  it('shows a form to edit the requested Article', async () => {
    getArticleApiArticlesIdGet.mockResolvedValueOnce({
      data: articlePublicFactory({ id: 777, title: 'Test Article' }),
    })

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/articles/777/edit')
    await router.isReady()

    const wrapper = mount(EditPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    expect(getArticleApiArticlesIdGet).toHaveBeenCalledWith(777)
    expect(wrapper.text()).toContain('Test Article')
    expect(wrapper.text()).toContain('Update Article')
  })

  it('shows form errors after submitting invalid data', async () => {
    getArticleApiArticlesIdGet.mockResolvedValueOnce({
      data: articlePublicFactory({ id: 777 }),
    })
    updateArticleApiArticlesIdPatch.mockRejectedValueOnce(
      unprocessableContentResponseFactory([
        {
          type: 'string_too_short',
          loc: ['body', 'content'],
          msg: '[backend] content is too short',
          input: '',
          ctx: { min_length: 3 },
        },
      ]),
    )

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/articles/777/edit')
    await router.isReady()

    const wrapper = mount(EditPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    await wrapper.find('textarea').setValue('')
    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()
    await nextTick()

    expect(updateArticleApiArticlesIdPatch).toHaveBeenCalledWith(
      777,
      expect.objectContaining({ content: '' }),
    )
    expect(wrapper.text()).toContain('Please enter at least 3 character(s)')
  })

  it('shows the unexpected error after submitting and receiving a 503 response', async () => {
    getArticleApiArticlesIdGet.mockResolvedValueOnce({
      data: articlePublicFactory({ id: 666 }),
    })
    updateArticleApiArticlesIdPatch.mockRejectedValueOnce({ status: 503 })

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/articles/666/edit')
    await router.isReady()

    const wrapper = mount(EditPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Failed to update the Article')
    expect(wrapper.text()).not.toContain('Update Article')
  })

  it('shows the unexpected error when a 503 request fails', async () => {
    getArticleApiArticlesIdGet.mockRejectedValueOnce({ status: 503 })

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/articles/666/edit')
    await router.isReady()

    const wrapper = mount(EditPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    expect(getArticleApiArticlesIdGet).toHaveBeenCalledWith(666)
    expect(wrapper.text()).toContain('Failed to get Article with ID #666')
    expect(wrapper.text()).not.toContain('Update Article')
  })
})
