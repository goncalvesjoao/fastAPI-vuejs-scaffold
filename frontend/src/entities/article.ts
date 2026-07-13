import {
  ArticleNatureEnum,
  type ArticlePublic,
  type CreateArticleInputDto,
  type UpdateArticleInputDto,
} from '@/lib/openapi/Api'
import { translate } from '@/i18n'

export type CreateArticleInputDtoType = CreateArticleInputDto
export type UpdateArticleInputDtoType = UpdateArticleInputDto

export { ArticleNatureEnum }

export enum ArticleStateEnum {
  Idle = 'idle',
  Loading = 'loading',
  Updating = 'updating',
  Deleting = 'deleting',
}

const STATE_LABEL_KEYS: Record<ArticleStateEnum, string> = {
  [ArticleStateEnum.Idle]: 'entities.article-state-enum.idle',
  [ArticleStateEnum.Loading]: 'entities.article-state-enum.loading',
  [ArticleStateEnum.Updating]: 'entities.article-state-enum.updating',
  [ArticleStateEnum.Deleting]: 'entities.article-state-enum.deleting',
}

const STATE_ICONS: Record<ArticleStateEnum, string> = {
  [ArticleStateEnum.Idle]: 'i-lucide-sticky-note',
  [ArticleStateEnum.Loading]: 'i-lucide-loader-circle',
  [ArticleStateEnum.Updating]: 'i-lucide-save',
  [ArticleStateEnum.Deleting]: 'i-lucide-trash',
}

const STATE_CSS_CLASSES: Record<ArticleStateEnum, string> = {
  [ArticleStateEnum.Idle]: 'text-dimmed',
  [ArticleStateEnum.Loading]: 'text-info motion-safe:animate-spin',
  [ArticleStateEnum.Updating]: 'text-success motion-safe:animate-saving',
  [ArticleStateEnum.Deleting]: 'text-error motion-safe:animate-deleting',
}

export class Article {
  id: number
  title: string
  content: string
  nature: ArticleNatureEnum
  createdAt: Date
  updatedAt: Date

  isLoading: boolean = false
  isUpdating: boolean = false
  isDeleting: boolean = false

  constructor(article: ArticlePublic) {
    this.id = article.id
    this.title = article.title
    this.nature = article.nature
    this.content = article.content
    this.createdAt = new Date(article.created_at)
    this.updatedAt = new Date(article.updated_at)
  }

  get isBusy(): boolean {
    return this.isLoading || this.isUpdating || this.isDeleting
  }

  get state(): ArticleStateEnum {
    if (this.isDeleting) {
      return ArticleStateEnum.Deleting
    } else if (this.isUpdating) {
      return ArticleStateEnum.Updating
    } else if (this.isLoading) {
      return ArticleStateEnum.Loading
    } else {
      return ArticleStateEnum.Idle
    }
  }

  get busyLabel(): string {
    return this.isBusy ? translate(STATE_LABEL_KEYS[this.state]) : ''
  }

  get stateLabel(): string {
    return translate(STATE_LABEL_KEYS[this.state])
  }

  get busyIcon(): string {
    return this.isBusy ? STATE_ICONS[this.state] : ''
  }

  get stateIcon(): string {
    return STATE_ICONS[this.state]
  }

  get busyCssClass(): string {
    return this.isBusy ? STATE_CSS_CLASSES[this.state] : ''
  }

  get stateCssClass(): string {
    return STATE_CSS_CLASSES[this.state]
  }
}
