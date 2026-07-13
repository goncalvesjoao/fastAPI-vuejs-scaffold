import { articlePublicFactory, openApiMocks, resetOpenApiMocks } from '../../../support'

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
import ArticleDeleteDialog from '@/components/articles/article-delete-dialog.vue'

const { deleteArticleApiArticlesIdDelete } = openApiMocks

async function mountDialog(article = new Article(articlePublicFactory())) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(`/articles/${article.id}/edit`)
  await router.isReady()

  const Host = defineComponent({
    setup() {
      const open = ref(true)

      return () =>
        h(ArticleDeleteDialog, {
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

function clickButton(text: string) {
  const button = Array.from(document.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === text,
  )
  if (!button) throw new Error(`Button not found: ${text}`)
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

describe('ArticleDeleteDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetOpenApiMocks()
    setLocale('en')
  })

  it('shows a warning when the article no longer exists', async () => {
    deleteArticleApiArticlesIdDelete.mockRejectedValueOnce({
      status: 404,
      error: { detail: 'Not Found' },
    })

    const { article } = await mountDialog()

    clickButton('Delete')

    await flushPromises()
    await nextTick()

    expect(deleteArticleApiArticlesIdDelete).toHaveBeenCalledWith(article.id)
    expect(document.body.textContent).toContain('Warning: Article not found')
    expect(document.body.textContent).toContain('It was probably already deleted')
  })

  it('shows an error when the server fails', async () => {
    deleteArticleApiArticlesIdDelete.mockRejectedValueOnce({ status: 503 })

    await mountDialog()

    clickButton('Delete')

    await flushPromises()
    await nextTick()

    expect(document.body.textContent).toContain('Failed to delete the Article')
    expect(document.body.textContent).toContain('Something went wrong while processing the request.')
  })
})
