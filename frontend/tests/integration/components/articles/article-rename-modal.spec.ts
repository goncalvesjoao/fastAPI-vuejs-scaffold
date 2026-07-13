import {
  articlePublicFactory,
  openApiMocks,
  resetOpenApiMocks,
  unprocessableContentResponseFactory,
} from '../../../support'

import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import ui from '@nuxt/ui/vue-plugin'
import UApp from '@nuxt/ui/components/App.vue'
import { Article } from '@/entities'
import { i18n, setLocale } from '@/i18n'
import { routes } from '@/router/routes'
import ArticleRenameModal from '@/components/articles/article-rename-modal.vue'

const { updateArticleApiArticlesIdPatch } = openApiMocks

async function mountModal(article = new Article(articlePublicFactory())) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(`/articles/${article.id}/edit`)
  await router.isReady()

  const Host = defineComponent({
    setup() {
      const open = ref(true)

      return () =>
        h(ArticleRenameModal, {
          article,
          open: open.value,
          'onUpdate:open': (value: boolean) => {
            open.value = value
          },
        })
    },
  })

  mount(UApp, {
    attachTo: document.body,
    props: { toaster: { position: 'top-center', duration: 30000 } },
    slots: { default: h(Host) },
    global: { plugins: [createPinia(), router, i18n, ui] },
  })

  await flushPromises()
  await nextTick()

  return { article }
}

describe('ArticleRenameModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetOpenApiMocks()
    setLocale('en')
  })

  it('shows form errors after submitting an invalid article title', async () => {
    updateArticleApiArticlesIdPatch.mockRejectedValueOnce(
      unprocessableContentResponseFactory([
        {
          type: 'missing',
          loc: ['body', 'title'],
          msg: 'This field is mandatory',
          input: '',
          ctx: {},
        },
      ]),
    )

    const { article } = await mountModal()

    document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))

    await flushPromises()
    await nextTick()

    expect(updateArticleApiArticlesIdPatch).toHaveBeenCalledWith(
      article.id,
      { title: article.title },
    )
    expect(document.body.textContent).toContain('This field is mandatory')
    expect(document.body.textContent).toContain('Failed to rename the Article')
  })

  it('shows an error when the server fails', async () => {
    updateArticleApiArticlesIdPatch.mockRejectedValueOnce({ status: 503 })

    await mountModal()

    document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))

    await flushPromises()
    await nextTick()

    expect(document.body.textContent).toContain('Failed to rename the Article')
    expect(document.body.textContent).toContain('Something went wrong while processing the request.')
  })
})
