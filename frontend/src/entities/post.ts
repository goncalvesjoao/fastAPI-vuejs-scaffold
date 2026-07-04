import {
  PostNatureEnum,
  type PostPublic,
  type CreatePostInputDto,
  type UpdatePostInputDto,
} from '@/lib/openapi/Api'
import { translate } from '@/i18n'

export type CreatePostInputDtoType = CreatePostInputDto
export type UpdatePostInputDtoType = UpdatePostInputDto

export { PostNatureEnum }

export enum PostStateEnum {
  Idle = 'idle',
  Loading = 'loading',
  Updating = 'updating',
  Deleting = 'deleting',
}

const STATE_LABEL_KEYS: Record<PostStateEnum, string> = {
  [PostStateEnum.Idle]: 'posts.states.idle',
  [PostStateEnum.Loading]: 'posts.states.loading',
  [PostStateEnum.Updating]: 'posts.states.updating',
  [PostStateEnum.Deleting]: 'posts.states.deleting',
}

const STATE_ICONS: Record<PostStateEnum, string> = {
  [PostStateEnum.Idle]: 'i-lucide-sticky-note',
  [PostStateEnum.Loading]: 'i-lucide-loader-circle',
  [PostStateEnum.Updating]: 'i-lucide-save',
  [PostStateEnum.Deleting]: 'i-lucide-trash',
}

const STATE_CSS_CLASSES: Record<PostStateEnum, string> = {
  [PostStateEnum.Idle]: 'text-dimmed',
  [PostStateEnum.Loading]: 'text-info motion-safe:animate-spin',
  [PostStateEnum.Updating]: 'text-success motion-safe:animate-saving',
  [PostStateEnum.Deleting]: 'text-error motion-safe:animate-deleting',
}

export class Post {
  id: number
  title: string
  content: string
  nature: PostNatureEnum
  createdAt: Date
  updatedAt: Date

  isLoading: boolean = false
  isUpdating: boolean = false
  isDeleting: boolean = false

  constructor(post: PostPublic) {
    this.id = post.id
    this.title = post.title
    this.nature = post.nature
    this.content = post.content
    this.createdAt = new Date(post.created_at)
    this.updatedAt = new Date(post.updated_at)
  }

  get isBusy(): boolean {
    return this.isLoading || this.isUpdating || this.isDeleting
  }

  get state(): PostStateEnum {
    if (this.isDeleting) {
      return PostStateEnum.Deleting
    } else if (this.isUpdating) {
      return PostStateEnum.Updating
    } else if (this.isLoading) {
      return PostStateEnum.Loading
    } else {
      return PostStateEnum.Idle
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
