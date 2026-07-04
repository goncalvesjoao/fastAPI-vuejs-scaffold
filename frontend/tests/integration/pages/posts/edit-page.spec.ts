import {
  openApiMocks,
  resetOpenApiMocks,
  postPublicFactory,
  unprocessableContentResponseFactory,
} from '../../../support' // Keep this import at the top of the file to ensure that the mocks are hoisted before any other imports

import { nextTick } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { routes } from '@/router/routes'
import { i18n, setLocale } from '@/i18n'
import EditPage from '@/pages/posts/edit-page.vue'

const { getPostApiPostsIdGet, updatePostApiPostsIdPatch } = openApiMocks

describe('pages/posts/edit-page', () => {
  beforeEach(() => {
    resetOpenApiMocks()
    setLocale('en')
  })

  it('shows a form to edit the requested Post', async () => {
    getPostApiPostsIdGet.mockResolvedValueOnce({
      data: postPublicFactory({ id: 777, title: 'Test Post' }),
    })

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/posts/777/edit')
    await router.isReady()

    const wrapper = mount(EditPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    expect(getPostApiPostsIdGet).toHaveBeenCalledWith(777)
    expect(wrapper.text()).toContain('Test Post')
    expect(wrapper.text()).toContain('Update Post')
  })

  it('shows form errors after submitting invalid data', async () => {
    getPostApiPostsIdGet.mockResolvedValueOnce({
      data: postPublicFactory({ id: 777 }),
    })
    updatePostApiPostsIdPatch.mockRejectedValueOnce(
      unprocessableContentResponseFactory({ content: ['Content is required'] }),
    )

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/posts/777/edit')
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

    expect(updatePostApiPostsIdPatch).toHaveBeenCalledWith(
      777,
      expect.objectContaining({ content: '' }),
    )
    expect(wrapper.text()).toContain('Content is required')
  })

  it('shows the unexpected error after submitting and receiving a 503 response', async () => {
    getPostApiPostsIdGet.mockResolvedValueOnce({
      data: postPublicFactory({ id: 666 }),
    })
    updatePostApiPostsIdPatch.mockRejectedValueOnce({ status: 503 })

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/posts/666/edit')
    await router.isReady()

    const wrapper = mount(EditPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    await wrapper.find('form').trigger('submit.prevent')

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('Failed to update the Post')
    expect(wrapper.text()).not.toContain('Update Post')
  })

  it('shows the unexpected error when a 503 request fails', async () => {
    getPostApiPostsIdGet.mockRejectedValueOnce({ status: 503 })

    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/posts/666/edit')
    await router.isReady()

    const wrapper = mount(EditPage, {
      global: { plugins: [createPinia(), router, i18n] },
    })

    await flushPromises()
    await nextTick()

    expect(getPostApiPostsIdGet).toHaveBeenCalledWith(666)
    expect(wrapper.text()).toContain('Failed to get Post with ID #666')
    expect(wrapper.text()).not.toContain('Update Post')
  })
})
