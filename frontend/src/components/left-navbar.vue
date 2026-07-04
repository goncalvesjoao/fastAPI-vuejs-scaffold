<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { usePostsStore } from '@/stores'
import { useAuth, useErrorReporter } from '@/composables'
import { Post } from '@/entities'
import { groupByDate } from '@/lib'

type SidebarPostItem = NavigationMenuItem & {
  slot: 'post'
  post: Post
  label: string
}

const postsStore = usePostsStore()
const errorReporter = useErrorReporter()
const { records } = storeToRefs(postsStore)
const { locale, t } = useI18n()

let auth: ReturnType<typeof useAuth> | null = null
try {
  auth = useAuth()
} catch {}

const isSignedIn = computed(() => auth?.isSignedIn.value ?? false)
const sidebarOpen = ref(true)

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
    postsStore.clear()
  }
})

function loadRecords() {
  if (loading.value) return

  loading.value = true

  postsStore
    .loadAll()
    .then()
    .catch((error: unknown) => {
      loadError.value = new Error(t('posts.errors.loadAll'), { cause: error })

      errorReporter.capture(loadError.value)
    })
}

const sidebarItems = computed(() => {
  const groupsRecords = groupByDate(records.value, (record) => record.createdAt, locale.value)
  const items: Array<NavigationMenuItem | SidebarPostItem> = []

  groupsRecords.forEach((groupCollection) => {
    items.push({
      label: t(`navigation.dateGroups.${groupCollection.key}`, groupCollection.key),
      type: 'label' as const,
    })

    groupCollection.collection.forEach((post) => {
      const accessibleLabel = [post.title, post.busyLabel].filter(Boolean).join(' - ')

      items.push({
        post: post,
        label: post.title,
        to: `/posts/${post.id}/edit`,
        'aria-label': accessibleLabel,
        slot: 'post' as const,
        tooltip: { text: accessibleLabel },
        icon: post.stateIcon,
        ui: { linkLeadingIcon: `shrink-0 ${post.stateCssClass}` },
      })
    })
  })

  return items
})

const postToRename = ref<Post | null>(null)
const renameModalOpen = computed({
  get: () => postToRename.value !== null,
  set: (isOpen: boolean) => {
    if (!isOpen) postToRename.value = null
  },
})

const postToDelete = ref<Post | null>(null)
const deleteDialogOpen = computed({
  get: () => postToDelete.value !== null,
  set: (isOpen: boolean) => {
    if (!isOpen) postToDelete.value = null
  },
})

function getPostActions(post: Post): DropdownMenuItem[][] {
  return [
    [
      {
        label: t('posts.rename'),
        icon: 'i-lucide-pencil',
        onSelect: () => (postToRename.value = post),
      },
    ],
    [
      {
        label: t('common.delete'),
        icon: 'i-lucide-trash',
        color: 'error' as const,
        onSelect: () => (postToDelete.value = post),
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
            label: t('navigation.newPost'),
            'aria-label': t('navigation.newPost'),
            icon: 'i-lucide-circle-plus',
            tooltip: { text: t('navigation.newPost') },
            ui: { linkLeadingIcon: 'size-5 shrink-0' },
            to: '/posts/new',
          },
        ]"
        :collapsed="collapsed"
        orientation="vertical"
      />

      <UnexpectedError v-if="loadError" description="" :error="loadError" />

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
        <template #post-trailing="{ item }">
          <UDropdownMenu :items="getPostActions(item.post)" :content="{ align: 'end' }">
            <UButton
              as="div"
              icon="i-lucide-ellipsis"
              color="neutral"
              variant="link"
              size="sm"
              class="rounded-[5px] hover:bg-accented/50 focus-visible:bg-accented/50 data-[state=open]:bg-accented/50"
              :aria-label="t('navigation.postActions')"
              tabindex="-1"
              @click.stop.prevent
            />
          </UDropdownMenu>
        </template>
      </UNavigationMenu>
    </template>

    <template #footer="{ collapsed }">
      <AuthActions :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>

  <PostDeleteDialog
    v-if="postToDelete"
    v-model:open="deleteDialogOpen"
    :post="postToDelete"
    @done="$router.push({ name: 'new-post' })"
  />

  <PostRenameModal v-if="postToRename" v-model:open="renameModalOpen" :post="postToRename" />
</template>
