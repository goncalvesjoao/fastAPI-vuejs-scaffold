<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'
import { storeToRefs } from 'pinia'
import { useArticlesStore } from '@/stores'
import { clerkEnabled, useAuth, useErrorReporter, useI18n } from '@/composables'
import { Article } from '@/entities'
import { groupByDate } from '@/lib'
import { UserButton } from '@clerk/vue'

type SidebarArticleItem = NavigationMenuItem & {
  slot: 'article'
  article: Article
  label: string
}

const articlesStore = useArticlesStore()
const errorReporter = useErrorReporter()
const { records } = storeToRefs(articlesStore)
const { locale, t } = useI18n(import.meta.url)

let auth: ReturnType<typeof useAuth> | null = null
try {
  auth = useAuth()
} catch {}

const sidebarOpen = ref(true)
const isSignedIn = computed(() => auth?.isSignedIn.value ?? false)
const authLoaded = computed(() => auth?.isLoaded.value ?? true)
const userName = computed(() => auth?.userName.value ?? '')

const loading = ref(false)
const loadError = ref<Error | undefined>(undefined)

onMounted(async () => {
  if (isSignedIn.value) {
    loadRecords()
  }
})

watch(isSignedIn, async (signedIn) => {
  if (signedIn) {
    loadRecords()
  } else {
    articlesStore.clear()
  }
})

function loadRecords() {
  if (loading.value) return

  loading.value = true

  articlesStore
    .loadAll()
    .then()
    .catch((error: unknown) => {
      loadError.value = new Error(t('.loadAllFailureMessage'), {
        cause: error,
      })

      errorReporter.capture(loadError.value)
    })
}

const sidebarItems = computed(() => {
  const groupsRecords = groupByDate(records.value, (record) => record.createdAt, locale.value)
  const items: Array<NavigationMenuItem | SidebarArticleItem> = []

  groupsRecords.forEach((groupCollection) => {
    items.push({
      label: t(`.dateGroups.${groupCollection.key}`, groupCollection.key),
      type: 'label' as const,
    })

    groupCollection.collection.forEach((article) => {
      const accessibleLabel = [article.title, article.busyLabel].filter(Boolean).join(' - ')

      items.push({
        article: article,
        label: article.title,
        to: `/articles/${article.id}/edit`,
        'aria-label': accessibleLabel,
        slot: 'article' as const,
        tooltip: { text: accessibleLabel },
        icon: article.stateIcon,
        ui: { linkLeadingIcon: `shrink-0 ${article.stateCssClass}` },
      })
    })
  })

  return items
})

const articleToRename = ref<Article | null>(null)
const renameModalOpen = computed({
  get: () => articleToRename.value !== null,
  set: (isOpen: boolean) => {
    if (!isOpen) articleToRename.value = null
  },
})

const articleToDelete = ref<Article | null>(null)
const deleteDialogOpen = computed({
  get: () => articleToDelete.value !== null,
  set: (isOpen: boolean) => {
    if (!isOpen) articleToDelete.value = null
  },
})

function getArticleActions(article: Article): DropdownMenuItem[][] {
  return [
    [
      {
        label: t('common.rename'),
        icon: 'i-lucide-pencil',
        onSelect: () => (articleToRename.value = article),
      },
    ],
    [
      {
        label: t('common.delete'),
        icon: 'i-lucide-trash',
        color: 'error' as const,
        onSelect: () => (articleToDelete.value = article),
      },
    ],
  ]
}
</script>

<template>
  <UDashboardSidebar
    id="main-sidebar"
    v-model:open="sidebarOpen"
    :min-size="12"
    collapsible
    resizable
    :menu="{ inset: true }"
    class="border-r-0 py-4 dark:[--ui-bg-elevated:var(--ui-color-neutral-900)]"
  >
    <template #header="{ collapsed }">
      <RouterLink v-if="!collapsed" to="/" class="flex items-end align-middle gap-2">
        <UIcon name="i-lucide-rss" class="size-8 text-primary shrink-0" />
        <span class="text-xl font-bold">Poster</span>
      </RouterLink>

      <UDashboardSidebarCollapse class="ms-auto" />
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :items="[
          {
            label: t('common.newArticle'),
            'aria-label': t('common.newArticle'),
            icon: 'i-lucide-circle-plus',
            tooltip: { text: t('common.newArticle') },
            ui: { linkLeadingIcon: 'size-5 shrink-0' },
            to: '/articles/new',
          },
        ]"
        :collapsed="collapsed"
        orientation="vertical"
      />

      <ErrorAlert v-if="loadError" description="" :error="loadError" />

      <UNavigationMenu
        v-else-if="isSignedIn"
        :items="sidebarItems"
        :collapsed="collapsed"
        orientation="vertical"
        :ui="{
          link: 'overflow-hidden pr-7.5',
          linkTrailing:
            'translate-x-full group-hover:translate-x-0 group-has-data-[state=open]:translate-x-0 transition-transform ms-0 absolute inset-e-px',
        }"
      >
        <template #article-trailing="{ item }">
          <UDropdownMenu :items="getArticleActions(item.article)" :content="{ align: 'end' }">
            <UButton
              as="div"
              icon="i-lucide-ellipsis"
              color="neutral"
              variant="link"
              size="sm"
              class="rounded-[5px] hover:bg-accented/50 focus-visible:bg-accented/50 data-[state=open]:bg-accented/50"
              :aria-label="t('.articleActions')"
              tabindex="-1"
              @click.stop.prevent
            />
          </UDropdownMenu>
        </template>
      </UNavigationMenu>
    </template>

    <template #footer="{ collapsed }">
      <template v-if="clerkEnabled && authLoaded">
        <template v-if="isSignedIn">
          <div class="flex items-center px-1" :class="collapsed ? 'justify-center' : 'gap-2'">
            <UserButton />
            <span v-if="!collapsed" class="text-sm text-dimmed truncate">
              {{ userName }}
            </span>
          </div>
        </template>
        <template v-else>
          <UButton
            to="/sign-in"
            color="neutral"
            variant="ghost"
            icon="i-lucide-log-in"
            class="w-full px-1.5"
          >
            {{ collapsed ? undefined : t('common.signIn') }}
          </UButton>
        </template>
      </template>

      <div
        v-else-if="clerkEnabled"
        class="flex items-center gap-2"
        :class="collapsed ? 'justify-center' : ''"
      >
        <USkeleton class="size-8 rounded-full shrink-0" />
        <USkeleton v-if="!collapsed" class="h-4 w-24" />
      </div>
    </template>
  </UDashboardSidebar>

  <ArticleDeleteDialog
    v-if="articleToDelete"
    v-model:open="deleteDialogOpen"
    :article="articleToDelete"
    @done="$router.push({ name: 'new-article' })"
  />

  <ArticleRenameModal
    v-if="articleToRename"
    v-model:open="renameModalOpen"
    :article="articleToRename"
  />
</template>
