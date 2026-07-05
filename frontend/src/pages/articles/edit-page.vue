<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useArticlesStore } from '@/stores'
import { ArticleNatureEnum, type Article } from '@/entities'
import { type FormErrorApi, useFormErrors, useEnums } from '@/composables'

const toast = useToast()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const articlesStore = useArticlesStore()
const { enumToSelectOptions } = useEnums()

const articleId = computed(() => Number(route.params.id))
const article = ref<Article | undefined>(articlesStore.getById(articleId.value))

const loading = ref(true)
const loadError = ref<Error | undefined>(undefined)

const updating = ref(false)
const updateError = ref<Error | undefined>(undefined)
const updateFormRef = ref<FormErrorApi>()
const { clearFormErrors, setFormErrors } = useFormErrors(updateFormRef)
const updateState = ref({
  content: '',
  nature: ArticleNatureEnum.Standard,
})

const deleteDialogOpen = ref(false)
const renameModalOpen = ref(false)

const isBusy = computed(() => loading.value || updating.value || article.value?.isBusy)
const cannotUpdate = computed(() => isBusy.value || updateError.value !== undefined)

async function handleSubmit() {
  if (!article.value) return

  updating.value = true
  updateError.value = undefined
  clearFormErrors()

  articlesStore
    .updateById(article.value.id, updateState.value)
    .then((result) => {
      if (result.ok) {
        toast.add({
          title: t('articles.notifications.updated'),
          icon: 'i-lucide-save-check',
          color: 'success',
        })
      } else {
        setFormErrors(result.fieldErrors)

        toast.add({
          title: t('articles.errors.updateForm'),
          description: t('articles.notifications.checkForm'),
          icon: 'i-lucide-save-off',
          color: 'error',
        })
      }
    })
    .catch((error: unknown) => {
      updateError.value = new Error(t('articles.errors.update'), {
        cause: error,
      })
    })
    .finally(() => (updating.value = false))
}

const dropdownItems = computed(() => [
  {
    label: t('articles.rename'),
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

  router.push({ name: 'new-article' })
}

watch(
  articleId,
  async (id) => {
    loading.value = true

    articlesStore
      .loadById(id)
      .then((data) => (article.value = data))
      .catch((error: unknown) => {
        loadError.value = new Error(t('articles.errors.load', { id: articleId.value }), {
          cause: error,
        })
      })
      .finally(() => (loading.value = false))
  },
  { immediate: true },
)

watch(
  article,
  (newArticle) => {
    if (!newArticle) return

    updateState.value = {
      content: newArticle.content ?? '',
      nature: newArticle.nature,
    }
  },
  { immediate: true },
)
</script>

<template>
  <UDashboardPanel class="sm:px-5" :ui="{ body: 'sm:p-0' }">
    <template #header>
      <TopNavbar>
        <div v-if="article" class="flex items-center gap-2 min-w-0">
          <UDropdownMenu :items="dropdownItems" :content="{ align: 'start' }">
            <UButton
              color="neutral"
              variant="ghost"
              :label="article.title"
              trailing-icon="i-lucide-chevron-down"
              class="min-w-0 text-md max-w-70 data-[state=open]:bg-elevated"
              :ui="{
                trailingIcon:
                  'text-dimmed shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200',
              }"
            />
          </UDropdownMenu>
        </div>

        <h1 v-else>{{ t('articles.withId', { id: articleId }) }}</h1>

        <template v-if="article" #extra-buttons>
          <UIcon
            :name="article.busyIcon"
            :class="`lg:hidden size-5 mr-2 ${article.busyCssClass}`"
          />

          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-circle-plus"
            class="lg:hidden"
            :aria-label="t('navigation.newArticle')"
            :to="{ name: 'new-article' }"
          />
        </template>
      </TopNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 items-start h-full w-1/2 mx-auto py-6">
        <UnexpectedError v-if="loadError" :error="loadError" class="mx-auto" />

        <UForm
          v-else-if="article"
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
              <USelect
                v-model="updateState.nature"
                :items="enumToSelectOptions(ArticleNatureEnum)"
                class="w-full"
              />
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
              {{ t('articles.update') }}
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
          <template #title>{{ t('articles.notFound') }}</template>
          <template #description>{{ t('articles.notFoundDescription') }}</template>
        </UAlert>
      </div>
    </template>
  </UDashboardPanel>

  <ArticleDeleteDialog
    v-if="article"
    v-model:open="deleteDialogOpen"
    :article="article"
    @done="handleDeleted"
  />

  <ArticleRenameModal
    v-if="article"
    v-model:open="renameModalOpen"
    :article="article"
    @done="handleRenamed"
  />
</template>
