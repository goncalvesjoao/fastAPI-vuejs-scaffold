<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePostsStore } from '@/stores'
import { PostNatureEnum, type Post } from '@/entities'
import type { SelectItem } from '@nuxt/ui'
import { type FormErrorApi, useApiFormErrors } from '@/composables'

const toast = useToast()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const postId = computed(() => Number(route.params.id))
const post = ref<Post | undefined>(postsStore.getById(postId.value))

const loading = ref(true)
const loadError = ref<Error | undefined>(undefined)

const updating = ref(false)
const updateError = ref<Error | undefined>(undefined)
const updateFormRef = ref<FormErrorApi>()
const { clearFormErrors, setFormErrors } = useApiFormErrors(updateFormRef)
const updateState = ref({
  content: '',
  nature: PostNatureEnum.Standard,
})

const deleteDialogOpen = ref(false)
const renameModalOpen = ref(false)

const isBusy = computed(() => loading.value || updating.value || post.value?.isBusy)
const cannotUpdate = computed(() => isBusy.value || updateError.value !== undefined)

async function handleSubmit() {
  if (!post.value) return

  updating.value = true
  updateError.value = undefined
  clearFormErrors()

  postsStore
    .updateById(post.value.id, updateState.value)
    .then((result) => {
      if (result.ok) {
        toast.add({
          title: t('posts.notifications.updated'),
          icon: 'i-lucide-save-check',
          color: 'success',
        })
      } else {
        setFormErrors(result.fieldErrors)

        toast.add({
          title: t('posts.errors.updateForm'),
          description: t('posts.notifications.checkForm'),
          icon: 'i-lucide-save-off',
          color: 'error',
        })
      }
    })
    .catch((error: unknown) => {
      updateError.value = new Error(t('posts.errors.update'), {
        cause: error,
      })
    })
    .finally(() => (updating.value = false))
}

const natureItems = computed<SelectItem[]>(() => [
  { label: t('posts.natures.standard'), value: PostNatureEnum.Standard },
  { label: t('posts.natures.journal'), value: PostNatureEnum.Journal },
  { label: t('posts.natures.scientific'), value: PostNatureEnum.Scientific },
])

const dropdownItems = computed(() => [
  {
    label: t('posts.rename'),
    icon: 'i-lucide-pencil',
    disabled: isBusy.value,
    onSelect() {
      renameModalOpen.value = true
    },
  },
  {
    label: t('common.delete'),
    icon: 'i-lucide-trash-2',
    color: 'error' as const,
    disabled: isBusy.value,
    onSelect() {
      deleteDialogOpen.value = true
    },
  },
])

function handleRenamed() {
  renameModalOpen.value = false
}

function handleDeleted() {
  deleteDialogOpen.value = false

  router.push({ name: 'new-post' })
}

watch(
  postId,
  async (id) => {
    loading.value = true

    postsStore
      .loadById(id)
      .then((data) => (post.value = data))
      .catch((error: unknown) => {
        loadError.value = new Error(t('posts.errors.load', { id: postId.value }), {
          cause: error,
        })
      })
      .finally(() => (loading.value = false))
  },
  { immediate: true },
)

watch(
  post,
  (newPost) => {
    if (!newPost) return

    updateState.value = {
      content: newPost.content ?? '',
      nature: newPost.nature,
    }
  },
  { immediate: true },
)
</script>

<template>
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar>
        <div v-if="post" class="flex items-center gap-2 min-w-0">
          <UDropdownMenu :items="dropdownItems" :content="{ align: 'start' }">
            <UButton
              color="neutral"
              variant="ghost"
              :label="post.title"
              trailing-icon="i-lucide-chevron-down"
              class="min-w-0 text-md max-w-70 data-[state=open]:bg-elevated"
              :ui="{
                trailingIcon:
                  'text-dimmed shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200',
              }"
            />
          </UDropdownMenu>
        </div>

        <h1 v-else>{{ t('posts.withId', { id: postId }) }}</h1>

        <template v-if="post" #extra-buttons>
          <UIcon :name="post.busyIcon" :class="`lg:hidden size-5 mr-2 ${post.busyCssClass}`" />

          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-circle-plus"
            class="lg:hidden"
            :aria-label="t('navigation.newPost')"
            :to="{ name: 'new-post' }"
          />
        </template>
      </TopNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 items-start h-full w-1/2 mx-auto py-6">
        <UnexpectedError v-if="loadError" :error="loadError" class="mx-auto" />

        <UForm
          v-else-if="post"
          ref="updateFormRef"
          class="w-full space-y-4"
          :state="updateState"
          :disabled="cannotUpdate"
          @submit="handleSubmit"
        >
          <UnexpectedError v-if="updateError" :error="updateError" class="mx-auto" />

          <template v-else>
            <UFormField :label="t('common.content')" name="content">
              <UTextarea v-model="updateState.content" class="w-full" />
            </UFormField>

            <UFormField :label="t('common.nature')" name="nature">
              <USelect v-model="updateState.nature" :items="natureItems" class="w-full" />
            </UFormField>

            <UButton
              block
              class="justify-center w-full mt-4"
              color="primary"
              size="xl"
              icon="i-lucide-save"
              type="submit"
              :disabled="cannotUpdate"
              :loading="updating"
            >
              {{ t('posts.update') }}
            </UButton>
          </template>
        </UForm>

        <UAlert
          v-else
          icon="i-lucide-circle-alert"
          color="warning"
          variant="subtle"
          :ui="{
            icon: 'size-11',
          }"
        >
          <template #title>{{ t('posts.notFound') }}</template>
          <template #description>{{ t('posts.notFoundDescription') }}</template>
        </UAlert>
      </div>
    </template>
  </UDashboardPanel>

  <PostDeleteDialog
    v-if="post"
    v-model:open="deleteDialogOpen"
    :post="post"
    @done="handleDeleted"
  />

  <PostRenameModal v-if="post" v-model:open="renameModalOpen" :post="post" @done="handleRenamed" />
</template>
